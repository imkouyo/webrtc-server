const express = require('express');
const app = express();
const http = require('http');
const url = require('url');
const cors = require('cors');
app.use(cors());
const server = http.createServer(app);
const WebSocket = require('ws');
const wss = new WebSocket.Server({noServer: true});

let roomInfo = [];
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
        if( data.type === 'init-broadcast') {
            streamList.push(data);
        }
        // console.log(data, 'data123');
        if (!ws.id) {
            ws.id = data.id;
        }
        wss.clients.forEach((client) => {
            if(client.id !== data.id) {
                console.log('senddata', client.id);
                client.send(JSON.stringify(data));
            }
        });
    });

});
server.on('upgrade', function upgrade(request, socket, head) {
    const pathname = url.parse(request.url).pathname;
    if(pathname === '/temp') {
        wss.handleUpgrade(request, socket, head, function done(ws){
            wss.emit('connection',ws, request)
        });
    }
});


app.get('/stream-list', (require, response) => {
    console.log('get-list');
    response.send(JSON.stringify(streamList));
});

server.listen(3000, () => console.log('server set up in port 3000'));
