FROM node:20-alpine

RUN apk add --no-cache openssl


WORKDIR /app

COPY package*.json ./
RUN npm install

COPY prisma ./prisma/
RUN npx prisma generate

COPY . .
RUN npm run build

EXPOSE 5000

# We use shell form to run migrations then start
CMD ["sh", "-c", "npx prisma db push && npm start"]
