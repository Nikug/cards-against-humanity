from node:14-alpine as build
workdir /app
copy package.json package-lock.json ./
run npm ci
copy . .
run npm run build

from nginx:alpine
copy ./nginx.conf /etc/nginx/conf.d/default.conf
copy --from=build /app/build /usr/share/nginx/html