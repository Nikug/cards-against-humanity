from node:14-alpine as build
workdir /app
copy client/package.json client/package-lock.json ./
run npm ci
copy client/ .
run npm run build


from node:14-alpine
workdir /app
copy server/package.json server/package-lock.json ./
run npm ci
copy server/ .
copy --from=build /app/build /client/build
expose 4000
cmd ["npm", "start"]