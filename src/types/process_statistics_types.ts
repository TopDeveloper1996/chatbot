import { TimespanAggregationInterval } from "#imports";
import Timespan from "../timespan";

export interface F24ProcessStatistics {
    count: number;
    dittas: any[];
    collaborators: string[];
    grouping: TimespanAggregationInterval;
    dateAggregation: Aggregation<Timespan>[];
    downloadAggregation: Aggregation<Timespan>[];
    parsedAggregation: Aggregation<Timespan>[];
}

export interface FeesProcessStatistics {
    count: number;
    dittas: any[];
    collaborators: string[];
    grouping: TimespanAggregationInterval;
    dateAggregation: Aggregation<Timespan>[];
    downloadAggregation: Aggregation<Timespan>[];
    parsedAggregation: Aggregation<Timespan>[];
}
export interface InvoiceProcessStatistics {
    actives: number;
    activesPercentage: number;
    passives: number;
    passivePercentage: number;
    dittas: any[];
    collaborators: string[];
    grouping: TimespanAggregationInterval;
    dateAggregation: Aggregation<Timespan>[];
    downloadAggregation: Aggregation<Timespan>[];
    parsedAggregation: Aggregation<Timespan>[];
}
