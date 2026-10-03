#!/bin/sh
# Run after every change to the game. Phones compare this build stamp with the one they have
# and reload into the new version the next time they're on the title screen.
set -e
cd "$(dirname "$0")"
v=$(date -u +%Y.%m.%d-%H%M)
sed -i "s/^const BUILD='[^']*'/const BUILD='$v'/" index.html
sed -i "s/^const CACHE='sorrowbloom-[^']*'/const CACHE='sorrowbloom-$v'/" sw.js
printf '{"build":"%s"}\n' "$v" > version.json
grep -q "const BUILD='$v'" index.html && grep -q "sorrowbloom-$v" sw.js
echo "$v"
