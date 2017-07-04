// Can be used to continously ping the clients so they don't DC
module.exports = class Pinger {
  constructor (connectionManager) {
    this.connectionManager = connectionManager;
    this.running = false;
  }

  start (interval) {
    this.running = true;
    this.tick(interval);
  }

  stop () {
    this.running = false;
  }

  tick (interval = 5000) {
    let pinger = this;
    (function () {
      if (pinger.running === false) {
        return;
      }
      setTimeout(function(){
        if (pinger.running === false) {
          return;
        }
        pinger.connectionManager.emit({ ping: new Date().getTime() });
        pinger.tick(interval);
      }, interval)
    }).call(pinger);
  }

  isPinging () {
    return false;
  }
}
