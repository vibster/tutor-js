const { bind } = require('lodash');
const path = require('path');
var fork = require('child_process').fork;

const SERVERS = ['backend', 'frontend'];

class Server {

  constructor({
    role = 'teacher',
    ports = { frontend: 8111, backend: 8122 }
  } = {}) {
    this.role = role;
    this.ports = ports;
    this.pending = {};
  }

  boot() {
    return this._booting = Promise.all(SERVERS.map((server) =>
      new Promise((resolve, reject) => {
        this.pending[server] = { resolve, reject };
        this[server] = fork(
          path.join(__dirname, `./server/${server}.js`),
          [this.ports.frontend, this.ports.backend], {},
        );
        this[server].on('message', bind(this._onMessage, this, server));
        this[server].on('close', bind(this._onServerExit, this, server));
      })
    )).then(() => {
      delete this._booting;
      this.setRole(this.role);
      return this;
    });
  }

  _onMessage(server, msg) {
    if (msg.READY) { this.pending[server].resolve(); }
    if (msg.FAILED) { this.pending[server].reject(); }
  }

  _onServerExit(server, status) {
    this.pending[server].resolve(status);
  }

  setRole(role) {
    this.role = role;
    return Promise.all(SERVERS.map((server) =>
      new Promise((resolve) => this[server].send({ role }, resolve))
    ));
  }

  ready() {
    return this._booting || Promise.resolve(this);
  }

  halt() {
    return Promise.all(SERVERS.map((server) =>
      new Promise((resolve) => {
        if (this[server]) {
          this[server].on('close', resolve);
          this[server].kill('SIGINT');
        } else {
          resolve();
        }
      })
    ));
  }

  get url() {
    return `http://localhost:${this.ports.frontend}`;
  }

}


if (require.main === module) {
  const server = new Server();
  server.boot();
} else {
  module.exports = Server;
}
