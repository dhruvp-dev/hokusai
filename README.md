# Chitra 📸

> **Beautiful, zero-config screenshots for static HTML portfolio websites.**

Chitra automatically scans your project folders, fires up a local static server for each site, opens them in a headless Chromium browser, waits for all images/fonts to settle, disables animations, captures screenshots at desktop/tablet/mobile viewports, and programmatically composites a gorgeous Safari/Arc-style browser chrome with a soft drop shadow on a padded canvas.

All in a single command, without external API keys or paid services.

---

## Features

- **Zero-config:** Just run `chitra` and let it auto-discover your folders.
- **Provider Architecture:** Extensible structure designed to support Vite, Next.js, and Astro in the future.
- **Leaf-Site Discovery:** Walks nested folder structures intelligently.
- **Smart Waiting:** Waits for DOM, fonts, and images (no arbitrary sleeps).
- **Premium Aesthetics:** Automated Arc/Safari browser framing and drop shadow overlays using high-performance Sharp (libvips) compositing.
- **Zero leakage:** Opens a fresh, isolated browser page per site.

---

## Installation

```bash
# Clone the repository
git clone <this-repo> chitra
cd chitra

# Install dependencies
pnpm install

# Install Playwright Chromium binaries (first time only)
pnpm exec playwright install chromium
```

---

## Usage

Run Chitra directly from the workspace:

```bash
# Scan the current directory recursively
pnpm screenshot

# Scan a specific directory recursively
pnpm screenshot ../my-sites-folder
```

Or run the script using Node:

```bash
node src/cli/index.js ./sites
```

Once published, you can run it globally:
```bash
npx chitra ./sites
```

---

## Screenshot Output Structure

Screenshots are generated inside the `screenshots/` directory of the current working directory from which Chitra was run:

```text
screenshots/
  dental-clinic-desktop.webp
  dental-clinic-tablet.webp
  dental-clinic-mobile.webp
  dental-clinic-full.webp
  novacare-desktop.webp
  ...
```

### Viewports & Frame Styles

| Viewport Name | Dimension | Frame Style | Output |
|---|---|---|---|
| **desktop** | 1440 × 900 | Arc/Safari Chrome + Shadow | `[slug]-desktop.webp` |
| **tablet** | 1024 × 1366 | Arc/Safari Chrome + Shadow | `[slug]-tablet.webp` |
| **mobile** | 390 × 844 | Phone Shell (Notch/Status Bar) | `[slug]-mobile.webp` |
| **full** | dynamic height | None (Raw Page Capture) | `[slug]-full.webp` |

---

## Internal Architecture

Chitra is structured as a clean pipeline:

```text
src/
  cli/          # Command-line entry points
  engine/
    discover/   # Find index.html folders & normalize names
    capture/    # Playwright page sizing & capture loops
    frame/      # Sharp card compositing & output paths
    report/     # Event-based progress reporting
  providers/    # Port hosting abstractions (HTML, Vite, etc.)
  frames/       # Programmatic SVG frame builders (Arc, Mobile)
  models/       # Site and Screenshot data models
  utils/        # Ports, files, and paths helpers
```

---

## Roadmap

- **v0.1:** HTML/CSS/JS discovery, Arc/Mobile frames, auto port allocation (Current)
- **v0.2:** CLI configurations (`chitra.config.js` or flags) for framing colors, padding, and viewports
- **v0.3:** Vite provider (`providers/vite/`)
- **v0.4:** Next.js & React hydration provider (`providers/next/`)
- **v0.5:** Astro provider (`providers/astro/`)
- **v1.0:** General framework auto-detection

---

## License

MIT
