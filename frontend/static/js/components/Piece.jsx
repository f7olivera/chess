import React from "react";
import PropTypes from "prop-types";
import Chess from "chess.js";
import {
  getMove,
  selectPiece
} from '../misc/misc.js'

export default function Piece({chess, onDrop, ended, turn, type, color, promotion, playingAs, disabled}) {
  function pickPiece(event) {
    const board = document.querySelector('.board');
    const element = event.target;
    const hold = () => {
      const clientY = event.type === 'touchstart' ? event.touches[0].clientY : event.clientY;
      const clientX = event.type === 'touchstart' ? event.touches[0].clientX : event.clientX;
      const elementWidht = element.offsetWidth;
      const elementHeight = element.offsetHeight;
      element.style.width = `${elementWidht}px`;
      element.style.height = `${elementHeight}px`;
      element.style.top = `${clientY - parseInt(element.offsetHeight / 2, 10)}px`;
      element.style.left = `${clientX - parseInt(element.offsetWidth / 2, 10)}px`;
      element.classList.add('picked');
    }

    const drop = async (eventMouseUp) => {
      if (!element.parentElement) {
        return;
      }
      element.classList.remove('picked');
      element.style.width = '';
      element.style.height = '';
      const move = getMove(element, eventMouseUp.type === 'touchend' ?
        document.elementFromPoint(eventMouseUp.changedTouches[0].clientX, eventMouseUp.changedTouches[0].clientY) :
        eventMouseUp.target);
      const chessCopy = new Chess(chess.fen());
      onDrop(move);
      const validMove = (playingAs && chessCopy.move(move)) || (element.parentElement && element.parentElement.classList.contains('generator'));
      if (element.parentElement && element.parentElement.classList.contains('generator')) {
        document.querySelector('.selected') && document.querySelector('.selected').classList.remove('selected');
      }
      if (!validMove && playingAs) {
        const makeAsyncMove = () => new Promise(resolve => {
          document.onclick = null;
          document.onclick = (e) => {
            e.target.dispatchEvent(new Event('touchend'))
            const asyncMove = element.parentElement && getMove(element, e.target);
            if (!asyncMove || asyncMove.from !== asyncMove.to) {
              onDrop(asyncMove);
              document.querySelector('.selected') && document.querySelector('.selected').classList.remove('selected');
              document.querySelectorAll('.possible-move').forEach((elem) => elem.classList.remove('possible-move'));
              document.querySelectorAll('.capture').forEach((elem) => elem.classList.remove('capture'));
              board.onmousedown = null;
              document.onclick = null;
              document.ontouchstart = null;
            }
            resolve();
          }
        })
        await makeAsyncMove();
      }
      document.ontouchend = null;
      board.ontouchend = (e) => e.preventDefault();
      document.ontouchmove = null;
      document.onmouseup = null;
      document.onmousemove = null;
    }

    const moveASD = (eventMove) => {
      if (eventMove.buttons === 0 && !event.target.parentNode.classList.contains('generator')) {
        drop(eventMove);
        eventMove.preventDefault();
      }
      const clientY = eventMove.type === 'touchmove' ? eventMove.touches[0].clientY : eventMove.clientY;
      const clientX = eventMove.type === 'touchmove' ? eventMove.touches[0].clientX : eventMove.clientX;
      const newTop = clientY - parseInt(element.offsetHeight / 2, 10);
      const newLeft = clientX - parseInt(element.offsetWidth / 2, 10);
      element.style.top = `${newTop}px`;
      element.style.left = `${newLeft}px`;
    }

    if ((event.button === 0 || event.type === 'touchstart') && !element.classList.contains('disabled') && (playingAs || !document.querySelector('.selected'))) {
      document.onclick = null;
      document.querySelector('.selected') && document.querySelector('.selected').classList.remove('selected');
      document.querySelectorAll('.possible-move').forEach((elem) => elem.classList.remove('possible-move'));
      document.querySelectorAll('.capture').forEach((elem) => elem.classList.remove('capture'));
      playingAs && selectPiece(chess, playingAs, element, onDrop);

      // Hold
      hold();

      // Drop
      document.onmouseup = drop
      document.ontouchend = drop

      // Drag
      document.onmousemove = moveASD;
      document.ontouchmove = moveASD;
    }
  }

  const pieceClassName = `${type}${color}${promotion ? ' promotion' : ''}`;

  return (
    <div
      onMouseDown={!disabled && (!playingAs || playingAs === color) && (!turn || turn === color) && !ended && !promotion ?
        pickPiece : () => {
        }}
      onTouchStart={!disabled && (!playingAs || playingAs === color) && (!turn || turn === color) && !ended && !promotion ?
        pickPiece :
        () => {
        }}
      onTouchEnd={(e) => {
        e.preventDefault();
      }}
      className={`piece ${pieceClassName}`}/>
  );
}
// Piece.propTypes = {
//   onDrop: PropTypes.func,
//   ended: PropTypes.bool,
//   turn: PropTypes.oneOf(['w', 'b']),
//   type: PropTypes.oneOf(['k', 'q', 'r', 'b', 'n', 'p']).isRequired,
//   color: PropTypes.oneOf(['w', 'b']).isRequired,
//   promotion: PropTypes.bool,
//   onClick: PropTypes.func,
//   disabled: PropTypes.bool,
// };
// Piece.defaultProps = {
//   onDrop: () => {
//   },
//   ended: undefined,
//   turn: undefined,
//   promotion: false,
//   onClick: () => {
//   },
//   disabled: false,
// };
