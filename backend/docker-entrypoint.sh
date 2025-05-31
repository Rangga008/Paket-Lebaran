#!/bin/sh
# Run database seed then start the server

echo "Running database seed..."
npm run seed

echo "Starting backend server..."
npm start
