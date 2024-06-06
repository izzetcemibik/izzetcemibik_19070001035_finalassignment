# Use the official Node.js image.
# https://hub.docker.com/_/node
FROM node:20

# Create and change to the app directory.
WORKDIR /usr/src/app

# Copy application dependency manifests to the container image.
COPY package*.json ./

# Install dependencies.
RUN npm install

# Copy local code to the container image.
COPY . .

# Open port 8080 to the outside world
EXPOSE 8080

# Run the web service on container startup.
CMD [ "nodemon", "app.js" ]
