FROM node:18

ARG NODE_ENV
ARG DATABASE_PASSWORD
ARG DATABASE_URL
ARG JWT_SECRET
ARG HTTP_PORT

ARG SMTP_HOST
ARG SMTP_PORT
ARG SMTP_USERNAME
ARG SMTP_PASSWORD
ARG HOST
ARG SSL_KEY_BASE64
ARG SSL_CERT_BASE64
ARG SCHOLARSOME_RECAPTCHA_SITE
ARG SCHOLARSOME_RECAPTCHA_SECRET

WORKDIR /usr/src/app

COPY package*.json .

RUN npm install --production --silent --legacy-peer-deps

COPY . .

RUN npm run generate
RUN npm run build

RUN touch .env

RUN echo "NODE_ENV=$NODE_ENV\n" >> .env
RUN echo "DATABASE_PASSWORD=$DATABASE_PASSWORD\n" >> .env
RUN echo "DATABASE_URL=$DATABASE_URL\n" >> .env
RUN echo "JWT_SECRET=$JWT_SECRET\n" >> .env
RUN echo "HTTP_PORT=$HTTP_PORT\n" >> .env

RUN echo "S3_STORAGE_ENDPOINT=$S3_STORAGE_ENDPOINT\n" >> .env
RUN echo "S3_STORAGE_ACCESS_KEY=$S3_STORAGE_ACCESS_KEY\n" >> .env
RUN echo "S3_STORAGE_SECRET_KEY=$S3_STORAGE_SECRET_KEY\n" >> .env
RUN echo "S3_STORAGE_REGION=$S3_STORAGE_REGION\n" >> .env
RUN echo "S3_STORAGE_BUCKET=$S3_STORAGE_BUCKET\n" >> .env
RUN echo "SMTP_HOST=$SMTP_HOST\n" >> .env
RUN echo "SMTP_PORT=$SMTP_PORT\n" >> .env
RUN echo "SMTP_USERNAME=$SMTP_USERNAME\n" >> .env
RUN echo "SMTP_PASSWORD=$SMTP_PASSWORD\n" >> .env
RUN echo "HOST=$HOST\n" >> .env
RUN echo "SSL_KEY_BASE64=$SSL_KEY_BASE64\n" >> .env
RUN echo "SSL_CERT_BASE64=$SSL_CERT_BASE64\n" >> .env
RUN echo "SCHOLARSOME_RECAPTCHA_SITE=$SCHOLARSOME_RECAPTCHA_SITE\n" >> .env
RUN echo "SCHOLARSOME_RECAPTCHA_SECRET=$SCHOLARSOME_RECAPTCHA_SECRET\n" >> .env
RUN echo "REDIS_HOST=$REDIS_HOST" >> .env
RUN echo "REDIS_PORT=$REDIS_PORT" >> .env
RUN echo "REDIS_USERNAME=$REDIS_USERNAME" >> .env
RUN echo "REDIS_PASSWORD=$REDIS_PASSWORD" >> .env

CMD [ "npm", "run", "serve:node" ]
