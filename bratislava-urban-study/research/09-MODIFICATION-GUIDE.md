# Modification Guide - Deep Research System

## 🎯 Overview

This guide helps you customize and extend the Deep Research & Content Creation system to fit your specific needs. Whether you're adding new research domains, custom agents, or specialized content generators, this guide covers common modification patterns.

## 📚 Table of Contents

1. [Adding Custom Research Agents](#adding-custom-research-agents)
2. [Integrating New Data Sources](#integrating-new-data-sources)
3. [Customizing Knowledge Graph](#customizing-knowledge-graph)
4. [Building Custom Content Generators](#building-custom-content-generators)
5. [Extending Swarm Coordination](#extending-swarm-coordination)
6. [Adding New Research Domains](#adding-new-research-domains)
7. [Customizing Quality Metrics](#customizing-quality-metrics)
8. [Performance Optimization](#performance-optimization)

## 1. Adding Custom Research Agents

### Creating a New Agent Type

**File**: `src/agents/custom/MyCustomAgent.ts`

```typescript
import { AgentDB, ReflexionMemory } from 'agentdb';
import * as reasoningbank from 'agentic-flow/reasoningbank';

export interface CustomAgentConfig {
  db: AgentDB;
  specialization: string;
  capabilities: string[];
}

export class MyCustomAgent {
  private id: string;
  private db: AgentDB;
  private reflexion: ReflexionMemory;
  private specialization: string;

  constructor(config: CustomAgentConfig) {
    this.id = `custom-${config.specialization}-${Date.now()}`;
    this.db = config.db;
    this.specialization = config.specialization;

    // Initialize reflexion memory for learning
    this.reflexion = new ReflexionMemory(this.db, {
      sessionId: this.id,
      enableSelfCritique: true
    });
  }

  async execute(task: CustomTask): Promise<CustomResult> {
    console.log(`🔧 [${this.id}] Executing custom task: ${task.type}`);

    try {
      // 1. Your custom logic here
      const result = await this.performCustomTask(task);

      // 2. Store successful pattern in ReasoningBank
      await reasoningbank.storeTrajectory({
        task: `custom-${task.type}`,
        approach: this.describeApproach(task),
        outcome: {
          success: true,
          quality: result.quality
        },
        context: {
          specialization: this.specialization,
          taskType: task.type
        }
      });

      // 3. Learn from execution
      await this.reflexion.store({
        taskType: `custom-${task.type}`,
        approach: this.describeApproach(task),
        outcome: { success: true, quality: result.quality },
        selfCritique: await this.generateCritique(result)
      });

      return result;

    } catch (error) {
      // Learn from failures
      await this.reflexion.store({
        taskType: `custom-${task.type}`,
        approach: this.describeApproach(task),
        outcome: { success: false, error: error.message },
        selfCritique: await this.analyzeFailure(error)
      });

      throw error;
    }
  }

  private async performCustomTask(task: CustomTask): Promise<CustomResult> {
    // Implement your custom research logic
    // Examples:
    // - Specialized data extraction
    // - Domain-specific analysis
    // - Custom synthesis algorithms
    // - Unique verification methods

    return {
      data: {}, // Your custom data
      quality: 0.85,
      metadata: {}
    };
  }

  private async generateCritique(result: CustomResult): Promise<string> {
    // Implement self-critique logic
    // Analyze what worked well and what could be improved
    return `Quality: ${result.quality}. Areas for improvement: ...`;
  }
}
```

### Registering Your Custom Agent

**File**: `src/core/ResearchCoordinator.ts`

```typescript
import { MyCustomAgent } from './agents/custom/MyCustomAgent';

export class ResearchCoordinator {
  // Add to agent factory
  private createAgent(type: string, config: AgentConfig): ResearchAgent {
    switch (type) {
      case 'search':
        return new SearchAgent(config);
      case 'analysis':
        return new AnalysisAgent(config);
      case 'my-custom':
        return new MyCustomAgent(config);
      // ... other agents
      default:
        throw new Error(`Unknown agent type: ${type}`);
    }
  }
}
```

## 2. Integrating New Data Sources

### Creating a Source Connector

**File**: `src/sources/connectors/CustomSourceConnector.ts`

```typescript
export interface SourceConnector {
  name: string;
  search(query: SearchQuery): Promise<Paper[]>;
  fetch(id: string): Promise<Paper>;
  validateCredentials?(): Promise<boolean>;
}

export class CustomSourceConnector implements SourceConnector {
  name = 'CustomSource';
  private apiKey: string;
  private baseUrl: string;

  constructor(config: { apiKey: string; baseUrl: string }) {
    this.apiKey = config.apiKey;
    this.baseUrl = config.baseUrl;
  }

  async search(query: SearchQuery): Promise<Paper[]> {
    // 1. Transform query to source-specific format
    const sourceQuery = this.transformQuery(query);

    // 2. Make API request
    const response = await fetch(`${this.baseUrl}/search`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(sourceQuery)
    });

    if (!response.ok) {
      throw new Error(`Search failed: ${response.statusText}`);
    }

    const data = await response.json();

    // 3. Transform results to standard Paper format
    const papers = data.results.map(this.transformPaper);

    return papers;
  }

  async fetch(id: string): Promise<Paper> {
    // Implement fetching full paper details
    const response = await fetch(`${this.baseUrl}/papers/${id}`, {
      headers: {
        'Authorization': `Bearer ${this.apiKey}`
      }
    });

    if (!response.ok) {
      throw new Error(`Fetch failed: ${response.statusText}`);
    }

    const data = await response.json();
    return this.transformPaper(data);
  }

  private transformQuery(query: SearchQuery): any {
    // Transform to source-specific format
    return {
      q: query.query,
      max_results: query.maxResults,
      fields: query.fields || ['title', 'abstract', 'authors']
    };
  }

  private transformPaper(rawPaper: any): Paper {
    // Transform to standard Paper format
    return {
      id: rawPaper.id,
      title: rawPaper.title,
      authors: rawPaper.authors || [],
      abstract: rawPaper.abstract || '',
      year: rawPaper.year,
      citations: rawPaper.citation_count || 0,
      doi: rawPaper.doi,
      url: rawPaper.url,
      source: this.name
    };
  }
}
```

### Registering the New Source

**File**: `src/config/sources.ts`

```typescript
import { CustomSourceConnector } from '../sources/connectors/CustomSourceConnector';

export const registerSources = (config: SourceConfig): SourceConnector[] => {
  const sources: SourceConnector[] = [
    new ArXivConnector(),
    new GoogleScholarConnector(),
    new PubMedConnector()
  ];

  // Add custom source
  if (config.customSource) {
    sources.push(
      new CustomSourceConnector({
        apiKey: config.customSource.apiKey,
        baseUrl: config.customSource.baseUrl
      })
    );
  }

  return sources;
};
```

## 3. Customizing Knowledge Graph

### Adding Custom Node Types

**File**: `src/knowledge/CustomKnowledgeGraph.ts`

```typescript
import { KnowledgeGraph } from './KnowledgeGraph';

export class CustomKnowledgeGraph extends KnowledgeGraph {
  async addCustomNode(config: CustomNodeConfig): Promise<Node> {
    // Add custom node type
    const node = await this.addNode({
      type: config.customType,
      label: config.label,
      properties: {
        ...config.properties,
        customField: config.customField,
        metadata: config.metadata
      },
      confidence: config.confidence
    });

    // Add custom indexing
    await this.addCustomIndex(node);

    return node;
  }

  async findByCustomCriteria(criteria: CustomCriteria): Promise<Node[]> {
    // Implement custom search logic
    const nodes = await this.db.query({
      collection: 'knowledge_nodes',
      filter: {
        type: criteria.type,
        'properties.customField': criteria.value
      }
    });

    return nodes;
  }

  protected async analyzeCustomRelationships(
    nodes: Node[]
  ): Promise<Edge[]> {
    // Implement custom relationship detection
    const edges: Edge[] = [];

    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const relationship = await this.detectCustomRelationship(
          nodes[i],
          nodes[j]
        );

        if (relationship) {
          edges.push(relationship);
        }
      }
    }

    return edges;
  }
}
```

## 4. Building Custom Content Generators

### Creating a Custom Generator

**File**: `src/content/generators/CustomGenerator.ts`

```typescript
export class CustomContentGenerator {
  private db: AgentDB;
  private template: ContentTemplate;

  async generate(config: GeneratorConfig): Promise<Content> {
    console.log(`📝 Generating custom content: ${config.type}`);

    // 1. Retrieve research data
    const research = await this.retrieveResearch(config.topic);

    // 2. Create custom outline
    const outline = await this.createCustomOutline(research, config);

    // 3. Generate sections using your custom logic
    const sections = await this.generateCustomSections(outline, research);

    // 4. Apply custom formatting
    const formatted = await this.applyCustomFormatting(sections, config);

    // 5. Add custom metadata
    const content: Content = {
      id: `content-${Date.now()}`,
      type: config.type,
      title: config.title,
      content: formatted,
      metadata: {
        generator: 'custom',
        style: config.style,
        customFields: config.customFields
      },
      quality_score: await this.assessQuality(formatted)
    };

    return content;
  }

  private async createCustomOutline(
    research: Research,
    config: GeneratorConfig
  ): Promise<Outline> {
    // Your custom outline logic
    return {
      sections: [
        { title: 'Custom Section 1', points: [] },
        { title: 'Custom Section 2', points: [] }
      ]
    };
  }

  private async generateCustomSections(
    outline: Outline,
    research: Research
  ): Promise<Section[]> {
    // Generate sections with your custom approach
    return outline.sections.map(section => ({
      title: section.title,
      content: this.generateSectionContent(section, research)
    }));
  }
}
```

## 5. Extending Swarm Coordination

### Adding Custom Swarm Topology

**File**: `src/swarm/topologies/CustomTopology.ts`

```typescript
export class CustomSwarmTopology implements SwarmTopology {
  name = 'custom';
  private agents: Map<string, ResearchAgent> = new Map();

  async initialize(agents: ResearchAgent[]): Promise<void> {
    // Initialize your custom topology
    for (const agent of agents) {
      this.agents.set(agent.id, agent);
    }

    // Setup custom connections
    await this.setupCustomConnections();
  }

  async distributeTask(task: ResearchTask): Promise<TaskDistribution> {
    // Implement custom task distribution logic
    const assignments = this.customTaskAssignment(task);

    return {
      task,
      assignments,
      strategy: 'custom'
    };
  }

  private async setupCustomConnections(): Promise<void> {
    // Create your custom agent connection pattern
    // Examples:
    // - Hub-and-spoke
    // - Hierarchical layers
    // - Dynamic based on task
    // - Specialized clusters
  }

  private customTaskAssignment(task: ResearchTask): Assignment[] {
    // Your custom assignment logic
    const assignments: Assignment[] = [];

    for (const [id, agent] of this.agents) {
      if (this.isAgentSuitable(agent, task)) {
        assignments.push({
          agentId: id,
          subtask: this.createSubtask(agent, task),
          priority: this.calculatePriority(agent, task)
        });
      }
    }

    return assignments;
  }
}
```

## 6. Adding New Research Domains

### Registering a Custom Domain

**File**: `src/domains/CustomDomain.ts`

```typescript
export interface ResearchDomain {
  name: string;
  keywords: string[];
  sources: string[];
  specializedAgents?: string[];
  customAnalysis?: (data: any) => Promise<any>;
}

export const CustomDomain: ResearchDomain = {
  name: 'my-custom-domain',
  keywords: ['keyword1', 'keyword2', 'keyword3'],
  sources: ['arxiv', 'custom-source'],
  specializedAgents: ['my-custom-agent'],

  customAnalysis: async (data) => {
    // Domain-specific analysis logic
    return {
      insights: [],
      metrics: {},
      recommendations: []
    };
  }
};
```

**File**: `src/config/domains.ts`

```typescript
import { CustomDomain } from '../domains/CustomDomain';

export const DOMAINS: Record<string, ResearchDomain> = {
  'AI': AIResearchDomain,
  'ML': MLResearchDomain,
  'my-custom': CustomDomain
};
```

## 7. Customizing Quality Metrics

### Creating Custom Quality Assessor

**File**: `src/quality/CustomQualityAssessor.ts`

```typescript
export class CustomQualityAssessor {
  async assess(content: Content): Promise<QualityReport> {
    const metrics = {
      // Standard metrics
      accuracy: await this.assessAccuracy(content),
      completeness: await this.assessCompleteness(content),
      coherence: await this.assessCoherence(content),

      // Your custom metrics
      customMetric1: await this.assessCustomMetric1(content),
      customMetric2: await this.assessCustomMetric2(content),
      domainSpecificity: await this.assessDomainSpecificity(content)
    };

    // Calculate weighted overall score
    const overallScore = this.calculateWeightedScore(metrics, {
      accuracy: 0.3,
      completeness: 0.2,
      coherence: 0.2,
      customMetric1: 0.15,
      customMetric2: 0.1,
      domainSpecificity: 0.05
    });

    return {
      overallScore,
      metrics,
      recommendations: await this.generateRecommendations(metrics),
      timestamp: Date.now()
    };
  }

  private async assessCustomMetric1(content: Content): Promise<number> {
    // Implement your custom quality metric
    // Return score between 0 and 1
    return 0.85;
  }
}
```

## 8. Performance Optimization

### Optimizing AgentDB Queries

```typescript
// 1. Use quantization for memory reduction
const db = new AgentDB({
  embeddings: {
    quantization: 'uint8'  // 4-8x memory reduction
  }
});

// 2. Use HNSW indexing for faster search
const db = new AgentDB({
  indexing: {
    type: 'hnsw',
    params: {
      M: 16,              // Increase for better recall
      efConstruction: 200, // Increase for better index quality
      efSearch: 100       // Adjust for speed/accuracy tradeoff
    }
  }
});

// 3. Batch operations
const papers = [...]; // Large array of papers
await db.batchInsert({
  collection: 'papers',
  data: papers,
  batchSize: 100  // Process 100 at a time
});

// 4. Use caching
const db = new AgentDB({
  embeddings: {
    cache: true,  // Cache embeddings
    cacheSize: 10000
  }
});
```

### Optimizing Swarm Coordination

```typescript
// 1. Adjust swarm size based on task complexity
const swarmSize = Math.min(
  Math.ceil(complexity * 20),
  config.maxAgents || 50
);

// 2. Use parallel execution
const results = await Promise.all(
  agents.map(agent => agent.execute(task))
);

// 3. Implement task batching
const batchSize = 10;
for (let i = 0; i < tasks.length; i += batchSize) {
  const batch = tasks.slice(i, i + batchSize);
  await this.processBatch(batch);
}

// 4. Use agent pooling
const agentPool = new AgentPool({
  minAgents: 5,
  maxAgents: 20,
  reuseAgents: true
});
```

## 🧪 Testing Custom Modifications

### Unit Test Template

**File**: `tests/custom/MyCustomAgent.test.ts`

```typescript
describe('MyCustomAgent', () => {
  let agent: MyCustomAgent;
  let db: AgentDB;

  beforeEach(async () => {
    db = new AgentDB({ path: ':memory:' });
    await db.connect();

    agent = new MyCustomAgent({
      db,
      specialization: 'test',
      capabilities: ['test-capability']
    });
  });

  afterEach(async () => {
    await db.close();
  });

  it('should execute custom task successfully', async () => {
    const task = {
      type: 'custom-task',
      data: { /* test data */ }
    };

    const result = await agent.execute(task);

    expect(result).toBeDefined();
    expect(result.quality).toBeGreaterThan(0.7);
  });

  it('should learn from successful execution', async () => {
    // Test learning mechanism
  });
});
```

## 📚 Configuration Examples

### Complete Custom Configuration

**File**: `config/custom-research.yaml`

```yaml
research:
  coordinator:
    agentdb:
      path: './custom-research.db'
    swarmSize: 15
    learningEnabled: true
    domains:
      - AI
      - ML
      - my-custom-domain

  sources:
    - name: arxiv
      enabled: true
    - name: custom-source
      enabled: true
      apiKey: ${CUSTOM_SOURCE_API_KEY}
      baseUrl: https://api.custom-source.com

  agents:
    custom:
      - type: my-custom-agent
        specialization: domain-specific
        capabilities:
          - custom-capability-1
          - custom-capability-2

  quality:
    assessor: custom
    thresholds:
      minQuality: 0.8
      minConfidence: 0.7
    customMetrics:
      - customMetric1
      - customMetric2

  swarm:
    topology: custom
    communication: peer-to-peer
    consensusThreshold: 0.75
```

## 🔗 Resources

- [AgentDB Documentation](https://github.com/ruvnet/agentdb)
- [Agentic-Flow Documentation](https://github.com/ruvnet/agentic-flow)
- [ReasoningBank Guide](https://github.com/ruvnet/agentic-flow/docs/reasoningbank)
- [Example Customizations](../examples/custom/)

## 💡 Best Practices

1. **Always use ReasoningBank** to learn from custom modifications
2. **Test thoroughly** before deploying to production
3. **Monitor performance** after adding custom components
4. **Document customizations** for team members
5. **Use type safety** with TypeScript interfaces
6. **Follow existing patterns** for consistency
7. **Version control** configuration files
8. **Benchmark performance** impact of modifications

---

**Version**: 1.0.0
**Last Updated**: 2025-10-28
**Tribe Members**: @rdmolony, @jcolano, @inde5media, @proffesor-for-testing, @Agentist-Elder, @dmoellenbeck
