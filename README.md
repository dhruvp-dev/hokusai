# Hokusai

> **Beautiful website screenshots. Zero configuration.**

Hokusai is an open-source, zero-configuration screenshot utility for static HTML portfolio websites. It automatically discovers local site directories, hosts them on temporary static servers, and generates framed portfolio screenshots across multiple viewports using Playwright and Sharp.

## Features

- **Zero Configuration:** Scan and discover static sites automatically with no configuration files required.
- **Provider Architecture:** Extensible architecture designed to support dynamic framework providers (such as Vite, Next.js, and Astro) in future releases.
- **Leaf-Site Filtering:** Recursively walks directory trees and intelligently ignores parent directories if subdirectories contain their own entry points.
- **Asset Load Detection:** Waits for network idle states, web fonts, and image elements to resolve before capturing.
- **Automated Framing:** Generates Arc-style browser chrome headers, phone status bars, and soft drop-shadow backdrops programmatically using SVG overlays and Sharp.
- **Isolated Execution:** Launches a separate browser page context per site to prevent session or style leakage.

## Installation

Install globally via npm:

```bash
npm i -g hokusai
```

Or run directly without installation:

```bash
npx hokusai
```

Alternatively, clone the repository and install the dependencies:

```bash
git clone <repository-url> hokusai
cd hokusai
pnpm install
pnpm exec playwright install chromium
```

## Usage

To scan the current directory and generate screenshots:

```bash
hokusai
```

To scan a specific target directory:

```bash
hokusai ./sites
```

Or:

```bash
hokusai ./portfolio
```

If running the cloned repository locally:

```bash
pnpm screenshot
```

Alternatively, invoke the CLI script directly using Node:

```bash
node src/cli/index.js /path/to/sites
```

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

## Roadmap

- **v0.1:** HTML/CSS/JS discovery, Arc/Mobile frames, auto port allocation (Current)
- **v0.2:** CLI configurations for custom viewport sizes, background colors, and canvas padding
- **v0.3:** Vite framework provider support
- **v0.4:** Next.js framework provider support
- **v0.5:** Astro framework provider support
- **v1.0:** Dynamic framework auto-detection

## License

MIT
