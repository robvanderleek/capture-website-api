FROM node:20-slim
RUN apt-get update && \
    apt-get install -y \
        fonts-ipafont-gothic \
        fonts-wqy-zenhei \
        fonts-thai-tlwg \
        fonts-kacst \
        curl \
        dumb-init \
        chromium
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
RUN mkdir /app
COPY package.json yarn.lock app/
WORKDIR /app
RUN yarn
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium
COPY src src
RUN chown -R pptruser:pptruser /app
USER pptruser
ENTRYPOINT ["/usr/bin/dumb-init", "--"]
CMD ["yarn", "start"]
