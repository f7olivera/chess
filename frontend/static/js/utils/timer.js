/**
 * Self-adjusting interval to account for drifting
 *
 * @param {function} workFunc  Callback containing the work to be done
 *                             for each interval
 * @param {int}      interval  Interval speed (in milliseconds)
 * @param {function} errorFunc (Optional) Callback to run if the drift
 *                             exceeds interval
 */
export default function AdjustingInterval(workFunc, interval, errorFunc=() => {}) {
  const that = this;
  let expected, timeout;
  this.interval = interval;
  this.running = false;
  this.start_ts = Date.now();

  this.start = function () {
    this.running = true;
    this.start_ts = Date.now();
    expected = Date.now() + this.interval;
    timeout = setTimeout(step, this.interval);
  }

  this.stop = function () {
    this.running = false;
    clearTimeout(timeout);
    // workFunc();
  }

  function step() {
    const drift = Date.now() - expected;
    if (drift > that.interval) {
      // You could have some default stuff here too...
      if (errorFunc) errorFunc();
    }
    workFunc();
    expected += that.interval;
    timeout = setTimeout(step, Math.max(0, that.interval - drift));
  }
}
