import * as cheerio from 'cheerio';
import type {CaseData} from "./types.ts";
import dayjs from 'dayjs'
import customParseFormat from 'dayjs/plugin/customParseFormat.js';

dayjs.extend(customParseFormat)

const url = "https://www.rechtsprechung-im-internet.de/rii-toc.xml"

async function fetchAndParseXML() {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const text = await response.text();
        const $ = cheerio.load(text, { xml: true });

        const cases: CaseData[] = [];

        $('items item').each((index, element) => {
            const gericht = $(element).find('gericht').text();

            if (!gericht.startsWith("BFH")) {
                return;
            }

            const entschDatum = $(element).find('entsch-datum').text();
            const aktenzeichen = $(element).find('aktenzeichen').text();
            const link = $(element).find('link').text();
            const modified = $(element).find('modified').text();

            cases.push({
                date: dayjs(entschDatum, "YYYYMMDD").startOf("day").toDate(),
                court: gericht,
                caseNumber: aktenzeichen,
                link: link,
                modified: new Date(modified)
            });
        });

        return cases.sort((a, b) => b.date.getTime() - a.date.getTime());
    } catch (error) {
        console.error('Error fetching or parsing XML:', error);
    }
}

const cases = await fetchAndParseXML();

if (!cases) {
    console.error("No cases found or an error occurred.");
    process.exit(1);
}

console.log(`Found ${cases.length} cases.`);

// write to json file using bun

import {writeFile, mkdir} from 'fs/promises';
import { Readable } from 'stream';
import * as unzip from 'unzip-stream';
import { existsSync } from 'fs';
const outputFile = 'cases.json';

await writeFile(outputFile, JSON.stringify(cases, null, 2), 'utf-8');
console.log(`Cases written to ${outputFile}`);

await mkdir('data', { recursive: true });

let downloaded = 0;
let skipped = 0;

for (let caseData of cases) {
    const fileName = caseData.link.split("/").pop()?.replace('.zip', '') || caseData.caseNumber;

    if (existsSync(`data/${fileName}`)) {
        skipped++;
        continue;
    }

    const zip = await fetch(caseData.link);

    // sleep for 1 second to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 50));

    if (!zip.ok || !zip.body) {
        console.error(`Failed to fetch zip for case ${caseData.caseNumber}: ${zip.statusText}`);
        continue;
    }

    Readable.fromWeb(zip.body).pipe(unzip.Extract({ path: 'data/' +  fileName}));
    downloaded++;
}

console.log(`Downloaded ${downloaded} cases, skipped ${skipped} cases.`);