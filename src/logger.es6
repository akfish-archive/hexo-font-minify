const mt = require('microtime');

export default class NamedLogger {
  constructor(logger, name) {
    [
      "log",
      "info",
      "error",
      "warn",
      "debug"
    ].forEach((t) => {
      this[t] = (...args) => logger[t](`[${name}]`, ...args);
    })
    this._timers = {};
  }
  begin(task, level = 'info') {
    let start = mt.now();
    this._timers[task] = { start, level };
    this[level](`Start '${task}'`);
  }
  end(task) {
    let { start, level } = this._timers[task],
      eplase = (mt.now() - start) / 1000 / 1000;
    this[level](`Complete '${task}' in ${eplase}s`);
  }
}
