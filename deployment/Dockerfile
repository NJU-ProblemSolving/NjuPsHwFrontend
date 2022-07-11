FROM node:lts AS build

COPY ./package.json ./package-lock.json app/
WORKDIR app/
RUN npm install

COPY . app/
RUN npm run build

FROM caddy:alpine

COPY --from=build app/dist /usr/share/caddy
