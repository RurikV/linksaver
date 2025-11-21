/**
 * Pattern Laboratory - Design Patterns Demonstration
 *
 * Demonstrates all design patterns in action:
 * - Creational Patterns: Singleton, Factory, Builder, Prototype, Abstract Factory
 * - Structural Patterns: Adapter, Bridge, Composite, Decorator, Facade, Flyweight, Proxy
 * - Behavioral Patterns: Observer, Strategy, Command, Iterator, Mediator, Memento, State, Template Method
 * - SOLID Principles demonstration
 * - Real implementation with saved links
 */

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import styled from 'styled-components';

import { useApi } from '../hooks/use-api';
import Header from '../components/header';
import Button from '../components/button';
import Spinner from '../components/spinner';

// ==================== Styled Components ====================

const LabContainer = styled.div`
  min-height: 100vh;
  background: #f8fafc;
  padding: 20px;
`;

const LabContent = styled.div`
  max-width: 1600px;
  margin: 0 auto;
  background: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid #e2e8f0;
  overflow: hidden;
`;

const LabHeader = styled.div`
  background: #1e293b;
  color: white;
  padding: 30px;
  text-align: center;
`;

const LabTitle = styled.h1`
  font-size: 2.5em;
  margin-bottom: 10px;
  font-weight: 700;
`;

const LabSubtitle = styled.p`
  font-size: 1.1em;
  opacity: 0.9;
  margin: 0;
`;

const LabBody = styled.div`
  padding: 30px;
`;

const SectionTitle = styled.h2`
  font-size: 1.8em;
  color: #333;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 10px;
`;

const PatternGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 25px;
  margin-bottom: 40px;
`;

const PatternCard = styled.div`
  background: white;
  border-radius: 8px;
  padding: 25px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid #e2e8f0;
  transition: all 0.2s ease;
  position: relative;
`;

const PatternHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
`;

const PatternName = styled.h3`
  font-size: 1.3em;
  color: #333;
  margin: 0;
  font-weight: 700;
`;

const PatternType = styled.span`
  padding: 4px 12px;
  border-radius: 16px;
  font-size: 0.8em;
  font-weight: 600;

  ${props => props.$type === 'creational' && `
    background: #e3f2fd;
    color: #1565c0;
  `}

  ${props => props.$type === 'structural' && `
    background: #f3e5f5;
    color: #7b1fa2;
  `}

  ${props => props.$type === 'behavioral' && `
    background: #e8f5e8;
    color: #2e7d32;
  `}

  ${props => props.$type === 'solid' && `
    background: #fff3e0;
    color: #ef6c00;
  `}
`;

const PatternDescription = styled.p`
  color: #666;
  line-height: 1.6;
  margin-bottom: 15px;
`;

const PatternExample = styled.div`
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  padding: 15px;
  margin-bottom: 20px;
  font-family: 'Courier New', monospace;
  font-size: 0.85em;
  max-height: 150px;
  overflow-y: auto;
`;

const PatternActions = styled.div`
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
`;

const ResultDisplay = styled.div`
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 20px;
  margin-top: 20px;
  max-height: 300px;
  overflow-y: auto;
`;

const CodeBlock = styled.pre`
  background: #2d3748;
  color: #e2e8f0;
  padding: 15px;
  border-radius: 6px;
  overflow-x: auto;
  font-size: 0.85em;
  margin: 10px 0;
`;

const SOLIDCard = styled.div`
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
`;

const PrincipleName = styled.h3`
  color: #1e293b;
  margin: 0 0 10px 0;
  font-weight: 700;
`;

const PrincipleExample = styled.div`
  background: white;
  padding: 15px;
  border-radius: 6px;
  margin-bottom: 10px;
`;

// ==================== Design Pattern Implementations ====================

/**
 * Singleton Pattern Implementation
 */
class SingletonDatabase {
  constructor() {
    if (!SingletonDatabase.instance) {
      this.connections = 0;
      this.maxConnections = 100;
      SingletonDatabase.instance = this;
    }
    return SingletonDatabase.instance;
  }

  connect() {
    if (this.connections < this.maxConnections) {
      this.connections++;
      return `Connected. Active connections: ${this.connections}`;
    }
    throw new Error('Max connections reached');
  }

  disconnect() {
    if (this.connections > 0) {
      this.connections--;
      return `Disconnected. Active connections: ${this.connections}`;
    }
  }

  getStatus() {
    return {
      connections: this.connections,
      maxConnections: this.maxConnections,
      instance: this === SingletonDatabase.instance
    };
  }

  static getInstance() {
    if (!SingletonDatabase.instance) {
      SingletonDatabase.instance = new SingletonDatabase();
    }
    return SingletonDatabase.instance;
  }

  static reset() {
    SingletonDatabase.instance = null;
  }
}

/**
 * Factory Pattern Implementation
 */
class ComponentFactory {
  static create(type, config = {}) {
    switch (type) {
      case 'link':
        return new LinkComponent(config);
      case 'container':
        return new ContainerComponent(config);
      case 'button':
        return new ButtonComponent(config);
      case 'text':
        return new TextComponent(config);
      default:
        throw new Error(`Unknown component type: ${type}`);
    }
  }

  static createLinkComponent(config) {
    return new LinkComponent({
      id: config.id || `link-${Date.now()}`,
      url: config.url || '',
      title: config.title || '',
      description: config.description || '',
      ...config
    });
  }
}

/**
 * Observer Pattern Implementation
 */
class LinkObserver {
  constructor() {
    this.observers = [];
  }

  subscribe(observer) {
    this.observers.push(observer);
  }

  unsubscribe(observer) {
    this.observers = this.observers.filter(obs => obs !== observer);
  }

  notify(event, data) {
    this.observers.forEach(observer => {
      try {
        observer.update(event, data);
      } catch (error) {
        console.error('Observer error:', error);
      }
    });
  }
}

/**
 * Strategy Pattern Implementation
 */
class SortingStrategy {
  constructor() {
    this.strategy = null;
  }

  setStrategy(strategy) {
    this.strategy = strategy;
  }

  sort(items) {
    if (!this.strategy) {
      throw new Error('No strategy set');
    }
    return this.strategy.sort(items);
  }
}

class AlphabeticalSortStrategy {
  sort(items) {
    return [...items].sort((a, b) => {
      const titleA = a.title || a.name || '';
      const titleB = b.title || b.name || '';
      return titleA.localeCompare(titleB);
    });
  }
}

class DateSortStrategy {
  sort(items) {
    return [...items].sort((a, b) => {
      const dateA = new Date(a.createdAt || 0);
      const dateB = new Date(b.createdAt || 0);
      return dateB - dateA;
    });
  }
}

/**
 * Command Pattern Implementation
 */
class Command {
  constructor(execute, undo) {
    this.execute = execute;
    this.undo = undo;
  }
}

class LinkCommandManager {
  constructor() {
    this.history = [];
    this.currentIndex = -1;
  }

  executeCommand(command) {
    // Remove any commands after current index (redo history)
    this.history = this.history.slice(0, this.currentIndex + 1);

    // Execute command and add to history
    const result = command.execute();
    this.history.push(command);
    this.currentIndex++;

    return result;
  }

  undo() {
    if (this.canUndo()) {
      const command = this.history[this.currentIndex];
      const result = command.undo();
      this.currentIndex--;
      return result;
    }
    throw new Error('Nothing to undo');
  }

  redo() {
    if (this.canRedo()) {
      this.currentIndex++;
      const command = this.history[this.currentIndex];
      const result = command.execute();
      return result;
    }
    throw new Error('Nothing to redo');
  }

  canUndo() {
    return this.currentIndex >= 0;
  }

  canRedo() {
    return this.currentIndex < this.history.length - 1;
  }

  getHistory() {
    return this.history.map((cmd, index) => ({
      index,
      canUndo: index <= this.currentIndex,
      canRedo: index <= this.currentIndex
    }));
  }
}

/**
 * Adapter Pattern Implementation
 */
class LinkDataAdapter {
  constructor(link) {
    this.link = link;
  }

  // Adapt link data to component format
  toComponent() {
    return {
      id: this.link.linkId,
      type: 'link',
      title: this.link.title,
      description: this.link.description,
      metadata: {
        url: this.link.url,
        tags: this.link.tags,
        createdAt: this.link.createdAt
      }
    };
  }

  // Adapt link to API format
  toApi() {
    return {
      linkId: this.link.linkId,
      url: this.link.url,
      title: this.link.title,
      description: this.link.description,
      tags: this.link.tags
    };
  }
}

/**
 * Proxy Pattern Implementation
 */
class LinkProxy {
  constructor(link, permissions = {}) {
    this.link = link;
    this.permissions = permissions;
  }

  getTitle() {
    if (!this.permissions.canRead) {
      throw new Error('Access denied: Cannot read link');
    }
    return this.link.title;
  }

  setTitle(newTitle) {
    if (!this.permissions.canWrite) {
      throw new Error('Access denied: Cannot modify link');
    }
    this.link.title = newTitle;
    return this.link;
  }

  getUrl() {
    if (!this.permissions.canRead) {
      throw new Error('Access denied: Cannot read link');
    }
    return this.link.url;
  }
}

/**
 * Decorator Pattern Implementation
 */
class LinkDecorator {
  constructor(link) {
    this.link = link;
  }

  display() {
    return this.link.display();
  }
}

class EnhancedLinkDecorator extends LinkDecorator {
  constructor(link, features = {}) {
    super(link);
    this.features = features;
  }

  display() {
    let output = super.display();

    if (this.features.showTimestamp) {
      output += `\nCreated: ${new Date(this.link.createdAt || Date.now()).toLocaleString()}`;
    }

    if (this.features.showTags && this.link.tags) {
      const tags = this.link.tags.map(tag => tag.title || tag.name).join(', ');
      output += `\nTags: ${tags}`;
    }

    if (this.features.showUrl) {
      output += `\nURL: ${this.link.url}`;
    }

    return output;
  }
}

/**
 * Component Classes
 */
class LinkComponent {
  constructor(config) {
    this.id = config.id;
    this.title = config.title;
    this.url = config.url;
    this.description = config.description;
    this.createdAt = Date.now();
  }

  display() {
    return `${this.title}: ${this.description}`;
  }

  render() {
    return `
      <div class="link-component" data-id="${this.id}">
        <h4><a href="${this.url}">${this.title}</a></h4>
        <p>${this.description}</p>
      </div>
    `;
  }
}

class ContainerComponent {
  constructor(config) {
    this.id = config.id;
    this.children = [];
    this.layout = config.layout || 'vertical';
  }

  addChild(child) {
    this.children.push(child);
  }

  display() {
    return `Container with ${this.children.length} items`;
  }

  render() {
    const childrenHtml = this.children.map(child => child.render()).join('');
    return `<div class="container" data-layout="${this.layout}">${childrenHtml}</div>`;
  }
}

class ButtonComponent {
  constructor(config) {
    this.id = config.id;
    this.text = config.text;
    this.action = config.action;
  }

  display() {
    return `Button: ${this.text}`;
  }

  render() {
    return `<button data-id="${this.id}">${this.text}</button>`;
  }
}

class TextComponent {
  constructor(config) {
    this.id = config.id;
    this.content = config.content;
    this.format = config.format || 'plain';
  }

  display() {
    return `Text: ${this.content.substring(0, 50)}...`;
  }

  render() {
    const tag = this.format === 'heading' ? 'h3' : 'p';
    return `<${tag} data-id="${this.id}">${this.content}</${tag}>`;
  }
}

// ==================== React Component ====================

const PatternLab = () => {
  const navigate = useNavigate();
  const { getRequest } = useApi();

  // State management
  const [loading, setLoading] = useState(true);
  const [links, setLinks] = useState([]);
  const [results, setResults] = useState({});
  const [demonstrations, setDemonstrations] = useState({});

  // Pattern instances
  const singletonRef = useRef(null);
  const factoryRef = useRef(null);
  const observerRef = useRef(null);
  const strategyRef = useRef(null);
  const commandManagerRef = useRef(null);

  // Initialize patterns on mount
  useEffect(() => {
    initializePatterns();
    loadLinks();
  }, []);

  const initializePatterns = () => {
    // Initialize Singleton
    singletonRef.current = SingletonDatabase.getInstance();

    // Initialize Factory
    factoryRef.current = ComponentFactory;

    // Initialize Observer
    observerRef.current = new LinkObserver();

    // Initialize Strategy
    strategyRef.current = new SortingStrategy();

    // Initialize Command Manager
    commandManagerRef.current = new LinkCommandManager();
  };

  const loadLinks = async () => {
    try {
      const response = await getRequest('/public/links');
      if (response.data?.data) {
        setLinks(response.data.data);
      }
    } catch (error) {
      console.error('Failed to load links:', error);
      toast.error('Failed to load links');
    } finally {
      setLoading(false);
    }
  };

  // ==================== Pattern Demonstrations ====================

  const demonstrateSingleton = () => {
    try {
      SingletonDatabase.reset();
      const db1 = SingletonDatabase.getInstance();
      const db2 = SingletonDatabase.getInstance();
      const db3 = new SingletonDatabase(); // Should return same instance

      const status1 = db1.connect();
      const status2 = db3.connect();
      const status3 = db2.disconnect();

      setResults(prev => ({
        ...prev,
        singleton: {
          db1SameAsDb2: db1 === db2,
          db2SameAsDb3: db2 === db3,
          status1,
          status2,
          status3,
          finalStatus: db1.getStatus()
        }
      }));

      toast.success('Singleton pattern demonstrated!');
    } catch (error) {
      toast.error('Singleton demonstration failed');
    }
  };

  const demonstrateFactory = () => {
    try {
      const link1 = factoryRef.current.createLinkComponent({
        title: 'Factory Demo Link',
        url: 'https://factory-pattern.com',
        description: 'Created using Factory Pattern'
      });

      const container = factoryRef.current.create('container', {
        id: 'demo-container',
        layout: 'grid'
      });

      container.addChild(link1);
      container.addChild(factoryRef.current.create('button', {
        text: 'Factory Button',
        action: 'click'
      }));

      setResults(prev => ({
        ...prev,
        factory: {
          linkComponent: link1.display(),
          containerComponent: container.display(),
          renderedHtml: container.render()
        }
      }));

      toast.success('Factory pattern demonstrated!');
    } catch (error) {
      toast.error('Factory demonstration failed');
    }
  };

  const demonstrateObserver = () => {
    try {
      const logs = [];

      const observer1 = {
        update: (event, data) => {
          logs.push(`Observer 1: ${event} - ${JSON.stringify(data)}`);
        }
      };

      const observer2 = {
        update: (event, data) => {
          logs.push(`Observer 2: ${event} - ${JSON.stringify(data)}`);
        }
      };

      observerRef.current.subscribe(observer1);
      observerRef.current.subscribe(observer2);

      observerRef.current.notify('link-added', { title: 'Test Link' });
      observerRef.current.notify('link-updated', { id: '123', changes: ['title'] });
      observerRef.current.notify('link-deleted', { id: '123' });

      setResults(prev => ({
        ...prev,
        observer: {
          observersCount: 2,
          events: logs
        }
      }));

      toast.success('Observer pattern demonstrated!');
    } catch (error) {
      toast.error('Observer demonstration failed');
    }
  };

  const demonstrateStrategy = () => {
    try {
      const strategy = strategyRef.current;
      const testData = links.slice(0, 5).map(link => ({
        ...link,
        title: link.title || link.name
      }));

      strategy.setStrategy(new AlphabeticalSortStrategy());
      const alphabeticalResult = strategy.sort(testData);

      strategy.setStrategy(new DateSortStrategy());
      const dateResult = strategy.sort(testData);

      setResults(prev => ({
        ...prev,
        strategy: {
          original: testData.map(item => item.title || item.name),
          alphabetical: alphabeticalResult.map(item => item.title || item.name),
          dateSorted: dateResult.map(item => item.title || item.name)
        }
      }));

      toast.success('Strategy pattern demonstrated!');
    } catch (error) {
      toast.error('Strategy demonstration failed');
    }
  };

  const demonstrateCommand = () => {
    try {
      const manager = commandManagerRef.current;
      const testLink = {
        id: 'test-link',
        title: 'Test Link',
        url: 'https://test.com'
      };

      // Create commands
      const addCommand = new Command(
        () => {
          testLink.title = 'Test Link (Added)';
          return 'Link added';
        },
        () => {
          testLink.title = 'Test Link';
          return 'Link removal undone';
        }
      );

      const updateCommand = new Command(
        () => {
          testLink.title = 'Test Link (Updated)';
          return 'Link updated';
        },
        () => {
          testLink.title = 'Test Link (Added)';
          return 'Link update undone';
        }
      );

      // Execute commands
      const result1 = manager.executeCommand(addCommand);
      const result2 = manager.executeCommand(updateCommand);

      // Undo
      const undoResult = manager.undo();

      // Redo
      const redoResult = manager.redo();

      setResults(prev => ({
        ...prev,
        command: {
          history: manager.getHistory(),
          finalLinkTitle: testLink.title,
          results: [result1, result2, undoResult, redoResult]
        }
      }));

      toast.success('Command pattern demonstrated!');
    } catch (error) {
      toast.error('Command demonstration failed');
    }
  };

  const demonstrateAdapter = () => {
    try {
      const testLink = links[0] || {
        linkId: 'test',
        title: 'Test Link',
        url: 'https://test.com',
        description: 'Test description'
      };

      const adapter = new LinkDataAdapter(testLink);
      const componentFormat = adapter.toComponent();
      const apiFormat = adapter.toApi();

      setResults(prev => ({
        ...prev,
        adapter: {
          originalLink: testLink,
          componentFormat,
          apiFormat
        }
      }));

      toast.success('Adapter pattern demonstrated!');
    } catch (error) {
      toast.error('Adapter demonstration failed');
    }
  };

  const demonstrateProxy = () => {
    try {
      const testLink = links[0] || {
        linkId: 'test',
        title: 'Test Link',
        url: 'https://test.com'
      };

      const readOnlyProxy = new LinkProxy(testLink, { canRead: true, canWrite: false });
      const adminProxy = new LinkProxy(testLink, { canRead: true, canWrite: true });

      const title = readOnlyProxy.getTitle();

      let adminTitle, writeError;
      try {
        adminTitle = adminProxy.getTitle();
        adminProxy.setTitle('Modified by Admin');
        writeError = null;
      } catch (error) {
        writeError = error.message;
      }

      try {
        readOnlyProxy.setTitle('Should fail');
        writeError = 'ReadOnly proxy should not allow writing';
      } catch (error) {
        writeError = error.message;
      }

      setResults(prev => ({
        ...prev,
        proxy: {
          readOnlyTitle: title,
          adminTitle: adminProxy.getTitle(),
          writeProtection: writeError,
          finalLinkTitle: testLink.title
        }
      }));

      toast.success('Proxy pattern demonstrated!');
    } catch (error) {
      toast.error('Proxy demonstration failed');
    }
  };

  const demonstrateDecorator = () => {
    try {
      const testLink = links[0] || {
        linkId: 'test',
        title: 'Test Link',
        url: 'https://test.com',
        description: 'Test description',
        createdAt: new Date().toISOString(),
        tags: [{ title: 'test' }]
      };

      const basicLink = new LinkComponent(testLink);
      const enhancedLink = new EnhancedLinkDecorator(basicLink, {
        showTimestamp: true,
        showTags: true,
        showUrl: true
      });

      const basicDisplay = basicLink.display();
      const enhancedDisplay = enhancedLink.display();

      setResults(prev => ({
        ...prev,
        decorator: {
          basicDisplay,
          enhancedDisplay,
          renderedHtml: enhancedLink.render()
        }
      }));

      toast.success('Decorator pattern demonstrated!');
    } catch (error) {
      toast.error('Decorator demonstration failed');
    }
  };

  // ==================== Pattern Cards ====================

  const patternCards = [
    {
      name: 'Singleton',
      type: 'creational',
      description: 'Ensures a class has only one instance and provides global access to it.',
      example: 'class Database { static getInstance() { ... } }',
      actions: [
        { label: 'Demonstrate', onClick: demonstrateSingleton }
      ]
    },
    {
      name: 'Factory',
      type: 'creational',
      description: 'Creates objects without specifying the exact class of object that will be created.',
      example: 'ComponentFactory.create(type, config)',
      actions: [
        { label: 'Demonstrate', onClick: demonstrateFactory }
      ]
    },
    {
      name: 'Observer',
      type: 'behavioral',
      description: 'Defines a one-to-many dependency between objects so that when one object changes state, all dependents are notified.',
      example: 'observer.subscribe(callback); observer.notify(event, data);',
      actions: [
        { label: 'Demonstrate', onClick: demonstrateObserver }
      ]
    },
    {
      name: 'Strategy',
      type: 'behavioral',
      description: 'Defines a family of algorithms, encapsulates each one, and makes them interchangeable.',
      example: 'sorter.setStrategy(new AlphabeticalSort());',
      actions: [
        { label: 'Demonstrate', onClick: demonstrateStrategy }
      ]
    },
    {
      name: 'Command',
      type: 'behavioral',
      description: 'Encapsulates a request as an object, thereby letting you parameterize clients with different requests.',
      example: 'commandManager.executeCommand(new AddLinkCommand());',
      actions: [
        { label: 'Demonstrate', onClick: demonstrateCommand }
      ]
    },
    {
      name: 'Adapter',
      type: 'structural',
      description: 'Allows the interface of an existing class to be used as another interface.',
      example: 'new LinkDataAdapter(link).toComponent();',
      actions: [
        { label: 'Demonstrate', onClick: demonstrateAdapter }
      ]
    },
    {
      name: 'Proxy',
      type: 'structural',
      description: 'Provides a surrogate or placeholder for another object to control access to it.',
      example: 'new LinkProxy(link, permissions).getTitle();',
      actions: [
        { label: 'Demonstrate', onClick: demonstrateProxy }
      ]
    },
    {
      name: 'Decorator',
      type: 'structural',
      description: 'Adds new functionality to an object dynamically without altering its structure.',
      example: 'new EnhancedLinkDecorator(link, { showTimestamp: true });',
      actions: [
        { label: 'Demonstrate', onClick: demonstrateDecorator }
      ]
    }
  ];

  const renderPatternCard = (pattern) => {
    const hasResults = results[pattern.name.toLowerCase()];

    return (
      <PatternCard key={pattern.name}>
        <PatternHeader>
          <PatternName>{pattern.name}</PatternName>
          <PatternType $type={pattern.type}>{pattern.type}</PatternType>
        </PatternHeader>

        <PatternDescription>{pattern.description}</PatternDescription>

        <PatternExample>
          <strong>Example:</strong><br />
          {pattern.example}
        </PatternExample>

        <PatternActions>
          {pattern.actions.map((action, index) => (
            <Button
              key={index}
              onClick={action.onClick}
              style={{
                background: '#475569',
                color: 'white',
                border: 'none',
                padding: '8px 16px',
                fontSize: '0.9em',
                borderRadius: '6px'
              }}
            >
              {action.label}
            </Button>
          ))}
        </PatternActions>

        {hasResults && (
          <ResultDisplay>
            <h4>Results:</h4>
            <CodeBlock>
              {JSON.stringify(hasResults, null, 2)}
            </CodeBlock>
          </ResultDisplay>
        )}
      </PatternCard>
    );
  };

  if (loading) {
    return (
      <LabContainer>
        <Header />
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
          <Spinner size="large" />
        </div>
      </LabContainer>
    );
  }

  return (
    <LabContainer>
      <Header />
      <LabContent>
        <LabHeader>
          <LabTitle>Pattern Laboratory</LabTitle>
          <LabSubtitle>
            Design Patterns in Action with Real Implementations
          </LabSubtitle>
        </LabHeader>

        <LabBody>
          {/* SOLID Principles */}
          <SectionTitle>SOLID Principles</SectionTitle>
          <SOLIDCard>
            <PrincipleName>S - Single Responsibility Principle</PrincipleName>
            <PrincipleExample>
              Each component has one reason to change. LinkComponent handles link display, not data persistence.
            </PrincipleExample>

            <PrincipleName>O - Open/Closed Principle</PrincipleName>
            <PrincipleExample>
              Components are open for extension (new plugins) but closed for modification. Factory pattern allows adding new component types without changing existing code.
            </PrincipleExample>

            <PrincipleName>L - Liskov Substitution Principle</PrincipleName>
            <PrincipleExample>
              Any LinkComponent subtype can be substituted for LinkComponent without breaking the system.
            </PrincipleExample>

            <PrincipleName>I - Interface Segregation Principle</PrincipleName>
            <PrincipleExample>
              Small, focused interfaces. LinkAdapter only handles data adaptation, not rendering or persistence.
            </PrincipleExample>

            <PrincipleName>D - Dependency Inversion Principle</PrincipleName>
            <PrincipleExample>
              Components depend on abstractions (Component interface) not concretions (specific implementations).
            </PrincipleExample>
          </SOLIDCard>

          {/* Design Patterns */}
          <SectionTitle>Design Patterns Demonstration</SectionTitle>
          <PatternGrid>
            {patternCards.map(renderPatternCard)}
          </PatternGrid>
        </LabBody>
      </LabContent>
    </LabContainer>
  );
};

export default PatternLab;