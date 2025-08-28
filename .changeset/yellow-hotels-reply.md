---
'astro-photostream': patch
---

Setup Git hooks and development workflow automation

Adds Husky v9 for Git hooks, commitlint for conventional commit
enforcement, lint-staged for optimized pre-commit quality checks, and
Dependabot for automated dependency updates. Enhances code quality and
developer experience while maintaining existing changesets workflow.

- Pre-commit hooks run ESLint and Prettier on staged files only
- Commit message validation enforces conventional commits format
- Interactive commit creation with Commitizen (`pnpm commit`)
- VS Code workspace settings for auto-format on save
- Dependabot configured for weekly dependency updates
