#!/bin/sh
# Safe staging push: swaps CNAME, removes GA4, pushes, then restores everything.
set -e

GA4_SNIPPET='<!-- Google tag (gtag.js) -->'

# 1. Check no GA4 leaks into staging
if grep -rl "googletagmanager" *.html > /dev/null 2>&1; then
  echo "ERROR: GA4 found in HTML files. Remove it before pushing to staging."
  exit 1
fi

# 2. Swap CNAME to staging
echo "staging.shilpakankaria.com" > CNAME

# 3. Stamp version
bash stamp-version.sh

# 4. Stage and commit
git add CNAME version.json
git diff --cached --quiet || git commit -m "staging: set staging CNAME"

# 5. Push to staging
git push staging HEAD:main

# 6. Restore CNAME to production
echo "www.shilpakankaria.com" > CNAME
bash stamp-version.sh
git add CNAME version.json
git commit -m "Restore www CNAME after staging push"

echo ""
echo "Done. Staging pushed. Local CNAME restored to www.shilpakankaria.com"
