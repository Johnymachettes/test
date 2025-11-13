# ⚠️  DÔLEŽITÉ: Research Systém Spusti Lokálne

## Problém

Claude Code prostredie **nemá stabilný prístup k externým API** (Gemini, OpenRouter).
Researches treba spustiť na **tvojom počítači**.

---

## ✅ Riešenie: Spusti Lokálne

### 1. Clone Repository

```bash
git clone https://github.com/Johnymachettes/test.git
cd test
git checkout claude/network-architecture-project-011CV4dydfaFEwUUWXZDEbQ7
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure API Keys

Vytvor `.env` súbor:

```bash
# Option A: OpenRouter (ODPORÚČAM - funguje stabilne)
OPENROUTER_API_KEY=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

# Option B: Google Gemini
GOOGLE_GEMINI_API_KEY=AIzaSyCHxnjcJM9PCGvjWFZSL-SkqGJcRRsWTqk
```

### 4. Run Research

```bash
# Task 1: Demografické údaje
npm run research:task1

# Task 2: Veková štruktúra
npm run research:task2

# Všetky tasky
npm run research:all

# Custom research
npm run research:custom "Tvoja otázka"
```

### 5. Výsledky

Researches sa uložia do:
```
bratislava-urban-study/research/
├── task01_demografia.md
├── task02_vekova_struktura.md
└── ...
```

### 6. Push na GitHub

```bash
git add bratislava-urban-study/research/
git commit -m "Add completed research tasks"
git push
```

### 7. Ozvi sa Claude

Po push:
- Claude pokračuje s analýzou
- SWOT analýza
- Vizualizácie
- Vypracovanie kapitol

---

## 🔧 Troubleshooting

### Error: API key not found

```bash
# Skontroluj .env súbor
cat .env

# Musí obsahovať jeden z:
OPENROUTER_API_KEY=sk-or-...
# alebo
GOOGLE_GEMINI_API_KEY=AIza...
```

### Error: Network / fetch failed

```bash
# Skontroluj internet connection
ping openrouter.ai

# Skús iný provider (Gemini -> OpenRouter alebo naopak)
```

### Error: TypeScript compilation

```bash
# Rebuild
npm run build

# Alebo reinstall
rm -rf node_modules
npm install
```

---

## 💡 Alternatívne Riešenie: Manuálny Research

Ak nechceš inštalovať lokálne:

1. Otvor `RESEARCH_PROMPTS.md`
2. Skopíruj prompt pre Task 1
3. Vlož do **goal.ruv.io** alebo **Claude.ai**
4. Stiahni výsledok
5. Ulož ako `bratislava-urban-study/research/task01_demografia.md`
6. Opakuj pre všetky tasky
7. Push na GitHub

---

## 📊 Čo po Research

Keď máš všetky researches:

1. **Push na GitHub**
2. **Ozvi sa Claude**: "Mám researches, poďme na SWOT a kapitoly"
3. Claude vytvorí:
   - SWOT analýzu
   - Vizualizácie (grafy)
   - Všetkých 15 kapitol
   - Finálnu prácu

---

## ❓ Otázky?

Ak niečo nefunguje:
- Pozri error message
- Check `.env` configuration
- Test network connectivity
- Ozvi sa pre pomoc

---

**Good luck! 🚀**
