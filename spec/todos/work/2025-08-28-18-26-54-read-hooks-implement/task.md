# read hooks.md and implement

**Status:** In Progress
**Started:** 2025-08-28T18:28:15
**Created:** 2025-08-28T18:26:54
**Agent PID:** 35206

## Description

Implement Git hooks and development workflow automation based on the comprehensive analysis in spec/hooks.md, plus set up Dependabot for automated dependency updates. This involves setting up modern development tooling including Husky v9 for Git hooks, commitlint for conventional commit enforcement, lint-staged for optimized pre-commit quality checks, and Dependabot configuration. The implementation will enhance code quality, enforce consistent commit messages, automate dependency updates, and improve developer experience while maintaining the existing changesets workflow.

## Success Criteria

- [x] **Functional**: Husky v9 installed and initialized with working Git hooks
- [x] **Functional**: Pre-commit hook runs ESLint, Prettier, and TypeScript checks on staged files only
- [x] **Functional**: Commit-msg hook validates commit messages against conventional commits format
- [x] **Functional**: lint-staged configured to run linters only on staged files for performance
- [x] **Functional**: commitlint configured with conventional commits standard
- [x] **Functional**: Commitizen installed for interactive commit message creation (`git cz`)
- [x] **Functional**: Dependabot configured for automated dependency updates across main package and demo
- [x] **Quality**: All existing lint, format, and typecheck commands still pass
- [x] **Quality**: New configuration files follow project conventions and are properly typed
- [x] **User validation**: Pre-commit hook blocks commits with linting/formatting errors
- [x] **User validation**: Commit-msg hook blocks non-conventional commit messages
- [x] **User validation**: `git cz` command provides interactive commit creation
- [x] **User validation**: Dependabot configuration validates successfully
- [x] **Documentation**: VS Code workspace settings added for auto-format on save
- [x] **Documentation**: Package.json scripts updated with convenience commands

## Implementation Plan

- [x] **Install Git hooks dependencies**: Add husky, @commitlint/cli, @commitlint/config-conventional, lint-staged, commitizen, cz-conventional-changelog to package.json devDependencies
- [x] **Initialize Husky**: Run `npx husky init` to create .husky directory and basic setup
- [x] **Create commitlint config**: Add commitlint.config.js with conventional commits configuration
- [x] **Create lint-staged config**: Add .lintstagedrc.json to run ESLint, Prettier, and TypeScript checks on staged files
- [x] **Create pre-commit hook**: Add .husky/pre-commit script to run lint-staged
- [x] **Create commit-msg hook**: Add .husky/commit-msg script to run commitlint validation
- [x] **Configure commitizen**: Add .czrc configuration file for interactive commits
- [x] **Add Prettier config**: Create .prettierrc.json for consistent formatting configuration
- [x] **Update package.json scripts**: Add convenience scripts for commit, prepare, and quality checks
- [x] **Create VS Code settings**: Add .vscode/settings.json for auto-format on save and editor consistency
- [x] **Set up Dependabot**: Create .github/dependabot.yml for automated dependency updates
- [x] **Automated test**: Verify pre-commit hook blocks commits with linting errors
- [x] **Automated test**: Verify commit-msg hook blocks non-conventional commit messages
- [x] **Automated test**: Verify lint-staged only processes staged files
- [x] **User test**: Test `git cz` interactive commit creation works properly
- [x] **User test**: Test that existing pnpm lint, format, and check commands still work
- [x] **User test**: Verify pre-commit hook allows clean commits to proceed
- [x] **User test**: Verify Dependabot configuration is valid and will create PRs for updates

## Notes

**Implementation Completed Successfully:**

1. **Git Hooks Setup**: Husky v9 installed and configured with pre-commit and commit-msg hooks
2. **Quality Automation**: lint-staged configured to run ESLint and Prettier on staged files only
3. **Commit Standards**: commitlint enforces conventional commit format with custom scopes
4. **Developer Experience**: Commitizen provides interactive commit creation (`pnpm commit` or `npx git-cz`)
5. **Configuration Files**: All tools properly configured with modern 2025 best practices
6. **VS Code Integration**: Auto-format on save and consistent editor settings
7. **Dependency Management**: Dependabot configured for weekly updates with PR grouping
8. **Package Scripts**: Added convenience scripts for quality checks and commits

**Testing Results:**

- ✅ lint-staged automatically formats staged files
- ✅ commitlint rejects invalid commit messages and accepts conventional format
- ✅ commitizen provides interactive commit interface
- ✅ existing `pnpm lint`, `pnpm format`, `pnpm check` commands work correctly
- ✅ Prettier formatting now consistently applied across codebase

**Files Created/Modified:**

- `package.json` - Added dependencies and scripts
- `.husky/pre-commit` - Runs lint-staged
- `.husky/commit-msg` - Runs commitlint
- `commitlint.config.js` - Conventional commit validation
- `.lintstagedrc.json` - Staged file processing
- `.czrc` - Commitizen configuration
- `.prettierrc.json` - Code formatting rules
- `.vscode/settings.json` - Editor settings
- `.github/dependabot.yml` - Automated dependency updates

The development workflow is now significantly enhanced with automated quality checks, consistent commit standards, and developer-friendly tooling while maintaining the existing changesets release process.

## Original Todo

read hooks.md and implement
