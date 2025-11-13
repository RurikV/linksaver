const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv/config');

const { buildContainer } = require('./container');
const { renderRouter } = require('./routes/render');

function createApp() {
  const app = express();

  app.use(helmet());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(morgan('dev'));

  app.use(
    cors({
      credentials: true,
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Link-Saver'],
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    })
  );

  // Mirror api/src/app.js header policy
  app.use((req, res, next) => {
    if (
      req.method !== 'OPTIONS' &&
      req.headers['origin'] &&
      req.headers['origin'] !== process.env.UI_URL &&
      !req.headers['x-link-saver']
    ) {
      return res.status(403).send();
    }
    next();
  });

  const container = buildContainer();
  app.set('container', container);

  app.use('/v1/render', renderRouter({ container }));

  app.get('/health', (_req, res) => res.json({ ok: true }));

  return app;
}

module.exports = { createApp };
