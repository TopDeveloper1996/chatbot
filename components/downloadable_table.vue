<template>
    <div class="flex flex-col justify-between">
        <div class="flex flex-row justify-between items-end my-2">
            <div class="flex-1 w-full py-1 text-sm text-text/75">{{ props.elements.length }} elementi</div>
            <div class="flex-1 flex flex-row justify-end">
                <button title="Scarica i dati" @click="downloadData" class="secondary-button">
                    <p>Scarica</p>
                    <icon class="size-6" name="material-symbols:cloud-download-rounded"></icon>
                </button>
            </div>
        </div>
        <slot></slot>
        <div v-if="bottomDownload" class="flex-1 flex flex-row justify-end mt-2">
            <button title="Scarica i dati" @click="downloadData" class="secondary-button">
                <p>Scarica</p>
                <icon class="size-6" name="material-symbols:cloud-download-rounded"></icon>
            </button>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { useFileDownloader } from "~/composables/file_downloader";

const fileSaver = useFileDownloader();
const props = withDefaults(
    defineProps<{
        headers: string[];
        title: string;
        elements: any[];
        mapper: (elem: any) => any[];
        bottomDownload?: boolean;
    }>(),
    {
        bottomDownload: true,
    }
);

async function downloadData() {
    let elems = props.elements;
    if (elems.length <= 0) return;

    const headers = props.headers;
    let csvData = `${headers.join(",")}\n`;
    elems.forEach(
        (ditta: any) =>
            (csvData += `${props
                .mapper(ditta)
                .map((r) => r?.toString()?.replace(/,/g, "."))
                .join(",")}\n`)
    );
    var blob = new Blob([csvData], { type: "text/csv;charset=utf-8" });
    let sheetName = props.title ?? "data";
    console.log(sheetName.split(" ").map((e: string) => e.trim().replace(/\./g, "").toLocaleLowerCase()));
    sheetName = `${sheetName
        .split(" ")
        .map((e: string) => e.trim().replace(/\./g, "").toLocaleLowerCase())
        .join("_")}.csv`;
    fileSaver.download(blob, sheetName);
}
</script>

<style></style>
