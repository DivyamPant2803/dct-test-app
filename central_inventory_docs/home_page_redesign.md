# Build Spec — Configurable Homepage Module (Port Edition)

**Audience:** An AI coding agent building this end-to-end in a new application.
**Status:** Single source of truth, derived from a fully-built and validated reference implementation. Every section reflects actual working code — not aspirational design.
**Target project:** An existing application with a .NET 8 API, SQL Server (EF Core code-first migrations), and React + Redux frontend.
**Repo convention:** Monorepo with `/frontend` (React + TypeScript + Vite) and `/backend` (.NET 8). The homepage feature is an embedded module inside the existing host app.

---

## 1. Orientation

### 1.1 What this is
A configurable, role-based homepage for the host application, plus an **admin configuration module** to manage it. The homepage is not hardcoded: it renders from a versioned configuration document that administrators edit through a maker-checker review workflow. The whole homepage is a single atomic, versioned changeset; the live site always renders one published version.

### 1.2 In scope / out of scope
**In scope (build this):**
- Backend API (.NET 8, Clean Architecture + MediatR/CQRS, EF Core, SQL Server, Redis).
- Live homepage render module (React): turns the published config into rendered cards.
- Admin configuration module (React): changeset dashboard, draft editor, review screen, role settings.
- The data model (3 tables) and the `ConfigJson` document model exactly as specified in §3.
- Local dev environment (docker-compose, migrations, seed data, dev auth harness).
- Tests per §11.

**Out of scope (the host app already provides; do NOT build):**
- Top navigation, branding chrome, global layout shell.
- Login / authentication sign-in flows / token acquisition.
- The surrounding host app modules.
- The data sources behind metric/chart/feed cards — integrated via a **pending contract** (§7.4).
- Image upload / asset management (icons only in v1).
- Localization, drag-and-drop grid layout, real-time data, per-user personalization, A/B testing. (Explicitly deferred.)

### 1.3 Design language
**Do not copy the colors, fonts, or component styles from the reference implementation.** The reference used hardcoded values (e.g. brand red `#c5152a`, blues `#2563eb`) specific to one application. In the target project:
- Use the new project's design system tokens, component library, or CSS variables.
- The structural layout, component responsibilities, and interaction patterns described here are correct; the visual styling is yours to adapt.
- All styled components in the reference (`styled.div`, `styled.button`, etc.) should be replaced with the new project's equivalent (e.g. Ant Design, MUI, Tailwind, shadcn/ui, or your own design system).

### 1.4 Assumptions protocol (required)
When an implementation decision is not specified here, proceed with the most reasonable choice **and**:
- Mark it in code with a comment `// Assumptions:` (JS/TS/C#), `{/* Assumptions: */}` (JSX), or `<!-- Assumptions: -->` (markdown).
- Append the same note to a root-level `ASSUMPTIONS.md`, grouped by area.
Do not silently invent requirements, new card templates, new endpoints, or new data sources.

---

## 2. Architecture

### 2.1 Monorepo layout
```
/
├─ frontend/                    # React 18 + TypeScript + Vite
├─ backend/                     # .NET 8 solution
├─ docker-compose.yml           # SQL Server + Redis for local dev
├─ docs/SPEC.md                 # this file
├─ ASSUMPTIONS.md               # agent-maintained
└─ README.md
```

### 2.2 Stack (fixed)
- **Frontend:** React 18, TypeScript, Vite, TanStack Query (server state), **Redux Toolkit** (admin draft working state only — replaces Zustand in the reference), TipTap (constrained rich text), recharts (charts), DOMPurify (render-time sanitization), Zod (client validation mirror).
- **Backend:** .NET 8, ASP.NET Core Web API, MediatR (CQRS), EF Core (SQL Server provider, code-first migrations), FluentValidation, Microsoft.Identity.Web (JWT validation), StackExchange.Redis, HtmlSanitizer (Ganss.Xss) for save-time sanitization.
- **Data:** SQL Server 2022; Azure Cache for Redis in prod, in-memory cache in dev (pluggable via `ICacheService`).
- **Auth:** The host app's existing auth mechanism (JWT bearer). Dev auth handler for local. See §7.1.

> **Redux note:** The reference used Zustand (`create<DraftStore>()`) for the admin draft editor's working state. In this port you **must use Redux Toolkit** instead. The slice shape and all action semantics are specified exactly in §9.6.

### 2.3 The two frontend surfaces
1. **Live homepage** — read-only render of the published config. Mounted by the host at its home route as `<HomepageModule />`.
2. **Admin module** — authoring + review. Mounted by the host at an admin route as `<HomepageAdminModule />`; handles its own sub-routing.

Code-split so users without the admin role never download the admin bundle or TipTap.

### 2.4 Backend Clean Architecture
```
backend/src/
├─ [AppName].Homepage.Domain/           # entities, enums, value objects, domain rules
│    HomepageVersion, VersionEvent, Role (entities)
│    HomepageConfig, RoleLayout, Card, CardItem (value objects from ConfigJson)
│    + Validate(), Diff(other), ResolveFor(userRoles, override) as domain logic
├─ [AppName].Homepage.Application/      # MediatR handlers, DTOs, FluentValidation validators,
│    interfaces: ICardDataProvider, ICardDataProviderRegistry, ICacheService,
│    ICurrentUser, IClock, IHomepageRepository
├─ [AppName].Homepage.Infrastructure/   # EF Core DbContext + config, repositories,
│    Redis/in-mem cache, provider implementations, auth handlers, HTML sanitizer
└─ [AppName].Homepage.Api/              # controllers, DI composition, middleware
     (ProblemDetails), auth wiring, CORS for host origin
backend/tests/
├─ ...Domain.UnitTests
├─ ...Application.UnitTests
└─ ...Api.IntegrationTests              # Testcontainers SQL Server
```
Controllers are thin: validate auth/role → dispatch MediatR command/query → map to HTTP. All business rules live in Domain/Application.

---

## 3. Data model (authoritative — reproduce exactly)

Three tables. Card templates, data providers, and icons are **code registries** (§3.4). Roles are sourced from the identity provider's app roles, so they get a table (§3.2).

### 3.1 `HomepageVersion` — changeset (workflow + full snapshot)
```sql
CREATE TABLE dbo.HomepageVersion (
    VersionId       BIGINT IDENTITY PRIMARY KEY,
    VersionNo       INT           NOT NULL UNIQUE,
    Title           NVARCHAR(200) NULL,
    [Status]        TINYINT       NOT NULL DEFAULT 0,   -- 0 Draft | 1 Submitted | 2 Live | 3 Superseded
    ConfigJson      NVARCHAR(MAX) NOT NULL,             -- entire homepage (all roles/cards/items)
    SchemaVersion   INT           NOT NULL DEFAULT 1,
    ConfigHash      VARBINARY(32) NULL,                 -- SHA-256 of canonical ConfigJson
    CreatedBy       NVARCHAR(128) NOT NULL,
    CreatedAtUtc    DATETIME2     NOT NULL DEFAULT SYSUTCDATETIME(),
    SubmittedBy     NVARCHAR(128) NULL,
    SubmittedAtUtc  DATETIME2     NULL,
    ReviewedBy      NVARCHAR(128) NULL,
    ReviewedAtUtc   DATETIME2     NULL,
    ReviewComments  NVARCHAR(MAX) NULL,
    WentLiveAtUtc   DATETIME2     NULL,
    SupersededAtUtc DATETIME2     NULL,
    RowVer          ROWVERSION,
    InFlightMarker  AS (CASE WHEN [Status] IN (0,1) THEN CONVERT(bit,1) ELSE NULL END) PERSISTED,
    CONSTRAINT CK_Version_Segregation
        CHECK (ReviewedBy IS NULL OR SubmittedBy IS NULL OR ReviewedBy <> SubmittedBy),
    CONSTRAINT CK_Version_LiveReviewed
        CHECK ([Status] <> 2 OR (ReviewedBy IS NOT NULL AND ReviewedAtUtc IS NOT NULL)),
    CONSTRAINT CK_Version_ValidJson CHECK (ISJSON(ConfigJson) = 1)
);
CREATE UNIQUE INDEX UX_Version_OneLive     ON dbo.HomepageVersion([Status])      WHERE [Status] = 2;
CREATE UNIQUE INDEX UX_Version_OneInFlight ON dbo.HomepageVersion(InFlightMarker) WHERE InFlightMarker = 1;
```
These four guards (one Live, one in-flight, no self-approval, no unreviewed Live) **must remain DB-enforced**; Application layer also validates them for clean error messages.

### 3.2 `Role` — homepage metadata for identity provider roles
```sql
Note: dbo.Role table already exist, we might need to update it for our requirement
CREATE TABLE dbo.Role (
    RoleId      INT IDENTITY PRIMARY KEY,
    RoleKey     VARCHAR(64)  NOT NULL UNIQUE,   -- MUST equal the identity provider app-role value in the token
    DisplayName NVARCHAR(80) NOT NULL,
    Precedence  INT          NOT NULL,          -- lower wins for multi-role users
    IsEnabled   BIT          NOT NULL DEFAULT 1,
    IsFallback  BIT          NOT NULL DEFAULT 0
);
CREATE UNIQUE INDEX UX_Role_OneFallback ON dbo.Role(IsFallback) WHERE IsFallback = 1;
```
Admins edit `DisplayName`, `Precedence`, `IsEnabled`, `IsFallback` only — they do not create roles. Rows are seeded/synced from identity provider app roles.

### 3.3 `VersionEvent` — review trail (append-only)
```sql
CREATE TABLE dbo.VersionEvent (
    VersionEventId BIGINT IDENTITY PRIMARY KEY,
    VersionId      BIGINT NOT NULL REFERENCES dbo.HomepageVersion(VersionId) ON DELETE CASCADE,
    EventType      VARCHAR(20) NOT NULL,  -- Created|Submitted|Approved|Rejected|RolledBack|Discarded
    PerformedBy    NVARCHAR(128) NOT NULL,
    PerformedAtUtc DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    Comments       NVARCHAR(MAX) NULL
);
CREATE INDEX IX_VersionEvent_Version ON dbo.VersionEvent(VersionId, PerformedAtUtc);
```
**Note:** `Discarded` is a valid event type (added in the reference implementation) for when an author permanently deletes a draft before submission or a submitted draft before approval.

### 3.4 Code registries
```csharp
public enum ContentModel { Prose, Structured, Data }

public static class CardTemplates {
    public static readonly IReadOnlyDictionary<string, ContentModel> Kinds = new Dictionary<string, ContentModel> {
        ["RichText"]     = ContentModel.Prose,       // heading + sanitized rich body
        ["LinkList"]     = ContentModel.Structured,  // items: {title, url, iconKey, bodyHtml}
        ["NoticeList"]   = ContentModel.Structured,  // items: {bodyHtml, badgeText, effective dates, extra.priority}
        ["Timeline"]     = ContentModel.Structured,  // items: {title, url, extra.version, extra.date, bodyHtml}
        ["Metric"]       = ContentModel.Data,        // provider single value + trend
        ["Chart"]        = ContentModel.Data,        // provider series; settings.chartType ∈ bar|line|pie|donut
        ["ActivityFeed"] = ContentModel.Data,        // provider event list
    };
}

public static class DataProviders {
    public static readonly string[] Keys = {
        "total-requests", "pending-approvals", "active-transfers", "completed-30d",
        "sla-performance", "escalations", "team-workload", "approval-queue",
        "my-open-requests", "requests-awaiting-action", "recently-completed", "transfer-status-summary"
    };
}
// IconKeys: validated against a fixed front-end Tabler subset shared/icons.ts (see §9.7).
```

---

## 4. `ConfigJson` document

`schemaVersion` allows shape evolution. **Every card and item has a stable GUID `id`, preserved across clones** — this is what makes diffing reliable.

```jsonc
{
  "schemaVersion": 1,
  "roles": {                       // keyed by ANY enabled Role.RoleKey
    "Admin":       { "cards": [ /* Card */ ] },
    "Requester":   { "cards": [ /* Card */ ] },
    "GeneralUser": { "cards": [ /* Card */ ] }
  }
}
```

**Card**
```jsonc
{
  "id": "guid",
  "type": "NoticeList",            // CardTemplates.Kinds key
  "header": "Important Announcements",
  "subtitle": null,
  "size": "Large",                 // Small | Medium | Large | FullWidth
  "order": 1,
  "enabled": true,
  "bodyHtml": null,                // Prose only (sanitized)
  "items": [ /* Item */ ],         // Structured only
  "dataProviderKey": null,         // Data only (∈ DataProviders.Keys)
  "settings": {}                   // Data only, e.g. {"format":"integer"} | {"chartType":"bar"}
}
```

**Item** (structured cards)
```jsonc
{
  "id": "guid",
  "order": 1,
  "title": null,
  "bodyHtml": "<b>System Maintenance…</b>",   // sanitized
  "url": null,                     // http(s) only
  "iconKey": "ti-bell",
  "badgeText": "New",
  "effectiveFromUtc": null,        // optional scheduled show
  "effectiveToUtc": "2025-05-20T14:00:00Z",
  "extra": { "priority": "High" }  // type-specific
}
```

---

## 5. Business rules & state machine

### 5.1 Lifecycle
`Draft(0) → Submitted(1) → Live(2)`; `Submitted → Draft` on reject; `Live → Superseded(3)` when a newer version goes live. Reject reuses the same row (returns to Draft); each transition logs a `VersionEvent`.

A draft (in either Draft or Submitted status) can be **Discarded** by its author — this permanently deletes the row and logs `VersionEvent(Discarded)` before deletion.

### 5.2 Invariants (enforce in Application AND rely on DB guards)
- At most one Live version; at most one in-flight (Draft|Submitted) changeset.
- Approver ≠ author and ≠ submitter (**segregation of duties**).
- A version can be Live only if reviewed.
- A draft is editable only while `Status=Draft` and only by `CreatedBy`.
- Saves use optimistic concurrency on `RowVer` (return 412 on mismatch).

### 5.3 Role resolution (render)
From the user's identity app-roles: choose the **enabled `Role` with lowest `Precedence` that has a non-empty `cards` array** in the target config; if none qualifies, use the `IsFallback` role. An optional `?role=` override is honored only if the user actually holds that role.

### 5.4 Operations
| Op | Behavior |
|---|---|
| Create draft | Guarded by one-in-flight. Clone Live `ConfigJson` preserving all `id`s → insert Draft (next `VersionNo`, `CreatedBy`) → `VersionEvent(Created)`. If no Live exists, clone the seed/empty config. |
| Save | While Draft & caller=author. Validate (§6) → sanitize → update `ConfigJson`/`ConfigHash` with `WHERE RowVer=@etag`. |
| Submit | → Submitted; `VersionEvent(Submitted)`. |
| Reject | Approver≠author; → Draft; store `ReviewComments`; `VersionEvent(Rejected)` (comments required). |
| Approve | Tx: check approver≠author/submitter; Live→Superseded; Draft→Live (`ReviewedBy/At`, `WentLiveAtUtc`); `VersionEvent(Approved)`. Then invalidate cache. |
| Rollback | Like Create draft but seed from a chosen Superseded version (run upcaster first). Goes through normal review. |
| Discard | Author-only. Delete row; `VersionEvent(Discarded)` logged before deletion. Allowed for Draft and Submitted statuses. |
| Render | Read Live `ConfigJson` → resolve role (§5.3) → filter `enabled` and effective-date window → order by `order`. |

### 5.5 Diff (powers the review screen)
Structural, per role, matched **by stable `id`**: id in draft only → `Added`; in live only → `Removed`; in both with changed fields → `Edited` (+ field-level detail); in both with only `order` changed → `Reordered`. Canonical serialization (sorted keys) for `ConfigHash`/ETag equality.

---

## 6. Validation contract (write path; server authoritative, client mirrors with Zod)
Run on every save; hard-gate on submit.
1. `schemaVersion` known; every `roles` key ∈ enabled `Role.RoleKey`.
2. Every card/item `id` is a unique GUID within the document.
3. `card.type ∈ CardTemplates.Kinds`; `card.size ∈ {Small, Medium, Large, FullWidth}`. `header` required (min 1 char).
4. Content-model match: Prose→`bodyHtml` present (min 1 char), no `items`/`dataProviderKey`; Structured→`items` array, no `bodyHtml`/`dataProviderKey`; Data→`dataProviderKey ∈ DataProviders.Keys`, no `items`.
5. Rich text: sanitize all `bodyHtml` to allow-list `b, strong, i, em, u, ul, ol, li, a[href], h3, h4, p, br`; strip everything else. Sanitize on **save** (server, HtmlSanitizer) and on **render** (client, DOMPurify).
6. `url`/`a[href]` must be `http(s):` (reject `javascript:`, `data:`).
7. `iconKey ∈` the shared icon set (§9.7).
8. `extra` validated per type (e.g. `priority ∈ {High, Normal, Low}`; `date` parses).
9. `order` normalized to dense `1..n` per role on save.
On success, recompute `ConfigHash`, bump `RowVer`.

---

## 7. Backend detail

### 7.1 Auth (embedded host)
- The host calls this API with the user's access token as `Authorization: Bearer`. Validate with Microsoft.Identity.Web (or the project's existing JWT middleware) against `Auth:Authority` + `Auth:Audience`. Extract identity and app roles from the `roles` claim → map to `RoleKey`s.
- Admin endpoints require the app role `Homepage.Admin`.
- **Dev mode** (`Auth:DevMode=true`): a `DevAuthHandler` authenticates from headers `X-Dev-User` and `X-Dev-Roles` (comma-separated). Never enabled in prod.

### 7.2 Caching (`ICacheService`)
- Live resolved layout cached per `layout:{roleKey}:{versionNo}`; invalidated on approve/rollback.
- Data-card results cached per provider: `carddata:{global|user}:{providerKey}[:{userId}]` with the provider's TTL. PerUser providers use short TTL + single-flight (stampede protection).
- Dev uses `MemoryCache`; prod uses Redis. Behind one interface.

### 7.3 CQRS (MediatR) — handlers map 1:1 to endpoints
Queries: `GetLiveHomepage`, `GetRoles`, `GetConfigState`, `GetDraft`, `GetDiff`, `GetPreview`, `GetVersions`, `GetVersionEvents`, `ResolveCardData(batch)`.
Commands: `CreateDraft`, `SaveDraft`, `SubmitDraft`, `ApproveDraft`, `RejectDraft`, `DiscardDraft`, `Rollback`, `UpdateRoleMetadata`.

### 7.4 Data provider seam (CONTRACT PENDING — single swap-in point)
```csharp
public interface ICardDataProvider {
    string Key { get; }                 // ∈ DataProviders.Keys
    CardScope Scope { get; }            // Global | PerUser
    TimeSpan DefaultTtl { get; }
    Task<CardDataResult> GetAsync(CardDataContext ctx, CancellationToken ct);
}
public record CardDataContext(string UserId, IReadOnlyCollection<string> Roles);
public record CardDataResult(object? Value, object? Series, IReadOnlyList<object>? Items,
                             string? Error, DateTime AsOfUtc);
```
- Register one implementation per key via `ICardDataProviderRegistry`.
- Until the real contract is supplied: implement each provider behind the interface returning deterministic mock data, mark the class `// Assumptions: stub data — replace when data contract is supplied`, gate behind `Providers:UseStub`.

### 7.5 Errors
RFC 7807 ProblemDetails everywhere. 400 validation (with field details), 403 segregation/role, 404 not found, 409 one-in-flight conflict, 412 concurrency (RowVer/ETag), 502 provider failure (per-card marker only, never fails the batch).

---

## 8. API contract

All under `/api`. All require a valid bearer token. Admin paths require `Homepage.Admin`.

| Method | Path | Role | Purpose |
|---|---|---|---|
| GET | `/homepage?role={key}` | any | Resolved homepage cards for effective role. |
| POST | `/homepage/data:batch` | any | Resolve data for given card ids. |
| GET | `/roles` | any | Enabled roles (key, label, precedence, isFallback). |
| GET | `/admin/homepage/state` | admin | Live summary + in-flight draft summary (if any). |
| POST | `/admin/homepage/drafts` | admin | Create draft (clone of Live). |
| GET | `/admin/homepage/drafts/{id}` | admin | Draft config + meta + ETag. |
| PUT | `/admin/homepage/drafts/{id}` | admin | Save edits (If-Match ETag). |
| DELETE | `/admin/homepage/drafts/{id}` | admin | Discard draft (author-only; Draft or Submitted status). |
| POST | `/admin/homepage/drafts/{id}/submit` | admin | Submit for review. |
| POST | `/admin/homepage/drafts/{id}/approve` | admin | Approve & publish (segregation enforced). |
| POST | `/admin/homepage/drafts/{id}/reject` | admin | Reject with required comments. |
| GET | `/admin/homepage/drafts/{id}/diff` | admin | Structural diff vs Live. |
| GET | `/admin/homepage/drafts/{id}/preview?role={key}` | admin | Resolved cards from draft for a role. |
| GET | `/admin/homepage/versions` | admin | Paged version history. |
| GET | `/admin/homepage/versions/{id}/events` | admin | Review trail. |
| POST | `/admin/homepage/versions/{id}/rollback` | admin | New draft seeded from a historical version. |
| PUT | `/admin/roles/{key}` | admin | Update role metadata (label/precedence/enabled/fallback). |

### 8.1 Representative payloads

`GET /homepage` → 200
```jsonc
{ "versionNo": 42, "role": "Requester",
  "cards": [
    { "id":"…", "type":"NoticeList", "header":"Important Announcements", "size":"Large", "order":1,
      "items":[ { "id":"…", "bodyHtml":"<b>System Maintenance…</b>", "extra":{"priority":"High"} } ] },
    { "id":"…", "type":"Metric", "header":"Pending Approvals", "size":"Small", "order":2,
      "dataProviderKey":"pending-approvals", "settings":{"format":"integer"} }
  ] }
```

`POST /homepage/data:batch` → 200
```jsonc
// request:  { "cardIds": ["…metricCardId…", "…chartCardId…"] }
{ "results": {
    "…metricCardId…": { "value": 56, "trend": { "deltaPct": 12.2, "vs": "yesterday" }, "asOfUtc": "…" },
    "…chartCardId…":  { "error": "unavailable", "asOfUtc": "…" }
} }
```

`POST /admin/homepage/drafts` → 201 `{ "versionId": 44, "versionNo": 44, "status": "Draft", "etag": "…", "config": { … } }`

`PUT /admin/homepage/drafts/44` (header `If-Match: "<etag>"`)
```jsonc
// body: { "title":"May maintenance banner", "config": { /* full ConfigJson */ } }
// 200 { "etag":"…" }  | 400 ProblemDetails | 412 stale ETag
```

`DELETE /admin/homepage/drafts/44` → 204 (no body) | 403 (not author) | 409 (wrong status)

`GET /admin/homepage/drafts/44/diff` → 200
```jsonc
{ "vsVersionNo": 42, "changes": [
   { "role":"Requester", "cardId":"…", "change":"Edited", "header":"Important Announcements",
     "fields":["items[0].bodyHtml","items[0].effectiveToUtc"] },
   { "role":"Admin", "cardId":"…", "change":"Added", "header":"Audit Logs" },
   { "role":"GeneralUser", "cardId":"…", "change":"Reordered" } ] }
```

`POST /admin/homepage/drafts/44/approve` → 200 (or 403 if approver is author/submitter)

---

## 9. Frontend detail

### 9.1 Directory layout
```
frontend/src/
├─ host-integration/        # HostContext, hooks (useHostUser, useHostRoles, useGetAccessToken)
│                           # DevHostProvider (dev only)
├─ api/
│   ├─ client.ts            # apiFetch wrapper; mock/real toggle
│   ├─ homepageApi.ts       # getHomepage, batchCardData, getRoles
│   └─ adminApi.ts          # all admin operations
├─ shared/
│   ├─ types.ts             # TypeScript interfaces (mirrors §4 exactly)
│   ├─ schemas.ts           # Zod schemas mirroring §6
│   ├─ validateConfig.ts    # validateConfig(config) → { ok, errors[] }
│   ├─ sanitize.ts          # sanitizeHtml (DOMPurify), isSafeUrl
│   └─ icons.ts             # ALLOWED_ICON_KEYS Set + isValidIconKey()
├─ features/
│   ├─ homepage/
│   │   ├─ HomepageModule.tsx
│   │   ├─ CardGrid.tsx
│   │   ├─ CardRenderer.tsx
│   │   ├─ CardSkeleton.tsx
│   │   ├─ hooks/
│   │   │   ├─ useHomepage.ts
│   │   │   └─ useCardData.ts
│   │   └─ templates/
│   │       ├─ RichTextCard.tsx
│   │       ├─ LinkListCard.tsx
│   │       ├─ NoticeListCard.tsx
│   │       ├─ TimelineCard.tsx
│   │       ├─ MetricCard.tsx
│   │       ├─ ChartCard.tsx
│   │       └─ ActivityFeedCard.tsx
│   └─ admin/
│       ├─ HomepageAdminModule.tsx     # shell + nav + React Router Routes
│       ├─ Dashboard.tsx
│       ├─ DraftEditor.tsx
│       ├─ ReviewScreen.tsx
│       ├─ RoleSettings.tsx
│       ├─ routes.ts                   # path constants + helpers
│       └─ store/
│           └─ draftSlice.ts           # Redux Toolkit slice (§9.6)
└─ mocks/
    ├─ mockApi.ts           # in-memory implementations of every API function
    └─ mockData.ts          # seed data for mock API
```

### 9.2 Host integration contract (the only thing the host must provide)
The host renders the module and supplies a context value:
```ts
interface HostContextValue {
  user: { id: string; displayName: string };
  roles: string[];                       // user's identity app-roles (RoleKeys)
  getAccessToken: () => Promise<string>; // bearer token for API calls
}
```
- `HostContextProvider` wraps the module and passes this value.
- Hooks: `useHostUser()`, `useHostRoles()`, `useGetAccessToken()` — each calls `useContext(HostContext)` and throws if used outside a provider.
- The module never triggers login or token refresh.
- **Dev:** `DevHostProvider` reads from env vars `VITE_DEV_USER` (user id) and `VITE_DEV_ROLES` (comma-separated role keys, default `"Admin"`), providing a fake context so the module runs without a real identity system.

```ts
// DevHostProvider.tsx
const DEV_USER_ID = import.meta.env.VITE_DEV_USER ?? 'dev-user';
const DEV_ROLES: string[] = (import.meta.env.VITE_DEV_ROLES ?? 'Admin')
  .split(',').map((r) => r.trim()).filter(Boolean);
```

### 9.3 API client — mock/real toggle
`api/client.ts` exports `apiFetch<T>(path, options)`:
- Reads `VITE_API_BASE_URL` for the base URL.
- Reads `VITE_USE_MOCK_API=true|false`.
- When a `getToken` option is provided, calls it and injects `Authorization: Bearer <token>`.
- Parses RFC 7807 ProblemDetails on error (`title` field), surfaces as `Error.message`.
- Returns `undefined` (cast) for 204 responses.

Every API function in `homepageApi.ts` and `adminApi.ts` checks `USE_MOCK` at the top and short-circuits to the corresponding `mock*` function. This means the entire frontend works against `mockApi.ts` with no real backend. To wire real backend: set `VITE_USE_MOCK_API=false`.

```ts
// Pattern for every API function:
export async function getHomepage(userRoles, getToken, roleOverride?) {
  if (USE_MOCK) return mockGetHomepage(userRoles, roleOverride);
  return apiFetch<HomepageResponse>(`/api/homepage${query}`, { getToken });
}
```

### 9.4 Shared TypeScript types (`shared/types.ts`)
Mirror §4 and §8 payloads exactly:

```ts
export type CardType = 'RichText' | 'LinkList' | 'NoticeList' | 'Timeline' | 'Metric' | 'Chart' | 'ActivityFeed';
export type CardSize = 'Small' | 'Medium' | 'Large' | 'FullWidth';
export type ContentModel = 'Prose' | 'Structured' | 'Data';
export type DraftStatus = 'Draft' | 'Submitted' | 'Live' | 'Superseded';
export type DiffChangeType = 'Added' | 'Removed' | 'Edited' | 'Reordered';

export const DATA_PROVIDER_KEYS = [
  'total-requests', 'pending-approvals', 'active-transfers', 'completed-30d',
  'sla-performance', 'escalations', 'team-workload', 'approval-queue',
  'my-open-requests', 'requests-awaiting-action', 'recently-completed', 'transfer-status-summary',
] as const;
export type DataProviderKey = (typeof DATA_PROVIDER_KEYS)[number];

export interface CardItem {
  id: string; order: number; title: string | null; bodyHtml: string | null;
  url: string | null; iconKey: string | null; badgeText: string | null;
  effectiveFromUtc: string | null; effectiveToUtc: string | null;
  extra: Record<string, unknown>;
}

export interface Card {
  id: string; type: CardType; header: string; subtitle: string | null;
  size: CardSize; order: number; enabled: boolean;
  bodyHtml: string | null;       // Prose
  items: CardItem[];             // Structured
  dataProviderKey: DataProviderKey | null;  // Data
  settings: Record<string, unknown>;
}

export interface ConfigJson { schemaVersion: number; roles: Record<string, { cards: Card[] }>; }
export interface HomepageResponse { versionNo: number; role: string; cards: Card[]; }
export interface BatchDataRequest { cardIds: string[]; }
export interface CardTrend { deltaPct: number; vs: string; }
export interface CardDataResult {
  value?: number | string | null; trend?: CardTrend;
  series?: unknown[]; items?: unknown[];
  error?: string; asOfUtc: string;
}
export interface BatchDataResponse { results: Record<string, CardDataResult>; }
export interface RoleMeta {
  roleKey: string; displayName: string; precedence: number;
  isEnabled: boolean; isFallback: boolean;
}
export interface HomepageVersionSummary {
  versionId: number; versionNo: number; title: string | null; status: DraftStatus;
  createdBy: string; createdAtUtc: string;
  submittedBy: string | null; submittedAtUtc: string | null;
  reviewedBy: string | null; reviewedAtUtc: string | null;
  wentLiveAtUtc: string | null;
}
export interface DraftMeta extends HomepageVersionSummary { config: ConfigJson; etag: string; }
export interface DiffChange {
  role: string; cardId: string; change: DiffChangeType; header: string; fields?: string[];
}
export interface DiffResult { vsVersionNo: number; changes: DiffChange[]; }
export interface VersionEvent {
  versionEventId: number; versionId: number;
  eventType: 'Created' | 'Submitted' | 'Approved' | 'Rejected' | 'RolledBack' | 'Discarded';
  performedBy: string; performedAtUtc: string; comments: string | null;
}
export interface AdminStateResponse { live: HomepageVersionSummary | null; inFlight: HomepageVersionSummary | null; }
```

### 9.5 Zod schemas (`shared/schemas.ts`)
Mirror §6 in Zod:
- `guidSchema` — regex `/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i`
- `safeUrlSchema` — refine: parse as URL, allow `http:` or `https:` only
- `cardItemSchema` — validates all item fields; `iconKey` refined against `ALLOWED_ICON_KEYS`
- `richTextCardSchema`, `structuredCardSchema`, `dataCardSchema` — discriminated by `type`; enforce content-model separation
- `cardSchema = z.discriminatedUnion('type', [richText, structured, data])`
- `configJsonSchema = z.object({ schemaVersion: z.literal(1), roles: z.record(z.object({ cards: z.array(cardSchema) })) })`

`shared/validateConfig.ts` wraps `configJsonSchema.parse(config)` and returns `{ ok: boolean; errors: string[] }`. Errors are `ZodError.issues.map(i => (i.path.join('.') ? path + ': ' : '') + i.message)`.

### 9.6 Redux Toolkit draft slice (`features/admin/store/draftSlice.ts`)

This replaces the Zustand store from the reference. Create a Redux Toolkit slice with the following shape:

**State:**
```ts
interface DraftState {
  draftId: number | null;
  workingConfig: ConfigJson | null;
  title: string | null;
  etag: string | null;
  isDirty: boolean;
  isSaving: boolean;
  saveError: string | null;
  lastSavedAt: string | null;   // ISO string (Date is not serializable in Redux)
}
```

**Actions (createSlice reducers):**
```ts
initDraft(state, action: PayloadAction<{ id: number; config: ConfigJson; title: string|null; etag: string }>)
  // Sets draftId, workingConfig, title, etag; clears isDirty, isSaving, saveError

updateConfig(state, action: PayloadAction<ConfigJson>)
  // Sets workingConfig, isDirty=true, saveError=null

updateTitle(state, action: PayloadAction<string>)
  // Sets title, isDirty=true

setSaving(state, action: PayloadAction<boolean>)
  // Sets isSaving

confirmSaved(state, action: PayloadAction<string>)  // etag
  // Sets etag, isDirty=false, isSaving=false, lastSavedAt=new Date().toISOString(), saveError=null

setSaveError(state, action: PayloadAction<string|null>)
  // Sets isSaving=false, saveError

clearDraft(state)
  // Resets all fields to initial values
```

Add a `selectDraft` selector that returns the full slice. The `DraftEditor` component uses `useAppDispatch` and `useAppSelector(selectDraft)` instead of Zustand's `useDraftStore`.

Wire the slice into the app's existing Redux store under the key `"homepageDraft"`.

### 9.7 Allowed icon set (`shared/icons.ts`)
A `Set<string>` of allowed Tabler icon key strings. The reference set (to copy exactly):
```
ti-bell, ti-alert-circle, ti-alert-triangle, ti-info-circle, ti-check-circle, ti-x-circle,
ti-link, ti-external-link, ti-file, ti-file-text, ti-folder, ti-download, ti-upload,
ti-calendar, ti-clock, ti-user, ti-users, ti-settings, ti-home, ti-mail, ti-message,
ti-star, ti-heart, ti-tag, ti-tags, ti-search, ti-filter, ti-sort,
ti-chart-bar, ti-chart-line, ti-chart-pie, ti-trending-up, ti-trending-down,
ti-arrow-up, ti-arrow-down, ti-arrow-right, ti-arrow-left,
ti-chevron-up, ti-chevron-down, ti-chevron-right, ti-chevron-left,
ti-lock, ti-lock-open, ti-shield, ti-shield-check,
ti-database, ti-server, ti-cloud, ti-refresh, ti-edit, ti-trash, ti-plus, ti-minus,
ti-check, ti-x, ti-dots, ti-dots-vertical, ti-list, ti-layout-grid,
ti-timeline, ti-activity, ti-report, ti-clipboard, ti-notes, ti-book,
ti-briefcase, ti-building, ti-world, ti-map-pin, ti-phone, ti-printer
```
Export `isValidIconKey(key: string): boolean` as a helper.

### 9.8 Live homepage — `HomepageModule`

**`useHomepage(roleOverride?)`:**
```ts
// TanStack Query
queryKey: ['homepage', roles.join(','), roleOverride ?? '']
queryFn: () => getHomepage(roles, getToken, roleOverride)
staleTime: 0; refetchOnMount: 'always'; retry: 2
```

**`HomepageModule` structure (adapt styling to project's design language):**
1. **Greeting bar** — "Welcome back, {displayName}!" + subtext.
2. **Top bar** (flex, space-between):
3. **Effective role display** — text label when user holds only one role (non-switcher case).
4. **Loading state** — `<CardGrid />` skeleton placeholders (a mix of small/wide cards).
5. **Error state** — single error box with message.
6. **Empty state** — "No cards configured for your role."
7. **Cards** — `<CardGrid cards={data.cards} />`.

**`CardGrid`** — 4-column CSS Grid with responsive breakpoints:
```ts
const COL_SPAN: Record<CardSize, number> = { Small: 1, Medium: 2, Large: 3, FullWidth: 4 };
// Desktop (>1024px): 4 cols; tablet (≤1024px): 2 cols, capped span at 2; mobile (≤768px): 1 col
// Sort cards by card.order before rendering
```

**`CardRenderer`** — wraps each card in:
- A card shell with header (`card.header`) and optional subtitle (`card.subtitle`)
- A "View all" link affordance for types `NoticeList, LinkList, Timeline, ActivityFeed`
- A `CardErrorBoundary` (class component using `getDerivedStateFromError`) — renders fallback error box on throw
- A `Suspense` loading fallback while the lazy template loads
- `templateRegistry`: a `Partial<Record<CardType, React.LazyExoticComponent>>` mapping each type to a `lazy(() => import('./templates/XxxCard'))`. Unknown type → `MisconfiguredCard` fallback (never throws)

**Templates** (all accept `{ card: Card }` as props):
- `RichTextCard` — renders `card.bodyHtml` via `dangerouslySetInnerHTML` after `sanitizeHtml()`.
- `LinkListCard` — ordered list of `card.items`; each item shows `iconKey` icon + `title` as link (if `url`) or text.
- `NoticeListCard` — list of `card.items` with `badgeText` badge, `bodyHtml` content, optional priority color (from `item.extra.priority`). Filter items where `effectiveToUtc` is in the future (or null) and `effectiveFromUtc` is in the past (or null).
- `TimelineCard` — vertical timeline list; each item shows `title`, `item.extra.date`/`item.extra.version`, `bodyHtml`.
- `MetricCard` — calls `useCardData(card.id)` → shows value + trend indicator. Shows skeleton while loading; shows "data unavailable" on error. Never blocks the card shell render.
- `ChartCard` — calls `useCardData(card.id)` → renders recharts `BarChart|LineChart|PieChart` based on `card.settings.chartType`. Same loading/error handling.
- `ActivityFeedCard` — calls `useCardData(card.id)` → renders a list of activity items.

**`useCardData(cardId)`:**
```ts
// Batched via POST /homepage/data:batch
// TanStack Query: queryKey: ['card-data', cardId]
// Batch multiple card IDs that request data within the same render cycle
// Returns: { data?: CardDataResult; isLoading: boolean; isError: boolean }
```

**`CardSkeleton`** — animated shimmer placeholder (pulse animation) for loading states.

### 9.9 Admin module — `HomepageAdminModule`

Mounts with its own `<Routes>` block. Provides a **nav bar** with:
- Brand label ("Homepage Admin" or equivalent)
- "Dashboard" nav link → `ADMIN_HOME` (index route)
- "Role Settings" nav link → `ADMIN_HOME/roles`
- "View Live" link → the live homepage route (right-aligned)

**Route structure:**
```
ADMIN_HOME/                        → <Dashboard />
ADMIN_HOME/drafts/:id              → <DraftEditor />
ADMIN_HOME/drafts/:id/review       → <ReviewScreen />
ADMIN_HOME/roles                   → <RoleSettings />
ADMIN_HOME/drafts/:id/roles        → redirect to ADMIN_HOME/roles
*                                  → redirect to ADMIN_HOME
```

Path constants in `routes.ts`:
```ts
export const ADMIN_HOME = '/[your-app]/home/admin';  // adapt to project routes
export const adminRolesPath = () => `${ADMIN_HOME}/roles`;
export const adminDraftPath = (id: number) => `${ADMIN_HOME}/drafts/${id}`;
export const adminReviewPath = (id: number) => `${ADMIN_HOME}/drafts/${id}/review`;
```

### 9.10 Admin `Dashboard`
Under the Admininstration tab, in the left sidebar, add a new section: Home Page Configuration
Queries: `getAdminState` (refetchOnMount: 'always') + `getVersions` (refetchOnMount: 'always').

**Layout — two-column card grid (stacks on mobile):**

**Left card — "Live Version":**
- Shows `versionNo`, `title`, "Live" status badge, published-by + date, created-by.
- If no live version: empty message.

**Right card — "In-Flight Changeset":**
- If no in-flight: empty message + "Create New Draft" button.
- If in-flight:
  - Shows `versionNo`, `title`, status badge, author, start date.
  - **If current user is the author:**
    - "Continue Editing" button → `adminDraftPath(id)` (if Draft status)
    - "View Draft" button → `adminDraftPath(id)` (if Submitted status)
    - "Submit for Review" button → `adminReviewPath(id)` (if Draft status)
    - "Review & Approve" button → `adminReviewPath(id)` (if Submitted status)
    - "Discard Draft" button → calls `discardDraft()` with confirmation dialog
  - **If not the author:**
    - Message: "A changeset by {author} is pending review."
    - "Review & Approve" button → `adminReviewPath(id)` (if Submitted status)

**Version history table** (below the cards):
- Columns: Version, Title, Status (badge), Created by, Date, Action
- Action column: "Rollback" button for Superseded versions, only when no in-flight exists
- Rollback calls `rollback(versionId)` → creates draft → navigate to draft editor

### 9.11 Admin `DraftEditor`

Reads draft ID from `useParams<{ id: string }>()`. Initializes Redux draft store via `dispatch(initDraft(...))` when the draft query resolves.

**Read-only mode:** when `draft.status !== 'Draft'` OR `draft.createdBy !== user.id`.
- Shows a banner: "This draft was created by another user" or "This draft is not in Draft status."

**Top bar:**
- Back button → `ADMIN_HOME`
- Title: "Edit Draft v{N}" or "View Draft v{N}"
- Save status indicator: one of `saving | saved | error | dirty` (from `draftSlice.isSaving / isDirty / saveError / lastSavedAt`)
- Action buttons: "Discard Draft" (danger, author-only), "Preview & Review" → review route, "Submit for Review" (disabled while `isDirty` or saving)

**Draft title input** (editable, autosaves):
- On change: `dispatch(updateTitle(value))`

**Role tabs section:**
- Pills/tabs for each role (`GET /roles` + roles in existing config)
- Each pill shows role display name + card count badge
- Active role tab highlighted
- Sorted by `precedence`

**Card list for active role:**
- Ordered list sorted by `card.order`
- Each card row:
  - Up/down reorder buttons (▲/▼); disabled at first/last position
  - Type badge
  - Header text (truncated)
  - Size `<select>` (Small, Medium, Large, FullWidth)
  - Enable/disable toggle (pill switch)
  - Edit button (pencil) → opens `CardEditModal`
  - Delete button → removes card
- Empty state: "No cards for this role. Add one below."

**Add card bar** (below card list):
- Type `<select>` + "Add" button → creates a new card with defaults, appends to list

**Card edit modal:**
- Dialog overlay; click outside to close
- Fields: Header (required), Subtitle (optional)
- Prose (RichText): `RichEditor` (TipTap) for `bodyHtml`
- Data (Metric/Chart/ActivityFeed): data provider `<select>` + chart type `<select>` for Chart
- Structured (LinkList/NoticeList/Timeline): items list with per-item Title, Body HTML (TipTap), URL, Badge text; Add/Remove item buttons
- On "Save Card": applies `sanitizeHtml()` to all `bodyHtml` fields, dispatches `updateConfig`

**TipTap configuration:**
```ts
extensions: [
  StarterKit.configure({ heading: false }),
  Heading.configure({ levels: [3, 4] }),
  Link.configure({ openOnClick: false, autolink: true, validate: (href) => isSafeUrl(href) }),
]
```
Toolbar buttons: **B**, *I*, H3, H4, • List, 1. List, Link, Unlink (when link active).
On update: `onChange(sanitizeHtml(editor.getHTML()))`.

**Autosave (debounced 1000ms):**
- Triggered whenever `isDirty` changes to `true` (watch `isDirty` + `workingConfig` + `title` in useEffect)
- `dispatch(setSaving(true))` → `await saveDraft(...)` → `dispatch(confirmSaved(etag))` or `dispatch(setSaveError(msg))`
- On 412 ETag mismatch: invalidate the draft query to reload

**Submit flow:**
1. Run `validateConfig(workingConfig)` — show validation errors if any
2. `await saveDraft(...)` to persist latest state
3. `await submitDraft(...)` → navigate to `ADMIN_HOME` on success

### 9.12 Admin `ReviewScreen`

Two tabs: "Changes ({count})" and "Preview".

**Draft meta card:**
- Title/versionNo, status badge, created-by + date, submitted-by + date
- **Actions:**
  - "Approve & Publish" (primary) — only when `status === 'Submitted'` and user is **not the author** (the backend enforces segregation; the frontend should also disable/hide this for the author and explain why)
  - "Reject" (danger) — when `status === 'Submitted'`; toggles rejection form below
  - "Discard Draft" (danger) — when user is author and status is Draft or Submitted
  - "Continue Editing" — when user is author and status is Draft

**Rejection form:**
- Required textarea for rejection reason
- "Confirm Rejection" button (disabled until text is entered) → calls `rejectDraft(id, comments)` → navigate to `ADMIN_HOME`

**Diff tab:**
Table: Role | Card | Change type (colored badge: Added=green, Removed=red, Edited=blue, Reordered=yellow) | Affected fields
Empty state: "No changes detected."

**Preview tab:**
- Role selector buttons (from `GET /roles`)
- `CardGrid` rendered from `getPreview(id, userRoles, getToken, previewRole)` — disabled until a role is selected

### 9.13 Admin `RoleSettings`

Table: Role Key | Display Name (text input) | Precedence (number input, min 1) | Enabled (toggle) | Fallback (radio, exactly one allowed) | Save button (appears when row is dirty)

- Validation: display name required; precedence ≥ 1; precedence unique across all roles; only one fallback
- On Save: calls `updateRoleMeta(roleKey, { displayName, precedence, isEnabled, isFallback })`
- "Fallback" column uses `type="radio" name="fallback-role"` — selecting one automatically clears others in local edit state

---

## 10. Local dev & runbook
- Backend config (env/appsettings.Development): `ConnectionStrings:Sql`, `ConnectionStrings:Redis`, `Cache:Provider=InMemory`, `Auth:DevMode=true`, `Providers:UseStub=true`.
- Frontend env (`.env.development`):
  ```
  VITE_API_BASE_URL=https://localhost:5001
  VITE_USE_MOCK_API=true
  VITE_DEV_USER=dev-user
  VITE_DEV_ROLES=Admin,Requester,GeneralUser
  ```
  Set `VITE_USE_MOCK_API=false` to test against real backend.
- Migrations: EF Core code-first; provide `dotnet ef` migration. Do **not** auto-migrate in prod (gate migration execution to Development only).
- **Seed** (idempotent): roles `Admin`/`Requester`/`GeneralUser` (GeneralUser `IsFallback=1`, precedence 1/2/3) and a first **Live** version whose `ConfigJson` contains a representative homepage per role (a NoticeList "Important Announcements", a LinkList "Useful Links", a Timeline "Release Updates", and Metric cards for Requester/Admin views).
- `README.md`: one-command bring-up, how to flip roles in the dev harness.

---

## 11. Testing
- **Domain unit:** `HomepageConfig.Validate` (every §6 rule), `Diff` (Added/Removed/Edited/Reordered), `ResolveFor` (precedence + fallback + multi-role + override), state-machine transitions, segregation guard, discard guard.
- **Application unit:** each handler with fakes (repo, clock, current user, cache).
- **Api integration (Testcontainers SQL Server):** DB invariants hold (cannot insert two Live, two in-flight, self-approve, unreviewed Live); concurrency 412; full workflow happy path (create→save→submit→approve→render reflects change); rollback; discard.
- **Frontend:** component tests for `CardRenderer` registry + fallback, editor interactions (add/reorder/toggle/size/edit), Zod validation, Redux slice reducers and selectors; one Playwright e2e: author→submit→reject→edit→resubmit→approve→live.
- Sanitization tests: malicious `bodyHtml`/`href` stripped on save and render.

---

## 12. Non-functional
- **Security:** save-time + render-time sanitization; no provider URLs exposed to client; JWT validated on every request; CORS limited to host origin; secrets from environment/Key Vault.
- **Accessibility:** card landmarks; editor (incl. reorder) fully keyboard-operable; WCAG AA color/contrast.
- **Performance:** live render = one cached read + one batched data call; content paints before data; data failures isolated per card.
- **Observability:** structured logging; correlation id per request; log workflow events and provider failures; `/health` endpoint.

---

## 13. Build order (milestones with acceptance)
1. **Foundation** — monorepo structure, EF migrations for §3, seed, dev auth, Redux store wiring. *Accept:* migrate + seed succeeds; DB invariants verified by tests; draft Redux slice unit tests pass.
2. **Backend read path** — `GET /roles`, `GET /homepage` (role resolution + fallback), `POST /data:batch` with stub providers. *Accept:* resolves correct role; batch isolates failures.
3. **Live homepage FE** — host-integration + dev harness, registry + 7 templates, render + data batch + error boundaries + responsive grid. *Accept:* seeded homepage renders per role; flipping dev roles changes the page.
4. **Backend admin workflow** — drafts CRUD + discard, state machine, invariants, diff, preview, versions/events, rollback, cache invalidation. *Accept:* full workflow integration test green; segregation/concurrency/discard enforced.
5. **Admin FE** — dashboard, draft editor (templates/edit/reorder/size/toggle, TipTap, autosave), review screen (diff + preview + approve/reject/discard). *Accept:* e2e author→review→publish passes.
6. **Roles metadata + switcher** — role settings screen + multi-role switcher on live homepage.
7. **Hardening** — full §6 validation + sanitization, §11 tests, §12 non-functionals.
8. **Real providers** — replace stubs with the supplied contract (§7.4); flip `Providers:UseStub=false`.

---

## 14. External input pending
The **data-provider contract** (how to call the existing application API/DB for each key in `DataProviders.Keys` — endpoints/queries, auth, request/response shapes, per-user scoping) will be supplied separately. Build everything behind `ICardDataProvider` (§7.4) with flagged stubs until then. This is the only part of the system not fully specified here.

---

## Appendix A — Admin API functions reference (complete)

```ts
// homepageApi.ts
getHomepage(userRoles, getToken, roleOverride?) → HomepageResponse
batchCardData(req: BatchDataRequest, getToken) → BatchDataResponse
getRoles(getToken) → RoleMeta[]

// adminApi.ts
getAdminState(getToken) → AdminStateResponse
createDraft(getToken, userId) → DraftMeta
getDraft(id, getToken) → DraftMeta
saveDraft(id, title, config, etag, getToken, userId) → { etag: string }
submitDraft(id, getToken, userId) → void
approveDraft(id, getToken, userId) → void
rejectDraft(id, comments, getToken, userId) → void
discardDraft(id, getToken, userId) → void          // DELETE /api/admin/homepage/drafts/{id}
getDiff(id, getToken) → DiffResult
getPreview(id, userRoles, getToken, roleOverride?) → HomepageResponse
getVersions(getToken) → HomepageVersionSummary[]
getVersionEvents(versionId, getToken) → VersionEvent[]
rollback(fromVersionId, getToken, userId) → DraftMeta
updateRoleMeta(roleKey, updates, getToken) → RoleMeta
```

## Appendix B — Draft editor card operations (all dispatch `updateConfig`)

```ts
patchCards(roleKey, newCards)   // normalizes order (1..n), updates config
moveCard(idx, -1 | 1)          // swaps adjacent cards
toggleCard(cardId)              // flips card.enabled
resizeCard(cardId, size)        // sets card.size
deleteCard(cardId)              // removes from array
saveEditedCard(updated)         // sanitizes bodyHtml + items[].bodyHtml, replaces card
addCard()                       // creates new card with type-appropriate defaults:
  // bodyHtml: '<p>Enter content here.</p>' for RichText, null otherwise
  // dataProviderKey: 'total-requests' for Data types, null otherwise
  // settings: { chartType: 'bar' } for Chart, {} otherwise
  // size: 'Medium'; order: cards.length + 1; enabled: true; items: []
```
