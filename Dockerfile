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

# 3. Definir ARGUMENTOS de construcción. 
# Estos valores deben pasarse desde el docker-compose o comando build.
# Son vitales porque Vite los inyecta en el JS durante el build.
ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_PUBLISHABLE_KEY
ARG VITE_SUPABASE_PROJECT_ID
ARG VITE_AUTH_PROVIDERS

# 4. Convertir ARGs en variables de entorno para que el proceso de Node las vea
ENV VITE_SUPABASE_URL=$VITE_SUPABASE_URL
ENV VITE_SUPABASE_PUBLISHABLE_KEY=$VITE_SUPABASE_PUBLISHABLE_KEY
ENV VITE_SUPABASE_PROJECT_ID=$VITE_SUPABASE_PROJECT_ID
ENV VITE_AUTH_PROVIDERS=$VITE_AUTH_PROVIDERS

# 5. Compilar la aplicación (esto genera la carpeta /dist)
RUN npm run build

# ============================================
# ETAPA 2: Producción (Nginx)
# ============================================
FROM nginx:alpine AS production

# 6. Copiar tu configuración personalizada de Nginx
# (Asegúrate de que maneje el ruteo de React/SPA para evitar 404s)
COPY nginx.conf /etc/nginx/nginx.conf

# 7. Limpiar el directorio por defecto de Nginx y copiar los archivos compilados
RUN rm -rf /usr/share/nginx/html/*
COPY --from=builder /app/dist /usr/share/nginx/html

# 8. Exponer el puerto 80 del contenedor
EXPOSE 80

# 9. Iniciar Nginx
CMD ["nginx", "-g", "daemon off;"]
