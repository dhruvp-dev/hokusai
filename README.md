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
npm i -g hokusai-ss
```

Or run directly without installation:

```bash
npx hokusai-ss
```

Alternatively, clone the repository and install the dependencies:

```bash
git clone <repository-url> hokusai
cd hokusai
pnpm install
pnpm exec playwright install chromium
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
# Override the canvas background color (accepts CSS color names, hex codes, or rgb/rgba values)
hokusai --background "#ffffff"

# Change the canvas padding around the device frames
hokusai --padding 80

# Override or add specific viewports (format name:widthxheight)
# Replacing existing viewports:
hokusai --viewport desktop:1920x1080
# Appending brand new viewports:
hokusai --viewport widescreen:2560x1440

# Disable device framing completely to output raw screenshot captures
hokusai --no-frame

# Combine multiple overrides
hokusai ./sites -b "#2a2a35" -p 60 -v desktop:1920x1080 -v mobile:375x812
```

### Full Options Reference

| Option | Shortcut | Type | Description |
| --- | --- | --- | --- |
| `--viewport` | `-v` | `string` | Viewport definition in the format `name:widthxheight`. Can be specified multiple times to override default or add new viewports. |
| `--background` | `-b` | `string` | Backdrop canvas color. Supports any valid CSS color. |
| `--padding` | `-p` | `number` | Padding in pixels around the device frames. |
| `--no-frame` | | `boolean` | Disable framing entirely; writes raw screenshots. |
| `--help` | `-h` | `boolean` | Prints usage information. |

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

- **v0.1:** HTML/CSS/JS discovery, Arc/Mobile frames, auto port allocation
- **v0.2:** CLI configurations for custom viewport sizes, background colors, and canvas padding (Current)
- **v0.3:** Vite framework provider support
- **v0.4:** Next.js framework provider support
- **v0.5:** Astro framework provider support
- **v1.0:** Dynamic framework auto-detection

## License

MIT
