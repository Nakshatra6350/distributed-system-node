#!/usr/bin/env node

// Install:
// npm install @grpc/grpc-js@1.1 @grpc/proto-loader@0.5 fastify@3.2

const util = require('util');
const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const fastify = require('fastify');

const server = fastify();

const protoPath = __dirname + '/../shared/grpc-recipe.proto';

const packageDefinition = protoLoader.loadSync(protoPath);
const recipe = grpc.loadPackageDefinition(packageDefinition).recipe;

const HOST = '127.0.0.1';
const PORT = process.env.PORT || 3000;
const TARGET = process.env.TARGET || 'localhost:4000';

// Create gRPC client
const client = new recipe.RecipeService(
  TARGET,
  grpc.credentials.createInsecure()
);

// Convert callback-based gRPC methods into Promises
const getMetaData = util.promisify(
  client.getMetaData.bind(client)
);

const getRecipe = util.promisify(
  client.getRecipe.bind(client)
);

// HTTP API
server.get('/', async () => {
  const [meta, recipeData] = await Promise.all([
    getMetaData({}),
    getRecipe({ id: 42 }),
  ]);

  return {
    consumer_pid: process.pid,
    producer_data: meta,
    recipe: recipeData,
  };
});

// Start HTTP server
server.listen(PORT, HOST, (err, address) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }

  console.log(`Consumer running at ${address}`);
});