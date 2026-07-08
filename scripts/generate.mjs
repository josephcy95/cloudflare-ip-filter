import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const SOURCE_URL = process.env.SOURCE_URL || "https://zip.cm.edu.kg/all.json";
const TXT_SOURCE_URL = process.env.TXT_SOURCE_URL || SOURCE_URL.replace(/\/all\.json$/, "/all.txt");
const OUT_DIR = process.env.OUT_DIR || "exports/latest";
const BASELINE_PATH = process.env.BASELINE_PATH || path.join(OUT_DIR, "all.json");
const LIMIT_PER_COUNTRY = Number.parseInt(process.env.LIMIT_PER_COUNTRY || "5", 10);
const MIN_SELECTED_RATIO = Number.parseFloat(process.env.MIN_SELECTED_RATIO || "0.95");
const MIN_SOURCE_TOTAL_RATIO = Number.parseFloat(process.env.MIN_SOURCE_TOTAL_RATIO || "0.50");
const STRICT_COUNTRY_SET = process.env.STRICT_COUNTRY_SET !== "false";
const STRICT_COUNTRY_SELECTED_COUNTS = process.env.STRICT_COUNTRY_SELECTED_COUNTS !== "false";
const USER_AGENTS = [
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36",
  "cloudflare-ip-filter/1.0"
];

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

async function fetchBody(url, accept) {
  let lastError;

  for (const userAgent of USER_AGENTS) {
    try {
      const response = await fetch(url, {
        headers: {
          "Accept": accept,
          "User-Agent": userAgent
        }
      });

      if (!response.ok) {
        throw new Error(`${url} returned ${response.status} ${response.statusText}`);
      }

      return await response.text();
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError;
}

async function fetchJsonSource() {
  const body = await fetchBody(SOURCE_URL, "application/json,text/plain,*/*");
  return JSON.parse(body);
}

function sourceFromTxt(body) {
  const data = [];

  for (const line of body.split(/\r?\n/)) {
    const match = line.trim().match(/^(.+):(\d+)#([A-Za-z]{2})$/);
    if (!match) continue;

    const [, ip, port, rawCountry] = match;
    const country = rawCountry.toUpperCase();
    const [country_en, country_emoji] = COUNTRY_FALLBACK[country] || [country, ""];

    data.push({
      ip,
      port: [Number(port)],
      meta: {
        country,
        country_en,
        country_emoji
      }
    });
  }

  if (data.length === 0) {
    throw new Error("TXT source contained no valid entries");
  }

  return {
    generated_at: new Date().toISOString(),
    list: { ips: data.length },
    data
  };
}

async function fetchTxtSource() {
  const body = await fetchBody(TXT_SOURCE_URL, "text/plain,*/*");
  return sourceFromTxt(body);
}

async function fetchSource() {
  const errors = [];

  try {
    return await fetchJsonSource();
  } catch (error) {
    errors.push(`json: ${error.message}`);
  }

  try {
    return await fetchTxtSource();
  } catch (error) {
    errors.push(`txt: ${error.message}`);
  }

  throw new Error(`Unable to fetch any source. ${errors.join(" | ")}`);
}

async function readBaselineSnapshot() {
  try {
    const body = await readFile(BASELINE_PATH, "utf8");
    const snapshot = JSON.parse(body);
    if (!Array.isArray(snapshot.data) || snapshot.data.length === 0) return null;
    if (!Array.isArray(snapshot.countries) || snapshot.countries.length === 0) return null;
    return snapshot;
  } catch {
    return null;
  }
}

function buildSnapshot(source, status = "fresh") {
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

  return {
    generated_at: new Date().toISOString(),
    source_url: SOURCE_URL,
    source_generated_at: source.generated_at || null,
    seed,
    status,
    limit_per_country: LIMIT_PER_COUNTRY,
    source_total: source.list?.ips || null,
    selected_total: selected.length,
    countries,
    data: selected
  };
}

function countryCountMap(snapshot) {
  return new Map((snapshot.countries || []).map((country) => [country.code, country.selected_count]));
}

function validateCandidate(candidate, previous) {
  if (!previous) {
    return { ok: true, reasons: [] };
  }

  const reasons = [];
  const candidateCountries = countryCountMap(candidate);
  const previousCountries = countryCountMap(previous);

  if (!candidate.selected_total || candidate.selected_total < 1) {
    reasons.push("candidate selected list is empty");
  }

  if (previous.selected_total && candidate.selected_total < Math.ceil(previous.selected_total * MIN_SELECTED_RATIO)) {
    reasons.push(`selected total dropped from ${previous.selected_total} to ${candidate.selected_total}`);
  }

  if (
    previous.source_total &&
    candidate.source_total &&
    candidate.source_total < Math.ceil(previous.source_total * MIN_SOURCE_TOTAL_RATIO)
  ) {
    reasons.push(`source total dropped from ${previous.source_total} to ${candidate.source_total}`);
  }

  if (STRICT_COUNTRY_SET) {
    const missingCountries = [...previousCountries.keys()].filter((code) => !candidateCountries.has(code));
    if (missingCountries.length > 0) {
      reasons.push(`countries disappeared: ${missingCountries.join(", ")}`);
    }
  }

  if (STRICT_COUNTRY_SELECTED_COUNTS) {
    const reducedCountries = [...previousCountries.entries()]
      .filter(([code, count]) => candidateCountries.has(code) && candidateCountries.get(code) < count)
      .map(([code, count]) => `${code} ${count}->${candidateCountries.get(code)}`);

    if (reducedCountries.length > 0) {
      reasons.push(`country selected counts dropped: ${reducedCountries.join(", ")}`);
    }
  }

  return { ok: reasons.length === 0, reasons };
}

function reusePreviousSnapshot(previous, reasons) {
  return {
    ...previous,
    generated_at: new Date().toISOString(),
    status: "reused_previous",
    rejected_update: {
      checked_at: new Date().toISOString(),
      reasons
    }
  };
}

function stableSnapshotPayload(snapshot) {
  return JSON.stringify({
    limit_per_country: snapshot.limit_per_country,
    source_total: snapshot.source_total,
    selected_total: snapshot.selected_total,
    countries: snapshot.countries,
    data: (snapshot.data || []).map((entry) => ({
      ip: entry.ip,
      port: entry.port,
      country: entry.country,
      label: entry.label,
      country_name: entry.country_name,
      country_emoji: entry.country_emoji
    }))
  });
}

function hasMeaningfulChange(candidate, previous) {
  if (!previous) return true;
  if (previous.status && previous.status !== "fresh") return true;
  return stableSnapshotPayload(candidate) !== stableSnapshotPayload(previous);
}

async function writeSnapshot(snapshot) {
  const selected = snapshot.data || [];
  const countries = snapshot.countries || [];
  const lines = selected.map((entry) => `${entry.ip}:${entry.port}# ${entry.label || countryLabel(entry.country, {
    country_en: entry.country_name,
    country_emoji: entry.country_emoji
  })}`);
  const plainLines = selected.map((entry) => `${entry.ip}:${entry.port}#${entry.country}`);

  await mkdir(path.join(OUT_DIR, "country"), { recursive: true });

  await writeFile(path.join(OUT_DIR, "all.txt"), `${lines.join("\n")}\n`);
  await writeFile(path.join(OUT_DIR, "plain.txt"), `${plainLines.join("\n")}\n`);
  await writeFile(path.join(OUT_DIR, "all.json"), `${JSON.stringify(snapshot, null, 2)}\n`);
  await writeFile(path.join(OUT_DIR, "countries.json"), `${JSON.stringify(countries, null, 2)}\n`);

  for (const country of countries) {
    const countryLines = selected
      .filter((entry) => entry.country === country.code)
      .map((entry) => `${entry.ip}:${entry.port}# ${entry.label || countryLabel(entry.country, {
        country_en: entry.country_name,
        country_emoji: entry.country_emoji
      })}`);
    await writeFile(path.join(OUT_DIR, "country", `${country.code}.txt`), `${countryLines.join("\n")}\n`);
  }

  console.log(`Generated ${selected.length} entries from ${countries.length} countries into ${OUT_DIR}`);
}

async function main() {
  if (!Number.isInteger(LIMIT_PER_COUNTRY) || LIMIT_PER_COUNTRY < 1) {
    throw new Error("LIMIT_PER_COUNTRY must be a positive integer");
  }

  const previous = await readBaselineSnapshot();
  let source;
  let snapshot;

  try {
    source = await fetchSource();
  } catch (error) {
    if (!previous) throw error;
    console.log(`Source unavailable, reusing baseline: ${error.message}`);
    snapshot = reusePreviousSnapshot(previous, [error.message]);
    await writeSnapshot(snapshot);
    return;
  }

  snapshot = buildSnapshot(source);
  const validation = validateCandidate(snapshot, previous);

  if (!validation.ok && previous) {
    console.log(`Rejected candidate update: ${validation.reasons.join("; ")}`);
    snapshot = reusePreviousSnapshot(previous, validation.reasons);
  }

  if (validation.ok && previous && !hasMeaningfulChange(snapshot, previous)) {
    console.log("No meaningful data change, keeping baseline snapshot");
    snapshot = previous;
  }

  await writeSnapshot(snapshot);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
