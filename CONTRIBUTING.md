# Contributing

Thank you for improving Open Music Player.

1. Create a focused branch from `main`.
2. Keep secrets and private media out of the repository.
3. Add or update tests for behavioral changes.
4. Run `npm test`, `npm run lint`, `npm run typecheck`, `npm run build`, and `git diff --check`.
5. For schema or policy changes, also run the local Supabase reset and pgTAP suite.
6. Open a pull request explaining the user-visible result and verification performed.

Please preserve published/draft privacy, the owner authorization boundary, and the dry-path audio contract.
