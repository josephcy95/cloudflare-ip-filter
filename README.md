# Cloudflare IP Filter

Daily static filter for `https://zip.cm.edu.kg/all.json`.

It picks a stable daily sample from each country and rewrites labels from:

```txt
101.99.76.88:2053#NL
```

to:

```txt
101.99.76.88:2053# NL - Netherlands 🇳🇱
```

## Raw Outputs

- `https://raw.githubusercontent.com/josephcy95/cloudflare-ip-filter/main/exports/latest/all.txt`
- `https://raw.githubusercontent.com/josephcy95/cloudflare-ip-filter/main/exports/latest/plain.txt`
- `https://raw.githubusercontent.com/josephcy95/cloudflare-ip-filter/main/exports/latest/all.json`
- `https://raw.githubusercontent.com/josephcy95/cloudflare-ip-filter/main/exports/latest/countries.json`
- `https://raw.githubusercontent.com/josephcy95/cloudflare-ip-filter/main/exports/latest/country/NL.txt`

## Files

- `exports/latest/all.txt` - readable labels, max 5 entries per country by default
- `exports/latest/plain.txt` - original `#CC` label format
- `exports/latest/all.json` - selected entries with metadata
- `exports/latest/countries.json` - country counts
- `exports/latest/country/CC.txt` - per-country text output

## Update Schedule

GitHub Actions runs once per day at `03:17 UTC`, validates the candidate update, and commits changed exports back to the repository.

You can also run it manually from the Actions tab.

Bad upstream updates are rejected. If the upstream list is empty, unavailable, loses countries, or drops significantly, the workflow keeps the last committed export.

## Local Usage

```bash
npm run generate
```

Change the per-country limit:

```bash
LIMIT_PER_COUNTRY=10 npm run generate
```

Change the source URL:

```bash
SOURCE_URL=https://zip.cm.edu.kg/all.json npm run generate
```
