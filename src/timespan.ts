import moment from "moment";
import DateBuilder from "./date_builder";
import { it } from "date-fns/locale";

export default class Timespan {
    readonly from: Date;
    readonly to: Date;
    constructor(from: Date, to: Date) {
        this.from = from;
        this.to = to;
    }

    public equals(other: Timespan | undefined | null) {
        if (!other) return false;
        return this.from.getTime() === other.from.getTime() && this.to.getTime() === other.to.getTime();
    }

    public days(): number {
        let start = moment(this.from);
        let end = moment(this.to);
        return end.diff(start, "days");
    }

    public toLabel(): string {
        return `${this.from.toLocaleDateString()} - ${this.to.toLocaleDateString()}`;
    }

    public toITLabel(): string {
        return `${this.from.toLocaleDateString(it.code)} - ${this.to.toLocaleDateString(it.code)}`;
    }

    public toExtendedLabel(): string {
        return `${this.from} - ${this.to}`;
    }
    public toMonthYearLabel(): string {
        return `${this.from.getMonth() + 1}/${this.from.getFullYear()} - ${
            this.to.getMonth() + 1
        }/${this.to.getFullYear()}`;
    }

    public fits(date: Date): boolean {
        return date >= this.from && date <= this.to;
    }

    public static empty(): Timespan {
        return new Timespan(new Date(), new Date());
    }

    // #region Factories

    public static today(): Timespan {
        var now = new DateBuilder();
        return new Timespan(
            now.withTime({ hours: 0, minutes: 0, seconds: 0 }).get(),
            now.withTime({ hours: 23, minutes: 59, seconds: 59 }).get()
        );
    }
    public static yesteday(): Timespan {
        var now = new DateBuilder();
        return new Timespan(
            now
                .withDate({ day: now.get().getDate() - 1 })
                .withTime({ hours: 0, minutes: 0, seconds: 0 })
                .get(),
            now
                .withDate({ day: now.get().getDate() - 1 })
                .withTime({ hours: 23, minutes: 59, seconds: 59 })
                .get()
        );
    }
    public static lastWeek(): Timespan {
        var now = new DateBuilder();
        const day = now.get().getDay() - 1;
        return new Timespan(
            now
                .withDate({ day: now.get().getDate() - (day + 7) })
                .withTime({ hours: 0, minutes: 0, seconds: 0 })
                .get(),
            now
                .withDate({ day: now.get().getDate() - (day + 1) })
                .withTime({ hours: 23, minutes: 59, seconds: 59 })
                .get()
        );
    }
    public static thisWeek(): Timespan {
        var now = new DateBuilder();
        const day = now.get().getDay() - 1;
        return new Timespan(
            now
                .withDate({ day: now.get().getDate() - day })
                .withTime({ hours: 0, minutes: 0, seconds: 0 })
                .get(),
            now
                .withDate({ day: now.get().getDate() - (day - 6) })
                .withTime({ hours: 23, minutes: 59, seconds: 59 })
                .get()
        );
    }
    public static lastMonth(): Timespan {
        var now = new DateBuilder();
        return new Timespan(
            now
                .withDate({ month: now.get().getMonth() - 1, day: 1 })
                .withTime({ hours: 0, minutes: 0, seconds: 0 })
                .get(),
            now
                .withDate({ month: now.get().getMonth() - 1, day: this.getMonthDays(now.get().getMonth() - 1) })
                .withTime({ hours: 23, minutes: 59, seconds: 59 })
                .get()
        );
    }

    public static last8MonthsToFuture4months() : Timespan {
        let now = new Date();
        const currentMonth = now.getMonth();
        return new Timespan(
            new DateBuilder()
                .withDate({ month: currentMonth - 7, day: 1 })
                .withTime({ hours: 0, minutes: 0, seconds: 0 })
                .get(),
            new DateBuilder()
                .withDate({ month: currentMonth + 4, day: 31 })
                .withTime({ hours: 23, minutes: 59, seconds: 59 })
                .get()
        );
    };

    public static thisMonth(): Timespan {
        var now = new DateBuilder();
        return new Timespan(
            now.withDate({ day: 1 }).withTime({ hours: 0, minutes: 0, seconds: 0 }).get(),
            now.withDate({ day: 31 }).withTime({ hours: 23, minutes: 59, seconds: 59 }).get()
        );
    }
    public static lastQuarter(): Timespan {
        let now = new Date();
        return this.getQuarter(
            new DateBuilder(now)
                .withDate({ month: now.getMonth() - 3 })
                .withTime({ hours: 0, minutes: 0, seconds: 0 })
                .get()
        );
    }
    public static lastQuarterLastYear(): Timespan {
        let now = new Date();
        return this.getQuarter(
            new DateBuilder(now)
                .withDate({ month: now.getMonth() - 3, year: now.getFullYear() - 1 })
                .withTime({ hours: 0, minutes: 0, seconds: 0 })
                .get()
        );
    }
    public static thisQuarterLastYear(): Timespan {
        let now = new Date();
        return this.getQuarter(
            new DateBuilder(now)
                .withDate({ year: now.getFullYear() - 1 })
                .withTime({ hours: 0, minutes: 0, seconds: 0 })
                .get()
        );
    }
    public static thisQuarterToDate(): Timespan {
        const quarter = this.getQuarter(new Date());
        return new Timespan(quarter.from, new Date());
    }
    public static thisQuarterToDateLastYear(): Timespan {
        let now = new Date();
        let nowLastYear = new DateBuilder(now).withDate({ year: now.getFullYear() - 1 }).get();
        const quarter = this.getQuarter(nowLastYear);
        return new Timespan(quarter.from, nowLastYear);
    }
    public static thisQuarter(): Timespan {
        return this.getQuarter(new Date());
    }
    public static previousLastQuarter(): Timespan {
        let now = new Date();
        return this.getQuarter(
            new DateBuilder(now)
                .withDate({ month: now.getMonth() - 6 })
                .withTime({ hours: 0, minutes: 0, seconds: 0 })
                .get()
        );
    }
    public static lastYear(): Timespan {
        let now = new Date();
        return new Timespan(
            new DateBuilder()
                .withDate({ year: now.getFullYear() - 1, month: 0, day: 1 })
                .withTime({ hours: 0, minutes: 0, seconds: 0 })
                .get(),
            new DateBuilder()
                .withDate({ year: now.getFullYear() - 1, month: 11, day: 31 })
                .withTime({ hours: 23, minutes: 59, seconds: 59 })
                .get()
        );
    }
    public static pastYear(amount: number): Timespan {
        let now = new Date();
        return new Timespan(
            new DateBuilder()
                .withDate({ year: now.getFullYear() - amount, month: 0, day: 1 })
                .withTime({ hours: 0, minutes: 0, seconds: 0 })
                .get(),
            new DateBuilder()
                .withDate({ year: now.getFullYear() - amount, month: 11, day: 31 })
                .withTime({ hours: 23, minutes: 59, seconds: 59 })
                .get()
        );
    }
    public static yearToDateLastYear(): Timespan {
        let now = new Date();
        return new Timespan(
            new DateBuilder()
                .withDate({ year: now.getFullYear() - 1, month: 0, day: 1 })
                .withTime({ hours: 0, minutes: 0, seconds: 0 })
                .get(),
            new DateBuilder()
                .withDate({ year: now.getFullYear() - 1 })
                .withTime({ hours: 0, minutes: 0, seconds: 0 })
                .get()
        );
    }
    public static lastFiscalYear(): Timespan {
        let now = new Date();
        return new Timespan(
            new DateBuilder()
                .withDate({ year: now.getFullYear() - 1, month: 0, day: 1 })
                .withTime({ hours: 0, minutes: 0, seconds: 0 })
                .get(),
            new DateBuilder()
                .withDate({ year: now.getFullYear() - 1, month: 11, day: 31 })
                .withTime({ hours: 23, minutes: 59, seconds: 59 })
                .get()
        );
    }

    public static previouslastFiscalYear(): Timespan {
        let now = new Date();
        return new Timespan(
            new DateBuilder()
                .withDate({ year: now.getFullYear() - 2, month: 0, day: 1 })
                .withTime({ hours: 0, minutes: 0, seconds: 0 })
                .get(),
            new DateBuilder()
                .withDate({ year: now.getFullYear() - 2, month: 11, day: 31 })
                .withTime({ hours: 23, minutes: 59, seconds: 59 })
                .get()
        );
    }
    public static yearToDate(): Timespan {
        let now = new DateBuilder();
        return new Timespan(
            now.withDate({ month: 0, day: 1 }).withTime({ hours: 0, minutes: 0, seconds: 0 }).get(),
            now.get()
        );
    }

    public static yearToDateWithEndDate( endDate: Date): Timespan {
        let now = new DateBuilder(endDate);
        return new Timespan(
            now.withDate({ month: 0, day: 1 }).withTime({ hours: 0, minutes: 0, seconds: 0 }).get(),
            now.get()
        );
    }

    public static thisYear(): Timespan {
        let now = new DateBuilder();
        return new Timespan(
            now.withDate({ month: 0, day: 1 }).withTime({ hours: 0, minutes: 0, seconds: 0 }).get(),
            now.withDate({ month: 11, day: 31 }).withTime({ hours: 23, minutes: 59, seconds: 59 }).get()
        );
    }
    public static last12Months(): Timespan {
        let now = new DateBuilder();
        return new Timespan(now.withDate({ month: now.get().getMonth() - 12 }).get(), now.get());
    }
    public static previous12Months(): Timespan {
        let now = new DateBuilder();
        return new Timespan(
            now.withDate({ month: now.get().getMonth() - 24 }).get(),
            now.withDate({ month: now.get().getMonth() - 12 }).get()
        );
    }
    public static lastNMonths(n: number): Timespan {
        let now = new DateBuilder();
        return new Timespan(
            now.withDate({ month: now.get().getMonth() - 1 - n }).get(),
            now.withDate({ month: now.get().getMonth() - 1 }).get()
        );
    }

    public static lastNDays(n: number): Timespan {
        let now = new DateBuilder();
        return new Timespan(
            now.withDate({ day: now.get().getDate() - n }).get(),
            now.withDate({ day: now.get().getDate() }).get()
        );
    }
    public static previousNMonths(n: number): Timespan {
        let now = new DateBuilder();
        return new Timespan(
            now.withDate({ month: now.get().getMonth() - 2 - n * 2 }).get(),
            now.withDate({ month: now.get().getMonth() - 2 - n }).get()
        );
    }
    public static all(): Timespan {
        const start = new Date(0);
        const end = new Date();
        return new Timespan(start, end);
    }

    public static since2020(): Timespan {
        const start = new Date(2020, 0, 1);
        const end = new Date();
        return new Timespan(start, end);
    }

    // #endregion

    public static getDailyIntervals(timespan: Timespan): Timespan[] {
        const timespans: Timespan[] = [];
        let current = new DateBuilder(timespan.from).withTime({ hours: 0, minutes: 0, seconds: 0 });
        while (current.get().getTime() < timespan.to.getTime()) {
            const newTimespan = new Timespan(
                current.get(),
                current
                    .withDate({ day: current.get().getDate() + 1 })
                    .withTime({ hours: 11, minutes: 59, seconds: 59 })
                    .get()
            );
            timespans.push(newTimespan);
            current = current.withDate({ day: current.get().getDate() + 1 });
        }
        return timespans;
    }
    public static getWeeklyIntervals(timespan: Timespan): Timespan[] {
        const timespans: Timespan[] = [];
        const day = timespan.from.getDay() - 1;
        let current = new DateBuilder(timespan.from)
            .withDate({ day: timespan.from.getDate() - day })
            .withTime({ hours: 0, minutes: 0, seconds: 0 });
        while (current.get().getTime() < timespan.to.getTime()) {
            const newTimespan = new Timespan(
                current.get(),
                current
                    .withDate({ day: current.get().getDate() + 6 })
                    .withTime({ hours: 11, minutes: 59, seconds: 59 })
                    .get()
            );
            timespans.push(newTimespan);
            current = current.withDate({ day: current.get().getDate() + 7 });
        }
        return timespans;
    }
    public static getMonthlyIntervals(timespan: Timespan): Timespan[] {
        const timespans: Timespan[] = [];
        let current = new DateBuilder(timespan.from)
            .withDate({ day: 1 })
            .withTime({ hours: 0, minutes: 0, seconds: 0 });
        while (current.get().getTime() < timespan.to.getTime()) {
            const newTimespan = new Timespan(
                current.get(),
                current
                    .withDate({ day: Timespan.getMonthDays(current.get().getMonth(), current.get().getFullYear()) })
                    .withTime({ hours: 11, minutes: 59, seconds: 59 })
                    .get()
            );
            timespans.push(newTimespan);
            current = current.withDate({ month: current.get().getMonth() + 1 });
        }
        return timespans;
    }
    public static getQuarterlyIntervals(timespan: Timespan): Timespan[] {
        const timespans: Timespan[] = [];
        let current = new DateBuilder(timespan.from)
            .withDate({ day: 1 })
            .withTime({ hours: 0, minutes: 0, seconds: 0 });
        while (current.get().getTime() < timespan.to.getTime()) {
            const newTimespan = new Timespan(
                current.get(),
                current
                    .withDate({ month: current.get().getMonth() + 3 })
                    .withTime({ hours: 11, minutes: 59, seconds: 59 })
                    .get()
            );
            timespans.push(newTimespan);
            current = current.withDate({ month: current.get().getMonth() + 3 });
        }
        return timespans;
    }
    public static getQuarter(d: Date) {
        let quartersBounds = [
            [
                new DateBuilder()
                    .withDate({ year: d.getFullYear(), month: 0, day: 1 })
                    .withTime({ hours: 0, minutes: 0, seconds: 0 })
                    .get(),
                new DateBuilder(new Date(d.getFullYear(), 2, 31))
                    .withTime({ hours: 23, minutes: 59, seconds: 59 })
                    .get(),
            ],
            [
                new DateBuilder(new Date(d.getFullYear(), 3, 1)).withTime({ hours: 0, minutes: 0, seconds: 0 }).get(),
                new DateBuilder(new Date(d.getFullYear(), 5, 31))
                    .withTime({ hours: 23, minutes: 59, seconds: 59 })
                    .get(),
            ],
            [
                new DateBuilder(new Date(d.getFullYear(), 6, 1)).withTime({ hours: 0, minutes: 0, seconds: 0 }).get(),
                new DateBuilder(new Date(d.getFullYear(), 8, 31))
                    .withTime({ hours: 23, minutes: 59, seconds: 59 })
                    .get(),
            ],
            [
                new DateBuilder()
                    .withDate({ year: d.getFullYear(), month: 9, day: 1 })
                    .withTime({ hours: 0, minutes: 0, seconds: 0 })
                    .get(),
                new DateBuilder(new Date(d.getFullYear(), 11, 31))
                    .withTime({ hours: 23, minutes: 59, seconds: 59 })
                    .get(),
            ],
        ];
        for (const q of quartersBounds) {
            if (d.getMonth() >= q[0].getMonth() && d.getTime() <= q[1].getTime()) {
                return new Timespan(q[0], q[1]);
            }
        }
        return new Timespan(quartersBounds[-1][0], quartersBounds[-1][1]);
    }

    public static getMonthDays(monthIndex: number, year?: number): number {
        return new Date(year ?? new Date().getFullYear(), monthIndex + 1, 0).getDate();
    }
    public static getLastFullyEndedQuarter(): Timespan {
        let now = new Date();
        let quarter = this.getQuarter(now);
        if (now.getTime() < quarter.to.getTime()) {
            return this.getQuarter(new Date(now.getFullYear() - 1, 11, 31));
        }
        return quarter;
    }

    public static  getLastFullyEndedQuarterDates(currentDate: Date):Timespan {
        const currentMonth = currentDate.getMonth();
      
        let quarterStartDate, quarterEndDate;
      
        if (currentMonth >= 0 && currentMonth <= 2) {
          // Current quarter is Q1
          quarterStartDate = new Date(currentDate.getFullYear() - 1, 9, 1);
          quarterEndDate = new Date(currentDate.getFullYear() - 1, 11, 31);
        } else if (currentMonth >= 3 && currentMonth <= 5) {
          // Current quarter is Q2
          quarterStartDate = new Date(currentDate.getFullYear(), 0, 1);
          quarterEndDate = new Date(currentDate.getFullYear(), 2, 31);
        } else if (currentMonth >= 6 && currentMonth <= 8) {
          // Current quarter is Q3
          quarterStartDate = new Date(currentDate.getFullYear(), 3, 1);
          quarterEndDate = new Date(currentDate.getFullYear(), 5, 30);
        } else {
          // Current quarter is Q4
          quarterStartDate = new Date(currentDate.getFullYear(), 6, 1);
          quarterEndDate = new Date(currentDate.getFullYear(), 8, 30);
        }
      
        return new Timespan(quarterStartDate, quarterEndDate);
      }
    
    public static  getYesterdaysDate(today: Date): Date {
        return new Date(today.getTime() - (24 * 60 * 60 * 1000));
      }

    // Get the last 4 fully ended quarters starting from a date
    public static getLastFullyEndedNQuarters = (date: Date, n: number): Timespan[] => {
        let currentDate = new Date(date);
        let currentMonth = currentDate.getMonth();
        let currentYear = currentDate.getFullYear();

        const quarters = [];

        for (let i = 0; i < n; i++) {
            let quarterStartDate, quarterEndDate;
            if (currentMonth >= 0 && currentMonth <= 2) {
                // Current quarter is Q1
                quarterStartDate = new Date(currentYear - 1, 9, 1);
                quarterEndDate = new Date(currentYear - 1, 11, 31);
              } else if (currentMonth >= 3 && currentMonth <= 5) {
                // Current quarter is Q2
                quarterStartDate = new Date(currentYear, 0, 1);
                quarterEndDate = new Date(currentYear, 2, 31);
              } else if (currentMonth >= 6 && currentMonth <= 8) {
                // Current quarter is Q3
                quarterStartDate = new Date(currentYear, 3, 1);
                quarterEndDate = new Date(currentYear, 5, 30);
              } else {
                // Current quarter is Q4
                quarterStartDate = new Date(currentYear, 6, 1);
                quarterEndDate = new Date(currentYear, 8, 30);
              }
            

            const quarter = new Timespan(quarterStartDate, quarterEndDate);
            quarters.push(quarter);

            currentDate = quarterStartDate
            currentMonth = currentDate.getMonth();
            currentYear = currentDate.getFullYear();
        }
        return quarters;

    }

    // Get the start date and the last date of the last n fully ended quarters starting from a date
    // public static getLastFullyEndedNQuartersBounds = (date: Date, n: number): Timespan => {
    //     const quarters = Timespan.getLastFullyEndedNQuarters(date, n);
    //     return new Timespan(quarters[quarters.length - 1].from, quarters[0].to);
    // }

    public static getLastFourQuarters(date = new Date()) {
        const quarters = [];
        const currentDate = new Date(date);
        const currentYear = currentDate.getFullYear();
        const currentQuarter = Math.floor(currentDate.getMonth() / 3);

        for (let i = 0; i < 4; i++) {
            const quarterNumber = (currentQuarter - i + 4) % 4;
            const year = currentYear - Math.floor(i / 4) - (quarterNumber > currentQuarter ? 1 : 0);

            const startDate = new Date(year, quarterNumber * 3, 1);
            const endDate = new Date(year, quarterNumber * 3 + 3, 0);
            const timespan = new Timespan(startDate, endDate);
            quarters.push(timespan);
      }
      return quarters;

    }

    // Get the start date and the last date of the last n fully ended quarters starting from a date
    public static getLastFullyEndedNQuartersBounds = (date: Date, n: number): Timespan => {
        const quarters = Timespan.getLastFourQuarters(date);
        return new Timespan(quarters[quarters.length - 1].from, quarters[0].to);
    }

    public static getLastMonthDate(currentDate: Date): Date {
        let lastMonth = new Date(currentDate);
        lastMonth.setMonth(lastMonth.getMonth() - 1);
        return lastMonth;
    }

    public static getLastDayOfCurrentMonth() {
        const now = new Date();
        const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        return lastDay;
      }

    public static getLastMonthTimespan = (currentDate: Date): Timespan => {
        // const lastMonth = Timespan.getLastMonthDate(currentDate);
        const lastMonth = new Date(currentDate);
        return new Timespan(
            new Date(lastMonth.getFullYear(), lastMonth.getMonth(), 1),
            new Date(lastMonth.getFullYear(), lastMonth.getMonth() + 1, 0)
        );
    }
    public static getFirstDayOfYear(date :Date): Date {
        return new DateBuilder(date).withDate({ month: 0, day: 1 }).withTime({ hours: 0, minutes: 0, seconds: 0 }).get()
    }

    public getYearMonthList() {
        let current = new Date(this.from);
        let list = [];
        while (current.getTime() <= this.to.getTime()) {
            list.push({ year: current.getFullYear(), month: current.getMonth() +1 });
            current = new Date(current.getFullYear(), current.getMonth() + 1, 1);
        }
        return list;
    }
}
