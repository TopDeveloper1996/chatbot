import postgres from "postgres";
import { Log } from "../logger";

export default class ScraperDatabase {
    private static instance: ScraperDatabase | undefined = undefined;
    private client: postgres.Sql;

    public ready(): boolean {
        return ScraperDatabase.instance !== undefined;
    }

    private constructor(client: postgres.Sql) {
        this.client = client;
    }

    public static async get(): Promise<postgres.Sql> {
        if (this.instance === undefined) {
            const config = useRuntimeConfig();
            const sql = postgres({
                host: config.scraperDb.host,
                port: config.scraperDb.port,
                database: config.scraperDb.database,
                username: config.scraperDb.user,
                password: config.scraperDb.password,
                ssl: { rejectUnauthorized: false },
            });
            ScraperDatabase.instance = new ScraperDatabase(sql);
            Log.info("connected to scraper database endpoint");
        }
        return ScraperDatabase.instance!.client;
    }
}
