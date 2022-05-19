import React, {useRef} from "react";
import PropTypes from "prop-types";

export default function Square({ orientation, children, coord: [row, col], coordinates, lastMove }) {
  const targetRef = useRef();
  const colNames = 'abcdefgh'
  const rowNames = '87654321'
  const colName = (orientation === 'w' && col === 0) || (orientation === 'b' && col === 7) ? <span className='coord coord-row noselect'>{rowNames[row]}</span> : '';
  const rowName = (orientation === 'w' && row === 7) || (orientation === 'b' && row === 0) ? <span className='coord coord-col noselect'>{colNames[col]}</span> : '';
  const squareColor = (row + col) % 2 ? ' dark' : ' light';
  const squareClassName = `square${squareColor}${lastMove ? ' last-move' : ''}${row !== undefined ? ` coord-${colNames[col]}${8 - row}` : ' generator'}`;

  return (
    <div ref={targetRef} className={squareClassName} role="button" tabIndex="0">
      {children}
      {coordinates ? colName : ''}
      <div className='possible-move' />
      {coordinates ? rowName : ''}
    </div>
  );
}
Square.propTypes = {
  orientation: PropTypes.oneOf(['w', 'b']),
  coord: PropTypes.array,
};
Square.defaultProps = {
  coord: [undefined, undefined],
  orientation: 'w',
};
