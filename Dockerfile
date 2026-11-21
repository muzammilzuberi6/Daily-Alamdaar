FROM node:22-slim
WORKDIR /app
COPY package*.json ./
RUN npm install --omit=dev
COPY . .
RUN mkdir -p data uploads && chown -R node:node /app
USER node
ENV PORT=7860 NODE_ENV=production
EXPOSE 7860
CMD ["node", "server.js"]
