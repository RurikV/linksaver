/**
 * Architecture Showcase - Different Architectural Approaches
 *
 * Demonstrates:
 * - Microservices Architecture
 * - Monolithic Architecture
 * - Event-Driven Architecture
 * - Service-Oriented Architecture (SOA)
 * - Layered Architecture
 * - Hexagonal Architecture
 * - Clean Architecture
 * - Domain-Driven Design (DDD)
 * - Serverless Architecture
 * - Plugin Architecture
 */

import { useState, useEffect, useRef } from 'react';
import { toast } from 'react-toastify';
import styled from 'styled-components';

import { useApi } from '../hooks/use-api';
import Header from '../components/header';
import Button from '../components/button';
import Spinner from '../components/spinner';

// ==================== Styled Components ====================

const ShowcaseContainer = styled.div`
  min-height: 100vh;
  background: #f8fafc;
  padding: 20px;
`;

const ShowcaseContent = styled.div`
  max-width: 1600px;
  margin: 0 auto;
  background: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid #e2e8f0;
  overflow: hidden;
`;

const ShowcaseHeader = styled.div`
  background: #1e293b;
  color: white;
  padding: 30px;
  text-align: center;
`;

const ShowcaseTitle = styled.h1`
  font-size: 2.5em;
  margin-bottom: 10px;
  font-weight: 700;
`;

const ShowcaseSubtitle = styled.p`
  font-size: 1.1em;
  opacity: 0.9;
  margin: 0;
`;

const ShowcaseBody = styled.div`
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

const ArchitectureGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(450px, 1fr));
  gap: 25px;
  margin-bottom: 40px;
`;

const ArchitectureCard = styled.div`
  background: white;
  border-radius: 8px;
  padding: 25px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid #e2e8f0;
  transition: all 0.2s ease;
  position: relative;

  &:hover {
    border-color: #64748b;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }
`;

const ArchitectureHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 15px;
`;

const ArchitectureName = styled.h3`
  font-size: 1.4em;
  color: #333;
  margin: 0;
  font-weight: 700;
`;

const ArchitectureType = styled.span`
  padding: 4px 12px;
  border-radius: 16px;
  font-size: 0.8em;
  font-weight: 600;

  ${props => props.$type === 'distributed' && `
    background: #e3f2fd;
    color: #1565c0;
  `}

  ${props => props.$type === 'centralized' && `
    background: #f3e5f5;
    color: #7b1fa2;
  `}

  ${props => props.$type === 'hybrid' && `
    background: #e8f5e8;
    color: #2e7d32;
  `}

  ${props => props.$type === 'modern' && `
    background: #fff3e0;
    color: #ef6c00;
  `}
`;

const ArchitectureDescription = styled.p`
  color: #666;
  line-height: 1.6;
  margin-bottom: 20px;
`;

const CharacteristicList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 15px 0;
`;

const CharacteristicItem = styled.li`
  padding: 8px 12px;
  margin-bottom: 8px;
  background: #f8fafc;
  border-radius: 6px;
  font-size: 0.9em;
  list-style: none;
`;

const ArchitectureActions = styled.div`
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
`;

const ComparisonTable = styled.div`
  overflow-x: auto;
  margin: 20px 0;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 0.9em;
`;

const TableCell = styled.td`
  padding: 12px;
  border: 1px solid #e2e8f0;
  vertical-align: top;

  ${props => props.$header && `
    background: #f8fafc;
    font-weight: 600;
    color: #333;
  `}
`;

const ResultDisplay = styled.div`
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 20px;
  margin-top: 20px;
  max-height: 400px;
  overflow-y: auto;
`;


// ==================== Architecture Implementations ====================

/**
 * Microservices Architecture Implementation
 */
class MicroservicesArchitecture {
  constructor() {
    this.services = new Map();
    this.apiGateway = null;
    this.serviceRegistry = null;
  }

  registerService(name, service) {
    this.services.set(name, {
      name,
      service,
      instances: [],
      loadBalancer: this.createLoadBalancer(),
      healthCheck: this.createHealthCheck()
    });
  }

  createLoadBalancer() {
    return {
      getInstance: (serviceName) => {
        const service = this.services.get(serviceName);
        if (!service) throw new Error(`Service ${serviceName} not found`);

        const instances = service.instances.filter(i => i.status === 'healthy');
        if (instances.length === 0) throw new Error(`No healthy instances for ${serviceName}`);

        return instances[Math.floor(Math.random() * instances.length)];
      }
    };
  }

  createHealthCheck() {
    return {
      check: async () => {
        // Simulate health check
        return { status: 'healthy', latency: Math.random() * 100 };
      }
    };
  }

  async processRequest(serviceName, request) {
    const loadBalancer = this.services.get(serviceName)?.loadBalancer;
    if (!loadBalancer) throw new Error(`Service ${serviceName} not found`);

    const instance = loadBalancer.getInstance(serviceName);
    return await instance.service.process(request);
  }
}

/**
 * Event-Driven Architecture Implementation
 */
class EventDrivenArchitecture {
  constructor() {
    this.eventBus = new Map();
    this.subscribers = new Map();
    this.eventStore = [];
  }

  publish(eventType, data) {
    const event = {
      id: this.generateEventId(),
      type: eventType,
      data,
      timestamp: Date.now(),
      metadata: {}
    };

    this.eventStore.push(event);

    const subscribers = this.subscribers.get(eventType) || [];
    subscribers.forEach(subscriber => {
      try {
        subscriber.handle(event);
      } catch (error) {
        console.error('Subscriber error:', error);
      }
    });

    return event;
  }

  subscribe(eventType, handler) {
    if (!this.subscribers.has(eventType)) {
      this.subscribers.set(eventType, []);
    }
    this.subscribers.get(eventType).push({ handle: handler, id: this.generateSubscriberId() });
  }

  generateEventId() {
    return `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  generateSubscriberId() {
    return `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

/**
 * Service-Oriented Architecture Implementation
 */
class ServiceOrientedArchitecture {
  constructor() {
    this.services = new Map();
    this.serviceRegistry = new Map();
    this.messageBus = new Map();
  }

  registerService(name, contract, implementation) {
    this.services.set(name, {
      name,
      contract,
      implementation,
      endpoints: this.generateEndpoints(contract),
      messages: []
    });
  }

  generateEndpoints(contract) {
    return Object.keys(contract.methods).map(method => ({
      name: method,
      input: contract.methods[method].input,
      output: contract.methods[method].output
    }));
  }

  async callService(serviceName, method, data) {
    const service = this.services.get(serviceName);
    if (!service) throw new Error(`Service ${serviceName} not found`);

    const endpoint = service.endpoints.find(e => e.name === method);
    if (!endpoint) throw new Error(`Method ${method} not found in service ${serviceName}`);

    return await service.implementation[method](data);
  }
}

/**
 * Domain-Driven Design Implementation
 */
class DomainDrivenDesign {
  constructor() {
    this.aggregates = new Map();
    this.repositories = new Map();
    this.domainEvents = [];
    this.valueObjects = new Map();
    this.entities = new Map();
  }

  registerAggregate(name, aggregateRoot) {
    this.aggregates.set(name, {
      root: aggregateRoot,
      entities: new Map(),
      valueObjects: new Map()
    });
  }

  registerRepository(name, repository) {
    this.repositories.set(name, repository);
  }

  publishDomainEvent(event) {
    this.domainEvents.push({
      ...event,
      timestamp: Date.now()
    });
  }

  createValueObject(name, properties) {
    const valueObject = {
      name,
      ...properties,
      equals: (other) => this.compareValueObjects(this, other)
    };
    this.valueObjects.set(name, valueObject);
    return valueObject;
  }

  compareValueObjects(vo1, vo2) {
    return vo1.name === vo2.name && JSON.stringify(vo1) === JSON.stringify(vo2);
  }
}

// ==================== React Component ====================

const ArchitectureShowcase = () => {
  const { getRequest } = useApi();

  // State management
  const [loading, setLoading] = useState(true);
  const [links, setLinks] = useState([]);
  const [demonstrations, setDemonstrations] = useState({});
  const [comparison, setComparison] = useState(null);

  // Architecture instances
  const microservicesRef = useRef(null);
  const eventDrivenRef = useRef(null);
  const soaRef = useRef(null);
  const dddRef = useRef(null);

  // Initialize architectures on mount
  useEffect(() => {
    initializeArchitectures();
    loadLinks();
  }, []);

  const initializeArchitectures = () => {
    microservicesRef.current = new MicroservicesArchitecture();
    eventDrivenRef.current = new EventDrivenArchitecture();
    soaRef.current = new ServiceOrientedArchitecture();
    dddRef.current = new DomainDrivenDesign();
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

  // ==================== Architecture Demonstrations ====================

  const demonstrateMicroservices = async () => {
    try {
      const ms = microservicesRef.current;

      // Register services
      ms.registerService('LinkService', {
        methods: {
          createLink: { input: 'LinkData', output: 'Link' },
          getLink: { input: 'LinkId', output: 'Link' },
          searchLinks: { input: 'SearchQuery', output: 'Links' }
        }
      }, {
        process: async (request) => {
          switch (request.method) {
            case 'createLink':
              return { success: true, linkId: `link_${Date.now()}`, ...request.data };
            case 'getLink':
              return { success: true, data: links.find(l => l.linkId === request.data.linkId) };
            case 'searchLinks':
              return { success: true, data: links.filter(l => l.title.includes(request.data.query)) };
            default:
              throw new Error(`Unknown method: ${request.method}`);
          }
        }
      });

      ms.registerService('TagService', {
        methods: {
          getTags: { input: 'void', output: 'Tags' },
          getLinksByTag: { input: 'TagId', output: 'Links' }
        }
      }, {
        process: async (request) => {
          switch (request.method) {
            case 'getTags': {
              const allTags = new Set();
              links.forEach(link => {
                if (link.tags) {
                  link.tags.forEach(tag => allTags.add(tag.title || tag.name));
                }
              });
              return { success: true, data: Array.from(allTags) };
            }
            default:
              throw new Error(`Unknown method: ${request.method}`);
          }
        }
      });

      // Process requests
      const linkResult = await ms.processRequest('LinkService', {
        method: 'searchLinks',
        data: { query: 'GitHub' }
      });

      const tagResult = await ms.processRequest('TagService', {
        method: 'getTags'
      });

      setDemonstrations(prev => ({
        ...prev,
        microservices: {
          services: ['LinkService', 'TagService'],
          requestResults: [linkResult, tagResult],
          architecture: 'Microservices with Service Registry and API Gateway'
        }
      }));

      toast.success('Microservices architecture demonstrated!');
    } catch {
      toast.error('Microservices demonstration failed');
    }
  };

  const demonstrateEventDriven = async () => {
    try {
      const eda = eventDrivenRef.current;

      // Create event handlers
      const linkHandler = {
        handle: (event) => {
          console.log('Link event:', event);
        }
      };

      const tagHandler = {
        handle: (event) => {
          console.log('Tag event:', event);
        }
      };

      // Subscribe to events
      eda.subscribe('link.created', linkHandler);
      eda.subscribe('link.updated', linkHandler);
      eda.subscribe('link.deleted', linkHandler);
      eda.subscribe('tag.added', tagHandler);
      eda.subscribe('tag.removed', tagHandler);

      // Publish events
      const events = [
        eda.publish('link.created', { linkId: '123', title: 'New Link', url: 'https://example.com' }),
        eda.publish('tag.added', { tagId: 'tag1', name: 'Technology' }),
        eda.publish('link.updated', { linkId: '123', title: 'Updated Link' }),
        eda.publish('tag.removed', { tagId: 'tag1', name: 'Technology' })
      ];

      setDemonstrations(prev => ({
        ...prev,
        eventDriven: {
          subscribers: 2,
          publishedEvents: events,
          eventStore: eda.eventStore,
          architecture: 'Event-Driven with Event Bus and Pub/Sub'
        }
      }));

      toast.success('Event-Driven architecture demonstrated!');
    } catch {
      toast.error('Event-Driven demonstration failed');
    }
  };

  const demonstrateSOA = async () => {
    try {
      const soa = soaRef.current;

      // Register services with contracts
      soa.registerService('LinkManagementService', {
        name: 'Link Management Service',
        version: '1.0.0',
        description: 'Manages link CRUD operations',
        methods: {
          createLink: { input: 'CreateLinkRequest', output: 'CreateLinkResponse' },
          updateLink: { input: 'UpdateLinkRequest', output: 'UpdateLinkResponse' },
          deleteLink: { input: 'DeleteLinkRequest', output: 'DeleteLinkResponse' }
        }
      }, {
        process: async (request) => {
          return {
            success: true,
            service: 'LinkManagementService',
            operation: request.method,
            result: `${request.method} operation completed`,
            timestamp: Date.now()
          };
        }
      });

      soa.registerService('ContentDeliveryService', {
        name: 'Content Delivery Service',
        version: '2.0.0',
        description: 'Handles content delivery and caching',
        methods: {
          deliverContent: { input: 'ContentRequest', output: 'ContentResponse' },
          cacheContent: { input: 'CacheRequest', output: 'CacheResponse' }
        }
      }, {
        process: async (request) => {
          return {
            success: true,
            service: 'ContentDeliveryService',
            operation: request.method,
            result: `${request.method} operation completed`,
            cached: Math.random() > 0.5,
            timestamp: Date.now()
          };
        }
      });

      // Call services
      const linkServiceResult = await soa.callService('LinkManagementService', 'createLink', {
        title: 'SOA Demo Link',
        url: 'https://soa-example.com'
      });

      const contentServiceResult = await soa.callService('ContentDeliveryService', 'deliverContent', {
        contentId: 'content-123',
        type: 'link'
      });

      setDemonstrations(prev => ({
        ...prev,
        soa: {
          services: ['LinkManagementService', 'ContentDeliveryService'],
          serviceCalls: [linkServiceResult, contentServiceResult],
          architecture: 'Service-Oriented Architecture with Service Contracts'
        }
      }));

      toast.success('SOA architecture demonstrated!');
    } catch {
      toast.error('SOA demonstration failed');
    }
  };

  const demonstrateDDD = async () => {
    try {
      const ddd = dddRef.current;

      // Create value objects
      const urlValueObject = ddd.createValueObject('URL', {
        value: 'https://example.com',
        protocol: 'https',
        domain: 'example.com',
        isValid: true
      });

      const tagValueObject = ddd.createValueObject('Tag', {
        name: 'Technology',
        color: '#007bff',
        category: 'General'
      });

      // Create aggregate root
      const linkAggregate = {
        id: 'link-123',
        title: 'DDD Demo Link',
        url: urlValueObject,
        tags: [tagValueObject],
        status: 'active'
      };

      // Register aggregate
      ddd.registerAggregate('LinkAggregate', linkAggregate);

      // Publish domain events
      ddd.publishDomainEvent({
        type: 'LinkCreated',
        aggregateId: linkAggregate.id,
        data: linkAggregate
      });

      ddd.publishDomainEvent({
        type: 'TagAddedToLink',
        aggregateId: linkAggregate.id,
        data: { tagId: tagValueObject.name }
      });

      setDemonstrations(prev => ({
        ...prev,
        ddd: {
          aggregates: ['LinkAggregate'],
          valueObjects: [urlValueObject, tagValueObject],
          domainEvents: ddd.domainEvents,
          architecture: 'Domain-Driven Design with Aggregates and Value Objects'
        }
      }));

      toast.success('DDD architecture demonstrated!');
    } catch {
      toast.error('DDD demonstration failed');
    }
  };

  const compareArchitectures = () => {
    const comparisonData = [
      {
        criteria: 'Scalability',
        microservices: 'High',
        monolithic: 'Low',
        eventDriven: 'High',
        soa: 'Medium',
        ddd: 'Medium'
      },
      {
        criteria: 'Complexity',
        microservices: 'High',
        monolithic: 'Low',
        eventDriven: 'Medium',
        soa: 'Medium',
        ddd: 'High'
      },
      {
        criteria: 'Development Speed',
        microservices: 'Medium',
        monolithic: 'High',
        eventDriven: 'Medium',
        soa: 'Medium',
        ddd: 'Low'
      },
      {
        criteria: 'Deployment',
        microservices: 'Independent',
        monolithic: 'Single',
        eventDriven: 'Independent',
        soa: 'Independent',
        ddd: 'Monolithic'
      },
      {
        criteria: 'Data Consistency',
        microservices: 'Eventual',
        monolithic: 'Strong',
        eventDriven: 'Eventual',
        soa: 'Strong',
        ddd: 'Strong'
      }
    ];

    setComparison(comparisonData);
    toast.success('Architecture comparison generated!');
  };

  // ==================== Architecture Data ====================

  const architectures = [
    {
      name: 'Microservices',
      type: 'distributed',
      description: 'Decompose application into small, independent services that communicate via APIs.',
      characteristics: [
        'Service independence',
        'Independent deployment',
        'Technology diversity',
        'Fault isolation',
        'Scalability per service',
        'API Gateway pattern'
      ],
      actions: [
        { label: 'Demonstrate', onClick: demonstrateMicroservices }
      ]
    },
    {
      name: 'Event-Driven',
      type: 'distributed',
      description: 'Components communicate through events, enabling loose coupling and asynchronous communication.',
      characteristics: [
        'Loose coupling',
        'Asynchronous communication',
        'Event sourcing',
        'CQRS pattern',
        'Scalable messaging',
        'Event replay'
      ],
      actions: [
        { label: 'Demonstrate', onClick: demonstrateEventDriven }
      ]
    },
    {
      name: 'Service-Oriented',
      type: 'hybrid',
      description: 'Architecture based on services that communicate through standardized interfaces.',
      characteristics: [
        'Service contracts',
        'Enterprise Service Bus',
        'Service registry',
        'Loose coupling',
        'Interoperability',
        'Reusability'
      ],
      actions: [
        { label: 'Demonstrate', onClick: demonstrateSOA }
      ]
    },
    {
      name: 'Domain-Driven Design',
      type: 'hybrid',
      description: 'Software design approach focusing on core business logic and domain expertise.',
      characteristics: [
        'Ubiquitous Language',
        'Aggregates',
        'Value Objects',
        'Domain Events',
        'Repositories',
        'Bounded Contexts'
      ],
      actions: [
        { label: 'Demonstrate', onClick: demonstrateDDD }
      ]
    },
    {
      name: 'Monolithic',
      type: 'centralized',
      description: 'Single deployable unit containing all functionality in one codebase.',
      characteristics: [
        'Simple deployment',
        'Shared database',
        'Monorepo',
        'Coupled components',
        'Single technology stack',
        'Easy debugging'
      ],
      actions: [
        { label: 'Demonstrate', onClick: () => toast.info('Monolithic architecture is the traditional approach - your current app uses this!') }
      ]
    },
    {
      name: 'Serverless',
      type: 'modern',
      description: 'Run code without managing servers, using cloud functions and managed services.',
      characteristics: [
        'Function as a Service',
        'Pay per use',
        'Auto-scaling',
        'Event-driven',
        'Stateless functions',
        'Managed services'
      ],
      actions: [
        { label: 'Demonstrate', onClick: () => toast.info('Serverless would involve cloud functions like AWS Lambda or Google Cloud Functions') }
      ]
    }
  ];

  const renderArchitectureCard = (architecture) => {
    const hasDemo = demonstrations[architecture.name.toLowerCase()];

    return (
      <ArchitectureCard key={architecture.name}>
        <ArchitectureHeader>
          <ArchitectureName>{architecture.name}</ArchitectureName>
          <ArchitectureType $type={architecture.type}>{architecture.type}</ArchitectureType>
        </ArchitectureHeader>

        <ArchitectureDescription>{architecture.description}</ArchitectureDescription>

        <CharacteristicList>
          {architecture.characteristics.map((char, index) => (
            <CharacteristicItem key={index}>{char}</CharacteristicItem>
          ))}
        </CharacteristicList>

        <ArchitectureActions>
          {architecture.actions.map((action, index) => (
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
        </ArchitectureActions>

        {hasDemo && (
          <ResultDisplay>
            <h4>Results:</h4>
            <pre style={{ background: '#f8f9fa', padding: '15px', borderRadius: '6px', fontSize: '0.85em', overflow: 'auto' }}>
              {JSON.stringify(hasDemo, null, 2)}
            </pre>
          </ResultDisplay>
        )}
      </ArchitectureCard>
    );
  };

  const renderComparison = () => {
    if (!comparison) return null;

    return (
      <>
        <SectionTitle>Architecture Comparison</SectionTitle>
        <ComparisonTable>
          <Table>
            <thead>
              <tr>
                <TableCell $header>Criteria</TableCell>
                <TableCell $header>Microservices</TableCell>
                <TableCell $header>Monolithic</TableCell>
                <TableCell $header>Event-Driven</TableCell>
                <TableCell $header>SOA</TableCell>
                <TableCell $header>DDD</TableCell>
              </tr>
            </thead>
            <tbody>
              {comparison.map((row, index) => (
                <tr key={index}>
                  <TableCell $header>{row.criteria}</TableCell>
                  <TableCell>{row.microservices}</TableCell>
                  <TableCell>{row.monolithic}</TableCell>
                  <TableCell>{row.eventDriven}</TableCell>
                  <TableCell>{row.soa}</TableCell>
                  <TableCell>{row.ddd}</TableCell>
                </tr>
              ))}
            </tbody>
          </Table>
        </ComparisonTable>
      </>
    );
  };

  if (loading) {
    return (
      <ShowcaseContainer>
        <Header />
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
          <Spinner size="large" />
        </div>
      </ShowcaseContainer>
    );
  }

  return (
    <ShowcaseContainer>
      <Header />
      <ShowcaseContent>
        <ShowcaseHeader>
          <ShowcaseTitle>Architecture Showcase</ShowcaseTitle>
          <ShowcaseSubtitle>
            Different Architectural Approaches with Real Implementations
          </ShowcaseSubtitle>
        </ShowcaseHeader>

        <ShowcaseBody>
          {/* Architecture Cards */}
          <SectionTitle>Architectural Patterns</SectionTitle>
          <ArchitectureGrid>
            {architectures.map(renderArchitectureCard)}
          </ArchitectureGrid>

          {/* Architecture Comparison */}
          <Button
            onClick={compareArchitectures}
            style={{
              background: '#1e293b',
              color: 'white',
              border: 'none',
              padding: '12px 24px',
              fontSize: '1em',
              fontWeight: '600',
              borderRadius: '6px',
              margin: '20px auto',
              display: 'block',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
            }}
          >
            Compare Architectures
          </Button>

          {renderComparison()}
        </ShowcaseBody>
      </ShowcaseContent>
    </ShowcaseContainer>
  );
};

export default ArchitectureShowcase;