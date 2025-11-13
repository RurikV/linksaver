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
  properties: {
    class: { type: 'string' },
    tag: { type: 'string', enum: ['div', 'section', 'article', 'main', 'aside'] },
  },
};

const Container = {
  id: 'Container',
  schema,
  render: async ({ params, children }) => {
    const tag = params.tag || 'div';
    const cls = params.class ? ` class="${escapeHtml(params.class)}"` : '';
    return `<${tag}${cls}>${children || ''}</${tag}>`;
  },
};

module.exports = { Container };
