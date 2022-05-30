import Chess from "chess.js";
import {getCookie, whitenChild, unwhitenChild, parseHistory} from "../utils/misc.js";
import React from "react";
import {useSelector} from "react-redux";

export default function Moves({chess, fakeChess, setFakeChess}) {
  const [parsedHistory, setParsedHistory] = React.useState([]);
  const [selectedMove, setSelectedMove] = React.useState(chess.history().length - 1)
  const endType = useSelector((state) => state.game.endType);

  React.useEffect(() => {
    !fakeChess && setSelectedMove(chess.history().length - 1);

    if (parsedHistory.length === 0) {
      const newParsedHistory = parseHistory(chess);
      setParsedHistory(newParsedHistory);
    } else {
      if (parsedHistory[parsedHistory.length - 1].moves.length === 1) {
        const newLastMoves = parsedHistory[parsedHistory.length - 1].moves.concat([{
          fen: chess.fen(),
          move: chess.history()[chess.history().length - 1],
          pgn: chess.pgn()
        }])
        const newParsedHistory = parsedHistory.slice(0, parsedHistory.length - 1).concat([{
          turnNumber: parsedHistory.length,
          moves: newLastMoves
        }])
        setParsedHistory(newParsedHistory);
      } else {
        const newLastMoves = [{
          fen: chess.fen(),
          move: chess.history()[chess.history().length - 1],
          pgn: chess.pgn()
        }];
        const newParsedHistory = parsedHistory.concat([{
          turnNumber: parsedHistory.length + 1,
          moves: newLastMoves
        }])
        setParsedHistory(newParsedHistory);
      }
    }
  }, [chess])

  React.useEffect(() => {
    const moves = document.querySelector('#moves');
    moves.scrollTop = moves.scrollHeight;
  }, [parsedHistory])

  const rewindChess = (moves) => {
    const newChess = new Chess(chess.fen());
    newChess.load_pgn(chess.pgn());
    for (let i = 0; i < chess.history().length - moves - 1; i++) {
      newChess.undo();
    }
    setSelectedMove(moves)
    setFakeChess(moves === chess.history().length - 1 ? undefined : newChess);
  }

  const rewindDisabledState = (fakeChess && fakeChess.history().length === 0) || chess.history().length === 0 ? ' disabled' : '';
  const forwardDisabledState = !fakeChess ? ' disabled' : '';
  const movesButtons = (
    <div className='moves-buttons'>
      <div className={`move-btn${rewindDisabledState}`}
           onClick={(e) => !e.target.classList.contains('disabled') && rewindChess(-1)}
           onMouseOver={whitenChild} onMouseOut={unwhitenChild}>
        <img alt='go to starting position' className={`double-arrow${rewindDisabledState}`}
             src='/static/assets/double-arrow.svg'/>
      </div>
      <div className={`move-btn${rewindDisabledState}`}
           onClick={(e) => !e.target.classList.contains('disabled') && rewindChess(fakeChess ? fakeChess.history().length - 2 : chess.history().length - 2)}
           onMouseOver={whitenChild} onMouseOut={unwhitenChild}>
        <img alt='go back one move' className={`single-arrow${rewindDisabledState}`}
             src='/static/assets/single-arrow.svg'/>
      </div>
      <div className={`move-btn${forwardDisabledState}`}
           onClick={(e) => !e.target.classList.contains('disabled') && rewindChess(fakeChess ? fakeChess.history().length : chess.history().length + 2)}
           onMouseOver={whitenChild} onMouseOut={unwhitenChild}>
        <img alt='go forward one move' className={`single-arrow rotate-180${forwardDisabledState}`}
             src='/static/assets/single-arrow.svg'/>
      </div>
      <div className={`move-btn${forwardDisabledState}`}
           onClick={(e) => !e.target.classList.contains('disabled') && rewindChess(chess.history().length - 1)}
           onMouseOver={whitenChild} onMouseOut={unwhitenChild}>
        <img alt='go to last move' className={`double-arrow rotate-180${forwardDisabledState}`}
             src='/static/assets/double-arrow.svg'/>
      </div>
      <div className='move-btn analyze-btn'
           onClick={() => {
             const analysisChess = new Chess(chess.fen());
             analysisChess.load_pgn(chess.pgn());
             chess.history().forEach(() => analysisChess.undo());
             const form = document.querySelector('#analysis-form');
             form.querySelector('input[name="csrfmiddlewaretoken"]').value = getCookie("csrftoken");
             form.querySelector('#analysis-fen').value = analysisChess.fen();
             form.querySelector('#analysis-pgn').value = chess.pgn();
             console.log(form.querySelector('#analysis-pgn').value)
             form.action = `/analysis/`;
             form.submit();
           }} onMouseOver={whitenChild} onMouseOut={unwhitenChild}
           style={{display: endType ? 'block' : 'none'}}>
        <form method='POST' id='analysis-form' style={{display: 'none'}}>
          <input type="hidden" name="csrfmiddlewaretoken"/>
          <input type='text' id='analysis-fen' name='fen'/>
          <input type='text' id='analysis-pgn' name='pgn'/>
        </form>
        <img alt='go to starting position'
             src='/static/assets/microscope.svg'/>
      </div>
    </div>
  )

  return (
    <div className='moves-container'>
      {movesButtons}
      <div className='container-fluid' id='moves'>
        {parsedHistory.map((elem, i) => {
          return (
            <div className='row m-0 flex-nowrap'>
              <div className='col-2 move-number'>{elem.turnNumber}</div>
              {elem.moves.map((move, j) => <div
                className={`col-5 move ${selectedMove === 2 * i + j ? 'move-selected' : ''}`}
                onClick={() => rewindChess(2 * i + j)}>{move.move}</div>)}
            </div>
          )
        })}
      </div>
    </div>
  )
}