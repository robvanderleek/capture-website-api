FROM node:24 AS build-cwa
RUN mkdir /app
COPY package.json package-lock.json /app
COPY src /app/src
WORKDIR /app
RUN npm install && npm run build

FROM node:24-slim
RUN apt-get update && \
    apt-get install -y --no-install-recommends --no-install-suggests \
        fonts-ipafont-gothic \
        fonts-wqy-zenhei \
        fonts-thai-tlwg \
        fonts-kacst \
        curl \
        dumb-init \
        chromium \
        ca-certificates
RUN mkdir -p /usr/share/fonts/emoji \
    && curl --location --silent --show-error -o \
    /usr/share/fonts/emoji/emojione-android.ttf \
    https://github.com/emojione/emojione-assets/releases/download/3.1.2/emojione-android.ttf \
    && chmod -R +rx /usr/share/fonts/ \
    && fc-cache -fv
RUN rm /bin/sh && ln -s /bin/bash /bin/sh
RUN groupadd -r pptruser && useradd -r -g pptruser -G audio,video pptruser \
    && mkdir -p /home/pptruser/Downloads \
    && chown -R pptruser:pptruser /home/pptruser
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium
RUN mkdir /app
COPY --from=build-cwa /app/dist /app/dist
RUN chown -R pptruser:pptruser /app
USER pptruser
ENTRYPOINT ["/usr/bin/dumb-init", "--"]
CMD ["node", "/app/dist/index.js"]
