This file gives concise, project-specific guidance for AI coding agents working in the mit-robinson-dk repo.

- Big picture
  - This is a single-page Angular application (Angular 20) with a small, feature-based layout under `src/app`.
  - Routes are declared in `src/app/app.routes.ts`. The app root component is `src/app/app.ts`.
  - UI uses Angular Material and a lightweight carousel (`ngx-owl-carousel-o`). Firebase support is included via `@angular/fire` in dependencies but configuration lives in the `src/environments` files.

- Key directories & files to inspect
  - `src/app/features/*` — feature pages (home, projects, admin, contact, about, project-details). Look here for UI templates and local component logic.
  - `src/app/core/components/*` — shared components (e.g., `navbar`). Example: `src/app/core/components/navbar/navbar.ts` and `navbar.html`.
  - `src/app/core/services/projects.ts` — in-memory projects store and basic CRUD API used by admin and listing pages. Prefer updating this for demo/test data.
  - `public/` — static assets are served from here; `angular.json` includes this folder as an asset input.

- Project-specific patterns and conventions (do not change without asking)
  - Nonstandard template iteration: many HTML templates use a custom `@for (item of items; track ...) { ... }` block (e.g. `src/app/features/admin/admin.html`, `src/app/features/projects/projects.html`, `src/app/core/components/navbar/navbar.html`). This is NOT the Angular `*ngFor` syntax. When modifying templates, preserve this pattern unless the change is explicitly about converting template syntax.
  - Components declare `imports` in the `@Component` decorator and reference `templateUrl` / `styleUrl` (singular) — see `src/app/app.ts` and `src/app/core/components/navbar/navbar.ts`. Follow the existing decorator shape when creating new components to match the code style.
  - Small stateful services are provided application-wide using `providedIn: 'root'` (see `ProjectsService`). Use these services for cross-component data flow rather than adding ad-hoc global variables.
  - Styling is SCSS and component-local files sit next to templates (`*.scss` next to `*.html`/`*.ts`).

- Build / test / dev commands (observable from `package.json`)
  - Start dev server: `npm start` (runs `ng serve`, default host localhost:4200)
  - Build production: `npm run build` (runs `ng build`)
  - Run unit tests: `npm test` (Karma + Jasmine)

- Integration points & external deps to be aware of
  - Firebase: `@angular/fire` is installed. Check `src/environments/environment*.ts` for API keys/config before changing Firestore/auth code.
  - Angular Material modules are imported per-component in the `imports` array of the component decorator (no single shared Material module). When adding Material elements, import the exact module(s) in that component's decorator.
  - Carousel CSS is included via `angular.json` (see `node_modules/ngx-owl-carousel-o/lib/styles/prebuilt-themes/owl.carousel.min.css`). Keep this when adding carousel usages.

- Tests and spec files
  - Unit test files live next to components (e.g., `*.spec.ts`). The project uses Karma/Jasmine (see `devDependencies` in `package.json`). Keep tests focused on small component logic and service behavior.

- Quick editing checklist for AI edits
  - Before editing HTML templates, search for `@for (` and preserve the surrounding block structure.
  - When adding Material UI controls, add the module to the component `imports` array (example: `MatToolbarModule` in `navbar.ts`).
  - If you change runtime behavior that requires external config (Firebase), update the `src/environments/*` files and note missing credentials — do not commit secrets.
  - Use `ProjectsService` for adding/updating/deleting demo projects rather than directly editing templates.

If anything here is unclear or you'd like me to expand a section (for example: Firebase wiring, exact template preprocessor semantics, or adding a shared Material module), tell me which part to expand and I will iterate.
