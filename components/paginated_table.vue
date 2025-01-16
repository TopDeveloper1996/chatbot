<template>
    <div class="flex flex-col justify-between">
        <ScrollableTable :enable-tip="showTip">
            <div class="flex flex-row justify-between items-end my-2">
                <div class="flex-1 w-full py-1 text-sm text-text/75">{{ props.elements.length }} elementi</div>
                <div v-if="downloadable" class="flex-1 flex flex-row justify-end">
                    <button title="Scarica i dati" @click="downloadData" class="secondary-button">
                        <p>Scarica</p>
                        <icon class="size-6" name="material-symbols:cloud-download-rounded"></icon>
                    </button>
                </div>
            </div>
            <table ref="el" :key="renderKey" class="table-frame" :class="tableClasses ?? []">
                <thead>
                    <tr class="break-words">
                        <th
                            :style="{ '--h-color': props.headerColor }"
                            :class="{
                                'bg-[var(--h-color)]': props.headerColor,
                                'bg-surface_variant': !props.headerColor,
                                'cursor-pointer': isSortingActive(h).value,
                                'text-accent': isSortingActive(h).value,
                            }"
                            v-for="h in props.headers"
                            @click="() => sortByHeader(h)"
                        >
                            <p>
                                {{ h }}
                            </p>
                            <icon
                                v-if="isSortingActive(h).value && sortingHeader === h"
                                class="size-8"
                                :name="
                                    sortingAscending
                                        ? 'material-symbols:arrow-drop-down-rounded'
                                        : 'material-symbols:arrow-drop-up-rounded'
                                "
                            ></icon>
                        </th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="e in pageElements" @click="$emit('rowClicked', e)" :class="rowClasses(e)">
                        <td :class="elemClasses(i)" v-for="(m, i) in props.rowMapper(e)">{{ m }}</td>
                    </tr>
                </tbody>
            </table>
            <div v-if="downloadable && bottomDownload" class="flex-1 flex flex-row justify-end mt-2">
                <button title="Scarica i dati" @click="downloadData" class="secondary-button">
                    <p>Scarica</p>
                    <icon class="size-6" name="material-symbols:cloud-download-rounded"></icon>
                </button>
            </div>
            <div v-if="pages.length > 1" class="flex w-full items-start">
                <div :style="{ '--scale': pageIndicatorScale }" class="pages-indicator"></div>
            </div>
        </ScrollableTable>

        <div v-if="pages.length > 1" class="flex flex-row w-full justify-center items-center">
            <button :disabled="pageIndex <= 0" class="button" @click="changePageIndex(0)">
                <icon class="icon-button" name="material-symbols:skip-previous-rounded"></icon>
            </button>
            <button :disabled="pageIndex <= 0" class="button" @click="changePageIndex(pageIndex - 1)">
                <icon class="icon-button" name="material-symbols:chevron-left-rounded"></icon>
            </button>
            <button :disabled="pageIndex >= pages.length - 1" class="button" @click="changePageIndex(pageIndex + 1)">
                <icon class="icon-button" name="material-symbols:chevron-right-rounded"></icon>
            </button>
            <button :disabled="pageIndex >= pages.length - 1" class="button" @click="changePageIndex(pages.length - 1)">
                <icon class="icon-button" name="material-symbols:skip-next-rounded"></icon>
            </button>
            <div v-if="pages.length > 1" class="text-center mx-8 text-sm text-text/75">
                Pagina {{ pageIndex + 1 }}/{{ pages.length }}
            </div>
        </div>
        <div class="self-end text-sm flex flex-row items-center gap-2">
            <p class="opacity-75">Per pagina:</p>
            <button
                @click="() => (currentPageSize = pageSize)"
                class="hover:underline cursor-pointer hover:text-accent"
                :class="{ 'font-bold': currentPageSize === pageSize }"
            >
                {{ pageSize }}
            </button>
            <button
                @click="() => (currentPageSize = 20)"
                class="hover:underline cursor-pointer hover:text-accent"
                :class="{ 'font-bold': currentPageSize === 20 }"
            >
                20
            </button>
            <button
                @click="() => (currentPageSize = 50)"
                class="hover:underline cursor-pointer hover:text-accent"
                :class="{ 'font-bold': currentPageSize === 50 }"
            >
                50
            </button>
            <button
                @click="() => (currentPageSize = 100)"
                class="hover:underline cursor-pointer hover:text-accent"
                :class="{ 'font-bold': currentPageSize === 100 }"
            >
                100
            </button>
        </div>
    </div>
</template>

<script lang="ts" setup>
import l, { head } from "lodash";
import { useFileDownloader } from "~/composables/file_downloader";

const fileSaver = useFileDownloader();
const pages = ref<any[][]>([]);
const renderKey = ref(0);
const pageIndex = ref<number>(0);
const props = withDefaults(
    defineProps<{
        title: string;
        elements: any[];
        headers: string[];
        sortedHeaders?: { title: string; key: (val: any) => any }[];
        downloadable?: boolean;
        tableClasses?: string[];
        downloadableRowMapper?: (val: any) => any[];
        downloadableHeaders?: string[];
        rowMapper: (val: any) => any[];
        rowClasses?: (val: any) => string[];
        elemClasses?: (index: number) => string[];
        headerColor?: string;
        pageSize?: number;
        showTip?: boolean;
        bottomDownload?: boolean;
    }>(),
    {
        pageSize: 10,
        showTip: true,
        bottomDownload: true,
        downloadable: true,
        rowClasses: (val: any) => [],
        elemClasses: (val: any) => [],
    }
);
const currentPageSize = ref<number>(props.pageSize);

const sortingAscending = ref<boolean>(false);
const sortingHeader = ref<string>(props.sortedHeaders?.at(0)?.title ?? "");

const isSortingActive = (h: string) => computed(() => props.sortedHeaders?.find((hd) => hd.title === h));

function sortByHeader(header: string) {
    const headerObject = props.sortedHeaders?.find((hd) => hd.title === header);
    if (!headerObject) return;
    if (header === sortingHeader.value) {
        sortingAscending.value = !sortingAscending.value;
    } else {
        sortingHeader.value = header;
    }
    pages.value = pages.value.map((p) => {
        p = l.orderBy(p, (el: any) => headerObject.key(el), sortingAscending.value ? "asc" : "desc");
        return p;
    });
}

async function downloadData() {
    let elems = props.elements;
    if (elems.length <= 0) return;

    const headers = props.downloadableHeaders ?? props.headers;
    let csvData = `${headers.join(",")}\n`;
    const mapper = props.downloadableRowMapper ?? props.rowMapper;
    elems.forEach(
        (ditta: any) =>
            (csvData += `${mapper(ditta)
                .map((r) => r?.toString()?.replace(/,/g, "."))
                .join(",")}\n`)
    );
    var blob = new Blob([csvData], { type: "text/csv;charset=utf-8" });
    let sheetName = props.title ?? "data";
    sheetName = `${sheetName
        .split(" ")
        .map((e: string) => e.trim().replace(/\./g, "").toLocaleLowerCase())
        .join("_")}.csv`;
    fileSaver.download(blob, sheetName);
}

const emits = defineEmits<{ (e: "rowClicked", model: any): void }>();

const pageIndicatorScale = computed(() => pageIndex.value / (pages.value.length - 1));

watch(() => props.pageSize, makeChunks);
watch(currentPageSize, makeChunks);
watch(() => props.elements, makeChunks);

const pageElements = computed(() => {
    if (pageIndex.value < 0 || pageIndex.value > pages.value.length - 1) return [];
    return pages.value[pageIndex.value];
});

function makeChunks() {
    pages.value = l.chunk(props.elements, currentPageSize.value);
    changePageIndex(pageIndex.value);
    renderKey.value = (renderKey.value + 1) % 2;
}

function changePageIndex(index: number) {
    pageIndex.value = Math.min(Math.max(index, 0), pages.value.length - 1);
}

onMounted(() => {
    makeChunks();
});
</script>

<style lang="css" scoped>
.icon-button {
    @apply size-8;
}

.button {
    @apply disabled:text-outline disabled:cursor-default cursor-pointer enabled:hover:scale-[115%] enabled:hover:text-accent transition-all duration-150;
}

.wrapper {
    @apply flex flex-col h-full w-full justify-end;
}

.table-frame {
    @apply break-words w-full;
}

.pages-indicator {
    width: calc(var(--scale, 0) * 100%);
    @apply h-[0.25rem] rounded-full bg-accent/100 mx-[0.75rem] transition-all duration-500 ease-out;
}
</style>
