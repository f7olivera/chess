import React from "react";
import Chess from "chess.js";
import {useDispatch} from "react-redux";
import {isUCI, parseHistory} from "../misc/misc.js";
import {setState} from "../redux/gameSlice.js";

export default function useStockfishAnalysis({
                                               chessState: [chess, setChess],
                                               depth,
                                               fakeChess,
                                               setFakeChess,
                                               chessPreview,
                                               setChessPreview
                                             }) {
  const [analysis, setAnalysis] = React.useState({});
  const [bestMove, setBestMove] = React.useState()
  const [score, setScore] = React.useState(0);
  const stockfish = React.useRef(null);
  const dispatch = useDispatch();

  // Sets up stockfish and its little arrow
  React.useEffect(() => {
    stockfish.current = new Worker('/static/assets/stockfish11/stockfish.js');
    stockfish.current.postMessage('ucinewgame')
    stockfish.current.postMessage('set hash to 32 MB')
    stockfish.current.postMessage(`position fen ${chess.fen()}`);
    stockfish.current.postMessage(`go depth ${depth}`);

    const template = document.createElement('template');
    template.innerHTML = '<svg class="arrow" viewBox="-4 -4 8 8" preserveAspectRatio=""><defs><marker id="arrowhead-pb" orient="auto" markerWidth="4" markerHeight="8" refX="2.05" refY="2.01" cgkey="pb"><path d="M0,0 V4 L3,2 Z" fill="#003088"></path></marker><marker id="arrowhead-g" orient="auto" markerWidth="4" markerHeight="8" refX="2.05" refY="2.01" cgkey="g"><path d="M0,0 V4 L3,2 Z" fill="#15781B"></path></marker></defs><g><line stroke="#003088" stroke-width="0.234375" stroke-linecap="round" marker-end="url(#arrowhead-pb)" opacity="0.4" x1="0" y1="0" x2="-1" y2="-1" cghash="736,736,e1,d2,paleBlue"></line></g></svg>'
    const arrow = template.content.firstChild;
    document.querySelector('.game').querySelector('.board').appendChild(arrow);

    return () => {
      stockfish.current.postMessage('stop');
      stockfish.current.postMessage('quit');
    };
  }, [])

  // Generates a board preview for Stockfish lines
  React.useEffect(() => {
    const moveOnHover = document.querySelector('.hovered');
    if (moveOnHover) {
      const chessPreviewContainer = document.querySelector('#chess-preview');
      const x = chessPreviewContainer.getBoundingClientRect().x;
      chessPreviewContainer.style.top = `calc(${moveOnHover.offsetTop}px  - 13rem)`;
      chessPreviewContainer.style.left = `calc(${moveOnHover.offsetLeft}px + 1rem)`;
      if (moveOnHover.offsetLeft + 350 + parseInt(getComputedStyle(document.documentElement).fontSize) > window.innerWidth) {
        chessPreviewContainer.style.left = `calc(${moveOnHover.offsetLeft}px - 210px + 1rem)`;
      }
      if (window.innerWidth < 500) {
        chessPreviewContainer.style.left = `calc(${(window.innerWidth - 210) / 2}px)`;
      }
      chessPreviewContainer.style.display = 'block';
    }
  }, [chessPreview]);

  // Updates stockfish arrow
  React.useEffect(() => {
    const arrow = document.querySelector('.arrow');
    const arrowLine = arrow.querySelector('line');

    if (bestMove) {
      const colValue = {
        a: '-3.5',
        b: '-2.5',
        c: '-1.5',
        d: '-0.5',
        e: '0.5',
        f: '1.5',
        g: '2.5',
        h: '3.5',
      }
      const x1 = colValue[bestMove.from[0]];
      const y1 = `${-1 * parseInt(bestMove.from[1]) + 4.5}`;
      const x2 = colValue[bestMove.to[0]];
      const y2 = `${-1 * parseInt(bestMove.to[1]) + 4.5}`;
      // console.log(x1, y1, x2, y2)
      arrowLine.setAttribute('x1', x1);
      arrowLine.setAttribute('y1', y1);
      arrowLine.setAttribute('x2', x2);
      arrowLine.setAttribute('y2', y2);
      arrow.style.display = 'block';
    } else {
      arrow.style.display = 'none';
    }
  }, [bestMove]);

  const handleMessage = (message) => {
    const currentChess = fakeChess || chess;
    const rawData = message.data ? message.data.split(' ') : '';
    const data = message.data ? message.data.split(' ') : '';
    if (data.includes('pv') && Math.abs(depth - parseInt(data[data.findIndex((elem) => elem === 'depth') + 1])) < 8) {
      const newChess = new Chess(currentChess.fen());
      newChess.load_pgn(currentChess.pgn());
      const pv = data.slice(
        data.findIndex((elem, i) => elem === 'pv') + 1,
        data.findIndex((elem, i) =>
          i + 1 < data.length && isUCI(elem) && !isUCI(data[i + 1])
        ) + 1
      );
      pv.map((move) => newChess.move(move, {sloppy: true}));
      setBestMove(newChess.history().length > 0 ? newChess.history({verbose: true})[currentChess.history().length] : bestMove);
      const parsedHistory = parseHistory(newChess);
      const newAnalysis = {
        line:
          parsedHistory.slice(currentChess.history().length / 2).map(
            (elem, i) =>
              <span>
                  {`${elem.turnNumber}.`}
                {elem.moves.map((move, j) => {
                  return (
                    <span className='pv-san'
                          onClick={() => {
                            const newChess = new Chess(move.fen);
                            newChess.load_pgn(move.pgn);
                            setFakeChess(undefined)
                            setChess(newChess);
                          }}
                          onMouseOver={(e) => {
                            e.target.classList.add('hovered');
                            const newChessPreview = new Chess(move.fen);
                            newChessPreview.load_pgn(move.pgn);
                            setChessPreview(newChessPreview);
                          }}
                          onMouseOut={(e) => e.target.classList.remove('hovered')}>
                        {i + j === 0 && (currentChess.history().length % 2 === 1) ?
                          '..' :
                          ` ${move.move} `}
                      </span>
                  )
                })}
                </span>
          ),
        depth: data[data.findIndex((elem) => elem === 'depth') + 1],
        cp: parseFloat(!rawData.includes('mate') && data[data.findIndex((elem) => elem === 'cp') + 1])
      };
      setScore((newAnalysis.cp / 100));
      setAnalysis(newAnalysis);
    }
    if (data.includes('mate') && !currentChess.game_over()) {
      const mate = data[data.findIndex((elem) => elem === 'mate') + 1];
      setScore((21 - Math.min(10, Math.abs(mate))) * 100 * (currentChess.turn() === 'w' ? 1 : -1))
    }
  }

  // Stockfish looks for a continuation when a move is made, the board is rewound or depth is modified
  React.useEffect(() => {
    dispatch(setState({
      playingAs: chess.turn(),
    }));

    const currentChess = fakeChess || chess;
    // const unEnPassantFen = currentChess.fen().split(' ').map((elem, i) => i === 3 ? '-' : elem).join(' ');
    // analyzePosition(unEnPassantFen)
    // stockfish.current.postMessage('ucinewgame')
    stockfish.current.onmessage = handleMessage;
    stockfish.current.postMessage(`position fen ${currentChess.fen()}`);
    stockfish.current.postMessage(`go depth ${depth}`);
    setBestMove(undefined);
  }, [chess, fakeChess, depth]);

  // Winning probability, based on the approximate relationship between the winning probability W and the pawn advantage.
  // https://www.chessprogramming.org/Pawn_Advantage,_Win_Percentage,_and_Elo
  const winningProbability = 2 / (1 + Math.exp(-0.004 * Math.min(Math.max(-1000, score * 100), 1000))) - 1;

  return {analysis, winningProbability};
}
