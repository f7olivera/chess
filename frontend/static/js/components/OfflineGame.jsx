import React from "react";
import useGameBoard from "../hooks/useGameBoard.js";
import Chess from "chess.js";
import {useDispatch, useSelector} from "react-redux";
import {flip, setState} from "../redux/gameSlice";
import Moves from "./Moves.jsx";


export default function OfflineGame() {
  const [chess, setChess] = React.useState(new Chess());
  const [fakeChess, setFakeChess] = React.useState();
  const [autoFlip, setAutoFlip] = React.useState(false);
  const board = useGameBoard({chessState: [chess, setChess], fakeChess});
  const state = useSelector((state) => state.game);
  const dispatch = useDispatch();

  React.useEffect(() => {
    if (autoFlip && chess.turn() !== state.orientation) {
      dispatch(flip());
    }
  }, [chess, autoFlip]);

  React.useEffect(() => {
    dispatch(setState({
      playingAs: chess.turn(),
    }));
  }, []);

  React.useEffect(() => {
    dispatch(setState({
      playingAs: chess.turn(),
      endType: chess.game_over() ? (
        chess.in_checkmate() ? `Checkmate. ${chess.turn() === 'w' ? 'Black' : 'White'} wins.` : 'Draw.'
      ) : undefined,
    }));
  }, [chess]);

  return (
    <div className='contenedor game offline-game'>
      {board}
      <div className='flex-wrap offline' id="game-actions">
        <Moves chess={chess} fakeChess={fakeChess} setFakeChess={setFakeChess}/>
        <div className='offline-control-container'>

          <div className='offline-info'
               style={{height: '3.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'center'}}>
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
