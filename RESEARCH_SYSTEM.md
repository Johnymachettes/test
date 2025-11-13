# 🔬 Bratislava Urban Research System

Vlastný research swarm systém postavený na:
- **GOAP (Goal-Oriented Action Planning)** workflow
- **Google Gemini API** s real-time search
- **AgentDB** pre memory & learning
- **Multi-step** research pipeline

Inšpirovaný dokumentáciou z: `00-MASTER-PLAN.md`, `01-ARCHITECTURE.md`, `03-RESEARCH-AGENTS.md`

---

## 🚀 Quick Start

### Spustenie Research

```bash
# Task 1: Demografické údaje Bratislavy
npm run research:task1

# Task 2: Veková štruktúra
npm run research:task2

# Všetky tasky
npm run research:all

# Custom research
npm run research:custom "Vaša otázka tu"
```

### Výstup

Researches sa uložia do:
```
bratislava-urban-study/research/
├── task01_demografia.md      ✅ S tabuľkami
├── task02_vekova_struktura.md ✅ S citáciami
└── ...                         ✅ Po slovensky
```

---

## 🏗️ Architektúra

### GOAP Research Workflow (7 krokov)

```
1. Goal Analysis      → Rozdelí query na pod-úlohy
2. State Assessment   → Hľadá v AgentDB memories
3. Web Search         → Gemini + Google Search
4. Synthesis          → Kombinuje dáta
5. Verification       → Fact-checking
6. Format Output      → Markdown + tabuľky
7. Learn              → Uloží do ReasoningBank
```

### Komponenty

**ResearchCoordinator** (`src/core/ResearchCoordinator.ts`)
- Orchestruje celý research process
- Používa Gemini API pre search
- AgentDB pre memory & learning
- Reflexion Memory pre self-improvement

**CLI Interface** (`src/research-cli.ts`)
- Command-line rozhranie
- Pre-configured tasky (Task 1-13)
- Custom research mode

---

## 🎯 Funkcie

### ✅ Čo systém ROBÍ:

1. **Real-time Web Search**
   - Gemini 2.0 Flash s Google Search grounding
   - Automaticky cituje zdroje
   - Overuje fakty

2. **Slovenský výstup**
   - Všetky researches v SK
   - Tabuľky v markdown formáte
   - Správne formátované citácie

3. **AgentDB Memory**
   - Pamätá si predošlé researches
   - Učí sa z úspechov/chýb
   - Reflexion Memory pre self-critique

4. **Kvalitné výstupy**
   - Štrukturované markdown
   - Tabuľky s konkrétnymi číslami
   - URL citácie
   - Metadata (kvalita, trvanie)

---

## 📊 Task Configuration

Konfigurácia taskov v `src/research-cli.ts`:

```typescript
const TASKS_CONFIG = {
  task01: {
    id: 'task01_demografia',
    query: '...',
    priority: 'high',
    requiredSources: [
      'Štatistický úrad SR',
      'Bratislava.sk',
      'Eurostat'
    ],
    requireCitations: true,
    requireTables: true
  }
}
```

---

## 🔧 Technológie

- **TypeScript** - Type-safe development
- **Google Gemini API** - AI research & search
- **AgentDB v1.6.1** - Vector memory database
- **Better-SQLite3** - Database backend
- **Transformers.js** - Embedding models
- **Dotenv** - Environment config

---

## 📝 Environment Setup

Create `.env` file:

```bash
GOOGLE_GEMINI_API_KEY=your-key-here
RESEARCH_DEPTH=7
RESEARCH_TIME_BUDGET=180
```

---

## 🎓 Príklad Použitia

```bash
# 1. Spusti research
npm run research:task1

# 2. Počkaj na dokončenie (~ 30-60s)

# 3. Skontroluj výstup
cat bratislava-urban-study/research/task01_demografia.md
```

### Očakávaný výstup:

```markdown
# TASK01_DEMOGRAFIA - DEMOGRAFICKÉ ÚDAJE BRATISLAVY

**Generated:** 13. 11. 2025 0:45:30
**Priority:** 🔴 HIGH

## 📊 ZHRNUTIE
Bratislava má...

## 🔍 KĽÚČOVÉ ÚDAJE
- Populácia 2024: ~480,000
- Hustota: 1,185 obyv./km²
...

## 📋 TABUĽKY
| Rok | Populácia | Hustota | Prírastok (%) |
|-----|-----------|---------|---------------|
| 1990| 442,000   | 1,097   | -0.2%         |
...

## 📚 CITÁCIE
1. **Štatistický úrad SR**
   - URL: https://statistics.sk/...
```

---

## 🚧 Roadmap

### Implemented ✅
- [x] GOAP workflow
- [x] Gemini API integration
- [x] AgentDB memory
- [x] Reflexion learning
- [x] CLI interface
- [x] Task 1 & 2 configs

### TODO 🔲
- [ ] All 13 task configs
- [ ] Better table parsing
- [ ] Citation validation
- [ ] Multi-agent swarm (parallel)
- [ ] Web UI dashboard
- [ ] Export to DOCX

---

## 💡 Inšpirácia

Systém je inšpirovaný:
- `00-MASTER-PLAN.md` - GOAP workflow
- `01-ARCHITECTURE.md` - Multi-layer architecture
- `03-RESEARCH-AGENTS.md` - Agent design patterns
- `09-MODIFICATION-GUIDE.md` - Best practices

---

## 📞 Usage Help

```bash
# Show help
ts-node src/research-cli.ts

# Run specific task
npm run research:task1

# Custom query
npm run research:custom "Váš vlastný research query"
```

---

**Created:** 13. 11. 2025
**Status:** 🟢 Functional (v1.0)
**Next:** Add remaining 11 task configs
