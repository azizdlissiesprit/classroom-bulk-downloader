const listEl = document.getElementById("list");
const toolbarEl = document.getElementById("toolbar");
const messageEl = document.getElementById("message");
const countEl = document.getElementById("count");
const selectAllEl = document.getElementById("selectAll");
const filterEl = document.getElementById("filter");
const downloadBtn = document.getElementById("download");
const rescanBtn = document.getElementById("rescan");

// Badge colours per file type. Native Google docs use their export type.
const NATIVE_STYLES = {
  gdoc: { label: "DOCX", bg: "#1a73e8" },
  gsheet: { label: "XLSX", bg: "#188038" },
  gslides: { label: "PPTX", bg: "#e8710a" },
  gdrawing: { label: "PNG", bg: "#0097a7" },
};

const TYPE_STYLES = {
  // documents
  pdf: { label: "PDF", bg: "#d93025" },
  doc: { label: "DOC", bg: "#1a73e8" },
  docx: { label: "DOCX", bg: "#1a73e8" },
  odt: { label: "ODT", bg: "#1a73e8" },
  txt: { label: "TXT", bg: "#5f6368" },
  rtf: { label: "RTF", bg: "#5f6368" },
  md: { label: "MD", bg: "#5f6368" },
  // spreadsheets
  xls: { label: "XLS", bg: "#188038" },
  xlsx: { label: "XLSX", bg: "#188038" },
  csv: { label: "CSV", bg: "#188038" },
  ods: { label: "ODS", bg: "#188038" },
  // presentations
  ppt: { label: "PPT", bg: "#e8710a" },
  pptx: { label: "PPTX", bg: "#e8710a" },
  odp: { label: "ODP", bg: "#e8710a" },
  // video
  mp4: { label: "MP4", bg: "#8430ce" },
  mov: { label: "MOV", bg: "#8430ce" },
  mkv: { label: "MKV", bg: "#8430ce" },
  avi: { label: "AVI", bg: "#8430ce" },
  webm: { label: "WEBM", bg: "#8430ce" },
  wmv: { label: "WMV", bg: "#8430ce" },
  // audio
  mp3: { label: "MP3", bg: "#00897b" },
  wav: { label: "WAV", bg: "#00897b" },
  m4a: { label: "M4A", bg: "#00897b" },
  aac: { label: "AAC", bg: "#00897b" },
  ogg: { label: "OGG", bg: "#00897b" },
  // images
  jpg: { label: "JPG", bg: "#0097a7" },
  jpeg: { label: "JPEG", bg: "#0097a7" },
  png: { label: "PNG", bg: "#0097a7" },
  gif: { label: "GIF", bg: "#0097a7" },
  webp: { label: "WEBP", bg: "#0097a7" },
  bmp: { label: "BMP", bg: "#0097a7" },
  svg: { label: "SVG", bg: "#0097a7" },
  heic: { label: "HEIC", bg: "#0097a7" },
  // archives
  zip: { label: "ZIP", bg: "#795548" },
  rar: { label: "RAR", bg: "#795548" },
  "7z": { label: "7Z", bg: "#795548" },
  tar: { label: "TAR", bg: "#795548" },
  gz: { label: "GZ", bg: "#795548" },
  // code
  js: { label: "JS", bg: "#616161" },
  py: { label: "PY", bg: "#616161" },
  java: { label: "JAVA", bg: "#616161" },
  c: { label: "C", bg: "#616161" },
  cpp: { label: "CPP", bg: "#616161" },
  html: { label: "HTML", bg: "#616161" },
};

const DEFAULT_STYLE = { label: "FILE", bg: "#5f6368" };

// Grab the extension from the filename, preferring one we recognise.
function extensionOf(title) {
  const t = (title || "").toLowerCase();
  const matches = [...t.matchAll(/\.([a-z0-9]{1,5})(?=$|[^a-z0-9])/g)].map((m) => m[1]);
  for (const ext of matches) if (TYPE_STYLES[ext]) return ext;
  return matches.length ? matches[matches.length - 1] : "";
}

function badgeStyle(file) {
  if (NATIVE_STYLES[file.kind]) return NATIVE_STYLES[file.kind];
  const ext = extensionOf(file.title);
  if (!ext) return DEFAULT_STYLE;
  return TYPE_STYLES[ext] || { label: ext.toUpperCase().slice(0, 4), bg: "#5f6368" };
}

let files = [];

function setMessage(text, isError = false) {
  messageEl.textContent = text || "";
  messageEl.classList.toggle("error", Boolean(isError));
}

function render() {
  listEl.innerHTML = "";
  for (const [i, file] of files.entries()) {
    const li = document.createElement("li");
    li.className = "row";
    if (file.confident === false) li.classList.add("uncertain");
    li.title = file.confident === false ? "Found in page data — verify before downloading" : "";
    li.dataset.index = String(i);

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = file.confident !== false; // uncertain finds start unticked
    checkbox.className = "pick";

    const style = badgeStyle(file);
    const badge = document.createElement("span");
    badge.className = "badge";
    badge.textContent = style.label;
    badge.style.background = style.bg;

    const name = document.createElement("span");
    name.className = "name";
    name.textContent = file.title || file.id;
    name.title = file.title || file.id;

    li.append(checkbox, badge, name);

    // click anywhere on the row to toggle it
    li.addEventListener("click", (e) => {
      if (e.target !== checkbox) checkbox.checked = !checkbox.checked;
      updateState();
    });
    checkbox.addEventListener("change", updateState);

    listEl.append(li);
  }
  toolbarEl.classList.remove("hidden");
  applyFilter();
  updateState();
}

function visibleRows() {
  return [...listEl.querySelectorAll("li.row:not(.hidden)")];
}

function selectedFiles() {
  return visibleRows()
    .filter((row) => row.querySelector(".pick").checked)
    .map((row) => files[Number(row.dataset.index)]);
}

function updateState() {
  const picked = selectedFiles().length;
  const visible = visibleRows().length;
  countEl.textContent = `${picked} of ${visible} selected`;
  downloadBtn.disabled = picked === 0;
  downloadBtn.textContent = picked ? `Download ${picked} file${picked > 1 ? "s" : ""}` : "Download selected";
  selectAllEl.checked = visible > 0 && picked === visible;
}

function applyFilter() {
  const q = filterEl.value.trim().toLowerCase();
  for (const row of listEl.querySelectorAll("li.row")) {
    const file = files[Number(row.dataset.index)];
    const hit = !q || (file.title || "").toLowerCase().includes(q);
    row.classList.toggle("hidden", !hit);
  }
  updateState();
}

selectAllEl.addEventListener("change", () => {
  for (const row of visibleRows()) row.querySelector(".pick").checked = selectAllEl.checked;
  updateState();
});

filterEl.addEventListener("input", applyFilter);

downloadBtn.addEventListener("click", async () => {
  const picked = selectedFiles();
  if (!picked.length) return;
  downloadBtn.disabled = true;
  setMessage(`Starting ${picked.length} download${picked.length > 1 ? "s" : ""}…`);
  try {
    const result = await chrome.runtime.sendMessage({ type: "download", files: picked });
    const ok = result?.ok ?? 0;
    const fail = result?.fail ?? 0;
    setMessage(
      fail ? `Downloaded ${ok}, ${fail} failed (check access/sign-in).` : `Done — ${ok} file(s) downloading.`,
      Boolean(fail)
    );
  } catch (e) {
    setMessage("Download failed: " + (e?.message || e), true);
  } finally {
    downloadBtn.disabled = false;
  }
});

rescanBtn.addEventListener("click", scan);

async function scan() {
  setMessage("Scanning page…");
  toolbarEl.classList.add("hidden");
  listEl.innerHTML = "";
  files = [];

  let tab;
  try {
    [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  } catch {
    /* ignore */
  }

  if (!tab || !/^https?:/.test(tab.url || "")) {
    setMessage("Open a Google Classroom (or Drive) page, then click the icon.", true);
    return;
  }

  try {
    const injection = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ["scanner.js"],
    });
    files = injection?.[0]?.result || [];
  } catch (e) {
    setMessage("Can't read this page. Make sure you're on classroom.google.com.", true);
    return;
  }

  if (!files.length) {
    setMessage("No files found on this page. Open an assignment/post with attachments, then rescan.", true);
    return;
  }

  setMessage("");
  render();
}

scan();
