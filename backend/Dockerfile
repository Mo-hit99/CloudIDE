# Backend Dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN apk update && apk upgrade && npm install \
	&& npm audit fix --force
COPY . .
EXPOSE 5000
CMD ["node", "index.js"] 