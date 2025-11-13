#!/usr/bin/env node
/**
 * Research CLI - Command line interface for Bratislava Urban Research
 * Based on 01-ARCHITECTURE.md CLI design
 */

import { ResearchCoordinator, ResearchTask } from './core/OpenRouterResearchCoordinator';
import * as fs from 'fs';
import * as path from 'path';

const TASKS_CONFIG: Record<string, ResearchTask> = {
  task01: {
    id: 'task01_demografia',
    query: `Potrebujem komplexný demografický profil Bratislavy, Slovensko od roku 1990 do 2025.

KONKRÉTNE ÚDAJE:
1. Celková populácia v rokoch: 1990, 2000, 2010, 2015, 2020, 2023, 2024
2. Hustota osídlenia (obyv./km²) v týchto rokoch
3. Ročný prírastok/úbytok (%) 1990-2024
4. Prirodzený prírastok (narodenia - úmrtia)
5. Migračný prírastok (prisťahovaní - vysťahovaní)
6. Odkiaľ prichádzajú migranti (regióny SK + krajiny)
7. Kam odchádzajú obyvatelia (brain drain)`,
    priority: 'high' as const,
    requiredSources: [
      'Štatistický úrad SR (statistics.sk)',
      'Bratislava.sk',
      'Eurostat',
      'UN-Habitat'
    ],
    outputFormat: 'markdown' as const,
    language: 'sk' as const,
    requireCitations: true,
    requireTables: true
  },

  task02: {
    id: 'task02_vekova_struktura',
    query: `Analýza vekovej štruktúry populácie Bratislavy a trendy pôrodnosti.

1. Veková štruktúra 2024 (% 0-15, 15-64, 65+)
2. Priemerný vek obyvateľov
3. Úhrnná miera plodnosti (TFR)
4. Tempo starnutia populácie
5. Podiel dôchodcov vs. pracujúcich
6. Vývoj narodených detí 2000-2024`,
    priority: 'high' as const,
    requiredSources: [
      'Štatistický úrad SR',
      'Bratislavský samosprávny kraj (BSK)',
      'Demografické štúdie'
    ],
    outputFormat: 'markdown' as const,
    language: 'sk' as const,
    requireCitations: true,
    requireTables: true
  }
};

async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  if (!command) {
    console.log(`
🔬 Bratislava Urban Research CLI

Usage:
  npm run research:task1    - Run Task 1 (Demographics)
  npm run research:task2    - Run Task 2 (Age Structure)
  npm run research:all      - Run all 13 tasks
  npm run research:custom "query" - Custom research

Example:
  npm run research:task1
`);
    process.exit(0);
  }

  const coordinator = new ResearchCoordinator();

  try {
    await coordinator.initialize();

    if (command === 'task1' || command === 'task01') {
      await runTask(coordinator, TASKS_CONFIG.task01);
    } else if (command === 'task2' || command === 'task02') {
      await runTask(coordinator, TASKS_CONFIG.task02);
    } else if (command === 'all') {
      // Run all tasks sequentially
      for (const taskKey of Object.keys(TASKS_CONFIG)) {
        await runTask(coordinator, TASKS_CONFIG[taskKey]);
      }
    } else if (command === 'custom') {
      const query = args[1];
      if (!query) {
        console.error('❌ Please provide a query for custom research');
        process.exit(1);
      }
      const customTask: ResearchTask = {
        id: 'custom',
        query,
        priority: 'medium',
        requiredSources: ['Štatistický úrad SR', 'Eurostat'],
        outputFormat: 'markdown',
        language: 'sk',
        requireCitations: true,
        requireTables: true
      };
      await runTask(coordinator, customTask);
    }

  } catch (error: any) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await coordinator.close();
  }
}

async function runTask(coordinator: ResearchCoordinator, task: ResearchTask): Promise<void> {
  console.log(`\n${'═'.repeat(70)}`);
  console.log(`🎯 Task: ${task.id}`);
  console.log(`${'═'.repeat(70)}\n`);

  const result = await coordinator.research(task);

  // Save to file
  const outputDir = path.join(process.cwd(), 'bratislava-urban-study', 'research');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const outputPath = path.join(outputDir, `${task.id}.md`);

  // Format markdown output
  const markdown = formatMarkdown(task, result);

  fs.writeFileSync(outputPath, markdown, 'utf-8');

  console.log(`\n✅ Research completed!`);
  console.log(`📄 Output: ${outputPath}`);
  console.log(`📊 Data points: ${result.metadata.dataPoints}`);
  console.log(`📚 Sources: ${result.metadata.sources}`);
  console.log(`⏱️  Duration: ${(result.metadata.duration / 1000).toFixed(2)}s`);
  console.log(`⭐ Quality: ${(result.metadata.quality * 100).toFixed(1)}%\n`);
}

function formatMarkdown(task: ResearchTask, result: any): string {
  const now = new Date().toLocaleString('sk-SK');

  let md = `# ${task.id.toUpperCase()} - DEMOGRAFICKÉ ÚDAJE BRATISLAVY\n\n`;
  md += `**Generated:** ${now}\n`;
  md += `**Task ID:** ${task.id}\n`;
  md += `**Priority:** 🔴 ${task.priority.toUpperCase()}\n\n`;
  md += `---\n\n`;

  md += `## 🎯 Research Query\n\n`;
  md += `${task.query}\n\n`;
  md += `---\n\n`;

  md += `## 📊 ZHRNUTIE\n\n`;
  md += `${result.summary}\n\n`;
  md += `---\n\n`;

  md += `## 🔍 KĽÚČOVÉ ÚDAJE\n\n`;
  md += `${result.data}\n\n`;
  md += `---\n\n`;

  if (result.tables && result.tables.length > 0) {
    md += `## 📋 TABUĽKY\n\n`;
    result.tables.forEach((table: any) => {
      md += `### ${table.title}\n\n`;
      md += `| ${table.headers.join(' | ')} |\n`;
      md += `| ${table.headers.map(() => '---').join(' | ')} |\n`;
      table.rows.forEach((row: any[]) => {
        md += `| ${row.join(' | ')} |\n`;
      });
      md += `\n`;
    });
  }

  md += `## 📚 CITÁCIE A ZDROJE\n\n`;
  if (result.citations && result.citations.length > 0) {
    result.citations.forEach((cite: any, i: number) => {
      md += `${i + 1}. **${cite.title || cite.source}**\n`;
      if (cite.url) md += `   - URL: ${cite.url}\n`;
      if (cite.date) md += `   - Dátum: ${cite.date}\n`;
      md += `\n`;
    });
  } else {
    md += `*Citácie budú pridané v ďalšej iterácii*\n\n`;
  }

  md += `---\n\n`;
  md += `## 📈 METADATA\n\n`;
  md += `- **Dátové body:** ${result.metadata.dataPoints}\n`;
  md += `- **Počet zdrojov:** ${result.metadata.sources}\n`;
  md += `- **Trvanie:** ${(result.metadata.duration / 1000).toFixed(2)} sekúnd\n`;
  md += `- **Kvalita:** ${(result.metadata.quality * 100).toFixed(1)}%\n`;

  return md;
}

// Run CLI
main().catch(console.error);
