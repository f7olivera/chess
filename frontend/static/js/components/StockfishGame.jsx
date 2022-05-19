import React from "react";
import Chess from "chess.js";
import useGameBoard from "../hooks/useGameBoard.js";
import useStockfish from "../hooks/useStockfish.js";
import {useDispatch, useSelector} from "react-redux";
import {flip, setState} from "../redux/gameSlice.js";
import Moves from "./Moves.jsx";


export default function StockfishGame({fen, skillLevel, thinkingTime, playingAs}) {
  const [chess, setChess] = React.useState(new Chess());
  const [fakeChess, setFakeChess] = React.useState();
  const [autoFlip, setAutoFlip] = React.useState(false);
  const board = useGameBoard({chessState: [chess, setChess], fakeChess});
  const state = useSelector((state) => state.game);
  const dispatch = useDispatch();
  const stockfish = useStockfish({chessState: [chess, setChess], skillLevel, thinkingTime})
  
  React.useEffect(() => {
    if (autoFlip && chess.turn() !== state.orientation) {
      dispatch(flip());
    }
  }, [chess, autoFlip]);

  const startStockfishGame = () => {
    setChess(new Chess(fen));
    dispatch(setState({
      orientation: playingAs,
      playingAs,
    }));
    dispatch(setState({
      started: true,
    }))
  }

  React.useEffect(() => {
    startStockfishGame();
  }, [])

  React.useEffect(() => {
    if (chess.game_over() && !state.endType) {
      dispatch(setState({
        endType: chess.game_over() ? (
          chess.in_checkmate() ? `Checkmate. ${chess.turn() === 'w' ? 'Black' : 'White'} wins.` : 'Draw.'
        ) : undefined,
      }));
      stockfish.postMessage('stop');
      stockfish.postMessage('quit');
    }
  }, [chess]);

  return (
    <div className='contenedor game offline-game'>
      {board}
      <div className='flex-wrap offline' id="game-actions">
        <Moves chess={chess} fakeChess={fakeChess} setFakeChess={setFakeChess}/>
        <div className='offline-control-container'>
          <div className='offline-info'
               style={{height: '4rem'}}>
            <p>
              Stockfish level <span className='stockfish-level'>10</span>
            </p>
            <p>
              Thinking time: <span className='stockfish-thinking-time'>500</span> ms
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