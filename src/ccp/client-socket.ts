import { Socket } from 'net';

export default class ClientSocket {
    private client: Socket;
    private isConn = false;
    private reloadCallback: Function | null = null;

    constructor() {
        const client = new Socket();

        client.on('data', (data) => {
            const msg = data.toString();
            console.log(msg);
            this.onMessage(msg)
        });
        client.on('close', () => {
            this.isConn = false;
            console.log('server closed')
        })
        client.on('error', (a) => {
            this.isConn = false;
            console.error('server error', a)
        })
        this.client = client;
    }

    setReloadCallback(cb: Function) {
        this.reloadCallback = cb;
    }

    private onMessage(data: string) {
        if (data === 'reload') {
            this.client.end(() => {
                this.reloadCallback && this.reloadCallback();
            });
        }
    }

    connect(port: number) {
        const { client } = this;
        client.connect(port, '127.0.0.1', () => {
            console.log('connect websocket server')
            this.isConn = true;
            this.send('ping')
        })
    }

    send(data: string) {
        if (this.client && this.isConn) {
            this.client.write(data)
        }
    }
}
