FROM node:16-alpine
WORKDIR /app

COPY package.json .

RUN npm install

ENTRYPOINT ["/bin/sh"]
CMD ["-c", "if [ \"$NODE_ENV\" = \"dev\" ]; then npm run api:dev; else npm run api:prod; fi"]
