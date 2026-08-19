#!/usr/bin/env node

// Install:
// npm install @grpc/grpc-js@1.1 @grpc/proto-loader@0.5

const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const path = require('path');

// Load .proto file
const protoPath = path.join(__dirname, '../shared/grpc-recipe.proto');

const packageDefinition = protoLoader.loadSync(protoPath);

const recipe = grpc.loadPackageDefinition(packageDefinition).recipe;

const HOST = process.env.HOST || '127.0.0.1';
const PORT = process.env.PORT || 4000;

const server = new grpc.Server();

server.addService(recipe.RecipeService.service, {
  getMetaData: (_call, callback) => {
    callback(null, {
      pid: process.pid,
    });
  },

  getRecipe: (call, callback) => {
    const { id } = call.request;

    if (id !== 42) {
      return callback(new Error(`unknown recipe ${id}`));
    }

    callback(null, {
      id: 42,
      name: 'Chicken Tikka Masala',
      steps: 'Throw it in a pot...',
      ingredients: [
        {
          id: 1,
          name: 'Chicken',
          quantity: '1 lb',
        },
        {
          id: 2,
          name: 'Sauce',
          quantity: '2 cups',
        },
      ],
    });
  },
});

// Start gRPC server
server.bindAsync(
  `${HOST}:${PORT}`,
  grpc.ServerCredentials.createInsecure(),
  (err, port) => {
    if (err) {
      console.error('Failed to start gRPC server:', err);
      process.exit(1);
    }

    console.log(`Producer running at ${HOST}:${port}`);

    server.start();
  }
);