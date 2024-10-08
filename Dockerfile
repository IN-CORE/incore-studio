# ----------------------------------------------------------------------
# First stage, compile application
# ----------------------------------------------------------------------
FROM --platform=$BUILDPLATFORM node:18 AS builder

WORKDIR /usr/src/app

ARG INCORE_REMOTE_HOSTNAME
ENV INCORE_REMOTE_HOSTNAME=${INCORE_REMOTE_HOSTNAME}

# copy only package for caching purposes
COPY package*.json /usr/src/app/
RUN npm install

# copy rest of application
COPY .eslintrc .huskyrc .lintstagedrc .prettierrc *.js *.json /usr/src/app/
#COPY . /usr/src/app/
COPY src /usr/src/app/src/

# build application
RUN npm run build

# ----------------------------------------------------------------------
# Second stage, final image
# ----------------------------------------------------------------------

FROM nginx:alpine AS runtime

RUN apk add --no-cache jq
# RUN mkdir /usr/share/nginx/html/studio && \
#     mkdir /usr/share/nginx/html/studio/public

COPY --from=builder /usr/src/app/build/ /usr/share/nginx/html/
COPY src/public /usr/share/nginx/html/public/
# COPY --from=builder /usr/src/app/build/ /usr/share/nginx/html/studio/
# COPY src/public /usr/share/nginx/html/studio/public/
COPY landing.conf /etc/nginx/conf.d/default.conf