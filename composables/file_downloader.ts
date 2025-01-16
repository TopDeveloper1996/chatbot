export const useFileDownloader = () => {
    const download = async (blob: Blob, name: string) => {
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = name;
        link.click();
        URL.revokeObjectURL(link.href);
    };
    return { download };
};
