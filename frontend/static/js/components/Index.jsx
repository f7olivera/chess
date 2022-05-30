import React from "react";
import Board from "./Board.jsx";
import Chess from "chess.js";


export default function Index() {

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
