# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Important Restrictions

**NEVER run these commands directly:**

- `git add`, `git commit`, `git push` - Always instruct the user to commit changes
- `pnpm version`, `pnpm release` - Always instruct the user to handle releases
- `pnpm changeset` - Always instruct the user to create changesets
- Any command that modifies git history or publishes to npm

## Project Overview

This is an **Astro integration** called `astro-photostream` that creates sophisticated photo galleries with AI-powered metadata generation, geolocation features, and responsive design. It's built as a standalone npm package that users can install via `npx astro add astro-photostream`.

## Development Commands

### Core Development

- `pnpm build:cli` - Build CLI scripts only (TypeScript compilation for scripts)
- `pnpm dev` - Astro type checking in watch mode
- `pnpm check` - Run Astro type checking
- `pnpm lint` - ESLint checking on src/ (flat config format)
- `pnpm lint:fix` - ESLint with auto-fix
- `pnpm format` - Format code with Prettier
- `pnpm format:check` - Check code formatting without changes
- `pnpm quality` - Run lint + format:check + check in sequence
- `pnpm test` - Run Vitest tests
- `pnpm test:coverage` - Run tests with coverage report

### Git Workflow (Husky + Conventional Commits)

**User Commands Only:**

- User must run: `pnpm commit` or `npx git-cz` for interactive commits
- User must run: `git add`, `git commit`, `git push` for all git operations
- Pre-commit hooks automatically run `lint-staged` (ESLint + Prettier on staged files only)
- Commit-msg hooks validate conventional commit format with custom scopes

### Commit Message Format Requirements

**CRITICAL:** This project enforces conventional commits via commitlint.

**Format:** `type(scope): description`

- **Types:** build, chore, ci, docs, feat, fix, perf, refactor, revert, style, test
- **Scopes:** components, cli, docs, demo, deps, integration, utils, types, config
- **Max length:** 72 lower case characters

**Examples:**

- `fix(cli): correct build output path for binary installation`
- `feat(components): add responsive photo grid breakpoints`
- `docs: update api documentation`

### Release Management (Changesets)

**User Commands Only:**

- `pnpm changeset:status` - Check changeset status (read-only)
- User must run: `pnpm changeset` to create changesets
- User must run: `pnpm version` to apply changesets and bump version
- User must run: `pnpm release` to build CLI and publish to npm

### Demo Site Development

- `cd demo && pnpm dev` - Run demo site locally (requires main package to be built first)
- `cd demo && pnpm build` - Build demo site for production
- `cd demo && pnpm check` - Check demo site types

### CLI Tool Testing

- `pnpm build:cli` then `node dist/scripts/photo-metadata-generator.js --help` - Test CLI
- `node dist/scripts/photo-metadata-generator.js --generate-config` - Generate example config
- CLI is also available as `npx astro-photostream` after publishing

## Architecture Overview

### Integration Structure

The project follows Astro integration patterns using `astro-integration-kit`:

- **`src/index.ts`** - Main integration entry point, handles route injection and virtual imports
- **`src/types.ts`** - Zod schemas and TypeScript types for configuration validation
- **`src/schema.ts`** - Astro content collection schema exported for users

### Modular Processing Classes

The metadata generation system uses a class-based architecture:

- **`ExifProcessor`** - Extracts camera metadata (settings, GPS, dates) using exifr
- **`LLMAnalyzer`** (abstract) - Base class for AI content analysis
  - **`ClaudeAnalyzer`** - Concrete implementation for Anthropic Claude API
- **`GeocodeProcessor`** - Reverse geocoding using OpenCage API with privacy features
- **`PhotoMetadataGenerator`** - Orchestrates all processors together

### Component System

Astro components in `src/components/`:

- **`PhotoGrid`** - Responsive photo gallery grid (2/3/4 columns)
- **`PhotoCard`** - Individual photo display with metadata
- **`PhotoStream`** - Paginated photo stream with year grouping
- **`MultiMarkerMap`** - Interactive maps using Leaflet with location clustering
- **`Paginator`** - Reusable pagination component

### Route Templates

Pre-built page templates in `src/routes/`:

- **`photos/[page].astro`** - Main gallery with pagination (`/photos`, `/photos/2`)
- **`photos/[slug].astro`** - Individual photo pages with navigation
- **`photos/tags/[tag]/[...page].astro`** - Tag-based filtering with pagination
- **`og-image.ts`** - Dynamic OpenGraph image generation endpoint

### Configuration System

Multi-layered configuration loading in `src/utils/config.ts`:

1. Default values (in types.ts)
2. Config file (`astro-photostream.config.js`)
3. Environment variables
4. Integration options passed to defineConfig

### CLI Tool Architecture

The CLI (`src/scripts/photo-metadata-generator.ts`) uses the same modular classes as the integration:

- Supports batch processing, EXIF-only updates, location-only updates
- Memory system to avoid repetitive AI-generated content
- Progressive image compression for API upload limits
- Handles both new generation and existing file updates

## Key Implementation Details

### EXIF Data Processing

Uses `exifr` library with specific field extraction for:

- Camera/lens information
- Exposure settings (aperture, shutter, ISO, focal length)
- GPS coordinates with privacy-aware location resolution
- Date/time metadata with timezone handling

### AI Integration

- Supports Claude API with configurable prompts and models
- Image compression pipeline to stay under API limits (~3.7MB target)
- Memory system tracks recent outputs to avoid repetitive content
- Graceful fallback to filename-based metadata when AI unavailable

### Privacy & Geolocation

- OpenCage API integration for location name resolution
- Privacy-first approach with configurable blur radius and offset
- Intelligent location specificity scoring (landmarks > cities > countries)
- No street-level addresses for privacy protection

### Build & Distribution

- TypeScript compilation with custom CLI build script (no bundling for main package)
- Exports multiple entry points: main, components, schema, utils
- CLI tools published as bin commands (`astro-photostream`, `photo-metadata-generator`)
- Demo site included for testing and showcasing features
- Uses Changesets for semantic versioning and automated changelog generation

### Development Workflow Automation

**Modern Git Hooks with Husky v9:**

- `.husky/pre-commit` - Runs `lint-staged` for staged file processing only
- `.husky/commit-msg` - Validates conventional commit messages with `commitlint`
- `lint-staged` configured to run ESLint + Prettier on TypeScript/JavaScript files
- Commitizen provides interactive commit creation with predefined scopes

**Quality Assurance:**

- ESLint with modern flat config format (`eslint.config.js`)
- Prettier with project-specific configuration (`.prettierrc.json`)
- Custom commitlint rules with project-specific scopes: components, cli, docs, demo, deps, integration, utils, types, config
- VS Code workspace settings for auto-format on save

**Dependency Management:**

- Dependabot configured for weekly updates with intelligent PR grouping
- Separate configurations for main package and demo subdirectory
- GitHub Actions dependency updates grouped by category

## Environment Variables

Required for full functionality:

- `ANTHROPIC_API_KEY` - Claude API access for AI metadata generation
- `OPENCAGE_API_KEY` - Location name resolution from GPS coordinates
- `GEOAPIFY_API_KEY` - Static map generation (optional)

## Demo Site

The `demo/` directory contains a working Astro site that showcases the integration:

- Uses Tailwind CSS for styling
- Can run independently with basic photo gallery functionality
- Temporarily disables integration during development (until package is built)
- Includes sample photo content with realistic metadata

## Important Development Notes

### Package Structure

- **No build step for main package** - Source files are exported directly via TypeScript paths
- **CLI tools require building** - Use `pnpm build:cli` before testing CLI functionality
- **Integration-first architecture** - Designed as Astro integration, not standalone library
- **Multi-entry exports** - Components, utils, schema, and main integration exported separately

### Development Workflow

- **Pre-commit quality gates** - All staged files are automatically linted and formatted
- **Conventional commits enforced** - User must use `pnpm commit` for interactive commit creation
- **Quality command** - Run `pnpm quality` before instructing user to commit changes
- **Demo development** - Build main package first before running demo site
- **Never commit automatically** - Always instruct user to review and commit changes

### Configuration Architecture

The system uses a sophisticated 4-layer configuration cascade:

1. Integration options (highest priority)
2. Config file (`astro-photostream.config.js`)
3. Environment variables
4. Built-in defaults (lowest priority)

### Testing Strategy

- **CLI tools** - Require build step before testing
- **Integration** - Test via demo site or direct import
- **Components** - Can be imported individually for testing

## Visual Testing with Playwright MCP

### **Browser Session Management**

**Critical Process for Playwright MCP:**

1. **Handle Browser Conflicts**: If encountering "Browser is already in use" errors:

   ```bash
   # Kill existing chrome processes if needed
   pkill -f "chrome.*mcp" || true
   ```

2. **Proper Session Flow**:
   - Use `mcp__playwright__browser_close` to clean up existing sessions
   - Always use `mcp__playwright__browser_navigate` before taking screenshots
   - Check browser tabs with `mcp__playwright__browser_tabs` if needed

3. **Error Recovery Pattern**:
   ```
   ❌ Error: Browser is already in use
   → mcp__playwright__browser_close
   → mcp__playwright__browser_navigate(url)
   → mcp__playwright__browser_take_screenshot
   ```

### **Mandatory Screenshot Validation Process**

When using Playwright MCP tools for visual verification:

1. **Always Read Screenshots Immediately**: After taking any screenshot, MUST use Read tool to examine visual content
2. **Explicit Visual Validation**: Document what you see vs. what you expected
3. **Never Declare Success Without Visual Confirmation**: DOM changes ≠ visual success
4. **Screenshot Assertion Pattern**: Use this format:

```
⏺ mcp__playwright__browser_navigate(url)
⏺ mcp__playwright__browser_take_screenshot(filename: "feature-test.png")
⏺ Read(.playwright-mcp/feature-test.png)
⏺ VISUAL VERIFICATION:
  - Expected: [specific visual outcome]
  - Actual: [what screenshot shows]
  - Result: ✅ PASS / ❌ FAIL with details
```

### **Visual Testing Quality Gates**

**Mandatory for UI Changes:**

- **Before claiming "working"**: Navigate → Screenshot → Read → Verify sequence required
- **UI Component Changes**: Screenshot before/after comparison required
- **Image/Media Features**: Visual validation mandatory
- **Layout/Styling Changes**: Screenshot verification required
- **Browser Session Management**: Handle conflicts proactively, never ignore browser errors

### **Anti-Patterns to Avoid**

- Taking screenshots without reading them
- Declaring success based only on code/DOM changes
- Using phrases like "Perfect!" without visual verification
- Relying on user correction for visual validation

## Coding Styles

### Positive Prompt

production-ready code, clean architecture, perfect TypeScript, ultra performant, pristine component structure, flawless accessibility, masterpiece SEO, pixel-perfect responsive, enterprise-grade quality, zero technical debt, bulletproof error handling, crystal clear documentation

### Negative Prompt

--no spaghetti code --no broken layouts --no memory leaks --no accessibility violations --no SEO failures --no performance bottlenecks --no type errors --no code smells --no bloated bundles --no broken responsive --no missing error states --no undocumented functions

## Conversational Style

Direct responses only. No apologies, no enthusiasm and no anthropomorphism.

## Forbidden

- "I'm sorry" / "I apologize"
- "Great!" / "Excellent!" / "Wonderful!"
- "I feel" / "I think" / "I believe"
- "Happy to help" / "Love to assist"
- Conversational fillers
- Meta-commentary

## Required

- Lead with core information
- Use declarative statements
- State "System cannot" not "I cannot"
- End when complete
- Technical precision over politeness

## Style

- Terse, functional responses
- No exclamation points
- No hedging language
- No social pleasantries
- Pure information delivery
- Execute immediately. No preamble.
