export interface CaseData {
    date: Date;
    court: string;
    caseNumber: string;
    link: string;
    modified: Date;
}

export interface CaseDocument {
    docNumber: string;
    courtType: string;
    body: string;
    date: Date;
    caseNumber: string;
    docType: string;
    norm: string;
    preInstance: string;
    regionShort: string;
    regionLong: string;
    contribution: string;
    title: string | null;
    principle: string | null;
    tenor: string | null;
    fact: string | null;
    reasonsDecision: string | null;
    reasons: string | null;
}

export interface CaseDocumentHtml {
    docNumber: string;
    courtType: string;
    body: string;
    date: Date;
    caseNumber: string;
    docType: string;
    norm: string;
    preInstance: string;
    regionShort: string;
    regionLong: string;
    contribution: string;
    titleHtml?: string | null;
    principleHtml?: string | null;
    tenorHtml?: string | null;
    factHtml?: string | null;
    reasonsDecisionHtml?: string | null;
    reasonsHtml?: string | null;
}