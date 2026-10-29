// Line illustrations for Modern Error (200 x 160, round strokes). Used as CSS masks, so they take the accent colours.
const svg = body => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 160" fill="none" stroke="black" stroke-width="5" stroke-linecap="round" stroke-linejoin="round">${body}</svg>`;

export const ART = {
    // a page with a folded corner and a magnifier with a question mark
    notfound: svg(`<path d="M42 18h70l28 28v74"/><path d="M112 18v28h28"/><path d="M42 18v118h56"/><path d="M60 62h50M60 80h34"/>
        <circle cx="128" cy="112" r="24"/><path d="M146 130l22 22"/><path d="M120 104a8 8 0 1 1 11 7c-3 1.5-3 3-3 6"/><path d="M128 126v.5"/>`),
    // a shield with a padlock
    denied: svg(`<path d="M100 14l56 20v40c0 36-25 62-56 72-31-10-56-36-56-72V34z"/><rect x="78" y="70" width="44" height="36" rx="7"/>
        <path d="M87 70v-9a13 13 0 0 1 26 0v9"/><path d="M100 84v10"/>`),
    // an hourglass with a little sand left
    expired: svg(`<path d="M62 16h76M62 144h76"/><path d="M72 16c0 34 28 42 28 64s-28 30-28 64"/><path d="M128 16c0 34-28 42-28 64s28 30 28 64"/>
        <path d="M80 142l20-16 20 16z"/><path d="M86 40h28l-14 14z"/><path d="M100 88v26"/>`),
    // a traffic cone and a wrench
    maintenance: svg(`<path d="M86 30h18l26 104H60z"/><path d="M76 66h38M70 96h50"/><path d="M44 134h102"/>
        <path d="M166 40a16 16 0 0 0-22 18l-14 14 9 9 14-14a16 16 0 0 0 18-22l-9 9-9-3-3-9z"/>`),
    // an unplugged plug and socket with a spark
    server: svg(`<path d="M18 110c20 0 22-24 40-24"/><rect x="58" y="70" width="32" height="32" rx="6"/><path d="M90 78h12M90 94h12"/>
        <rect x="120" y="66" width="34" height="40" rx="8"/><path d="M130 80h6M130 92h6"/><path d="M154 86c14 0 18 18 32 18"/>
        <path d="M108 40l-8 14h12l-8 14"/><path d="M88 46l-6-6M128 46l6-6"/>`),
    // a cloud with a slash through it
    offline: svg(`<path d="M58 118h86a26 26 0 0 0 4-52 38 38 0 0 0-72-6 28 28 0 0 0-18 58z"/><path d="M40 146L160 22"/>`)
};

export const enc = s => "url(\"data:image/svg+xml," + s.replace(/\s+/g, " ").replace(/"/g, "'").replace(/%/g, "%25").replace(/#/g, "%23").replace(/</g, "%3C").replace(/>/g, "%3E") + "\")";
