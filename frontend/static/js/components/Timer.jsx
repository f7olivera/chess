import React from 'react';
import PropTypes from "prop-types";
import AdjustingInterval from "../misc/timer.js";

export default function Timer({ time, setTime, running }) {
  const [stop, setStop] = React.useState(false);
  const [timeFormat, setTimeFormat] = React.useState();

  const asd = () => {
    const secondsLeft = ticker.time - (Date.now() - ticker.start_ts) / 1000;
    if (secondsLeft < 0) {
      const newTicker = {...ticker};
      newTicker.stop();
      setTicker(newTicker);
      setStop(true);
      setTime(0);
    } else {
      setTime(secondsLeft);
    }
  }
  const [ticker, setTicker] = React.useState(new AdjustingInterval(asd, 100, () => {}));
  if (running) {!stop && !ticker.running && ticker.start()}
  if (!running) {ticker.stop()}
  stop && ticker.stop()

  React.useEffect(() => {
    const secondsLeft = time;
    const deciseconds = Math.floor((secondsLeft % 1) * 10);
    const date = new Date(0);
    date.setSeconds(secondsLeft < 0 ? 0 : secondsLeft); // specify value for SECONDS here
    const timeString = date.toISOString().substr(secondsLeft >= 3600 ? 11 : 14, secondsLeft >= 3600 ? 8 : 5) + (0 < secondsLeft && secondsLeft < 10 ? '.' + deciseconds.toString() : '');
    setTimeFormat(timeString);
  }, [time])

  React.useEffect(() => {
    ticker.time = time;
  }, [running])

  return (
    <div className='time' data-asd={`${time} ${setTime}`}>{timeFormat}</div>
  );
}
Timer.propTypes = {
  time: PropTypes.number,
  setTime: PropTypes.func,
  running: PropTypes.bool,
};
