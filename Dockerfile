# Etapa 1: Build de la aplicación Angular
FROM node:22-alpine AS build
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Etapa 2: Servidor Node.js para ejecutar Angular SSR
FROM node:22-alpine AS runner
WORKDIR /app

COPY --from=build /app/dist /app/dist
COPY --from=build /app/package*.json ./

EXPOSE 4000

# Busca dinámicamente el archivo main.js dentro de dist y lo ejecuta sin importar mayúsculas
CMD ["node", "dist/plataforma-hotel-frontend/server/main.js"]