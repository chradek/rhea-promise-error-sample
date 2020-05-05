FROM node:12.13.0

WORKDIR /usr/src/app

RUN apt-get update
RUN apt-get install -y iptables
RUN apt-get install -y net-tools

COPY . .