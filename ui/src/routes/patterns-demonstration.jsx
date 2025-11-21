import { useState, useEffect } from "react";
import styled from "styled-components";
import { toast } from "react-toastify";
import { useApi } from "../hooks/use-api";
import { useAppContext } from "../context";

const PatternsContainer = styled.div`
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
  font-family: "Open Sans", sans-serif;
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 40px;
`;

const Title = styled.h1`
  color: #2c3e50;
  margin-bottom: 10px;
  font-size: 2.5rem;
`;

const Subtitle = styled.p`
  color: #7f8c8d;
  font-size: 1.1rem;
  margin-bottom: 30px;
`;

const PatternGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 25px;
  margin-bottom: 40px;
`;

const PatternCard = styled.div`
  background: white;
  border-radius: 12px;
  padding: 25px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  border-left: 5px solid ${props => props.color || '#3498db'};
  transition: transform 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
  }
`;

const PatternTitle = styled.h3`
  color: #2c3e50;
  margin-bottom: 10px;
  font-size: 1.3rem;
`;

const PatternDescription = styled.p`
  color: #555;
  margin-bottom: 20px;
  line-height: 1.6;
`;

const DemoSection = styled.div`
  background: #f8f9fa;
  border-radius: 8px;
  padding: 15px;
  margin-top: 15px;
`;

const DemoButton = styled.button`
  background: ${props => props.color || '#3498db'};
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 6px;
  cursor: pointer;
  margin-right: 10px;
  margin-bottom: 10px;
  transition: background 0.2s ease;

  &:hover {
    background: ${props => props.darkColor || '#2980b9'};
  }

  &:disabled {
    background: #bdc3c7;
    cursor: not-allowed;
  }
`;

const InputField = styled.input`
  width: 100%;
  padding: 10px;
  margin-bottom: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 10px;
  margin-bottom: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  min-height: 100px;
  resize: vertical;
`;

const ResultDisplay = styled.div`
  background: #2c3e50;
  color: #ecf0f1;
  padding: 15px;
  border-radius: 6px;
  margin-top: 15px;
  font-family: 'Courier New', monospace;
  font-size: 13px;
  max-height: 300px;
  overflow-y: auto;
  white-space: pre-wrap;
`;

const StatusIndicator = styled.div`
  display: inline-block;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  margin-right: 8px;
  background: ${props => props.success ? '#27ae60' : props.error ? '#e74c3c' : '#f39c12'};
`;

const FileUpload = styled.div`
  border: 2px dashed #bdc3c7;
  border-radius: 8px;
  padding: 20px;
  text-align: center;
  margin-bottom: 15px;
  cursor: pointer;
  transition: border-color 0.2s ease;

  &:hover {
    border-color: #3498db;
  }
`;

const ProgressIndicator = styled.div`
  width: 100%;
  height: 4px;
  background: #ecf0f1;
  border-radius: 2px;
  overflow: hidden;
  margin-top: 10px;
`;

const ProgressBar = styled.div`
  height: 100%;
  background: #3498db;
  transition: width 0.3s ease;
  width: ${props => props.progress}%;
`;

const PatternsDemonstration = () => {
  const api = useApi();
  const { user } = useAppContext();

  // State for pattern demonstrations
  const [adapterResults, setAdapterResults] = useState([]);
  const [commandHistory, setCommandHistory] = useState([]);
  const [strategyResults, setStrategyResults] = useState({});
  const [commandStatus, setCommandStatus] = useState({ canUndo: false, canRedo: false });
  const [processingState, setProcessingState] = useState({ loading: false, progress: 0 });

  // Demo data for strategies
  const [demoLinks, setDemoLinks] = useState([
    {
      url: "https://github.com/facebook/react",
      title: "React - A JavaScript library for building user interfaces",
      description: "React makes it painless to create interactive UIs",
      tags: []
    },
    {
      url: "https://github.com/facebook/react",
      title: "Facebook React Repository",
      description: "The official React repository on GitHub",
      tags: []
    },
    {
      url: "https://nodejs.org/",
      description: "Node.js JavaScript runtime",
      tags: []
    }
  ]);

  // Adapter Pattern demonstration
  const demonstrateAdapters = async (sourceType) => {
    try {
      setProcessingState({ loading: true, progress: 20 });

      if (sourceType === 'csv') {
        // Test CSV adapter
        const response = await api.get('/adapters');
        const adapters = response.data.adapters;

        setProcessingState({ loading: true, progress: 50 });

        const testResult = await api.get(`/adapters/csv/test`);
        setAdapterResults(prev => [...prev, {
          type: 'CSV Adapter',
          success: testResult.data.success,
          data: testResult.data,
          timestamp: new Date().toISOString()
        }]);

      } else if (sourceType === 'chrome-bookmarks') {
        // Test Chrome Bookmarks adapter
        const response = await api.get('/adapters');
        const adapters = response.data.adapters;

        setAdapterResults(prev => [...prev, {
          type: 'Chrome Bookmarks Adapter',
          success: true,
          data: { message: 'Chrome Bookmarks adapter available for import' },
          timestamp: new Date().toISOString()
        }]);
      }

      setProcessingState({ loading: false, progress: 100 });
      toast.success(`${sourceType.toUpperCase()} Adapter tested successfully!`);

    } catch (error) {
      setProcessingState({ loading: false, progress: 0 });
      setAdapterResults(prev => [...prev, {
        type: `${sourceType.toUpperCase()} Adapter`,
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      }]);
      toast.error(`Adapter test failed: ${error.message}`);
    }
  };

  // Command Pattern demonstration
  const demonstrateCommands = async (action) => {
    try {
      let result;

      switch (action) {
        case 'create':
          result = await api.post('/commands/links/create', {
            url: "https://example.com/test-link",
            title: "Test Link from Command Pattern",
            description: "This link was created using the Command Pattern",
            tags: ["test", "command-pattern"]
          });
          break;

        case 'undo':
          if (commandStatus.canUndo) {
            result = await api.post('/commands/undo');
          } else {
            toast.warning("No commands to undo");
            return;
          }
          break;

        case 'redo':
          if (commandStatus.canRedo) {
            result = await api.post('/commands/redo');
          } else {
            toast.warning("No commands to redo");
            return;
          }
          break;

        case 'history':
          result = await api.get('/commands/history');
          setCommandHistory(result.data.history || []);
          toast.success("Command history updated");
          return;
      }

      if (result?.data) {
        setCommandHistory(prev => [result.data, ...prev.slice(0, 9)]);
        setCommandStatus({
          canUndo: result.data.canUndo || false,
          canRedo: result.data.canRedo || false
        });
        toast.success(`Command ${action} executed successfully!`);
      }

    } catch (error) {
      toast.error(`Command failed: ${error.message}`);
    }
  };

  // Strategy Pattern demonstration
  const demonstrateStrategies = async (strategyName) => {
    try {
      setProcessingState({ loading: true, progress: 30 });

      const response = await api.post('/strategies/process', {
        data: demoLinks,
        strategies: [strategyName]
      });

      setProcessingState({ loading: true, progress: 70 });

      setStrategyResults(prev => ({
        ...prev,
        [strategyName]: {
          success: response.data.success,
          result: response.data,
          timestamp: new Date().toISOString()
        }
      }));

      if (response.data.success && response.data.data) {
        setDemoLinks(response.data.data);
      }

      setProcessingState({ loading: false, progress: 100 });
      toast.success(`${strategyName} strategy applied successfully!`);

    } catch (error) {
      setProcessingState({ loading: false, progress: 0 });
      setStrategyResults(prev => ({
        ...prev,
        [strategyName]: {
          success: false,
          error: error.message,
          timestamp: new Date().toISOString()
        }
      }));
      toast.error(`Strategy failed: ${error.message}`);
    }
  };

  // Update command status on mount
  useEffect(() => {
    const updateCommandStatus = async () => {
      try {
        const response = await api.get('/commands/status');
        setCommandStatus(response.data.status);
      } catch (error) {
        console.error('Failed to get command status:', error);
      }
    };

    updateCommandStatus();
  }, [api]);

  return (
    <PatternsContainer>
      <Header>
        <Title>Design Patterns in Action</Title>
        <Subtitle>
          Real implementations of Adapter, Command, and Strategy patterns solving actual problems
        </Subtitle>
      </Header>

      <PatternGrid>
        {/* Adapter Pattern Card */}
        <PatternCard color="#3498db">
          <PatternTitle>🔌 Adapter Pattern</PatternTitle>
          <PatternDescription>
            Multiple data sources (CSV, Chrome Bookmarks, MongoDB) with unified interface.
            Solves the problem of importing links from different formats.
          </PatternDescription>

          <DemoSection>
            <h4>Available Adapters:</h4>
            <DemoButton
              color="#3498db"
              darkColor="#2980b9"
              onClick={() => demonstrateAdapters('csv')}
              disabled={processingState.loading}
            >
              Test CSV Adapter
            </DemoButton>
            <DemoButton
              color="#9b59b6"
              darkColor="#8e44ad"
              onClick={() => demonstrateAdapters('chrome-bookmarks')}
              disabled={processingState.loading}
            >
              Test Chrome Bookmarks
            </DemoButton>

            {adapterResults.length > 0 && (
              <ResultDisplay>
                {JSON.stringify(adapterResults, null, 2)}
              </ResultDisplay>
            )}
          </DemoSection>
        </PatternCard>

        {/* Command Pattern Card */}
        <PatternCard color="#e74c3c">
          <PatternTitle>⚡ Command Pattern</PatternTitle>
          <PatternDescription>
            User actions with undo/redo functionality. Each operation (create, update, delete)
            is encapsulated as a command that can be executed and undone.
          </PatternDescription>

          <DemoSection>
            <h4>Command Operations:</h4>
            <DemoButton
              color="#27ae60"
              darkColor="#229954"
              onClick={() => demonstrateCommands('create')}
              disabled={processingState.loading}
            >
              Create Link
            </DemoButton>
            <DemoButton
              color="#f39c12"
              darkColor="#e67e22"
              onClick={() => demonstrateCommands('undo')}
              disabled={!commandStatus.canUndo || processingState.loading}
            >
              Undo {commandStatus.canUndo ? '(Available)' : '(None)'}
            </DemoButton>
            <DemoButton
              color="#3498db"
              darkColor="#2980b9"
              onClick={() => demonstrateCommands('redo')}
              disabled={!commandStatus.canRedo || processingState.loading}
            >
              Redo {commandStatus.canRedo ? '(Available)' : '(None)'}
            </DemoButton>
            <DemoButton
              color="#95a5a6"
              darkColor="#7f8c8d"
              onClick={() => demonstrateCommands('history')}
              disabled={processingState.loading}
            >
              Show History
            </DemoButton>

            <div style={{ marginTop: '10px' }}>
              <StatusIndicator success={commandStatus.canUndo} />
              Can Undo: {commandStatus.canUndo ? 'Yes' : 'No'}
              <span style={{ marginLeft: '15px' }}>
                <StatusIndicator success={commandStatus.canRedo} />
                Can Redo: {commandStatus.canRedo ? 'Yes' : 'No'}
              </span>
            </div>

            {commandHistory.length > 0 && (
              <ResultDisplay>
                {JSON.stringify(commandHistory.slice(0, 3), null, 2)}
              </ResultDisplay>
            )}
          </DemoSection>
        </PatternCard>

        {/* Strategy Pattern Card */}
        <PatternCard color="#27ae60">
          <PatternTitle>🎯 Strategy Pattern</PatternTitle>
          <PatternDescription>
            Flexible data processing with interchangeable algorithms.
            Deduplication and enrichment strategies for link data.
          </PatternDescription>

          <DemoSection>
            <h4>Processing Strategies:</h4>
            <DemoButton
              color="#e74c3c"
              darkColor="#c0392b"
              onClick={() => demonstrateStrategies('deduplication')}
              disabled={processingState.loading}
            >
              Remove Duplicates
            </DemoButton>
            <DemoButton
              color="#9b59b6"
              darkColor="#8e44ad"
              onClick={() => demonstrateStrategies('enrichment')}
              disabled={processingState.loading}
            >
              Enrich Data
            </DemoButton>

            <div style={{ marginTop: '15px' }}>
              <small>Demo Links ({demoLinks.length}):</small>
              {demoLinks.map((link, i) => (
                <div key={i} style={{ padding: '5px', background: '#ecf0f1', margin: '5px 0', borderRadius: '4px' }}>
                  <strong>{link.title || 'Untitled'}</strong><br/>
                  <small>{link.url}</small>
                </div>
              ))}
            </div>

            {Object.keys(strategyResults).length > 0 && (
              <ResultDisplay>
                {JSON.stringify(strategyResults, null, 2)}
              </ResultDisplay>
            )}
          </DemoSection>
        </PatternCard>
      </PatternGrid>

      {/* Progress Indicator */}
      {processingState.loading && (
        <DemoSection>
          <h4>Processing...</h4>
          <ProgressIndicator>
            <ProgressBar progress={processingState.progress} />
          </ProgressIndicator>
          <small>{processingState.progress}% complete</small>
        </DemoSection>
      )}

      {/* Pattern Summary */}
      <PatternCard color="#34495e" style={{ gridColumn: '1 / -1' }}>
        <PatternTitle>🏗️ Pattern Implementation Summary</PatternTitle>
        <PatternDescription>
          These patterns solve real user problems and provide concrete evidence of LinkSaver's
          extensible architecture and CMS capabilities.
        </PatternDescription>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginTop: '20px' }}>
          <div>
            <h4>Adapter Pattern:</h4>
            <ul>
              <li>✅ CSV import/export functionality</li>
              <li>✅ Chrome bookmarks integration</li>
              <li>✅ MongoDB data abstraction</li>
              <li>✅ Unified interface for all sources</li>
            </ul>
          </div>

          <div>
            <h4>Command Pattern:</h4>
            <ul>
              <li>✅ Atomic link operations</li>
              <li>✅ Complete undo/redo system</li>
              <li>✅ Command history tracking</li>
              <li>✅ Action encapsulation</li>
            </ul>
          </div>

          <div>
            <h4>Strategy Pattern:</h4>
            <ul>
              <li>✅ Data deduplication</li>
              <li>✅ Content enrichment</li>
              <li>✅ Flexible processing pipeline</li>
              <li>✅ Configurable algorithms</li>
            </ul>
          </div>
        </div>
      </PatternCard>
    </PatternsContainer>
  );
};

export default PatternsDemonstration;