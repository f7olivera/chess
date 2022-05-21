import React from 'react';
import PropTypes from "prop-types";
import Square from './Square.jsx'
import Piece from './Piece.jsx';
import {useSelector} from "react-redux";
import {makeMove} from '../misc/misc.js'

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
