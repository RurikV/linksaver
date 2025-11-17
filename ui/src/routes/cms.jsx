import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";

// Helper: safe text conversion similar to server-side logic but React escapes by default
function itemToString(item, itemKey) {
  if (item == null) return "";
  const t = typeof item;
  if (t === "string" || t === "number" || t === "boolean") return String(item);
  if (itemKey && t === "object" && Object.prototype.hasOwnProperty.call(item, itemKey)) {
    const v = item[itemKey];
    return v == null ? "" : String(v);
  }
  try {
    return JSON.stringify(item);
  } catch (_) {
    return String(item);
  }
}

// Client-side plugin map mirroring built-ins
const plugins = {
  Container: ({ params = {}, children }) => {
    const Tag = params.tag || "div";
    const className = params.class || undefined;
    return <Tag className={className}>{children}</Tag>;
  },
  TextBlock: ({ params = {} }) => {
    const Tag = params.tag || "p";
    const className = params.class || undefined;
    return <Tag className={className}>{params.text ?? ""}</Tag>;
  },
  Image: ({ params = {} }) => {
    const { src = "", alt = "", width, height, class: klass } = params;
    const className = klass || undefined;
    const wh = {};
    if (typeof width === "number") wh.width = width;
    if (typeof height === "number") wh.height = height;
    return <img src={src} alt={alt} className={className} {...wh} />;
  },
  List: ({ params = {} }) => {
    const Tag = params.ordered ? "ol" : "ul";
    const className = params.class || undefined;
    const itemClass = params.itemClass || undefined;
    const items = Array.isArray(params.items) ? params.items : [];
    return (
      <Tag className={className}>
        {items.map((it, idx) => (
          <li key={idx} className={itemClass}>
            {itemToString(it, params.itemKey)}
          </li>
        ))}
      </Tag>
    );
  },
};

function renderNode(node) {
  if (!node) return null;
  const { type, params = {}, children = [] } = node;
  const Comp = plugins[type];
  if (!Comp) return null;
  const renderedChildren = Array.isArray(children)
    ? children.map((c, i) => <Fragmented key={i} node={c} />)
    : null;
  return <Comp params={params}>{renderedChildren}</Comp>;
}

function Fragmented({ node }) {
  return renderNode(node);
}

export default function CmsRoute() {
  const { slug } = useParams();
  const [state, setState] = useState({ loading: true, error: null, notFound: false, page: null });

  const composerUrl = useMemo(() => {
    return (import.meta.env.VITE_CMS_COMPOSER_URL || "http://localhost:7781").replace(/\/$/, "");
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setState((s) => ({ ...s, loading: true, error: null, notFound: false }));
      try {
        const res = await fetch(`${composerUrl}/v1/pages/${encodeURIComponent(slug)}`, {
          headers: { "Accept": "application/json", "X-Link-Saver": "1" },
        });
        if (cancelled) return;
        if (res.status === 404) {
          setState({ loading: false, error: null, notFound: true, page: null });
          return;
        }
        if (!res.ok) {
          throw new Error(`Request failed (${res.status})`);
        }
        const data = await res.json();
        if (!cancelled) setState({ loading: false, error: null, notFound: false, page: data });
      } catch (err) {
        if (!cancelled) setState({ loading: false, error: err?.message || "Error loading page", notFound: false, page: null });
      }
    }
    if (slug) load();
    return () => { cancelled = true; };
  }, [slug, composerUrl]);

  if (state.loading) return <div style={{ padding: 16 }}>Loading CMS page…</div>;
  if (state.notFound) return <div style={{ padding: 16 }}>Page not found.</div>;
  if (state.error) return <div style={{ padding: 16 }}>Error: {state.error}</div>;

  const tree = state.page?.root;
  const title = state.page?.meta?.title || slug;

  return (
    <div style={{ padding: 16 }}>
      <h1 style={{ marginBottom: 16 }}>{title}</h1>
      <div data-testid="cms-root">
        {renderNode(tree)}
      </div>
    </div>
  );
}
