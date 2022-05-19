import React from 'react';
import ReactDOM from "react-dom";
import Board from "./Board.jsx";
import Chess from "chess.js";
import PropTypes from "prop-types";


export default function Miniboard({container}) {
  const [chess, setChess] = React.useState(new Chess());

  React.useEffect(() => {
    const miniboardContainer = container.parentElement;
    miniboardContainer.querySelector('#id_starting_fen').oninput = (e) => {
      const FEN = e.target.value;
      const newChess = new Chess(FEN);
      if (newChess.validate_fen(FEN).valid) {
        miniboardContainer.querySelector('#invalid-fen').classList.replace('d-block', 'd-none');
        setChess(newChess);
      } else {
        miniboardContainer.querySelector('#invalid-fen').classList.replace('d-none', 'd-block');
      }
    };

    return () => {
      miniboardContainer.querySelector('#id_starting_fen').oninput = null;
    };
  })

  React.useEffect(() => {
    document.querySelector('.play_as_white').onclick = () => {
      document.querySelector('#id_white_player').value = 'initiator';
    };
    document.querySelector('.play_as_random').onclick = () => {
      document.querySelector('#id_white_player').value = 'random';
    };
    document.querySelector('.play_as_black').onclick = () => {
      document.querySelector('#id_white_player').value = 'opponent';
    };

    return () => {
      document.querySelector('.play_as_white').onclick = '';
      document.querySelector('.play_as_random').onclick = '';
      document.querySelector('.play_as_black').onclick = '';
    };
  })

  const board = <Board chess={chess} disabled={true}/>;
  return ReactDOM.createPortal(board, container);
}
Miniboard.propTypes = {
  portal: PropTypes.bool,
}
Miniboard.defaultProps = {
  portal: false,
}