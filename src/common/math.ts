export function variation(first: number, second: number): number {
    return Math.sign(second - first) * (Math.abs(second - first) / Math.abs(first));
}
export function percentage(first: any, second: any): number {
    const val = Math.sign(second - first) * 100 * (Math.abs(second - first) / Math.abs(first));
    return val;
}

export const formatPercentage = (number : number, fixedTo = 1) => {
    // Format a number as a percentage string, with 1 decimal digit
    if (isNaN(number) || number === Number.NEGATIVE_INFINITY || number === Number.POSITIVE_INFINITY){
        return "N.D";
    }
    return (number * 100).toFixed(fixedTo) + "%";
}

export const getMaxMin = (data: number[], margin=0 ) => {
    // Get the maximum and minimum values from an array of numbers
    let bounds= {
        max: Math.max(...data) ?? 0,
        min: Math.min(...data) ?? 0
    };
    if (margin > 0){
        const diff = bounds.max - bounds.min;
        bounds.max += diff * margin;
        bounds.min -= diff * margin;
        

    }
    return bounds;
}