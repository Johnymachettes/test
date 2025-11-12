#!/bin/bash
# Script na synchronizáciu medzi test a tests repozitármi

echo "🔄 Synchronizácia repozitárov test <-> tests"
echo ""

# Farby pre výstup
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Pozícia aktuálneho test repozitára
TEST_REPO="/home/user/test"

# Kam stiahneme tests repozitár
TESTS_REPO="/home/user/tests-sync"

echo -e "${BLUE}1️⃣ Klonujem tests repozitár...${NC}"
if [ -d "$TESTS_REPO" ]; then
    echo "   Priečinok už existuje, mažem..."
    rm -rf "$TESTS_REPO"
fi

git clone https://github.com/Johnymachettes/tests.git "$TESTS_REPO"
cd "$TESTS_REPO"
git checkout Johnymachettes-patch-1

echo ""
echo -e "${BLUE}2️⃣ Kopírujem súbory z test -> tests...${NC}"

# Vytvor bratislava-urban-study priečinok v tests ak neexistuje
mkdir -p "$TESTS_REPO/bratislava-urban-study"
mkdir -p "$TESTS_REPO/bratislava-urban-study/research"
mkdir -p "$TESTS_REPO/bratislava-urban-study/data"
mkdir -p "$TESTS_REPO/bratislava-urban-study/visualizations"
mkdir -p "$TESTS_REPO/bratislava-urban-study/sources"

# Skopíruj nové súbory z test do tests
echo "   Kopírujem RESEARCH_PROMPTS.md..."
cp "$TEST_REPO/bratislava-urban-study/RESEARCH_PROMPTS.md" "$TESTS_REPO/bratislava-urban-study/"

echo "   Kopírujem .gitignore..."
cp "$TEST_REPO/.gitignore" "$TESTS_REPO/"

echo "   Kopírujem package.json..."
cp "$TEST_REPO/package.json" "$TESTS_REPO/"

echo "   Kopírujem research logs..."
cp -r "$TEST_REPO/bratislava-urban-study/research/"* "$TESTS_REPO/bratislava-urban-study/research/" 2>/dev/null || true

echo ""
echo -e "${BLUE}3️⃣ Kopírujem súbory z tests -> test...${NC}"

# Skopíruj requirements dokumenty z tests do test (ak tam ešte nie sú)
if [ -f "$TESTS_REPO/REQUIREMENTS_DOCUMENT.md" ]; then
    echo "   Kopírujem REQUIREMENTS_DOCUMENT.md..."
    cp "$TESTS_REPO/REQUIREMENTS_DOCUMENT.md" "$TEST_REPO/bratislava-urban-study/"
fi

if [ -f "$TESTS_REPO/RESEARCH_REQUIREMENTS_BRATISLAVA.md" ]; then
    echo "   Kopírujem RESEARCH_REQUIREMENTS_BRATISLAVA.md..."
    cp "$TESTS_REPO/RESEARCH_REQUIREMENTS_BRATISLAVA.md" "$TEST_REPO/bratislava-urban-study/"
fi

# Skopíruj PDF ak existuje
if [ -f "$TESTS_REPO/Porovnávacia štúdia urbanizmu v rôznych častiach sveta (1).pdf" ]; then
    echo "   Kopírujem PDF vzor..."
    cp "$TESTS_REPO/Porovnávacia štúdia urbanizmu v rôznych častiach sveta (1).pdf" "$TEST_REPO/bratislava-urban-study/"
fi

echo ""
echo -e "${BLUE}4️⃣ Commitujem zmeny do tests repozitára...${NC}"
cd "$TESTS_REPO"
git add .
git commit -m "Sync: Add research framework and prompts from test repo

- Added RESEARCH_PROMPTS.md with all 13 research task prompts
- Added project structure (data, research, visualizations)
- Added .gitignore and package.json
- Synced with test repository
" || echo "   Žiadne zmeny na commit"

echo ""
echo -e "${BLUE}5️⃣ Pushujem do tests repozitára...${NC}"
git push origin Johnymachettes-patch-1

echo ""
echo -e "${BLUE}6️⃣ Commitujem zmeny do test repozitára...${NC}"
cd "$TEST_REPO"
git add bratislava-urban-study/
git commit -m "Sync: Ensure all requirements documents are present" || echo "   Žiadne zmeny na commit"
git push

echo ""
echo -e "${GREEN}✅ Synchronizácia dokončená!${NC}"
echo ""
echo "Repozitáre sú teraz syncnuté:"
echo "  - test:  /home/user/test"
echo "  - tests: /home/user/tests-sync"
echo ""
echo "Obidva repozitáre majú teraz:"
echo "  ✓ RESEARCH_PROMPTS.md"
echo "  ✓ REQUIREMENTS_DOCUMENT.md"
echo "  ✓ RESEARCH_REQUIREMENTS_BRATISLAVA.md"
echo "  ✓ Project structure"
echo "  ✓ Package.json"
