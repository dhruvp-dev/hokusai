# Issue: Screenshots Captured Before Animations Settle

## Problem Description
When capturing screenshots of websites that use CSS animations, transitions, or JavaScript-driven animations, the screenshot engine captures the page before the animations have finished executing or settled. This results in incomplete or poorly framed screenshots (e.g., half-faded elements or partially animated layouts).

## Current Behavior
Currently, the capture engine waits for network idle states, web fonts, and image load states, but does not check or wait for active CSS transitions or animations to settle before capturing the page.

## Proposed Solutions
1. **Delay Option:** Add a configuration option and CLI flag (such as `--delay <ms>` or `--wait-after-load <ms>`) to allow users to force a static sleep duration before Playwright takes the screenshot.
2. **Animation Detection:** Programmatically inspect the page for active CSS transitions/animations or Web Animations API instances, and wait until they have completed.

## Resolution (Implemented)
1. Added `-d, --delay <number>` and `--wait-after-load <number>` CLI flag and `config.screenshot.delay` option.
2. Implemented programmatic animation settling in `src/engine/capture/wait.js` via `document.getAnimations()`, ensuring all animations finish or pause before capture.
