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

COPY --from=build /app/dist ./dist
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package.json ./package.json

EXPOSE 4000

# Lista el contenido de dist para depurar y ejecuta main.js dinámicamente
CMD ["sh", "-c", "echo '--- CONTENIDO DE DIST ---' && ls -R dist && node $(find dist -name main.js | head -n 1)"]