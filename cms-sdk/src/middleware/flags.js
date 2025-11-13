function cloneWithout(obj, key) {
  if (!obj || typeof obj !== 'object') return obj;
  const { [key]: _omit, ...rest } = obj; // eslint-disable-line no-unused-vars
  return rest;
}

function normalizeFlagDescriptor(val) {
  if (!val) return null;
  if (typeof val === 'string') return { name: val, invert: false };
  if (typeof val === 'object' && typeof val.name === 'string') {
    return { name: val.name, invert: !!val.invert };
  }
  return null;
}

function pruneByFlag(node, isEnabled, ctx) {
  if (!node) return null;
  const desc = normalizeFlagDescriptor(node.params && node.params.featureFlag);
  if (desc) {
    const enabled = !!isEnabled(desc.name, ctx);
    const keep = desc.invert ? !enabled : enabled;
    if (!keep) return null; // prune this node entirely
  }
  // clone node shallowly, drop featureFlag from params to avoid leaking flags to renderer
  const params = node.params ? cloneWithout(node.params, 'featureFlag') : {};
  const nextChildren = Array.isArray(node.children) ? node.children : [];
  const children = [];
  for (const child of nextChildren) {
    const pruned = pruneByFlag(child, isEnabled, ctx);
    if (pruned) children.push(pruned);
  }
  return { ...node, params, children };
}

/**
 * Feature flag middleware.
 * Conventions:
 * - Node can include `params.featureFlag` as a string (flag name) or { name, invert? }.
 * - Nodes with disabled flags are pruned from the tree.
 * - Tree is expected on ctx.tree; result replaces ctx.tree.
 */
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

module.exports = { featureFlagGate, pruneByFlag };
