# 1. Use Node official image
FROM node:18

# 2. Set working directory inside container
WORKDIR /app

# 3. Copy package.json and package-lock.json first
COPY package*.json ./

# 4. Install only production dependencies
RUN npm install --omit=dev

# 5. Copy all backend code
COPY . .

# 6. Expose backend port
EXPOSE 4000

# 7. Start the server
CMD ["node", "server.js"]