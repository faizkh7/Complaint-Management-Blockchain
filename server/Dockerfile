# Use a Node.js base image
FROM node:alpine

# Set working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy Prisma schema and other necessary files
COPY prisma ./prisma
COPY .env ./

# Generate Prisma client
RUN npx prisma migrate dev --name init

# Copy the rest of the application code
COPY . .

# Expose the port that your app runs on
EXPOSE 5000

# Command to run the Prisma server
CMD ["npm", "start"]
