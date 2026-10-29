// Writes the Gallery (1), Designer (2) and How to Use (3) pages: node _src/studio-pages.mjs
import fs from "node:fs";
import { TYPES } from "./pages.mjs";
const ROOT = new URL("..", import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1");
const ind = (s, n) => s.split("\n").map(l => (l ? " ".repeat(n) + l : l)).join("\n");

// ---------- presets (gallery) ----------
export const PRESETS = [
    ["bignum-404", "Big Number", "not-found", "notfound light", "me-Design--bignum me-Art--notfound me-Accent--indigo"],
    ["classic-404", "Classic", "not-found", "notfound light", "me-Art--notfound me-Accent--violet"],
    ["split-403", "Split Panel", "access-denied", "denied light", "me-Design--split me-Art--denied me-Accent--wine"],
    ["neon-404", "Neon", "not-found", "notfound dark", "me-Design--neon me-Art--notfound"],
    ["glitch-500", "Glitch", "server-error", "server dark", "me-Design--glitch me-Art--server"],
    ["terminal-500", "Terminal", "server-error", "server dark", "me-Design--terminal me-Art--server"],
    ["editorial-401", "Editorial", "session-expired", "expired light", "me-Design--editorial me-Art--expired"],
    ["soft-404", "Soft UI", "not-found", "notfound light", "me-Design--soft me-Art--notfound"],
    ["bold-404", "Bold", "not-found", "notfound light", "me-Design--bold me-Art--notfound"],
    ["space-offline", "Space", "offline", "offline dark", "me-Design--space me-Art--offline"],
    ["blueprint-503", "Blueprint", "maintenance", "maintenance dark", "me-Design--blueprint me-Art--maintenance"],
    ["wave-404", "Wave", "not-found", "notfound light", "me-Design--wave me-Art--notfound me-Accent--ocean"],
    ["grid-401", "Session Expired - Dark", "session-expired", "expired dark", "me-Art--expired me-Scheme--dark me-Accent--cyan me-Bg--grid"],
    ["split-503", "Maintenance - Split", "maintenance", "maintenance light", "me-Design--split me-Art--maintenance me-Accent--tangerine"],
    ["bignum-403", "Access Denied - Big Number", "access-denied", "denied light", "me-Design--bignum me-Art--denied me-Accent--rose me-Bg--dots"],
    ["neon-503", "Maintenance - Neon", "maintenance", "maintenance dark", "me-Design--neon me-Art--maintenance me-Accent--rose"],
    ["soft-offline", "Offline - Soft UI Dark", "offline", "offline dark", "me-Design--soft me-Scheme--dark me-Art--offline me-Accent--cyan"],
    ["bold-500", "Server Error - Bold", "server-error", "server light", "me-Design--bold me-Art--server"],
    ["wave-401", "Session Expired - Wave", "session-expired", "expired light", "me-Design--wave me-Art--expired me-Accent--emerald"],
    ["mesh-404", "Mesh", "not-found", "notfound light", "me-Art--notfound me-Bg--mesh me-Accent--violet"],
    ["apex-classic", "APEX Error - Classic", "apex", "apex light", "me-Accent--indigo"],
    ["apex-bignum", "APEX Error - Big Number", "apex", "apex light", "me-Design--bignum me-Accent--violet"],
    ["apex-split", "APEX Error - Split Panel", "apex", "apex light", "me-Design--split me-Accent--ocean"],
    ["apex-terminal", "APEX Error - Terminal", "apex", "apex dark", "me-Design--terminal"],
    ["apex-space", "APEX Error - Space", "apex", "apex dark", "me-Design--space"],
    ["apex-editorial", "APEX Error - Editorial", "apex", "apex light", "me-Design--editorial"]
].map(([id, name, type, tags, cls]) => ({ id, name, type, tags, cls }));
const DEFAULTS = "me-Anim--entrance me-Anim--art me-Fx--copy me-Fx--online";

const pageHead = (no, name, alias, title) => `page ${no} (
    name: ${name}
    alias: ${alias}
    title: ${title}
    appearance {
        pageTemplate: @/standard
        templateOptions: #DEFAULT#
    }
    navigation {
        cursorFocus: doNotFocusCursor
    }`;
const pageSec = `    security {
        authentication: public
        pageAccessProtection: argumentsMustHaveChecksum
        formAutoComplete: false
    }`;
const crumb = name => `    region breadcrumb (
        name: ${name}
        type: breadcrumb
        source {
            breadcrumb: @breadcrumb
        }
        layout {
            sequence: 10
            slot: breadcrumbBar
        }
        appearance {
            template: @/title-bar
            templateOptions: [
                #DEFAULT#
                t-BreadcrumbRegion--useBreadcrumbTitle
            ]
        }
        componentAppearance {
            breadcrumbTemplate: @/breadcrumb
            templateOptions: #DEFAULT#
        }
    )`;
const js = (fn, onload) => `    javaScript {
        functionAndGlobalVariableDeclaration:
            \`\`\`javascript-browser
${ind(fn, 12)}
            \`\`\`
        executeWhenPageLoads:
            \`\`\`javascript-browser
${ind(onload, 12)}
            \`\`\`
    }`;
const cssBlock = css => `    css {
        inline:
            \`\`\`css
${ind(css, 12)}
            \`\`\`
    }`;
const staticRegion = (id, name, seq, html, template = "@/blank-with-attributes", extra = "") => `    region ${id} (
        name: ${name}
        type: staticContent
        source {
            htmlCode:
                \`\`\`html
${ind(html, 16)}
                \`\`\`
        }
        layout {
            sequence: ${seq}
            slot: body${extra}
        }
        appearance {
            template: ${template}
            templateOptions: #DEFAULT#
        }
    )`;
// page URLs: friendly aliases; APEX's own error page = page 900 with request BOOM
const typePages = Object.fromEntries(TYPES.map(t => [t.alias.toLowerCase(), t]));

// ---------- 1 Gallery ----------
const galleryFn = `// Ready-made looks of the Modern Error template; thumbnails are app files gallery/<id>.jpg (made from the real pages).
var ES_PRESETS = ${JSON.stringify(PRESETS.map(p => ({ id: p.id, name: p.name, type: p.type, tags: p.tags, cls: p.cls })), null, 0).replace(/\},\{/g, "},\n    {")};
var ES_DEFAULTS = "${DEFAULTS}";
var ES_TYPE_NAMES = { "not-found": "Not Found", "access-denied": "Access Denied", "session-expired": "Session Expired", maintenance: "Maintenance", "server-error": "Server Error", offline: "Offline", apex: "APEX Error Page" };`;
const galleryLoad = `(function ($) {
    var box = document.getElementById("es-gallery"), files = box.getAttribute("data-files"),
        app = box.getAttribute("data-app"), session = box.getAttribute("data-session"), designer = box.getAttribute("data-designer");
    function esc(s) { return apex.util.escapeHTML(String(s)); }
    function pageUrl(p) { return p.type === "apex" ? "f?p=" + app + ":ERROR-TEST:" + session + ":BOOM" : "f?p=" + app + ":" + p.type.toUpperCase() + ":" + session; }
    function hash(p) { return "#me=" + encodeURIComponent((ES_DEFAULTS + " " + p.cls).trim()) + "&type=" + p.type; }
    box.innerHTML = ES_PRESETS.map(function (p) {
        return '<article class="es-Card" data-tags="' + esc(p.tags) + '">' +
            '<a class="es-Card-shot" href="' + esc(designer + hash(p)) + '" aria-label="' + esc("Customize " + p.name) + '"><img src="' + esc(files + "gallery/" + p.id + ".jpg") + '" alt="" loading="lazy" width="640" height="400"></a>' +
            '<div class="es-Card-body"><h3 class="es-Card-title">' + esc(p.name) + '</h3><span class="es-Card-type">' + esc(ES_TYPE_NAMES[p.type]) + '</span>' +
            '<div class="es-Card-actions"><a class="t-Button t-Button--small t-Button--hot" href="' + esc(designer + hash(p)) + '"><span class="t-Button-label">Customize</span></a>' +
            '<a class="t-Button t-Button--small" target="_blank" rel="noopener" href="' + esc(pageUrl(p) + hash(p)) + '"><span class="t-Button-label">Full Screen</span></a></div></div></article>';
    }).join("");
    $(document).on("click", ".es-Filter button", function () {
        var f = this.getAttribute("data-f");
        $(".es-Filter button").attr("aria-pressed", "false");
        this.setAttribute("aria-pressed", "true");
        $(".es-Card").each(function () { this.hidden = !!f && (" " + this.getAttribute("data-tags") + " ").indexOf(" " + f + " ") < 0; });
    });
})(apex.jQuery);`;
const galleryCss = `.es-Hero { padding: clamp(1.5rem, 4vw, 3rem) clamp(1rem, 3vw, 2rem); border-radius: 18px; color: #ffffff;
           background: radial-gradient(circle at 88% 20%, rgba(255,255,255,.16), transparent 40%), linear-gradient(120deg, #0f172a, #1e3a8a 50%, #0e7490); }
.es-Hero h1 { margin: 0 0 .5rem; font-size: clamp(1.75rem, 1.2rem + 2vw, 2.75rem); font-weight: 800; letter-spacing: -.03em; line-height: 1.1; }
.es-Hero p { max-width: 48rem; margin: 0 0 1.25rem; font-size: 1.0625rem; line-height: 1.6; opacity: .92; }
.es-Hero .t-Button { margin: 0 .5rem .5rem 0; }
.es-Hero .t-Button--hot { --a-button-background-color: #ffffff; --a-button-text-color: #1e3a8a; --a-button-hover-background-color: #e0f2fe; --a-button-hover-text-color: #1e3a8a; }
.es-Hero .es-Ghost { --a-button-background-color: transparent; --a-button-text-color: #ffffff; --a-button-hover-background-color: rgba(255,255,255,.14); --a-button-hover-text-color: #ffffff; border: 1px solid rgba(255,255,255,.6); }
.es-Filter { display: flex; flex-wrap: wrap; gap: .5rem; margin: 1.5rem 0 1rem; }
.es-Filter button { padding: .375rem .95rem; border-radius: 999px; border: 1px solid var(--ut-component-border-color, #d0d5dd); background: var(--ut-component-background-color, #fff); color: inherit; font: inherit; font-size: .875rem; cursor: pointer; }
.es-Filter button[aria-pressed="true"] { background: #1e3a8a; border-color: #1e3a8a; color: #ffffff; }
.es-Grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(min(100%, 19rem), 1fr)); gap: 1.25rem; }
.es-Card { display: flex; flex-direction: column; overflow: hidden; border-radius: 14px; border: 1px solid var(--ut-component-border-color, #e4e7ec); background: var(--ut-component-background-color, #fff);
           box-shadow: 0 1px 2px rgba(16,24,40,.05); transition: box-shadow .2s ease, transform .2s ease; }
.es-Card:hover { transform: translateY(-2px); box-shadow: 0 18px 40px -18px rgba(16,24,40,.35); }
.es-Card[hidden] { display: none; }
.es-Card-shot { display: block; aspect-ratio: 16 / 10; overflow: hidden; background: #eef0f4; }
.es-Card-shot img { display: block; width: 100%; height: 100%; object-fit: cover; transition: transform .4s ease; }
.es-Card:hover .es-Card-shot img { transform: scale(1.03); }
.es-Card-body { display: flex; flex-direction: column; gap: .5rem; padding: .875rem 1rem 1rem; }
.es-Card-title { margin: 0; font-size: 1rem; font-weight: 700; }
.es-Card-type { align-self: flex-start; padding: .1rem .55rem; border-radius: 999px; background: rgba(30,58,138,.1); color: #1e3a8a; font-size: .75rem; font-weight: 600; }
.es-Card-actions { display: flex; gap: .5rem; margin-top: .25rem; }
.es-Card-actions .t-Button { flex: 1; justify-content: center; }`;
const galleryHero = `<div class="es-Hero">
  <h1>Error pages for Oracle APEX</h1>
  <p>One page template for APEX's own error page and for your 404, access denied, session expired, maintenance and offline pages - 12 designs, line illustrations, light and dark. Every look is a template option. Pick one, fine-tune it in the Designer, copy the template into your app.</p>
  <a class="t-Button t-Button--hot" href="f?p=&APP_ID.:DESIGNER:&APP_SESSION."><span class="t-Button-label">Open the Designer</span></a>
  <a class="t-Button es-Ghost" href="f?p=&APP_ID.:HOW-TO-USE:&APP_SESSION."><span class="t-Button-label">How to use it</span></a>
</div>
<div class="es-Filter" role="group" aria-label="Filter">
  <button type="button" data-f="" aria-pressed="true">All</button>
  <button type="button" data-f="apex" aria-pressed="false">APEX error page</button>
  <button type="button" data-f="notfound" aria-pressed="false">Not found</button>
  <button type="button" data-f="denied" aria-pressed="false">Access denied</button>
  <button type="button" data-f="expired" aria-pressed="false">Session expired</button>
  <button type="button" data-f="maintenance" aria-pressed="false">Maintenance</button>
  <button type="button" data-f="server" aria-pressed="false">Server error</button>
  <button type="button" data-f="offline" aria-pressed="false">Offline</button>
  <button type="button" data-f="dark" aria-pressed="false">Dark</button>
</div>`;
const gallery = [pageHead(1, "Gallery", "HOME", "Error Page Studio - Gallery"), js(galleryFn, galleryLoad), cssBlock(galleryCss), pageSec, "",
    staticRegion("hero", "Error Page Studio", 10, galleryHero), "",
    staticRegion("gallery", "Gallery", 20, `<div class="es-Grid" id="es-gallery" data-files="#APP_FILES#" data-app="&APP_ID." data-session="&APP_SESSION." data-designer="f?p=&APP_ID.:DESIGNER:&APP_SESSION."></div>`),
    "", ")", ""].join("\n");
fs.writeFileSync(ROOT + "pages/p00001-home.apx", gallery);

// ---------- 2 Designer ----------
const snippets = Object.fromEntries(TYPES.map(t => [t.alias.toLowerCase(), t.html]));
const arts = Object.fromEntries(TYPES.map(t => [t.alias.toLowerCase(), "me-Art--" + t.art]));
const designerLoad = `// Designer: every choice is a Modern Error template option (a body class). The preview iframe shows the real page;
// the classes travel in its URL hash (#me=...). APEX's own error page is page 900 with request BOOM.
(function ($) {
    var SNIPPETS = ${JSON.stringify(snippets)};
    var TYPE_ART = ${JSON.stringify(arts)};
    var SELECTS = [
        { item: "P2_DESIGN", group: "Design" }, { item: "P2_ART", group: "Illustration" }, { item: "P2_ACCENT", group: "Accent Color" },
        { item: "P2_SCHEME", group: "Color Scheme" }, { item: "P2_BACKGROUND", group: "Background" }, { item: "P2_WIDTH", group: "Width" }
    ];
    var SWITCHES = [
        { item: "P2_ANIM_ENTRANCE", css: "me-Anim--entrance", label: "Entrance Animation", isDefault: true },
        { item: "P2_ANIM_ART", css: "me-Anim--art", label: "Animated Illustration", isDefault: true },
        { item: "P2_COPY", css: "me-Fx--copy", label: "Copy Error Details Button", isDefault: true },
        { item: "P2_ONLINE", css: "me-Fx--online", label: "Reload When Back Online", isDefault: true }
    ];
    var frame = document.getElementById("esd-frame"), app = frame.getAttribute("data-app"), session = frame.getAttribute("data-session");
    function esc(s) { return apex.util.escapeHTML(String(s)); }
    function pageUrl(type) { return type === "apex" ? "f?p=" + app + ":ERROR-TEST:" + session + ":BOOM" : "f?p=" + app + ":" + type.toUpperCase() + ":" + session; }

    // a look passed from the Gallery: #me=<classes>&type=<page>
    (function fromHash() {
        var m = /[#&]me=([^&]*)/.exec(location.hash), t = /[#&]type=([\\w-]+)/.exec(location.hash);
        if (t && $("#P2_TYPE option[value='" + t[1] + "']").length) { apex.item("P2_TYPE").setValue(t[1], null, true); }
        if (!m) { return; }
        var cls = decodeURIComponent(m[1]).split(/\\s+/);
        SELECTS.forEach(function (s) {
            var hit = $("#" + s.item + " option").filter(function () { return this.value && cls.indexOf(this.value) >= 0; }).first();
            apex.item(s.item).setValue(hit.length ? hit.val() : "", null, true);
        });
        SWITCHES.forEach(function (s) { apex.item(s.item).setValue(cls.indexOf(s.css) >= 0 ? "Y" : "N", null, true); });
    })();

    function chosen() {
        var type = $v("P2_TYPE"), cls = [], extra = [], rows = [], allDefaults = true;
        SELECTS.forEach(function (s) {
            var v = $v(s.item), text = $("#" + s.item + " option:selected").text();
            if (s.item === "P2_ART" && !v && type !== "apex") { v = TYPE_ART[type]; text = $("#P2_ART option[value='" + v + "']").text() + " (matches the page)"; }
            if (v) { cls.push(v); extra.push(v); }
            rows.push({ group: s.group, option: text, isDefault: !v });
        });
        SWITCHES.forEach(function (s) {
            var on = $v(s.item) === "Y";
            if (on) { cls.push(s.css); }
            if (s.isDefault && !on) { allDefaults = false; }
            if (on && !s.isDefault) { extra.push(s.css); }
            rows.push({ group: s.label, option: on ? "On" : "Off" });
        });
        return { type: type, cls: cls, rows: rows, list: allDefaults ? ["#DEFAULT#"].concat(extra) : cls, all: cls };
    }

    function render() {
        var c = chosen(), want = pageUrl(c.type), hash = "#me=" + encodeURIComponent(c.cls.join(" "));
        if ((frame.getAttribute("src") || "").split("#")[0] !== want) { frame.setAttribute("src", want + hash); }
        else { try { frame.contentWindow.location.hash = hash; } catch (e) { frame.setAttribute("src", want + hash); } }
        $("#esd-summary").html('<dl class="esd-List">' + c.rows.map(function (r) {
            return "<dt>" + esc(r.group) + "</dt><dd" + (r.isDefault ? ' class="is-default"' : "") + ">" + esc(r.option) + "</dd>";
        }).join("") + "</dl>");
        var apexPage = c.type === "apex";
        $("#esd-code").text(apexPage
            ? "-- Modern Error template > Default Template Options (Shared Components > Templates)\\ntemplateOptions {\\n    default: [\\n" + c.all.map(function (x) { return "        " + x + "\\n"; }).join("") + "    ]\\n}"
            : "appearance {\\n    pageTemplate: @modern-error\\n    templateOptions: [\\n" + c.list.map(function (x) { return "        " + x + "\\n"; }).join("") + "    ]\\n}");
        $("#esd-where").html(apexPage
            ? "APEX's own error page uses the template's <strong>Default Template Options</strong>: open Shared Components &gt; Templates &gt; Modern Error and tick these."
            : "On your public error page: Page Template <strong>Modern Error</strong> and these <strong>Template Options</strong>. Put the text below in a Static Content region (Blank with Attributes) in the Content Body slot.");
        $("#esd-snippet").text(apexPage ? "" : SNIPPETS[c.type] || "");
        $("#esd-snippet-box").toggle(!apexPage);
    }

    $(SELECTS.concat(SWITCHES).map(function (s) { return "#" + s.item; }).concat(["#P2_TYPE"]).join(",")).on("change", render);
    $("#P2_DEVICE").on("change", function () { $("#esd-stage").attr("data-device", $v("P2_DEVICE")); });
    $(document).on("click", ".js-esd-copy", function () {
        var t = $(this).attr("data-target");
        navigator.clipboard.writeText($("#" + t).text()).then(function () { apex.message.showPageSuccess("Copied."); });
    });
    $(document).on("click", ".js-esd-open", function () { window.open(pageUrl($v("P2_TYPE")) + "#me=" + encodeURIComponent(chosen().cls.join(" ")), "_blank"); });
    render();
})(apex.jQuery);`;
const designerCss = `.esd-Stage { display: flex; justify-content: center; align-items: center; height: min(80vh, 760px); min-height: 520px; overflow: hidden; border-radius: 12px;
             border: 1px solid var(--ut-component-border-color, #ddd); background: repeating-conic-gradient(rgba(0,0,0,.035) 0 25%, transparent 0 50%) 0 0 / 24px 24px; }
.esd-Stage iframe { display: block; width: 100%; height: 100%; border: 0; background: #fff; transition: width .3s ease, border-radius .3s ease; }
.esd-Stage[data-device="TABLET"], .esd-Stage[data-device="PHONE"] { padding: 16px 0; }
.esd-Stage[data-device="TABLET"] iframe { width: 820px; max-width: calc(100% - 32px); border-radius: 20px; box-shadow: 0 0 0 12px #1f2329, 0 24px 48px -12px rgba(0,0,0,.45); }
.esd-Stage[data-device="PHONE"] iframe { width: 390px; max-width: calc(100% - 32px); border-radius: 28px; box-shadow: 0 0 0 10px #1f2329, 0 24px 48px -12px rgba(0,0,0,.45); }
.esd-List { display: grid; grid-template-columns: auto 1fr; gap: .375rem 1rem; margin: 0 0 1rem; font-size: .875rem; }
.esd-List dt { opacity: .7; }
.esd-List dd { margin: 0; font-weight: 600; }
.esd-List dd.is-default::after { content: " (default)"; font-weight: 400; opacity: .6; }
.esd-Code { margin: 0 0 1rem; padding: .875rem 1rem; overflow-x: auto; border-radius: 8px; background: #1f2329; color: #e6edf3; font-size: .8125rem; line-height: 1.5; white-space: pre-wrap; }
.esd-Where { margin: 0 0 .75rem; padding: .625rem .875rem; border-radius: 8px; background: rgba(30,58,138,.08); font-size: .8125rem; line-height: 1.5; }
.esd-H { margin: 1rem 0 .5rem; font-size: .875rem; font-weight: 700; }
@media (max-width: 640px) { .esd-Stage { height: 72vh; min-height: 460px; } }`;
const sel = (name, label, seq, values, nul, def, region = "options") => `    pageItem ${name} (
        type: selectList
        label {
            label: ${label}
            alignment: left
        }
        lov {
            type: staticValues
            staticValues: STATIC2:${values}${nul === false ? "\n            displayNullValue: false" : `\n            nullDisplayValue: ${nul}`}
        }
        layout {
            sequence: ${seq}
            region: @${region}
            slot: regionBody
            alignment: left
        }
        appearance {
            template: @/optional-floating
            templateOptions: #DEFAULT#
        }${def ? `
        default {
            type: static
            staticValue: ${def}
        }` : ""}
        sessionState {
            storage: request
        }
    )`;
const sw = (name, label, seq, def, newRow) => `    pageItem ${name} (
        type: switch
        label {
            label: ${label}
            alignment: left
        }
        layout {
            sequence: ${seq}
            region: @options
            slot: regionBody
            alignment: left${newRow ? "" : "\n            startNewRow: false"}
        }
        appearance {
            template: @/optional-floating
            templateOptions: #DEFAULT#
        }
        default {
            type: static
            staticValue: ${def}
        }
        sessionState {
            storage: request
        }
    )`;
const designer = [pageHead(2, "Designer", "DESIGNER", "Error Page Studio - Designer"),
`    javaScript {
        executeWhenPageLoads:
            \`\`\`javascript-browser
${ind(designerLoad, 12)}
            \`\`\`
    }`, cssBlock(designerCss), pageSec, "", crumb("Designer"), "",
`    region options (
        name: Template Options
        type: staticContent
        layout {
            sequence: 20
            slot: body
            columnSpan: 4
        }
        appearance {
            template: @/standard
            templateOptions: #DEFAULT#
        }
    )`, "",
`    region preview (
        name: Live Preview
        type: staticContent
        source {
            htmlCode: <div class="esd-Stage" id="esd-stage" data-device="DESKTOP"><iframe id="esd-frame" title="Error page preview" data-app="&APP_ID." data-session="&APP_SESSION."></iframe></div>
        }
        layout {
            sequence: 30
            slot: body
            startNewRow: false
            columnSpan: 8
        }
        appearance {
            template: @/standard
            templateOptions: [
                #DEFAULT#
                t-Region--noPadding
            ]
        }
    )`, "",
`    region summary (
        name: Your Choice
        type: staticContent
        source {
            htmlCode:
                \`\`\`html
                <p class="esd-Where" id="esd-where"></p>
                <div id="esd-summary"></div>
                <pre class="esd-Code" id="esd-code"></pre>
                <button type="button" class="t-Button t-Button--small t-Button--iconLeft js-esd-copy" data-target="esd-code"><span class="t-Icon fa fa-copy" aria-hidden="true"></span><span class="t-Button-label">Copy Options</span></button>
                <div id="esd-snippet-box">
                  <p class="esd-H">Region content</p>
                  <pre class="esd-Code" id="esd-snippet"></pre>
                  <button type="button" class="t-Button t-Button--small t-Button--iconLeft js-esd-copy" data-target="esd-snippet"><span class="t-Icon fa fa-copy" aria-hidden="true"></span><span class="t-Button-label">Copy HTML</span></button>
                </div>
                \`\`\`
        }
        layout {
            sequence: 10
            parentRegion: @options
            slot: subRegions
        }
        appearance {
            template: @/content-block
            templateOptions: [
                #DEFAULT#
                t-ContentBlock--h3
            ]
        }
    )`, "",
    sel("P2_TYPE", "Page", 1, "Not Found (404);not-found,Access Denied (403);access-denied,Session Expired;session-expired,Maintenance (503);maintenance,Server Error (500);server-error,Offline;offline,APEX Error Page;apex", false, "not-found"), "",
    sel("P2_DESIGN", "Design", 5, "Big Number;me-Design--bignum,Split Panel;me-Design--split,Neon;me-Design--neon,Glitch;me-Design--glitch,Terminal;me-Design--terminal,Editorial;me-Design--editorial,Soft UI;me-Design--soft,Bold;me-Design--bold,Space;me-Design--space,Blueprint;me-Design--blueprint,Wave;me-Design--wave", "Classic", "me-Design--bignum"), "",
    sel("P2_ART", "Illustration", 10, "Not Found;me-Art--notfound,Access Denied;me-Art--denied,Session Expired;me-Art--expired,Maintenance;me-Art--maintenance,Server Error;me-Art--server,Offline;me-Art--offline,Hide;me-Art--none", "Matches the Page", ""), "",
    sel("P2_ACCENT", "Accent Color", 20, "Ocean;me-Accent--ocean,Indigo;me-Accent--indigo,Violet;me-Accent--violet,Emerald;me-Accent--emerald,Rose;me-Accent--rose,Amber;me-Accent--amber,Slate;me-Accent--slate,Wine;me-Accent--wine,Tangerine;me-Accent--tangerine,Cyan;me-Accent--cyan", "Design Default / Theme Color", "me-Accent--indigo"), "",
    sel("P2_SCHEME", "Color Scheme", 30, "Dark;me-Scheme--dark,Follow Device Setting;me-Scheme--auto", "Light", ""), "",
    sel("P2_BACKGROUND", "Background", 40, "Mesh Gradient;me-Bg--mesh,Bold Gradient;me-Bg--gradient,Dot Grid;me-Bg--dots,Grid Lines;me-Bg--grid,Rings;me-Bg--rings,Solid;me-Bg--solid", "Design Default / Glow", ""), "",
    sel("P2_WIDTH", "Width", 50, "Wide;me-Width--wide", "Regular", ""), "",
    sw("P2_ANIM_ENTRANCE", "Entrance Animation", 90, "Y", true), "",
    sw("P2_ANIM_ART", "Animated Illustration", 100, "Y", false), "",
    sw("P2_COPY", "Copy Error Details Button", 110, "Y", true), "",
    sw("P2_ONLINE", "Reload When Back Online", 120, "Y", false), "",
`    pageItem P2_DEVICE (
        type: radioGroup
        label {
            label: Preview On
            alignment: left
        }
        settings {
            noOfCols: 3
        }
        lov {
            type: staticValues
            staticValues: STATIC2:Desktop;DESKTOP,Tablet;TABLET,Phone;PHONE
            displayNullValue: false
        }
        layout {
            sequence: 10
            region: @preview
            slot: edit
        }
        appearance {
            template: @/hidden
            templateOptions: [
                #DEFAULT#
                t-Form-fieldContainer--radioButtonGroup
            ]
        }
        default {
            type: static
            staticValue: DESKTOP
        }
        sessionState {
            storage: request
        }
    )`, "",
`    button open-full (
        buttonName: OPEN_FULL
        label: Open Full Page
        layout {
            sequence: 20
            region: @preview
            slot: edit
        }
        appearance {
            buttonTemplate: @/text-with-icon
            templateOptions: [
                #DEFAULT#
                t-Button--iconLeft
            ]
            cssClasses: js-esd-open
            icon: fa-external-link
        }
        behavior {
            action: definedByDynamicAction
        }
    )`, "", ")", ""].join("\n");
fs.writeFileSync(ROOT + "pages/p00002-designer.apx", designer);

// ---------- 3 How to Use ----------
const howCss = `.es-Doc { max-width: 60rem; line-height: 1.7; }
.es-Doc h3 { margin: 1.75rem 0 .5rem; font-size: 1.125rem; }
.es-Doc h3:first-child { margin-top: 0; }
.es-Doc ol, .es-Doc ul { padding-inline-start: 1.25rem; margin: .25rem 0 .75rem; }
.es-Doc li { margin: .2rem 0; }
.es-Doc pre { margin: .5rem 0 1rem; padding: .875rem 1rem; overflow-x: auto; border-radius: 8px; background: #1f2329; color: #e6edf3; font-size: .8125rem; line-height: 1.55; }
.es-Doc p code, .es-Doc li code, .es-Doc td code { padding: .05rem .35rem; border-radius: 4px; background: rgba(127,127,127,.14); font-size: .8125rem; }
.es-Doc table { width: 100%; border-collapse: collapse; margin: .5rem 0 1rem; font-size: .875rem; }
.es-Doc th, .es-Doc td { padding: .45rem .6rem; border-bottom: 1px solid var(--ut-component-border-color, #e4e7ec); text-align: left; vertical-align: top; }
.es-Doc th { font-weight: 700; opacity: .75; }
.es-Doc td:first-child { font-weight: 600; white-space: nowrap; }`;
const howHtml = `<div class="es-Doc">
<h3>1. Get Error Page Studio into your workspace</h3>
<ol>
  <li>Download <code>error-page-studio.sql</code> from <a href="https://github.com/HashaamShoukat/apex-error-page-studio" target="_blank" rel="noopener">GitHub</a>.</li>
  <li><strong>App Builder &gt; Import</strong>, install it with any application ID. No database objects; APEX 26.1 or later.</li>
</ol>

<h3>2. Copy the template into your application</h3>
<p>In <em>your</em> application: <strong>Shared Components &gt; Templates &gt; Create &gt; Page &gt; As a Copy of an Existing Template</strong>, copy from <strong>Error Page Studio</strong> and pick <strong>Modern Error</strong> (tick <em>Subscribe</em> for later updates).</p>

<h3>3. APEX's own error page</h3>
<p>When a page fails - an unhandled error in a process, an authorization failure, a broken query - APEX shows its error page using the theme's <em>Error Page</em> template:</p>
<ol>
  <li><strong>Shared Components &gt; Themes &gt;</strong> your theme <strong>&gt; Component Defaults &gt; Error Page</strong> = <strong>Modern Error</strong>.</li>
  <li><strong>Shared Components &gt; Templates &gt; Modern Error &gt; Default Template Options</strong>: pick the look (use the Designer with Page = <em>APEX Error Page</em>). The error page always uses these defaults, whatever page failed.</li>
</ol>
<p>The page shows APEX's message, the extra information, a <em>Back</em> button, a link back to the home page and, with the option on, <em>Copy details</em> for support tickets. Make the messages friendly with an error handling function (Application Definition &gt; Error Handling), for example:</p>
<pre>function friendly_error ( p_error in apex_error.t_error ) return apex_error.t_error_result is
    l_result apex_error.t_error_result := apex_error.init_error_result(p_error => p_error);
begin
    if p_error.is_internal_error then
        return l_result;                                  -- keep APEX's own wording
    end if;
    if p_error.ora_sqlcode between -20999 and -20000 then
        l_result.message := apex_error.get_first_ora_error_text(p_error => p_error);   -- your own raise_application_error text
    elsif l_result.display_location = apex_error.c_on_error_page then
        l_result.message := 'Something went wrong. Please try again in a moment.';
    end if;
    return l_result;
end friendly_error;</pre>

<h3>4. Your own error pages</h3>
<p>Create a public page with Page Template <strong>Modern Error</strong>, pick its Template Options and put the message in a Static Content region (template <em>Blank with Attributes</em>) in the <strong>Content Body</strong> slot. The Designer gives you both. Then point APEX at it:</p>
<table>
  <tr><th>Page</th><th>How users get there</th></tr>
  <tr><td>Session Expired</td><td>Shared Components &gt; Security Attributes &gt; Session Management: <strong>Session Timeout URL</strong> and <strong>Session Idle Timeout URL</strong> = <code>f?p=&amp;APP_ID.:SESSION-EXPIRED</code> (the page must be public).</td></tr>
  <tr><td>Not Found</td><td>Redirect to it when a record does not exist, e.g. a Before Header branch when the item's row is not found. (A page number that does not exist shows APEX's built-in "Sorry, this page isn't available" screen, which templates cannot change.)</td></tr>
  <tr><td>Access Denied</td><td>Authorization failures appear on APEX's error page (step 3); for a dedicated page, redirect to it from your own checks.</td></tr>
  <tr><td>Maintenance</td><td>Edit Application &gt; Availability: <strong>Unavailable (Redirect to URL)</strong> pointing to the maintenance page in another application (an unavailable application cannot show its own pages), or keep the page and switch it on with a build option.</td></tr>
  <tr><td>Server Error / Offline</td><td>Link or redirect to them from your own error handling; the Offline page reloads by itself when the connection comes back.</td></tr>
</table>

<h3>5. Helper classes</h3>
<table>
  <tr><th>Class</th><th>What it does</th></tr>
  <tr><td><code>me-Code</code></td><td>The code (404, 503, Offline) - a pill, or huge in Big Number, Neon, Glitch, Editorial, Soft UI and Space.</td></tr>
  <tr><td><code>me-Title</code>, <code>me-Text</code></td><td>The heading and the explanation.</td></tr>
  <tr><td><code>me-Actions</code>, <code>me-Btn</code>, <code>me-Btn--primary</code></td><td>A row of buttons (links or buttons).</td></tr>
  <tr><td><code>me-Back</code>, <code>me-Reload</code></td><td>A button that goes back, or reloads the page (Try again).</td></tr>
  <tr><td><code>me-Links</code></td><td>A list of helpful links under the buttons.</td></tr>
</table>
<p>Optional slots: <strong>Top Bar</strong> (logo), <strong>Page Footer</strong>, <strong>Background Image</strong> (an <code>&lt;img&gt;</code> for Background = Image). The text of the Copy button can be translated with the text message <code>MODERN_ERROR.COPY</code>.</p>
</div>`;
const how = [pageHead(3, "How to Use", "HOW-TO-USE", "Error Page Studio - How to Use"), cssBlock(howCss), pageSec, "", crumb("How to Use"), "",
    staticRegion("guide", "Use Error Page Studio in Your Own App", 20, howHtml, "@/standard"), "", ")", ""].join("\n");
fs.writeFileSync(ROOT + "pages/p00003-how-to-use.apx", how);
console.log("gallery, designer, how-to written;", PRESETS.length, "presets");
