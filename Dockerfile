# Build stage
FROM node:20-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Production stage
FROM node:20-alpine

WORKDIR /app

COPY --from=build /app/dist ./dist
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package*.json ./
COPY --from=build /app/migrations ./migrations
COPY --from=build /app/scripts ./scripts
COPY --from=build /app/data ./data
COPY --from=build /app/src/server ./src/server

RUN chmod +x ./scripts/entrypoint.sh
RUN chmod +x ./scripts/wait-for-it.sh

EXPOSE 3001

CMD ["node", "src/server/simplified-server.js"]