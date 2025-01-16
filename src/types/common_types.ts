import Timespan from "../timespan";

export interface ValueCell {
    val: number | string ;
    type: "number" | "percentage" | "string" | "currency";
    category?: "cost" | "revenue" | undefined;
    prefix?: string;
}

/**Represents an object that aggregates a group of invoices by a certain key, with a possible description */
export interface Aggregation<T> {
    key: T;
    description: string | undefined;
    elements: any[];
}

export type Grouping = "daily" | "weekly" | "monthly" | "quarterly";
/**Grouping timeframe */
export class TimespanAggregationInterval {
    id: Grouping;
    timespan: Timespan;
    constructor(id: Grouping, timespan: Timespan) {
        this.id = id;
        this.timespan = timespan;
    }

    toString(locale: string = "it") {
        switch (this.id) {
            case "daily":
                return "giornalmente";
            case "weekly":
                return "settimanalmente";
            case "monthly":
                return "mensilmente";
            case "quarterly":
                return "trimestralmente";
            default:
                return this.id;
        }
    }

    getIntervals(): Timespan[] {
        switch (this.id) {
            case "daily":
                return Timespan.getDailyIntervals(this.timespan);
            case "weekly":
                return Timespan.getWeeklyIntervals(this.timespan);
            case "monthly":
                return Timespan.getMonthlyIntervals(this.timespan);
            case "quarterly":
                return Timespan.getQuarterlyIntervals(this.timespan);
            default:
                return [this.timespan];
        }
    }

    static adaptive(timespan: Timespan): TimespanAggregationInterval {
        const days = timespan.days();
        if (days <= 31) {
            return new TimespanAggregationInterval("daily", timespan);
        }
        if (days <= 120) {
            return new TimespanAggregationInterval("weekly", timespan);
        }
        if (days <= 500) {
            return new TimespanAggregationInterval("monthly", timespan);
        }
        return new TimespanAggregationInterval("quarterly", timespan);
    }
}
