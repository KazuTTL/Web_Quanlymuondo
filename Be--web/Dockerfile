FROM node:20-alpine

WORKDIR /app

COPY package.json ./

# Install dependencies (including devDependencies needed for babel build)
RUN npm install

COPY . .

# Remove package-lock.json to avoid integrity issues on prune
RUN rm -f package-lock.json

# Build the project
RUN npm run build

# Prune dev dependencies to make image smaller
RUN npm prune --production

EXPOSE 3456

ENV NODE_ENV=production

CMD ["node", "build/main.js"]
