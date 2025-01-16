import { error } from "~/server/src/response";
import * as XLSX from 'xlsx';
import PdfParse from 'pdf-parse';
import { BlobServiceClient } from "@azure/storage-blob"
import { ArticleContent } from "~/src/types/ai_agent_types";

const config = useAppConfig()
const blobServiceClient = BlobServiceClient.fromConnectionString(
    config.azureConnectionString)
const containerClient = blobServiceClient.getContainerClient("text-documents")

const domain = (url: string) => new URL(url).hostname;

export default defineEventHandler(async (event) => {
    try {
        const body = JSON.parse(await readBody(event));
        const website = domain(body.link);

        const excel_name = website + "/metadata.xlsx";
        if (body === undefined) {
            return error(event, 404, "Converstational agent not found");
        }
        const blobClient = containerClient.getBlobClient(excel_name);

    // Download blob content
    const downloadBlockBlobResponse = await blobClient.download(0);
    const downloadedContent = await streamToBuffer(downloadBlockBlobResponse.readableStreamBody);

    const workbook = XLSX.read(downloadedContent, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const jsonData: Record<string, any>[] = XLSX.utils.sheet_to_json(worksheet);
    const matchingRows = jsonData.filter(row => row['title']?.includes(body.title));

    const results: Array<ArticleContent> = [];

    for (const row of matchingRows) {
      if (row['path_to_text']) {
        const fileBlobClient = containerClient.getBlobClient(row['path_to_text']);
        const fileDownloadResponse = await fileBlobClient.download(0);
        const fileBuffer = await streamToBuffer(fileDownloadResponse.readableStreamBody);

        let content: string;
        if (row['path_to_text'].endsWith('.txt')) {
          content = fileBuffer.toString('utf-8');
        } else if (row['path_to_text'].endsWith('.pdf')) {
          const pdfData = await PdfParse(fileBuffer);
          content = pdfData.text;
        } else {
          content = 'Unsupported file type';
        }
        results.push({ title: row['title'], content: content, blob_link: row['path_to_text'] });
      }
    }
        return { result: results}
    } catch (ex: any) {
        console.log(ex);
        throw createError({
            statusCode: 422,
            message: ex.toString(),
        });
    }
});

async function streamToBuffer(readableStream: NodeJS.ReadableStream | undefined): Promise<Buffer> {
    if (!readableStream) {
      throw new Error('Readable stream is null');
    }
    
    return new Promise((resolve, reject) => {
      const chunks: Buffer[] = [];
      readableStream.on('data', (data) => {
        chunks.push(data instanceof Buffer ? data : Buffer.from(data));
      });
      readableStream.on('end', () => {
        resolve(Buffer.concat(chunks));
      });
      readableStream.on('error', reject);
    });
  }