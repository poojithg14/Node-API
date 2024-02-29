const http = require('http');
const querystring = require('querystring');

const port = process.env.PORT || 3000;

const path = require('path');

const express = require('express');
const app = express();
app.use(express.static(__dirname + '/public'));

const EventEmitter = require('events');
const chatEmitter = new EventEmitter();

app.get('/', chatApp);
app.get('/json', respondJson);
app.get('/echo', respondEcho);
app.get('/chat', respondChat);
app.get('/sse', respondSSE);

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});

function respondSSE(req, res) {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Connection': 'keep-alive',
  });

  const onMessage = message => res.write(`data: ${message}\n\n`);
  chatEmitter.on('message', onMessage);

  res.on('close', () => {
    chatEmitter.off('message', onMessage);
  });
}

function chatApp(req, res) {
  res.sendFile(path.join(__dirname, '/chat.html'));
}

function respondChat(req, res) {
  const { message } = req.query;

  chatEmitter.emit('message', message);
  res.end();
}
function respondText(req, res) {
  res.setHeader('Content-Type', 'text/plain');
  res.end('hi');
}

function respondJson(req, res) {
  res.json({
    text: 'hi',
    numbers: [1, 2, 3],
  });
}

function respondNotFound(req, res) {
  res.writeHead(404, { 'Content-Type': 'text/plain' });
  res.end('Not Found');
}

function respondEcho(req, res) {
  const { input = '' } = req.query;

  res.json({
    normal: input,
    shouty: input.toUpperCase(),
    charCount: input.length,
    backwards: input.split('').reverse().join(''),
  });
}