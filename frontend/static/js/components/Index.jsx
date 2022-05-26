import React from "react";
import Board from "./Board.jsx";
import Chess from "chess.js";


export default function Index() {
  React.useEffect(() => {
    const body = document.querySelector('body');
    // body.style.backgroundImage = 'url(static/assets/index-background.svg)';
    // body.style.backgroundPosition = 'center';
    // body.style.backgroundSize = 'min(95vmin, 50rem)';

    return () => {
      body.style.backgroundImage = 'unset';
      body.style.backgroundPosition = 'unset';
      body.style.backgroundSize = 'unset';
    }
  })

  return (
    <div className='index'>
      <div className='index-board'>
        <div className='modal-group'>
          <span className='modal-btn' onClick={() => document.querySelector('#create_button').click()}>
            Play with a friend
          </span>
        <a className='modal-btn' href='#'
           onClick={() => document.querySelector('#launch-stockfish-settings').click()}>
          Play with the computer
        </a>
        <a className='modal-btn' href={window.origin + '/play/offline'}>
          Play over the board
        </a>
      </div>
      </div>
      <div className='unavoidable-modal'/>
    </div>
  );
}
