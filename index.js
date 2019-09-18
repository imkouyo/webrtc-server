const express = require('express');
const app = express();
const http = require('http');

const server = http.createServer(app);
const WebSocket = require('ws');
const wss = new WebSocket.Server({ server });



wss.on('connection', (ws) => {
    console.log("some one add in");
    ws.on('open', function open() {
        ws.send('send something');
    });

    ws.on('message', function incoming(data) {
        wss.clients.forEach(function each(client) {
            if (client.readyState === WebSocket.OPEN) {
                client.send(data);
            }
        });
    })

});
server.listen(3000, () => console.log('server set up in port 3000'));

