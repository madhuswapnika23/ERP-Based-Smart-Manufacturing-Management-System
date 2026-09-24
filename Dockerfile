FROM node:18-alpine

WORKDIR /app

# Copy root and package files
COPY package*.json ./
COPY backend/package*.json ./backend/
COPY frontend/package*.json ./frontend/

# Install dependencies
RUN npm run postinstall

# Copy app source code
COPY . .

# Build frontend
RUN npm run build

# Expose port
EXPOSE 5000

ENV NODE_ENV=production
ENV PORT=5000

CMD ["npm", "start"]
