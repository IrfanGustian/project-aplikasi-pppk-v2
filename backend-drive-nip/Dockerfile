# Gunakan image Node.js versi terbaru LTS (misal: 22-alpine)
FROM node:22-alpine

# Set working directory di dalam container
WORKDIR /app

# Copy package.json dan package-lock.json
COPY package*.json ./

# Install dependensi. Docker akan men-cache langkah ini jika package*.json tidak berubah.
RUN npm install

# Copy sisa kode aplikasi setelah dependensi terinstal
COPY . .

# Expose port yang digunakan aplikasi
EXPOSE 5000 

# Command untuk menjalankan aplikasi
CMD [ "npm", "run", "dev" ]