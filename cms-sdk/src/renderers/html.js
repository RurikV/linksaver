class RenderError extends Error {}

class HTMLRenderer {
  constructor({ registry }) {
    if (!registry) throw new RenderError('HTMLRenderer requires a plugin registry');
    this.registry = registry;
  }

  async render(tree, context = {}) {
    if (!tree) return '';
    return this._renderNode(tree, context);
  }

  async _renderNode(node, context) {
    const { type, params = {}, children = [] } = node;
    if (!this.registry.isAllowed(type)) {
      throw new RenderError(`Plugin not allowed: ${type}`);
    }
    const plugin = this.registry.get(type);
    if (!plugin || typeof plugin.render !== 'function') {
      throw new RenderError(`Renderer plugin not found or invalid: ${type}`);
    }
    // Validate params against plugin schema if any
    this.registry.validateParams(type, params);

    // Render children first (depth-first)
    let renderedChildren = '';
    if (Array.isArray(children) && children.length > 0) {
      const parts = [];
      for (const child of children) {
        // support async plugins
        parts.push(await this._renderNode(child, context));
      }
      renderedChildren = parts.join('');
    }

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
}

module.exports = { HTMLRenderer, RenderError };
