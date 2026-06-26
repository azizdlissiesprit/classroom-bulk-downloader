// Does the downloading. The popup sends over the files the user picked and we
// pass each one to chrome.downloads, which saves it without opening any tabs.

const EXPORTS = {
  gdoc: { url: (id) => `https://docs.google.com/document/d/${id}/export?format=docx`, ext: "docx" },
  gsheet: { url: (id) => `https://docs.google.com/spreadsheets/d/${id}/export?format=xlsx`, ext: "xlsx" },
  gslides: { url: (id) => `https://docs.google.com/presentation/d/${id}/export?format=pptx`, ext: "pptx" },
  gdrawing: { url: (id) => `https://docs.google.com/drawings/d/${id}/export/png`, ext: "png" },
};

function sanitize(name) {
  return (name || "").replace(/[<>:"/\\|?*\x00-\x1f]/g, "_").replace(/\.+$/, "").trim();
}

function ensureExt(name, ext) {
  const clean = sanitize(name) || "download";
  return clean.toLowerCase().endsWith("." + ext) ? clean : `${clean}.${ext}`;
}

function buildRequest(file) {
  const exp = EXPORTS[file.kind];
  if (exp) {
    // A native Google doc only lives in the cloud, so export it to a real file.
    return { url: exp.url(file.id), filename: ensureExt(file.title, exp.ext) };
  }
  // Plain uploaded file. confirm=t gets past the big-file scan warning, and Drive
  // already sends the real filename, so we leave filename unset.
  return {
    url: `https://drive.usercontent.google.com/download?id=${file.id}&export=download&confirm=t`,
  };
}

function startDownload(req) {
  return new Promise((resolve) => {
    chrome.downloads.download({ ...req, conflictAction: "uniquify" }, (id) => {
      resolve(!(chrome.runtime.lastError || id === undefined));
    });
  });
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function downloadAll(files) {
  let ok = 0;
  let fail = 0;
  for (const file of files) {
    const success = await startDownload(buildRequest(file));
    success ? ok++ : fail++;
    await sleep(200); // small gap so they don't all fire at once
  }
  return { ok, fail };
}

chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  if (msg && msg.type === "download" && Array.isArray(msg.files)) {
    downloadAll(msg.files).then(sendResponse);
    return true; // reply comes once the downloads have started
  }
});
