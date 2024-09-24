# ----------------------------------------------------------------------
# First stage, compile application
# ----------------------------------------------------------------------
FROM --platform=$BUILDPLATFORM node:14 AS builder

WORKDIR /usr/src/app

ARG API_SERVER
ENV API_SERVER=${API_SERVER
ARG AUTHORITY
ENV AUTHORITY=${AUTHORITY}
ARG CLIENT_ID
ENV CLIENT_ID=${CLIENT_ID}
ARG REDIRECT_URI
ENV REDIRECT_URI=${REDIRECT_URI}

# copy only package for caching purposes
COPY package*.json /usr/src/app/
COPY tools/ /usr/src/app/tools/
RUN npm install

# copy rest of application
COPY .babelrc .eslintrc .istanbul.yml *.js /usr/src/app/
COPY test /usr/src/app/test/
COPY src /usr/src/app/src/

# build application
RUN npm run build

# ----------------------------------------------------------------------
# Second stage, final image
# ----------------------------------------------------------------------

FROM nginx:alpine AS runtime

RUN apk add --no-cache jq

COPY --from=builder /usr/src/app/dist/ /usr/share/nginx/html/
COPY src/public /usr/share/nginx/html/public/
COPY src/config /usr/share/nginx/html/config/
COPY landing.conf /etc/nginx/conf.d/default.conf

WORKDIR /usr/share/nginx/html/tags
