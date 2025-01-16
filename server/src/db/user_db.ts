import postgres from "postgres";
import { Log } from "../logger";

export default class UserDatabase {
    private static instance: UserDatabase | undefined = undefined;
    private client: postgres.Sql;

    public ready(): boolean {
        return UserDatabase.instance !== undefined;
    }

    private constructor(client: postgres.Sql) {
        this.client = client;
    }

    public static async get(): Promise<postgres.Sql> {
        if (this.instance === undefined) {
            const config = useRuntimeConfig();
            const sql = postgres({
                host: config.userDb.host,
                port: config.userDb.port,
                database: config.userDb.database,
                username: config.userDb.user,
                password: config.userDb.password,
                ssl: { rejectUnauthorized: false },
            });
            UserDatabase.instance = new UserDatabase(sql);
            Log.info("connected to user database endpoint");
        }
        return UserDatabase.instance!.client;
    }
}
