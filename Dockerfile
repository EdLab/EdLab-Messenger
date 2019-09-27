FROM node:12-alpine

LABEL maintainer="EdLab IT <edlabit@tc.columbia.edu>"

ENV TZ='America/New_York'
ENV NODE_ENV production

RUN apk add --update \
    python \
    build-base \
    tzdata

RUN cp /usr/share/zoneinfo/$TZ /etc/localtime && \
    echo $TZ > /etc/timezone

WORKDIR /prj
COPY ./package.json /prj/package.json
COPY ./package-lock.json /prj/package-lock.json
RUN npm i

COPY . /prj

RUN npm run build

EXPOSE 8000

ENTRYPOINT ["npm", "run"]
