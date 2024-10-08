import { alertController, AlertOptions } from "@ionic/vue";

const useAlert = () => {
    const presentAlert = async (options: AlertOptions) => {
        const alert = await alertController.create(options);

        await alert.present();
    };

    return { presentAlert }
}

export default useAlert;