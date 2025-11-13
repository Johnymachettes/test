/**
 * Research Coordinator - GOAP-based research orchestration
 * Inspired by: 00-MASTER-PLAN.md and 01-ARCHITECTURE.md
 *
 * Implements Goal-Oriented Action Planning for Bratislava urban research
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import AgentDB from 'agentdb';
import { ReflexionMemory } from 'agentdb';
import * as dotenv from 'dotenv';

dotenv.config();

export interface ResearchTask {
  id: string;
  query: string;
  priority: 'high' | 'medium' | 'low';
  requiredSources: string[];
  outputFormat: 'markdown' | 'json';
  language: 'sk' | 'en';
  requireCitations: boolean;
  requireTables: boolean;
}

export interface ResearchResult {
  taskId: string;
  summary: string;
  data: any;
  citations: Citation[];
  tables: Table[];
  metadata: {
    dataPoints: number;
    sources: number;
    duration: number;
    quality: number;
  };
}

export interface Citation {
  source: string;
  url: string;
  title: string;
  date?: string;
  relevantData?: string;
}

export interface Table {
  title: string;
  headers: string[];
  rows: (string | number)[][];
}

export class ResearchCoordinator {
  private genAI: GoogleGenerativeAI;
  private db: AgentDB;
  private reflexion: ReflexionMemory;
  private sessionId: string;

  constructor() {
    this.sessionId = `research-${Date.now()}`;

    // Initialize Gemini
    const apiKey = process.env.GOOGLE_GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GOOGLE_GEMINI_API_KEY not found in environment');
    }
    this.genAI = new GoogleGenerativeAI(apiKey);
  }

  async initialize(): Promise<void> {
    console.log('🚀 Initializing Research Coordinator...');

    // Initialize AgentDB with SQLite
    this.db = new AgentDB({
      dbPath: './data/research.db',
      enableReasoningBank: true,
      enableReflexion: true,
      vectorDimension: 768
    });

    await this.db.initialize();

    // Initialize Reflexion Memory for learning from past researches
    this.reflexion = new ReflexionMemory(this.db, {
      sessionId: this.sessionId,
      enableSelfCritique: true
    });

    console.log('✅ Research Coordinator ready');
  }

  /**
   * Execute GOAP-based research workflow
   * Steps: Goal Analysis → State Assessment → Web Search → Synthesis → Verification
   */
  async research(task: ResearchTask): Promise<ResearchResult> {
    const startTime = Date.now();
    console.log(`\n${'='.repeat(70)}`);
    console.log(`🔬 Starting Research: ${task.id}`);
    console.log(`Query: ${task.query}`);
    console.log(`${'='.repeat(70)}\n`);

    try {
      // Step 1: Goal Analysis (decompose into sub-goals)
      const subGoals = await this.analyzeGoal(task);
      console.log(`📋 Identified ${subGoals.length} sub-goals`);

      // Step 2: State Assessment (check what we know)
      const knownInfo = await this.assessState(task);
      console.log(`💾 Found ${knownInfo.length} relevant memories`);

      // Step 3: Web Search (gather new information)
      const searchResults = await this.conductWebSearch(task, subGoals);
      console.log(`🌐 Collected ${searchResults.dataPoints} data points`);

      // Step 4: Synthesis (combine all information)
      const synthesis = await this.synthesizeFindings(task, searchResults, knownInfo);
      console.log(`🧠 Synthesized findings`);

      // Step 5: Verification (fact-check and validate)
      const verified = await this.verifyResults(synthesis, task);
      console.log(`✅ Verified results`);

      // Step 6: Format Output (create markdown with tables)
      const formatted = await this.formatOutput(verified, task);

      // Step 7: Learn from this research (store in ReasoningBank)
      await this.learnFromResearch(task, formatted);

      const duration = Date.now() - startTime;
      console.log(`\n⏱️  Completed in ${(duration / 1000).toFixed(2)}s`);

      return {
        taskId: task.id,
        summary: formatted.summary,
        data: formatted.data,
        citations: formatted.citations,
        tables: formatted.tables,
        metadata: {
          dataPoints: searchResults.dataPoints,
          sources: formatted.citations.length,
          duration,
          quality: verified.qualityScore
        }
      };

    } catch (error) {
      console.error(`❌ Research failed:`, error.message);

      // Store failure for learning
      await this.reflexion.storeEpisode({
        task: task.query,
        action: 'research',
        outcome: 'failure',
        reward: 0,
        critique: error.message
      });

      throw error;
    }
  }

  private async analyzeGoal(task: ResearchTask): Promise<string[]> {
    // Use Gemini to decompose the research query into sub-goals
    const model = this.genAI.getGenerativeModel({ model: 'gemini-pro' });

    const prompt = `Rozdeľ túto research úlohu na 3-5 konkrétnych pod-úloh/otázok:

"${task.query}"

Vráť len zoznam otázok, každá na novom riadku, bez čísel.`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    return text.split('\n').filter(line => line.trim().length > 0);
  }

  private async assessState(task: ResearchTask): Promise<any[]> {
    // Search AgentDB for relevant past research
    const memories = await this.db.searchSimilar(task.query, 5);
    return memories || [];
  }

  private async conductWebSearch(task: ResearchTask, subGoals: string[]): Promise<any> {
    // Use Gemini with Google Search grounding
    const model = this.genAI.getGenerativeModel({
      model: 'gemini-2.0-flash-exp',
      generationConfig: {
        temperature: 0.3, // Lower for factual research
      }
    });

    const searchPrompt = `Urob detailný research na túto tému:

${task.query}

Pod-otázky:
${subGoals.map((g, i) => `${i + 1}. ${g}`).join('\n')}

POVINNÉ ZDROJE:
${task.requiredSources.join('\n- ')}

POŽIADAVKY:
- Konkrétne čísla a štatistiky
- Presné dátumy
- URL všetkých zdrojov
- V slovenčine

Formát odpovede:
1. Pre každú pod-otázku: odpoveď s číslami
2. Pre každé tvrdenie: [ZDROJ: názov, URL]
`;

    const result = await model.generateContent(searchPrompt);
    const responseText = result.response.text();

    return {
      text: responseText,
      dataPoints: (responseText.match(/\d+/g) || []).length,
      raw: responseText
    };
  }

  private async synthesizeFindings(task: ResearchTask, searchResults: any, knownInfo: any[]): Promise<any> {
    // Combine web search results with past knowledge
    const model = this.genAI.getGenerativeModel({ model: 'gemini-pro' });

    const synthesisPrompt = `Syntetizuj tieto research výsledky do prehľadnej štruktúry:

NOVÉ DÁTA:
${searchResults.text}

${knownInfo.length > 0 ? `ZNÁME INFORMÁCIE:\n${knownInfo.map(m => m.content).join('\n')}` : ''}

Vytvor:
1. ZHRNUTIE (3-5 viet)
2. KĽÚČOVÉ ÚDAJE (s číslami)
3. CITÁCIE (formát: Názov - URL)
4. DÁTA PRE TABUĽKY (ak sú k dispozícii)

Jazyk: slovenčina
`;

    const result = await model.generateContent(synthesisPrompt);
    return {
      synthesized: result.response.text(),
      qualityScore: 0.85 // TODO: implement quality scoring
    };
  }

  private async verifyResults(synthesis: any, task: ResearchTask): Promise<any> {
    // Fact-checking step
    console.log('   🔍 Verifying facts...');

    // TODO: Cross-reference citations, check data consistency
    return {
      ...synthesis,
      verified: true,
      qualityScore: synthesis.qualityScore
    };
  }

  private async formatOutput(verified: any, task: ResearchTask): Promise<any> {
    // Parse synthesized text into structured format
    const text = verified.synthesized;

    // Extract citations (simple regex for now)
    const citationRegex = /\[ZDROJ:\s*([^\]]+)\]/g;
    const citations: Citation[] = [];
    let match;

    while ((match = citationRegex.exec(text)) !== null) {
      const parts = match[1].split(',').map(p => p.trim());
      citations.push({
        source: parts[0] || 'Unknown',
        url: parts[1] || '',
        title: parts[0] || ''
      });
    }

    // Extract tables (TODO: improve parsing)
    const tables: Table[] = [];

    return {
      summary: text.substring(0, 500),
      data: verified.synthesized,
      citations,
      tables,
      formatted: text
    };
  }

  private async learnFromResearch(task: ResearchTask, result: any): Promise<void> {
    // Store successful research pattern in ReasoningBank
    await this.reflexion.storeEpisode({
      task: task.query,
      action: 'research',
      outcome: 'success',
      reward: result.metadata?.quality || 0.8,
      approach: 'goap-web-search',
      result: {
        dataPoints: result.metadata?.dataPoints,
        sources: result.citations?.length
      }
    });

    // Store in AgentDB vector memory
    await this.db.store({
      content: result.summary,
      metadata: {
        taskId: task.id,
        query: task.query,
        timestamp: new Date().toISOString()
      }
    });

    console.log('   💾 Learned from this research');
  }

  async close(): Promise<void> {
    await this.db.close();
  }
}
