import { error } from "~/server/src/response";
// import { BlobServiceClient, StorageSharedKeyCredential } from "@azure/storage-blob"
import { 
    BlobServiceClient, 
    StorageSharedKeyCredential,
    generateBlobSASQueryParameters,
    BlobSASPermissions,
    SASProtocol
  } from '@azure/storage-blob';
import { EventHandlerRequest, H3Event } from "h3";
const config = useRuntimeConfig()
// const blobServiceClient = BlobServiceClient.fromConnectionString(config.public.defaultAzureConnectionString)

// const storageAccount = config.public.azureStorageStorageAccount
async function getblob(event: H3Event<EventHandlerRequest>): Promise<Object> {
    try {
        const body = await readBody(event);
        // const body = JSON.parse(raw);
        const filePath = body.filePath;
        const containerName = body.containerName;
        
        const sasUrl =  generateSasUrlForLogsContainer(containerName);
        const blobServiceClient = new BlobServiceClient(sasUrl);
        // const blobServiceClient =  BlobServiceClient.fromConnectionString(sasUrl);
        const containerClient = blobServiceClient.getContainerClient('')

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
            message: `Server Failed to download template: ${ex}`,
        });
    }
};

async function uploadblob(event: H3Event<EventHandlerRequest>): Promise<Object> {
    try {
        
        const formData = await readMultipartFormData(event);
        if (!formData) throw new Error('No form data received');

        // Extract file and other data
        const file = formData.find(item => item.name === 'file');
        const filePath = formData.find(item => item.name === 'filePath')?.data.toString();
        const containerName = formData.find(item => item.name === 'containerName')?.data.toString();

        const sasUrl =  generateSasUrlForLogsContainer(containerName ?? '');
        const blobServiceClient = new BlobServiceClient(sasUrl);

        if (!file || !filePath || !containerName) {
        throw new Error('Missing required upload data');
        }

      
        const containerClient = blobServiceClient.getContainerClient('');
        const blobClient = containerClient.getBlobClient(filePath);
        const blockBlobClient = blobClient.getBlockBlobClient();
        // Upload the file buffer
        const uploadBlobResponse = await blockBlobClient.uploadData(file.data, {
            blobHTTPHeaders: {
            blobContentType: file.type
            }
        });
        console.log(`Upload block blob ${filePath} successfully`, uploadBlobResponse.requestId);
        return {
            success: true,
            requestId: uploadBlobResponse.requestId
          };

    } catch (ex: any) {
        console.error(ex);
        throw createError({
            statusCode: 500,
            message: `Server Failed to upload user provided file: ${ex}`,
        });
    }
};

/**
 * Generates a SAS URL for a container with write permissions
 * @param logContainer - The name of the container
 * @returns Promise<string> - The SAS URL
 */
 function generateSasUrlForLogsContainer(logContainer: string): string {
    // const accountKey = config.public.azureStorageAccountKey
    // const accountName = config.public.azureStorageAccountName
    const accountName = 'azscraper'
    const accountKey = "LaeTUS1xNc+BjIFnmdSBojHkLbfxetnpcrDRcn7g8cW//9jaRxyrNuRMsr3lnWyL2xt3UaTFcRAi+AStXVNQ4g=="
    try {
      // Create a SharedKeyCredential object
      const sharedKeyCredential = new StorageSharedKeyCredential(
        accountName,
        accountKey
      );
  
      // Create BlobServiceClient
      const blobServiceClient = new BlobServiceClient(
        `https://azscraper.blob.core.windows.net`,
        sharedKeyCredential
      );
  
      // Get container client
      const containerClient = blobServiceClient.getContainerClient(logContainer);
  
      // Calculate start and expiry time
      const startsOn = new Date();
      const expiresOn = new Date(startsOn);
      expiresOn.setDate(expiresOn.getDate() + 1); // Add 1 day
  
      // Generate SAS token
      const sasOptions = {
        containerName: logContainer,
        permissions: BlobSASPermissions.parse("rw"), // Write permission
        startsOn: startsOn,
        expiresOn: expiresOn,
        protocol: SASProtocol.Https
      };
  
      // Generate SAS query parameters
      const sasToken = generateBlobSASQueryParameters(
        sasOptions,
        sharedKeyCredential
      ).toString();
  
      // Construct the full SAS URL
      
      const sasUrl = `https://azscraper.blob.core.windows.net/${logContainer}?${sasToken}`;
      
      
      return sasUrl;
    } catch (error) {
      console.error('Error generating SAS URL:', error);
      throw error;
    }
  }
  

export default defineEventHandler(async (event) => {
    const params = getQuery(event);
    try {
        if (event.method === "POST") {
            return await uploadblob(event);
        }
        else if (event.method === "PUT") {
            return await getblob(event);
        }  
    } catch (ex: any) {
        console.error(ex);
        throw createError({
            statusCode: 422,
            message: ex.toString(),
        });
    }
});