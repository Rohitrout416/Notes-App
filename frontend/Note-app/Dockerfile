# /Users/rohitkumarrout/Desktop/notes app/frontend/Note-app/Dockerfile

# Stage 1: Build the React application
FROM node:20-alpine AS build

WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Pass the API URL arg during build
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

# Build the app for production (Vite outputs to /dist)
RUN npm run build

# Stage 2: Serve the application with Nginx
FROM nginx:alpine

# Copy the built assets from the previous stage to Nginx's web root
COPY --from=build /app/dist /usr/share/nginx/html

# Copy custom Nginx config as a TEMPLATE (contains ${VITE_API_URL} placeholder)
COPY nginx.conf /etc/nginx/templates/default.conf.template

# Expose port 80
EXPOSE 80

# nginx:alpine auto-runs envsubst on /etc/nginx/templates/*.template at startup,
# outputting the result to /etc/nginx/conf.d/, reading VITE_API_URL from the environment.
# This means we can update the backend URL via ECS env var without rebuilding the image!
CMD ["nginx", "-g", "daemon off;"]
