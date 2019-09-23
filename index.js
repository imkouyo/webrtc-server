const express = require('express');
const app = express();
const http = require('http');
const url = require('url');
const cors = require('cors');
app.use(cors());
const server = http.createServer(app);
const WebSocket = require('ws');
const wss = new WebSocket.Server({noServer: true});

let broadcaster;
let streamList = [];

wss.getUniqueID = function () {
    function s4() {
        return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
    }
    return s4() + s4() + '-' + s4();
};



wss.on('connection', (ws) => {
    console.log('some one join');
    ws.on('message', function incoming(data) {
        data = JSON.parse(data);
        if (!ws.id) {
            ws.id = data.id;
        }
        switch (data.type) {
            case 'init-broadcast':
                broadcaster = data.id;
                streamList.push(data);
                wss.clients.forEach(client => {
                    if (client.id === broadcaster) {
                        client.send(JSON.stringify(data));
                    }
                });
                break;
            case 'request-offer':

                wss.clients.forEach(client => {
                    console.log(broadcaster, client.id, 'id check');
                    if (client.id === broadcaster) {
                        console.log('send');
                        client.send(JSON.stringify(data));
                    }
                });
                break;
            case 'send-offer':
                wss.clients.forEach(client => {
                    if (client.id !== broadcaster) {
                        client.send(JSON.stringify(data));
                    }
                });
                break;
            case 'send-answer':
                wss.clients.forEach(client => {
                    if (client.id === broadcaster) {
                        client.send(JSON.stringify(data));
                    }
                });
                break;
            case 'icecandidate-state':
                wss.clients.forEach(client => {
                    if (client.id !== data.id) {
                        if (!!data.data) {
                            client.send(JSON.stringify(data));
                        }
                    }
                });
                break;
        }
    });
});

server.on('upgrade', function upgrade(request, socket, head) {
    const pathname = url.parse(request.url).pathname;
    if(pathname === '/temp') {
        wss.handleUpgrade(request, socket, head, function done(ws){
            wss.emit('connection',ws, request)
        });
    } else if(pathname === '/stream-list') {
        app.get('/stream-list', (request, response) => {
            response.send(JSON.stringify(streamList));
        })
    }
});


app.get('/stream-list', (require, response) => {
    console.log('get-list');
    response.send(JSON.stringify(streamList));
});

server.listen(3000, () => console.log('server set up in port 3000'));
