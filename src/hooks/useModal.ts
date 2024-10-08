import {ComponentRef} from "@ionic/core";
import {modalController} from "@ionic/vue";

const useModal = () => {
    const openModal = (component: ComponentRef, props?: any) => {
        const modal = modalController.create({
            component: component,
            componentProps: props
        })

        modal.then(m => m.present())
        return modal;
    }

    return {openModal};
}

export default useModal