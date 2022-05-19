import React from 'react';
import PropTypes from "prop-types";
import Square from './Square.jsx'
import Piece from './Piece.jsx';
import {useSelector} from "react-redux";


export default function Board({
                                chess,
                                setChess,
                                fakeChess,
                                players,
                                useRules,
                                disabled,
                                coordinates,
                                containerId,
                              }) {
  const [lastMove, setLastMove] = React.useState({from: undefined, to: undefined});
  const squares = (fakeChess && fakeChess.board()) || chess.board();
  const turn = (useRules && chess.turn()) || undefined;
  const state = useSelector((state) => state.game);

  React.useEffect(() => {
    const currentChess = fakeChess || chess;
    const from = currentChess.history().length > 0 && currentChess.history({verbose: true})[currentChess.history().length - 1].from;
    const to = currentChess.history().length > 0 && currentChess.history({verbose: true})[currentChess.history().length - 1].to;
    setLastMove({from, to});
    const game = document.querySelector(`${containerId ? `#${containerId}` : '.game'}`);
    game && game.querySelector('.check') && game.querySelector('.check').classList.remove('check');
    game && !fakeChess && chess.in_check() && game.querySelector(`.k${chess.turn()}`).parentElement.classList.add('check');
    game && fakeChess && fakeChess.in_check() && game.querySelector(`.k${fakeChess.turn()}`).parentElement.classList.add('check');
  }, [chess, fakeChess])

  const promotionPieces = [
    {type: 'q', color: 'w'},
    {type: 'r', color: 'w'},
    {type: 'b', color: 'w'},
    {type: 'n', color: 'w'},
    {type: 'n', color: 'b'},
    {type: 'b', color: 'b'},
    {type: 'r', color: 'b'},
    {type: 'q', color: 'b'}
  ]

  const getRows = () => {
    return squares.map((row, i) => {
      const rowIndex = 8 - i;

      const getSquares = () => {
        return row.map((square, j) => {
          const colIndex = 'abcdefgh'[j];
          const squareKey = `${colIndex}${rowIndex}`;
          const promotionPiece = <Piece type={promotionPieces[i].type} color={promotionPieces[i].color}
                                        promotion={true} disabled={disabled}/>;
          return (
            <Square orientation={state.orientation} key={squareKey} coord={[i, j]} coordinates={coordinates} lastMove={squareKey === lastMove.from || squareKey === lastMove.to}>
              {promotionPiece}
              {square &&
              <Piece chess={chess}
                     onDrop={(move) => makeMove(chess, setChess, move, useRules, state.orientation, state.playingAs)}
                     ended={state.endType} turn={turn} {...square}
                     playingAs={state.playingAs} disabled={disabled}/>}
            </Square>
          );
        })
      }

      return (
        <div key={rowIndex} className="board-row">
          {!state.orientation || state.orientation === 'w' ? getSquares() : getSquares().reverse()}
        </div>
      );
    })
  };

  const rows = !state.orientation || state.orientation === 'w' ? getRows() : getRows().reverse();

  return (
    <div className='board' data-fen={chess.fen()}>
      {players ? players.whitePlayer : ''}
      {players ? players.blackPlayer : ''}
      <div className='rows-container'>
        {rows}
      </div>
    </div>
  );
}
Board.propTypes = {
  chess: PropTypes.object.isRequired,
  setChess: PropTypes.func,
  fakeChess: PropTypes.object,
  players: PropTypes.object,
  useRules: PropTypes.bool,
  disabled: PropTypes.bool,
  coordinates: PropTypes.bool,
}
Board.defaultProps = {
  setChess: () => {
  },
  fakeChess: undefined,
  players: undefined,
  useRules: false,
  disabled: false,
  coordinates: true,
}

function hidePiece(coord) {
  const square = document.querySelector(`[class*="${coord}"]`);
  const piece = Array.from(square.children).find((elem) => !elem.classList.contains('promotion'));
  piece ? piece.style.display = 'none' : '';
}

export const makeMove = (chess, setChess, move, useRules, orientation, playingAs) => {
  const chessCopy = {...chess}
  if (useRules) {
    const validMove = chessCopy.move(move);
    const toRow = move.to && parseInt(move.to[move.to.length - 1]);

    if (validMove && move.pickedPiece.toLowerCase()[0] === 'p' && toRow && (toRow === 1 || toRow === 8)) {
      chessCopy.undo();
      hidePiece(move.from);
      const toCol = move.to[0];
      const gameBoard = document.querySelector('.game');
      const promotionSquares = Array.from(gameBoard.querySelectorAll(`[class*="coord-${toCol}"]`)).filter((elem, index) => orientation === playingAs ? index < 4 : index >= 4);
      const promotionPieces = promotionSquares.map((elem) => elem.firstElementChild);
      const undraggables = gameBoard.querySelectorAll('.piece:not(.promotion)');
      undraggables.forEach((elem) => elem.classList.add('disabled'));
      promotionSquares.forEach((square) => Array.from(square.children).forEach((piece) => {
        if (piece.classList.contains('promotion')) {
          piece.classList.remove('disabled');
        } else {
          piece.style.display = 'none';
        }
      }));
      const promesa = new Promise((resolve) => {
        promotionPieces.forEach((piece) => {
          piece.style.display = 'block';
          piece.onclick = () => resolve(piece);
          piece.ontouchstart = () => resolve(piece);
        });
      });
      promesa.then((mensaje) => {
        const promotion = mensaje.className.split(' ').find((className) => className.length === 2)[0];
        chessCopy.move({...move, promotion: promotion});
        setChess(chessCopy);
        promotionPieces.forEach((piece) => {
          piece.style.display = 'none';
          piece.onclick = () => resolve(piece);
        });
        promotionSquares.forEach((square) => Array.from(square.children).forEach((piece) =>
          !piece.classList.contains('promotion') ? piece.style.display = 'block' : ''
        ))
        undraggables.forEach((elem) => elem.classList.remove('disabled'));
        document.querySelector('.selected') && document.querySelector('.selected').classList.remove('selected');
        document.querySelectorAll('.possible-move').forEach((elem) => elem.classList.remove('possible-move'));
        document.querySelectorAll('.capture').forEach((elem) => elem.classList.remove('capture'));
        document.onmouseup = null;
        document.ontouchend = null;
        document.onmousemove = null;
        document.ontouchmove = null;
        document.onclick = null;
      });
    } else if (validMove) {
      document.querySelector('.selected') && document.querySelector('.selected').classList.remove('selected');
      document.querySelectorAll('.possible-move').forEach((elem) => elem.classList.remove('possible-move'));
      document.querySelectorAll('.capture').forEach((elem) => elem.classList.remove('capture'));
      document.onmouseup = null;
      document.ontouchend = null;
      document.onmousemove = null;
      document.ontouchmove = null;
      document.onclick = null;
      setChess(chessCopy);
    } else {
      document.onclick = null;
    }
  } else if (!playingAs && !move) {
    move.from && chessCopy.remove(move.from);
    document.onmouseup = null;
    document.ontouchend = null;
    document.onmousemove = null;
    document.ontouchmove = null;
    document.onclick = null;
    setChess(chessCopy);
  } else if (move.to !== move.from) {
    const piece = move.from ? chessCopy.remove(move.from) : {type: move.pickedPiece[0], color: move.pickedPiece[1]};
    chessCopy.put(piece, move.to);
    document.onmouseup = null;
    document.ontouchend = null;
    document.onmousemove = null;
    document.ontouchmove = null;
    document.onclick = null;
    setChess(chessCopy);
  }
}