# Build stage
FROM node:22-alpine AS builder

WORKDIR /app

COPY package.json ./
RUN npm install

ARG VITE_BUILD_COMMIT=unknown
ENV VITE_BUILD_COMMIT=$VITE_BUILD_COMMIT

COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built assets from builder
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]