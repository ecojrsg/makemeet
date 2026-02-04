# ============================================
# ETAPA 1: Construcción (Build)
# ============================================
FROM node:20-alpine AS builder

WORKDIR /app

# 1. Instalar dependencias primero para aprovechar el cache de capas de Docker
COPY package*.json ./
COPY bun.lockb ./ 
RUN npm install

# 2. Copiar el resto del código
COPY . .

# (Eliminado) Ya no necesitamos ARGs ni ENVs aquí para Vite

# 3. Compilar la aplicación (esto genera la carpeta /dist)
RUN npm run build

# ============================================
# ETAPA 2: Producción (Nginx)
# ============================================
FROM nginx:alpine AS production

# 4. Copiar tu configuración personalizada de Nginx
COPY nginx.conf /etc/nginx/nginx.conf

# 5. Limpiar el directorio por defecto de Nginx y copiar los archivos compilados
RUN rm -rf /usr/share/nginx/html/*
COPY --from=builder /app/dist /usr/share/nginx/html

# 6. Copiar el script de entrypoint y darle permisos
COPY entrypoint.sh /docker-entrypoint.d/40-env-config.sh
RUN chmod +x /docker-entrypoint.d/40-env-config.sh

# 7. Exponer el puerto 80 del contenedor
EXPOSE 80

# 8. Iniciar Nginx (El entrypoint por defecto de la imagen nginx maneja scripts en /docker-entrypoint.d/)
CMD ["nginx", "-g", "daemon off;"]
