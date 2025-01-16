<template>
    <div v-if="mounted">

        <div class="flex flex-col items-center justify-center min-h-screen space-y-4">
            <p class="text-lg font-bold	">Stiamo elaborando i dati di Team System</p>
            <p class="text-lg font-medium">Questo processo può richiedere tempo.</p>
        </div>


    </div>
</template>

<script lang="ts" setup>
const mounted = useMounted();

</script>