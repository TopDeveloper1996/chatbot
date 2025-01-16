<template>
    <div class="flex flex-col items-center gap-2 w-full">
        <icon class="size-6" name="svg-spinners:3-dots-bounce"></icon>
    </div>
</template>

<script lang="ts" setup>
const opener = ref();
const route = useRoute();
onMounted(() => {
    opener.value = window.opener;
    if (opener.value) {
        opener.value.postMessage({ provider: "onedrive", disconnected: true }, origin);
    }
    window.close();
});
</script>

<style></style>
