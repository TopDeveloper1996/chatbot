export interface ModalSheetProps {
    title?: string | undefined;
    save?: () => void;
}
export interface ModalSheetController {
    expanded: Ref<boolean>;
    options: Ref<ModalSheetProps | undefined>;
    toggle: (status: boolean, props?: ModalSheetProps) => void;
}

export const useModalSheet = () => {
    const expanded = ref(false);
    const options = ref<ModalSheetProps | undefined>(undefined);
    function toggle(status: boolean, props?: ModalSheetProps | undefined) {
        options.value = props;
        expanded.value = status;
    }
    return <ModalSheetController>{ expanded, toggle, options };
};
