# Maze Designer

A single-page web app for making random maze images. Choose how many squares
wide and tall the maze is, the margin, how thick the walls are, and the colours
of the walls and of the start and end squares, then download it as a PNG or
SVG. Images are 480 × 360 (the PNG is saved at 2×, 960 × 720), the same size as
the Scratch stage. Built with [Vite](https://vite.dev) and TypeScript.

Live at <https://maze.viboko.dev>.

Every time you change a setting you get a brand new random maze. Mazes are made
with the "binary tree" algorithm: for every square except those in the top row
and the right-hand column, flip a coin and put a wall either along its top or
down its right-hand side. That always leaves exactly one route between any two
squares. The start is the top-right square and the end is the bottom-left
square.

The walls, start and end are each a single flat colour (no anti-aliasing), so a
game can detect them by colour.

## Running locally

Install dependencies:

```bash
just install
```

Then start the dev server:

```bash
just dev
```

The site will be available at <http://localhost:5173>.

## Checks

The `ci` GitHub Actions workflow runs four independent checks on every push
and pull request: `just lint`, `just typecheck test build`,
`just check-accessibility`, and `just check-security`. Pushes to `main` that
pass are deployed to GitHub Pages by the `deploy` workflow.

### Linting

```bash
just lint
```

Lints TypeScript and YAML (`eslint`), formatting (`prettier`), Markdown
(`markdownlint`), CSS (`stylelint`), the built HTML (`html-validate`), and SEO
basics (`robots.txt`, `sitemap.xml`, absolute OG/canonical URLs).

### Tests

```bash
just test
```

Runs the unit tests with Vitest. `just typecheck` type-checks with `tsc`.

### Accessibility

```bash
just check-accessibility
```

Checks accessibility with `pa11y-ci` (WCAG2AA) and Lighthouse. Both build the
site and serve it locally to run against.

### Security

```bash
just check-security
```

Checks npm dependencies for known vulnerabilities with
[`osv-scanner`](https://google.github.io/osv-scanner/) against the
[OSV database](https://osv.dev). `osv-scanner` isn't managed by
`just install` - install it separately, e.g. `brew install osv-scanner`.

Vulnerabilities that don't apply (e.g. dev-only tooling with no fix
available) are suppressed with a reason in [`osv-scanner.toml`](osv-scanner.toml)
rather than silently ignored.

Separately, [Dependabot](.github/dependabot.yml) opens a PR weekly for any
outdated npm package or GitHub Action.
