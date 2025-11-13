function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

const schema = {
  type: 'object',
  additionalProperties: false,
  required: ['items'],
  properties: {
    items: { type: 'array' },
    ordered: { type: 'boolean' },
    class: { type: 'string' },
    itemClass: { type: 'string' },
    itemKey: { type: 'string' },
  },
};

function itemToString(item, itemKey) {
  if (item == null) return '';
  if (typeof item === 'string' || typeof item === 'number' || typeof item === 'boolean') {
    return String(item);
  }
  if (itemKey && typeof item === 'object' && Object.prototype.hasOwnProperty.call(item, itemKey)) {
    const val = item[itemKey];
    return val == null ? '' : String(val);
  }
  // fallback: JSON
  try { return JSON.stringify(item); } catch (_) { return String(item); }
}

const List = {
  id: 'List',
  schema,
  render: async ({ params }) => {
    const tag = params.ordered ? 'ol' : 'ul';
    const cls = params.class ? ` class="${escapeHtml(params.class)}"` : '';
    const itemCls = params.itemClass ? ` class="${escapeHtml(params.itemClass)}"` : '';
    const items = Array.isArray(params.items) ? params.items : [];
    const htmlItems = items
      .map((it) => `<li${itemCls}>${escapeHtml(itemToString(it, params.itemKey))}</li>`) // eslint-disable-line
      .join('');
    return `<${tag}${cls}>${htmlItems}</${tag}>`;
  },
};

module.exports = { List };
