FROM node:7

RUN apt-get update && apt-get install -y pdftk

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

ARG NODE_ENV
ENV NODE_ENV $NODE_ENV
COPY package.json /usr/src/app/
RUN npm install && npm cache clean
COPY . /usr/src/app

EXPOSE 3000
CMD [ "npm", "start" ]
