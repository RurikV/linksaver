const { createApp } = require('./app');
require('dotenv/config');

const PORT = process.env.CMS_RENDERER_PORT || 7782;

const app = createApp();
app.set('port', PORT);
app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`cms-renderer listening on ${PORT}`);
});
