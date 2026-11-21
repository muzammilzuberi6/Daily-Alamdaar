# Daily Alamdaar - E-Paper Website

Bilingual (English / Urdu) e-paper site for Daily Alamdaar, Islamabad.

## Run
```
npm install
npm start
```
Site: http://localhost:3000  ·  Admin: http://localhost:3000/admin

## Pages
`/` home · `/category/<section>` (pakistan, islamabad, world, business, sports, entertainment, opinion) · `/article/<id>` ·
`/search` · `/epaper` · `/archive` · `/about` · `/contact` · `/rss.xml` · `/sitemap.xml` · `/admin`

## Publishing news
Admin → News stories → choose section and language (Urdu / English), write headline, summary and story, add a photo,
tick "Top story" or "Breaking" if needed → Publish. Set a future date/time to schedule a story.

## Daily e-paper upload
Admin → Editions → pick date → either select all 8 page images at once, or use "Upload full PDF"
→ "Upload & publish". The PDF is converted to pages automatically.

## Settings (`.env`)
| Key | Meaning |
|---|---|
| `ADMIN_USER`, `ADMIN_PASSWORD` | Admin login (change the password from Admin → Password) |
| `SESSION_SECRET` | Random string used to sign login cookies |
| `SITE_URL` | Public address, e.g. `https://dailyalamdaar.com` (for share previews and sitemap) |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `MAIL_TO` | Optional. Forwards contact-form messages to your email. For Gmail: `smtp.gmail.com`, port `465`, your address, and a Google **App Password** |

Without SMTP, contact messages are still saved in Admin → Messages.

## Data
`data/` (editions, settings, messages) and `uploads/` (page images) hold everything. Back these two folders up.
