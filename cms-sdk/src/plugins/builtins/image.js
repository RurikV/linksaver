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
  required: ['src'],
  properties: {
    src: { type: 'string', minLength: 1 },
    alt: { type: 'string' },
    width: { type: 'number' },
    height: { type: 'number' },
    class: { type: 'string' },
  },
};

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

module.exports = { Image };
