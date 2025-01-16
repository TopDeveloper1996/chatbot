import Timespan from "../timespan";
import { Aggregation, TimespanAggregationInterval } from "./common_types";

/**Data of either a customer or a supplier */
export interface CustomerSupplier {
    /**Id of the customer/supplier */
    id: string;
    /**Name of the customer/supplier */
    name: string;
    /**ATECO code of the customer/supplier */
    atecoCode: string;
    /**ATECO description of the customer/supplier */
    atecoDescription: string;
    /**Number of invoices */
    percentage: number;
    /**Sum of the transactions amounts */
    amount: number;
    /**Invoices from this customer/supplier */
    elements: any[];
    /**Number of transactions */
    count: number;
}

export interface InvoicesSummarySegment {
    /**Name of the summary segment */
    key: string;
    /**Year to date value */
    yearToDate: number;
    /**Last year to date value */
    lastYearToDate: number;
    /**Last year to date and year to date variation */
    yearToDateVariation: number;
    /**Last 12 months value */
    last12Months: number;
    /**Previous 12 months value */
    previous12Months: number;
    /**Variation in 12 months analytics */
    monthsVariation: number;
}
/**Analysis for the YTD period */
export interface InvoicesSummaryAnalytics {
    /**Total revenue */
    revenue: number;
    /**Total costs */
    costs: number;
    /**Total profit */
    profitPercentage: number;
    /**Total tax paid */
    tax: number;
    /**Growth percentage */
    growth: number;
    /**Active clients */
    activeClients: number;
    /**New clients */
    newClients: number;
    /**Clients that have become inactive */
    inactiveClients: number;
    /**Segments of computed aggregated metrics */
    summarySegments: InvoicesSummarySegment[];
}

/** Complete analysis of a certain group of invoices.
 *
 * This object is used for analytics of both passive and active invoices */
export interface InvoicesGroupAnalytics {
    /**The top *n* customer/suppliers */
    topCustomerSuppliers: CustomerSupplier[];
    /**The number of invoices */
    invoicesCount: number;
    /**Invoices aggregated by the nature of the document */
    nature: Aggregation<string>[];
    /**Invoices aggregated by the type of the document */
    documentType: Aggregation<string>[];
    /**The metrics of the invoices, such as maximum, minimum, median... */
    metrics: { [key: string]: any };
    /**Invoices aggregated by category */
    categories: Aggregation<string>[];
    /**Invoices aggregated by ATECO */
    ateco: Aggregation<string>[];
    /** List of invoices without ateco information */
    missingAteco: any[];
    /** Invoices grouped by timespan */
    invoicesByTimespan: Aggregation<Timespan>[];
    /** The complete list of invoices */
    elements: any[];
    /**Cumulative sum by timespan intervals, depends on the {@link TimeframeGrouping} used */
    cumulativeSum: number[];
    /**Instance sum of elements by timespan intervals, depends on the {@link TimeframeGrouping} used */
    sumByTimespan: number[];
    /**Instance sum of elements by timespan intervals considering the **payment_date** field, depends on the {@link TimeframeGrouping} used. This field is used to predict the cash flow of invoices by using the payment deadline information for invoices */
    sumByPaymentTimespan: number[];
    /**Instance cumulative sum of elements by timespan intervals considering the **payment_date** field, depends on the {@link TimeframeGrouping} used. This field is used to predict the cash flow of invoices by using the payment deadline information for invoices */
    cumulativeSumByPayment: number[];
    /**Invoices aggregated by causal */
    causal: Aggregation<string>[];
}

/**Holds the complete statistics for both active and passive invoices */
export interface InvoicesStatistics {
    /**The number of invoices */
    count: number;
    /**The timespan used to filter the invoices */
    timespan: Timespan;
    /**Invoices divided grouped by multiple timespan. This aggregation depends on the {@link TimeframeGrouping} */
    invoicesByTimespan: Aggregation<Timespan>[];
    /** Grouping used to aggregate invoices. This allows for faster rendering and smart aggregation of invoices based on how long the filtering timespan is */
    intervalAggregation: TimespanAggregationInterval;
    /**Analytics for the active invoices */
    actives: InvoicesGroupAnalytics;
    /**Analytics for the passive invoices */
    passives: InvoicesGroupAnalytics;
}

export interface InvoiceRevenueCostStatistics {
    timespan: Timespan;
    revenue: number;
    costs: number;
    ebitda: number;
    itda: number;
    tax: number;
    margin: number;
    marginPercentage: number;
    last_year_income_tax_balance: number | 0;
    is_income_tax_balance_paid: boolean | false;
    categories: { key: string; revenue: number; costs: number; itda: number; tax: number; margin: number }[];
}

export interface InvoiceRevenueCostCategoriesComparison {
    first: InvoiceRevenueCostStatistics;
    second: InvoiceRevenueCostStatistics;
    label?: string;
    categories: {
        /**Name of the category */
        category: string;
        /**Revenue of the first period */
        firstRevenue: number;
        /**Revenue of the second period */
        secondRevenue: number;
        /**Costs of the first period */
        firstCosts: number;
        /**Costs of the second period */
        secondCosts: number;
         /**ITDA of the first period */
        firstItda: number;
         /**ITDA of the second period */
        secondItda: number;
        /**Tax of the first period */
        firstTax: number;
         /**Tax of the second period */
        secondTax: number;
        /**Delta of the revenue between the two periods */
        revenueDelta: number;
        /**Delta of the costs between the two periods */
        costsDelta: number;
    }[];
}
