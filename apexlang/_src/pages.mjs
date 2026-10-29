// Writes the demo error pages (public, Modern Error template): node _src/pages.mjs
// The same texts are the snippets the Designer offers for each type.
import fs from "node:fs";
const ROOT = new URL("..", import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1");

export const TYPES = [
    { page: 10, alias: "NOT-FOUND", name: "Not Found", art: "notfound", look: "me-Design--bignum",
      html: `<p class="me-Code">404</p>
<h1 class="me-Title">Page not found</h1>
<p class="me-Text">The page you are looking for doesn't exist or has moved. Check the address, or start again from the home page.</p>
<div class="me-Actions"><a class="me-Btn me-Btn--primary" href="f?p=&APP_ID.:1:&APP_SESSION.">Go to the home page</a><button type="button" class="me-Btn me-Back">Go back</button></div>
<ul class="me-Links"><li><a href="f?p=&APP_ID.:3:&APP_SESSION.">Help</a></li><li><a href="mailto:support@example.com">Contact support</a></li></ul>` },
    { page: 11, alias: "ACCESS-DENIED", name: "Access Denied", art: "denied", look: "me-Design--split",
      html: `<p class="me-Code">403</p>
<h1 class="me-Title">Access denied</h1>
<p class="me-Text">You don't have permission to see this page. If you think you should, ask your administrator for access.</p>
<div class="me-Actions"><a class="me-Btn me-Btn--primary" href="f?p=&APP_ID.:1:&APP_SESSION.">Go to the home page</a><a class="me-Btn" href="mailto:support@example.com?subject=Access%20request">Request access</a></div>` },
    { page: 12, alias: "SESSION-EXPIRED", name: "Session Expired", art: "expired", look: "me-Design--editorial",
      html: `<p class="me-Code">401</p>
<h1 class="me-Title">Your session has expired</h1>
<p class="me-Text">For your security you were signed out after a while without activity. Sign in again to carry on where you left off.</p>
<div class="me-Actions"><a class="me-Btn me-Btn--primary" href="f?p=&APP_ID.:1:&APP_SESSION.">Sign in again</a></div>` },
    { page: 13, alias: "MAINTENANCE", name: "Maintenance", art: "maintenance", look: "me-Design--blueprint",
      html: `<p class="me-Code">503</p>
<h1 class="me-Title">We'll be back soon</h1>
<p class="me-Text">We're making some improvements. The application will be available again shortly - thank you for your patience.</p>
<div class="me-Actions"><button type="button" class="me-Btn me-Btn--primary me-Reload">Try again</button></div>` },
    { page: 14, alias: "SERVER-ERROR", name: "Server Error", art: "server", look: "me-Design--glitch",
      html: `<p class="me-Code">500</p>
<h1 class="me-Title">Something went wrong</h1>
<p class="me-Text">An unexpected error happened on our side. It has been logged and we're looking into it. Please try again in a moment.</p>
<div class="me-Actions"><button type="button" class="me-Btn me-Btn--primary me-Reload">Try again</button><a class="me-Btn" href="f?p=&APP_ID.:1:&APP_SESSION.">Go to the home page</a></div>` },
    { page: 15, alias: "OFFLINE", name: "Offline", art: "offline", look: "me-Design--space",
      html: `<p class="me-Code">Offline</p>
<h1 class="me-Title">You're offline</h1>
<p class="me-Text">Check your internet connection. This page reloads by itself as soon as you're back online.</p>
<div class="me-Actions"><button type="button" class="me-Btn me-Btn--primary me-Reload">Try again</button></div>` }
];

if (process.argv[1] && process.argv[1].endsWith("pages.mjs")) {
    for (const t of TYPES) {
        const html = t.html.split("\n").map(l => "                " + l).join("\n");
        const apx = `page ${t.page} (
    name: ${t.name}
    alias: ${t.alias}
    title: ${t.name}
    appearance {
        pageTemplate: @modern-error
        templateOptions: [
            #DEFAULT#
            ${t.look}
            me-Art--${t.art}
        ]
    }
    navigation {
        cursorFocus: doNotFocusCursor
    }
    security {
        authentication: public
        pageAccessProtection: unrestricted
        formAutoComplete: false
    }

    region message (
        name: Message
        type: staticContent
        source {
            htmlCode:
                \`\`\`html
${html}
                \`\`\`
        }
        layout {
            sequence: 10
            slot: contentBody
        }
        appearance {
            template: @/blank-with-attributes
            templateOptions: #DEFAULT#
        }
    )

)
`;
        fs.writeFileSync(`${ROOT}pages/p${String(t.page).padStart(5, "0")}-${t.alias.toLowerCase()}.apx`, apx);
        console.log("page", t.page, t.alias);
    }
}
