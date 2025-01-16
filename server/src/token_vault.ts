import fs from "fs";
import { Options } from "./config/config";
import { Log } from "./logger";
export default class TokenVault {
    private static path: string = "./session_token_vault.json";
    public static instance: TokenVault = new TokenVault();
    private constructor() {
        this.deserialize();
    }

    tokenMap: any = {};

    public addToken(customer_id: string, token: string, data: any): any {
        data.session_token = token;
        let now = new Date();
        let expirationDate = now.getTime() + Options.sessionTokenExpirationMs;
        data.expiration_timestamp = expirationDate;
        this.tokenMap[customer_id] = data;
        this.serialize();
        return data;
    }

    public get(): any {
        return { ...this.tokenMap };
    }
    public clear(): void {
        this.tokenMap.clear();
        this.serialize();
    }

    private serialize() {
        try {
            fs.writeFileSync(TokenVault.path, JSON.stringify(this.tokenMap, undefined, "  "));
            Log.info("session token vault serialized:\n" + JSON.stringify(this.tokenMap, undefined, "  "));
        } catch (e) {
            Log.error("error serializing vault: " + e);
        }
    }
    private deserialize() {
        try {
            if (!fs.existsSync(TokenVault.path)) {
                Log.info("no token vault file found");
                return;
            }
            let data = fs.readFileSync(TokenVault.path, "utf-8");
            this.tokenMap = JSON.parse(data);
            Log.info("token vault deserialized from disk:\n" + JSON.stringify(this.tokenMap, undefined, "  "));
        } catch (e) {
            Log.warn("impossible to load token vault");
        }
    }

    public getData(customer_id: string | undefined): any | undefined {
        if (!customer_id) return undefined;
        return this.tokenMap[customer_id];
    }
}
