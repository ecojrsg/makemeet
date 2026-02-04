#!/bin/sh

# Crea el archivo de configuración JS
cat <<EOF > /usr/share/nginx/html/env-config.js
window.env = {
  VITE_SUPABASE_URL: "${VITE_SUPABASE_URL}",
  VITE_SUPABASE_PUBLISHABLE_KEY: "${VITE_SUPABASE_PUBLISHABLE_KEY}",
  VITE_SUPABASE_PROJECT_ID: "${VITE_SUPABASE_PROJECT_ID}",
  VITE_AUTH_PROVIDERS: "${VITE_AUTH_PROVIDERS}"
};
EOF

