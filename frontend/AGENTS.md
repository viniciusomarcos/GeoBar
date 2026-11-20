<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Project conventions

- Use English for code, comments, documentation, and commit messages.
- Use pnpm. Start development with `pnpm start` from the repository root.
- Prefer arrow functions and early returns. Avoid `else` and `else if`.
- Use camelCase for project-owned filenames and PascalCase for components.
  Preserve filenames required by tools, such as `pnpm-lock.yaml`.
- Run CI integrations from their workflow events without enable/disable flags.
- Use `Text` for typography and labels, and `Pressable` for actions and links.
- Use `ShouldRender` for conditional UI instead of JSX ternaries or `&&`.
- Keep each component in a PascalCase folder with its component file, `index.ts`,
  and colocated tests. Nest private components under their owner's `components/`.
  Keep components shared by multiple owners in `src/components/`.
- Preserve native semantics and accessibility inside the primitives. Structural
  HTML and form controls may be used where a primitive does not apply.
- Run Biome, TypeScript, Vitest coverage, and Cypress after relevant changes.
- Create commits or push only when the user explicitly authorizes those actions.
