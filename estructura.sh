#!/bin/bash

# Estructura general de las vistas de Inertia/React
echo "===== ESTRUCTURA DE resources/js/pages ====="
find resources/js/pages -type f \( -name "*.tsx" -o -name "*.ts" \) | sort

echo ""
echo "===== ESTRUCTURA DE resources/js (todo, 3 niveles) ====="
find resources/js -maxdepth 3 -type d | sort

echo ""
echo "===== CARPETA insumos (referencia de patrón ya usado) ====="
find resources/js/pages/insumos -type f 2>/dev/null | sort

echo ""
echo "===== CARPETA estudios (para replicar el patrón en estudios-prv) ====="
find resources/js/pages/estudios -type f 2>/dev/null | sort

echo ""
echo "===== Componentes compartidos / layouts ====="
find resources/js/layouts resources/js/components -maxdepth 2 -type f 2>/dev/null | sort

echo ""
echo "===== Tipos compartidos (types.ts / types/) ====="
find resources/js -iname "types*" 2>/dev/null | sort