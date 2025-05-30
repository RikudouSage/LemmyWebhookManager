FROM node:20 as build

ENV NG_CLI_ANALYTICS="false"

WORKDIR /app
COPY package.json package.json
COPY yarn.lock yarn.lock
RUN yarn install

COPY . .
RUN yarn install
RUN yarn build

FROM nginx

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY docker-build.sh /docker-entrypoint.d/99-docker-build.sh
COPY --from=build /app/dist/simple-app-template /usr/share/nginx/html
