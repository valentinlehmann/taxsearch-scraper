const inputFile = "docs.json";
import { readFile } from 'fs/promises';

import type {CaseDocument} from './types';

async function readAndParseJSON() {
    try {
        const data = await readFile(inputFile, 'utf-8');
        const cases: CaseDocument[] = JSON.parse(data);
        return cases;
    } catch (error) {
        console.error('Error reading or parsing JSON:', error);
    }
}

const cases = await readAndParseJSON();

if (!cases) {
    console.error("No cases found or an error occurred.");
    process.exit(1);
}

console.log(`Found ${cases.length} cases.`);

import { Meilisearch } from "meilisearch";

const client = new Meilisearch({
    host: process.env.MEILI_HOST || "http://localhost:7700",
    apiKey: process.env.MEILI_API_KEY || "",
});

await client.deleteIndexIfExists("bfh");
await client.createIndex("bfh", {
    primaryKey: "docNumber",

});
const index = client.index("bfh");

// Used by the frontend's filters, sorting, decision page and exact result counts
await index.updateSettings({
    filterableAttributes: ["docNumber", "docType", "body", "dateNum"],
    sortableAttributes: ["dateNum"],
    pagination: {maxTotalHits: 100000},
});

// Dates are stored as midnight in Berlin (UTC 22:00/23:00), so derive the calendar date there.
// dateNum is YYYYMMDD as a number, e.g. 20201016, for range filters and sorting.
const berlinDate = new Intl.DateTimeFormat("en-CA", {timeZone: "Europe/Berlin"});
const docs = cases.map((c) => ({...c, dateNum: Number(berlinDate.format(new Date(c.date)).replaceAll("-", ""))}));

const size = 1000;
const batches = [];

for (let i = 0; i < docs.length; i += size) {
    const batch = docs.slice(i, i + size);
    batches.push(batch);
}

for (const batch of batches) {
    await index.addDocuments(batch);
    console.log(`Added batch of ${batch.length} documents to index.`);
}