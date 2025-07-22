# Etapa 1: Build de la app Angular SSR
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Compila SSR (cliente + servidor)
RUN npm run build:ssr

# Etapa 2: Servidor de producción con Node.js
FROM node:20-alpine

WORKDIR /app

COPY --from=builder /app/dist/PlataformaHotelFrontend/browser ./browser
COPY --from=builder /app/dist/PlataformaHotelFrontend/server ./server
COPY --from=builder /app/package*.json ./

RUN npm install --only=production

# Expone el puerto donde correrá la app SSR
EXPOSE 4000

# Comando para ejecutar el servidor SSR
CMD ["node", "server/main.js"]