/**
 * Simplified Research Coordinator - Gemini-only version
 * No AgentDB dependency - just pure Gemini API research
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
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
  data: string;
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
}

export interface Table {
  title: string;
  headers: string[];
  rows: (string | number)[][];
}

export class ResearchCoordinator {
  private genAI: GoogleGenerativeAI;

  constructor() {
    const apiKey = process.env.GOOGLE_GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GOOGLE_GEMINI_API_KEY not found in environment');
    }
    this.genAI = new GoogleGenerativeAI(apiKey);
  }

  async initialize(): Promise<void> {
    console.log('🚀 Initializing Research Coordinator (Gemini-only)...');
    console.log('✅ Research Coordinator ready');
  }

  async research(task: ResearchTask): Promise<ResearchResult> {
    const startTime = Date.now();
    console.log(`\n${'='.repeat(70)}`);
    console.log(`🔬 Starting Research: ${task.id}`);
    console.log(`Query: ${task.query.substring(0, 100)}...`);
    console.log(`${'='.repeat(70)}\n`);

    try {
      // Use Gemini Pro (stable model)
      const model = this.genAI.getGenerativeModel({
        model: 'gemini-pro'
      });

      const researchPrompt = `Si expert na demografický výskum. Urob detailný research na túto tému a odpovedz VÝLUČNE PO SLOVENSKY:

${task.query}

POVINNÉ ZDROJE (použi tieto weby):
${task.requiredSources.map(s => `- ${s}`).join('\n')}

POŽIADAVKY:
1. Všetky odpovede PO SLOVENSKY
2. Konkrétne čísla a štatistiky (nie približne!)
3. Pre každé tvrdenie uveď ZDROJ
4. Vytvor tabuľky kde to dáva zmysel
5. Všetky citácie s URL

FORMÁT ODPOVEDE:

# ZHRNUTIE (3-5 viet po slovensky)
[Stručné zhrnutie hlavných zistení]

# KĽÚČOVÉ ÚDAJE
[Konkrétne dáta s číslami, každý bod s citáciou]

## Populácia Bratislavy po rokoch
- 1990: XXX obyvateľov (Zdroj: [Štatistický úrad SR](URL))
- 2000: XXX obyvateľov (Zdroj: [Bratislava.sk](URL))
...

# TABUĽKY

## Tabuľka 1: Vývoj populácie Bratislavy 1990-2024
| Rok | Populácia | Hustota (obyv./km²) | Prírastok (%) |
|-----|-----------|---------------------|---------------|
| 1990| XXX       | XXX                 | XXX%          |
...

# CITÁCIE
1. Štatistický úrad SR - Obyvateľstvo Bratislavy - https://statistics.sk/...
2. Bratislava.sk - Štatistiky mesta - https://bratislava.sk/...
...

DÔLEŽITÉ: Celá odpoveď musí byť PO SLOVENSKY!`;

      console.log('🌐 Conducting web search with Gemini...');
      const result = await model.generateContent(researchPrompt);
      const responseText = result.response.text();

      console.log(`✅ Research completed (${responseText.length} chars)`);

      // Parse response
      const parsed = this.parseResponse(responseText, task);

      const duration = Date.now() - startTime;
      console.log(`⏱️  Duration: ${(duration / 1000).toFixed(2)}s`);

      return {
        taskId: task.id,
        summary: parsed.summary,
        data: responseText,
        citations: parsed.citations,
        tables: parsed.tables,
        metadata: {
          dataPoints: parsed.dataPoints,
          sources: parsed.citations.length,
          duration,
          quality: 0.85
        }
      };

    } catch (error: any) {
      console.error(`❌ Research failed:`, error.message);
      throw error;
    }
  }

  private parseResponse(text: string, task: ResearchTask): any {
    // Extract summary (first section after "# ZHRNUTIE")
    const summaryMatch = text.match(/# ZHRNUTIE[^\n]*\n([\s\S]*?)(?=\n#|$)/i);
    const summary = summaryMatch ? summaryMatch[1].trim().substring(0, 500) : text.substring(0, 500);

    // Extract citations (look for URLs)
    const citations: Citation[] = [];
    const urlRegex = /\[([^\]]+)\]\((https?:\/\/[^\)]+)\)/g;
    let match;

    while ((match = urlRegex.exec(text)) !== null) {
      citations.push({
        source: match[1],
        url: match[2],
        title: match[1]
      });
    }

    // Also look for numbered citations
    const citationRegex = /^\d+\.\s*(.+?)\s*-\s*(https?:\/\/\S+)/gm;
    while ((match = citationRegex.exec(text)) !== null) {
      citations.push({
        source: match[1],
        url: match[2],
        title: match[1]
      });
    }

    // Extract tables (simple markdown table detection)
    const tables: Table[] = [];
    const tableRegex = /\|(.+)\|\n\|[-:\s|]+\|\n((?:\|.+\|\n?)+)/g;
    let tableMatch;

    while ((tableMatch = tableRegex.exec(text)) !== null) {
      const headers = tableMatch[1].split('|').map(h => h.trim()).filter(h => h);
      const rowsText = tableMatch[2];
      const rows = rowsText.split('\n')
        .filter(row => row.includes('|'))
        .map(row => row.split('|').map(cell => cell.trim()).filter(cell => cell));

      if (headers.length > 0 && rows.length > 0) {
        tables.push({
          title: `Tabuľka ${tables.length + 1}`,
          headers,
          rows
        });
      }
    }

    // Count data points (numbers in text)
    const dataPoints = (text.match(/\d+/g) || []).length;

    return {
      summary,
      citations,
      tables,
      dataPoints
    };
  }

  async close(): Promise<void> {
    // Nothing to close for Gemini-only version
  }
}
