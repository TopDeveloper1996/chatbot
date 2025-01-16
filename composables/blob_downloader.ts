export const useBlobDownloader = () => {
    const config = useAppConfig();

    const download = async (file_Path: string | undefined): Promise<void> => {
        if (!file_Path) {
            console.error('File path is undefined');
            return;
        }
        try {
            // Send request to backend to get the file stream
            const response = await fetch('/api/ai/blob_downloader', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${config.auth}`
                },
                body: JSON.stringify({filePath: file_Path})
            });

            // Check if response is ok
            if (!response.ok) {
                console.error('Failed to download file:', response.statusText);
                return;
            }

            // Convert response stream to Blob
            const blob = await response.blob();

            // Create a URL for the Blob
            const url = window.URL.createObjectURL(blob);

            // Create an anchor element and trigger download
            const a = document.createElement('a');
            a.href = url;
            a.download = file_Path.split('/').pop(); // Extract filename from path
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Error downloading file:', error);
        }
    };

    return { download };
};