export class Log {
    public static info(message: Object) {
        console.log(`[adementally] - ${message.toString()}`);
    }
    public static warn(message: Object) {
        console.log(`[adementally] Warning - ${message.toString()}`);
    }
    public static error(message: Object) {
        console.log(`[adementally] Error - ${message.toString()}`);
    }
}
