FROM node:lts AS build

COPY ./. app/

WORKDIR app/

RUN npm install
RUN npm run build

FROM caddy:alpine

COPY --from=build app/dist /usr/share/caddy
