# Use official Node.js LTS image for build stage
FROM node:18 as build

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy all frontend source files
COPY . .

# Build the React app
RUN npm run build

# Use nginx to serve the build folder
FROM nginx:alpine

# Copy built files from build stage
COPY --from=build /app/build /usr/share/nginx/html

# Expose port 3000
EXPOSE 80

# Start nginx server
CMD ["nginx", "-g", "daemon off;"]
