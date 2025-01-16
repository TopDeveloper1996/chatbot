/**Returns a number `[0-1]` indicating the similarity ratio between two strings */
export function similarity(t: string, v: string, caseSensitive: boolean = false): number {
    var minSeq = t.length < v.length ? (caseSensitive ? t : t.toLowerCase()) : caseSensitive ? v : v.toLowerCase();
    var maxSeq = t.length < v.length ? (caseSensitive ? v : v.toLowerCase()) : caseSensitive ? t : t.toLowerCase();

    var maxMatch = 0;
    // Convolution
    for (var i = 0; i < maxSeq.length; i++) {
        var cost = 0;
        if (i + minSeq.length > maxSeq.length) return maxMatch / minSeq.length;
        for (var j = 0; j < minSeq.length; j++) {
            cost += maxSeq[i + j] == minSeq[j] ? 1 : 0;
        }
        maxMatch = Math.max(maxMatch, cost);
    }
    return maxMatch / minSeq.length;
}
export function isNullOrEmpty(s: string | undefined | null): boolean {
    return s === undefined || s === null || s.length <= 0;
}

export function wordCapitalize(s: string | undefined | null): string | undefined | null {
    if (isNullOrEmpty(s)) return s;
    let splits = s?.split(" ");
    return splits?.map((s) => capitalize(s)).join(" ");
}

export function stringToF24Category(cat: string): F24Category | undefined {
    if (Object.values(F24Category).some((c: string) => c === cat)) return <F24Category>cat;
    else return undefined;
}

export function percentageVariation(first: any, second: any): string {
    const percentage = Math.sign(second - first) * 100 * (Math.abs(second - first) / Math.abs(first));
    return percentage.toLocaleString(undefined, { maximumFractionDigits: 2 }) + " %";
}

export function capitalize(s: string | undefined | null): string | undefined | null {
    if (isNullOrEmpty(s)) return s;
    return s!.charAt(0).toUpperCase() + s!.slice(1).toLowerCase();
}

export function toCurrencyString(v: any): string {
    return `${v?.toLocaleString(undefined, { maximumNumberOfFractionDigits: 1 })} €`;
}

export function toShortCurrencyString(v: number): string {
    if (v === undefined) return "0 €";
    let sign = Math.sign(v);
    let str = (Math.abs(v).toString() as string).split(".")[0];
    if (str.length > 6) {
        str = `${str.slice(0, str.length - 6)}.${str.slice(-6, -4)}M`;
    } else if (str.length > 3) {
        str = `${str.slice(0, str.length - 3)}.${str.slice(-3, -1)}K`;
    }
    if (sign < 0) {
        return `-${str} €`;
    }
    return `${str} €`;
}

export function roundNumber(v: number, decimals: number): number {
    return  Math.round(v * Math.pow(10, decimals)) / Math.pow(10, decimals);
}

export function toMonthYearString(date: Date, locale = "it"): string {
    return `${date.toLocaleString(locale, { month: "long" })} ${date.getFullYear()}`;
}
export const validateEmail = (email:string) => {
    return String(email)
      .toLowerCase()
      .match(
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
      );
  };

export const OR_SEARCH_SEPARATOR = ",";