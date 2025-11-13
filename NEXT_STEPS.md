# 🎯 NEXT STEPS - Bratislava Urban Research Project

## ✅ ČO JE HOTOVÉ

1. **Projekt setup** ✅
   - Repository štruktúra
   - Requirements dokumenty
   - Research prompts

2. **Research systém** ✅
   - GOAP workflow implementation
   - Gemini API integration
   - AgentDB memory system
   - CLI interface
   - Task 1 & 2 configuration

3. **Dokumentácia** ✅
   - README.md
   - RESEARCH_SYSTEM.md
   - RESEARCH_PROMPTS.md
   - Architecture docs (00-04)

---

## 🚀 ČO UROBIŤ TERAZ

### Option A: Spustiť Research Systém (Odporúčam!)

```bash
# 1. Spusti Task 1 research
npm run research:task1

# 2. Počkaj ~30-60 sekúnd

# 3. Skontroluj výstup
cat bratislava-urban-study/research/task01_demografia.md

# 4. Ak je OK, spusti Task 2
npm run research:task2

# 5. Postupne všetky tasky
npm run research:all
```

**Výhody:**
- ✅ Automatické
- ✅ Po slovensky
- ✅ S tabuľkami
- ✅ Správne citácie
- ✅ Učí sa z každého researchu

---

### Option B: Manuálny Research (Pomalšie)

Ak nechceš automatický systém:

1. Otvor `RESEARCH_PROMPTS.md`
2. Skopíruj prompt pre Task 1
3. Vlož do goal.ruv.io alebo iného tool
4. Stiahni výsledok
5. Manuálne oprav citácie a formátovanie
6. Ulož ako `task01_demografia.md`
7. Opakuj pre 12 ďalších taskov

**Nevýhody:**
- ❌ Časovo náročné
- ❌ Manuálne opravy
- ❌ Neučí sa

---

## 📋 POTOM (Po dokončení research)

### 1. Push Research Results

```bash
git add bratislava-urban-study/research/
git commit -m "Add completed research for all 13 tasks"
git push
```

### 2. Ozvi sa Claude

Potom Claude spracuje researches a vytvorí:

- ✅ **SWOT analýzu** Bratislavy (Kapitola 5)
- ✅ **Risk assessment** (Kapitola 6)
- ✅ **Vizualizácie** - grafy, tabuľky (Kapitola 10)
  - Graf: Vývoj populácie 1990-2024
  - Veková pyramída 2024
  - Tabuľky porovnaní s inými mestami
- ✅ **Kapitoly 1-15** - kompletná práca
  - Kapitola 1: Úvod
  - Kapitola 2: Definovanie problematiky
  - Kapitola 3: Historický kontext
  - Kapitola 4: Aktuálny stav Bratislavy
  - ...až po Kapitolu 15: Bibliografia

### 3. Finalizácia

- ✅ Formátovanie (Times New Roman 12pt)
- ✅ Kontrola citácií
- ✅ Export do DOCX
- ✅ Príprava prezentácie (20 min)

---

## 🐛 Troubleshooting

### Ak research systém nefunguje:

**Problem: AgentDB initialization error**
```bash
# Fix: Create data directory
mkdir -p data
```

**Problem: Gemini API key not found**
```bash
# Fix: Check .env file
cat .env | grep GOOGLE_GEMINI_API_KEY

# If missing, add it:
echo "GOOGLE_GEMINI_API_KEY=AIza..." >> .env
```

**Problem: TypeScript errors**
```bash
# Fix: Rebuild
npm run build
```

**Problem: Module not found**
```bash
# Fix: Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

---

## 💡 Tips

### Pre najlepšie výsledky:

1. **Spusť researches postupne** (nie všetky naraz)
   - Task 1 → skontroluj → Task 2 → skontroluj...
   - Každý research sa učí z predošlých (AgentDB!)

2. **Skontroluj kvalitu** po každom researchu
   - Sú tam konkrétne čísla? ✅
   - Sú citácie s URL? ✅
   - Je to po slovensky? ✅

3. **Ak niečo chýba**, spusti znova:
   ```bash
   npm run research:task1  # Opakuje Task 1
   ```

4. **Custom research** pre dodatočné info:
   ```bash
   npm run research:custom "Špecifická otázka o Bratislave"
   ```

---

## 📞 Potrebuješ Pomoc?

### Ak sa zasekneš:

1. **Pozri logy**: Research system vypisuje progress
2. **Check výstup**: `cat bratislava-urban-study/research/task01_demografia.md`
3. **Ozvi sa**: Napíš čo nefunguje a Claude pomôže

---

## 🎯 Summary

**Teraz máš:**
- ✅ Funkčný research systém
- ✅ CLI interface
- ✅ GOAP workflow
- ✅ AgentDB learning
- ✅ Všetko pripravené

**Ďalší krok:**
```bash
npm run research:task1
```

**Good luck! 🚀**
