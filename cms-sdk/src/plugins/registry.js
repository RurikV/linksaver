const Ajv = require('ajv');

class PluginRegistryError extends Error {}

/**
 * Plugin shape:
 * {
 *   id: string,
 *   schema?: object, // JSON Schema for params
 *   render?: ({ node, params, children, context, registry }) => string | Promise<string>
 * }
 */
class PluginRegistry {
  constructor({ repo } = {}) {
    this._plugins = new Map();
    this._repo = repo; // optional dynamic activation source
    this._allowlist = null; // null means allow all
    this._events = new Map();
    this._ajv = new Ajv({ allErrors: true, strict: false });
    this._compiledSchemas = new Map();
  }

  on(event, handler) {
    const list = this._events.get(event) || [];
    list.push(handler);
    this._events.set(event, list);
  }

  off(event, handler) {
    const list = this._events.get(event) || [];
    const idx = list.indexOf(handler);
    if (idx >= 0) list.splice(idx, 1);
    this._events.set(event, list);
  }

  _emit(event, payload) {
    const list = this._events.get(event) || [];
    for (const fn of list) {
      try { fn(payload); } catch (e) { /* swallow */ }
    }
  }

  /**
   * Set explicit allowlist of plugin ids. Pass null to allow all.
   */
  setAllowlist(ids) {
    if (ids === null) {
      this._allowlist = null;
    } else if (Array.isArray(ids)) {
      this._allowlist = new Set(ids);
    } else {
      throw new PluginRegistryError('Allowlist must be an array of ids or null');
    }
    this._emit('allowlistChanged', { allowlist: this._allowlist ? Array.from(this._allowlist) : null });
  }

  /**
   * Loads activation list from the injected repo if available.
   * Expected repo API: async listActivePluginIds(): string[]
   */
  async loadAllowlistFromRepo() {
    if (!this._repo || typeof this._repo.listActivePluginIds !== 'function') return [];
    const ids = await this._repo.listActivePluginIds();
    this.setAllowlist(ids);
    return ids;
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

  has(id) { return this._plugins.has(id); }

  get(id) { return this._plugins.get(id) || null; }

  list() { return Array.from(this._plugins.values()); }

  /**
   * Checks if plugin id is allowed by current allowlist
   */
  isAllowed(id) {
    if (!this._allowlist) return true; // no restrictions
    return this._allowlist.has(id);
  }

  /**
   * Validate params for a given plugin id against its schema (if present)
   */
  validateParams(id, params) {
    const validate = this._compiledSchemas.get(id);
    if (!validate) return true; // no schema means no validation
    const ok = validate(params);
    if (!ok) {
      const err = new PluginRegistryError(`Invalid params for plugin ${id}`);
      err.details = validate.errors;
      throw err;
    }
    return true;
  }
}

module.exports = { PluginRegistry, PluginRegistryError };
