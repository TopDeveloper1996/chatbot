import * as mongo from "mongodb";
import { Log } from "../logger";

export enum Database {
    ditta = "ditta",
    invoice = "invoice",
    f24 = "f24",
    fee = "fee",
}

export default class AnalyticsDatabase {
    private static instance: AnalyticsDatabase | undefined = undefined;
    private client: mongo.MongoClient;
    private static initPromise: Promise<mongo.MongoClient> | undefined = undefined;

    public ready(): boolean {
        return AnalyticsDatabase.instance !== undefined;
    }

    private constructor(client: mongo.MongoClient) {
        this.client = client;
    }

    public static async get(): Promise<mongo.MongoClient> {
        if (this.initPromise !== undefined) return await this.initPromise;
        if (AnalyticsDatabase.instance === undefined) {
            const config = useRuntimeConfig();
            this.initPromise = mongo.MongoClient.connect(config.mongo.uri);
            let db = await this.initPromise;
            AnalyticsDatabase.instance = new AnalyticsDatabase(db);
            Log.info("connected to analytics database endpoint");
        }
        return AnalyticsDatabase.instance!.client;
    }

    public static async getDb(db: Database): Promise<mongo.Db> {
        let client = await AnalyticsDatabase.get();
        return client.db(db);
    }
}
