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

const size = 1000;
const batches = [];

for (let i = 0; i < cases.length; i += size) {
    const batch = cases.slice(i, i + size);
    batches.push(batch);
}

for (const batch of batches) {
    await index.addDocuments(batch);
    console.log(`Added batch of ${batch.length} documents to index.`);
}