import { error } from "~/server/src/response";
import * as XLSX from 'xlsx';
import PdfParse from 'pdf-parse';
import { BlobServiceClient } from "@azure/storage-blob"
import { ArticleContent } from "~/src/types/ai_agent_types";

const config = useAppConfig()
const blobServiceClient = BlobServiceClient.fromConnectionString(
    config.azureConnectionString)
const containerClient = blobServiceClient.getContainerClient("text-documents")

export default defineEventHandler(async (event) => {
    try {
        let raw = await readBody(event);
        const body = JSON.parse(raw);
        const filePath = body.filePath;


        if (!filePath) {
            return error(event, 400, "File path is required");
        }

        const blobClient = containerClient.getBlobClient(filePath);
        const downloadBlockBlobResponse = await blobClient.download(0);

        event.res.setHeader('Content-Disposition', `attachment; filename="${filePath.split('/').pop()}"`);
        event.res.setHeader('Content-Type', downloadBlockBlobResponse.contentType || 'application/octet-stream');

        downloadBlockBlobResponse.readableStreamBody?.pipe(event.res);

        return event.res;
    } catch (ex: any) {
        console.error(ex);
        throw createError({
            statusCode: 500,
            message: "Failed to download file",
        });
    }
});