const express = require('express');
const { validateNode, validatePage } = require('cms-sdk');

function wantsHtml(req) {
  const q = (req.query && String(req.query.format || '')) || '';
  if (q.toLowerCase() === 'html') return true;
  const accept = req.headers['accept'] || '';
  return accept.includes('text/html');
}

function renderRouter({ container }) {
  const router = express.Router();

  router.post('/', async (req, res) => {
    try {
      const c = container || req.app.get('container');
      const body = req.body || {};
      let page = null;
      let tree = null;

      if (body && body.page) {
        page = body.page;
        validatePage(page);
        tree = page.root;
      } else if (body && body.tree) {
        tree = body.tree;
        validateNode(tree);
      } else {
        return res.status(400).json({ error: 'Missing page or tree in body' });
      }

      if (wantsHtml(req)) {
        const htmlRenderer = c.resolve('HTMLRenderer');
        const html = await htmlRenderer.render(tree, { request: { headers: req.headers, query: req.query } });
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        return res.status(200).send(html);
      }

      const jsonRenderer = c.resolve('JSONRenderer');
      const out = await jsonRenderer.render(tree);
      return res.json({ tree: out, meta: page ? page.meta : undefined, version: page ? page.version : undefined });
    } catch (err) {
      if (err && err.name === 'ValidationError') {
        return res.status(400).json({ error: 'Invalid input', details: err.details });
      }
      // eslint-disable-next-line no-console
      console.error(err);
      return res.status(400).json({ error: err.message || 'Render error' });
    }
  });

  return router;
}

module.exports = { renderRouter };
