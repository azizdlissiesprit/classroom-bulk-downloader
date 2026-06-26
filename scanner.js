// Runs inside the page when the popup asks for a scan.
// Whatever this returns at the end is what the popup gets back.
(() => {
  const results = new Map();

  const cleanTitle = (t) => (t || "").replace(/\s+/g, " ").trim().slice(0, 200);

  // confident = found as a real link/row, so tick it by default.
  // not confident = only turned up while scanning the raw markup, leave it unticked.
  const add = (id, kind, title, confident) => {
    if (!id) return;
    const existing = results.get(id);
    if (existing) {
      if ((!existing.title || existing.title.length < 2) && title) existing.title = title;
      if (confident) existing.confident = true;
      return;
    }
    results.set(id, { id, kind, title: title || "", confident: Boolean(confident) });
  };

  // One id pattern per Google file type, used both on links and on the raw html.
  const STRONG = [
    { src: /\/document\/d\/([a-zA-Z0-9_-]{20,})/, sweep: /\/document\/d\/([a-zA-Z0-9_-]{20,})/g, kind: "gdoc" },
    { src: /\/spreadsheets\/d\/([a-zA-Z0-9_-]{20,})/, sweep: /\/spreadsheets\/d\/([a-zA-Z0-9_-]{20,})/g, kind: "gsheet" },
    { src: /\/presentation\/d\/([a-zA-Z0-9_-]{20,})/, sweep: /\/presentation\/d\/([a-zA-Z0-9_-]{20,})/g, kind: "gslides" },
    { src: /\/drawings\/d\/([a-zA-Z0-9_-]{20,})/, sweep: /\/drawings\/d\/([a-zA-Z0-9_-]{20,})/g, kind: "gdrawing" },
    { src: /\/file\/d\/([a-zA-Z0-9_-]{20,})/, sweep: /\/file\/d\/([a-zA-Z0-9_-]{20,})/g, kind: "file" },
  ];
  // Older open?id= / uc?id= style. Only trust it on actual <a> elements.
  const LOOSE = { re: /[?&]id=([a-zA-Z0-9_-]{20,})/, kind: "file" };

  // Links first, since they carry the file name.
  for (const a of document.querySelectorAll("a[href]")) {
    const href = a.href || "";
    const title = cleanTitle(
      a.getAttribute("aria-label") || a.textContent || a.getAttribute("title")
    );
    let matched = false;
    for (const p of STRONG) {
      const m = href.match(p.src);
      if (m) {
        add(m[1], p.kind, title, true);
        matched = true;
        break;
      }
    }
    if (!matched) {
      const m = href.match(LOOSE.re);
      if (m) add(m[1], LOOSE.kind, title, true);
    }
  }

  // In a Drive folder, files are rows with a data-id rather than links.
  if (location.hostname.includes("drive.google.com")) {
    for (const row of document.querySelectorAll("[data-id]")) {
      const id = row.getAttribute("data-id");
      if (id && /^[a-zA-Z0-9_-]{20,}$/.test(id)) {
        add(id, "file", cleanTitle(row.getAttribute("aria-label") || row.textContent), true);
      }
    }
  }

  // Catch ids hiding in data-* attributes or inline json.
  const html = document.body ? document.body.innerHTML : "";
  for (const p of STRONG) {
    let m;
    while ((m = p.sweep.exec(html)) !== null) {
      add(m[1], p.kind, "", false);
    }
  }

  // The swept ids have no name yet, so dig around for one near them.
  for (const file of results.values()) {
    if (file.title) continue;
    let label = "";
    try {
      const owner = [...document.querySelectorAll("*")].find((el) =>
        [...el.attributes].some((attr) => attr.value && attr.value.includes(file.id))
      );
      for (let node = owner, i = 0; node && i < 5; node = node.parentElement, i++) {
        const l = node.getAttribute && (node.getAttribute("aria-label") || node.getAttribute("title"));
        if (l && l.trim().length > 1) { label = l; break; }
      }
      if (!label && owner) label = owner.textContent || "";
    } catch (_) {}
    file.title = cleanTitle(label) || `Drive file ${file.id.slice(-6)}`;
  }

  return [...results.values()];
})();
