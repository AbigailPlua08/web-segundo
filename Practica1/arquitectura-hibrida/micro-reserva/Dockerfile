FROM node:20-alpine

WORKDIR /app

COPY package.json ./
COPY shared/package.json ./shared/
COPY api-gateway/package.json ./api-gateway/
COPY micro-tour/package.json ./micro-tour/
COPY micro-reserva/package.json ./micro-reserva/

RUN npm install

COPY . .

RUN npm run build --workspaces

EXPOSE 3002
CMD ["node", "micro-reserva/dist/main.js"]
