const { createApp } = require('./app');
require('dotenv/config');

const PORT = process.env.CMS_COMPOSER_PORT || 7781;

const app = createApp();
app.set('port', PORT);
app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`cms-composer listening on ${PORT}`);
});
