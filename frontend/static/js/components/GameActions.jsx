import React from "react";
import Chess from "chess.js";
import Moves from "./Moves.jsx";
import Chat from "./Chat.jsx";
import {bookmarkGame, getCookie, parseHistory, sendWebsocketMessage} from "../misc/misc.js";
import {useDispatch, useSelector} from "react-redux";
import {chat_message, flip, resign_confirmation} from "../redux/gameSlice";
import PropTypes from "prop-types";

function GameActions({chess, fakeChess, setFakeChess, ws, offline, depth, setDepth, children}) {
  // console.log('re-rendered')


  const {
    spectator,
    whitePlayer,
    blackPlayer,
    gameInfo,
    endType,
    resignConfirmation,
    drawOffer,
    bookmark,
    orientation,
  } = useSelector((state) => state.game);
  const dispatch = useDispatch();



  return (
    <div className={`flex-wrap ${offline ? 'offline' : ''}`} id="game-actions">
      {children}

      {/*<div className='offline-control' style={{display: spectator ? 'flex' : 'none'}}>*/}
      {/*  <div>*/}
      {/*    <label className='offline-flip' onClick={() => dispatch(flip())}>*/}
      {/*      <span>Flip board</span>*/}
      {/*      <div title='Flip board' className='flip-button background-icon offline'/>*/}
      {/*    </label>*/}
      {/*  </div>*/}
      {/*  <label className='offline-flip' onClick={() => this.querySelector('input').click()}>*/}
      {/*    <span>Auto flip</span>*/}
      {/*    <input type='checkbox' onChange={(e) => setAutoFlip(e.target.checked)}/>*/}
      {/*  </label>*/}
      {/*</div>*/}

      {/*<div className='offline-control-container' style={{display: offline ? 'flex' : 'none'}}>*/}
      
      {/*  <div className='offline-info'*/}
      {/*       style={{height: '4rem'}}>*/}
      {/*    <p>*/}
      {/*      Stockfish 11, depth {depth}*/}
      {/*    </p>*/}
      {/*    <p>*/}
      {/*      <input type="range" name="depth" defaultValue="20" min="1" max="25" className="range"*/}
      {/*             onInput={(e) => setDepth(e.target.value)} id="depth_range"/>*/}
      {/*    </p>*/}
      {/*    <p><i>{endType && endType}</i></p>*/}
      {/*  </div>*/}
      {/*  <div className='offline-control'>*/}
      {/*    <div>*/}
      {/*      <label className='offline-flip' onClick={() => dispatch(flip())}>*/}
      {/*        <span>Flip board</span>*/}
      {/*        <div title='Flip board' className='flip-button background-icon offline'/>*/}
      {/*      </label>*/}
      {/*    </div>*/}
      {/*    <label className='offline-flip'>*/}
      {/*      <span>Auto flip</span>*/}
      {/*      <input type='checkbox' onChange={(e) => setAutoFlip(e.target.checked)}/>*/}
      {/*    </label>*/}
      {/*  </div>*/}
      {/*</div>*/}


    </div>)
}

GameActions.propTypes = {
  chess: PropTypes.object.isRequired,
  fakeChess: PropTypes.object,
  setFakeChess: PropTypes.func,
  ws: PropTypes.object,
  offline: PropTypes.bool,
}
GameActions.defaultProps = {
  fakeChess: undefined,
  setFakeChess: null,
  ws: undefined,
  offline: false,
}

export default GameActions;