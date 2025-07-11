import { readdir } from "node:fs/promises";
import * as cheerio from "cheerio";
import dayjs from "dayjs";
import type {CaseDocument, CaseDocumentHtml} from "./types.ts";
import {writeFile} from "fs/promises";

const files = await readdir("./data/", { recursive: true });
const docs: CaseDocument[] = [];
const docsHtml: CaseDocumentHtml[] = [];

for (const file of files) {
    if (!file.endsWith(".xml")) {
        continue
    }

    const filePath = `./data/${file}`;
    const bunFile = Bun.file(filePath);

    const $ = cheerio.load(await bunFile.text(), { xml: true });

    const docNumber = $('dokument doknr').first().text();
    const courtType = $('dokument gertyp').first().text();
    const body = $('dokument spruchkoerper').first().text();
    const date = dayjs($('dokument entsch-datum').first().text(), "YYYYMMDD").toDate();
    const caseNumber = $('dokument aktenzeichen').first().text();
    const docType = $('dokument doktyp').first().text();
    const norm = $('dokument norm').first().text();
    const preInstance = $('dokument vorinstanz').first().text();
    const regionShort = $('dokument region abk').first().text();
    const regionLong = $('dokument region long').first().text();
    const contribution = $('dokument mitwirkung').first().text();
    const titleSelector = $('dokument titelzeile').first();
    const principalSelector = $('dokument leitsatz').first();
    const tenorSelector = $('dokument tenor').first();
    const factSelector = $('dokument tatbestand').first();
    const reasonsDecisionSelector = $('dokument entscheidungsgruende').first();
    const reasonsSelector = $('dokument gruende').first();
    const title = titleSelector.text();
    const titleHtml = titleSelector.html();
    const principle = principalSelector.text();
    const principleHtml = principalSelector.html();
    const tenor = tenorSelector.text();
    const tenorHtml = tenorSelector.html();
    const fact = factSelector.text();
    const factHtml = factSelector.html();
    const reasonsDecision = reasonsDecisionSelector.text();
    const reasonsDecisionHtml = reasonsDecisionSelector.html();
    const reasons = reasonsSelector.text();
    const reasonsHtml = reasonsSelector.html();

    const doc: CaseDocument = {
        docNumber,
        courtType,
        body,
        date,
        caseNumber,
        docType,
        norm,
        preInstance,
        regionShort,
        regionLong,
        contribution,
        title: title.trim(),
        principle: principle.trim(),
        tenor: tenor.trim(),
        fact: fact.trim(),
        reasonsDecision: reasonsDecision.trim(),
        reasons: reasons.trim(),
    };

    const htmlDoc: CaseDocumentHtml = {
        docNumber,
        courtType,
        body,
        date,
        caseNumber,
        docType,
        norm,
        preInstance,
        regionShort,
        regionLong,
        contribution,
        titleHtml,
        principleHtml,
        tenorHtml,
        factHtml,
        reasonsDecisionHtml,
        reasonsHtml,
    }

    docs.push(doc);
    docsHtml.push(htmlDoc);
}

const outputFile = 'docs.json';
const outputFileHtml = 'docs_html.json';

await writeFile(outputFile, JSON.stringify(docs, null, 2));
await writeFile(outputFileHtml, JSON.stringify(docsHtml, null, 2));

console.log(`Documents written to ${outputFile}`);
console.log(`Documents HTML written to ${outputFileHtml}`);