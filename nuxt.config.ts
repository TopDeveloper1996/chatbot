import pkg from "./package.json";

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
    devtools: { enabled: false },
    telemetry: true,
    appConfig: {
        version: pkg.version,
        auth: process.env.API_TOKEN,
        pineconeApiKey: process.env.PINECONE_API_KEY,
        azureConnectionString: process.env.AZURE_BLOB_CONNECTION_STRING,
    },

    imports: {
        dirs: ["composables/**", "src/**"],
    },

    vite: {
        optimizeDeps: {
            include: ["date-fns/locale", "@vuepic/vue-datepicker", "markdown-it"],
        },
        define: {
            global: {},
        },
    },
    runtimeConfig: {
        google: {
            clientId: process.env.GOOGLE_CLOUD_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLOUD_CLIENT_SECRET,
        },
        onedrive: {
            clientId: process.env.ONEDRIVE_CLIENT_ID,
            clientSecret: process.env.ONEDRIVE_CLIENT_SECRET,
        },
        version: pkg.version,
        mongo: { uri: process.env.MONGODB_URI },
        pineconeApiKey: process.env.PINECONE_API_KEY,
        openAiApiKey: process.env.OPENAI_API_KEY,
        mailgunApiKey: process.env.MAILGUN_API_KEY,
        scraperDb: {
            database: process.env.SCRAPER_DB_DATABASE,
            user: process.env.SCRAPER_DB,
            password: process.env.SCRAPER_DB_PASSWORD,
            host: process.env.SCRAPER_DB_HOST,
            port: Number.parseInt(process.env.SCRAPER_DB_PORT!),
        },
        userDb: {
            database: process.env.USER_DB_DATABASE,
            user: process.env.USER_DB,
            password: process.env.USER_DB_PASSWORD,
            host: process.env.USER_DB_HOST,
            port: Number.parseInt(process.env.USER_DB_PORT!),
        },
        parserDb: {
            database: process.env.PARSER_DB_DATABASE,
            user: process.env.PARSER_DB,
            password: process.env.PARSER_DB_PASSWORD,
            host: process.env.PARSER_DB_HOST,
            port: Number.parseInt(process.env.PARSER_DB_PORT!),
        },
        auth: process.env.API_TOKEN,
        public: {
            ditta_report_url: process.env.DITTA_REPORT_GENETATOR_URL,
            ts_email_report_url: process.env.TS_EMAIL_REPORT_URL,
            ts_pdf_report_url: process.env.TS_PDF_REPORT_URL,
            ts_verify_credential_url: process.env.TS_VERIFY_CREDENTIAL_URL,
            ditta_email_report_url: process.env.DITTA_EMAIL_REPORT_URL,
            ditta_pdf_report_url: process.env.DITTA_PDF_REPORT_URL,
            ditta_360_upload_excel_processor_url: process.env.DITTA_360_UPLOAD_EXCEL_PROCESSOR_URL,
            defaultAzureConnectionString: process.env.DEFAULT_AZURE_BLOB_CONNECTION_STRING,
            azureStorageAccountKey: process.env.AZURE_STORAGE_PRIMARY_ACCESS_KEY,
            azureStorageAccountName: process.env.AZURE_STORAGE_ACCOUNT_NAME, 
            azureStorageStorageAccount: process.env.AZURE_STORAGE_ACCOUNT,
        },
        ditta_report_robot_url: process.env.DITTA_REPORT_ROBOT_URL,
        notification_email_receivers: process.env.NOTIFICATION_EMAIL_RECEIVERS,
        MAILGUN_AUTH: process.env.MAILGUN_AUTH
    },
    googleSignIn: {
        clientId: process.env.GOOGLE_CLOUD_CLIENT_ID,
    },
    devServer: { port: 8000 },

    tailwindcss: {
        exposeConfig: true,
    },

    nitro: {
        experimental: {
            openAPI: true,
        },
        preset: 'node-server'
    },
    icon: {
        clientBundle: {
            scan: true,
        },
        serverBundle: {
          remote: 'github-raw', // 'unpkg' or 'github-raw', or a custom function
        }
    },

    modules: ["@nuxtjs/tailwindcss", "@vueuse/nuxt", "@nuxt/icon", "@pinia/nuxt", "nuxt-vue3-google-signin","nuxt-multi-cache"],
    plugins: [{ src: "plugins/apexcharts.client.js", mode: "client" }],
    compatibilityDate: "2024-07-03",
    build: {
        transpile: ['xlsx']
    },
    multiCache: {
        // Component cache is enabled.
        component: {
          enabled: true,
        },
      
        // Data cache enabled.
        data: {
          enabled: true,
        },
      
        // Route cache is disabled. But because the `route` property is set the
        // useRouteCache composable is still added to the build, it just doesn't
        // cache.
        route: {
          enabled: false,
        },
      
        // CDN Cache Control Headers feature.
        cdn: {
          enabled: true,
      
          // Set custom cache control for Cloudflare.
          cacheControlHeader: 'CDN-Cache-Control',
      
          // Set custom cache tags header for Cloudflare.
          cacheTagHeader: 'Cache-Tag'
        },
      
        // Cache Management API.
        api: {
          enabled: true,
          prefix: '/__nuxt_multi_cache',
            authorization: 'hunter2',
          // Cache tag invaldiations should be buffered for 5 minutes before the
          // cache items are actually purged.
          cacheTagInvalidationDelay: 300000 // 5 minutes
        },
      
        // Log detailled debugging messages, e.g. when items are cached or returned from cache.
        debug: true
    },
});
