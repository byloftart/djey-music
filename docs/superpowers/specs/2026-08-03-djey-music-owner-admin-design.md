# DJey Music Owner Admin Design

Status: approved catalog and Add/Edit Track direction, 2026-08-03.

## Authority

The approved owner-admin catalog prototype is:

`design/prototypes/djey-music-owner-admin-catalog.html`

Superdesign source:

- Draft: `b3a7732f-f4cc-467e-aae8-d85a657bb9f0`
- Preview: `https://p.superdesign.dev/draft/b3a7732f-f4cc-467e-aae8-d85a657bb9f0`
- Project: `cae57f2a-0bf1-414a-a950-6fee44f440fe`

The approved Add Track refinement is:

- Draft: `80900b6b-caef-4974-81e3-a3978c6364a0`
- Preview: `https://p.superdesign.dev/draft/80900b6b-caef-4974-81e3-a3978c6364a0`
- Project: `cae57f2a-0bf1-414a-a950-6fee44f440fe`

The prototype is a design and interaction reference, not production application code. Production must use local components and dependencies rather than runtime Tailwind, Google Fonts, Iconify, or SortableJS CDNs.

## Product relationship

The owner admin belongs to DJey Music but has its own task-oriented geometry. It preserves the approved light-neomorphic material language, tactile controls, inset working surfaces, rounded shells, illuminated displays, and hardware-inspired character without copying the player layout.

The owner admin must not become a generic SaaS dashboard, Supabase Studio clone, analytics page, desktop table, or decorative player surface.

The approved player prototype at `design/prototypes/djey-music-mobile-player.html` remains unchanged and independent.

## Language and themes

- Every owner-admin label, field, status, action, error, and confirmation is English.
- White Neon is the default owner-admin theme.
- Dark Amber is the only alternate owner-admin theme.
- One moon/sun control switches between the two themes.
- Green Receiver is not used in the owner admin. This does not change the player theme contract.
- Theme selection remains device-local and does not require a database field.

## Responsive boundary

- The owner admin is mobile-only at this stage.
- On a phone it uses the visible dynamic viewport and safe-area insets.
- On a MacBook or any wider browser it remains the same centered mobile composition at a maximum width of approximately `430px`.
- Do not stretch the admin, add desktop columns, add a sidebar, or design a desktop adaptation yet.
- Use `100dvh`/`100svh` plus a `visualViewport` fallback where necessary so mobile browser controls do not cover the bottom action.

## Catalog screen

### Header plaque

- Larger centered `DJey Music` brand mark.
- Centered `Admin Panel` label beneath it.
- Left account/person button opens one compact action: `Sign Out`.
- Right side contains only the White Neon/Dark Amber theme toggle.
- No avatar image, palette picker, hamburger menu, or owner-security copy.

### Catalog readouts

- Two equal-width and equal-height illuminated displays share one symmetrical row.
- Left: track-list icon plus `48 TRACKS TOTAL` in one line.
- Right: filter icon, current filter label, and chevron.
- Filter options are `All Tracks`, `Published`, and `Drafts`.
- The track list scrolls in its own softly separated rounded inset well below the readouts.
- Do not show instructional reorder copy.

### Track cards

- Compact raised cards allow at least four complete tracks to be visible on the initial iPhone 15 Plus browser viewport.
- No cover artwork or cover placeholder appears in the admin catalog row.
- No visible numeric ordering label appears. Manual order is represented by card position.
- A small status indicator occupies a narrow left column and is vertically centered between the title and genre lines.
- Green indicator means Published; red indicator means Draft. The DOM also carries an English accessible status label.
- Title and `genre · DJey` begin on the same left alignment line.
- Each card has exactly two visible actions: a compact circular Play/Pause preview and `Edit`. Preview is owner-only and supports both Draft and Published tracks through the trusted preview route.
- The Play/Pause control has a `44px` circular touch target. The visible Edit control is approximately `38px` high while its effective touch target remains at least `44px`.
- There is no per-track overflow menu and no separate status-badge row.

### Reorder behavior

- Long press on a card, excluding Edit, starts direct touch reordering.
- An ordinary vertical swipe must scroll immediately; long-press reorder must not make scrolling sticky.
- iOS text selection, touch callout, and tap highlight are suppressed for the whole track card during the gesture.
- The selected card visibly lifts with restrained theme glow.
- A clear rounded ghost/placeholder marks the insertion position.
- Drop updates the underlying order and shows a brief `Order updated` confirmation above the bottom dock.
- Production should use a local touch-tested sortable dependency or an equivalently robust implementation. Do not copy the prototype's CDN loading into production.
- Production must persist the resulting `display_order` values through the trusted owner boundary and provide an accessible non-drag fallback.

### Bottom action

- A dedicated raised dock contains one full-width `Add Track` button.
- The button uses restrained White Neon illumination and symmetrical padding.
- The dock stays in normal flex flow, accounts for `env(safe-area-inset-bottom)`, and must never be covered by iOS browser controls.

## Add/Edit track screen contract

`Add Track` opens a dedicated full-screen mobile editor for a new draft. `Edit` opens the same editor populated with the selected track. Do not use a cramped modal over the catalog.

The approved editor is intentionally sparse:

1. The brand plaque shows only `DJey Music`, account, and theme controls. It has no `Add Track` or `Edit Track` subtitle.
2. A compact row contains `Catalog` and an illuminated `NEW TRACK` or `EDIT TRACK` readout.
3. One full-width tactile `UPLOAD TRACK` control appears before metadata. There is no `Audio` heading, nested picker card, visible extension list, or visible size-limit helper.
4. Selecting audio derives Title from the filename, generates the hidden slug, and reads duration from metadata.
5. `Track Details` uses Title + Genre, Tags + read-only Duration, then Description. Description is visually two lines. Fields have labels but no repeated placeholder copy.
6. Duration uses the same inset field geometry as the adjacent fields and displays whole `mm:ss`, never raw seconds or decimals.
7. The resting editor has no visible Slug, Cover, Rights Notice, Publishing, Status, Display Order, Preview, or Allow Download controls.
8. The bottom raised block contains exactly two equal primary decisions for a new track: neutral `SAVE DRAFT` and accent `PUBLISH`.
9. Edit retains the same compact fields, uses Save Changes plus Publish/Unpublish, and keeps a separate confirmed permanent Delete action below the main decisions.
10. Upload validation, progress, cancellation, retryable errors, and partial-failure recovery appear only when active.

Drafts remain visible only in the protected catalog. Public downloading is disabled at the trusted mutation boundary. Catalog order remains controlled by direct reorder rather than an editor field. Permanent delete requires explicit confirmation and idempotent database/storage cleanup.

## Functional architecture

- Owner sign-in has no public signup.
- A protected owner route must call the existing trusted `requireOwner` boundary.
- RLS and storage policies remain the final authorization layer.
- Catalog data comes from `public.tracks` through an authenticated owner query.
- Draft metadata and audio remain private. Any legacy/dormant cover objects also remain private.
- Client-side validation improves feedback but does not replace trusted validation.
- Privileged service-role credentials never enter a Client Component or browser bundle.

Recommended production boundaries:

- `AdminShell`: mobile viewport, themes, account action, and safe areas.
- `CatalogToolbar`: total readout and status filter.
- `TrackList`: native scrolling and reorder orchestration.
- `TrackCard`: status indicator, metadata, and Edit action.
- `TrackEditor`: full-screen add/edit workflow.
- Trusted route/server actions: metadata mutations, signed preview, publish state, upload lifecycle, reorder persistence, and deletion cleanup.

## Required states

- Initial loading.
- Empty catalog.
- Filtered empty state.
- Catalog query failure and retry.
- Upload validation error.
- Uploading with progress and cancellation.
- Save success and failure without losing entered values.
- Partial media/metadata failure with retry.
- Publish/unpublish success and failure.
- Reorder pending, success, and persistence failure.
- Confirmed permanent-delete progress, success, and retryable partial cleanup.

## Verification expectations

- Real-device iPhone scrolling must remain fluid with ordinary one-finger swipes.
- Add Track must remain fully visible above Safari/Chrome bottom controls.
- Long press must not select text or open the iOS callout.
- Drag feedback must make the source card, destination, and completed move obvious.
- Filter, Sign Out, theme toggle, Add Track, and Edit must be keyboard and screen-reader identifiable.
- Allowed owner and rejected non-owner route behavior require focused tests.
- Draft/public RLS and storage privacy must remain intact.

## Rejected or removed admin directions

- Green Receiver in the admin.
- Mixed Russian/English admin copy.
- Generic dashboard, metrics cards, charts, sidebar, or desktop table.
- Desktop expansion at this stage.
- Cover placeholders in catalog rows.
- Visible numeric track-order labels.
- Published/Draft text badges in catalog rows.
- Per-track overflow menu.
- Separate Filter or Reorder buttons in the bottom dock.
- Permanent helper text explaining drag behavior.
- A bottom dock absolutely overlaid on the catalog.
- Add/Edit helper copy that repeats field labels or media formats and size limits.
- Visible Slug, Cover, Rights Notice, Publishing, Status, Display Order, Preview, or Allow Download controls in the approved editor.
