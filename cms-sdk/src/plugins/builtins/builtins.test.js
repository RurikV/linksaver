const { PluginRegistry } = require('../registry');
const { registerBuiltins } = require('./index');
const { HTMLRenderer } = require('../../renderers/html');

describe('Built-in plugins', () => {
  function setup() {
    const registry = new PluginRegistry();
    registerBuiltins(registry);
    const renderer = new HTMLRenderer({ registry });
    return { registry, renderer };
  }

  describe('TextBlock', () => {
    test('renders default <p> with escaped text and optional class', async () => {
      const { renderer } = setup();
      const html = await renderer.render({ type: 'TextBlock', params: { text: '<hi>&"\'' } });
      expect(html).toBe('<p>&lt;hi&gt;&amp;&quot;&#39;</p>');
      const html2 = await renderer.render({ type: 'TextBlock', params: { text: 'Hello', class: 'lead' } });
      expect(html2).toBe('<p class="lead">Hello</p>');
    });

    test('supports tag override', async () => {
      const { renderer } = setup();
      const html = await renderer.render({ type: 'TextBlock', params: { text: 'Title', tag: 'h2' } });
      expect(html).toBe('<h2>Title</h2>');
    });
  });

  describe('Image', () => {
    test('renders img with attributes, escaping values', async () => {
      const { renderer } = setup();
      const html = await renderer.render({ type: 'Image', params: { src: 'x.png', alt: 'a<b>', width: 100, height: 50, class: 'rounded' } });
      expect(html).toBe('<img src="x.png" alt="a&lt;b&gt;" width="100" height="50" class="rounded" />');
    });
  });

  describe('List', () => {
    test('renders unordered list by default', async () => {
      const { renderer } = setup();
      const html = await renderer.render({ type: 'List', params: { items: ['A', 'B'] } });
      expect(html).toBe('<ul><li>A</li><li>B</li></ul>');
    });

    test('renders ordered list with classes and itemKey', async () => {
      const { renderer } = setup();
      const html = await renderer.render({ type: 'List', params: { ordered: true, class: 'nums', itemClass: 'item', itemKey: 'name', items: [{ name: 'Alfa' }, { name: 'Beta' }] } });
      expect(html).toBe('<ol class="nums"><li class="item">Alfa</li><li class="item">Beta</li></ol>');
    });
  });
});
