#!/bin/bash

echo "🔍 Vérification de la configuration du projet Aide-Prof"
echo "================================================"
echo ""

echo "✅ 1. Vérification de la structure des dossiers..."
if [ -d "src/components/ui" ] && [ -d "src/pages" ] && [ -d "src/data" ] && [ -d "src/types" ]; then
    echo "   ✓ Structure des dossiers OK"
else
    echo "   ✗ Structure des dossiers manquante"
fi

echo ""
echo "✅ 2. Vérification des composants UI..."
components=("Button.tsx" "Card.tsx" "Badge.tsx" "Input.tsx" "Select.tsx" "Textarea.tsx" "StatCard.tsx" "Modal.tsx")
for comp in "${components[@]}"; do
    if [ -f "src/components/ui/$comp" ]; then
        echo "   ✓ $comp"
    else
        echo "   ✗ $comp manquant"
    fi
done

echo ""
echo "✅ 3. Vérification des fichiers de configuration..."
configs=("tailwind.config.js" "postcss.config.js" "tsconfig.json" "vite.config.ts")
for config in "${configs[@]}"; do
    if [ -f "$config" ]; then
        echo "   ✓ $config"
    else
        echo "   ✗ $config manquant"
    fi
done

echo ""
echo "✅ 4. Vérification des données mockées..."
if [ -f "src/data/mockData.ts" ] && [ -f "src/types/index.ts" ]; then
    echo "   ✓ Données mockées et types OK"
else
    echo "   ✗ Données ou types manquants"
fi

echo ""
echo "✅ 5. Vérification de la documentation..."
docs=("CLAUDE.md" "PROJECT_STRUCTURE.md" "SETUP_COMPLETE.md")
for doc in "${docs[@]}"; do
    if [ -f "$doc" ]; then
        echo "   ✓ $doc"
    else
        echo "   ✗ $doc manquant"
    fi
done

echo ""
echo "================================================"
echo "✨ Vérification terminée !"
echo ""
echo "Pour démarrer le développement:"
echo "  $ bun dev"
echo ""
echo "Pour compiler:"
echo "  $ bun run build"
