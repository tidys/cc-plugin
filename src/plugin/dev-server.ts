import webpack from 'webpack';
import http from 'http'
import * as  core from 'express-serve-static-core'
import express from 'express'
import PortFinder from 'portfinder';
import net from 'net'

export default class DevServer {
    app: core.Express;
    httpServer: http.Server;
    clients: net.Socket[] = [];

    constructor(port: number) {
        this.app = express();
        this.httpServer = this.createHttpServer();
        this.createSocketServer(port);
        // this.listen(port)
    }

    createSocketServer(port: number) {
        let server = net.createServer((socket) => {
            console.log('has client connection')
            socket.write('hello client ')
            socket.on('data', data => {
                console.log('data', data.toString())
            })
            socket.on("close", data => {
                console.log('client close')
                const index = this.clients.findIndex(el => el === socket)
                if (index !== -1) {
                    this.clients = this.clients.splice(index, 1);
                }
            })
            this.clients.push(socket)
        })

        server.on('listening', () => {
            this.clients = [];
            console.log(`websocket server running: ${port}`)
        })
        server.on('error', () => {
            this.clients = [];
            console.log('websocket server error')
        })
        server.listen(port);
    }

    createHttpServer() {
        return http.createServer(this.app);
    }

    listen(port: number) {
        this.httpServer.listen(port, () => {
            console.log('http server running: ', port)
        })

        this.app.get('/index.html', ((req, res, next) => {
            console.log('get')
            res.send('hello');
            next();
        }))
        this.httpServer.on('error', (error) => {
            console.log('server error', error)
        })
    }

    apply(compiler: webpack.Compiler) {
        this.app.use(express.static(compiler.options.output.path! as string))
        compiler.hooks.done.tap('cc-plugin', (stats) => {
            console.log('cc-plugin done')
            // 通知插件刷新
            this.clients.forEach(client => {
                client.write('reload');
            })
        })
    }
}
