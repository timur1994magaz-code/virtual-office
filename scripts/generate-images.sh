#!/bin/bash
set -euo pipefail

API_KEY="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"
OUT_DIR="/home/node/.openclaw/workspace/content-plans/images"
mkdir -p "$OUT_DIR"

generate() {
  local name="$1"
  local prompt="$2"
  echo "Generating: $name..."
  
  local url=$(curl -s https://api.openai.com/v1/images/generations \
    -H "Authorization: Bearer $API_KEY" \
    -H "Content-Type: application/json" \
    -d "{
      \"model\": \"dall-e-3\",
      \"prompt\": \"$prompt\",
      \"n\": 1,
      \"size\": \"1792x1024\"
    }" | python3 -c "import sys,json; print(json.load(sys.stdin)['data'][0]['url'])")
  
  curl -s -o "$OUT_DIR/$name.png" "$url"
  echo "  Saved: $OUT_DIR/$name.png ($(stat -f%z "$OUT_DIR/$name.png" 2>/dev/null || stat -c%s "$OUT_DIR/$name.png") bytes)"
}

# 1. Coca-Cola
generate "case1-cocacola" "Cinematic scene of a red vintage truck driving through a snowy city at night with warm glowing lights, holiday atmosphere, with subtle digital glitch effects suggesting AI generation, photorealistic, professional advertising photography"

# 2. Toys R Us
generate "case2-toysrus" "Magical colorful toy store dreamscape with toys floating in sparkles and warm nostalgic lighting, cartoon-style mixed with photorealism, vibrant joyful atmosphere, professional advertising image"

# 3. Under Armour
generate "case3-underarmour" "Athletic figure in dynamic motion with abstract energy trails and glowing muscle visualization, dark background with neon blue and orange highlights, futuristic sports photography concept, dramatic lighting"

# 4. Kia
generate "case4-kia" "Sleek futuristic electric car on a dramatic mountain road at golden sunset, the car appears slightly translucent with holographic digital grid overlay suggesting AI visualization, cinematic automotive photography"

# 5. Nike
generate "case5-nike" "Futuristic marketing command center with dozens of floating holographic screens showing different sneaker advertisements, data visualization overlay, neon purple and blue lights, cinematic wide shot"

# 6. CAT School
generate "catschool-post1" "Young creative professional working at a modern laptop with colorful AI neural network visualizations and video editing interface floating holographically from the screen, vibrant purple and blue ambient lighting, inspirational creative workspace"

echo "All images generated!"
