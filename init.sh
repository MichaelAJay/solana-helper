#!/bin/bash

# Install npm dependencies
npm install

# Remove the prisma directory if it exists
rm -rf prisma

# Initialize Prisma with SQLite as the datasource provider
npx prisma init --datasource-provider sqlite

# Start Docker containers in detached mode
docker compose up -d