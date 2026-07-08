import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const SOURCE_URL = process.env.SOURCE_URL || "https://zip.cm.edu.kg/all.json";
const OUT_DIR = process.env.OUT_DIR || "public";
const LIMIT_PER_COUNTRY = Number.parseInt(process.env.LIMIT_PER_COUNTRY || "5", 10);

const COUNTRY_FALLBACK = {
  AD: ["Andorra", "🇦🇩"],
  AE: ["United Arab Emirates", "🇦🇪"],
  AF: ["Afghanistan", "🇦🇫"],
  AG: ["Antigua and Barbuda", "🇦🇬"],
  AI: ["Anguilla", "🇦🇮"],
  AL: ["Albania", "🇦🇱"],
  AM: ["Armenia", "🇦🇲"],
  AO: ["Angola", "🇦🇴"],
  AQ: ["Antarctica", "🇦🇶"],
  AR: ["Argentina", "🇦🇷"],
  AS: ["American Samoa", "🇦🇸"],
  AT: ["Austria", "🇦🇹"],
  AU: ["Australia", "🇦🇺"],
  AW: ["Aruba", "🇦🇼"],
  AX: ["Aland Islands", "🇦🇽"],
  AZ: ["Azerbaijan", "🇦🇿"],
  BA: ["Bosnia and Herzegovina", "🇧🇦"],
  BB: ["Barbados", "🇧🇧"],
  BD: ["Bangladesh", "🇧🇩"],
  BE: ["Belgium", "🇧🇪"],
  BF: ["Burkina Faso", "🇧🇫"],
  BG: ["Bulgaria", "🇧🇬"],
  BH: ["Bahrain", "🇧🇭"],
  BI: ["Burundi", "🇧🇮"],
  BJ: ["Benin", "🇧🇯"],
  BL: ["Saint Barthelemy", "🇧🇱"],
  BM: ["Bermuda", "🇧🇲"],
  BN: ["Brunei", "🇧🇳"],
  BO: ["Bolivia", "🇧🇴"],
  BQ: ["Caribbean Netherlands", "🇧🇶"],
  BR: ["Brazil", "🇧🇷"],
  BS: ["Bahamas", "🇧🇸"],
  BT: ["Bhutan", "🇧🇹"],
  BV: ["Bouvet Island", "🇧🇻"],
  BW: ["Botswana", "🇧🇼"],
  BY: ["Belarus", "🇧🇾"],
  BZ: ["Belize", "🇧🇿"],
  CA: ["Canada", "🇨🇦"],
  CC: ["Cocos Islands", "🇨🇨"],
  CD: ["Democratic Republic of the Congo", "🇨🇩"],
  CF: ["Central African Republic", "🇨🇫"],
  CG: ["Republic of the Congo", "🇨🇬"],
  CH: ["Switzerland", "🇨🇭"],
  CI: ["Cote d'Ivoire", "🇨🇮"],
  CK: ["Cook Islands", "🇨🇰"],
  CL: ["Chile", "🇨🇱"],
  CM: ["Cameroon", "🇨🇲"],
  CN: ["China", "🇨🇳"],
  CO: ["Colombia", "🇨🇴"],
  CR: ["Costa Rica", "🇨🇷"],
  CU: ["Cuba", "🇨🇺"],
  CV: ["Cape Verde", "🇨🇻"],
  CW: ["Curacao", "🇨🇼"],
  CX: ["Christmas Island", "🇨🇽"],
  CY: ["Cyprus", "🇨🇾"],
  CZ: ["Czechia", "🇨🇿"],
  DE: ["Germany", "🇩🇪"],
  DJ: ["Djibouti", "🇩🇯"],
  DK: ["Denmark", "🇩🇰"],
  DM: ["Dominica", "🇩🇲"],
  DO: ["Dominican Republic", "🇩🇴"],
  DZ: ["Algeria", "🇩🇿"],
  EC: ["Ecuador", "🇪🇨"],
  EE: ["Estonia", "🇪🇪"],
  EG: ["Egypt", "🇪🇬"],
  EH: ["Western Sahara", "🇪🇭"],
  ER: ["Eritrea", "🇪🇷"],
  ES: ["Spain", "🇪🇸"],
  ET: ["Ethiopia", "🇪🇹"],
  FI: ["Finland", "🇫🇮"],
  FJ: ["Fiji", "🇫🇯"],
  FK: ["Falkland Islands", "🇫🇰"],
  FM: ["Micronesia", "🇫🇲"],
  FO: ["Faroe Islands", "🇫🇴"],
  FR: ["France", "🇫🇷"],
  GA: ["Gabon", "🇬🇦"],
  GB: ["United Kingdom", "🇬🇧"],
  GD: ["Grenada", "🇬🇩"],
  GE: ["Georgia", "🇬🇪"],
  GF: ["French Guiana", "🇬🇫"],
  GG: ["Guernsey", "🇬🇬"],
  GH: ["Ghana", "🇬🇭"],
  GI: ["Gibraltar", "🇬🇮"],
  GL: ["Greenland", "🇬🇱"],
  GM: ["Gambia", "🇬🇲"],
  GN: ["Guinea", "🇬🇳"],
  GP: ["Guadeloupe", "🇬🇵"],
  GQ: ["Equatorial Guinea", "🇬🇶"],
  GR: ["Greece", "🇬🇷"],
  GS: ["South Georgia and the South Sandwich Islands", "🇬🇸"],
  GT: ["Guatemala", "🇬🇹"],
  GU: ["Guam", "🇬🇺"],
  GW: ["Guinea-Bissau", "🇬🇼"],
  GY: ["Guyana", "🇬🇾"],
  HK: ["Hong Kong", "🇭🇰"],
  HM: ["Heard Island and McDonald Islands", "🇭🇲"],
  HN: ["Honduras", "🇭🇳"],
  HR: ["Croatia", "🇭🇷"],
  HT: ["Haiti", "🇭🇹"],
  HU: ["Hungary", "🇭🇺"],
  ID: ["Indonesia", "🇮🇩"],
  IE: ["Ireland", "🇮🇪"],
  IL: ["Israel", "🇮🇱"],
  IM: ["Isle of Man", "🇮🇲"],
  IN: ["India", "🇮🇳"],
  IO: ["British Indian Ocean Territory", "🇮🇴"],
  IQ: ["Iraq", "🇮🇶"],
  IR: ["Iran", "🇮🇷"],
  IS: ["Iceland", "🇮🇸"],
  IT: ["Italy", "🇮🇹"],
  JE: ["Jersey", "🇯🇪"],
  JM: ["Jamaica", "🇯🇲"],
  JO: ["Jordan", "🇯🇴"],
  JP: ["Japan", "🇯🇵"],
  KE: ["Kenya", "🇰🇪"],
  KG: ["Kyrgyzstan", "🇰🇬"],
  KH: ["Cambodia", "🇰🇭"],
  KI: ["Kiribati", "🇰🇮"],
  KM: ["Comoros", "🇰🇲"],
  KN: ["Saint Kitts and Nevis", "🇰🇳"],
  KP: ["North Korea", "🇰🇵"],
  KR: ["South Korea", "🇰🇷"],
  KW: ["Kuwait", "🇰🇼"],
  KY: ["Cayman Islands", "🇰🇾"],
  KZ: ["Kazakhstan", "🇰🇿"],
  LA: ["Laos", "🇱🇦"],
  LB: ["Lebanon", "🇱🇧"],
  LC: ["Saint Lucia", "🇱🇨"],
  LI: ["Liechtenstein", "🇱🇮"],
  LK: ["Sri Lanka", "🇱🇰"],
  LR: ["Liberia", "🇱🇷"],
  LS: ["Lesotho", "🇱🇸"],
  LT: ["Lithuania", "🇱🇹"],
  LU: ["Luxembourg", "🇱🇺"],
  LV: ["Latvia", "🇱🇻"],
  LY: ["Libya", "🇱🇾"],
  MA: ["Morocco", "🇲🇦"],
  MC: ["Monaco", "🇲🇨"],
  MD: ["Moldova", "🇲🇩"],
  ME: ["Montenegro", "🇲🇪"],
  MF: ["Saint Martin", "🇲🇫"],
  MG: ["Madagascar", "🇲🇬"],
  MH: ["Marshall Islands", "🇲🇭"],
  MK: ["North Macedonia", "🇲🇰"],
  ML: ["Mali", "🇲🇱"],
  MM: ["Myanmar", "🇲🇲"],
  MN: ["Mongolia", "🇲🇳"],
  MO: ["Macao", "🇲🇴"],
  MP: ["Northern Mariana Islands", "🇲🇵"],
  MQ: ["Martinique", "🇲🇶"],
  MR: ["Mauritania", "🇲🇷"],
  MS: ["Montserrat", "🇲🇸"],
  MT: ["Malta", "🇲🇹"],
  MU: ["Mauritius", "🇲🇺"],
  MV: ["Maldives", "🇲🇻"],
  MW: ["Malawi", "🇲🇼"],
  MX: ["Mexico", "🇲🇽"],
  MY: ["Malaysia", "🇲🇾"],
  MZ: ["Mozambique", "🇲🇿"],
  NA: ["Namibia", "🇳🇦"],
  NC: ["New Caledonia", "🇳🇨"],
  NE: ["Niger", "🇳🇪"],
  NF: ["Norfolk Island", "🇳🇫"],
  NG: ["Nigeria", "🇳🇬"],
  NI: ["Nicaragua", "🇳🇮"],
  NL: ["Netherlands", "🇳🇱"],
  NO: ["Norway", "🇳🇴"],
  NP: ["Nepal", "🇳🇵"],
  NR: ["Nauru", "🇳🇷"],
  NU: ["Niue", "🇳🇺"],
  NZ: ["New Zealand", "🇳🇿"],
  OM: ["Oman", "🇴🇲"],
  PA: ["Panama", "🇵🇦"],
  PE: ["Peru", "🇵🇪"],
  PF: ["French Polynesia", "🇵🇫"],
  PG: ["Papua New Guinea", "🇵🇬"],
  PH: ["Philippines", "🇵🇭"],
  PK: ["Pakistan", "🇵🇰"],
  PL: ["Poland", "🇵🇱"],
  PM: ["Saint Pierre and Miquelon", "🇵🇲"],
  PN: ["Pitcairn", "🇵🇳"],
  PR: ["Puerto Rico", "🇵🇷"],
  PS: ["Palestine", "🇵🇸"],
  PT: ["Portugal", "🇵🇹"],
  PW: ["Palau", "🇵🇼"],
  PY: ["Paraguay", "🇵🇾"],
  QA: ["Qatar", "🇶🇦"],
  RE: ["Reunion", "🇷🇪"],
  RO: ["Romania", "🇷🇴"],
  RS: ["Serbia", "🇷🇸"],
  RU: ["Russia", "🇷🇺"],
  RW: ["Rwanda", "🇷🇼"],
  SA: ["Saudi Arabia", "🇸🇦"],
  SB: ["Solomon Islands", "🇸🇧"],
  SC: ["Seychelles", "🇸🇨"],
  SD: ["Sudan", "🇸🇩"],
  SE: ["Sweden", "🇸🇪"],
  SG: ["Singapore", "🇸🇬"],
  SH: ["Saint Helena", "🇸🇭"],
  SI: ["Slovenia", "🇸🇮"],
  SJ: ["Svalbard and Jan Mayen", "🇸🇯"],
  SK: ["Slovakia", "🇸🇰"],
  SL: ["Sierra Leone", "🇸🇱"],
  SM: ["San Marino", "🇸🇲"],
  SN: ["Senegal", "🇸🇳"],
  SO: ["Somalia", "🇸🇴"],
  SR: ["Suriname", "🇸🇷"],
  SS: ["South Sudan", "🇸🇸"],
  ST: ["Sao Tome and Principe", "🇸🇹"],
  SV: ["El Salvador", "🇸🇻"],
  SX: ["Sint Maarten", "🇸🇽"],
  SY: ["Syria", "🇸🇾"],
  SZ: ["Eswatini", "🇸🇿"],
  TC: ["Turks and Caicos Islands", "🇹🇨"],
  TD: ["Chad", "🇹🇩"],
  TF: ["French Southern Territories", "🇹🇫"],
  TG: ["Togo", "🇹🇬"],
  TH: ["Thailand", "🇹🇭"],
  TJ: ["Tajikistan", "🇹🇯"],
  TK: ["Tokelau", "🇹🇰"],
  TL: ["Timor-Leste", "🇹🇱"],
  TM: ["Turkmenistan", "🇹🇲"],
  TN: ["Tunisia", "🇹🇳"],
  TO: ["Tonga", "🇹🇴"],
  TR: ["Turkey", "🇹🇷"],
  TT: ["Trinidad and Tobago", "🇹🇹"],
  TV: ["Tuvalu", "🇹🇻"],
  TW: ["Taiwan", "🇹🇼"],
  TZ: ["Tanzania", "🇹🇿"],
  UA: ["Ukraine", "🇺🇦"],
  UG: ["Uganda", "🇺🇬"],
  UM: ["United States Minor Outlying Islands", "🇺🇲"],
  US: ["United States", "🇺🇸"],
  UY: ["Uruguay", "🇺🇾"],
  UZ: ["Uzbekistan", "🇺🇿"],
  VA: ["Vatican City", "🇻🇦"],
  VC: ["Saint Vincent and the Grenadines", "🇻🇨"],
  VE: ["Venezuela", "🇻🇪"],
  VG: ["British Virgin Islands", "🇻🇬"],
  VI: ["U.S. Virgin Islands", "🇻🇮"],
  VN: ["Vietnam", "🇻🇳"],
  VU: ["Vanuatu", "🇻🇺"],
  WF: ["Wallis and Futuna", "🇼🇫"],
  WS: ["Samoa", "🇼🇸"],
  XK: ["Kosovo", "🇽🇰"],
  YE: ["Yemen", "🇾🇪"],
  YT: ["Mayotte", "🇾🇹"],
  ZA: ["South Africa", "🇿🇦"],
  ZM: ["Zambia", "🇿🇲"],
  ZW: ["Zimbabwe", "🇿🇼"]
};

function hashString(value) {
  let hash = 2166136261;
  for (let i = 0; i < value.length; i += 1) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function daySeed(sourceGeneratedAt) {
  const raw = sourceGeneratedAt || new Date().toISOString();
  return raw.slice(0, 10);
}

function countryLabel(code, meta = {}) {
  const fallback = COUNTRY_FALLBACK[code] || [code, ""];
  const name = meta.country_en || fallback[0] || code;
  const emoji = meta.country_emoji || fallback[1] || "";
  return `${code} - ${name}${emoji ? ` ${emoji}` : ""}`;
}

function normalizeEntry(item) {
  const meta = item.meta || {};
  const country = String(meta.country || "").trim().toUpperCase();
  if (!country || !Array.isArray(item.port)) return [];

  return item.port
    .map((port) => Number(port))
    .filter((port) => Number.isInteger(port) && port > 0 && port <= 65535)
    .map((port) => ({
      ip: item.ip,
      port,
      country,
      label: countryLabel(country, meta),
      country_name: meta.country_en || COUNTRY_FALLBACK[country]?.[0] || country,
      country_emoji: meta.country_emoji || COUNTRY_FALLBACK[country]?.[1] || "",
      city: meta.city || "",
      region: meta.region || "",
      asn: meta.asn || null,
      organization: meta.asOrganization || ""
    }));
}

async function main() {
  if (!Number.isInteger(LIMIT_PER_COUNTRY) || LIMIT_PER_COUNTRY < 1) {
    throw new Error("LIMIT_PER_COUNTRY must be a positive integer");
  }

  const response = await fetch(SOURCE_URL, {
    headers: {
      "Accept": "application/json",
      "User-Agent": "cloudflare-ip-filter/1.0"
    }
  });

  if (!response.ok) {
    throw new Error(`Source returned ${response.status} ${response.statusText}`);
  }

  const source = await response.json();
  const seed = daySeed(source.generated_at);
  const seen = new Set();
  const groups = new Map();

  for (const item of source.data || []) {
    for (const entry of normalizeEntry(item)) {
      const key = `${entry.ip}:${entry.port}`;
      if (seen.has(key)) continue;
      seen.add(key);

      if (!groups.has(entry.country)) groups.set(entry.country, []);
      groups.get(entry.country).push(entry);
    }
  }

  const countries = [];
  const selected = [];

  for (const [country, entries] of groups) {
    entries.sort((a, b) => {
      const ah = hashString(`${seed}:${a.country}:${a.ip}:${a.port}`);
      const bh = hashString(`${seed}:${b.country}:${b.ip}:${b.port}`);
      return ah - bh;
    });

    const picked = entries.slice(0, LIMIT_PER_COUNTRY);
    selected.push(...picked);
    countries.push({
      code: country,
      name: picked[0]?.country_name || COUNTRY_FALLBACK[country]?.[0] || country,
      emoji: picked[0]?.country_emoji || COUNTRY_FALLBACK[country]?.[1] || "",
      source_count: entries.length,
      selected_count: picked.length
    });
  }

  selected.sort((a, b) => a.country.localeCompare(b.country) || a.ip.localeCompare(b.ip) || a.port - b.port);
  countries.sort((a, b) => a.code.localeCompare(b.code));

  const lines = selected.map((entry) => `${entry.ip}:${entry.port}# ${entry.label}`);
  const plainLines = selected.map((entry) => `${entry.ip}:${entry.port}#${entry.country}`);
  const generatedAt = new Date().toISOString();

  await mkdir(path.join(OUT_DIR, "country"), { recursive: true });

  await writeFile(path.join(OUT_DIR, "all.txt"), `${lines.join("\n")}\n`);
  await writeFile(path.join(OUT_DIR, "plain.txt"), `${plainLines.join("\n")}\n`);
  await writeFile(
    path.join(OUT_DIR, "all.json"),
    `${JSON.stringify({
      generated_at: generatedAt,
      source_url: SOURCE_URL,
      source_generated_at: source.generated_at || null,
      seed,
      limit_per_country: LIMIT_PER_COUNTRY,
      source_total: source.list?.ips || null,
      selected_total: selected.length,
      countries,
      data: selected
    }, null, 2)}\n`
  );

  await writeFile(path.join(OUT_DIR, "countries.json"), `${JSON.stringify(countries, null, 2)}\n`);

  for (const country of countries) {
    const countryLines = selected
      .filter((entry) => entry.country === country.code)
      .map((entry) => `${entry.ip}:${entry.port}# ${entry.label}`);
    await writeFile(path.join(OUT_DIR, "country", `${country.code}.txt`), `${countryLines.join("\n")}\n`);
  }

  await writeFile(
    path.join(OUT_DIR, "_headers"),
    [
      "/*",
      "  Access-Control-Allow-Origin: *",
      "  X-Content-Type-Options: nosniff",
      "  Cache-Control: public, max-age=3600",
      "",
      "/all.txt",
      "  Content-Type: text/plain; charset=utf-8",
      "",
      "/plain.txt",
      "  Content-Type: text/plain; charset=utf-8",
      "",
      "/country/*.txt",
      "  Content-Type: text/plain; charset=utf-8",
      ""
    ].join("\n")
  );

  await writeFile(
    path.join(OUT_DIR, "index.html"),
    `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Cloudflare IP Filter</title>
  <style>
    body { font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; margin: 2rem; line-height: 1.5; color: #161616; }
    main { max-width: 760px; }
    code { background: #f1f1f1; padding: .125rem .3rem; border-radius: 4px; }
    a { color: #0645ad; }
  </style>
</head>
<body>
  <main>
    <h1>Cloudflare IP Filter</h1>
    <p>Generated at <code>${generatedAt}</code>. Source generated at <code>${source.generated_at || "unknown"}</code>.</p>
    <ul>
      <li><a href="./all.txt">all.txt</a> - selected entries with readable country labels</li>
      <li><a href="./plain.txt">plain.txt</a> - selected entries with original country codes</li>
      <li><a href="./all.json">all.json</a> - selected entries with metadata</li>
      <li><a href="./countries.json">countries.json</a> - country summary</li>
    </ul>
    <p>Selected ${selected.length} entries from ${countries.length} countries, max ${LIMIT_PER_COUNTRY} per country.</p>
  </main>
</body>
</html>
`
  );

  console.log(`Generated ${selected.length} entries from ${countries.length} countries into ${OUT_DIR}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
