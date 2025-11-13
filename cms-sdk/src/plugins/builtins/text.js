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

module.exports = { TextBlock };
