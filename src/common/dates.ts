import { it } from "date-fns/locale";
import { format, parseISO } from "date-fns";


export const dateToUTC = (date: Date): Date => {
    return new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours(), date.getMinutes(), date.getSeconds()));
}


export const getCurrentYear = (): number => {
    return new Date().getFullYear();
}

export const getLastFiscalYear = (): number => {
    return new Date().getFullYear() - 1;
}

export const getLastMonthDate = (date:Date): Date => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0)
}

export const getDateLabel = (date: Date): string => {
    return date.toLocaleDateString(it.code);
}
export const getTheCurrentQuarterWithYear = (date: Date) => {
    const month = date.getMonth();
    const quarter = Math.floor(month / 3) + 1;
    return `Q ${quarter} ${date.getFullYear()}`;
}

export const formatDate = (date: Date, to_format: string = 'MM/dd/yyyy'): string => {
    return format(date, to_format)
}

export const strToDateLabel = (date : string): string => {
    return getDateLabel(parseISO(date));
}