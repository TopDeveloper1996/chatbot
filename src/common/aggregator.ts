import l from "lodash";
import Timespan from "../timespan";
import { TimespanAggregationInterval } from "../types/common_types";
/** Given a list of invoices, and a timespan, group the invoices in a list of smaller {@link Timespan}.
 *
 * The key parameter, identifies the name of the date field to use in the documents.
 * If not provided, the function dynamically computes the corresponding {@link TimespanAggregationInterval} based on the size of the initial timespan.
 */
export function aggregateDocumentsInTimespan({
    elements,
    timespan,
    grouping,
    key,
}: {
    elements: any[];
    key: string;
    timespan: Timespan;
    grouping?: Grouping | undefined;
}): {
    intervalAggregation: TimespanAggregationInterval;
    documentsByInterval: Aggregation<Timespan>[];
} {
    let documentsTimespan = Timespan.all();
    documentsTimespan = new Timespan(timespan.from, timespan.to);
    if (documentsTimespan.days() > 1095) {
        elements = l.orderBy(elements, key, "desc");
        let startDate = elements.length > 0 ? elements[elements.length - 1][key] : undefined;
        let endDate = elements.length > 0 ? elements[0][key] : undefined;
        documentsTimespan = new Timespan(startDate, endDate);
    }
    let intervalAggregation = grouping
        ? new TimespanAggregationInterval(grouping, documentsTimespan)
        : TimespanAggregationInterval.adaptive(documentsTimespan);
    const documentsByInterval: Aggregation<Timespan>[] = intervalAggregation
        .getIntervals()
        .map((t) => <Aggregation<Timespan>>{ key: t, elements: <any[]>[] });

    for (const doc of elements) {
        let match = documentsByInterval.find((d) => d.key.fits(doc[key]));
        if (match) {
            match.elements.push(doc);
        }
    }
    return {
        intervalAggregation: intervalAggregation,
        documentsByInterval: documentsByInterval,
    };
}

/** Given a list of invoices, and a timespan, group the invoices in a list of smaller {@link Timespan}.
 *
 * The key parameter, identifies the name of the date field to use in the documents.
 * If not provided, the function dynamically computes the corresponding {@link TimespanAggregationInterval} based on the size of the initial timespan.
 */
export function aggregateDocumentsInTimespanMultiple({
    elements,
    timespan,
    grouping,
    keys,
}: {
    elements: any[];
    keys: string[];
    timespan: Timespan;
    grouping?: Grouping | undefined;
}): {
    intervalAggregation: TimespanAggregationInterval;
    result: { [key: string]: Aggregation<Timespan>[] };
} {
    let documentsTimespan = Timespan.all();
    documentsTimespan = new Timespan(timespan.from, timespan.to);
    if (documentsTimespan.days() > 1095) {
        elements = l.orderBy(elements, keys, "desc");
        let startDates = elements.length > 0 ? keys.map((k) => elements[elements.length - 1][k]) : undefined;
        let endDates = elements.length > 0 ? keys.map((k) => elements[0][k]) : undefined;
        documentsTimespan = new Timespan(l.min(startDates), l.max(endDates));
    }
    let intervalAggregation = grouping
        ? new TimespanAggregationInterval(grouping, documentsTimespan)
        : TimespanAggregationInterval.adaptive(documentsTimespan);

    const map = Object.fromEntries(
        keys.map((k) => [
            k,
            intervalAggregation.getIntervals().map((t) => <Aggregation<Timespan>>{ key: t, elements: <any[]>[] }),
        ])
    );

    for (const doc of elements) {
        for (const k of keys) {
            let match = map[k].find((d) => d.key.fits(doc[k]));
            if (match) {
                match.elements.push(doc);
            }
        }
    }
    return {
        intervalAggregation: intervalAggregation,
        result: map,
    };
}


// Function to convert monthly data into quarterly averages
export function convertToQuarterly(monthlyData : number[]) : number[] {
    const quarterlyAverages = [];
    for (let i = 0; i < monthlyData.length; i += 3) {
        const quarterSum = monthlyData[i] + monthlyData[i + 1] + monthlyData[i + 2];
        quarterlyAverages.push(quarterSum);
    }
    return quarterlyAverages.filter((value) => !Number.isNaN(value));
}