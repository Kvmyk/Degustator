#!/bin/bash
# Quick Start Script dla Degustator Backend

echo "🚀 Degustator Backend - Quick Start"
echo "=================================="
echo ""

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js nie jest zainstalowany!"
    exit 1
fi

echo "✅ Node.js $(node -v) znaleziony"
echo "✅ npm $(npm -v) znaleziony"
echo ""

# Install dependencies
echo "📦 Instaluję zależności..."
npm install

# Build
echo ""
echo "🔨 Kompiluję projekt..."
npm run build

# Check .env
if [ ! -f ".env" ]; then
    echo ""
    echo "⚠️  Plik .env nie został znaleziony!"
    echo "Tworzeę plik .env z domyślnymi wartościami..."
    cat > .env << EOF
NEO4J_URI=neo4j://localhost:7687
NEO4J_USERNAME=neo4j
NEO4J_PASSWORD=password
NODE_ENV=development
PORT=3001
EOF
    echo "✅ Plik .env stworzony"
    echo ""
    echo "⚠️  WAŻNE: Zaktualizuj .env z twoimi parametrami Neo4j!"
fi

echo ""
echo "=================================="
echo "✅ Setup skończony!"
echo ""
echo "Aby uruchomić aplikację:"
echo "  npm run start:dev        (tryb deweloperski)"
echo "  npm run start:prod       (tryb produkcyjny)"
echo ""
echo "API będzie dostępny na: http://localhost:3001/api"
echo "=================================="
