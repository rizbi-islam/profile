#!/bin/sh
# Use when hosting somewhere other than GitHub Pages (for example Vercel).
# Usage: sh tools/set_base_url.sh https://your-name.vercel.app/
OLD="https://rizbi-islam.github.io/profile/"; NEW="$1"
[ -z "$NEW" ] && { echo "give the new base URL"; exit 1; }
for f in index.html sitemap.xml robots.txt; do sed -i "s|$OLD|$NEW|g" "$f"; done
echo "updated canonical, og, sitemap and robots to $NEW"
