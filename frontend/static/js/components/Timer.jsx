import React from 'react';
import PropTypes from "prop-types";
import AdjustingInterval from "../misc/timer.js";

export default function Timer({ time, setTime, running }) {
  const [stop, setStop] = React.useState(false);
  const [timeFormat, setTimeFormat] = React.useState();
  const update = () => {
    const secondsLeft = ticker.time - (Date.now() - ticker.start_ts) / 1000;
    setTime(secondsLeft < 0 ? 0.000000001 : secondsLeft)
  }
  const [ticker, setTicker] = React.useState(new AdjustingInterval(update, 100, () => {}));

  if (running) {!stop && !ticker.running && ticker.start()}
  if (!running) {ticker.stop()}
  stop && ticker.stop()

  React.useEffect(() => {
    if (time === 0) {
      const newTicker = {...ticker};
      newTicker.stop();
      setStop(true);
      setTicker(newTicker);
    }
    const secondsLeft = time;
    const deciseconds = Math.floor((secondsLeft % 1) * 10);
    const date = new Date(0);
    date.setSeconds(secondsLeft < 0 ? 0 : secondsLeft); // specify value for SECONDS here
    const timeString = date.toISOString().substr(secondsLeft >= 3600 ? 11 : 14, secondsLeft >= 3600 ? 8 : 5) + (0.000000001 < secondsLeft && secondsLeft < 10 ? '.' + deciseconds.toString() : '');
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
