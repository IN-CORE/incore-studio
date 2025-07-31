ARG NPM_TOKEN=""

# ----------------------------------------------------------------------
# First stage, compile application
# ----------------------------------------------------------------------
FROM --platform=$BUILDPLATFORM node:18 AS builder

WORKDIR /usr/src/app

ARG INCORE_REMOTE_HOSTNAME
ARG NPM_TOKEN
ENV INCORE_REMOTE_HOSTNAME=${INCORE_REMOTE_HOSTNAME}

# copy only package for caching purposes
COPY package*.json /usr/src/app/
RUN echo "@ncsa:registry=https://npm.pkg.github.com/" >> .npmrc && \
    echo "//npm.pkg.github.com/:_authToken=${NPM_TOKEN}" >> .npmrc
RUN npm ci

# copy rest of application
COPY .eslintrc .huskyrc .lintstagedrc .prettierrc esbuild.config.mjs *.js *.json /usr/src/app/
#COPY . /usr/src/app/
COPY src /usr/src/app/src/
COPY public /usr/src/app/public/

# build application
RUN npm run build

# ----------------------------------------------------------------------
# Second stage, final image
# ----------------------------------------------------------------------

FROM nginx:alpine AS runtime

RUN apk add --no-cache jq
RUN mkdir /usr/share/nginx/html/studio

COPY --from=builder /usr/src/app/build/ /usr/share/nginx/html/studio/
COPY landing.conf /etc/nginx/conf.d/default.conf
