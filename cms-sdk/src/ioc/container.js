class ResolutionError extends Error {}

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

module.exports = { Container, ResolutionError };
