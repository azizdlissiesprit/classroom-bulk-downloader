# Store Listing Kit — copy/paste into Edge Add-ons (and Chrome)

Everything below is ready to paste into the submission forms. Fields are labeled to match
what the Microsoft Partner Center (Edge) asks for. Chrome's dashboard uses almost the same
fields.

---

## Name (Display name)
```
Bulk Downloader for Google Classroom
```

## Short description (≤ 132 characters)
```
Download files from the page you have open in Google Classroom in one click — pick exactly what you want, no extra tabs.
```

## Category
```
Productivity
```

## Detailed description
```
Bulk Downloader for Google Classroom lets you grab the files from the Classroom page you
currently have open — in a single click — while choosing exactly which ones to download.

No more opening a new tab or window for every attachment, and no more downloading the
entire class when you only wanted three files.

HOW IT WORKS
1. Open the Classroom assignment, announcement, or material that has the files.
2. Click the extension icon. It instantly lists every attachment it finds.
3. Tick the files you want (or use "Select all" and the search filter).
4. Click Download. Files go straight to your Downloads folder — quietly, no pop-up windows.

FEATURES
• One-click scan of the page you are currently viewing.
• Pick and choose: check or uncheck individual files before downloading.
• Color-coded file-type badges (PDF, DOCX, XLSX, PPTX, MP4, images, and more).
• Search box to filter long file lists by name.
• Works with uploaded files (PDF, Word, Excel, PowerPoint, video, images, ZIP) and with
  native Google Docs, Sheets, Slides, and Drawings (exported to Office/PNG formats).
• Also works on Google Drive folder pages.

PRIVACY
Everything happens locally in your browser. The extension does not collect, store, or send
any of your data anywhere, and it only reads a page when you click its icon. Downloads use
your existing Google sign-in, so you only ever get files you already have access to.

This extension is an independent tool and is not affiliated with or endorsed by Google.
```

## Search terms / keywords (Edge allows up to 7)
```
google classroom
download
bulk download
classroom files
pdf downloader
attachments
google drive
```

---

## Privacy & permissions section

### Privacy policy URL (required)
Host the PRIVACY.md file somewhere public and paste the link here. Easiest free options:
- Publish a Google Doc: paste the privacy text into a Google Doc → File → Share →
  Publish to web → copy the link.
- Or GitHub Pages / a public GitHub repo file.

### Does this extension collect user data?
```
No
```

### Permission justifications (paste if asked per-permission)

activeTab
```
Used to read the list of file attachments on the page the user is actively viewing, only at
the moment the user clicks the extension icon.
```

scripting
```
Used to inject a small scanning script into the active tab (only on user click) to find the
file links present on the current Google Classroom or Drive page.
```

downloads
```
Used to save the files the user selects into their browser's Downloads folder.
```

host permissions (classroom.google.com, drive.google.com, docs.google.com, drive.usercontent.google.com)
```
Required to detect file attachments on Google Classroom/Drive pages and to download the
selected files from Google's file-serving domains using the user's existing session.
```

---

## Listing assets you still need to upload
- Store logo: 300 x 300 PNG  → see store-assets/store-logo-300.png (generated for you)
- At least one screenshot: 1280 x 800 (or 640 x 480) PNG/JPG → capture the popup open on a
  Classroom page (instructions are in the chat).
- Extension package: the ZIP produced by package.ps1.
