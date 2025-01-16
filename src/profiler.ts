export function profiled<FunctionType extends (...args: any[]) => any>(f: FunctionType, ...args: any[]): any {
    let start = performance.now();
    const returnValue = f(...args);
    let end = performance.now();
    console.log(`${f.name} - ${(end - start).toFixed(2)} ms`);
    return returnValue;
}

export async function profiledAsync(f: (...args: any[]) => Promise<any>, ...args: any[]): Promise<any> {
    let start = performance.now();
    const returnValue = await f(...args);
    let end = performance.now();
    console.log(`${f.name} - ${(end - start).toFixed(2)} ms`);
    return returnValue;
}
