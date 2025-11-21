import { useState, useEffect, useCallback, useRef } from "react";
import styled from "styled-components";
import { toast } from "react-toastify";
import axios from "axios";
import { useApi } from "../hooks/use-api";
import { useAppContext } from "../context";

// Enhanced styled components
const Container = styled.div`
  padding: 20px;
  max-width: 1400px;
  margin: 0 auto;
  font-family: "Open Sans", sans-serif;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 2px solid #e0e0e0;
`;

const Title = styled.h1`
  color: #2c3e50;
  margin: 0;
  font-size: 2rem;
`;

const ActionBar = styled.div`
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
`;

const Button = styled.button`
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 8px;

  ${props => {
    if (props.primary) {
      return `
        background: #3498db;
        color: white;
        &:hover { background: #2980b9; }
      `;
    }
    if (props.success) {
      return `
        background: #27ae60;
        color: white;
        &:hover { background: #229954; }
      `;
    }
    if (props.warning) {
      return `
        background: #f39c12;
        color: white;
        &:hover { background: #e67e22; }
      `;
    }
    if (props.danger) {
      return `
        background: #e74c3c;
        color: white;
        &:hover { background: #c0392b; }
      `;
    }
    return `
      background: #ecf0f1;
      color: #2c3e50;
      &:hover { background: #bdc3c7; }
    `;
  }}

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const MainContent = styled.div`
  display: grid;
  grid-template-columns: 1fr 350px;
  gap: 30px;
`;

const LinksSection = styled.div``;

const Sidebar = styled.div``;

const SearchAndFilter = styled.div`
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 1em;
  margin-bottom: 15px;

  &:focus {
    outline: none;
    border-color: #3498db;
    box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.2);
  }
`;

const FilterTags = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 15px;
`;

const FilterTag = styled.span`
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 0.85em;
  cursor: pointer;
  transition: all 0.2s ease;

  ${props => props.active ? `
    background: #3498db;
    color: white;
  ` : `
    background: #ecf0f1;
    color: #2c3e50;
    &:hover { background: #bdc3c7; }
  `}
`;

const LinksGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
`;

const LinkCard = styled.div`
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  transition: all 0.2s ease;
  border-left: 4px solid ${props => props.color || '#3498db'};

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  }
`;

const LinkHeader = styled.div`
  padding: 15px;
  border-bottom: 1px solid #eee;
  background: #f8f9fa;
`;

const LinkTitle = styled.h3`
  margin: 0 0 8px 0;
  color: #2c3e50;
  font-size: 1.1em;
  line-height: 1.3;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const LinkUrl = styled.a`
  color: #3498db;
  text-decoration: none;
  font-size: 0.9em;
  display: block;
  margin-bottom: 8px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;

  &:hover {
    text-decoration: underline;
  }
`;

const LinkDescription = styled.p`
  color: #666;
  font-size: 0.9em;
  line-height: 1.4;
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const LinkContent = styled.div`
  padding: 15px;
`;

const LinkTags = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 12px;
`;

const Tag = styled.span`
  padding: 4px 8px;
  background: #e3f2fd;
  color: #1976d2;
  border-radius: 4px;
  font-size: 0.8em;
  font-weight: 500;
`;

const LinkActions = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 12px;
  border-top: 1px solid #eee;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 8px;
`;

const IconButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  padding: 6px;
  border-radius: 4px;
  transition: background 0.2s ease;
  color: #666;

  &:hover {
    background: #f0f0f0;
    color: #333;
  }

  ${props => props.danger && `
    &:hover {
      background: #ffebee;
      color: #e74c3c;
    }
  `}
`;

const LinkMeta = styled.div`
  font-size: 0.8em;
  color: #999;
  display: flex;
  align-items: center;
  gap: 10px;
`;

const StatsSection = styled.div`
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
`;

const StatTitle = styled.h3`
  margin: 0 0 15px 0;
  color: #2c3e50;
  font-size: 1.1em;
`;

const StatGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
`;

const StatItem = styled.div`
  text-align: center;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 6px;
`;

const StatValue = styled.div`
  font-size: 1.5em;
  font-weight: bold;
  color: #3498db;
  margin-bottom: 5px;
`;

const StatLabel = styled.div`
  font-size: 0.85em;
  color: #666;
`;

const ProcessingSection = styled.div`
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
`;

const ButtonGroup = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  margin-bottom: 15px;
`;

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
  max-width: 600px;
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
  color: #2c3e50;
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
  margin-bottom: 8px;
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
    border-color: #3498db;
    box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.2);
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1em;
  min-height: 100px;
  resize: vertical;

  &:focus {
    outline: none;
    border-color: #3498db;
    box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.2);
  }
`;

const FileUploadArea = styled.div`
  border: 2px dashed #bdc3c7;
  border-radius: 8px;
  padding: 30px;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-bottom: 20px;

  &:hover {
    border-color: #3498db;
    background: #f8f9fa;
  }
`;

const ProcessingResult = styled.div`
  background: #2c3e50;
  color: #ecf0f1;
  padding: 15px;
  border-radius: 6px;
  margin-top: 15px;
  font-family: 'Courier New', monospace;
  font-size: 0.85em;
  max-height: 200px;
  overflow-y: auto;
  white-space: pre-wrap;
`;

const Alert = styled.div`
  padding: 12px 16px;
  border-radius: 6px;
  margin-bottom: 15px;
  display: flex;
  align-items: center;
  gap: 10px;

  ${props => {
    if (props.success) return `background: #d4edda; color: #155724; border: 1px solid #c3e6cb;`;
    if (props.warning) return `background: #fff3cd; color: #856404; border: 1px solid #ffeaa7;`;
    if (props.error) return `background: #f8d7da; color: #721c24; border: 1px solid #f5c6cb;`;
    return `background: #d1ecf1; color: #0c5460; border: 1px solid #bee5eb;`;
  }}
`;

const EnhancedContentHub = () => {
  const api = useApi();
  const { user } = useAppContext();
  const fileInputRef = useRef(null);

  // State management
  const [links, setLinks] = useState([]);
  const [filteredLinks, setFilteredLinks] = useState([]);
  const [tags, setTags] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [selectedLink, setSelectedLink] = useState(null);
  const [formData, setFormData] = useState({ title: '', url: '', description: '', tags: [] });

  // Command pattern state
  const [commandStatus, setCommandStatus] = useState({ canUndo: false, canRedo: false });

  // Processing state
  const [processingStats, setProcessingStats] = useState({ total: 0, duplicates: 0, enriched: 0 });
  const [processingResult, setProcessingResult] = useState(null);
  const [processingState, setProcessingState] = useState({ loading: false, progress: 0 });

  // Load user's links and tags
  const loadData = useCallback(async () => {
    try {
      setLoading(true);

      // Load links with tags populated from public endpoint
      const linksResponse = await api.getRequest('/public/links');
      if (linksResponse.data) {
        const loadedLinks = linksResponse.data.data || [];
        setLinks(loadedLinks);
        setFilteredLinks(loadedLinks); // Initialize filteredLinks with loaded links
      }

      // Load tags from public endpoint
      const tagsResponse = await api.getRequest('/public/tags');
      if (tagsResponse.data) {
        setTags(tagsResponse.data.data || []);
      }

      // Update command status from pattern endpoint
      const commandResponse = await api.getRequest('/commands/status');
      if (commandResponse.data) {
        setCommandStatus(commandResponse.data.status);
      }

    } catch (error) {
      toast.error('Failed to load data');
      console.error('Load error:', error);
    } finally {
      setLoading(false);
    }
  }, []); // Remove api dependency to prevent infinite loop

  useEffect(() => {
    loadData();
  }, []); // Only run once on mount

  // Filter links based on search and tags
  useEffect(() => {
    let filtered = links;

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(link =>
        link.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        link.url?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        link.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by selected tags
    if (selectedTags.length > 0) {
      filtered = filtered.filter(link =>
        link.tags?.some(tag => selectedTags.includes(tag.tagId || tag.tagId || tag._id))
      );
    }

    setFilteredLinks(filtered);
  }, [links, searchQuery, selectedTags]); // Keep dependencies but optimize implementation

  // Update processing stats - remove unnecessary useCallback and useEffect
  useEffect(() => {
    setProcessingStats({
      total: links.length,
      duplicates: 0, // Would need API call to get actual duplicate count
      enriched: links.filter(link => link.categories && link.categories.length > 0).length
    });
  }, [links]); // Only update when links change

  // Command Pattern Operations
  const handleCreateLink = async (linkData) => {
    try {
      const response = await api.postRequest('/commands/links/create', linkData);
      if (response.data.success) {
        toast.success('Link created successfully!');
        await loadData();
        setCommandStatus({
          canUndo: response.data.canUndo,
          canRedo: response.data.canRedo
        });
        setShowModal(false);
      }
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to create link');
    }
  };

  const handleUpdateLink = async (linkId, updateData) => {
    try {
      const response = await api.putRequest(`/commands/links/${linkId}`, updateData);
      if (response.data.success) {
        toast.success('Link updated successfully!');
        await loadData();
        setCommandStatus({
          canUndo: response.data.canUndo,
          canRedo: response.data.canRedo
        });
        setShowModal(false);
      }
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to update link');
    }
  };

  const handleDeleteLink = async (linkId) => {
    if (!confirm('Are you sure you want to delete this link? This action can be undone.')) {
      return;
    }

    try {
      const response = await api.deleteRequest(`/commands/links/${linkId}`);
      if (response.data.success) {
        toast.success('Link deleted successfully!');
        await loadData();
        setCommandStatus({
          canUndo: response.data.canUndo,
          canRedo: response.data.canRedo
        });
      }
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to delete link');
    }
  };

  const handleUndo = async () => {
    try {
      const response = await api.postRequest('/commands/undo');
      if (response.data.success) {
        toast.success('Action undone successfully!');
        await loadData();
        setCommandStatus({
          canUndo: response.data.canUndo,
          canRedo: response.data.canRedo
        });
      }
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to undo action');
    }
  };

  const handleRedo = async () => {
    try {
      const response = await api.postRequest('/commands/redo');
      if (response.data.success) {
        toast.success('Action redone successfully!');
        await loadData();
        setCommandStatus({
          canUndo: response.data.canUndo,
          canRedo: response.data.canRedo
        });
      }
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to redo action');
    }
  };

  // Strategy Pattern Operations
  const handleDeduplicateLinks = async () => {
    try {
      setProcessingState({ loading: true, progress: 20 });

      const response = await api.postRequest('/strategies/process-links', {
        strategies: ['deduplication'],
        options: { saveToDatabase: true }
      });

      setProcessingState({ loading: true, progress: 70 });

      if (response.data.success) {
        toast.success(`Removed ${response.data.processingResults?.[0]?.result?.metadata?.duplicatesRemoved || 0} duplicate links`);
        await loadData();
        setProcessingResult(JSON.stringify(response.data, null, 2));
      } else {
        toast.error('Deduplication failed');
      }

      setProcessingState({ loading: false, progress: 100 });

    } catch (error) {
      setProcessingState({ loading: false, progress: 0 });
      toast.error(error.response?.data?.error || 'Failed to deduplicate links');
    }
  };

  const handleEnrichLinks = async () => {
    try {
      setProcessingState({ loading: true, progress: 20 });

      const response = await api.postRequest('/strategies/process-links', {
        strategies: ['enrichment'],
        options: { saveToDatabase: true }
      });

      setProcessingState({ loading: true, progress: 70 });

      if (response.data.success) {
        toast.success(`Enriched ${response.data.processingResults?.[0]?.result?.metadata?.stats?.titlesGenerated || 0} links`);
        await loadData();
        setProcessingResult(JSON.stringify(response.data, null, 2));
      } else {
        toast.error('Enrichment failed');
      }

      setProcessingState({ loading: false, progress: 100 });

    } catch (error) {
      setProcessingState({ loading: false, progress: 0 });
      toast.error(error.response?.data?.error || 'Failed to enrich links');
    }
  };

  const handleProcessAll = async () => {
    try {
      setProcessingState({ loading: true, progress: 10 });

      const response = await api.postRequest('/strategies/process-links', {
        strategies: ['deduplication', 'enrichment'],
        options: { saveToDatabase: true }
      });

      setProcessingState({ loading: true, progress: 80 });

      if (response.data.success) {
        const metadata = response.data.processingResults || [];
        const dedupResult = metadata.find(r => r.strategy === 'deduplication')?.result?.metadata;
        const enrichResult = metadata.find(r => r.strategy === 'enrichment')?.result?.metadata;

        toast.success(`Processing complete! Removed ${dedupResult?.duplicatesRemoved || 0} duplicates, enriched ${enrichResult?.stats?.titlesGenerated || 0} links`);
        await loadData();
        setProcessingResult(JSON.stringify(response.data, null, 2));
      } else {
        toast.error('Processing failed');
      }

      setProcessingState({ loading: false, progress: 100 });

    } catch (error) {
      setProcessingState({ loading: false, progress: 0 });
      toast.error(error.response?.data?.error || 'Failed to process links');
    }
  };

  // Adapter Pattern Operations
  const handleFileImport = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      setLoading(true);

      const sourceType = file.name.endsWith('.html') ? 'chrome-bookmarks' : 'csv';
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/adapters/import/${sourceType}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${user?.details?.token || localStorage.getItem('AUTH_TOKEN')}`,
          'Accept': 'application/json'
        },
        withCredentials: true
      });

      if (response.data.success) {
        toast.success(`Imported ${response.data.imported} links successfully!`);
        await loadData();
      } else {
        toast.error(response.data.error || 'Import failed');
      }

    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to import file');
    } finally {
      setLoading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleExportLinks = async () => {
    try {
      const response = await api.postRequest('/adapters/export/csv', {
        userId: user?.details?.id
      });

      if (response.data.success) {
        toast.success('Links exported successfully!');
      } else {
        toast.error('Export failed');
      }

    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to export links');
    }
  };

  // Modal handlers
  const openCreateModal = () => {
    setModalType('create');
    setFormData({ title: '', url: '', description: '', tags: [] });
    setShowModal(true);
  };

  const openEditModal = (link) => {
    setModalType('edit');
    setSelectedLink(link);
    setFormData({
      title: link.title || '',
      url: link.url || '',
      description: link.description || '',
      tags: link.tags?.map(t => t.tagId || t) || []
    });
    setShowModal(true);
  };

  const handleModalSubmit = () => {
    if (!formData.url.trim()) {
      toast.error('URL is required');
      return;
    }

    if (modalType === 'create') {
      handleCreateLink(formData);
    } else if (modalType === 'edit' && selectedLink) {
      handleUpdateLink(selectedLink.linkId, formData);
    }
  };

  // Toggle tag selection
  const toggleTag = (tagId) => {
    setSelectedTags(prev =>
      prev.includes(tagId)
        ? prev.filter(t => t !== tagId)
        : [...prev, tagId]
    );
  };

  // Get link card color based on category or source
  const getLinkCardColor = (link) => {
    if (link.categories?.includes('social')) return '#e74c3c';
    if (link.categories?.includes('development')) return '#3498db';
    if (link.categories?.includes('video')) return '#9b59b6';
    if (link.categories?.includes('shopping')) return '#f39c12';
    if (link.source === 'chrome-bookmarks') return '#2ecc71';
    if (link.source === 'csv') return '#e67e22';
    return '#3498db';
  };

  return (
    <Container>
      <Header>
        <Title>📚 Content Hub</Title>
        <ActionBar>
          <Button success onClick={openCreateModal}>
            ➕ Add Link
          </Button>
          <Button onClick={handleExportLinks} disabled={links.length === 0}>
            📤 Export CSV
          </Button>
          <Button
            onClick={handleUndo}
            disabled={!commandStatus.canUndo}
            title="Undo last action"
          >
            ↩️ Undo
          </Button>
          <Button
            onClick={handleRedo}
            disabled={!commandStatus.canRedo}
            title="Redo last undone action"
          >
            ↪️ Redo
          </Button>
        </ActionBar>
      </Header>

      <MainContent>
        <LinksSection>
          <SearchAndFilter>
            <SearchInput
              placeholder="🔍 Search links by title, URL, or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />

            <div style={{ marginBottom: '10px', fontWeight: '500', color: '#666' }}>
              Filter by tags:
            </div>
            <FilterTags>
              {tags.map(tag => (
                <FilterTag
                  key={tag.tagId || tag}
                  active={selectedTags.includes(tag.tagId || tag)}
                  onClick={() => toggleTag(tag.tagId || tag)}
                >
                  {tag.title || tag}
                </FilterTag>
              ))}
            </FilterTags>

            <div style={{ fontSize: '0.9em', color: '#666' }}>
              Showing {filteredLinks.length} of {links.length} links
              {selectedTags.length > 0 && ` • ${selectedTags.length} tag${selectedTags.length > 1 ? 's' : ''} selected`}
              {searchQuery && ` • Search: "${searchQuery}"`}
            </div>
          </SearchAndFilter>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
              Loading links...
            </div>
          ) : filteredLinks.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', background: 'white', borderRadius: '8px' }}>
              <div style={{ fontSize: '2em', marginBottom: '10px' }}>🔗</div>
              <div style={{ fontSize: '1.1em', color: '#666', marginBottom: '15px' }}>
                {links.length === 0 ? 'No links yet' : 'No links match your filters'}
              </div>
              {links.length === 0 && (
                <Button primary onClick={openCreateModal}>
                  Add Your First Link
                </Button>
              )}
            </div>
          ) : (
            <LinksGrid>
              {filteredLinks.map(link => (
                <LinkCard key={link.linkId} color={getLinkCardColor(link)}>
                  <LinkHeader>
                    <LinkTitle>{link.title || 'Untitled'}</LinkTitle>
                    <LinkUrl href={link.url} target="_blank" rel="noopener noreferrer">
                      {link.url}
                    </LinkUrl>
                    {link.description && (
                      <LinkDescription>{link.description}</LinkDescription>
                    )}
                  </LinkHeader>

                  <LinkContent>
                    {link.tags && link.tags.length > 0 && (
                      <LinkTags>
                        {link.tags.map(tag => (
                          <Tag key={tag.tagId || tag}>
                            {tag.title || tag}
                          </Tag>
                        ))}
                      </LinkTags>
                    )}

                    {link.categories && link.categories.length > 0 && (
                      <LinkTags>
                        {link.categories.map(category => (
                          <Tag key={category} style={{ background: '#e8f5e8', color: '#2e7d32' }}>
                            📁 {category}
                          </Tag>
                        ))}
                      </LinkTags>
                    )}

                    <LinkActions>
                      <ActionButtons>
                        <IconButton
                          onClick={() => openEditModal(link)}
                          title="Edit link"
                        >
                          ✏️
                        </IconButton>
                        <IconButton
                          onClick={() => navigator.clipboard.writeText(link.url)}
                          title="Copy URL"
                        >
                          📋
                        </IconButton>
                        <IconButton
                          onClick={() => window.open(link.url, '_blank')}
                          title="Open in new tab"
                        >
                          🔗
                        </IconButton>
                        <IconButton
                          danger
                          onClick={() => handleDeleteLink(link.linkId)}
                          title="Delete link"
                        >
                          🗑️
                        </IconButton>
                      </ActionButtons>

                      <LinkMeta>
                        <span>📅 {new Date(link.createdAt).toLocaleDateString()}</span>
                        {link.source && (
                          <span title={`Source: ${link.source}`}>
                            {link.source === 'chrome-bookmarks' ? '🌐' :
                             link.source === 'csv' ? '📊' : '⌨️'}
                          </span>
                        )}
                      </LinkMeta>
                    </LinkActions>
                  </LinkContent>
                </LinkCard>
              ))}
            </LinksGrid>
          )}
        </LinksSection>

        <Sidebar>
          <StatsSection>
            <StatTitle>📊 Your Library</StatTitle>
            <StatGrid>
              <StatItem>
                <StatValue>{links.length}</StatValue>
                <StatLabel>Total Links</StatLabel>
              </StatItem>
              <StatItem>
                <StatValue>{tags.length}</StatValue>
                <StatLabel>Unique Tags</StatLabel>
              </StatItem>
              <StatItem>
                <StatValue>{links.filter(l => l.source !== 'manual').length}</StatValue>
                <StatLabel>Imported</StatLabel>
              </StatItem>
              <StatItem>
                <StatValue>{processingStats.enriched}</StatValue>
                <StatLabel>Enriched</StatLabel>
              </StatItem>
            </StatGrid>
          </StatsSection>

          <ProcessingSection>
            <StatTitle>🔄 Data Processing</StatTitle>

            <Alert>
              <span>💡</span>
              <span>
                <strong>Smart Processing:</strong> Automatically clean duplicates and enrich your links with categories and tags.
              </span>
            </Alert>

            <ButtonGroup>
              <Button
                warning
                onClick={handleDeduplicateLinks}
                disabled={processingState.loading || links.length === 0}
              >
                🧹 Remove Duplicates
              </Button>
              <Button
                success
                onClick={handleEnrichLinks}
                disabled={processingState.loading || links.length === 0}
              >
                ✨ Enrich Data
              </Button>
            </ButtonGroup>

            <Button
              primary
              onClick={handleProcessAll}
              disabled={processingState.loading || links.length === 0}
              style={{ width: '100%', marginBottom: '15px' }}
            >
              🚀 Process All Links
            </Button>

            {processingState.loading && (
              <div style={{ textAlign: 'center', padding: '10px', background: '#f8f9fa', borderRadius: '6px' }}>
                <div>Processing... {processingState.progress}%</div>
              </div>
            )}

            {processingResult && (
              <details style={{ marginTop: '10px' }}>
                <summary style={{ cursor: 'pointer', fontSize: '0.9em', color: '#3498db' }}>
                  View Processing Details
                </summary>
                <ProcessingResult>
                  {processingResult}
                </ProcessingResult>
              </details>
            )}
          </ProcessingSection>

          <ProcessingSection>
            <StatTitle>📥 Import/Export</StatTitle>

            <FileUploadArea onClick={() => fileInputRef.current?.click()}>
              <div style={{ fontSize: '2em', marginBottom: '10px' }}>📁</div>
              <div style={{ fontWeight: '500', marginBottom: '5px' }}>
                Import Links
              </div>
              <div style={{ fontSize: '0.9em', color: '#666' }}>
                CSV files or Chrome Bookmarks (HTML)
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.html"
                style={{ display: 'none' }}
                onChange={handleFileImport}
              />
            </FileUploadArea>

            <Alert success>
              <span>✅</span>
              <span>
                <strong>Universal Import:</strong> Supports CSV files and Chrome bookmarks export with automatic data mapping.
              </span>
            </Alert>
          </ProcessingSection>

          <ProcessingSection>
            <StatTitle>⚡ Command History</StatTitle>

            <div style={{ fontSize: '0.9em', color: '#666', marginBottom: '15px' }}>
              <div>Can Undo: <strong>{commandStatus.canUndo ? 'Yes' : 'No'}</strong></div>
              <div>Can Redo: <strong>{commandStatus.canRedo ? 'Yes' : 'No'}</strong></div>
              <div>History Size: <strong>{commandStatus.undoStackSize || 0}</strong></div>
            </div>

            <Alert>
              <span>🎯</span>
              <span>
                <strong>Undo/Redo System:</strong> Every action can be undone. Mistakes are easily reversible!
              </span>
            </Alert>
          </ProcessingSection>
        </Sidebar>
      </MainContent>

      {/* Modal for Create/Edit Link */}
      {showModal && (
        <ModalOverlay onClick={() => setShowModal(false)}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <ModalTitle>
                {modalType === 'create' ? '➕ Add New Link' : '✏️ Edit Link'}
              </ModalTitle>
              <Button onClick={() => setShowModal(false)}>×</Button>
            </ModalHeader>

            <ModalBody>
              <FormGroup>
                <Label>URL *</Label>
                <Input
                  type="url"
                  placeholder="https://example.com"
                  value={formData.url}
                  onChange={(e) => setFormData(prev => ({ ...prev, url: e.target.value }))}
                />
              </FormGroup>

              <FormGroup>
                <Label>Title</Label>
                <Input
                  type="text"
                  placeholder="Link title (auto-generated if empty)"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                />
              </FormGroup>

              <FormGroup>
                <Label>Description</Label>
                <TextArea
                  placeholder="Brief description of this link"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                />
              </FormGroup>

              <FormGroup>
                <Label>Tags</Label>
                <Input
                  type="text"
                  placeholder="tag1, tag2, tag3 (comma separated)"
                  value={formData.tags.join(', ')}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    tags: e.target.value.split(',').map(tag => tag.trim()).filter(Boolean)
                  }))}
                />
              </FormGroup>
            </ModalBody>

            <ModalFooter>
              <Button onClick={() => setShowModal(false)}>Cancel</Button>
              <Button primary onClick={handleModalSubmit}>
                {modalType === 'create' ? 'Add Link' : 'Save Changes'}
              </Button>
            </ModalFooter>
          </ModalContent>
        </ModalOverlay>
      )}
    </Container>
  );
};

export default EnhancedContentHub;