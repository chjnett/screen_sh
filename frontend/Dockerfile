
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

# Install dependencies including the specific spline package
RUN npm install

# Rebuild modules to ensure architecture compatibility
RUN npm rebuild

COPY . .

# Ensure next.config.mjs is used
ENV NEXT_CONFIG_NAME=next.config.mjs

EXPOSE 3000

# Start in development mode with hot reloading
CMD ["npm", "run", "dev"]
