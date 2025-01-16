import Timespan from "../timespan";
import { TimespanAggregationInterval } from "./common_types";

/**Holds the complete statistics for all the F24 documents */
export interface F24Statistics {
    /**Number of documents */
    count: number;
    /**The timespan used to filter the documents */
    timespan: Timespan;
    /** The aggregation interval used */
    intervalAggregation: TimespanAggregationInterval;
    /** The keys of the F24 categories */
    categoriesKeys: string[];
    // /**Year to date analytics */
    // ytdAnalytics: F24YearToDateAnalytics;
    /** Grouped documents by timespan, with category analysis */
    documentsByTimespan: { timespan: Timespan; elements: any[]; categories: F24CategoryAnalytics[] }[];
}

/**The analytics of a specific category */
export interface F24CategoryAnalytics {
    /**The category */
    key: F24Category;
    /**Documents of this category */
    elements: any[];
    /**The credit amount */
    credit: number;
    /**The debit amount */
    debit: number;
    /**The balance amount */
    balance: number;
}

/**The various categories of a F24 document */
export enum F24Category {
    iva = "iva",
    fissi_inps = "fissi inps",
    inps = "inps",
    irap = "irap",
    inail = "inail",
    ires = "ires",
    ritenuta = "ritenuta",
    diritto_camerale = "diritto camerale",
    versamenti_reddito = "versamenti reddito",
    tasse_locali = "tasse locali",
    tasse_regionali = "tasse regionali",
}
