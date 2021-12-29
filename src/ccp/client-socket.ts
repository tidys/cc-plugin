import {Socket} from 'net';

export default class ClientSocket {
    private client: Socket;
    private isConn = false;

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

    private onMessage(data: string) {

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
