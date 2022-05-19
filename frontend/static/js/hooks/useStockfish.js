import React from "react";
import Chess from "chess.js";
import {useSelector} from "react-redux";

export default function useStockfish({chessState: [chess, setChess], skillLevel, thinkingTime}) {
  const stockfish = React.useRef(null);
  const state = useSelector((state) => state.game);

  const handleMessage = (message) => {
    const data = message.data ? message.data.split(' ') : '';
    if (data.includes('bestmove')) {
      const newChess = new Chess(chess.fen());
      newChess.load_pgn(chess.pgn());
      newChess.move(data[data.findIndex((elem) => elem === 'bestMove') + 2], { sloppy: true });
      setChess(newChess);
    }
  }

  // Sets up Stockfish
  React.useEffect(() => {
    stockfish.current = new Worker('/static/assets/stockfish11/stockfish.js');
    stockfish.current.postMessage('ucinewgame')
    stockfish.current.postMessage(`setoption name Skill Level value ${skillLevel}`)
    stockfish.current.postMessage(`position fen ${chess.fen()}`);

    return () => {
      stockfish.current.postMessage('stop');
      stockfish.current.postMessage('quit');
    };
  }, [])

  // Stockifhs starts looking for its next move
  React.useEffect(() => {
    if (state.started && chess.turn() !== state.playingAs) {
      stockfish.current.onmessage = handleMessage;
      stockfish.current.postMessage(`position fen ${chess.fen()}`);
      stockfish.current.postMessage(`go movetime ${thinkingTime}`);
    }
  }, [chess]);

  return stockfish.current;
}
