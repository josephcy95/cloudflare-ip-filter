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

## Outputs

- `all.txt` - readable labels, max 5 entries per country by default
- `plain.txt` - original `#CC` label format
- `all.json` - selected entries with metadata
- `countries.json` - country counts
- `country/CC.txt` - per-country text output

## Update Schedule

GitHub Actions runs once per day at `03:17 UTC`, then publishes the generated files to GitHub Pages.

You can also run it manually from the Actions tab.

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
