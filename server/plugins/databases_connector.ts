import AnalyticsDatabase from "../src/db/analytics_db";
import ParserDatabase from "../src/db/parser_db";
import ScraperDatabase from "../src/db/scraper_db";
import UserDatabase from "../src/db/user_db";

export default defineNitroPlugin(async (nitroApp) => {
    try {
        await Promise.all([AnalyticsDatabase.get(), UserDatabase.get(), ScraperDatabase.get()]);
    } catch (error) {
        console.error(error);
    }
});
