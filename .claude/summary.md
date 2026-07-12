## Goal
Translate the entire website (public pages + admin panel) to support French, Arabic, and English, and sync service templates between index.html and app.html.

## Constraints & Preferences
- Default language = French (`fr`)
- All `data-i18n` keys used in any HTML file must exist in `i18n.js` for all 3 languages
- Admin panel should have the same navbar style as the public site
- Admin panel must support language switching via a lang selector in the header
- Only static HTML and JS strings are being translated — backend data (user names, service names from DB) not affected

## Progress
### Done
- **Added missing i18n keys** (15 service option keys + 7 more) to FR/AR/EN in `js/i18n.js`
- **Synced all service fields in `app.html`** to match `index.html`'s modalServiceFields
- **Replaced `app.html` navbar** with index.html design (single header, lang-selector inline, auth.js-managed actions, floating scroll-to-top button)
- **Removed top-bar** from `contact.html`, `fonctionnement.html`, `faq.html` — moved lang-selector into nav
- **Added admin translation keys** (~200 keys per language) to `js/i18n.js` under `admin.*` namespace
- **Added `data-i18n` attributes** to `admin/index.html` (sidebar, dashboard, tables, filters, settings)
- **Added `data-i18n` attributes** to `admin/login.html` (form elements)
- **Added i18n.js script** + lang selector to both admin pages
- **Updated `admin/js/admin.js`**: replaced ALL hardcoded user-visible strings with `I18n.t()` calls via `__()` helper:
  - All toast messages (~40 calls) use `admin.toast.*` keys
  - All empty states (~10 locations) use `admin.empty.*` keys
  - All confirmation dialogs (user delete, request delete, quotation delete) use `admin.toast.*` keys
  - All modal titles (edit user, edit request, edit service, user profile, upload devis) use `admin.modal.*` keys
  - All form labels in edit modals (fullName, email, school, phone, role, status, priority, contactName, contactEmail, quoteAmount, notes, nameFR/EN/AR, sortOrder, descriptionFR) use `admin.modal.*` keys
  - All detail-view labels in user profile and request detail modals use `admin.modal.*`, `admin.table.*`, or `admin.dashboard.*` keys
  - All devis upload UI text (selectDevis, pdfHint, browse, uploading, uploadDevis, viewCurrent, currentDevis, uploadedDocs) use `admin.modal.*` keys
  - All button labels (Cancel, Save, Save Changes, Download) use `admin.modal.*` keys
  - Theme toggle message, CSV export messages, status chart labels also use I18n keys
- **Added missing i18n keys** to `admin.toast` (loadError, loadUsersFailed) and `admin.table` (lastLogin, never, description, quotationDoc, download) for all 3 languages

### In Progress
- (none - all planned work complete)

### Blocked
- (none)

## Key Decisions
- Admin i18n keys placed under a single `admin.*` namespace nested inside each language object in `i18n.js`
- Lang selector placed inline in the nav for both public pages and admin header — no separate top-bar
- All JS string replacements use `__('admin.xxx.yyy')` helper with I18n.t() fallback (returns last key segment if I18n unavailable)
- All devis-related UI keys (selectDevis, pdfHint, browse, uploading, uploadDevis, viewCurrent, currentDevis, uploadedDocs) stored under `admin.modal.*` alongside other modal labels

## Next Steps
- Test all 3 languages on all pages (public + admin) to verify translations render correctly
- Run `database/migrations/008_pdf_bucket.sql` if not already done (file upload bucket setup from previous session)

## Critical Context
- `I18n.t()` is available globally after `i18n.js` loads — `I18n.t('admin.toast.userUpdated')` returns the translated string
- `data-i18n` replaces element `innerHTML`; `data-i18n-placeholder` replaces `placeholder`; `data-i18n-title` replaces `title`
- Admin pages load `../js/i18n.js` relative to the `admin/` folder
- The `applyTranslations()` function runs on DOMContentLoaded and on every `setLanguage()` call
- `__()` helper in admin.js safely wraps `I18n.t()` with fallback to key's last segment (e.g., `admin.toast.loadDashboardFailed` → `loadDashboardFailed`)

## Relevant Files
- `js/i18n.js`: All translation keys (~200 admin keys, options keys, admin.table/toast additions)
- `admin/index.html`: `data-i18n` on all translatable elements, lang selector, i18n.js script
- `admin/login.html`: `data-i18n` on form elements, i18n.js script
- `admin/js/admin.js`: All hardcoded user-visible strings replaced with `__()` calls
- `app.html`: Synced service fields, navbar replaced with index.html style
- `contact.html`, `fonctionnement.html`, `faq.html`: Top-bar removed, lang selector moved into nav
