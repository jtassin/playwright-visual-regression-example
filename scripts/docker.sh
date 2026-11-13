#!/bin/sh
# Lance les tests dans l'image officielle Playwright, identique à la CI.
# Les baselines générées sur macOS/Windows ne correspondent PAS au rendu Linux
# (polices, antialiasing) : on génère et compare toujours dans ce conteneur.
set -e
VERSION=$(node -p "require('./package.json').devDependencies['@playwright/test']")

docker run --rm --ipc=host \
  -v "$(pwd)":/work -w /work \
  -v /work/node_modules \
  "mcr.microsoft.com/playwright:v${VERSION}-noble" \
  sh -c "npm ci && npx playwright test $*"
