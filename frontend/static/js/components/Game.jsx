import React from 'react';
import Chess from 'chess.js';
import Moves from "./Moves.jsx";
import Chat from "./Chat.jsx";
import useGameBoard from "../hooks/useGameBoard.js";
import useWebsocket from "../hooks/useWebsocket.js";
import {bookmarkGame, copyTextToClipboard, sendWebsocketMessage} from "../utils/misc.js";
import {useDispatch, useSelector} from "react-redux";
import {flip, resign_confirmation} from "../redux/gameSlice.js";


export default function Game() {
  const [chess, setChess] = React.useState(new Chess());
  const [fakeChess, setFakeChess] = React.useState();
  const [whiteTime, setWhiteTime] = React.useState(undefined);
  const [blackTime, setBlackTime] = React.useState(undefined);
  const board = useGameBoard({
    chessState: [chess, setChess],
    fakeChess,
    timeState: {
      whiteTime,
      setWhiteTime,
      blackTime,
      setBlackTime,
    }
  });
  const ws = useWebsocket({
    chessState: [chess, setChess],
    whitTimeState: [whiteTime, setWhiteTime],
    blackTimeState: [blackTime, setBlackTime],
  });
  const state = useSelector((state) => state.game);
  const dispatch = useDispatch();

  React.useEffect(() => {
    const turn = chess.turn() === state.playingAs ? `${state.wait ? 'Waiting for oponent' : 'Your turn'} - ` : 'Opponent turn - ';
    const turnForSpectators = `${chess.turn() === 'w' ? 'White' : 'Black'} turn - `;
    const gameStatus = `${state.endType ? 'Game Over - ' : (state.spectator ? turnForSpectators : turn)}`;
    document.title = state.whitePlayer ? `${gameStatus}${state.whitePlayer} vs ${state.blackPlayer}` : 'Play';
  }, [state.whitePlayer, state.blackPlayer, chess.turn(), state.endType, state.connectionState]);

  return (
    <>
      <div className='main-container game'>
        {board}
      <div className='flex-wrap' id="game-actions">
          <div style={{display: `${!state.endType && state.drawOffer ? 'flex' : 'none'}`}} id='draw_offer'>
            <span>Draw offered. Accept?</span>
            <div>
              <button className='btn btn-confirm' onClick={!state.endType ? () => {
                sendWebsocketMessage(ws, {name: 'accept_draw', payload: true});
              } : () => {
              }}>Yes
              </button>
              <button className='btn btn-confirm' onClick={!state.endType ? () => {
                sendWebsocketMessage(ws, {name: 'refuse_draw', payload: true});
              } : () => {
              }}>No
              </button>
            </div>
          </div>
          <div id='game-info'>
            <div title='Bookmark this game'
                 className={`star ${state.bookmark ? 'filled-star' : ''}`}
                 onClick={() => {
                   bookmarkGame();
                   const star = document.querySelector('.star');
                   star.classList.contains('filled-star') ?
                     star.classList.remove('filled-star') :
                     star.classList.add('filled-star');
                 }}
                 style={{display: state.spectator ? 'none' : 'block'}}/>
            {state.whitePlayer && state.blackPlayer && state.gameInfo &&
            <>
              <p>{state.whitePlayer} vs {state.blackPlayer} ({state.gameInfo['time'] < 60 ? state.gameInfo['time'] + '"' : state.gameInfo['time'] / 60 + "'"})</p>
              <p>{state.gameInfo['created_time']}</p>
              <p><i>{state.endType && state.endType}</i></p>
            </>
            }
          </div>
          <Moves chess={chess} fakeChess={fakeChess} setFakeChess={setFakeChess}/>
          <span id='game-control' style={{display: state.spectator ? 'none' : 'flex'}}>
            <div title='Flip board' className='flip-button background-icon' onClick={() => dispatch(flip())}/>
            <span id='draw'
                  title='Offer draw'
                  onClick={!state.endType && !state.drawOffer ? () => sendWebsocketMessage(ws, {
                    name: 'offer_draw',
                    payload: true
                  }) : () => {
                  }}>
              ½
            </span>
            <div className='flag background-icon'
                 id='resign'
                 title='Resign'
                 onClick={!state.endType ? () => dispatch(resign_confirmation({resign_confirmation: true})) : () => {
                 }}>
              <div style={{display: state.resignConfirmation ? 'flex' : 'none'}} id='resign-confirmation' title=''>
                <span>Resign?</span>
                <div>
                  <button className='btn btn-confirm' onClick={!state.endType ? (e) => {
                    e.stopPropagation();
                    dispatch(resign_confirmation({resign_confirmation: false}))
                    sendWebsocketMessage(ws, {name: 'resign', payload: true});
                  } : () => {
                  }}>Yes</button>
                  <button className='btn btn-confirm' onClick={!state.endType ? (e) => {
                    e.stopPropagation();
                    dispatch(resign_confirmation({resign_confirmation: false}));
                  } : () => {
                  }}>No</button>
                </div>
              </div>
            </div>
          </span>
          <div className='offline-control' style={{display: state.spectator ? 'flex' : 'none'}}>
            <div>
              <label className='offline-flip' onClick={() => dispatch(flip())}>
                <span>Flip board</span>
                <div title='Flip board' className='flip-button background-icon offline'/>
              </label>
            </div>
            <label className='offline-flip' onClick={() => this.querySelector('input').click()}>
              <span>Auto flip</span>
              <input type='checkbox' onChange={(e) => setAutoFlip(e.target.checked)}/>
            </label>
          </div>
          <Chat ws={ws}/>
        </div>
      </div>
      <div className={`${state.wait ? 'unavoidable-modal' : ''}`} style={{display: state.wait ? 'flex' : 'none'}}>
        <div>
          <span>Waiting for {state.waitingFor ? state.waitingFor : 'opponent'}...</span>
          <div className='link'>
            <a id='game-link' href={window.location.href} target='_blank'>{window.location.href}</a>
            <div className='copy-link background-icon copy' onClick={() => {
              const copyButton = document.querySelector('.copy-link');
              copyTextToClipboard(document.querySelector('#game-link').textContent);
              copyButton.classList.replace('copy', 'check-mark');
              setTimeout(() => {
                copyButton.classList.replace('check-mark', 'copy');
              }, 1500)
            }}/>
          </div>
        </div>
      </div>
      <div className={state.connectionState} id='conection-state'
           style={state.connectionState === 'reconnected' ? {bottom: '-2.5rem', opacity: '0'} : {}}>
        <div
          className={`${state.connectionState === 'reconnecting' ? 'flip-button background-icon' : 'circle white-circle'}`}/>
        <span>{state.connectionState === 'reconnecting' ? 'Reconnecting' : 'Reconnected'}</span>
      </div>
    </>
  )
}
