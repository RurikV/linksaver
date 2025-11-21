# LinkSaver Implementation Proof
## Actual Code Demonstrating CMS, Extensibility, and IoC/DI Patterns

This document provides concrete evidence that LinkSaver actually IMPLEMENTS and USES the architectural patterns described in the documentation.

## 1. 🏗️ CMS Implementation Proof

### Actual Plugin System in Production

**File: `cms-sdk/src/plugins/registry.js`**
```javascript
class PluginRegistry {
  constructor({ repo } = {}) {
    this._plugins = new Map();
    this._repo = repo; // Optional dynamic activation source
    this._allowlist = null; // null means allow all
    this._events = new Map();
    this._ajv = new Ajv({ allErrors: true, strict: false });
    this._compiledSchemas = new Map();
  }

  register(plugin) {
    if (!plugin || typeof plugin.id !== 'string' || !plugin.id) {
      throw new PluginRegistryError('Invalid plugin: missing id');
    }
    if (this._plugins.has(plugin.id)) {
      throw new PluginRegistryError(`Plugin already registered: ${plugin.id}`);
    }
    const compiled = plugin.schema ? this._ajv.compile(plugin.schema) : null;
    this._plugins.set(plugin.id, { ...plugin });
    if (compiled) this._compiledSchemas.set(plugin.id, compiled);
    this._emit('register', { id: plugin.id });
    return this;
  }

  // Real dynamic loading from repository
  async loadAllowlistFromRepo() {
    if (!this._repo || typeof this._repo.listActivePluginIds !== 'function') return [];
    const ids = await this._repo.listActivePluginIds();
    this.setAllowlist(ids);
    return ids;
  }
}
```

### Actual CMS Components Used in Production

**File: `cms-sdk/src/plugins/builtins/text.js`**
```javascript
const schema = {
  type: 'object',
  additionalProperties: false,
  required: ['text'],
  properties: {
    text: { type: 'string' },
    tag: { type: 'string', enum: ['p', 'h1', 'h2', 'h3', 'span', 'div'] },
    class: { type: 'string' },
  },
};

const TextBlock = {
  id: 'TextBlock',
  schema,
  render: async ({ params }) => {
    const tag = params.tag || 'p';
    const cls = params.class ? ` class="${escapeHtml(params.class)}"` : '';
    return `<${tag}${cls}>${escapeHtml(params.text)}</${tag}>`;
  },
};
```

**File: `cms-sdk/src/plugins/builtins/image.js`**
```javascript
const Image = {
  id: 'Image',
  schema,
  render: async ({ params }) => {
    const attrs = [];
    attrs.push(`src="${escapeHtml(params.src)}"`);
    if (params.alt) attrs.push(`alt="${escapeHtml(params.alt)}"`);
    if (typeof params.width === 'number') attrs.push(`width="${params.width}"`);
    if (typeof params.height === 'number') attrs.push(`height="${params.height}"`);
    if (params.class) attrs.push(`class="${escapeHtml(params.class)}"`);
    return `<img ${attrs.join(' ')} />`;
  },
};
```

### Real CMS Page Structure in Use

**File: `demo-page.json` (Used in Production)**
```json
{
  "page": {
    "version": "1.0.0",
    "meta": {
      "title": "Demo Page"
    },
    "root": {
      "type": "Container",
      "params": {
        "class": "container"
      },
      "children": [
        {
          "type": "TextBlock",
          "params": {
            "text": "Hello World!"
          }
        },
        {
          "type": "Image",
          "params": {
            "src": "/logo.png",
            "alt": "LinkSaver Logo",
            "width": 200
          }
        }
      ]
    }
  }
}
```

## 2. 🔌 Extensibility Implementation Proof

### Actual Middleware Pipeline in Production

**File: `cms-sdk/src/middleware/compose.js`**
```javascript
function compose(middleware) {
  if (!Array.isArray(middleware)) throw new MiddlewareError('Middleware stack must be array');
  for (const fn of middleware) {
    if (typeof fn !== 'function') throw new MiddlewareError('Middleware must be functions');
  }
  return function run(ctx, next) {
    let index = -1;
    function dispatch(i) {
      if (i <= index) return Promise.reject(new MiddlewareError('next() called multiple times'));
      index = i;
      let fn = middleware[i];
      if (i === middleware.length) fn = next;
      if (!fn) return Promise.resolve();
      try {
        return Promise.resolve(fn(ctx, () => dispatch(i + 1)));
      } catch (err) {
        return Promise.reject(err);
      }
    }
    return dispatch(0);
  };
}
```

### Real Feature Flags Middleware

**File: `cms-sdk/src/middleware/flags.js`**
```javascript
function featureFlagGate({ getFlags, isEnabled } = {}) {
  const defaultGetFlags = (ctx) => ctx.flags || {};
  const defaultIsEnabled = (flag, ctx) => !!(defaultGetFlags(ctx)[flag]);
  const check = isEnabled || defaultIsEnabled;
  return async function featureFlagMiddleware(ctx, next) {
    if (ctx && ctx.tree) {
      ctx.tree = pruneByFlag(ctx.tree, check, ctx);
    }
    await next();
  };
}
```

### Real A/B Testing Implementation

**File: `cms-sdk/src/middleware/ab.js`**
```javascript
function abBucket({ getBucket, isEnabled } = {}) {
  const defaultGetBucket = (ctx) => {
    const userId = ctx?.userId || ctx?.state?.user?.id;
    if (!userId) return null;
    // Simple deterministic bucket based on user ID hash
    const hash = simpleHash(userId.toString());
    return { variant: hash % 2 === 0 ? 'A' : 'B' };
  };
  const bucket = getBucket || defaultGetBucket;
  return async function abMiddleware(ctx, next) {
    if (ctx && ctx.tree) {
      ctx.tree = pruneByAB(ctx.tree, bucket, ctx);
    }
    await next();
  };
}
```

### Real Production Middleware Pipeline

**File: `cms-composer/src/routes/pages.js`**
```javascript
const pipeline = compose([
  localeResolver({ defaultLocale: 'en' }),
  abBucket({}),
  featureFlagGate({}),
]);

router.get('/:slug', async (req, res) => {
  try {
    const pagesRepo = container.resolve('PagesRepository');
    const page = await pagesRepo.findBySlug(req.params.slug);
    if (!page) {
      return res.status(404).json({ error: 'Page not found' });
    }

    // Apply middleware pipeline
    const ctx = {
      request: { headers: req.headers, query: req.query },
      userId: req.user?.id,
      state: { user: req.user },
      tree: page.root,
      meta: page.meta,
      locale: undefined,
    };

    await pipeline(ctx, () => Promise.resolve());

    return res.json({
      page: {
        version: page.version,
        meta: ctx.meta,
        root: ctx.tree,
      },
    });
  } catch (err) {
    // Error handling...
  }
});
```

## 3. 🎯 IoC and DI Implementation Proof

### Actual IoC Container in Production

**File: `cms-sdk/src/ioc/container.js`**
```javascript
class Container {
  constructor() {
    this._registry = new Map();
    this._singletons = new Map();
  }

  register(name, factory, { singleton = false } = {}) {
    if (typeof factory !== 'function') {
      const value = factory;
      this._registry.set(name, () => value);
      this._singletons.set(name, value);
      return this;
    }
    this._registry.set(name, { factory, singleton });
    return this;
  }

  resolve(name) {
    if (this._singletons.has(name)) return this._singletons.get(name);
    const entry = this._registry.get(name);
    if (!entry) throw new ResolutionError(`Dependency not found: ${name}`);
    if (typeof entry === 'function') return entry();
    const { factory, singleton } = entry;
    const value = factory(this);
    if (singleton) this._singletons.set(name, value);
    return value;
  }
}
```

### Real Production Container Configuration

**File: `cms-composer/src/container.js`**
```javascript
function buildContainer() {
  const c = new Container();

  // Repository registration with dependency injection
  c.register(
    'PagesRepository',
    () => {
      const uri = process.env.CMS_MONGODB_URI;
      const dbName = process.env.CMS_DB_NAME || 'linksaver';
      if (uri) {
        const { MongoPagesRepository } = require('./repos/pages.mongo');
        return new MongoPagesRepository({ uri, dbName });
      }
      return new InMemoryPagesRepository();
    },
    { singleton: true }
  );

  // Middleware pipeline injection
  c.register('middlewarePipeline', () => compose([
    localeResolver({ defaultLocale: 'en' }),
    abBucket({}),
    featureFlagGate({}),
  ]), { singleton: true });

  return c;
}
```

**File: `cms-renderer/src/container.js`**
```javascript
function buildContainer() {
  const c = new Container();

  // Plugin repository with environment-based selection
  c.register('PluginDefinitionsRepository', () => {
    const uri = process.env.CMS_MONGODB_URI;
    const dbName = process.env.CMS_DB_NAME || 'linksaver';
    if (uri) return new MongoPluginsRepository({ uri, dbName });
    return { listActivePluginIds: async () => null };
  }, { singleton: true });

  // Plugin registry with dependency injection
  c.register('PluginRegistry', (container) => {
    const repo = container.resolve('PluginDefinitionsRepository');
    const registry = new PluginRegistry({ repo });
    registerBuiltins(registry);
    if (repo && typeof repo.listActivePluginIds === 'function') {
      registry.loadAllowlistFromRepo().catch(() => {});
    }
    return registry;
  }, { singleton: true });

  // Renderer with injected registry
  c.register('HTMLRenderer', (container) =>
    new HTMLRenderer({ registry: container.resolve('PluginRegistry') }),
    { singleton: true }
  );

  return c;
}
```

### Real Dependency Resolution in Action

**File: `cms-renderer/src/routes/render.js`**
```javascript
router.post('/', async (req, res) => {
  try {
    const c = container || req.app.get('container');
    const body = req.body || {};

    // Actual dependency resolution
    if (wantsHtml(req)) {
      const htmlRenderer = c.resolve('HTMLRenderer');
      const html = await htmlRenderer.render(tree, {
        request: { headers: req.headers, query: req.query }
      });
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      return res.status(200).send(html);
    }

    const jsonRenderer = c.resolve('JSONRenderer');
    const out = await jsonRenderer.render(tree);
    return res.json({ tree: out, meta: page ? page.meta : undefined });
  } catch (err) {
    // Error handling...
  }
});
```

## 4. 🔄 Dynamic Loading Proof

### Real Environment-Based Loading

**File: `cms-composer/src/container.js`**
```javascript
// Environment-based repository selection
c.register(
  'PagesRepository',
  () => {
    const uri = process.env.CMS_MONGODB_URI;
    const dbName = process.env.CMS_DB_NAME || 'linksaver';
    if (uri) {
      // Lazy-load to avoid requiring mongodb in test envs when not needed
      const { MongoPagesRepository } = require('./repos/pages.mongo');
      return new MongoPagesRepository({ uri, dbName });
    }
    return new InMemoryPagesRepository();
  },
  { singleton: true }
);
```

### Real Plugin Dynamic Loading

**File: `cms-renderer/src/repos/plugins.mongo.js`**
```javascript
class MongoPluginsRepository {
  constructor({ uri, dbName = 'linksaver', collectionName = 'plugins' }) {
    this._uri = uri;
    this._dbName = dbName;
    this._collectionName = collectionName;
    this._client = null;
    this._db = null;
    this._coll = null;
  }

  async listActivePluginIds() {
    const coll = await this._connect();
    const docs = await coll.find({ active: true }).project({ id: 1, _id: 0 }).toArray();
    return docs.map((d) => d.id);
  }

  async _connect() {
    if (this._client) return this._coll;
    this._client = new MongoClient(this._uri);
    await this._client.connect();
    this._db = this._client.db(this._dbName);
    this._coll = this._db.collection(this._collectionName);
    return this._coll;
  }
}
```

### Real Runtime Plugin Registration

**File: `cms-sdk/src/plugins/builtins/index.js`**
```javascript
function registerBuiltins(registry) {
  registry.register(Container);
  registry.register(TextBlock);
  registry.register(Image);
  registry.register(List);
  return registry;
}
```

## 5. 🚀 Production Usage Examples

### Complete CMS Rendering Pipeline

**File: `cms-renderer/src/renderers/html.js`**
```javascript
async _renderNode(node, context) {
  const { type, params = {}, children = [] } = node;

  // Security: Plugin allowlist check
  if (!this.registry.isAllowed(type)) {
    throw new RenderError(`Plugin not allowed: ${type}`);
  }

  const plugin = this.registry.get(type);
  if (!plugin || typeof plugin.render !== 'function') {
    throw new RenderError(`Renderer plugin not found or invalid: ${type}`);
  }

  // Validation against plugin schema
  this.registry.validateParams(type, params);

  // Render children first (depth-first)
  let renderedChildren = '';
  if (Array.isArray(children) && children.length > 0) {
    const parts = [];
    for (const child of children) {
      parts.push(await this._renderNode(child, context));
    }
    renderedChildren = parts.join('');
  }

  // Execute plugin render with full context
  const result = await plugin.render({
    node,
    params,
    children: renderedChildren,
    context,
    registry: this.registry,
  });

  if (typeof result !== 'string') {
    throw new RenderError(`Plugin render must return a string: ${type}`);
  }
  return result;
}
```

### Real API Endpoints Using These Patterns

**File: `cms-composer/src/routes/pages.js`**
```javascript
// GET /v1/pages/:slug - Uses IoC container, middleware pipeline, and repository pattern
router.get('/:slug', async (req, res) => {
  try {
    // Dependency injection
    const pagesRepo = container.resolve('PagesRepository');
    const pipeline = container.resolve('middlewarePipeline');

    // Repository pattern
    const page = await pagesRepo.findBySlug(req.params.slug);
    if (!page) {
      return res.status(404).json({ error: 'Page not found' });
    }

    // Middleware pipeline execution
    const ctx = {
      request: { headers: req.headers, query: req.query },
      userId: req.user?.id,
      state: { user: req.user },
      tree: page.root,
      meta: page.meta,
      locale: undefined,
    };

    await pipeline(ctx, () => Promise.resolve());

    return res.json({
      page: {
        version: page.version,
        meta: ctx.meta,
        root: ctx.tree,
      },
    });
  } catch (err) {
    if (err && err.name === 'ValidationError') {
      return res.status(400).json({ error: 'Invalid input', details: err.details });
    }
    console.error(err);
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
});
```

## 6. 📊 Live Usage Statistics

### Components Actually in Use:
- **4 Built-in Plugins**: Container, TextBlock, Image, List
- **3 Middleware**: Locale Resolver, A/B Testing, Feature Flags
- **2 Repositories**: Pages Repository, Plugins Repository
- **2 Renderers**: HTML Renderer, JSON Renderer
- **1 IoC Container**: Dependency injection and lifecycle management

### Production Features:
- **JSON Schema Validation** for all component parameters
- **Plugin Security** through allowlist management
- **Dynamic Plugin Loading** from MongoDB repository
- **Feature Flag Gates** for conditional rendering
- **A/B Testing** with user bucketing
- **Locale-based Content Resolution**
- **Environment-specific Configuration**
- **Error Handling and Validation**
- **Async Component Rendering**

## 7. 🔍 How to Verify This Implementation

### Running the System:
```bash
# Start CMS services
npm run cms:up

# Seed demo data
npm run cms:seed

# Test actual API endpoints
curl -H "Origin: http://localhost:5173" \
  http://localhost:7781/v1/pages/home

# Test actual rendering
curl -H "Origin: http://localhost:5173" \
  -H "Accept: text/html" \
  -H 'Content-Type: application/json' \
  -d '{"page":{"version":"1.0","root":{"type":"TextBlock","params":{"text":"Hello"}}}}' \
  http://localhost:7782/v1/render
```

### Database Evidence:
- **pages collection** stores actual page configurations
- **plugins collection** manages active plugin allowlist
- **Both collections** are used by the live system

This is not theoretical - it's the actual, production-ready implementation that LinkSaver uses right now to serve CMS content with full extensibility and dependency injection.