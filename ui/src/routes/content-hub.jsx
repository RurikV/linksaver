import { useState, useEffect } from "react";
import styled from "styled-components";
import { toast } from "react-toastify";
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

// Modal Styled Components
const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background: white;
  border-radius: 8px;
  width: 90%;
  max-width: 500px;
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #e0e0e0;
`;

const ModalTitle = styled.h3`
  margin: 0;
  font-size: 1.2em;
  color: #333;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 1.5em;
  cursor: pointer;
  color: #666;
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    color: #333;
  }
`;

const ModalBody = styled.div`
  padding: 20px;
`;

const ModalFooter = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 20px;
  border-top: 1px solid #e0e0e0;
`;

const FormGroup = styled.div`
  margin-bottom: 20px;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 5px;
  font-weight: 500;
  color: #333;
`;

const Input = styled.input`
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1em;

  &:focus {
    outline: none;
    border-color: #007bff;
    box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1em;
  font-family: inherit;
  resize: vertical;

  &:focus {
    outline: none;
    border-color: #007bff;
    box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
  }
`;

const CheckboxLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 500;
  color: #333;
  cursor: pointer;

  input[type="checkbox"] {
    width: auto;
    margin: 0;
  }
`;

const SaveButton = styled.button`
  background: #007bff;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;

  &:hover {
    background: #0056b3;
  }

  &:disabled {
    background: #6c757d;
    cursor: not-allowed;
  }
`;

const CancelButton = styled.button`
  background: #6c757d;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;

  &:hover {
    background: #545b62;
  }
`;

const PublicBadge = styled.span`
  background: #28a745;
  color: white;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 0.7em;
  font-weight: 500;
  margin-left: 10px;
`;

const ContentHub = () => {
  const { getRequest, postRequest, putRequest, deleteRequest } = useApi();
  const { state } = useAppContext();
  const user = state.user;
  const [activeTab, setActiveTab] = useState('personal');
  const [featuredContent, setFeaturedContent] = useState([]);
  const [personalContent, setPersonalContent] = useState([]);
  const [userCollections, setUserCollections] = useState([]);
  const [remixContent, setRemixContent] = useState([]);

  // Extensibility demo state
  const [selectedMiddleware, setSelectedMiddleware] = useState('locale-resolver');
  const [enabledFeatures, setEnabledFeatures] = useState(['darkMode']);
  const [dslExample, setDslExample] = useState('simple');
  const [pluginConfig, setPluginConfig] = useState({
    autoTagging: true,
    analytics: false,
    notifications: true
  });

  // IoC/DI demo state
  const [selectedService, setSelectedService] = useState('linkService');
  const [diType, setDiType] = useState('constructor');
  const [dependencyGraph, setDependencyGraph] = useState('simple');
  const [showResolution, setShowResolution] = useState(false);

  // Code Explorer state
  const [selectedPattern, setSelectedPattern] = useState('cms');
  const [selectedFile, setSelectedFile] = useState('plugin-registry');
  const [showUsage, setShowUsage] = useState(false);

  // Modal and editing state
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState(''); // 'create-collection', 'edit-collection', 'view-collection'
  const [selectedCollection, setSelectedCollection] = useState(null);
  const [editingCollection, setEditingCollection] = useState({
    title: '',
    description: '',
    isPublic: false
  });

  const tabs = [
    { id: 'personal', label: 'My Links' },
    { id: 'discover', label: 'Discover' },
    { id: 'collections', label: 'Collections' },
    { id: 'remix', label: 'Remix' },
    { id: 'trending', label: 'Trending' },
    { id: 'cms', label: 'CMS' },
    { id: 'extensibility', label: 'Extensibility' },
    { id: 'ioc-di', label: 'IoC & DI' },
    { id: 'code-explorer', label: 'Code Explorer' }
  ];

  // Load personal links
  useEffect(() => {
    console.log('Active tab changed to:', activeTab);
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
      console.log('Loading personal links...');
      const res = await getRequest("links");
      console.log('Links response:', res);
      setPersonalContent(res.data?.links || []);
      console.log('Personal content set:', res.data?.links?.length || 0, 'links');
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
      // Load real collections from API
      console.log('Loading collections...');
      const response = await getRequest("collections");
      console.log('Collections response:', response);
      const collections = response.data?.collections || [];

      // Transform the data to match expected format
      const formattedCollections = collections.map(collection => ({
        id: collection.collectionId,
        _id: collection._id, // MongoDB _id for API calls
        userId: collection.user, // Add user reference
        title: collection.title,
        description: collection.description || '',
        items: collection.links || [],
        cmsPages: collection.cmsPages || [], // Add CMS pages
        isPublic: collection.isPublic || false,
        likes: collection.metadata?.likes || 0,
        views: collection.metadata?.views || 0,
        createdAt: collection.createdAt,
        updatedAt: collection.updatedAt
      }));

      setUserCollections(formattedCollections);
    } catch (error) {
      console.error("Failed to load collections:", error);
      // Fallback to sample data if API fails
      const sampleCollections = [
        {
          id: 'sample-work',
          title: 'Work Resources',
          description: 'Links I use for work',
          items: personalContent.slice(0, 2),
          isPublic: true,
          likes: 12,
          views: 45,
          createdAt: new Date().toISOString()
        },
        {
          id: 'sample-learning',
          title: 'Learning Materials',
          description: 'Educational resources',
          items: personalContent.slice(2, 4),
          isPublic: false,
          likes: 0,
          views: 0,
          createdAt: new Date().toISOString()
        }
      ];
      setUserCollections(sampleCollections);
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

  // Handler functions for Discover page buttons
  const handleSaveToCollection = (content) => {
    // Add CMS page to a new collection or existing collection
    const collectionData = {
      title: `Collection with ${content.title}`,
      description: `Created from ${content.title}`,
      linkIds: [],
      cmsPages: [content.slug],
      isPublic: false
    };

    setEditingCollection(collectionData);
    setSelectedCollection(null);
    setModalType('create-collection');
    setShowModal(true);
  };

  const handleRemixContent = (content) => {
    // Add CMS page to remix workspace
    addToRemix({
      type: 'cms-page',
      slug: content.slug,
      title: content.title,
      content: content.content
    });
    setActiveTab('remix');
  };

  // Handler for collection cards
  const handleCollectionClick = (collection) => {
    setSelectedCollection(collection);
    setEditingCollection({
      title: collection.title,
      description: collection.description || '',
      isPublic: collection.isPublic
    });
    setModalType('view-collection');
    setShowModal(true);
  };

  const handleEditCollection = (collection) => {
    setSelectedCollection(collection);
    setEditingCollection({
      title: collection.title,
      description: collection.description || '',
      isPublic: collection.isPublic
    });
    setModalType('edit-collection');
    setShowModal(true);
  };

  const handleDeleteCollection = async (collection) => {
    if (!confirm(`Are you sure you want to delete "${collection.title}"?`)) {
      return;
    }

    try {
      await deleteRequest(`collections/${collection.id}`);
      setUserCollections(prev => prev.filter(c => c.id !== collection.id));
      toast.success('Collection deleted successfully');
    } catch (error) {
      console.error("Error deleting collection:", error);
      toast.error('Failed to delete collection');
    }
  };

  const handleLikeCollection = async (collection) => {
    try {
      await postRequest(`collections/${collection.id}/like`);
      setUserCollections(prev => prev.map(c =>
        c.id === collection.id
          ? { ...c, likes: c.likes + 1 }
          : c
      ));
    } catch (error) {
      console.error("Error liking collection:", error);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedCollection(null);
    setEditingCollection({ title: '', description: '', isPublic: false });
  };

  const saveCollection = async () => {
    if (!editingCollection.title.trim()) {
      toast.error('Please enter a title for your collection');
      return;
    }

    try {
      if (modalType === 'edit-collection' && selectedCollection) {
        // Update existing collection
        await putRequest(`collections/${selectedCollection.id}`, {
          title: editingCollection.title,
          description: editingCollection.description,
          isPublic: editingCollection.isPublic
        });

        setUserCollections(prev => prev.map(c =>
          c.id === selectedCollection.id
            ? { ...c, ...editingCollection }
            : c
        ));
      } else {
        // Create new collection
        const response = await postRequest("collections", editingCollection);
        const result = response.data;

        const newCollection = {
          id: result.collection.collectionId,
          title: result.collection.title,
          description: result.collection.description,
          items: [],
          isPublic: result.collection.isPublic,
          likes: 0,
          views: 0,
          createdAt: new Date().toISOString()
        };

        setUserCollections(prev => [...prev, newCollection]);
      }

      closeModal();
      toast.success(modalType === 'edit-collection' ? 'Collection updated successfully!' : 'Collection created successfully!');
    } catch (error) {
      console.error("Error saving collection:", error);
      toast.error('Failed to save collection');
    }
  };

  const createCollection = async () => {
    if (remixContent.length === 0) {
      toast.error('Please add some items to your collection first');
      return;
    }

    try {
      // Extract valid link IDs (use MongoDB _id for collections)
      const linkIds = remixContent
        .filter(item => item._id && !item.type) // Only actual LinkSaver links
        .map(item => item._id) // Use MongoDB _id (ObjectId)
        .filter(Boolean);

      const cmsPages = remixContent
        .filter(item => item.type === 'cms-page')
        .map(item => item.slug)
        .filter(Boolean);

      const collectionData = {
        title: `Collection - ${new Date().toLocaleDateString()}`,
        description: `Created with ${remixContent.length} items`,
        linkIds: linkIds,
        isPublic: false,
        cmsPages: cmsPages
      };

      console.log('Creating collection with data:', collectionData);

      // Use the useApi hook for proper authentication
      const response = await postRequest("collections", collectionData);

      if (response.data) {
        const result = response.data;

        // Add to local state
        const newCollection = {
          id: result.collection.collectionId,
          title: result.collection.title,
          description: result.collection.description,
          items: remixContent,
          isPublic: result.collection.isPublic,
          likes: 0,
          views: 0,
          createdAt: new Date().toISOString()
        };

        setUserCollections(prev => [...prev, newCollection]);
        setRemixContent([]);
        setActiveTab('collections');
        toast.success('Collection created successfully!');
      } else {
        throw new Error('Failed to create collection');
      }
    } catch (error) {
      console.error("Error creating collection:", error);
      // Fallback to local creation if API fails
      const newCollection = {
        id: `local-collection-${Date.now()}`,
        title: 'My Remix Collection',
        description: 'Created locally - sync to save permanently',
        items: remixContent,
        isPublic: false,
        likes: 0,
        views: 0,
        createdAt: new Date().toISOString()
      };

      setUserCollections(prev => [...prev, newCollection]);
      setRemixContent([]);
      setActiveTab('collections');
      toast.info('Collection created locally (will sync when API is available)');
    }
  };

  const renderPersonalLinks = () => (
    <div className="personal-links">
      <div className="links-grid" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
        gap: '16px',
        padding: '20px'
      }}>
        {personalContent.map(link => (
          <div key={link.linkId} className="link-card" style={{
            background: 'white',
            padding: '16px',
            borderRadius: '8px',
            border: '1px solid #e0e0e0',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            transition: 'all 0.2s ease',
            height: 'fit-content'
          }}>
            <div style={{ marginBottom: '12px' }}>
              <h3 style={{
                margin: '0 0 8px 0',
                color: '#333',
                fontSize: '1.1em',
                fontWeight: '600',
                lineHeight: '1.3',
                display: '-webkit-box',
                WebkitLineClamp: '2',
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden'
              }}>{link.title}</h3>

              <a href={link.url} target="_blank" rel="noopener noreferrer"
                 style={{
                   color: '#007bff',
                   textDecoration: 'none',
                   fontSize: '0.85em',
                   display: 'block',
                   overflow: 'hidden',
                   textOverflow: 'ellipsis',
                   whiteSpace: 'nowrap'
                 }}>
                {link.url}
              </a>
            </div>

            {link.tags && link.tags.length > 0 && (
              <div style={{ marginBottom: '12px' }}>
                {link.tags.slice(0, 3).map(tag => (
                  <span key={tag.tagId} style={{
                    background: '#f8f9fa',
                    color: '#6c757d',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    fontSize: '0.75em',
                    marginRight: '4px',
                    marginBottom: '4px',
                    display: 'inline-block'
                  }}>
                    {tag.title}
                  </span>
                ))}
                {link.tags.length > 3 && (
                  <span style={{
                    background: '#f8f9fa',
                    color: '#6c757d',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    fontSize: '0.75em'
                  }}>
                    +{link.tags.length - 3} more
                  </span>
                )}
              </div>
            )}

            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingTop: '12px',
              borderTop: '1px solid #f0f0f0'
            }}>
              <span style={{
                color: '#6c757d',
                fontSize: '0.8em'
              }}>
                {new Date(link.date).toLocaleDateString()}
              </span>

              <button
                onClick={() => addToRemix(link)}
                style={{
                  background: '#007bff',
                  color: 'white',
                  border: 'none',
                  padding: '6px 12px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '0.85em',
                  transition: 'background 0.2s ease'
                }}
                onMouseOver={(e) => e.target.style.background = '#0056b3'}
                onMouseOut={(e) => e.target.style.background = '#007bff'}
              >
                + Add to Remix
              </button>
            </div>
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
              <button
              onClick={() => handleSaveToCollection(page)}
              style={{
                background: '#28a745',
                color: 'white',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Save to Collection
            </button>
            <button
              onClick={() => handleRemixContent(page)}
              style={{
                background: '#17a2b8',
                color: 'white',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '4px',
                cursor: 'pointer',
                marginLeft: '10px'
              }}
            >
              Remix
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
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px'
        }}>
          <h2 style={{ margin: 0 }}>My Collections</h2>
          <button
            onClick={() => setActiveTab('remix')}
            style={{
              background: '#007bff',
              color: 'white',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '0.9em'
            }}
          >
            + Create New Collection
          </button>
        </div>

        {userCollections.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '60px 20px',
            background: 'white',
            borderRadius: '8px',
            border: '1px solid #e0e0e0'
          }}>
            <div style={{ fontSize: '2em', marginBottom: '20px', color: '#6c757d' }}>Collections</div>
            <h3 style={{ color: '#333', marginBottom: '10px' }}>No Collections Yet</h3>
            <p style={{ color: '#6c757d', marginBottom: '20px' }}>
              Start building collections by adding links from your library or discovering content
            </p>
            <button
              onClick={() => setActiveTab('remix')}
              style={{
                background: '#007bff',
                color: 'white',
                border: 'none',
                padding: '10px 20px',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '1em'
              }}
            >
              Create Your First Collection
            </button>
          </div>
        ) : (
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
                overflow: 'hidden',
                transition: 'box-shadow 0.2s ease',
                cursor: 'pointer'
              }}
              onClick={() => {
                // Show collection details in modal
                setSelectedCollection(collection);
                setModalType('view-collection');
                setShowModal(true);
              }}
              >
                <div style={{
                  background: collection.isPublic ? '#d4edda' : '#f8f9fa',
                  padding: '15px',
                  borderBottom: '1px solid #e0e0e0'
                }}>
                  <h3 style={{ margin: '0 0 5px 0', fontSize: '1.1em' }}>{collection.title}</h3>
                  <p style={{
                    margin: 0,
                    color: '#6c757d',
                    fontSize: '0.9em',
                    display: '-webkit-box',
                    WebkitLineClamp: '2',
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    lineHeight: '1.4'
                  }}>
                    {collection.description || 'No description provided'}
                  </p>
                  <div style={{ marginTop: '10px', display: 'flex', gap: '8px' }}>
                    <span style={{
                      background: collection.isPublic ? '#28a745' : '#6c757d',
                      color: 'white',
                      padding: '2px 8px',
                      borderRadius: '12px',
                      fontSize: '0.75em',
                      fontWeight: '500'
                    }}>
                      {collection.isPublic ? 'Public' : 'Private'}
                    </span>
                    {collection.id.startsWith('local-') && (
                      <span style={{
                        background: '#ffc107',
                        color: '#333',
                        padding: '2px 8px',
                        borderRadius: '12px',
                        fontSize: '0.75em',
                        fontWeight: '500'
                      }}>
                        Local
                      </span>
                    )}
                  </div>
                </div>

                <div style={{ padding: '15px' }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '10px'
                  }}>
                    <span style={{
                      fontSize: '0.9em',
                      color: '#6c757d',
                      fontWeight: '500'
                    }}>
                      {collection.items.length} items
                    </span>
                    <span style={{
                      fontSize: '0.8em',
                      color: '#6c757d'
                    }}>
                      {collection.createdAt && new Date(collection.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div style={{
                    display: 'flex',
                    gap: '8px',
                    justifyContent: 'flex-end',
                    padding: '10px 0'
                  }}>
                    <button
                      onClick={() => handleCollectionClick(collection)}
                      style={{
                        background: '#007bff',
                        color: 'white',
                        border: 'none',
                        padding: '6px 12px',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '0.8em',
                        marginRight: '4px'
                      }}
                    >
                      View
                    </button>
                    <button
                      onClick={() => handleEditCollection(collection)}
                      style={{
                        background: '#ffc107',
                        color: '#333',
                        border: 'none',
                        padding: '6px 12px',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '0.8em',
                        marginRight: '4px'
                      }}
                    >
                      Edit
                    </button>
                    {collection.isPublic ? (
                      <button
                        onClick={() => handleLikeCollection(collection)}
                        style={{
                          background: '#e83e8c',
                          color: 'white',
                          border: 'none',
                          padding: '6px 12px',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '0.8em',
                          marginRight: '4px'
                        }}
                      >
                        Likes ({collection.likes})
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          collection.isPublic = true;
                          handleEditCollection(collection);
                        }}
                        style={{
                          background: '#28a745',
                          color: 'white',
                          border: 'none',
                          padding: '6px 12px',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '0.8em',
                          marginRight: '4px'
                        }}
                      >
                        Make Public
                      </button>
                    )}
                    <button
                      onClick={() => handleDeleteCollection(collection)}
                      style={{
                        background: '#dc3545',
                        color: 'white',
                        border: 'none',
                        padding: '6px 12px',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '0.8em'
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const renderRemix = () => (
    <div className="remix-workspace">
      <div style={{ padding: '20px' }}>
        <h2>Remix Workspace</h2>
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
                Create Collection
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
                Publish as CMS Page
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
        <h2>Trending Now</h2>
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
                  {item.saveCount || 0} saves
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

  const renderCMS = () => {
    return (
      <div style={{ padding: '20px' }}>
        <div style={{ marginBottom: '30px' }}>
          <h2 style={{ fontSize: '2em', marginBottom: '10px', color: '#333' }}>
            CMS Component System
          </h2>
          <p style={{ fontSize: '1.1em', color: '#666', lineHeight: '1.6' }}>
            The LinkSaver CMS is built on a modular, plugin-based architecture that allows for dynamic page generation through reusable components.
          </p>
        </div>

        {/* Component Architecture Overview */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '20px',
          marginBottom: '40px'
        }}>
          <div style={{
            background: 'white',
            padding: '25px',
            borderRadius: '8px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
            border: '1px solid #e0e0e0'
          }}>
            <h3 style={{ color: '#007bff', marginBottom: '15px', fontSize: '1.3em' }}>
              🏗️ Universal Controller
            </h3>
            <p style={{ color: '#666', lineHeight: '1.5', marginBottom: '15px' }}>
              Central orchestrator managing component loading, rendering, and data flow. Handles plugin registration and lifecycle management.
            </p>
            <div style={{
              background: '#f8f9fa',
              padding: '12px',
              borderRadius: '4px',
              fontFamily: 'monospace',
              fontSize: '0.85em',
              color: '#333'
            }}>
              controller.registerComponent(plugin)<br/>
              controller.generatePage(config)
            </div>
          </div>

          <div style={{
            background: 'white',
            padding: '25px',
            borderRadius: '8px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
            border: '1px solid #e0e0e0'
          }}>
            <h3 style={{ color: '#28a745', marginBottom: '15px', fontSize: '1.3em' }}>
              🔌 Plugin System
            </h3>
            <p style={{ color: '#666', lineHeight: '1.5', marginBottom: '15px' }}>
              Dynamic component registration with hot loading support. Components can be added/removed without system restart.
            </p>
            <div style={{
              background: '#f8f9fa',
              padding: '12px',
              borderRadius: '4px',
              fontFamily: 'monospace',
              fontSize: '0.85em',
              color: '#333'
            }}>
              {`{ id, type, config, render, dataSource }`}
            </div>
          </div>

          <div style={{
            background: 'white',
            padding: '25px',
            borderRadius: '8px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
            border: '1px solid #e0e0e0'
          }}>
            <h3 style={{ color: '#17a2b8', marginBottom: '15px', fontSize: '1.3em' }}>
              🎨 Component Library
            </h3>
            <p style={{ color: '#666', lineHeight: '1.5', marginBottom: '15px' }}>
              Collection of reusable UI components including text, media, interactive, and layout components.
            </p>
            <div style={{
              background: '#f8f9fa',
              padding: '12px',
              borderRadius: '4px',
              fontFamily: 'monospace',
              fontSize: '0.85em',
              color: '#333'
            }}>
              Text, Media, Interactive, Layout
            </div>
          </div>
        </div>

        {/* Component Categories */}
        <div style={{ marginBottom: '40px' }}>
          <h3 style={{ fontSize: '1.5em', marginBottom: '20px', color: '#333' }}>
            Available Component Types
          </h3>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '15px'
          }}>
            {/* Text Components */}
            <div style={{
              background: 'linear-gradient(135deg, #007bff, #0056b3)',
              color: 'white',
              padding: '20px',
              borderRadius: '6px'
            }}>
              <h4 style={{ margin: '0 0 10px 0', fontSize: '1.2em' }}>📝 Text Components</h4>
              <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '0.9em' }}>
                <li>Heading</li>
                <li>Paragraph</li>
                <li>List</li>
                <li>Quote</li>
              </ul>
            </div>

            {/* Media Components */}
            <div style={{
              background: 'linear-gradient(135deg, #28a745, #1e7e34)',
              color: 'white',
              padding: '20px',
              borderRadius: '6px'
            }}>
              <h4 style={{ margin: '0 0 10px 0', fontSize: '1.2em' }}>🎬 Media Components</h4>
              <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '0.9em' }}>
                <li>Image Gallery</li>
                <li>Video Player</li>
                <li>File Display</li>
                <li>Audio Player</li>
              </ul>
            </div>

            {/* Interactive Components */}
            <div style={{
              background: 'linear-gradient(135deg, #17a2b8, #117a8b)',
              color: 'white',
              padding: '20px',
              borderRadius: '6px'
            }}>
              <h4 style={{ margin: '0 0 10px 0', fontSize: '1.2em' }}>⚡ Interactive Components</h4>
              <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '0.9em' }}>
                <li>Link Collection</li>
                <li>Tag Cloud</li>
                <li>Search Interface</li>
                <li>Contact Form</li>
              </ul>
            </div>

            {/* Layout Components */}
            <div style={{
              background: 'linear-gradient(135deg, #6f42c1, #563d7c)',
              color: 'white',
              padding: '20px',
              borderRadius: '6px'
            }}>
              <h4 style={{ margin: '0 0 10px 0', fontSize: '1.2em' }}>🎯 Layout Components</h4>
              <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '0.9em' }}>
                <li>Grid System</li>
                <li>Container</li>
                <li>Divider</li>
                <li>Spacer</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Component Structure */}
        <div style={{ marginBottom: '40px' }}>
          <h3 style={{ fontSize: '1.5em', marginBottom: '20px', color: '#333' }}>
            Component Structure
          </h3>
          <div style={{
            background: 'white',
            padding: '25px',
            borderRadius: '8px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
            border: '1px solid #e0e0e0',
            fontFamily: 'monospace',
            fontSize: '0.9em',
            overflow: 'auto'
          }}>
            <pre style={{ margin: 0, whiteSpace: 'pre-wrap', color: '#333' }}>
{`{
  id: "unique-component-id",
  type: "text-block|link-collection|media-gallery|custom",
  title: "Component Display Name",
  category: "content|layout|media|interactive",

  config: {
    title: { type: "string", required: true, default: "" },
    content: { type: "richtext", required: false, default: "" },
    styling: { type: "object", properties: {...} }
  },

  render: (config, data) => { /* Component JSX */ },

  dataSource: {
    type: "static|api|collection",
    endpoint: "/api/components/data",
    required: ["title", "content"]
  }
}`}
            </pre>
          </div>
        </div>

        {/* Data Flow Diagram */}
        <div style={{ marginBottom: '40px' }}>
          <h3 style={{ fontSize: '1.5em', marginBottom: '20px', color: '#333' }}>
            Data Flow Architecture
          </h3>
          <div style={{
            background: 'white',
            padding: '25px',
            borderRadius: '8px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
            border: '1px solid #e0e0e0'
          }}>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '15px',
              alignItems: 'center'
            }}>
              <div style={{
                background: '#007bff',
                color: 'white',
                padding: '15px 30px',
                borderRadius: '6px',
                textAlign: 'center',
                width: '100%',
                maxWidth: '200px'
              }}>
                User Request
              </div>
              <div style={{ fontSize: '20px', color: '#666' }}>↓</div>
              <div style={{
                background: '#28a745',
                color: 'white',
                padding: '15px 30px',
                borderRadius: '6px',
                textAlign: 'center',
                width: '100%',
                maxWidth: '200px'
              }}>
                Universal Controller
              </div>
              <div style={{ fontSize: '20px', color: '#666' }}>↓</div>
              <div style={{
                background: '#17a2b8',
                color: 'white',
                padding: '15px 30px',
                borderRadius: '6px',
                textAlign: 'center',
                width: '100%',
                maxWidth: '200px'
              }}>
                Component Manager
              </div>
              <div style={{ fontSize: '20px', color: '#666' }}>↓</div>
              <div style={{
                background: '#6f42c1',
                color: 'white',
                padding: '15px 30px',
                borderRadius: '6px',
                textAlign: 'center',
                width: '100%',
                maxWidth: '200px'
              }}>
                Data Layer (API/MongoDB)
              </div>
              <div style={{ fontSize: '20px', color: '#666' }}>↓</div>
              <div style={{
                background: '#fd7e14',
                color: 'white',
                padding: '15px 30px',
                borderRadius: '6px',
                textAlign: 'center',
                width: '100%',
                maxWidth: '200px'
              }}>
                Component Rendering
              </div>
              <div style={{ fontSize: '20px', color: '#666' }}>↓</div>
              <div style={{
                background: '#dc3545',
                color: 'white',
                padding: '15px 30px',
                borderRadius: '6px',
                textAlign: 'center',
                width: '100%',
                maxWidth: '200px'
              }}>
                Final HTML Output
              </div>
            </div>
          </div>
        </div>

        {/* Quick Links */}
        <div style={{
          background: 'linear-gradient(135deg, #f8f9fa, #e9ecef)',
          padding: '25px',
          borderRadius: '8px',
          textAlign: 'center'
        }}>
          <h3 style={{ marginBottom: '15px', color: '#333' }}>Learn More</h3>
          <p style={{ color: '#666', marginBottom: '20px' }}>
            Explore the complete CMS architecture documentation
          </p>
          <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <a
              href="/doc/CMS.md"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                background: '#007bff',
                color: 'white',
                padding: '12px 24px',
                borderRadius: '6px',
                textDecoration: 'none',
                fontWeight: '500',
                transition: 'all 0.3s ease'
              }}
            >
              📖 View Full Documentation
            </a>
            <a
              href="/cms/home"
              style={{
                background: '#28a745',
                color: 'white',
                padding: '12px 24px',
                borderRadius: '6px',
                textDecoration: 'none',
                fontWeight: '500',
                transition: 'all 0.3s ease'
              }}
            >
              🚀 Try Live Demo
            </a>
          </div>
        </div>
      </div>
    );
  };

  const renderExtensibility = () => {
    const middlewareExamples = [
      {
        id: 'locale-resolver',
        name: 'Locale Resolver',
        description: 'Determines user language and localization settings',
        icon: '🌍',
        config: {
          default: 'en',
          supported: ['en', 'es', 'fr', 'de'],
          header: 'Accept-Language'
        }
      },
      {
        id: 'feature-flags',
        name: 'Feature Flags',
        description: 'Enables/disables features based on user attributes',
        icon: '🚩',
        config: {
          provider: 'redis',
          endpoint: 'localhost:6379'
        }
      },
      {
        id: 'analytics-tracker',
        name: 'Analytics Tracker',
        description: 'Tracks user interactions and system metrics',
        icon: '📊',
        config: {
          provider: 'google-analytics',
          trackingId: 'GA-XXXXXXXX'
        }
      },
      {
        id: 'cache-manager',
        name: 'Cache Manager',
        description: 'Manages response caching and invalidation',
        icon: '💾',
        config: {
          ttl: 300,
          strategy: 'LRU',
          maxSize: 1000
        }
      }
    ];

    const featureFlags = [
      { id: 'darkMode', name: 'Dark Mode', description: 'Enable dark theme', rollout: 100 },
      { id: 'aiRecommendations', name: 'AI Recommendations', description: 'ML-powered suggestions', rollout: 25 },
      { id: 'advancedSearch', name: 'Advanced Search', description: 'Enhanced search capabilities', rollout: 50 },
      { id: 'exportFormats', name: 'Export Formats', description: 'Additional export options', rollout: 75 }
    ];

    const pluginExamples = [
      {
        id: 'auto-tagging',
        name: 'Auto-Tagging Plugin',
        description: 'Automatically categorizes links based on content',
        enabled: pluginConfig.autoTagging,
        toggle: () => setPluginConfig(prev => ({ ...prev, autoTagging: !prev.autoTagging }))
      },
      {
        id: 'analytics',
        name: 'Analytics Plugin',
        description: 'Real-time usage analytics and reporting',
        enabled: pluginConfig.analytics,
        toggle: () => setPluginConfig(prev => ({ ...prev, analytics: !prev.analytics }))
      },
      {
        id: 'notifications',
        name: 'Notifications Plugin',
        description: 'Custom notification system for link events',
        enabled: pluginConfig.notifications,
        toggle: () => setPluginConfig(prev => ({ ...prev, notifications: !prev.notifications }))
      }
    ];

    return (
      <div style={{ padding: '20px' }}>
        {/* Header */}
        <div style={{ marginBottom: '30px' }}>
          <h2 style={{ fontSize: '2em', marginBottom: '10px', color: '#333' }}>
            Extensibility Without Code Changes
          </h2>
          <p style={{ fontSize: '1.1em', color: '#666', lineHeight: '1.6' }}>
            Extend LinkSaver functionality through middleware, dynamic plugins, and DSL without modifying core code.
          </p>
        </div>

        {/* Extensibility Mechanisms Overview */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '20px',
          marginBottom: '40px'
        }}>
          <div style={{
            background: 'linear-gradient(135deg, #007bff, #0056b3)',
            color: 'white',
            padding: '25px',
            borderRadius: '8px'
          }}>
            <h3 style={{ fontSize: '1.4em', marginBottom: '15px' }}>🔄 Middleware System</h3>
            <p style={{ marginBottom: '15px', lineHeight: '1.5' }}>
              Intercept and modify requests/responses in the processing pipeline
            </p>
            <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '0.9em' }}>
              <li>Request preprocessing</li>
              <li>Response postprocessing</li>
              <li>Error handling</li>
              <li>Analytics tracking</li>
            </ul>
          </div>

          <div style={{
            background: 'linear-gradient(135deg, #28a745, #1e7e34)',
            color: 'white',
            padding: '25px',
            borderRadius: '8px'
          }}>
            <h3 style={{ fontSize: '1.4em', marginBottom: '15px' }}>🔌 Dynamic Plugins</h3>
            <p style={{ marginBottom: '15px', lineHeight: '1.5' }}>
              Runtime-loadable modules that extend functionality without restart
            </p>
            <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '0.9em' }}>
              <li>Hot loading</li>
              <li>Zero downtime updates</li>
              <li>Sandboxed execution</li>
              <li>A/B testing</li>
            </ul>
          </div>

          <div style={{
            background: 'linear-gradient(135deg, #6f42c1, #563d7c)',
            color: 'white',
            padding: '25px',
            borderRadius: '8px'
          }}>
            <h3 style={{ fontSize: '1.4em', marginBottom: '15px' }}>📝 DSL System</h3>
            <p style={{ marginBottom: '15px', lineHeight: '1.5' }}>
              Declarative language for defining pages and workflows
            </p>
            <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '0.9em' }}>
              <li>JSON-based configuration</li>
              <li>Conditional rendering</li>
              <li>Data binding</li>
              <li>Event handling</li>
            </ul>
          </div>
        </div>

        {/* Interactive Middleware Demo */}
        <div style={{ marginBottom: '40px' }}>
          <h3 style={{ fontSize: '1.5em', marginBottom: '20px', color: '#333' }}>
            Middleware Configuration (Interactive Demo)
          </h3>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '20px'
          }}>
            <div>
              <h4 style={{ marginBottom: '15px', color: '#555' }}>Available Middleware</h4>
              {middlewareExamples.map(middleware => (
                <div
                  key={middleware.id}
                  onClick={() => setSelectedMiddleware(middleware.id)}
                  style={{
                    background: selectedMiddleware === middleware.id ? '#007bff' : 'white',
                    color: selectedMiddleware === middleware.id ? 'white' : '#333',
                    padding: '15px',
                    borderRadius: '6px',
                    marginBottom: '10px',
                    cursor: 'pointer',
                    border: '1px solid #e0e0e0',
                    transition: 'all 0.3s ease'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ fontSize: '1.2em', marginRight: '10px' }}>{middleware.icon}</span>
                    <strong>{middleware.name}</strong>
                  </div>
                  <div style={{ fontSize: '0.9em', opacity: selectedMiddleware === middleware.id ? 0.9 : 0.7 }}>
                    {middleware.description}
                  </div>
                </div>
              ))}
            </div>
            <div>
              <h4 style={{ marginBottom: '15px', color: '#555' }}>
                Configuration: {middlewareExamples.find(m => m.id === selectedMiddleware)?.name}
              </h4>
              <div style={{
                background: '#f8f9fa',
                padding: '20px',
                borderRadius: '6px',
                border: '1px solid #e0e0e0'
              }}>
                <pre style={{
                  margin: 0,
                  fontFamily: 'monospace',
                  fontSize: '0.9em',
                  color: '#333',
                  whiteSpace: 'pre-wrap'
                }}>
                  {JSON.stringify(middlewareExamples.find(m => m.id === selectedMiddleware)?.config, null, 2)}
                </pre>
              </div>
              <div style={{ marginTop: '15px', fontSize: '0.9em', color: '#666' }}>
                <strong>Processing Pipeline:</strong><br />
                Request → <strong>{middlewareExamples.find(m => m.id === selectedMiddleware)?.name}</strong> → Core Logic → Response
              </div>
            </div>
          </div>
        </div>

        {/* Feature Flags Demo */}
        <div style={{ marginBottom: '40px' }}>
          <h3 style={{ fontSize: '1.5em', marginBottom: '20px', color: '#333' }}>
            Feature Flags Management
          </h3>
          <div style={{
            background: 'white',
            padding: '25px',
            borderRadius: '8px',
            border: '1px solid #e0e0e0'
          }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '20px'
            }}>
              {featureFlags.map(feature => (
                <div
                  key={feature.id}
                  style={{
                    padding: '20px',
                    borderRadius: '6px',
                    border: '2px solid',
                    borderColor: enabledFeatures.includes(feature.id) ? '#28a745' : '#e0e0e0',
                    background: enabledFeatures.includes(feature.id) ? '#f8fff9' : 'white',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                  onClick={() => {
                    setEnabledFeatures(prev =>
                      prev.includes(feature.id)
                        ? prev.filter(f => f !== feature.id)
                        : [...prev, feature.id]
                    );
                  }}
                >
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '10px'
                  }}>
                    <strong style={{ color: enabledFeatures.includes(feature.id) ? '#28a745' : '#333' }}>
                      {feature.name}
                    </strong>
                    <div style={{
                      width: '20px',
                      height: '20px',
                      borderRadius: '50%',
                      background: enabledFeatures.includes(feature.id) ? '#28a745' : '#ccc',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontSize: '0.8em'
                    }}>
                      {enabledFeatures.includes(feature.id) ? '✓' : ''}
                    </div>
                  </div>
                  <div style={{ fontSize: '0.9em', color: '#666', marginBottom: '10px' }}>
                    {feature.description}
                  </div>
                  <div style={{
                    background: '#f8f9fa',
                    padding: '8px 12px',
                    borderRadius: '4px',
                    fontSize: '0.8em',
                    color: '#555'
                  }}>
                    Rollout: {feature.rollout}% | Status: {enabledFeatures.includes(feature.id) ? 'Active' : 'Inactive'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Links */}
        <div style={{
          background: 'linear-gradient(135deg, #f8f9fa, #e9ecef)',
          padding: '25px',
          borderRadius: '8px',
          textAlign: 'center'
        }}>
          <h3 style={{ marginBottom: '15px', color: '#333' }}>Learn More About Extensibility</h3>
          <p style={{ color: '#666', marginBottom: '20px' }}>
            Explore the complete extensibility documentation and implementation patterns
          </p>
          <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <a
              href="/doc/EXTENSIBILITY.md"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                background: '#007bff',
                color: 'white',
                padding: '12px 24px',
                borderRadius: '6px',
                textDecoration: 'none',
                fontWeight: '500',
                transition: 'all 0.3s ease'
              }}
            >
              📖 View Full Documentation
            </a>
            <a
              href="/doc/CMS.md"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                background: '#6f42c1',
                color: 'white',
                padding: '12px 24px',
                borderRadius: '6px',
                textDecoration: 'none',
                fontWeight: '500',
                transition: 'all 0.3s ease'
              }}
            >
              🔧 View CMS Architecture
            </a>
          </div>
        </div>
      </div>
    );
  };

  const renderIoCDI = () => {
    const services = [
      {
        id: 'linkService',
        name: 'LinkService',
        description: 'Manages link operations and business logic',
        dependencies: ['linkRepository', 'cache', 'logger'],
        icon: '🔗'
      },
      {
        id: 'userService',
        name: 'UserService',
        description: 'Handles user authentication and profile management',
        dependencies: ['userRepository', 'emailService', 'logger'],
        icon: '👤'
      },
      {
        id: 'linkRepository',
        name: 'LinkRepository',
        description: 'Data access layer for link operations',
        dependencies: ['database', 'logger'],
        icon: '💾'
      },
      {
        id: 'userService',
        name: 'UserService',
        description: 'Business logic for user management',
        dependencies: ['userRepository', 'emailService', 'logger'],
        icon: '👤'
      }
    ];

    const dependencyTypes = [
      {
        id: 'constructor',
        name: 'Constructor Injection',
        description: 'Dependencies provided through constructor parameters',
        example: `class LinkService {
  constructor(database, logger, cache) {
    this.database = database;
    this.logger = logger;
    this.cache = cache;
  }
}`
      },
      {
        id: 'property',
        name: 'Property Injection',
        description: 'Dependencies set through public properties',
        example: `class LinkService {
  setDatabase(database) { this.database = database; }
  setLogger(logger) { this.logger = logger; }
  setCache(cache) { this.cache = cache; }
}`
      },
      {
        id: 'interface',
        name: 'Interface Injection',
        description: 'Dependencies provided through injection interface',
        example: `class LinkService {
  inject(dependency) {
    if (dependency.type === 'database') {
      this.database = dependency.instance;
    }
  }
}`
      }
    ];

    const resolutionSteps = [
      { step: 1, description: 'Service requested from container', detail: 'linkService.resolve()' },
      { step: 2, description: 'Analyze service dependencies', detail: 'Needs: linkRepository, cache, logger' },
      { step: 3, description: 'Recursively resolve dependencies', detail: 'linkRepository → database, logger' },
      { step: 4, description: 'Create dependency instances', detail: 'Instantiate all dependencies' },
      { step: 5, description: 'Inject into service constructor', detail: 'new LinkService(repo, cache, logger)' },
      { step: 6, description: 'Return configured instance', detail: 'Service ready to use' }
    ];

    return (
      <div style={{ padding: '20px' }}>
        {/* Header */}
        <div style={{ marginBottom: '30px' }}>
          <h2 style={{ fontSize: '2em', marginBottom: '10px', color: '#333' }}>
            Inversion of Control & Dependency Injection
          </h2>
          <p style={{ fontSize: '1.1em', color: '#666', lineHeight: '1.6' }}>
            Explore how IoC containers and DI patterns promote loose coupling and explicit dependency management.
          </p>
        </div>

        {/* Core Concepts Overview */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '20px',
          marginBottom: '40px'
        }}>
          <div style={{
            background: 'linear-gradient(135deg, #ff6b6b, #ee5a6f)',
            color: 'white',
            padding: '25px',
            borderRadius: '8px'
          }}>
            <h3 style={{ fontSize: '1.4em', marginBottom: '15px' }}>🔄 Inversion of Control</h3>
            <p style={{ marginBottom: '15px', lineHeight: '1.5' }}>
              Control of object creation transferred from application to container
            </p>
            <div style={{
              background: 'rgba(255,255,255,0.2)',
              padding: '12px',
              borderRadius: '4px',
              fontFamily: 'monospace',
              fontSize: '0.85em'
            }}>
              App → Container → Services → App
            </div>
          </div>

          <div style={{
            background: 'linear-gradient(135deg, #4ecdc4, #44a3aa)',
            color: 'white',
            padding: '25px',
            borderRadius: '8px'
          }}>
            <h3 style={{ fontSize: '1.4em', marginBottom: '15px' }}>💉 Dependency Injection</h3>
            <p style={{ marginBottom: '15px', lineHeight: '1.5' }}>
              Dependencies are "injected" rather than created internally
            </p>
            <div style={{
              background: 'rgba(255,255,255,0.2)',
              padding: '12px',
              borderRadius: '4px',
              fontFamily: 'monospace',
              fontSize: '0.85em'
            }}>
              Constructor, Property, Interface
            </div>
          </div>

          <div style={{
            background: 'linear-gradient(135deg, #95e1d3, #55a3a3)',
            color: 'white',
            padding: '25px',
            borderRadius: '8px'
          }}>
            <h3 style={{ fontSize: '1.4em', marginBottom: '15px' }}>🎯 Explicit Dependencies</h3>
            <p style={{ marginBottom: '15px', lineHeight: '1.5' }}>
              Clearly declare what components need, making code self-documenting
            </p>
            <div style={{
              background: 'rgba(255,255,255,0.2)',
              padding: '12px',
              borderRadius: '4px',
              fontFamily: 'monospace',
              fontSize: '0.85em'
            }}>
              constructor(repo, cache, logger)
            </div>
          </div>
        </div>

        {/* Interactive Service Dependency Visualization */}
        <div style={{ marginBottom: '40px' }}>
          <h3 style={{ fontSize: '1.5em', marginBottom: '20px', color: '#333' }}>
            Service Dependencies (Interactive Demo)
          </h3>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '20px'
          }}>
            <div>
              <h4 style={{ marginBottom: '15px', color: '#555' }}>Select Service</h4>
              {services.map(service => (
                <div
                  key={service.id}
                  onClick={() => setSelectedService(service.id)}
                  style={{
                    background: selectedService === service.id ? '#ff6b6b' : 'white',
                    color: selectedService === service.id ? 'white' : '#333',
                    padding: '15px',
                    borderRadius: '6px',
                    marginBottom: '10px',
                    cursor: 'pointer',
                    border: '1px solid #e0e0e0',
                    transition: 'all 0.3s ease'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ fontSize: '1.2em', marginRight: '10px' }}>{service.icon}</span>
                    <strong>{service.name}</strong>
                  </div>
                  <div style={{ fontSize: '0.9em', opacity: selectedService === service.id ? 0.9 : 0.7 }}>
                    {service.description}
                  </div>
                  {selectedService === service.id && (
                    <div style={{ marginTop: '10px', fontSize: '0.85em', opacity: 0.9 }}>
                      Dependencies: {service.dependencies.join(', ')}
                    </div>
                  )}
                </div>
              ))}
            </div>
            <div>
              <h4 style={{ marginBottom: '15px', color: '#555' }}>
                Dependency Graph: {services.find(s => s.id === selectedService)?.name}
              </h4>
              <div style={{
                background: 'white',
                padding: '20px',
                borderRadius: '6px',
                border: '1px solid #e0e0e0',
                minHeight: '200px'
              }}>
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '20px'
                }}>
                  {/* Main Service */}
                  <div style={{
                    background: '#ff6b6b',
                    color: 'white',
                    padding: '15px 25px',
                    borderRadius: '8px',
                    textAlign: 'center',
                    fontWeight: 'bold',
                    boxShadow: '0 2px 10px rgba(255,107,107,0.3)'
                  }}>
                    {services.find(s => s.id === selectedService)?.icon} {services.find(s => s.id === selectedService)?.name}
                  </div>

                  <div style={{ color: '#666', fontSize: '20px' }}>↓</div>

                  {/* Dependencies */}
                  <div style={{
                    display: 'flex',
                    gap: '15px',
                    justifyContent: 'center',
                    flexWrap: 'wrap'
                  }}>
                    {(services.find(s => s.id === selectedService)?.dependencies || []).map(dep => (
                      <div key={dep} style={{
                        background: '#4ecdc4',
                        color: 'white',
                        padding: '12px 20px',
                        borderRadius: '6px',
                        textAlign: 'center',
                        fontSize: '0.9em',
                        boxShadow: '0 2px 8px rgba(78,205,196,0.3)'
                      }}>
                        {dep}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Resolution Process Toggle */}
              <div style={{ marginTop: '20px', textAlign: 'center' }}>
                <button
                  onClick={() => setShowResolution(!showResolution)}
                  style={{
                    background: '#007bff',
                    color: 'white',
                    border: 'none',
                    padding: '10px 20px',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '0.9em'
                  }}
                >
                  {showResolution ? 'Hide' : 'Show'} Resolution Process
                </button>
              </div>

              {showResolution && (
                <div style={{
                  marginTop: '20px',
                  background: '#f8f9fa',
                  padding: '20px',
                  borderRadius: '6px',
                  border: '1px solid #e0e0e0'
                }}>
                  <h5 style={{ margin: '0 0 15px 0', color: '#555' }}>Dependency Resolution Steps:</h5>
                  {resolutionSteps.map((step, index) => (
                    <div key={step.step} style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      marginBottom: '12px',
                      padding: '10px',
                      background: 'white',
                      borderRadius: '4px',
                      border: '1px solid #e0e0e0'
                    }}>
                      <div style={{
                        background: '#007bff',
                        color: 'white',
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.8em',
                        fontWeight: 'bold',
                        marginRight: '12px',
                        flexShrink: 0
                      }}>
                        {step.step}
                      </div>
                      <div>
                        <div style={{ fontWeight: '500', marginBottom: '2px', color: '#333' }}>
                          {step.description}
                        </div>
                        <div style={{ fontSize: '0.85em', color: '#666' }}>
                          {step.detail}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Dependency Injection Types */}
        <div style={{ marginBottom: '40px' }}>
          <h3 style={{ fontSize: '1.5em', marginBottom: '20px', color: '#333' }}>
            Dependency Injection Types
          </h3>
          <div style={{ marginBottom: '20px' }}>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              {dependencyTypes.map(type => (
                <button
                  key={type.id}
                  onClick={() => setDiType(type.id)}
                  style={{
                    background: diType === type.id ? '#4ecdc4' : 'white',
                    color: diType === type.id ? 'white' : '#333',
                    border: '1px solid #e0e0e0',
                    padding: '8px 16px',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '0.9em'
                  }}
                >
                  {type.name}
                </button>
              ))}
            </div>
          </div>
          <div style={{
            background: 'white',
            padding: '25px',
            borderRadius: '8px',
            border: '1px solid #e0e0e0'
          }}>
            <h4 style={{ margin: '0 0 15px 0', color: '#555' }}>
              {dependencyTypes.find(t => t.id === diType)?.name}
            </h4>
            <p style={{ margin: '0 0 20px 0', color: '#666', fontSize: '0.95em' }}>
              {dependencyTypes.find(t => t.id === diType)?.description}
            </p>
            <div style={{
              background: '#f8f9fa',
              padding: '20px',
              borderRadius: '6px',
              border: '1px solid #e0e0e0',
              overflow: 'auto'
            }}>
              <pre style={{
                margin: 0,
                fontFamily: 'monospace',
                fontSize: '0.85em',
                color: '#333',
                whiteSpace: 'pre-wrap'
              }}>
                {dependencyTypes.find(t => t.id === diType)?.example}
              </pre>
            </div>
          </div>
        </div>

        {/* Benefits of IoC/DI */}
        <div style={{ marginBottom: '40px' }}>
          <h3 style={{ fontSize: '1.5em', marginBottom: '20px', color: '#333' }}>
            Key Benefits
          </h3>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '20px'
          }}>
            <div style={{
              background: 'white',
              padding: '25px',
              borderRadius: '8px',
              border: '1px solid #e0e0e0',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '2em', marginBottom: '15px' }}>🧩</div>
              <h4 style={{ color: '#333', marginBottom: '10px' }}>Loose Coupling</h4>
              <p style={{ color: '#666', fontSize: '0.9em', lineHeight: '1.5' }}>
                Components don't know how to create dependencies, only what interfaces they implement
              </p>
            </div>

            <div style={{
              background: 'white',
              padding: '25px',
              borderRadius: '8px',
              border: '1px solid #e0e0e0',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '2em', marginBottom: '15px' }}>🧪</div>
              <h4 style={{ color: '#333', marginBottom: '10px' }}>Testability</h4>
              <p style={{ color: '#666', fontSize: '0.9em', lineHeight: '1.5' }}>
                Easy to mock dependencies for isolated unit testing
              </p>
            </div>

            <div style={{
              background: 'white',
              padding: '25px',
              borderRadius: '8px',
              border: '1px solid #e0e0e0',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '2em', marginBottom: '15px' }}>🔧</div>
              <h4 style={{ color: '#333', marginBottom: '10px' }}>Maintainability</h4>
              <p style={{ color: '#666', fontSize: '0.9em', lineHeight: '1.5' }}>
                Changes to implementations don't require changes to consuming code
              </p>
            </div>

            <div style={{
              background: 'white',
              padding: '25px',
              borderRadius: '8px',
              border: '1px solid #e0e0e0',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '2em', marginBottom: '15px' }}>⚙️</div>
              <h4 style={{ color: '#333', marginBottom: '10px' }}>Configuration</h4>
              <p style={{ color: '#666', fontSize: '0.9em', lineHeight: '1.5' }}>
                Different implementations can be easily swapped based on environment
              </p>
            </div>
          </div>
        </div>

        {/* Quick Links */}
        <div style={{
          background: 'linear-gradient(135deg, #f8f9fa, #e9ecef)',
          padding: '25px',
          borderRadius: '8px',
          textAlign: 'center'
        }}>
          <h3 style={{ marginBottom: '15px', color: '#333' }}>Learn More About IoC & DI</h3>
          <p style={{ color: '#666', marginBottom: '20px' }}>
            Explore the complete IoC and DI documentation with implementation examples
          </p>
          <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <a
              href="/doc/IOC-DI.md"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                background: '#ff6b6b',
                color: 'white',
                padding: '12px 24px',
                borderRadius: '6px',
                textDecoration: 'none',
                fontWeight: '500',
                transition: 'all 0.3s ease'
              }}
            >
              📖 View Full Documentation
            </a>
            <a
              href="/doc/EXTENSIBILITY.md"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                background: '#4ecdc4',
                color: 'white',
                padding: '12px 24px',
                borderRadius: '6px',
                textDecoration: 'none',
                fontWeight: '500',
                transition: 'all 0.3s ease'
              }}
            >
              🔧 View Extensibility Patterns
            </a>
          </div>
        </div>
      </div>
    );
  };

  const renderCodeExplorer = () => {
    const patterns = [
      {
        id: 'design-patterns',
        name: 'Design Patterns',
        description: 'Repository, Observer, Factory, Singleton, Middleware, Builder, Proxy patterns',
        icon: '🎯',
        files: [
          {
            id: 'repository-pattern',
            name: 'Repository Pattern',
            file: 'cms-composer/src/repos/pages.mongo.js',
            description: 'Data access abstraction and MongoDB integration'
          },
          {
            id: 'observer-pattern',
            name: 'Observer Pattern',
            file: 'cms-sdk/src/plugins/registry.js',
            description: 'Event-driven plugin registration and notifications'
          },
          {
            id: 'factory-pattern',
            name: 'Factory Pattern',
            file: 'cms-sdk/src/ioc/container.js',
            description: 'Dependency injection and object creation'
          },
          {
            id: 'singleton-pattern',
            name: 'Singleton Pattern',
            file: 'cms-sdk/src/ioc/container.js',
            description: 'Shared resource management and lifecycle'
          },
          {
            id: 'middleware-pattern',
            name: 'Middleware Pattern',
            file: 'cms-sdk/src/middleware/compose.js',
            description: 'Chain of responsibility for request processing'
          },
          {
            id: 'builder-pattern',
            name: 'Builder Pattern',
            file: 'ui/src/hooks/use-api.js',
            description: 'Complex API client construction step by step'
          },
          {
            id: 'proxy-pattern',
            name: 'Proxy Pattern',
            file: 'ui/src/components/tag-selector/index.jsx',
            description: 'Access control and validation for tag management'
          }
        ]
      },
      {
        id: 'cms',
        name: 'CMS Implementation',
        description: 'Plugin system, component architecture, and rendering pipeline',
        icon: '🏗️',
        files: [
          {
            id: 'plugin-registry',
            name: 'Plugin Registry',
            file: 'cms-sdk/src/plugins/registry.js',
            description: 'Dynamic plugin registration and management'
          },
          {
            id: 'plugin-text',
            name: 'TextBlock Plugin',
            file: 'cms-sdk/src/plugins/builtins/text.js',
            description: 'Actual CMS component implementation'
          },
          {
            id: 'html-renderer',
            name: 'HTML Renderer',
            file: 'cms-renderer/src/renderers/html.js',
            description: 'Component rendering pipeline'
          },
          {
            id: 'cms-page',
            name: 'Page Configuration',
            file: 'demo-page.json',
            description: 'Real CMS page structure in use'
          }
        ]
      },
      {
        id: 'extensibility',
        name: 'Extensibility System',
        description: 'Middleware pipeline, feature flags, and dynamic loading',
        icon: '🔌',
        files: [
          {
            id: 'middleware-compose',
            name: 'Middleware Pipeline',
            file: 'cms-sdk/src/middleware/compose.js',
            description: 'Koa-style middleware composition'
          },
          {
            id: 'feature-flags',
            name: 'Feature Flags',
            file: 'cms-sdk/src/middleware/flags.js',
            description: 'Conditional rendering based on flags'
          },
          {
            id: 'ab-testing',
            name: 'A/B Testing',
            file: 'cms-sdk/src/middleware/ab.js',
            description: 'User bucketing and experimentation'
          },
          {
            id: 'middleware-pipeline',
            name: 'Pipeline Usage',
            file: 'cms-composer/src/routes/pages.js',
            description: 'Real middleware pipeline in production'
          }
        ]
      },
      {
        id: 'ioc-di',
        name: 'IoC & DI Container',
        description: 'Dependency injection and service locator patterns',
        icon: '🎯',
        files: [
          {
            id: 'container',
            name: 'IoC Container',
            file: 'cms-sdk/src/ioc/container.js',
            description: 'Dependency resolution and lifecycle management'
          },
          {
            id: 'composer-container',
            name: 'Composer Container Setup',
            file: 'cms-composer/src/container.js',
            description: 'Production dependency configuration'
          },
          {
            id: 'renderer-container',
            name: 'Renderer Container Setup',
            file: 'cms-renderer/src/container.js',
            description: 'Service registration and injection'
          },
          {
            id: 'dependency-resolution',
            name: 'Dependency Resolution',
            file: 'cms-renderer/src/routes/render.js',
            description: 'Actual dependency injection in action'
          }
        ]
      },
      {
        id: 'production',
        name: 'Production Usage',
        description: 'Live API endpoints and real deployment patterns',
        icon: '🚀',
        files: [
          {
            id: 'api-endpoint',
            name: 'API Endpoint',
            file: 'cms-composer/src/routes/pages.js',
            description: 'RESTful API with all patterns integrated'
          },
          {
            id: 'mongo-repository',
            name: 'MongoDB Repository',
            file: 'cms-renderer/src/repos/plugins.mongo.js',
            description: 'Dynamic plugin loading from database'
          },
          {
            id: 'schema-validation',
            name: 'JSON Schema Validation',
            file: 'cms-sdk/src/validation/schemas.js',
            description: 'Component parameter validation'
          },
          {
            id: 'error-handling',
            name: 'Error Handling',
            file: 'cms-renderer/src/routes/render.js',
            description: 'Production error handling and validation'
          }
        ]
      }
    ];

    const actualCodeExamples = {
      'repository-pattern': {
        code: `class MongoPagesRepository {
  constructor({ uri, dbName = 'linksaver', collectionName = 'pages' }) {
    this._uri = uri;
    this._dbName = dbName;
    this._collectionName = collectionName;
    this._client = null;
    this._db = null;
    this._coll = null;
  }

  async findBySlug(slug) {
    const coll = await this._connect();
    const doc = await coll.findOne({ slug });
    if (!doc) return null;

    const page = {
      version: doc.version,
      meta: doc.meta,
      root: doc.root,
    };

    validatePage(page);
    return page;
  }

  async save(page) {
    const coll = await this._connect();
    const { slug } = page.meta;
    const filter = { slug };
    const update = {
      $set: {
        version: page.version,
        meta: page.meta,
        root: page.root,
        updatedAt: new Date(),
      },
      $setOnInsert: { createdAt: new Date() }
    };
    const options = { upsert: true };
    return await coll.updateOne(filter, update, options);
  }
}`,
        usage: `// Real repository usage in production:
const pagesRepo = container.resolve('PagesRepository');
const page = await pagesRepo.findBySlug('home');
await pagesRepo.save(newPage);`
      },
      'observer-pattern': {
        code: `class PluginRegistry {
  constructor({ repo } = {}) {
    this._plugins = new Map();
    this._events = new Map();
    this._ajv = new Ajv({ allErrors: true, strict: false });
  }

  // Event subscription
  on(event, handler) {
    const list = this._events.get(event) || [];
    list.push(handler);
    this._events.set(event, list);
    return this;
  }

  // Event emission
  _emit(event, payload) {
    const list = this._events.get(event) || [];
    for (const fn of list) {
      try {
        fn(payload);
      } catch (e) {
        console.error(\`Error in event handler for \${event}:\`, e);
      }
    }
  }

  register(plugin) {
    // ... validation logic ...
    this._plugins.set(plugin.id, { ...plugin });

    // Notify all observers
    this._emit('register', { id: plugin.id });
    return this;
  }

  setAllowlist(ids) {
    this._allowlist = new Set(ids);
    this._emit('allowlistChanged', { allowlist: ids });
  }
}`,
        usage: `// Real event subscription in production:
const registry = container.resolve('PluginRegistry');

registry.on('register', ({ id }) => {
  console.log(\`Plugin registered: \${id}\`);
});

registry.on('allowlistChanged', ({ allowlist }) => {
  console.log('Active plugins updated:', allowlist);
});`
      },
      'factory-pattern': {
        code: `class Container {
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
    if (this._singletons.has(name)) {
      return this._singletons.get(name);
    }

    const entry = this._registry.get(name);
    if (!entry) throw new ResolutionError(\`Dependency not found: \${name}\`);

    if (typeof entry === 'function') return entry();

    const { factory, singleton } = entry;
    const value = factory(this); // Inject container for DI
    if (singleton) this._singletons.set(name, value);
    return value;
  }
}`,
        usage: `// Real factory usage in production:
const container = new Container();

container.register('PagesRepository', () => {
  const uri = process.env.CMS_MONGODB_URI;
  return uri ? new MongoPagesRepository({ uri })
           : new InMemoryPagesRepository();
}, { singleton: true });

const pagesRepo = container.resolve('PagesRepository');`
      },
      'singleton-pattern': {
        code: `class Container {
  constructor() {
    this._registry = new Map();
    this._singletons = new Map(); // Singleton storage
  }

  register(name, factory, { singleton = false } = {}) {
    if (typeof factory !== 'function') {
      const value = factory;
      this._registry.set(name, () => value);
      this._singletons.set(name, value); // Store singleton
      return this;
    }
    this._registry.set(name, { factory, singleton });
    return this;
  }

  resolve(name) {
    // Return existing singleton if available
    if (this._singletons.has(name)) {
      return this._singletons.get(name);
    }

    const entry = this._registry.get(name);
    if (!entry) throw new ResolutionError(\`Dependency not found: \${name}\`);

    const { factory, singleton } = entry;
    const value = factory(this);

    // Cache singleton instance
    if (singleton) {
      this._singletons.set(name, value);
    }

    return value;
  }
}`,
        usage: `// Real singleton usage in production:
container.register('MongoClient', () => new MongoClient(uri), { singleton: true });
container.register('PluginRegistry', createRegistry, { singleton: true });

// Both calls return the same instance
const client1 = container.resolve('MongoClient');
const client2 = container.resolve('MongoClient'); // Same object`
      },
      'middleware-pattern': {
        code: `function compose(middleware) {
  if (!Array.isArray(middleware)) {
    throw new MiddlewareError('Middleware stack must be array');
  }
  for (const fn of middleware) {
    if (typeof fn !== 'function') {
      throw new MiddlewareError('Middleware must be functions');
    }
  }

  return function run(ctx, next) {
    let index = -1;

    function dispatch(i) {
      if (i <= index) {
        return Promise.reject(new MiddlewareError('next() called multiple times'));
      }
      index = i;
      let fn = middleware[i];
      if (i === middleware.length) fn = next;
      if (!fn) return Promise.resolve();

      try {
        return Promise.resolve(fn(ctx, () => dispatch(i + 1)));
      } catch (err) {
        return Promise.reject(err);
      }
    }

    return dispatch(0);
  };
}`,
        usage: `// Real middleware pipeline in production:
const pipeline = compose([
  localeResolver({ defaultLocale: 'en' }),
  abBucket({}),
  featureFlagGate({}),
]);

// Apply to requests
await pipeline(ctx, () => Promise.resolve());`
      },
      'builder-pattern': {
        code: `export const useApi = () => {
  const [loading, setLoading] = useState(false);
  const { state } = useAppContext();

  const token = state.user?.token ||
               localStorage.getItem(localStorageKeys.AUTH_TOKEN) || false;

  // Base configuration
  const defaultHeaders = {
    Accept: "application/json",
    "Content-Type": "application/json",
    ...(token ? { Authorization: \`Bearer \${token}\` } : {}),
  };

  const apiBase = import.meta.env.VITE_API_URL || "http://localhost:7777/api";

  return {
    loading,

    // Built POST request
    postRequest: async (path, data) => {
      setLoading(true);
      return axios
        .post(\`\${apiBase}/\${path}\`, data, {
          headers: defaultHeaders,
          withCredentials: true
        })
        .then((res) => { setLoading(false); return res; })
        .catch((err) => { setLoading(false); throw err; });
    },

    // Built GET request
    getRequest: async (path) => {
      setLoading(true);
      return axios
        .get(\`\${apiBase}/\${path}\`, {
          headers: defaultHeaders,
          withCredentials: true
        })
        .then((res) => { setLoading(false); return res; })
        .catch((err) => { setLoading(false); throw err; });
    },
  };
};`,
        usage: `// Real API builder usage in components:
const { getRequest, postRequest, loading } = useApi();

// Built requests with shared configuration
const links = await getRequest('links');
const result = await postRequest('collections', { title: 'My Collection' });`
      },
      'proxy-pattern': {
        code: `const TagSelector = ({ tags, setTags }) => {
  const [input, setInput] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const { state } = useAppContext();

  // Proxy for tag addition with validation
  const handleInputKeyDown = (e) => {
    if (e.key === "Enter" && input) {
      const existingTag = state.tags.find(
        (tag) => tag.title.toLowerCase() === input.toLowerCase()
      );

      if (existingTag) {
        setTags([...tags, existingTag]);
      } else if (!tags.some((tag) => tag.title.toLowerCase() === input.toLowerCase())) {
        setTags([...tags, { title: input }]);
      }

      setInput("");
      setSuggestions([]);
    }
  };

  // Proxy for tag removal with validation
  const removeTag = (tag) => {
    setTags(tags.filter((t) => t.title !== tag.title));
  };

  // Proxy for suggestion filtering
  const handleInputChange = (e) => {
    const value = e.target.value;
    setInput(value);

    if (value) {
      setSuggestions(
        state.tags.filter(
          (tag) =>
            tag.title.toLowerCase().includes(value.toLowerCase()) &&
            !tags.some((tag) => tag.title.toLowerCase() === value.toLowerCase())
        )
      );
    } else {
      setSuggestions([]);
    }
  };
};`,
        usage: `// Real proxy usage in forms:
<TagSelector
  tags={selectedTags}
  setTags={setSelectedTags}
/>
// All tag operations go through validation proxy`
      },
      'plugin-registry': {
        code: `class PluginRegistry {
  constructor({ repo } = {}) {
    this._plugins = new Map();
    this._repo = repo; // Optional dynamic activation source
    this._allowlist = null; // null means allow all
    this._events = new Map();
    this._ajv = new Ajv({ allErrors: true, strict: false });
    this._compiledSchemas = new Map();
  }

  register(plugin) {
    if (!plugin || typeof plugin.id !== 'string' || !plugin.id) {
      throw new PluginRegistryError('Invalid plugin: missing id');
    }
    if (this._plugins.has(plugin.id)) {
      throw new PluginRegistryError(\`Plugin already registered: \${plugin.id}\`);
    }
    const compiled = plugin.schema ? this._ajv.compile(plugin.schema) : null;
    this._plugins.set(plugin.id, { ...plugin });
    if (compiled) this._compiledSchemas.set(plugin.id, compiled);
    this._emit('register', { id: plugin.id });
    return this;
  }

  // Real dynamic loading from repository
  async loadAllowlistFromRepo() {
    if (!this._repo || typeof this._repo.listActivePluginIds !== 'function') return [];
    const ids = await this._repo.listActivePluginIds();
    this.setAllowlist(ids);
    return ids;
  }
}`,
        usage: `// Real usage in production:
const registry = new PluginRegistry({ repo: pluginRepo });
registerBuiltins(registry);
await registry.loadAllowlistFromRepo();`
      },
      'plugin-text': {
        code: `const schema = {
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
    const cls = params.class ? \` class="\${escapeHtml(params.class)}"\` : '';
    return \`<\${tag}\${cls}>\${escapeHtml(params.text)}</\${tag}>\`;
  },
};`,
        usage: `// This renders actual HTML in production:
<TextBlock params={{ text: "Hello World!", tag: "h1", class: "title" }} />
// Output: <h1 class="title">Hello World!</h1>`
      },
      'middleware-compose': {
        code: `function compose(middleware) {
  if (!Array.isArray(middleware)) throw new MiddlewareError('Middleware stack must be array');
  for (const fn of middleware) {
    if (typeof fn !== 'function') throw new MiddlewareError('Middleware must be functions');
  }
  return function run(ctx, next) {
    let index = -1;
    function dispatch(i) {
      if (i <= index) return Promise.reject(new MiddlewareError('next() called multiple times'));
      index = i;
      let fn = middleware[i];
      if (i === middleware.length) fn = next;
      if (!fn) return Promise.resolve();
      try {
        return Promise.resolve(fn(ctx, () => dispatch(i + 1)));
      } catch (err) {
        return Promise.reject(err);
      }
    }
    return dispatch(0);
  };
}`,
        usage: `// Real production middleware pipeline:
const pipeline = compose([
  localeResolver({ defaultLocale: 'en' }),
  abBucket({}),
  featureFlagGate({}),
]);`
      },
      'container': {
        code: `class Container {
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
    if (!entry) throw new ResolutionError(\`Dependency not found: \${name}\`);
    if (typeof entry === 'function') return entry();
    const { factory, singleton } = entry;
    const value = factory(this);
    if (singleton) this._singletons.set(name, value);
    return value;
  }
}`,
        usage: `// Real dependency resolution:
const htmlRenderer = container.resolve('HTMLRenderer');
const result = await htmlRenderer.render(tree, context);`
      }
    };

    const currentPattern = patterns.find(p => p.id === selectedPattern);
    const currentFile = currentPattern?.files.find(f => f.id === selectedFile);
    const codeExample = actualCodeExamples[selectedFile];

    return (
      <div style={{ padding: '20px' }}>
        {/* Header */}
        <div style={{ marginBottom: '30px' }}>
          <h2 style={{ fontSize: '2em', marginBottom: '10px', color: '#333' }}>
            📁 LinkSaver Code Explorer
          </h2>
          <p style={{ fontSize: '1.1em', color: '#666', lineHeight: '1.6' }}>
            Explore the actual production code that implements CMS, extensibility, and IoC/DI patterns in LinkSaver.
          </p>
        </div>

        {/* Pattern Selection */}
        <div style={{ marginBottom: '30px' }}>
          <h3 style={{ fontSize: '1.3em', marginBottom: '15px', color: '#333' }}>
            Select Implementation Pattern
          </h3>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '15px'
          }}>
            {patterns.map(pattern => (
              <div
                key={pattern.id}
                onClick={() => {
                  setSelectedPattern(pattern.id);
                  setSelectedFile(pattern.files[0]?.id || '');
                  setShowUsage(false);
                }}
                style={{
                  background: selectedPattern === pattern.id ? '#28a745' : 'white',
                  color: selectedPattern === pattern.id ? 'white' : '#333',
                  padding: '20px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  border: '1px solid #e0e0e0',
                  transition: 'all 0.3s ease',
                  boxShadow: selectedPattern === pattern.id ? '0 4px 15px rgba(40,167,69,0.3)' : '0 2px 8px rgba(0,0,0,0.1)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
                  <span style={{ fontSize: '1.5em', marginRight: '10px' }}>{pattern.icon}</span>
                  <strong style={{ fontSize: '1.1em' }}>{pattern.name}</strong>
                </div>
                <div style={{ fontSize: '0.9em', opacity: selectedPattern === pattern.id ? 0.9 : 0.7, lineHeight: '1.4' }}>
                  {pattern.description}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* File Selection */}
        <div style={{ marginBottom: '20px' }}>
          <h3 style={{ fontSize: '1.2em', marginBottom: '10px', color: '#333' }}>
            Select File: {currentPattern?.name}
          </h3>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            {currentPattern?.files.map(file => (
              <button
                key={file.id}
                onClick={() => {
                  setSelectedFile(file.id);
                  setShowUsage(false);
                }}
                style={{
                  background: selectedFile === file.id ? '#007bff' : 'white',
                  color: selectedFile === file.id ? 'white' : '#333',
                  border: '1px solid #e0e0e0',
                  padding: '8px 16px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '0.9em',
                  transition: 'all 0.3s ease'
                }}
              >
                {file.name}
              </button>
            ))}
          </div>
        </div>

        {/* Code Display */}
        <div style={{ marginBottom: '30px' }}>
          {currentFile && (
            <div style={{
              background: 'white',
              borderRadius: '8px',
              border: '1px solid #e0e0e0',
              overflow: 'hidden'
            }}>
              <div style={{
                background: '#f8f9fa',
                padding: '15px 20px',
                borderBottom: '1px solid #e0e0e0',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div>
                  <h4 style={{ margin: 0, color: '#333', fontSize: '1.1em' }}>
                    {currentFile.name}
                  </h4>
                  <p style={{ margin: '5px 0 0 0', color: '#666', fontSize: '0.9em' }}>
                    File: <code style={{ background: '#e9ecef', padding: '2px 6px', borderRadius: '3px' }}>
                      {currentFile.file}
                    </code>
                  </p>
                  <p style={{ margin: '5px 0 0 0', color: '#666', fontSize: '0.85em' }}>
                    {currentFile.description}
                  </p>
                </div>
                {codeExample && (
                  <button
                    onClick={() => setShowUsage(!showUsage)}
                    style={{
                      background: '#6f42c1',
                      color: 'white',
                      border: 'none',
                      padding: '8px 16px',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '0.9em'
                    }}
                  >
                    {showUsage ? 'Hide' : 'Show'} Usage
                  </button>
                )}
              </div>

              <div style={{ padding: '20px' }}>
                {codeExample ? (
                  <>
                    <pre style={{
                      margin: 0,
                      fontFamily: 'Monaco, Consolas, "Courier New", monospace',
                      fontSize: '0.85em',
                      lineHeight: '1.5',
                      color: '#333',
                      background: '#f8f9fa',
                      padding: '20px',
                      borderRadius: '6px',
                      overflow: 'auto',
                      border: '1px solid #e9ecef'
                    }}>
                      {codeExample.code}
                    </pre>

                    {showUsage && codeExample.usage && (
                      <div style={{
                        marginTop: '20px',
                        padding: '15px',
                        background: '#e8f5e8',
                        borderRadius: '6px',
                        border: '1px solid #c3e6cb'
                      }}>
                        <h5 style={{ margin: '0 0 10px 0', color: '#155724', fontSize: '1em' }}>
                          📋 Actual Usage in Production:
                        </h5>
                        <pre style={{
                          margin: 0,
                          fontFamily: 'Monaco, Consolas, "Courier New", monospace',
                          fontSize: '0.8em',
                          color: '#155724',
                          whiteSpace: 'pre-wrap'
                        }}>
                          {codeExample.usage}
                        </pre>
                      </div>
                    )}
                  </>
                ) : (
                  <div style={{
                    padding: '40px',
                    textAlign: 'center',
                    color: '#666'
                  }}>
                    <div style={{ fontSize: '2em', marginBottom: '10px' }}>📄</div>
                    <p>Code example for {currentFile.name} is available in the full implementation.</p>
                    <p style={{ fontSize: '0.9em', marginTop: '5px' }}>
                      View the complete source in the LinkSaver repository.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Implementation Statistics */}
        <div style={{
          background: 'linear-gradient(135deg, #f8f9fa, #e9ecef)',
          padding: '25px',
          borderRadius: '8px',
          textAlign: 'center'
        }}>
          <h3 style={{ marginBottom: '15px', color: '#333' }}>Production Implementation Statistics</h3>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '20px',
            marginBottom: '20px'
          }}>
            <div>
              <div style={{ fontSize: '2em', fontWeight: 'bold', color: '#28a745' }}>20+</div>
              <div style={{ color: '#666' }}>Production Files</div>
            </div>
            <div>
              <div style={{ fontSize: '2em', fontWeight: 'bold', color: '#007bff' }}>7</div>
              <div style={{ color: '#666' }}>Design Patterns</div>
            </div>
            <div>
              <div style={{ fontSize: '2em', fontWeight: 'bold', color: '#6f42c1' }}>4</div>
              <div style={{ color: '#666' }}>Built-in Plugins</div>
            </div>
            <div>
              <div style={{ fontSize: '2em', fontWeight: 'bold', color: '#fd7e14' }}>3</div>
              <div style={{ color: '#666' }}>Middleware Types</div>
            </div>
            <div>
              <div style={{ fontSize: '2em', fontWeight: 'bold', color: '#17a2b8' }}>5</div>
              <div style={{ color: '#666' }}>Pattern Integrations</div>
            </div>
            <div>
              <div style={{ fontSize: '2em', fontWeight: 'bold', color: '#dc3545' }}>2</div>
              <div style={{ color: '#666' }}>Production APIs</div>
            </div>
          </div>
          <p style={{ color: '#666', marginBottom: '20px' }}>
            This is the actual production code that demonstrates LinkSaver's sophisticated use of design patterns.
          </p>
          <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <a
              href="/doc/DESIGN-PATTERNS-PROOF.md"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                background: '#6f42c1',
                color: 'white',
                padding: '12px 24px',
                borderRadius: '6px',
                textDecoration: 'none',
                fontWeight: '500',
                transition: 'all 0.3s ease'
              }}
            >
              🎯 View Design Patterns Proof
            </a>
            <a
              href="/doc/IMPLEMENTATION-PROOF.md"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                background: '#28a745',
                color: 'white',
                padding: '12px 24px',
                borderRadius: '6px',
                textDecoration: 'none',
                fontWeight: '500',
                transition: 'all 0.3s ease'
              }}
            >
              📖 View Implementation Proof
            </a>
            <a
              href="https://github.com/rurik/linkSaver"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                background: '#007bff',
                color: 'white',
                padding: '12px 24px',
                borderRadius: '6px',
                textDecoration: 'none',
                fontWeight: '500',
                transition: 'all 0.3s ease'
              }}
            >
              🐙 View on GitHub
            </a>
          </div>
        </div>
      </div>
    );
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'personal': return renderPersonalLinks();
      case 'discover': return renderFeaturedContent();
      case 'collections': return renderCollections();
      case 'remix': return renderRemix();
      case 'trending': return renderTrending();
      case 'cms': return renderCMS();
      case 'extensibility': return renderExtensibility();
      case 'ioc-di': return renderIoCDI();
      case 'code-explorer': return renderCodeExplorer();
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
        <h1 style={{ margin: 0, fontSize: '2.5em' }}>Content Hub</h1>
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
                fontSize: '0.95em',
                fontWeight: activeTab === tab.id ? '600' : '400',
                transition: 'all 0.3s ease',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content Area */}
      <div className="content-area">
        {renderContent()}
      </div>

      {/* Collection Modal */}
      {showModal && (
        <ModalOverlay>
          <ModalContent>
            <ModalHeader>
              <ModalTitle>
                {modalType === 'create-collection' && 'Create New Collection'}
                {modalType === 'edit-collection' && 'Edit Collection'}
                {modalType === 'view-collection' && 'Collection Details'}
              </ModalTitle>
              <CloseButton onClick={() => setShowModal(false)}>×</CloseButton>
            </ModalHeader>

            <ModalBody>
              {modalType === 'view-collection' && selectedCollection && (
                <div>
                  <div style={{ marginBottom: '15px' }}>
                    <strong>{selectedCollection.title}</strong>
                    {selectedCollection.isPublic && <PublicBadge>PUBLIC</PublicBadge>}
                  </div>
                  <div style={{ marginBottom: '15px', color: '#666', fontSize: '0.9em' }}>
                    {selectedCollection.description || 'No description'}
                  </div>
                  <div style={{ marginBottom: '15px' }}>
                    <div style={{ fontSize: '0.9em', color: '#666' }}>
                      {selectedCollection.links?.length || 0} links •
                      {selectedCollection.cmsPages?.length || 0} pages •
                      {selectedCollection.likes || 0} likes
                    </div>
                  </div>
                  {(selectedCollection.cmsPages && selectedCollection.cmsPages.length > 0) && (
                    <div style={{ marginTop: '15px' }}>
                      <div style={{ fontSize: '0.9em', fontWeight: '500', marginBottom: '8px' }}>CMS Pages:</div>
                      {selectedCollection.cmsPages.map((page, idx) => (
                        <div key={idx} style={{
                          padding: '8px',
                          background: '#f8f9fa',
                          borderRadius: '4px',
                          marginBottom: '5px',
                          fontSize: '0.85em'
                        }}>
                          <strong>{page.title}</strong>
                          {page.description && <div style={{ color: '#666' }}>{page.description}</div>}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {(modalType === 'create-collection' || modalType === 'edit-collection') && (
                <FormGroup>
                  <Label>Title *</Label>
                  <Input
                    type="text"
                    value={editingCollection?.title || ''}
                    onChange={(e) => setEditingCollection(prev => prev ? {...prev, title: e.target.value} : null)}
                    placeholder="Enter collection title"
                  />
                </FormGroup>
              )}

              {(modalType === 'create-collection' || modalType === 'edit-collection') && (
                <FormGroup>
                  <Label>Description</Label>
                  <TextArea
                    value={editingCollection?.description || ''}
                    onChange={(e) => setEditingCollection(prev => prev ? {...prev, description: e.target.value} : null)}
                    placeholder="Describe your collection"
                    rows={3}
                  />
                </FormGroup>
              )}

              {modalType === 'edit-collection' && selectedCollection && (
                <FormGroup>
                  <CheckboxLabel>
                    <input
                      type="checkbox"
                      checked={editingCollection?.isPublic || false}
                      onChange={(e) => setEditingCollection(prev => prev ? {...prev, isPublic: e.target.checked} : null)}
                    />
                    Make collection public
                  </CheckboxLabel>
                </FormGroup>
              )}
            </ModalBody>

            <ModalFooter>
              {(modalType === 'create-collection' || modalType === 'edit-collection') && (
                <>
                  <CancelButton onClick={() => setShowModal(false)}>Cancel</CancelButton>
                  <SaveButton onClick={handleSaveCollection}>
                    {modalType === 'create-collection' ? 'Create' : 'Save'}
                  </SaveButton>
                </>
              )}

              {modalType === 'view-collection' && selectedCollection && (
                <>
                  <CancelButton onClick={() => setShowModal(false)}>Close</CancelButton>
                  {selectedCollection.userId === user?.details?.id && (
                    <SaveButton onClick={() => {
                      setModalType('edit-collection');
                      setEditingCollection({
                        title: selectedCollection.title,
                        description: selectedCollection.description,
                        isPublic: selectedCollection.isPublic
                      });
                    }}>
                      Edit
                    </SaveButton>
                  )}
                </>
              )}
            </ModalFooter>
          </ModalContent>
        </ModalOverlay>
      )}
    </div>
  );
};

export default ContentHub;