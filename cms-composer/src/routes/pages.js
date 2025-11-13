const express = require('express');
const { compose, localeResolver, featureFlagGate, abBucket, validatePage } = require('cms-sdk');

function parseFlagsFromHeader(headerVal) {
  const flags = {};
  if (!headerVal || typeof headerVal !== 'string') return flags;
  for (const name of headerVal.split(',').map(s => s.trim()).filter(Boolean)) {
    flags[name] = true;
  }
  return flags;
}

function pagesRouter({ container }) {
  const router = express.Router();

  router.get('/:slug', async (req, res) => {
    try {
      const c = container || req.app.get('container');
      const pagesRepo = c.resolve('PagesRepository');
      const slug = req.params.slug;
      const page = await pagesRepo.findBySlug(slug);
      if (!page) return res.status(404).json({ error: 'Page not found' });

      // Build request context for middleware
      const ctx = {
        request: { headers: req.headers, query: req.query },
        userId: req.headers['x-user-id'],
        flags: parseFlagsFromHeader(req.headers['x-flags']),
        tree: page.root,
        page,
      };

      const pipeline = compose([
        localeResolver({ defaultLocale: 'en' }),
        abBucket({}),
        featureFlagGate({}),
      ]);
      await pipeline(ctx);

      // Replace root with potentially modified tree
      const composed = { ...page, root: ctx.tree, meta: { ...page.meta, locale: ctx.locale, ab: ctx.ab?.bucket } };

      // Validate composed page before returning
      validatePage(composed);

      return res.json(composed);
    } catch (err) {
      if (err && err.name === 'ValidationError') {
        return res.status(400).json({ error: 'Invalid page', details: err.details });
      }
      // eslint-disable-next-line no-console
      console.error(err);
      return res.status(500).json({ error: 'Internal error' });
    }
  });

  return router;
}

module.exports = { pagesRouter };
