# Stage 1: Build the Vite app
FROM node:20-alpine AS build
WORKDIR /app

ARG VITE_API_BASE
ARG VITE_PUBLIC_BASE_URL

ENV VITE_API_BASE=${VITE_API_BASE}
ENV VITE_PUBLIC_BASE_URL=${VITE_PUBLIC_BASE_URL}

COPY client/package*.json ./
RUN npm ci || npm i

COPY client/. ./
RUN npm run build

# Stage 2: Serve with Nginx
FROM nginx:1.27-alpine

COPY client/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
