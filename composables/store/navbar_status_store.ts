export const useNavbarStatusStore = defineStore("navbar_status", () => {
    const expanded = ref(false);
    function toggle(status: boolean) {
        expanded.value = status;
    }
    return { expanded, toggle };
});
