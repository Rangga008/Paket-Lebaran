# Base image
FROM node:18

# Working dir
WORKDIR /app

# Copy ONLY package.json dan lock file dulu
COPY package*.json ./

# Install deps (di dalam Docker, biar node_modules cocok)
RUN npm install

# Copy sisa source code
COPY . .

# Generate Prisma client setelah source dicopy
RUN npx prisma generate

# Optional: Seed dulu kalau kamu butuh
RUN npm run seed

# Expose port
EXPOSE 3001

# Start pakai command (bukan entrypoint, biar lebih gampang debug)
CMD ["npm", "start"]
