import { useState, useEffect } from "react";
import { useApi } from "../hooks/use-api";
import { useAppContext } from "../context";

// Copy the render function from cms.jsx
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

const ContentHub = () => {
  const { getRequest } = useApi();
  const { state } = useAppContext();
  const [activeTab, setActiveTab] = useState('personal');
  const [featuredContent, setFeaturedContent] = useState([]);
  const [personalContent, setPersonalContent] = useState([]);
  const [userCollections, setUserCollections] = useState([]);
  const [remixContent, setRemixContent] = useState([]);

  const tabs = [
    { id: 'personal', label: '🔖 My Links', icon: '📁' },
    { id: 'discover', label: '🔍 Discover', icon: '🌟' },
    { id: 'collections', label: '📚 Collections', icon: '💎' },
    { id: 'remix', label: '🎨 Remix', icon: '🎭' },
    { id: 'trending', label: '📈 Trending', icon: '🔥' }
  ];

  // Load personal links
  useEffect(() => {
    if (activeTab === 'personal') {
      loadPersonalLinks();
    }
  }, [activeTab]);

  // Load featured CMS content
  useEffect(() => {
    if (activeTab === 'discover') {
      loadFeaturedContent();
    }
  }, [activeTab]);

  // Load user collections
  useEffect(() => {
    if (activeTab === 'collections') {
      loadUserCollections();
    }
  }, [activeTab]);

  // Load trending content
  useEffect(() => {
    if (activeTab === 'trending') {
      loadTrendingContent();
    }
  }, [activeTab]);

  const loadPersonalLinks = async () => {
    try {
      const res = await getRequest("links");
      setPersonalContent(res.data.links || []);
    } catch (error) {
      console.error("Failed to load personal links:", error);
    }
  };

  const loadFeaturedContent = async () => {
    try {
      // Load featured CMS pages
      const featuredPages = ['featured-links', 'user-stories', 'getting-started'];
      const content = [];

      for (const pageSlug of featuredPages) {
        try {
          const response = await fetch(`${import.meta.env.VITE_CMS_COMPOSER_URL || "http://localhost:7781"}/v1/pages/${pageSlug}`, {
            headers: { "X-Link-Saver": "1" }
          });

          if (response.ok) {
            const pageData = await response.json();
            content.push({
              id: pageSlug,
              title: pageData.meta?.title || pageSlug,
              description: pageData.meta?.description || '',
              type: 'cms-page',
              content: pageData.root,
              slug: pageSlug
            });
          }
        } catch (error) {
          console.error(`Failed to load ${pageSlug}:`, error);
        }
      }

      setFeaturedContent(content);
    } catch (error) {
      console.error("Failed to load featured content:", error);
    }
  };

  const loadUserCollections = async () => {
    try {
      // In a real app, this would load user-created collections
      // For now, create sample collections
      const collections = [
        {
          id: 'work-resources',
          title: 'Work Resources',
          description: 'Links I use for work',
          items: personalContent.slice(0, 3),
          isPublic: true,
          likes: 12,
          views: 45
        },
        {
          id: 'learning-materials',
          title: 'Learning Materials',
          description: 'Educational resources',
          items: personalContent.slice(3, 6),
          isPublic: false,
          likes: 0,
          views: 0
        }
      ];

      setUserCollections(collections);
    } catch (error) {
      console.error("Failed to load collections:", error);
    }
  };

  const loadTrendingContent = async () => {
    try {
      // Load trending links from CMS stats
      const response = await fetch("http://localhost:7777/cms-stats/popular-links?limit=20", {
        headers: { "X-Link-Saver": "1" }
      });

      if (response.ok) {
        const data = await response.json();
        setRemixContent(data.links || []);
      }
    } catch (error) {
      console.error("Failed to load trending content:", error);
    }
  };

  const addToRemix = (item) => {
    setRemixContent(prev => [...prev, item]);
  };

  const createCollection = () => {
    const newCollection = {
      id: `collection-${Date.now()}`,
      title: 'New Collection',
      description: 'My curated collection',
      items: remixContent,
      isPublic: false,
      likes: 0,
      views: 0
    };

    setUserCollections(prev => [...prev, newCollection]);
    setRemixContent([]);
    setActiveTab('collections');
  };

  const renderPersonalLinks = () => (
    <div className="personal-links">
      <div className="links-grid" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
        gap: '20px',
        padding: '20px'
      }}>
        {personalContent.map(link => (
          <div key={link.linkId} className="link-card" style={{
            background: 'white',
            padding: '20px',
            borderRadius: '8px',
            border: '1px solid #e0e0e0',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}>
            <h3 style={{ margin: '0 0 10px 0', color: '#333' }}>{link.title}</h3>
            <a href={link.url} target="_blank" rel="noopener noreferrer"
               style={{ color: '#007bff', textDecoration: 'none', fontSize: '0.9em' }}>
              {link.url}
            </a>
            <div style={{ marginTop: '10px' }}>
              {link.tags.map(tag => (
                <span key={tag.tagId} style={{
                  background: '#e9ecef',
                  padding: '2px 8px',
                  borderRadius: '12px',
                  fontSize: '0.8em',
                  marginRight: '5px',
                  color: '#6c757d'
                }}>
                  {tag.title}
                </span>
              ))}
            </div>
            <button
              onClick={() => addToRemix(link)}
              style={{
                marginTop: '15px',
                background: '#007bff',
                color: 'white',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              + Add to Remix
            </button>
          </div>
        ))}
      </div>
    </div>
  );

  const renderFeaturedContent = () => (
    <div className="featured-content">
      <div style={{ padding: '20px' }}>
        {featuredContent.map(page => (
          <div key={page.id} className="content-card" style={{
            background: 'white',
            margin: '20px 0',
            borderRadius: '8px',
            border: '1px solid #e0e0e0',
            overflow: 'hidden'
          }}>
            <div style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              padding: '20px'
            }}>
              <h2 style={{ margin: 0 }}>{page.title}</h2>
              <p style={{ margin: '10px 0 0 0', opacity: 0.9 }}>{page.description}</p>
            </div>

            <div style={{ padding: '20px' }}>
              <div className="cms-content" data-testid="cms-root">
                {renderNode(page.content)}
              </div>
            </div>

            <div style={{
              padding: '15px 20px',
              background: '#f8f9fa',
              borderTop: '1px solid #e0e0e0'
            }}>
              <button style={{
                background: '#28a745',
                color: 'white',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '4px',
                cursor: 'pointer'
              }}>
                💾 Save to Collection
              </button>
              <button style={{
                background: '#17a2b8',
                color: 'white',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '4px',
                cursor: 'pointer',
                marginLeft: '10px'
              }}>
                🔄 Remix
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderCollections = () => (
    <div className="collections">
      <div style={{ padding: '20px' }}>
        <h2>My Collections</h2>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
          gap: '20px'
        }}>
          {userCollections.map(collection => (
            <div key={collection.id} className="collection-card" style={{
              background: 'white',
              border: '1px solid #e0e0e0',
              borderRadius: '8px',
              overflow: 'hidden'
            }}>
              <div style={{
                background: collection.isPublic ? '#d4edda' : '#f8f9fa',
                padding: '15px',
                borderBottom: '1px solid #e0e0e0'
              }}>
                <h3 style={{ margin: '0 0 5px 0' }}>{collection.title}</h3>
                <p style={{ margin: 0, color: '#6c757d', fontSize: '0.9em' }}>
                  {collection.description}
                </p>
                <div style={{ marginTop: '10px' }}>
                  <span style={{
                    background: collection.isPublic ? '#28a745' : '#6c757d',
                    color: 'white',
                    padding: '2px 8px',
                    borderRadius: '12px',
                    fontSize: '0.8em'
                  }}>
                    {collection.isPublic ? '🌍 Public' : '🔒 Private'}
                  </span>
                </div>
              </div>

              <div style={{ padding: '15px' }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '10px'
                }}>
                  <span style={{ fontSize: '0.9em', color: '#6c757d' }}>
                    {collection.items.length} items
                  </span>
                  <div style={{ fontSize: '0.8em', color: '#6c757d' }}>
                    {collection.isPublic && (
                      <>
                        <span>❤️ {collection.likes}</span>
                        <span style={{ marginLeft: '10px' }}>👁️ {collection.views}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderRemix = () => (
    <div className="remix-workspace">
      <div style={{ padding: '20px' }}>
        <h2>🎨 Remix Workspace</h2>
        <p style={{ color: '#6c757d' }}>
          Combine your links with featured content to create new collections
        </p>

        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 300px',
          gap: '20px',
          marginTop: '20px'
        }}>
          <div className="remix-canvas" style={{
            background: 'white',
            border: '2px dashed #007bff',
            borderRadius: '8px',
            minHeight: '400px',
            padding: '20px'
          }}>
            <h3>Your Remix</h3>
            {remixContent.length === 0 ? (
              <p style={{ color: '#6c757d', textAlign: 'center', marginTop: '50px' }}>
                Drag items here or click "+ Add to Remix" from your links
              </p>
            ) : (
              <div className="remix-items">
                {remixContent.map((item, index) => (
                  <div key={index} style={{
                    background: '#f8f9fa',
                    padding: '10px',
                    borderRadius: '4px',
                    margin: '5px 0',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <div>
                      <strong>{item.title || item.url}</strong>
                      {item.url && (
                        <div style={{ fontSize: '0.8em', color: '#6c757d' }}>
                          {item.url}
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => setRemixContent(prev => prev.filter((_, i) => i !== index))}
                      style={{
                        background: '#dc3545',
                        color: 'white',
                        border: 'none',
                        borderRadius: '50%',
                        width: '24px',
                        height: '24px',
                        cursor: 'pointer'
                      }}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="remix-actions" style={{
            background: 'white',
            padding: '20px',
            borderRadius: '8px',
            border: '1px solid #e0e0e0'
          }}>
            <h4>Actions</h4>
            <div style={{ marginTop: '15px' }}>
              <button
                onClick={createCollection}
                disabled={remixContent.length === 0}
                style={{
                  width: '100%',
                  background: remixContent.length > 0 ? '#28a745' : '#6c757d',
                  color: 'white',
                  border: 'none',
                  padding: '10px',
                  borderRadius: '4px',
                  cursor: remixContent.length > 0 ? 'pointer' : 'not-allowed'
                }}
              >
                💾 Create Collection
              </button>
            </div>

            <div style={{ marginTop: '10px' }}>
              <button
                disabled={remixContent.length === 0}
                style={{
                  width: '100%',
                  background: remixContent.length > 0 ? '#17a2b8' : '#6c757d',
                  color: 'white',
                  border: 'none',
                  padding: '10px',
                  borderRadius: '4px',
                  cursor: remixContent.length > 0 ? 'pointer' : 'not-allowed'
                }}
              >
                🌐 Publish as CMS Page
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderTrending = () => (
    <div className="trending-content">
      <div style={{ padding: '20px' }}>
        <h2>🔥 Trending Now</h2>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: '20px',
          marginTop: '20px'
        }}>
          {remixContent.map((item, index) => (
            <div key={index} className="trending-item" style={{
              background: 'white',
              padding: '20px',
              borderRadius: '8px',
              border: '1px solid #e0e0e0',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                marginBottom: '10px'
              }}>
                <h4 style={{ margin: 0, color: '#333' }}>{item.title}</h4>
                <span style={{
                  background: '#ffc107',
                  color: '#333',
                  padding: '2px 8px',
                  borderRadius: '12px',
                  fontSize: '0.8em',
                  fontWeight: 'bold'
                }}>
                  #{index + 1}
                </span>
              </div>

              <a href={item.url} target="_blank" rel="noopener noreferrer"
                 style={{ color: '#007bff', textDecoration: 'none', fontSize: '0.9em' }}>
                {item.url}
              </a>

              <div style={{
                marginTop: '15px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <span style={{
                  background: '#e9ecef',
                  padding: '4px 8px',
                  borderRadius: '4px',
                  fontSize: '0.8em',
                  color: '#6c757d'
                }}>
                  💾 {item.saveCount || 0} saves
                </span>
                <button
                  onClick={() => addToRemix(item)}
                  style={{
                    background: '#007bff',
                    color: 'white',
                    border: 'none',
                    padding: '6px 12px',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '0.8em'
                  }}
                >
                  + Remix
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'personal': return renderPersonalLinks();
      case 'discover': return renderFeaturedContent();
      case 'collections': return renderCollections();
      case 'remix': return renderRemix();
      case 'trending': return renderTrending();
      default: return renderPersonalLinks();
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f8f9fa' }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        padding: '30px 20px',
        textAlign: 'center'
      }}>
        <h1 style={{ margin: 0, fontSize: '2.5em' }}>🚀 Content Hub</h1>
        <p style={{ margin: '10px 0 0 0', opacity: 0.9, fontSize: '1.1em' }}>
          Your personal links meet curated content
        </p>
      </div>

      {/* Navigation Tabs */}
      <div style={{
        background: 'white',
        borderBottom: '1px solid #e0e0e0',
        position: 'sticky',
        top: 0,
        zIndex: 100
      }}>
        <div style={{
          display: 'flex',
          overflowX: 'auto',
          padding: '0 20px'
        }}>
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                flex: '1',
                minWidth: '120px',
                padding: '15px 20px',
                background: activeTab === tab.id ? '#007bff' : 'transparent',
                color: activeTab === tab.id ? 'white' : '#333',
                border: 'none',
                borderBottom: activeTab === tab.id ? '3px solid #0056b3' : '3px solid transparent',
                cursor: 'pointer',
                fontSize: '0.9em',
                fontWeight: activeTab === tab.id ? 'bold' : 'normal',
                transition: 'all 0.3s ease'
              }}
            >
              <div style={{ marginBottom: '5px' }}>{tab.icon}</div>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content Area */}
      <div className="content-area">
        {renderContent()}
      </div>
    </div>
  );
};

export default ContentHub;