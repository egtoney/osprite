# Use a lightweight NGINX image
FROM nginx:alpine

# Copy all files from the current directory to the web root
COPY ./dist /usr/share/nginx/html

# Expose port 80 (default HTTP port)
EXPOSE 80

# Start NGINX
CMD ["nginx", "-g", "daemon off;"]
