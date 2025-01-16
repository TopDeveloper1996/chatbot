export const useWindowClickDetector = (callback: (ev: MouseEvent) => void) => {
    onMounted(() => {
        document.addEventListener("click", click);
    });
    onUnmounted(() => {
        document.removeEventListener("click", click);
    });

    function click(ev: MouseEvent) {
        callback(ev);
    }
};
