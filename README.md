# Non régression visuelle avec Playwright

Démo minimale : une page statique, 4 tests `toHaveScreenshot` × 2 viewports (desktop, mobile), une CI GitHub Actions.

## Principe

1. Premier run : Playwright capture une **baseline** (PNG commité dans le repo).
2. Runs suivants : nouvelle capture, comparaison pixel à pixel (pixelmatch).
3. Écart au delà du seuil : test rouge + rapport HTML avec **expected / actual / diff** (et slider).

## Ce que la démo montre

| Test | Technique |
|---|---|
| `page complète` | `fullPage` + `mask` sur la date dynamique |
| `composant : tableau des factures` | capture d'un locator : isole le périmètre du diff |
| `état : bouton au survol` | capture d'un état d'interaction |
| `mode sombre` | `colorScheme: 'dark'` |

Réglages globaux dans `playwright.config.ts` : `animations: 'disabled'` (le spinner infini est figé), `caret: 'hide'`, `threshold`, `maxDiffPixelRatio`, locale et timezone fixées.

## Le piège n°1 : le rendu dépend de l'OS

Polices, antialiasing, hinting : une baseline générée sur macOS échoue sur Linux. Ici :

* `snapshotPathTemplate` **sans suffixe de plateforme** : une seule baseline par projet ;
* génération et comparaison **toujours dans l'image Docker** `mcr.microsoft.com/playwright:v1.65.0-noble`, en local (`scripts/docker.sh`) comme en CI ;
* version de `@playwright/test` épinglée et alignée sur le tag de l'image.

## Démarrage

```bash
npm ci
npm run docker:update   # génère les baselines (à commiter)
npm run docker:test     # doit être vert
```

Les baselines ne sont pas versionnées dans ce repo au départ : lance `docker:update` (ou le workflow *Update snapshots*) puis commit `tests/__screenshots__/`.

## Script de démo (5 min)

```bash
npm run docker:test          # vert
npm run demo:break           # applique une régression CSS (padding du tableau + couleur d'un badge)
npm run docker:test          # 6 rouges, les 2 tests du bouton restent verts
npx playwright show-report   # montrer expected / actual / diff
npm run demo:fix             # retour à l'état initial
```

Pour un changement visuel **volontaire** : lancer le workflow *Update snapshots* sur la branche, qui régénère et commit les baselines. La revue du PNG dans la PR GitHub (vue *swipe* / *onion skin*) devient la validation visuelle.

## CI

* `.github/workflows/visual-tests.yml` : sur PR et `main`, upload du rapport en artefact en cas d'échec.
* `.github/workflows/update-snapshots.yml` : `workflow_dispatch`, régénère et pousse les baselines.

Un commit poussé avec le `GITHUB_TOKEN` ne déclenche pas d'autre workflow : après *Update snapshots*, relancer *Visual regression* à la main (ou utiliser un PAT / une GitHub App pour le push).

## Limites à garder en tête

* Coût de maintenance : chaque changement UI volontaire impose une mise à jour des baselines. Préférer des captures de composants à des pages entières.
* Données dynamiques : à masquer (`mask`), figer (`page.clock`, mocks réseau via `page.route`) ou neutraliser par CSS (`stylePath`).
* Pas de retries : un test visuel flaky doit être corrigé, pas relancé.
* Au delà d'une certaine échelle (beaucoup de pages, plusieurs navigateurs, workflow de validation par des designers), un SaaS dédié (Argos, Chromatic, Percy) devient plus rentable.
