#!/bin/bash
# Deploy the contents of the out/ directory to the root of the Production branch for GitHub Pages

set -e

BUILD_DIR="out"
BRANCH="Hosting"

# Make sure build is up to date
npm run build

# Go to the build output directory
cd $BUILD_DIR

git init

git checkout --orphan $BRANCH


# Make sure GitHub Pages doesn't try to run Jekyll (which ignores folders starting with _)
touch .nojekyll

# Set a predictable committer for CI or local environments
git config user.name "github-actions"
git config user.email "actions@github.com"

git add .
git commit -m "Deploy Next.js static site to GitHub Pages ($BRANCH)"

# Add remote only if it doesn't already exist
REMOTE_URL="$(git -C .. remote get-url origin)"
if git remote | grep origin >/dev/null 2>&1; then
	git remote set-url origin "$REMOTE_URL"
else
	git remote add origin "$REMOTE_URL"
fi

git push -f origin $BRANCH

echo "Deployed to $BRANCH branch!"