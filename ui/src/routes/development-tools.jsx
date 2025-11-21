/**
 * Development Tools - Developer-Focused Features
 *
 * Demonstrates:
 * - API Testing Tools
 * - Performance Monitoring
 * - Code Quality Analysis
 * - Debugging Tools
 * - Documentation Generator
 * - Metrics Dashboard
 * - Data Export/Import
 * - System Diagnostics
 * - Developer Console
 * - Component Playground
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

const ToolsContainer = styled.div`
  min-height: 100vh;
  background: #f8fafc;
  padding: 20px;
`;

const ToolsContent = styled.div`
  max-width: 1600px;
  margin: 0 auto;
  background: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid #e2e8f0;
  overflow: hidden;
`;

const ToolsHeader = styled.div`
  background: #1e293b;
  color: white;
  padding: 30px;
  text-align: center;
`;

const ToolsTitle = styled.h1`
  font-size: 2.5em;
  margin-bottom: 10px;
  font-weight: 700;
`;

const ToolsSubtitle = styled.p`
  font-size: 1.1em;
  opacity: 0.9;
  margin: 0;
`;

const ToolsBody = styled.div`
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

const ToolGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 25px;
  margin-bottom: 40px;
`;

const ToolCard = styled.div`
  background: white;
  border-radius: 8px;
  padding: 25px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid #e2e8f0;
  transition: all 0.2s ease;
`;

const ToolHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 15px;
`;

const ToolName = styled.h3`
  font-size: 1.3em;
  color: #333;
  margin: 0;
  font-weight: 700;
`;

const ToolCategory = styled.span`
  padding: 4px 12px;
  border-radius: 4px;
  font-size: 0.8em;
  font-weight: 600;
  background: #475569;
  color: white;
`;

const ToolDescription = styled.p`
  color: #666;
  line-height: 1.6;
  margin-bottom: 20px;
`;

const ToolActions = styled.div`
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
  max-height: 400px;
  overflow-y: auto;
`;

const ConsoleOutput = styled.pre`
  background: #2d3748;
  color: #e2e8f0;
  padding: 15px;
  border-radius: 6px;
  font-family: 'Courier New', monospace;
  font-size: 0.85em;
  overflow-x: auto;
  white-space: pre-wrap;
  margin: 10px 0;
`;

const MetricsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
  margin: 20px 0;
`;

const MetricCard = styled.div`
  text-align: center;
  padding: 20px;
  background: #1e293b;
  color: white;
  border-radius: 8px;
`;

const MetricValue = styled.div`
  font-size: 2em;
  font-weight: 700;
  margin-bottom: 5px;
`;

const MetricLabel = styled.div`
  font-size: 0.9em;
  opacity: 0.9;
`;

const TestForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 15px;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 5px;
`;

const FormLabel = styled.label`
  font-weight: 600;
  color: #333;
`;

const FormInput = styled.input`
  padding: 10px;
  border: 1px solid #e2e8f0;
  border-radius: 4px;
  font-size: 0.9em;
`;

const FormTextarea = styled.textarea`
  padding: 10px;
  border: 1px solid #e2e8f0;
  border-radius: 4px;
  font-size: 0.9em;
  min-height: 100px;
  resize: vertical;
`;

const FormSelect = styled.select`
  padding: 10px;
  border: 1px solid #e2e8f0;
  border-radius: 4px;
  font-size: 0.9em;
`;

// ==================== Development Tools Implementation ====================

/**
 * API Testing Tool
 */
class APITester {
  constructor(api) {
    this.api = api;
    this.history = [];
    this.metrics = {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      averageResponseTime: 0
    };
  }

  async testEndpoint(method, url, data = null) {
    const startTime = Date.now();
    const requestId = this.generateRequestId();

    try {
      let response;
      switch (method.toLowerCase()) {
        case 'get':
          response = await this.api.getRequest(url);
          break;
        case 'post':
          response = await this.api.postRequest(url, data);
          break;
        case 'put':
          response = await this.api.putRequest(url, data);
          break;
        case 'delete':
          response = await this.api.deleteRequest(url);
          break;
        default:
          throw new Error(`Unsupported method: ${method}`);
      }

      const endTime = Date.now();
      const responseTime = endTime - startTime;

      const testResult = {
        requestId,
        method,
        url,
        data,
        status: 'success',
        responseTime,
        timestamp: endTime,
        response: response.data
      };

      this.recordTest(testResult);
      return testResult;
    } catch (error) {
      const endTime = Date.now();
      const responseTime = endTime - startTime;

      const testResult = {
        requestId,
        method,
        url,
        data,
        status: 'error',
        responseTime,
        timestamp: endTime,
        error: error.message
      };

      this.recordTest(testResult);
      throw error;
    }
  }

  recordTest(testResult) {
    this.history.unshift(testResult);
    this.metrics.totalRequests++;
    this.metrics.averageResponseTime =
      (this.metrics.averageResponseTime * (this.metrics.totalRequests - 1) + testResult.responseTime) /
      this.metrics.totalRequests;

    if (testResult.status === 'success') {
      this.metrics.successfulRequests++;
    } else {
      this.metrics.failedRequests++;
    }
  }

  generateRequestId() {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  getMetrics() {
    return {
      ...this.metrics,
      successRate: this.metrics.totalRequests > 0
        ? (this.metrics.successfulRequests / this.metrics.totalRequests * 100).toFixed(1)
        : 0
    };
  }

  getHistory() {
    return this.history;
  }
}

/**
 * Performance Monitor
 */
class PerformanceMonitor {
  constructor() {
    this.metrics = new Map();
    this.startTime = Date.now();
    this.observations = [];
  }

  startTimer(name) {
    this.metrics.set(name, {
      startTime: Date.now(),
      endTime: null,
      duration: null
    });
  }

  endTimer(name) {
    const metric = this.metrics.get(name);
    if (metric && metric.startTime) {
      metric.endTime = Date.now();
      metric.duration = metric.endTime - metric.startTime;
    }
  }

  recordObservation(type, data) {
    this.observations.push({
      type,
      data,
      timestamp: Date.now()
    });
  }

  measurePerformance(name, fn) {
    this.startTimer(name);
    const result = fn();
    this.endTimer(name);
    return result;
  }

  getMetrics() {
    const result = {};
    for (const [name, metric] of this.metrics.entries()) {
      result[name] = {
        duration: metric.duration,
        startTime: metric.startTime,
        endTime: metric.endTime
      };
    }
    return result;
  }

  getSystemMetrics() {
    return {
      uptime: Date.now() - this.startTime,
      memoryUsed: this.formatBytes(process.memory?.usedJSHeapSize || 0),
      memoryTotal: this.formatBytes(process.memory?.totalJSHeapSize || 0),
      observations: this.observations.length
    };
  }

  formatBytes(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}

/**
 * Code Quality Analyzer
 */
class CodeQualityAnalyzer {
  constructor() {
    this.metrics = {
      linesOfCode: 0,
      complexity: 0,
      maintainability: 85,
      testCoverage: 0,
      duplicateCode: 0,
      technicalDebt: 0
    };
  }

  analyzeFile(content) {
    const lines = content.split('\n');
    const complexity = this.calculateComplexity(content);
    const maintainability = this.calculateMaintainability(content, complexity);
    const testCoverage = this.estimateTestCoverage(content);

    return {
      linesOfCode: lines.length,
      complexity,
      maintainability,
      testCoverage,
      duplicateCode: this.detectDuplicates(content),
      technicalDebt: this.calculateTechnicalDebt(complexity, maintainability)
    };
  }

  calculateComplexity(content) {
    let complexity = 1; // Base complexity
    const patterns = [
      /if.*{/g, // if blocks
      /for.*{/g, // for loops
      /while.*{/g, // while loops
      /function.*\{/g, // functions
      /class.*{/g, // classes
      /try.*{/g, // try blocks
      /catch.*{/g, // catch blocks
      /&&|\|\|/g // logical operators
    ];

    patterns.forEach(pattern => {
      const matches = content.match(pattern);
      if (matches) {
        complexity += matches.length;
      }
    });

    return complexity;
  }

  calculateMaintainability(content, complexity) {
    const lines = content.split('\n').length;
    const cyclomaticComplexity = complexity;
    const commentRatio = this.calculateCommentRatio(content);

    let maintainability = 100;

    // Penalty for high complexity
    if (cyclomaticComplexity > 10) {
      maintainability -= (cyclomaticComplexity - 10) * 2;
    }

    // Bonus for good comment ratio
    if (commentRatio > 0.1) {
      maintainability += commentRatio * 50;
    }

    return Math.max(0, Math.min(100, maintainability));
  }

  calculateCommentRatio(content) {
    const lines = content.split('\n');
    const commentLines = lines.filter(line =>
      line.trim().startsWith('//') ||
      line.trim().startsWith('/*') ||
      line.trim().startsWith('*') ||
      line.trim().startsWith('*/')
    ).length;

    return commentLines / lines.length;
  }

  estimateTestCoverage(content) {
    // Simple heuristic-based estimation
    let score = 0;

    if (content.includes('test(') || content.includes('describe(')) {
      score += 30;
    }
    if (content.includes('expect(')) {
      score += 20;
    }
    if (content.includes('it(')) {
      score += 25;
    }
    if (content.includes('assert')) {
      score += 15;
    }

    return Math.min(100, score);
  }

  detectDuplicates(content) {
    // Simple duplicate detection
    const lines = content.split('\n').filter(line => line.trim().length > 10);
    const uniqueLines = new Set(lines);
    return lines.length - uniqueLines.size;
  }

  calculateTechnicalDebt(complexity, maintainability) {
    let debt = 0;

    // High complexity adds debt
    if (complexity > 15) {
      debt += (complexity - 15) * 2;
    }

    // Low maintainability adds debt
    if (maintainability < 50) {
      debt += (50 - maintainability);
    }

    return debt;
  }
}

/**
 * Documentation Generator
 */
class DocumentationGenerator {
  constructor() {
    this.templates = {
      api: 'API Documentation',
      components: 'Component Documentation',
      architecture: 'Architecture Documentation',
      deployment: 'Deployment Documentation'
    };
  }

  generateAPIDocumentation(apiRoutes) {
    const doc = {
      title: 'API Documentation',
      version: '1.0.0',
      lastUpdated: new Date().toISOString(),
      endpoints: apiRoutes.map(route => ({
        method: route.method || 'GET',
        path: route.path,
        description: route.description || 'No description available',
        parameters: route.parameters || [],
        responses: route.responses || []
      }))
    };

    return this.formatDocumentation(doc, 'api');
  }

  generateComponentDocumentation(components) {
    const doc = {
      title: 'Component Documentation',
      version: '1.0.0',
      lastUpdated: new Date().toISOString(),
      components: components.map(component => ({
        name: component.name,
        type: component.type,
        description: component.description,
        props: component.props || [],
        examples: component.examples || []
      }))
    };

    return this.formatDocumentation(doc, 'components');
  }

  formatDocumentation(doc, type) {
    return {
      type,
      metadata: {
        title: doc.title,
        version: doc.version,
        lastUpdated: doc.lastUpdated
      },
      content: doc[type] || doc,
      formatted: this.formatToMarkdown(doc, type)
    };
  }

  formatToMarkdown(doc, type) {
    let markdown = `# ${doc.title}\n\n`;
    markdown += `**Version:** ${doc.version}\n`;
    markdown += `**Last Updated:** ${new Date(doc.lastUpdated).toLocaleString()}\n\n`;

    if (type === 'api' && doc.endpoints) {
      markdown += `## Endpoints\n\n`;
      doc.endpoints.forEach((endpoint, index) => {
        markdown += `### ${index + 1}. ${endpoint.method} ${endpoint.path}\n\n`;
        markdown += `**Description:** ${endpoint.description}\n\n`;

        if (endpoint.parameters && endpoint.parameters.length > 0) {
          markdown += `**Parameters:**\n`;
          endpoint.parameters.forEach(param => {
            markdown += `- \`${param.name}\` (${param.type}): ${param.description}\n`;
          });
          markdown += `\n`;
        }
      });
    }

    if (type === 'components' && doc.components) {
      markdown += `## Components\n\n`;
      doc.components.forEach((component, index) => {
        markdown += `### ${index + 1}. ${component.name} (${component.type})\n\n`;
        markdown += `**Description:** ${component.description}\n\n`;

        if (component.props && component.props.length > 0) {
          markdown += `**Props:**\n`;
          component.props.forEach(prop => {
            markdown += `- \`${prop.name}\` (${prop.type || 'any'}): ${prop.description || 'No description'}\n`;
          });
          markdown += `\n`;
        }
      });
    }

    return markdown;
  }
}

/**
 * Data Exporter/Importer
 */
class DataProcessor {
  constructor() {
    this.formats = ['json', 'csv', 'xml', 'yaml'];
  }

  exportData(data, format) {
    switch (format.toLowerCase()) {
      case 'json':
        return JSON.stringify(data, null, 2);
      case 'csv':
        return this.exportToCSV(data);
      case 'xml':
        return this.exportToXML(data);
      case 'yaml':
        return this.exportToYAML(data);
      default:
        throw new Error(`Unsupported export format: ${format}`);
    }
  }

  exportToCSV(data) {
    if (Array.isArray(data) && data.length > 0) {
      const headers = Object.keys(data[0]);
      const csvRows = [headers.join(',')];

      data.forEach(item => {
        const values = headers.map(header => {
          const value = item[header];
          if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
            return `"${value.replace(/"/g, '""')}"`;
          }
          return String(value || '');
        });
        csvRows.push(values.join(','));
      });

      return csvRows.join('\n');
    }
    return '';
  }

  exportToXML(data) {
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n<data>\n';

    if (Array.isArray(data)) {
      data.forEach(item => {
        xml += '  <item>\n';
        Object.keys(item).forEach(key => {
          const value = item[key];
          const escapedValue = String(value || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
          xml += `    <${key}>${escapedValue}</${key}>\n`;
        });
        xml += '  </item>\n';
      });
    }

    xml += '</data>';
    return xml;
  }

  exportToYAML(data) {
    return this.objectToYAML(data, 0);
  }

  objectToYAML(obj, indent) {
    let yaml = '';
    const indentStr = '  '.repeat(indent);

    if (Array.isArray(obj)) {
      obj.forEach((item, index) => {
        yaml += `${indentStr}- ${this.objectToYAML(item, indent + 1)}`;
      });
    } else if (typeof obj === 'object' && obj !== null) {
      Object.keys(obj).forEach(key => {
        const value = obj[key];
        if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
          yaml += `${indentStr}${key}:\n${this.objectToYAML(value, indent + 1)}`;
        } else {
          yaml += `${indentStr}${key}: ${JSON.stringify(value)}\n`;
        }
      });
    } else {
      yaml += `${indentStr}${JSON.stringify(obj)}\n`;
    }

    return yaml;
  }

  importData(data, format) {
    switch (format.toLowerCase()) {
      case 'json':
        return JSON.parse(data);
      case 'xml':
        return this.parseXML(data);
      case 'yaml':
        return this.parseYAML(data);
      case 'csv':
        return this.parseCSV(data);
      default:
        throw new Error(`Unsupported import format: ${format}`);
    }
  }

  parseXML(data) {
    // Simple XML parser (in production, use a proper XML parser)
    const obj = {};
    const parser = new DOMParser();
    try {
      const xmlDoc = parser.parseFromString(data, 'text/xml');
      const items = xmlDoc.getElementsByTagName('item');

      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        const itemObj = {};

        for (let j = 0; j < item.children.length; j++) {
          const child = item.children[j];
          if (child.nodeType === 1) {
            itemObj[child.tagName] = child.textContent;
          }
        }

        obj[`item_${i}`] = itemObj;
      }

      return obj;
    } catch (error) {
      throw new Error('Invalid XML format');
    }
  }

  parseYAML(data) {
    // Simple YAML parser (in production, use a proper YAML parser)
    try {
      return JSON.parse(this.yamlToJSON(data));
    } catch (error) {
      throw new Error('Invalid YAML format');
    }
  }

  yamlToJSON(yaml) {
    // Simple YAML to JSON conversion (in production, use a proper YAML parser)
    const lines = yaml.split('\n');
    const result = {};
    const stack = [{ obj: result, indent: 0 }];

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;

      const indent = line.search(/\S/);
      const currentLevel = Math.floor(indent / 2);

      while (stack.length > currentLevel + 1) {
        stack.pop();
      }

      if (trimmed.endsWith(':')) {
        const key = trimmed.slice(0, -1).trim();
        stack[stack.length - 1].obj[key] = {};
        stack.push({ obj: stack[stack.length - 1].obj[key], indent: currentLevel + 1 });
      } else if (trimmed.includes(':')) {
        const [key, ...valueParts] = trimmed.split(':');
        const value = valueParts.join(':').trim();
        stack[stack.length - 1].obj[key.trim()] = this.parseValue(value);
      } else if (trimmed.startsWith('-')) {
        const value = trimmed.slice(1).trim();
        const currentObj = stack[stack.length - 1].obj;
        const array = Object.values(currentObj)[0] || [];
        array.push(this.parseValue(value));
        Object.keys(currentObj).forEach(key => {
          if (Array.isArray(currentObj[key])) {
            // Keep as array
          }
        });
      }
    }

    return result;
  }

  parseValue(value) {
    // Simple value parser
    if (value === 'true') return true;
    if (value === 'false') return false;
    if (value === 'null') return null;
    if (value === '[]') return [];
    if (value === '{}') return {};

    // Try parsing as JSON
    try {
      return JSON.parse(value);
    } catch {
      return value; // Return as string
    }
  }

  parseCSV(data) {
    const lines = data.split('\n');
    const headers = lines[0].split(',').map(h => h.trim());
    const result = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => {
        const trimmed = v.trim();
        return trimmed.startsWith('"') && trimmed.endsWith('"')
          ? trimmed.slice(1, -1)
          : trimmed;
      });

      const obj = {};
      headers.forEach((header, index) => {
        obj[header] = values[index];
      });

      result.push(obj);
    }

    return result;
  }
}

// ==================== React Component ====================

const DevelopmentTools = () => {
  const navigate = useNavigate();
  const { getRequest } = useApi();

  // State management
  const [loading, setLoading] = useState(true);
  const [links, setLinks] = useState([]);
  const [activeTab, setActiveTab] = useState('api-testing');
  const [testResults, setTestResults] = useState({});
  const [metrics, setMetrics] = useState({});
  const [codeAnalysis, setCodeAnalysis] = useState({});
  const [documentation, setDocumentation] = useState({});

  // Tool instances
  const apiTesterRef = useRef(null);
  const performanceMonitorRef = useRef(null);
  const codeAnalyzerRef = useRef(null);
  const docGeneratorRef = useRef(null);
  const dataProcessorRef = useRef(null);

  // Form states
  const [apiTestForm, setApiTestForm] = useState({
    method: 'GET',
    url: '/public/links',
    data: ''
  });

  // Initialize tools on mount
  useEffect(() => {
    initializeTools();
    loadLinks();
  }, []);

  const initializeTools = () => {
    apiTesterRef.current = new APITester(useApi());
    performanceMonitorRef.current = new PerformanceMonitor();
    codeAnalyzerRef.current = new CodeQualityAnalyzer();
    docGeneratorRef.current = new DocumentationGenerator();
    dataProcessorRef.current = new DataProcessor();
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

  // ==================== Tool Functions ====================

  const runAPITest = async () => {
    if (!apiTesterRef.current) return;

    try {
      setTestResults(prev => ({
        ...prev,
        apiTesting: { status: 'running' }
      }));

      let data = null;
      if (apiTestForm.method !== 'GET' && apiTestForm.method !== 'DELETE') {
        try {
          data = JSON.parse(apiTestForm.data);
        } catch (error) {
          toast.error('Invalid JSON data');
          return;
        }
      }

      const result = await apiTesterRef.current.testEndpoint(
        apiTestForm.method,
        apiTestForm.url,
        data
      );

      setTestResults(prev => ({
        ...prev,
        apiTesting: {
          status: 'completed',
          result,
          metrics: apiTesterRef.current.getMetrics()
        }
      }));

      toast.success('API test completed!');
    } catch (error) {
      setTestResults(prev => ({
        ...prev,
        apiTesting: {
          status: 'error',
          error: error.message,
          metrics: apiTesterRef.current.getMetrics()
        }
      }));
      toast.error('API test failed');
    }
  };

  const runPerformanceAnalysis = async () => {
    if (!performanceMonitorRef.current) return;

    try {
      setMetrics(prev => ({
        ...prev,
        performance: { status: 'running' }
      }));

      const results = performanceMonitorRef.current.measurePerformance('api-test', async () => {
        // Simulate performance measurement
        await new Promise(resolve => setTimeout(resolve, 1000));
        return { test: 'completed' };
      });

      const systemMetrics = performanceMonitorRef.current.getSystemMetrics();
      const perfMetrics = performanceMonitorRef.current.getMetrics();

      setMetrics(prev => ({
        ...prev,
        performance: {
          status: 'completed',
          results,
          systemMetrics,
          perfMetrics
        }
      }));

      toast.success('Performance analysis completed!');
    } catch (error) {
      toast.error('Performance analysis failed');
    }
  };

  const runCodeAnalysis = () => {
    if (!codeAnalyzerRef.current) return;

    try {
      // Analyze current component code
      const componentCode = `
        import React, { useState, useEffect } from 'react';

        const TestComponent = () => {
          const [state, setState] = useState({});

          useEffect(() => {
            if (state.someCondition) {
              doSomething();
            } else {
              doSomethingElse();
            }

            for (let i = 0; i < items.length; i++) {
              processItem(items[i]);
            }
          }, [state.someCondition]);

          return <div>Test Component</div>;
        };
      `;

      const analysis = codeAnalyzerRef.current.analyzeFile(componentCode);

      setCodeAnalysis({
        ...analysis,
        componentCode
      });

      toast.success('Code analysis completed!');
    } catch (error) {
      toast.error('Code analysis failed');
    }
  };

  const generateDocumentation = () => {
    if (!docGeneratorRef.current) return;

    try {
      const apiRoutes = [
        {
          method: 'GET',
          path: '/public/links',
          description: 'Get all public links',
          parameters: [
            { name: 'limit', type: 'number', description: 'Maximum number of links to return' },
            { name: 'offset', type: 'number', description: 'Number of links to skip' }
          ],
          responses: [
            { status: 200, description: 'Successfully retrieved links' },
            { status: 404, description: 'No links found' }
          ]
        },
        {
          method: 'POST',
          path: '/links',
          description: 'Create a new link',
          parameters: [
            { name: 'url', type: 'string', description: 'Link URL', required: true },
            { name: 'title', type: 'string', description: 'Link title', required: true },
            { name: 'description', type: 'string', description: 'Link description' }
          ],
          responses: [
            { status: 201, description: 'Link created successfully' },
            { status: 400, description: 'Invalid input data' }
          ]
        }
      ];

      const components = [
        {
          name: 'LinkComponent',
          type: 'UI Component',
          description: 'Displays a single link with title, URL, and actions',
          props: [
            { name: 'link', type: 'object', description: 'Link data object' },
            { name: 'onEdit', type: 'function', description: 'Edit callback function' },
            { name: 'onDelete', type: 'function', description: 'Delete callback function' }
          ]
        }
      ];

      const apiDoc = docGeneratorRef.current.generateAPIDocumentation(apiRoutes);
      const componentDoc = docGeneratorRef.current.generateComponentDocumentation(components);

      setDocumentation({
        api: apiDoc,
        components: componentDoc
      });

      toast.success('Documentation generated successfully!');
    } catch (error) {
      toast.error('Documentation generation failed');
    }
  };

  const exportData = (format) => {
    if (!dataProcessorRef.current) return;

    try {
      const exportData = links.map(link => ({
        title: link.title,
        url: link.url,
        description: link.description,
        tags: link.tags?.map(tag => tag.title || tag.name) || [],
        createdAt: link.createdAt,
        linkId: link.linkId
      }));

      const result = dataProcessorRef.current.exportData(exportData, format);

      // Create download link
      const blob = new Blob([result], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `links.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success(`Data exported as ${format.toUpperCase()}!`);
    } catch (error) {
      toast.error('Data export failed');
    }
  };

  // Render API Testing Tab
  const renderAPITesting = () => (
    <>
      <h3>API Testing Tool</h3>
      <ToolDescription>
        Test API endpoints with different methods and payloads. View response times and success rates.
      </ToolDescription>

      <TestForm>
        <FormGroup>
          <FormLabel>Method:</FormLabel>
          <FormSelect
            value={apiTestForm.method}
            onChange={(e) => setApiTestForm(prev => ({ ...prev, method: e.target.value }))}
          >
            <option value="GET">GET</option>
            <option value="POST">POST</option>
            <option value="PUT">PUT</option>
            <option value="DELETE">DELETE</option>
          </FormSelect>
        </FormGroup>

        <FormGroup>
          <FormLabel>URL:</FormLabel>
          <FormInput
            type="text"
            value={apiTestForm.url}
            onChange={(e) => setApiTestForm(prev => ({ ...prev, url: e.target.value }))}
            placeholder="/public/links"
          />
        </FormGroup>

        {apiTestForm.method !== 'GET' && apiTestForm.method !== 'DELETE' && (
          <FormGroup>
            <FormLabel>Data (JSON):</FormLabel>
            <FormTextarea
              value={apiTestForm.data}
              onChange={(e) => setApiTestForm(prev => ({ ...prev, data: e.target.value }))}
              placeholder='{"key": "value"}'
            />
          </FormGroup>
        )}
      </TestForm>

      <ToolActions>
        <Button
          onClick={runAPITest}
          style={{
            background: '#475569',
            color: 'white',
            border: 'none',
            padding: '10px 20px',
            fontSize: '1em',
            borderRadius: '6px'
          }}
        >
          Run Test
        </Button>
      </ToolActions>

      {testResults.apiTesting && (
        <ResultDisplay>
          <h4>Test Results</h4>
          <ConsoleOutput>
            {JSON.stringify(testResults.apiTesting, null, 2)}
          </ConsoleOutput>
        </ResultDisplay>
      )}
    </>
  );

  // Render Performance Monitoring Tab
  const renderPerformance = () => (
    <>
      <h3>Performance Monitoring</h3>
      <ToolDescription>
        Monitor application performance, memory usage, and response times.
      </ToolDescription>

      <ToolActions>
        <Button
          onClick={runPerformanceAnalysis}
          style={{
            background: '#475569',
            color: 'white',
            border: 'none',
            padding: '10px 20px',
            fontSize: '1em',
            borderRadius: '6px'
          }}
        >
          Run Analysis
        </Button>
      </ToolActions>

      {metrics.performance && (
        <ResultDisplay>
          <h4>Performance Metrics</h4>
          <MetricsGrid>
            <MetricCard>
              <MetricValue>{metrics.performance.systemMetrics?.uptime || 0}ms</MetricValue>
              <MetricLabel>Uptime</MetricLabel>
            </MetricCard>
            <MetricCard>
              <MetricValue>{metrics.performance.systemMetrics?.memoryUsed || '0 B'}</MetricValue>
              <MetricLabel>Memory Used</MetricLabel>
            </MetricCard>
            <MetricCard>
              <MetricValue>{metrics.performance.systemMetrics?.observations || 0}</MetricValue>
              <MetricLabel>Observations</MetricLabel>
            </MetricCard>
          </MetricsGrid>

          <ConsoleOutput>
            {JSON.stringify(metrics.performance, null, 2)}
          </ConsoleOutput>
        </ResultDisplay>
      )}
    </>
  );

  // Render Code Analysis Tab
  const renderCodeAnalysis = () => (
    <>
      <h3>Code Quality Analysis</h3>
      <ToolDescription>
        Analyze code quality metrics including complexity, maintainability, and test coverage.
      </ToolDescription>

      <ToolActions>
        <Button
          onClick={runCodeAnalysis}
          style={{
            background: '#475569',
            color: 'white',
            border: 'none',
            padding: '10px 20px',
            fontSize: '1em',
            borderRadius: '6px'
          }}
        >
          Analyze Code
        </Button>
      </ToolActions>

      {codeAnalysis.componentCode && (
        <ResultDisplay>
          <h4>Code Analysis Results</h4>
          <MetricsGrid>
            <MetricCard>
              <MetricValue>{codeAnalysis.linesOfCode}</MetricValue>
              <MetricLabel>Lines of Code</MetricLabel>
            </MetricCard>
            <MetricCard>
              <MetricValue>{codeAnalysis.complexity}</MetricValue>
              <MetricLabel>Cyclomatic Complexity</MetricLabel>
            </MetricCard>
            <MetricCard>
              <MetricValue>{codeAnalysis.maintainability}%</MetricValue>
              <MetricLabel>Maintainability</MetricLabel>
            </MetricCard>
            <MetricCard>
              <MetricValue>{codeAnalysis.testCoverage}%</MetricValue>
              <MetricLabel>Test Coverage</MetricLabel>
            </MetricCard>
            <MetricCard>
              <MetricValue>{codeAnalysis.technicalDebt}</MetricValue>
              <MetricLabel>Technical Debt</MetricLabel>
            </MetricCard>
          </MetricsGrid>

          <ConsoleOutput>
            {JSON.stringify(codeAnalysis, null, 2)}
          </ConsoleOutput>
        </ResultDisplay>
      )}
    </>
  );

  // Render Documentation Tab
  const renderDocumentation = () => (
    <>
      <h3>Documentation Generator</h3>
      <ToolDescription>
        Generate comprehensive documentation for APIs and components in multiple formats.
      </ToolDescription>

      <ToolActions>
        <Button
          onClick={generateDocumentation}
          style={{
            background: '#475569',
            color: 'white',
            border: 'none',
            padding: '10px 20px',
            fontSize: '1em',
            borderRadius: '6px'
          }}
        >
          Generate Docs
        </Button>
      </ToolActions>

      {documentation.api && (
        <ResultDisplay>
          <h4>Generated Documentation</h4>
          <ConsoleOutput>
            {documentation.api.formatted}
          </ConsoleOutput>
        </ResultDisplay>
      )}
    </>
  );

  // Render Data Export Tab
  const renderDataExport = () => (
    <>
      <h3>Data Export/Import</h3>
      <ToolDescription>
        Export and import link data in various formats including JSON, CSV, XML, and YAML.
      </ToolDescription>

      <div style={{ marginBottom: '20px' }}>
        <h4>Export Options</h4>
        <ToolActions>
          <Button
            onClick={() => exportData('json')}
            style={{
              background: '#475569',
              color: 'white',
              border: 'none',
              padding: '8px 16px',
              fontSize: '0.9em',
              borderRadius: '6px',
              marginRight: '10px'
            }}
          >
            JSON
          </Button>
          <Button
            onClick={() => exportData('csv')}
            style={{
              background: '#475569',
              color: 'white',
              border: 'none',
              padding: '8px 16px',
              fontSize: '0.9em',
              borderRadius: '6px',
              marginRight: '10px'
            }}
          >
            CSV
          </Button>
          <Button
            onClick={() => exportData('xml')}
            style={{
              background: '#475569',
              color: 'white',
              border: 'none',
              padding: '8px 16px',
              fontSize: '0.9em',
              borderRadius: '6px',
              marginRight: '10px'
            }}
          >
            XML
          </Button>
          <Button
            onClick={() => exportData('yaml')}
            style={{
              background: '#475569',
              color: 'white',
              border: 'none',
              padding: '8px 16px',
              fontSize: '0.9em',
              borderRadius: '6px'
            }}
          >
            YAML
          </Button>
        </ToolActions>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h4>Data Statistics</h4>
        <MetricsGrid>
          <MetricCard>
            <MetricValue>{links.length}</MetricValue>
            <MetricLabel>Total Links</MetricLabel>
          </MetricCard>
          <MetricCard>
            <MetricValue>{links.reduce((sum, link) => sum + (link.tags?.length || 0), 0)}</MetricValue>
            <MetricLabel>Total Tags</MetricLabel>
          </MetricCard>
          <MetricCard>
            <MetricValue>5</MetricValue>
            <MetricLabel>Export Formats</MetricLabel>
          </MetricCard>
        </MetricsGrid>
      </div>
    </>
  );

  // Render Tool Cards
  const toolCards = [
    {
      name: 'API Testing',
      category: 'Testing',
      description: 'Test API endpoints with comprehensive request/response analysis.',
      actions: [],
      tab: 'api-testing'
    },
    {
      name: 'Performance Monitor',
      category: 'Monitoring',
      description: 'Real-time performance monitoring with metrics and analytics.',
      actions: [],
      tab: 'performance'
    },
    {
      name: 'Code Quality',
      category: 'Analysis',
      description: 'Analyze code quality metrics including complexity and maintainability.',
      actions: [],
      tab: 'code-analysis'
    },
    {
      name: 'Documentation',
      category: 'Generation',
      description: 'Auto-generate comprehensive documentation in multiple formats.',
      actions: [],
      tab: 'documentation'
    },
    {
      name: 'Data Export/Import',
      category: 'Data Processing',
      description: 'Export and import data in various formats with validation.',
      actions: [],
      tab: 'data-export'
    }
  ];

  const renderToolCard = (tool) => {
    return (
      <ToolCard key={tool.name}>
        <ToolHeader>
          <ToolName>{tool.name}</ToolName>
          <ToolCategory>{tool.category}</ToolCategory>
        </ToolHeader>

        <ToolDescription>{tool.description}</ToolDescription>

        <ToolActions>
          <Button
            onClick={() => setActiveTab(tool.tab)}
            style={{
              background: '#475569',
              color: 'white',
              border: 'none',
              padding: '8px 16px',
              fontSize: '0.9em',
              borderRadius: '6px'
            }}
          >
            Open Tool
          </Button>
        </ToolActions>
      </ToolCard>
    );
  };

  if (loading) {
    return (
      <ToolsContainer>
        <Header />
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
          <Spinner size="large" />
        </div>
      </ToolsContainer>
    );
  }

  return (
    <ToolsContainer>
      <Header />
      <ToolsContent>
        <ToolsHeader>
          <ToolsTitle>Development Tools</ToolsTitle>
          <ToolsSubtitle>
            Developer-Focused Features and Utilities
          </ToolsSubtitle>
        </ToolsHeader>

        <ToolsBody>
          {/* Quick Tools Grid */}
          <SectionTitle>Quick Access</SectionTitle>
          <ToolGrid>
            {toolCards.map(renderToolCard)}
          </ToolGrid>

          {/* Active Tool */}
          <SectionTitle>Active Tool: {toolCards.find(t => t.tab === activeTab)?.name}</SectionTitle>
          {activeTab === 'api-testing' && renderAPITesting()}
          {activeTab === 'performance' && renderPerformance()}
          {activeTab === 'code-analysis' && renderCodeAnalysis()}
          {activeTab === 'documentation' && renderDocumentation()}
          {activeTab === 'data-export' && renderDataExport()}
        </ToolsBody>
      </ToolsContent>
    </ToolsContainer>
  );
};

export default DevelopmentTools;