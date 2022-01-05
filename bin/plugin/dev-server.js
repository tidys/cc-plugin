"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_1 = __importDefault(require("http"));
const express_1 = __importDefault(require("express"));
const net_1 = __importDefault(require("net"));
class DevServer {
    constructor(port) {
        this.clients = [];
        this.app = express_1.default();
        this.httpServer = this.createHttpServer();
        this.createSocketServer();
        // this.listen(port)
    }
    createSocketServer() {
        const port = 2346;
        let server = net_1.default.createServer((socket) => {
            console.log('has client connection');
            socket.write('hello');
            socket.on('data', data => {
                console.log('data', data.toString());
            });
            socket.on("close", data => {
                const index = this.clients.findIndex(el => el === socket);
                this.clients.splice(index, 1);
                console.log('client close');
            });
            this.clients.push(socket);
        });
        server.on('listening', () => {
            this.clients = [];
            console.log(`websocket server running: ${port}`);
        });
        server.on('error', () => {
            this.clients = [];
            console.log('websocket server error');
        });
        server.listen(port);
    }
    createHttpServer() {
        return http_1.default.createServer(this.app);
    }
    listen(port) {
        this.httpServer.listen(port, () => {
            console.log('http server running: ', port);
        });
        this.app.get('/index.html', ((req, res, next) => {
            console.log('get');
            res.send('hello');
            next();
        }));
        this.httpServer.on('error', (error) => {
            console.log('server error', error);
        });
    }
    apply(compiler) {
        this.app.use(express_1.default.static(compiler.options.output.path));
        compiler.hooks.done.tap('cc-plugin', (stats) => {
            console.log('cc-plugin done');
            // 通知插件刷新
            this.clients.forEach(client => {
                client.write('reload');
            });
        });
    }
}
exports.default = DevServer;
