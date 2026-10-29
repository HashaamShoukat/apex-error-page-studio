// Builds the Modern Error page template and its option groups from _src:
//   node _src/build.mjs
// - template.apx.txt (skeleton) + modern-error.css (+ art.mjs illustrations) -> shared-components/.../page-templates/modern-error.apx
// - the option list below -> template options in the template and template-option-groups.apx
// A template field holds at most 32767 bytes, so CSS that does not fit css.inline continues in a <style> in the header.
import fs from "node:fs";
import { ART, enc } from "./art.mjs";

const ROOT = new URL("..", import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1");
const THEME = ROOT + "shared-components/themes/universal-theme/";
const IND = "            ";
const bytes = s => Buffer.byteLength(s, "utf8");
const WAVE_EDGE = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 120" preserveAspectRatio="none"><path d="M0 0H1440V44C1320 84 1200 112 1020 108S700 40 520 36 200 96 0 70Z"/></svg>`;

const GROUPS = [
    { id: "me-design", name: "Design", seq: 5, nul: "Classic", help: "The overall look. Each design brings its own shapes and colours; Accent Color, Color Scheme and Background still change it." },
    { id: "me-art", name: "Illustration", seq: 10, nul: "None", help: "The line illustration above the message, drawn in the accent colours: a page and magnifier (Not Found), shield and lock (Access Denied), hourglass (Session Expired), cone and wrench (Maintenance), unplugged plug (Server Error), cloud (Offline). APEX's own error page shows the plug when none is chosen; Hide removes it there too." },
    { id: "me-accent", name: "Accent Color", seq: 20, nul: "Design Default / Theme Color" },
    { id: "me-scheme", name: "Color Scheme", seq: 30, nul: "Light" },
    { id: "me-background", name: "Background", seq: 40, nul: "Glow", help: "Image uses the picture in the Background Image slot." },
    { id: "me-width", name: "Width", seq: 50, nul: "Regular", advanced: true }
];
const OPTIONS = [
    ["design", "me-design", [["bignum", "Big Number"], ["split", "Split Panel"], ["neon", "Neon"], ["glitch", "Glitch"], ["terminal", "Terminal"], ["editorial", "Editorial"],
                             ["soft", "Soft UI"], ["bold", "Bold"], ["space", "Space"], ["blueprint", "Blueprint"], ["wave", "Wave"]], "me-Design--"],
    ["art", "me-art", [["notfound", "Not Found"], ["denied", "Access Denied"], ["expired", "Session Expired"],
                       ["maintenance", "Maintenance"], ["server", "Server Error"], ["offline", "Offline"], ["none", "Hide"]], "me-Art--"],
    ["accent", "me-accent", [["ocean", "Ocean"], ["indigo", "Indigo"], ["violet", "Violet"], ["emerald", "Emerald"], ["rose", "Rose"], ["amber", "Amber"], ["slate", "Slate"],
                             ["wine", "Wine"], ["tangerine", "Tangerine"], ["cyan", "Cyan"]], "me-Accent--"],
    ["scheme", "me-scheme", [["dark", "Dark"], ["auto", "Follow Device Setting"]], "me-Scheme--"],
    ["bg", "me-background", [["mesh", "Mesh Gradient"], ["gradient", "Bold Gradient"], ["dots", "Dot Grid"], ["grid", "Grid Lines"], ["rings", "Rings"], ["image", "Image"], ["solid", "Solid"]], "me-Bg--"],
    ["width", "me-width", [["wide", "Wide"]], "me-Width--"]
];
const SINGLE = [
    ["anim-entrance", "Entrance Animation", "me-Anim--entrance", 100],
    ["anim-art", "Animated Illustration", "me-Anim--art", 110, "The illustration floats; Neon flickers and Glitch jitters."],
    ["fx-copy", "Copy Error Details Button", "me-Fx--copy", 120, "On APEX's error page: a button that copies the message, details, page address and time - ready for a support ticket."],
    ["fx-online", "Reload When Back Online", "me-Fx--online", 130, "The page reloads by itself when the device gets its connection back (for an offline page)."]
];

let opts = "";
for (const [prefix, group, list, css] of OPTIONS) {
    const g = GROUPS.find(x => x.id === group);
    list.forEach(([id, name], i) => {
        opts += `\n    templateOption ${prefix}-${id} (\n        name: ${name}\n        group: @page/${group}\n        sequence: ${(i + 1) * 10}\n        appearance {\n            cssClasses: ${css}${id}\n        }\n` +
                (g.advanced ? `        advanced {\n            isAdvancedOption: true\n        }\n` : "") + `    )\n`;
    });
}
for (const [id, name, css, seq, help] of SINGLE) {
    opts += `\n    templateOption ${id} (\n        name: ${name}\n        sequence: ${seq}\n        appearance {\n            cssClasses: ${css}\n        }\n` +
            (help ? `        help {\n            helpText: ${help}\n        }\n` : "") + `    )\n`;
}
const groups = GROUPS.map(g => `templateOptionGroup ${g.id} (\n    templateType: page\n    name: ${g.name}\n    sequence: ${g.seq}\n    settings {\n        nullText: ${g.nul}\n    }\n` +
    (g.help ? `    help {\n        helpText: ${g.help}\n    }\n` : "") + (g.advanced ? `    advanced {\n        isAdvancedOption: true\n    }\n` : "") + `)\n`).join("\n");

// CSS with the artwork
let css = fs.readFileSync(ROOT + "_src/modern-error.css", "utf8").replace(/\r\n/g, "\n").trimEnd();
for (const [k, v] of Object.entries(ART)) css = css.split(`__ART_${k.toUpperCase()}__`).join(enc(v));
css = css.split("__WAVE_EDGE__").join(enc(WAVE_EDGE));
const left = css.match(/__[A-Z_]+__/);
if (left) throw new Error("unreplaced placeholder " + left[0]);
const lines = css.split("\n").map(l => (l ? IND + l : l));

// split at section comments when one field is not enough
const LIMIT = 31000;
let part1 = lines, part2 = [];
if (bytes(lines.join("\n")) > LIMIT) {
    let size = 0, cut = 0;
    for (let i = 0; i < lines.length; i++) {
        size += bytes(lines[i]) + 1;
        if (/^\s*\/\* /.test(lines[i]) && size < LIMIT) cut = i;
        if (size > LIMIT) break;
    }
    part1 = lines.slice(0, cut);
    part2 = lines.slice(cut);
}
let t = fs.readFileSync(ROOT + "_src/template.apx.txt", "utf8").replace(/\r\n/g, "\n");
t = t.replace(IND + "__CSS__", part1.join("\n"));
t = t.replace("              __HEADER_STYLE__", part2.length ? IND + '<style id="me-css-2">\n' + part2.join("\n") + "\n" + IND + "</style>" : "");
t = t.replace("__OPTIONS__", opts);
fs.writeFileSync(THEME + "page-templates/modern-error.apx", t);
fs.writeFileSync(THEME + "template-option-groups.apx", groups);

const field = re => bytes((re.exec(t) || ["", ""])[1]);
console.log("css bytes", bytes(css), "| css field", field(/```css\n([\s\S]*?)\n            ```/), "| header field", field(/header:\n            ```html\n([\s\S]*?)\n            ```/));
