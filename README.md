<p align="center">
  <img src="assets/hokusai-icon.svg" width="128" height="128" alt="Hokusai Logo">
</p>

# Hokusai

<p align="center">
  <a href="https://www.npmjs.com/package/hokusai-ss"><img src="https://img.shields.io/npm/v/hokusai-ss?color=cb3837&logo=npm" alt="npm version"></a>
  <a href="https://www.npmjs.com/package/hokusai-ss"><img src="https://img.shields.io/npm/dm/hokusai-ss" alt="npm downloads"></a>
  <a href="https://github.com/dhruvp-dev/hokusai/actions/workflows/ci.yml"><img src="https://img.shields.io/github/actions/workflow/status/dhruvp-dev/hokusai/ci.yml?branch=main&logo=github&label=CI" alt="CI"></a>
  <a href="LICENSE"><img src="https://img.shields.io/github/license/dhruvp-dev/hokusai" alt="License: MIT"></a>
  <img src="https://img.shields.io/node/v/hokusai-ss" alt="Node version">
  <img src="https://img.shields.io/badge/Firefox-extension-ff7139?logo=firefoxbrowser&logoColor=white" alt="Firefox extension">
</p>

> **Beautiful website screenshots. Zero configuration.**

Hokusai is an open-source, zero-configuration screenshot utility for static HTML portfolio websites. It automatically discovers local site directories, hosts them on temporary static servers, and generates framed portfolio screenshots across multiple viewports using Playwright and Sharp.

## Features

- **Zero Configuration:** Scan and discover static sites automatically with no configuration files required.
- **Framework Support:** Detects plain HTML, Vite, and Next.js projects automatically. It serves a pre-built `dist/` or `out/` folder if one exists, otherwise starts the dev server for you and shuts it down afterwards.
- **Leaf-Site Filtering:** Recursively walks directory trees and intelligently ignores parent directories if subdirectories contain their own entry points.
- **Asset Load Detection:** Waits for network idle states, web fonts, and image elements to resolve before capturing.
- **Automated Framing:** Generates Arc-style browser chrome headers, phone status bars, and soft drop-shadow backdrops programmatically using SVG overlays and Sharp.
- **Isolated Execution:** Launches a separate browser page context per site to prevent session or style leakage.
- **Live URLs & Sitemaps:** Capture any live website with `--url`, or every page of a site with `--sitemap`.
- **Full-Page Captures:** Triggers lazy-loaded content and collapses scroll-pinned sections so full-page shots come out complete.
- **Browser Extension:** One-click framed screenshots straight from Firefox (see [Browser Extension](#browser-extension)).

## Installation

Install globally via npm:

```bash
npm i -g hokusai-ss
```

Or run directly without installation:

```bash
npx hokusai-ss
```

Alternatively, clone the repository and install the dependencies:

```bash
git clone https://github.com/dhruvp-dev/hokusai.git
cd hokusai
npm install
npx playwright install chromium
```

## Usage

*Note: Global installation registers both `hokusai` and `hokusai-ss` commands for convenience.*

To scan the current directory and generate screenshots:

```bash
hokusai-ss
# or
hokusai
```

To scan a specific target directory:

```bash
hokusai-ss ./sites
```

Or:

```bash
hokusai-ss ./portfolio
```

If running the cloned repository locally:

```bash
pnpm screenshot
```

Alternatively, invoke the CLI script directly using Node:

```bash
node src/cli/index.js /path/to/sites
```

## CLI Configuration Options

You can customize the viewport sizes, background colors, canvas padding, and framing options directly from the command line:

```bash
# Capture a live website URL directly
hokusai --url https://example.com

# Capture multiple live website URLs
hokusai --url https://example.com --url https://vercel.com

# Override the canvas background color (accepts CSS color names, hex codes, or rgb/rgba values)
hokusai --background "#ffffff"

# Change the canvas padding around the device frames
hokusai --padding 80

# Override or add specific viewports (format name:widthxheight)
# Replacing existing viewports:
hokusai --viewport desktop:1920x1080
# Appending brand new viewports:
hokusai --viewport widescreen:2560x1440

# Wait for JavaScript animations or transitions to complete
hokusai --delay 1000

# Disable device framing completely to output raw screenshot captures
hokusai --no-frame

# Combine multiple overrides
hokusai ./sites -b "#2a2a35" -p 60 -d 500 -v desktop:1920x1080 -v mobile:375x812
```

### Full Options Reference

| Option | Shortcut | Type | Description |
| --- | --- | --- | --- |
| `--url` | `-u` | `string` | Live website URL to capture. Can be specified multiple times. |
| `--viewport` | `-v` | `string` | Viewport definition in the format `name:widthxheight`. Can be specified multiple times to override default or add new viewports. |
| `--background` | `-b` | `string` | Backdrop canvas color. Supports any valid CSS color. |
| `--padding` | `-p` | `number` | Padding in pixels around the device frames. |
| `--delay` | `-d` | `number` | Additional wait duration in milliseconds after page load to let animations settle. |
| `--wait-after-load` | | `number` | Alias for `--delay`. |
| `--sitemap` | `-s` | `string` | Capture every page in a `sitemap.xml` (URL or local file). Sitemap indexes are followed; pages are sorted by `<priority>`. |
| `--limit` | | `number` | Maximum number of sitemap pages to capture. |
| `--no-frame` | | `boolean` | Disable framing entirely; writes raw screenshots. |
| `--help` | `-h` | `boolean` | Prints usage information. |

## Browser Extension

Hokusai also ships as a Firefox extension for instant, one-click framed captures while you browse. It lives in `extension/` and is not published to a store yet, so you load it manually.

### Build and load it

```bash
pnpm install
pnpm ext:build        # outputs extension/dist
```

1. Open Firefox and go to `about:debugging#/runtime/this-firefox`.
2. Click **Load Temporary Add-on...**.
3. Select `extension/dist/manifest.json` (or `extension/hokusai-extension.zip` after `pnpm ext:package`).
4. Pin the Hokusai icon to your toolbar.

Temporary add-ons are removed when Firefox restarts. Use `pnpm ext:watch` while developing, then click **Reload** on the `about:debugging` page to pick up changes.

### Using it

- Click the toolbar icon (or press `Ctrl+Shift+H`) to capture the current page.
- Pick a device frame, gradient background preset, and canvas padding in the popup. The preview updates live.
- Include mobile frames and responsive captures from the popup.
- Copy the result to the clipboard or download it; downloads are named after the site.
- Recent captures are kept in the popup, where you can delete single items or clear them all.

## Output Structure

All screenshots are generated in the `screenshots` directory relative to the current working directory where the command is executed:

```text
screenshots/
  dental-clinic-desktop.webp
  dental-clinic-tablet.webp
  dental-clinic-mobile.webp
  dental-clinic-full.webp
```

### Viewports and Frames

| Viewport | Dimensions | Frame Type | Filename Pattern |
| --- | --- | --- | --- |
| **desktop** | 1440 × 900 | Browser Chrome + Shadow | `[slug]-desktop.webp` |
| **tablet** | 1024 × 1366 | Browser Chrome + Shadow | `[slug]-tablet.webp` |
| **mobile** | 390 × 844 | Mobile Status Bar + Notch + Shadow | `[slug]-mobile.webp` |
| **full** | Dynamic | Unframed (Raw Full-Page Capture) | `[slug]-full.webp` |

## Project Architecture

```text
src/
  cli/          # Command-line interface and orchestrator
  engine/
    discover/   # Site directory discovery and slug normalization
    capture/    # Playwright browser interactions and wait states
    frame/      # Card composition and path resolution
    report/     # Command-line reporting interface
  providers/    # Static and framework server providers
  frames/       # Frame rendering configurations
  models/       # Internal data representations
  utils/        # File, path, and port helpers
```

### Repo Layout

This is a pnpm workspace with two packages:

- `src/` — the `hokusai-ss` CLI (published to npm)
- `extension/` — the Firefox browser extension (private)

Extension commands, run from the repo root:

```bash
pnpm install          # install all workspace dependencies
pnpm ext:build        # build the extension into extension/dist
pnpm ext:watch        # rebuild on change
pnpm ext:package      # build and zip to extension/hokusai-extension.zip
```

### Development

```bash
pnpm install
pnpm lint       # ESLint across the CLI, tests and extension
pnpm test       # unit tests (node:test)
pnpm ext:build  # build the extension
```

CI runs lint, tests and the extension build on Node 18, 20 and 22.

## License

MIT
