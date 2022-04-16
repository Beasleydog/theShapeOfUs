console.log("Server starting...");
const express = require('express');
var SSE = require('express-sse');
const compression = require('compression')
const sse = new SSE([])

var app = express();
var http = require('http').createServer(app);
app.use(express.static(__dirname + '/public'));
app.use(express.json());
app.use(compression());
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

let games = [];

app.get('/stream', sse.init);

app.post('/updateData', (req, res) => {
    sse.send(req.body);
    res.sendStatus(200)
});

app.post('/hostGame', (req, res) => {
    games.push(req.body.gameCode);
    res.sendStatus(200);
});

app.post('/joinGame', (req, res) => {
    if (games.includes(req.body.gameCode)) {
        //The host client knows the game code, this user has joined and their client knows the game code, remove the game code from the list so nobody else can join
        games.splice(games.indexOf(req.body.gameCode), 1);
        res.send("good");
    } else {
        res.send("bad");
    }
});

http.listen(3000, () => {
    console.log('listening on *:3000');
});