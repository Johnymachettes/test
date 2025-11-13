/**
 * OpenRouter Research Coordinator - Uses Perplexity for real-time web search
 * Stable and working alternative to Gemini
 */

import * as dotenv from 'dotenv';
import * as https from 'https';

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
  private apiKey: string;
  private model: string = 'perplexity/llama-3.1-sonar-large-128k-online';

  constructor() {
    this.apiKey = process.env.OPENROUTER_API_KEY || '';
    if (!this.apiKey) {
      throw new Error('OPENROUTER_API_KEY not found in environment');
    }
  }

  async initialize(): Promise<void> {
    console.log('🚀 Initializing Research Coordinator (OpenRouter + Perplexity)...');
    console.log(`📡 Using model: ${this.model}`);
    console.log('✅ Research Coordinator ready');
  }

  async research(task: ResearchTask): Promise<ResearchResult> {
    const startTime = Date.now();
    console.log(`\n${'='.repeat(70)}`);
    console.log(`🔬 Starting Research: ${task.id}`);
    console.log(`Query: ${task.query.substring(0, 100)}...`);
    console.log(`${'='.repeat(70)}\n`);

    try {
      const researchPrompt = `Si expert na demografický výskum. Urob detailný research na túto tému a odpovedz VÝLUČNE PO SLOVENSKY:

${task.query}

POVINNÉ ZDROJE (vyhľadaj na týchto weboch):
${task.requiredSources.map(s => `- ${s}`).join('\n')}

POŽIADAVKY:
1. Všetky odpovede PO SLOVENSKY
2. Konkrétne čísla a štatistiky (nie približne!)
3. Pre každé tvrdenie uveď ZDROJ s URL
4. Vytvor tabuľky kde to dáva zmysel
5. Formát: Markdown

FORMÁT ODPOVEDE:

# ZHRNUTIE (3-5 viet po slovensky)
[Stručné zhrnutie]

# KĽÚČOVÉ ÚDAJE
[Konkrétne dáta s číslami a citáciami]

## Populácia Bratislavy po rokoch
- 1990: XXX obyv. (Zdroj: [Štatistický úrad SR](URL))
- 2000: XXX obyv. (Zdroj: [Bratislava.sk](URL))
...

# TABUĽKY

## Vývoj populácie Bratislavy 1990-2024
| Rok | Populácia | Hustota (obyv./km²) | Prírastok (%) |
|-----|-----------|---------------------|---------------|
| 1990| XXX       | XXX                 | XXX%          |
...

# CITÁCIE
1. Štatistický úrad SR - https://statistics.sk/...
2. Bratislava.sk - https://bratislava.sk/...

DÔLEŽITÉ: Celá odpoveď PO SLOVENSKY! Použi real-time web search pre aktuálne dáta.`;

      console.log('🌐 Conducting research with Perplexity (real-time web search)...');
      const responseText = await this.callOpenRouter(researchPrompt);

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

  private async callOpenRouter(prompt: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const data = JSON.stringify({
        model: this.model,
        messages: [{
          role: 'user',
          content: prompt
        }],
        temperature: 0.3,
        max_tokens: 4000
      });

      const options = {
        hostname: 'openrouter.ai',
        port: 443,
        path: '/api/v1/chat/completions',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
          'HTTP-Referer': 'https://github.com/your-repo',
          'X-Title': 'Bratislava Research',
          'Content-Length': Buffer.byteLength(data)
        }
      };

      const req = https.request(options, (res) => {
        let body = '';

        res.on('data', (chunk) => {
          body += chunk;
        });

        res.on('end', () => {
          try {
            const json = JSON.parse(body);
            if (json.error) {
              reject(new Error(json.error.message || 'OpenRouter API error'));
            } else if (json.choices && json.choices[0]) {
              resolve(json.choices[0].message.content);
            } else {
              reject(new Error('Invalid response from OpenRouter'));
            }
          } catch (e: any) {
            reject(new Error(`Failed to parse response: ${e.message}`));
          }
        });
      });

      req.on('error', (error) => {
        reject(error);
      });

      req.write(data);
      req.end();
    });
  }

  private parseResponse(text: string, task: ResearchTask): any {
    // Extract summary
    const summaryMatch = text.match(/# ZHRNUTIE[^\n]*\n([\s\S]*?)(?=\n#|$)/i);
    const summary = summaryMatch ? summaryMatch[1].trim().substring(0, 500) : text.substring(0, 500);

    // Extract citations
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

    // Numbered citations
    const citationRegex = /^\d+\.\s*(.+?)\s*-\s*(https?:\/\/\S+)/gm;
    while ((match = citationRegex.exec(text)) !== null) {
      citations.push({
        source: match[1],
        url: match[2],
        title: match[1]
      });
    }

    // Extract tables
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

    const dataPoints = (text.match(/\d+/g) || []).length;

    return {
      summary,
      citations,
      tables,
      dataPoints
    };
  }

  async close(): Promise<void> {
    // Nothing to close
  }
}
