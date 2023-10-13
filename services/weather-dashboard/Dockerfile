# Use an official Node.js runtime on Alpine Linux as a parent image
FROM node:14-alpine

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json to the container
COPY package*.json ./

# Install application dependencies
RUN npm install

# Copy the rest of your application code to the container
COPY . .

# Command to start your Node.js application
CMD [ "node", "app.js" ]
