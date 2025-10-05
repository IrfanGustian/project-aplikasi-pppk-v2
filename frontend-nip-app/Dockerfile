# Tahap Build
FROM node:22-alpine AS build

WORKDIR /app

# ...
COPY package*.json ./

# Install dependensi
RUN npm install

# Jalankan audit fix untuk memperbaiki paket yang bermasalah
RUN npm audit fix

COPY . .

# DEBUG: List the contents of the src directory to ensure files are copied correctly
RUN ls -lR /app/src

# Jalankan build (sekarang seharusnya berhasil)
RUN npm run build

# Tahap Serve dengan Nginx
FROM nginx:stable-alpine

# Hapus konfigurasi default Nginx
RUN rm /etc/nginx/conf.d/default.conf

# Copy konfigurasi Nginx kustom
COPY nginx/nginx.conf /etc/nginx/conf.d/default.conf

# Copy hasil build Vite ke direktori Nginx
COPY --from=build /app/dist /usr/share/nginx/html 

# Vite output to 'dist'

# Expose port 80 untuk Nginx
EXPOSE 80

# Jalankan Nginx saat container dimulai
CMD ["nginx", "-g", "daemon off;"]



