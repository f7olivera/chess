import React from 'react';
import PropTypes from "prop-types";
import Chess from 'chess.js';
import Board from './Board.jsx';
import Square from './Square.jsx';
import Piece from './Piece.jsx'
import {makeMove} from "../utils/misc.js";


export default function Editor({postFen}) {
  const [chess, setChess] = React.useState(new Chess(postFen || undefined));

  React.useEffect(() => {
    document.title = 'Board editor';

    return () => document.title = 'Chess';
  }, [])
  const setTurn = (player) => {
    const currentFEN = chess.fen();
    const newFEN = currentFEN.split(' ').map((elem) => elem === 'w' || elem === 'b' ? player : elem).join(' ');
    currentFEN !== newFEN && setChess(Chess(newFEN));
  }

  const setCastle = (castle, checked) => {
    const currentFEN = chess.fen();
    const castlesOrder = ['K', 'Q', 'k', 'q'];
    const player = castle.split('-')[2];
    const castleType = player === 'w' ? castle.split('-')[1][0].toUpperCase() : castle.split('-')[1][0];
    const FENTokens = currentFEN.split(' ');
    const currentCastles = FENTokens[2].split('');
    const newCastles = checked ?
      castlesOrder.filter((elem) => currentCastles.includes(elem) || elem === castleType) :
      currentCastles.filter((elem) => elem !== castleType);
    const newFEN = currentFEN.split(' ').map((elem, index) => index === 2 ? newCastles.join('') || '-' : elem).join(' ');
    setChess(new Chess(newFEN));
  }

  const validateFEN = (FEN) => {
    const newChess = new Chess(FEN)
    if (newChess.validate_fen(FEN).valid) {
      setChess(newChess);
    }
  }

  const loadPosition = () => {
    const FEN = document.querySelector('#inputFEN').value;
    const startingFenInput = document.querySelector('#id_starting_fen');
    startingFenInput.value = FEN;
    document.querySelector('#create_button').click();
    startingFenInput.dispatchEvent(new Event('input', {bubbles: true}));
  }

  const board = <Board chess={chess} setChess={setChess}/>;
  const colors = ['w', 'b'];
  const piecesOrder = ['p', 'n', 'b', 'r', 'q', 'k'];
  const pieceGenerators =
    colors.map((color) =>
      <div className="pieces">
        {piecesOrder.map((piece) =>
          <Square>
            <Piece chess={chess} onDrop={(move) => makeMove(chess, setChess, move, false, undefined, undefined)}
                   type={piece} color={color}/>
          </Square>
        )}
      </div>)

  return (
    <div className='contenedor'>
      {board}
      <div className='editor-tools'>
        {pieceGenerators}
        <select id="select-turn" onChange={(e) => setTurn(e.target.value)}>
          <option value='w'>White to move</option>
          <option value='b'>Black to move</option>
        </select>
        <div className='d-flex ps-1'>
          {colors.map((color) =>
            <div className='col-5'>
              <p>{color === 'w' ? "White" : "Black"}</p>
              <input defaultChecked={true} onChange={(e) => setCastle(e.target.id, e.target.checked)}
                     id={`castle-kingside-${color}`} type="checkbox"/>
              <label htmlFor={`castle-kingside-${color}`}>(O-O)</label>
              <br/>
              <input defaultChecked={true} onChange={(e) => setCastle(e.target.id, e.target.checked)}
                     id={`castle-queenside-${color}`} type="checkbox"/>
              <label htmlFor={`castle-queenside-${color}`}>(O-O-O)</label>
            </div>
          )}
        </div>
        <input type='text' id='inputFEN' placeholder='FEN' value={chess.fen()}
               onChange={(e) => validateFEN(e.target.value)}/>
        <input className="btn shadow-none" type="button" onClick={loadPosition} value="Create game"/>
        <input className="btn shadow-none" type="button"
               onClick={(e) => {
                 document.location.href = 'analysis/' + document.querySelector('#inputFEN').value.replaceAll(' ', '_');
               }}
               value="Analyze game"/>
      </div>
    </div>
  )
}
Board.propTypes = {
  postFen: PropTypes.string,
};
Board.defaultProps = {
  postFen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
};
