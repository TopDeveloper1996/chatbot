import postgres from "postgres";
import { Log } from "../logger";

export default class ParserDatabase {
    private static instance: ParserDatabase | undefined = undefined;
    private client: postgres.Sql;

    public ready(): boolean {
        return ParserDatabase.instance !== undefined;
    }

    private constructor(client: postgres.Sql) {
        this.client = client;
    }

    public static async get(): Promise<postgres.Sql> {
        if (this.instance === undefined) {
            const config = useRuntimeConfig();
            const sql = postgres({
                host: config.parserDb.host,
                port: config.parserDb.port,
                database: config.parserDb.database,
                username: config.parserDb.user,
                password: config.parserDb.password,
                ssl: { rejectUnauthorized: false },
            });
            ParserDatabase.instance = new ParserDatabase(sql);
            Log.info("connected to parser database endpoint");
        }
        return ParserDatabase.instance!.client;
    }
}
