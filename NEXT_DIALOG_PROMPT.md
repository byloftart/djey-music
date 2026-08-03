# Starter Prompt: Implement Approved Owner Admin

Продолжаем проект: `/Users/iram/Documents/DJey Audio`

Начни с минимального восстановления checkpoint:

1. Выполни `git status --short --branch`.
2. Прочитай:
   - `AGENTS.md`
   - `README.md`
   - `DESIGN.md`
   - `TASKS.md`
   - `docs/admin-panel.md`
   - `docs/superpowers/specs/2026-08-03-djey-music-owner-admin-design.md`
   - `docs/handoffs/2026-08-03-1227-context-handoff.md`

Не начинай проект заново и не возвращайся к исследованию дизайна каталога. Каталог owner admin утверждён и сохранён в `design/prototypes/djey-music-owner-admin-catalog.html`. Канонический player prototype `design/prototypes/djey-music-mobile-player.html` также утверждён; оба файла не изменяй.

На старте не запускай `npm install`, dev-серверы, build, broad test suites, Supabase reset, browser sweeps, visual audit или deployment inspection. Сначала кратко подтверди максимум четырьмя пунктами:

1. где остановился проект;
2. что уже утверждено и сохранено;
3. что ещё не реализовано;
4. какой точный implementation step начинаешь.

Затем сразу продолжай с указанного next step, не ожидая дополнительной команды:

1. Изучи `lib/auth/require-owner.ts`, `lib/supabase/server.ts`, `lib/supabase/client.ts`, `app/layout.tsx`, `app/page.tsx` и backend migration.
2. Реализуй owner Auth callback/session boundary и защищённый `/admin` route через существующий `requireOwner` contract.
3. Перенеси утверждённый catalog shell в локальные React/CSS components без CDN Tailwind, Google Fonts, Iconify или SortableJS.
4. После protected shell реализуй полноэкранные `Add Track` и `Edit Track`, затем подключай upload/draft/preview/publish/unpublish/reorder/delete небольшими проверяемыми этапами.

Соблюдай утверждённые границы: admin полностью на английском, White Neon по умолчанию, Dark Amber как единственная альтернативная тема, мобильная композиция остаётся центрированной на MacBook, draft metadata/media приватны, service-role key не попадает в browser code. Generic SaaS dashboard запрещён.

Запускай только сфокусированные проверки после изменённого функционального этапа. Cloud Supabase/Vercel resources и deployment начинай только после готовности локального owner flow и проверки точных target/access данных; не меняй DNS и не создавай платные ресурсы без явного подтверждения.
