from node:14-alpine
workdir /app
copy package.json package-lock.json ./
run npm ci
copy . .
expose 4000
cmd ["npm", "run", "start:db"]