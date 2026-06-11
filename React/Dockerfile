# ── ÉTAPE 1 : Construire le React ──
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# ── ÉTAPE 2 : Servir avec Nginx ──
FROM nginx:alpine

# Copier le build dans Nginx
COPY --from=builder /app/build /usr/share/nginx/html

# Config Nginx pour React Router
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
