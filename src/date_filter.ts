import Timespan from "./timespan";

export default class DateFilter {
    id: string;
    name: string;
    timespanComputer: (now: Date) => Timespan;

    static defaultFilter: DateFilter = new DateFilter("last-year", "Questo anno", (now) => Timespan.thisYear());
    static filters = Object.freeze({
        All: new DateFilter("all", "Tutte", (now) => Timespan.all()),
        Today: new DateFilter("today", "Oggi", (now) => Timespan.today()),
        Yesterday: new DateFilter("yesterday", "Ieri", (now) => Timespan.yesteday()),
        LastWeek: new DateFilter("last-week", "Scorsa settimana", (now) => Timespan.lastWeek()),
        ThisWeek: new DateFilter("this-week", "Questa settimana", (now) => Timespan.thisWeek()),
        Last30Days: new DateFilter("last-30-days", "Ultimi 30 giorni", (now) => Timespan.lastNDays(30)),
        LastMonth: new DateFilter("last-month", "Scorso mese", (now) => Timespan.lastMonth()),
        ThisMonth: new DateFilter("this-month", "Questo mese", (now) => Timespan.thisMonth()),
        LastQuarter: new DateFilter("last-quarter", "Scorso trimestre", (now) => Timespan.lastQuarter()),
        ThisQuarter: new DateFilter("this-quarter", "Questo trimestre", (now) => Timespan.thisQuarter()),
        LastYear: new DateFilter("this-year", "Scorso anno", (now) => Timespan.lastYear()),
        ThisYear: new DateFilter("last-year", "Questo anno", (now) => Timespan.thisYear()),
        Last12Months: new DateFilter("last-12-months", "Ultimi 12 mesi", (now) => Timespan.last12Months()),
        YearToDate: new DateFilter("year-to-date", "Anno corrente", (now) => Timespan.yearToDate()),
    });
    constructor(id: string, name: string, timespanComputer: (now: Date) => Timespan) {
        this.id = id;
        this.name = name;
        this.timespanComputer = timespanComputer;
    }
    public toString = (): string => {
        return this.name;
    };

    public getTimespan(): Timespan {
        return this.timespanComputer(new Date());
    }
}
