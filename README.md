# frhd.me personal site

## projects

## blog

## about

## Development

### Available Scripts

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm lint` - Run ESLint
- `pnpm lint:fix` - Auto-fix ESLint issues
- `pnpm type-check` - Check TypeScript types
- `pnpm check` - Run linting + type checking
- `pnpm pre-deploy` - Full validation (lint + type-check + build)

### Pre-commit Checks

A pre-commit hook is automatically installed that runs linting and type checking before each commit. If checks fail, the commit will be blocked.

To run checks manually before committing:
```bash
pnpm run check
```

To auto-fix common linting issues:
```bash
pnpm run lint:fix
```