# Starter Prompt: Integrate the Approved Production Player

Продолжаем проект: `/Users/iram/Documents/DJey Audio`

Сначала выполни `git status --short --branch` и прочитай:

- `AGENTS.md`
- `README.md`
- `DESIGN.md`
- `TASKS.md`
- `design/prototypes/djey-music-mobile-player.html`
- `docs/handoffs/2026-08-03-2033-context-handoff.md`

Не начинай проект заново и не пересматривай утверждённые player/catalog/Add-Edit designs. Owner Auth/session boundary, защищённый `/admin`, production catalog shell, audio-only Add/Edit Track и lifecycle уже реализованы, проверены и сохранены на GitHub. На старте не запускай install, серверы, build, broad tests, Supabase reset, browser sweep, design generation или deployment inspection.

Кратко подтверди checkpoint и сразу начни exact next step из latest handoff: реализуй минимальный production vertical slice от публичного published-tracks query до реального `<audio>` внутри утверждённого player shell. Сначала добейся, чтобы один опубликованный трек отображался, запускался, ставился на паузу и перематывался; затем подключай next/previous и spectrum visualization.

Публичный backend уже проверен: `Kisses your back`, `Attention` и `Equals` видны через RLS, а range reads всех MP3 возвращают `206 Partial Content`. `/` пока является заглушкой, а standalone prototype синтезирует demo audio. Не возвращай synthetic audio в production и не ослабляй draft privacy.

Сохраняй утверждённые границы: точный бренд `DJey Music`; mobile-first; Green Receiver по умолчанию, White Neon и Dark Amber как альтернативы; public listening без Auth; только Published в публичном UI; черновики и их audio приватны; никаких cover UI, public download, generic dashboard или desktop redesign. Cloud Supabase/Vercel не подключай, не deploy и не меняй DNS без отдельного явного разрешения.
