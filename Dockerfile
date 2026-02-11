FROM node:18-slim AS builder

RUN apt-get update && apt-get install -y \
    python3 \
    make \
    g++ \
    libvips-dev \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install

FROM node:18-slim

RUN apt-get update && apt-get install -y \
    libvips \
    graphicsmagick \
    ghostscript \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /usr/src/app

COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY . .

EXPOSE 8080

CMD [ "node", "src/app.js" ]