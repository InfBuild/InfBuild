const fs = require("fs");
const path = require("path");

const content = `function initializeVersion(Version) { return new Version(new Date(${new Date().getTime()})); }`;
fs.writeFileSync(path.join(__dirname, `../dist/ver.js`), content, { encoding: "utf8" });
