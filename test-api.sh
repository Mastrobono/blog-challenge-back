#!/bin/bash

# Script para probar la API en producción
# Uso: ./test-api.sh https://tu-app.onrender.com

API_URL="${1:-http://localhost:3001/api}"

echo "🧪 Testing API at: $API_URL"
echo ""

# Test 1: GET posts (debería devolver array vacío o posts existentes)
echo "📥 Test 1: GET /posts/related"
echo "----------------------------------------"
curl -X GET "$API_URL/posts/related" \
  -H "Content-Type: application/json" \
  -w "\n\nHTTP Status: %{http_code}\n" \
  -s | jq '.' 2>/dev/null || echo "Response (no jq installed):"
curl -X GET "$API_URL/posts/related" -s
echo ""
echo ""

# Test 2: POST - Crear un post (necesitas una imagen)
echo "📤 Test 2: POST /posts/related"
echo "----------------------------------------"
echo "⚠️  Este test requiere una imagen. Ajusta la ruta de la imagen abajo."
echo ""
# Reemplaza con la ruta a una imagen real
IMAGE_PATH="./test-image.jpg"

if [ -f "$IMAGE_PATH" ]; then
  curl -X POST "$API_URL/posts/related" \
    -F "title=Test Post desde Script" \
    -F "topic=Testing" \
    -F "image=@$IMAGE_PATH" \
    -w "\n\nHTTP Status: %{http_code}\n" \
    -s | jq '.' 2>/dev/null || echo "Response:"
  curl -X POST "$API_URL/posts/related" \
    -F "title=Test Post desde Script" \
    -F "topic=Testing" \
    -F "image=@$IMAGE_PATH" \
    -s
else
  echo "❌ Imagen no encontrada en: $IMAGE_PATH"
  echo "   Crea una imagen de prueba o ajusta IMAGE_PATH en el script"
fi

echo ""
echo "✅ Tests completados"

