export default class Decorators {
    static profiled<T>(func: () => Promise<T>): Promise<T> {
        const start = performance.now();
        const promise = func();
        const name = /()[ ]?=>[ ](?<name>[a-zA-Z0-9.]+)/.exec(func.toString());
        promise.then((_) =>
            console.log(`[${name?.groups?.["name"] ?? func}] completed in ${(performance.now() - start).toFixed(3)} ms`)
        );
        return promise;
    }
}
