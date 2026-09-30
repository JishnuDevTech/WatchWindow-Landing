// Copies the deployable site into public/ so Vercel has an output folder.
const fs = require("fs");
fs.rmSync("public", { recursive: true, force: true });
fs.mkdirSync("public");
for (const f of ["index.html", "privacy.html", "terms.html", "assets", "src/script.js"]) {
  fs.cpSync(f, "public/" + f, { recursive: true });
}