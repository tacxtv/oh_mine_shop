FROM node:22-alpine AS builder

WORKDIR /usr/src/app

COPY . .

RUN apk add git && yarn install \
  --prefer-offline \
  --frozen-lockfile \
  --non-interactive \
  --production=false

RUN yarn run build

FROM node:22-alpine AS production

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

WORKDIR /usr/src/app

ADD ecosystem.config.cjs .
ADD package.json .
ADD *.lock .
ADD ./apps/api/package.json ./apps/api/package.json
ADD ./apps/web/package.json ./apps/web/package.json

RUN apk add --no-cache \
  openssl \
  git \
  jq \
  nano

RUN yarn install \
  --prefer-offline \
  --pure-lockfile \
  --non-interactive \
  --production=true

RUN yarn global add pm2
# RUN yarn cache clean --all

COPY --from=builder /usr/src/app/apps/api/dist ./apps/api/dist
COPY --from=builder /usr/src/app/apps/web/.output ./apps/web/.output

EXPOSE 4000 3000

CMD ["pm2-runtime", "ecosystem.config.cjs"]
