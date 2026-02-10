FROM node:18-slim

# Instalamos las dependencias nativas para Sharp, GraphicsMagick y Ghostscript
RUN apt-get update && apt-get install -y \
    python3 \
    make \
    g++ \
    libvips-dev \
    graphicsmagick \
    ghostscript \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /usr/src/app

COPY package*.json ./

# Instalamos dependencias (Sharp se compilará para Linux aquí)
RUN npm install

COPY . .

# Exponemos el puerto
EXPOSE 8080

# Comando de arranque
CMD [ "node", "src/app.js" ]