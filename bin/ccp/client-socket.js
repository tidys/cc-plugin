"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const net_1 = require("net");
class ClientSocket {
    constructor() {
        this.isConn = false;
        this.reloadCallback = null;
        const client = new net_1.Socket();
        client.on('data', (data) => {
            const msg = data.toString();
            console.log(msg);
            this.onMessage(msg);
        });
        client.on('close', () => {
            this.isConn = false;
            console.log('server closed');
        });
        client.on('error', (a) => {
            this.isConn = false;
            console.error('server error', a);
        });
        this.client = client;
    }
    setReloadCallback(cb) {
        this.reloadCallback = cb;
    }
    onMessage(data) {
        if (data === 'reload') {
            this.client.end(() => {
                this.reloadCallback && this.reloadCallback();
            });
        }
    }
    connect(port) {
        const { client } = this;
        client.connect(port, '127.0.0.1', () => {
            console.log('connect websocket server');
            this.isConn = true;
            this.send('ping');
        });
    }
    send(data) {
        if (this.client && this.isConn) {
            this.client.write(data);
        }
    }
}
exports.default = ClientSocket;
