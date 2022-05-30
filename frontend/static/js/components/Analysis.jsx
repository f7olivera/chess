import React from "react";
import {useParams} from "react-router-dom";
import Chess from "chess.js";
import Board from "./Board.jsx";
import Moves from "./Moves.jsx";
import useGameBoard from "../hooks/useGameBoard.js";
import useStockfishAnalysis from "../hooks/useStockfishAnalysis.js";
import {flip} from "../redux/gameSlice.js";
import {useDispatch, useSelector} from "react-redux";


export default function Analysis({postFen, postPgn}) {
  const fen = useParams()['*'] && useParams()['*'].replaceAll('_', ' ');
  const [chess, setChess] = React.useState(new Chess());
  const [fakeChess, setFakeChess] = React.useState();
  const [chessPreview, setChessPreview] = React.useState(new Chess());
  const [autoFlip, setAutoFlip] = React.useState(false);
  const [depth, setDepth] = React.useState(20);
  const state = useSelector((state) => state.game);
  const dispatch = useDispatch();
  const board = useGameBoard({chessState: [chess, setChess], fakeChess});
  const {analysis, winningProbability} = useStockfishAnalysis({
    chessState: [chess, setChess],
    depth,
    fakeChess,
    setFakeChess,
    chessPreview,
    setChessPreview
  })

  React.useEffect(() => {
    postFen = JSON.parse(document.getElementById('post-fen').textContent);
    postPgn = JSON.parse(document.getElementById('post-pgn').textContent);
    if (postFen) {
      const newChess = new Chess(postFen);
      newChess.load_pgn(postPgn);
      setChess(newChess);
    } else {
      const newChess = new Chess(fen || undefined);
      setChess(newChess);
    }
  }, [])

  React.useEffect(() => {
    if (autoFlip && chess.turn() !== state.orientation) {
      dispatch(flip());
    }
  }, [chess, autoFlip]);

  const toggleStockfishLine = () => {
    if (document.querySelector('.stockfish-line').classList.contains('no-wrap')) {
      document.querySelector('.stockfish-line').classList.replace('no-wrap', 'wrap');
      document.querySelector('.stockfish-line-toggle').classList.replace('no-wrap', 'wrap');
    } else {
      document.querySelector('.stockfish-line').classList.replace('wrap', 'no-wrap')
      document.querySelector('.stockfish-line-toggle').classList.replace('wrap', 'no-wrap')

    }
  }

  return (
    <div className='contenedor game offline-game'>
      <div className='analysis-board'>
        {board}
        <div className='score-bar'>
          <div className='tick' style={{height: '12.5%'}}/>
          <div className='tick' style={{height: '25%'}}/>
          <div className='tick' style={{height: '37.5%'}}/>
          <div className='tick zero' style={{height: '50%'}}/>
          <div className='tick' style={{height: '62.5%'}}/>
          <div className='tick' style={{height: '75%'}}/>
          <div className='tick' style={{height: '87.5%'}}/>
          <div className='tick' style={{height: '100%'}}/>
          <div className='white-bar' style={{height: `${(winningProbability + 1) * 50}%`}}/>
        </div>

      </div>


      <div className='flex-wrap offline' id="game-actions">
        <span className='stockfish-line-container'>
          <div>
            <p className='stockfish-line-title'>Best line found</p>
            <p className='stockfish-line no-wrap'
               onMouseLeave={() => document.querySelector('#chess-preview').style.display = 'none'}>
              {analysis.line}
              <span
                onClick={toggleStockfishLine}
                className='stockfish-line-toggle move-btn no-wrap'>
                ▲
              </span>
            </p>
          </div>
          <div className='game' style={{display: 'none'}} id='chess-preview'>
            <Board chess={chessPreview} disabled={true} coordinates={false} containerId={'chess-preview'}/>
          </div>
        </span>
        <Moves chess={chess} fakeChess={fakeChess} setFakeChess={setFakeChess}/>
        <div className='offline-control-container'>

          <div className='offline-info'
               style={{height: '4rem'}}>
            <p>
              Stockfish 11, depth {depth}
            </p>
            <p>
              <input type="range" name="depth" defaultValue="20" min="1" max="25" className="range"
                     onChange={(e) => setDepth(e.target.value)} id="depth_range"/>
            </p>
            <p><i>{state.endType && state.endType}</i></p>
          </div>
          <div className='offline-control'>
            <div>
              <label className='offline-flip' onClick={() => dispatch(flip())}>
                <span>Flip board</span>
                <div title='Flip board' className='flip-button background-icon offline'/>
              </label>
            </div>
            <label className='offline-flip'>
              <span>Auto flip</span>
              <input type='checkbox' onChange={(e) => setAutoFlip(e.target.checked)}/>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}
