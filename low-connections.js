#!/usr/bin/env node
const http = require('http');

const server = http.createServer((req, res) => {
  console.log('current conn:', server._connections);
  setTimeout(() => res.end('OK\n'), 5000);
});

server.maxConnections = 2;
server.listen(3020, '0.0.0.0');