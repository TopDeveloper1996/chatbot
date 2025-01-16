export const useScrollProgress = () => {
    const x = ref(0);
    const y = ref(0);
    const scroll = useWindowScroll();
    watch(scroll.y, () => {
        y.value =
            document.documentElement.scrollTop /
            (document.documentElement.scrollHeight - document.documentElement.offsetHeight);
        x.value =
            document.documentElement.scrollLeft /
            (document.documentElement.scrollWidth - document.documentElement.offsetWidth);
        x.value = Number.isNaN(x.value) ? 1 : x.value;
        y.value = Number.isNaN(y.value) ? 1 : y.value;
    });
    return { x, y };
};
