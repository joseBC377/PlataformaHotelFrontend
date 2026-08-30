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

# Comando temporal para listar las carpetas de dist y descubrir la ruta real
CMD sh -c "echo '=== CONTENIDO DE /app/dist ===' && ls -R dist && node $(find dist -name main.js | head -n 1)"