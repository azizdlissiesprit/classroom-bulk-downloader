# Classroom Bulk Downloader

A small Chrome/Edge extension that downloads files from the **page you currently have open**
in Google Classroom (or a Google Drive folder) — with a checklist so you choose exactly
what gets downloaded. Files go straight to your Downloads folder. **No extra tabs or popup
windows.**

## Why
Other downloaders either open a window per file (spamming your PC) or grab *everything* with
no choice. This one scans whatever attachments are on the current page, shows them with
checkboxes, and downloads only what you tick — in one click.

## Install (load unpacked)
1. Open `chrome://extensions` (or `edge://extensions`).
2. Turn on **Developer mode** (top-right).
3. Click **Load unpacked** and select this folder (`DriveDownloader`).
4. The blue ⬇ icon appears in your toolbar. Pin it for easy access.

> Works in Chrome and Edge (any Chromium browser). Firefox uses a slightly different API —
> see *Firefox* below.

## Use
1. Open the Classroom page you want — a class **stream**, the **Classwork** tab, or an
   **assignment/announcement** with attachments. (An open assignment shows the most files.)
2. Click the extension icon. It scans the page and lists every file it finds.
3. Tick/untick files, or use **Select all** and the **Filter** box to narrow the list.
4. Click **Download N files**. Done.

You must be signed in to the Google account that has access to the files — the extension
reuses your existing browser session, so it only downloads what you can already open.

## What it handles
| Attachment | What you get |
|---|---|
| Uploaded files (PDF, DOCX, MP4, PPTX, ZIP, images, …) | The original file, downloaded as-is |
| Google **Docs** | Exported as `.docx` |
| Google **Sheets** | Exported as `.xlsx` |
| Google **Slides** | Exported as `.pptx` |
| Google **Drawings** | Exported as `.png` |

## How it works
- `scanner.js` is injected into the active tab only when you click the icon. It collects
  Drive/Docs file IDs from the links on the page (and Drive folder rows).
- `popup.js` renders the checklist.
- `background.js` downloads each picked file with the browser's `downloads` API, using your
  session cookies, with a small stagger between requests. Nothing opens a window.

## Limitations / notes
- It only sees what's **rendered on the current page**. On the Classwork list, open an item
  (or scroll so attachments load) before scanning, then hit the ⟳ rescan button.
- Very large uploaded files may occasionally hit Drive's "can't scan for viruses" page; the
  download URL already passes `confirm=t` to skip it in most cases.
- Native Google Docs/Sheets/Slides can't be downloaded in their original form (there isn't
  one) — they're exported to Office formats as shown above.

## Firefox
Firefox supports Manifest V3 but uses the `browser.*` namespace and `scripting` differs
slightly. The quickest path is to keep `chrome.*` (Firefox aliases it) and load via
`about:debugging` → *This Firefox* → *Load Temporary Add-on*.
