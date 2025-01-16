export interface DocumentsStatistics {
    count: number;
    lastElement: any;
    firstElement: any;
    sumWithoutVat: number;
    totalSum: number;
    vat: number;
}
export interface QualityReport {
    fees: DocumentsStatistics;
    actives: DocumentsStatistics;
    passives: DocumentsStatistics;
    f24: {
        inpsSum: number;
        vatSum: number;
        taxesSum: number;
        count: number;
    };
}
