FROM node:lts-alpine AS build

ARG REVISION=unknown

COPY . app/
WORKDIR app/
RUN sed -i "s/clientVersion = 'unknown'/clientVersion = '$REVISION'/" src/config.ts
RUN npm install
RUN npm run build

FROM caddy:alpine

COPY --from=build app/dist /usr/share/caddy
COPY deployment/Caddyfile /etc/caddy/Caddyfile
