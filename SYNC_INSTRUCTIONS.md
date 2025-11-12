# 🔄 Synchronizácia Repozitárov test <-> tests

## Problém
Máš dva repozitáre:
- `Johnymachettes/test` - kde pracuje Claude (má RESEARCH_PROMPTS.md)
- `Johnymachettes/tests` - kde máš pôvodné requirements

Potrebujeme ich synchronizovať.

---

## ✅ Riešenie - Spusti na svojom počítači:

### Variant 1: Všetko do `tests` repozitára (ODPORÚČAM)

```bash
# Prejdi do tests repo
cd path/to/tests  # tvoja cesta
git checkout Johnymachettes-patch-1
git pull

# Vytvor projekt štruktúru
mkdir -p bratislava-urban-study/{research,data,visualizations,sources,research-configs}

# Stiahni súbory z test repo
curl -o bratislava-urban-study/RESEARCH_PROMPTS.md \
  "https://raw.githubusercontent.com/Johnymachettes/test/claude/network-architecture-project-011CV4dydfaFEwUUWXZDEbQ7/bratislava-urban-study/RESEARCH_PROMPTS.md"

curl -o .gitignore \
  "https://raw.githubusercontent.com/Johnymachettes/test/claude/network-architecture-project-011CV4dydfaFEwUUWXZDEbQ7/.gitignore"

curl -o package.json \
  "https://raw.githubusercontent.com/Johnymachettes/test/claude/network-architecture-project-011CV4dydfaFEwUUWXZDEbQ7/package.json"

# Commitni
git add .
git commit -m "Add research framework and prompts"
git push
```

### Variant 2: Použiť len `test` repozitár

Jednoducho pokračuj v `test` repo a ignoruj `tests`. Claude už má všetko potrebné v `test`.

---

## 📁 Čo je kde:

### V `test` repo (kde pracuje Claude):
✅ bratislava-urban-study/RESEARCH_PROMPTS.md (13 promptov)
✅ bratislava-urban-study/REQUIREMENTS_DOCUMENT.md
✅ bratislava-urban-study/RESEARCH_REQUIREMENTS_BRATISLAVA.md
✅ package.json, .gitignore
✅ Projekt štruktúra

### V `tests` repo (pôvodný):
✅ REQUIREMENTS_DOCUMENT.md
✅ RESEARCH_REQUIREMENTS_BRATISLAVA.md
✅ PDF vzor

---

## 🎯 Odporúčanie:

**Použi `test` repozitár!** Claude tam už má všetko nastavené. Po dokončení researchu:

1. Spusti research online
2. Ulož výsledky do `test` repo: `bratislava-urban-study/research/taskXX.md`
3. Push do branchu `claude/network-architecture-project-011CV4dydfaFEwUUWXZDEbQ7`
4. Claude pokračuje s analýzou

Nepotrebuješ `tests` repo už používať.
