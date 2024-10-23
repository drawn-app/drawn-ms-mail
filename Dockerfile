# Stage 1: Build the application
FROM node:20.11.0-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# Stage 2: Run the application
FROM node:20.11.0-alpine AS prod

WORKDIR /app

COPY package*.json ./
RUN npm install --only=production

COPY --from=build /app/dist/ /app/dist/
COPY --from=build /app/.env /app/

CMD ["npm", "run", "start"]
