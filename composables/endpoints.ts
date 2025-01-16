export const useEndpoints = () => {
    return Object.freeze({
        invoice: "invoice",
        f24: "f24",
        fee: "fee",
        authVerify: "auth/verify",
        authLogin: "auth/login",
        settings: "user/settings",
        userDittas: "user/dittas",
        dittasReports: "user/dittas_reports",
        userDittasContacts: "user/dittas_contacts",
        userDittaInfo: "user/ditta_info",
        userNotificationContact: "/api/user/settings",
        processStatistics: "/api/process_statistics",
        teamSystem: "/api/teamsystem",
        teamSystemReport: "/api/teamsystem_report",
        teamSystemDownloadReport: "/api/teamsystem_download_report",
        ditta_360_Report: "/api/ditta_360_report",
        dittaReportDownload: "/api/ditta_report_download",
        dittaUserProvidedData: "/api/ditta_user_provided_data",
        teamSystemQueue: "/api/teamsystem_queue",
        dittaIncomeStatement: "/api/ditta_income_statement_input",
        checkteamsystem_expiration: "user/check_teamsystem_is_expired",
        sendEmail: "/api/send_email",
        azureBlobHandler: "/api/azure_blob_handler",
        ditta360UploadLog: "/api/ditta_360_uploader_logs",
        ditta360UploadDataProcessor: "/api/ditta_360_upload_data_processor"
    });
};
