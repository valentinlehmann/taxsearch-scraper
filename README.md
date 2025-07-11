# TaxSearch scraper

The scripts in this repository are used to scrape decisions from the Federal Tax Court of Germany (Bundesfinanzhof) and index them into a MeiliSearch instance.

# Prerequisites
- Bun installed on your machine.
- A MeiliSearch instance and an API key for accessing it.

# Usage
1. Clone the repository
2. Install dependencies:
   ```bash
   bun install
   ```
3. Set the environment variables:
   - `MEILI_HOST`: The URL of your MeiliSearch instance.
   - `MEILI_API_KEY`: The API key for your MeiliSearch instance.

4. Run the scraper:
   ```bash
    bun index.ts
    ```
5. Parse the scraped data:
   ```bash
   bun parser.ts
   ```
6. Upload the parsed data to MeiliSearch:
   ```bash
    bun uploader.ts
    ```