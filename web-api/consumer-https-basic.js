#!/usr/bin/env node

const fs = require('fs');
const https = require('https');
const server = require('fastify')();
const fetch = require('node-fetch');

const HOST = process.env.HOST || '127.0.0.1';
const PORT = Number(process.env.PORT) || 3000;
const TARGET = process.env.TARGET || 'localhost:4000';

const options = {
    agent: new https.Agent({
        ca: fs.readFileSync(
            __dirname + '/../shared/tls/ca-certificate.cert'
        ),
    })
};

server.get('/', async () => {
    const req = await fetch(
        `https://${TARGET}/recipes/42`,
        options
    );

    const producer_data = await req.json();

    return {
        consumer_pid: process.pid,
        producer_data
    };
});

server.listen({ port: PORT, host: HOST }, (err, address) => {
    if (err) {
        console.error(err);
        process.exit(1);
    }

    console.log(`Consumer running at ${address}/`);
});