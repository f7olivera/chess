import React from 'react';
import Board from "../components/Board.jsx";
import Timer from "../components/Timer.jsx";
import Chess from "chess.js";
import {useDispatch, useSelector} from "react-redux";
import {gameActions} from '../redux/gameSlice.js'


export default function useGameBoard({chessState: [chess, setChess], fakeChess, timeState}) {
  const state = useSelector((state) => state.game);

  // Updates board
  React.useEffect(() => {
    if (state.fen || state.pgn) {
      const newChess = new Chess(state.fen);
      newChess.load_pgn(state.pgn)
      setChess(newChess);
    }
  }, [state.fen, state.pgn]);

  React.useEffect(() => {
    // document.querySelector('body').onscroll = (e) => console.log(e)
  }, [state.fen, state.pgn]);

  return <Board chess={chess}
                setChess={setChess}
                fakeChess={fakeChess}
                players={{
                  whitePlayer: (
                    <div className={`player ${state.orientation === 'w' ? 'order-2' : 'order-0'}`}>
                      {state.whitePlayer &&
                      <div className='player-username'>
                        <span className={`circle light-circle`}/>
                        <span> {state.whitePlayer}</span>
                      </div>}
                      {state.gameLoaded && timeState.whiteTime ?
                        <Timer time={timeState.whiteTime}
                               // setTime={(t) => dispatch(gameActions.setTime({player: 'w', time: t}))}
                               setTime={timeState.setWhiteTime}
                               running={state.started && chess.turn() === 'w' && !state.endType}/> :
                        ''}
                    </div>
                  ),
                  blackPlayer: (
                    <div className={`player ${state.orientation === 'w' ? 'order-0' : 'order-2'}`}>
                      {state.blackPlayer &&
                      <div className='player-username'>
                        <span className={`circle dark-circle`}/>
                        <span> {state.blackPlayer}</span>
                      </div>}
                      {state.gameLoaded && timeState.blackTime ?
                        <Timer time={timeState.blackTime}
                               // setTime={(t) => dispatch(gameActions.setTime({player: 'b', time: t}))}
                               setTime={timeState.setBlackTime}
                               running={state.started && chess.turn() === 'b' && !state.endType}/> : ''}
                    </div>
                  )
                }}
                disabled={Boolean(state.endType) || fakeChess || state.spectator || state.connectionState === 'reconnecting'}
                coordinates={true}
                useRules={true} />;
}
