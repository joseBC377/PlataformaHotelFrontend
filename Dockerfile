# Etapa 1: Build de la aplicación Angular SSR
FROM node:22-alpine AS build
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build:ssr

# Etapa 2: Servidor Node.js para ejecutar Angular SSR
FROM node:22-alpine AS runner
WORKDIR /app

COPY --from=build /app/dist /app/dist
COPY --from=build /app/package*.json ./

# Exponer el puerto por defecto de SSR (4000)
EXPOSE 4000

# Comando para iniciar el servidor Angular SSR
CMD ["node", "dist/plataforma-hotel-frontend/server/main.js"]