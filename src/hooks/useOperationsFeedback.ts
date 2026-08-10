import { alertController, toastController } from '@ionic/vue';
import { useI18n } from 'vue-i18n';

export default function useOperationsFeedback() {
    const { t, te } = useI18n();

    const errorMessage = (error: unknown) => {
        const message = error instanceof Error ? error.message : String(error);
        const key = `operations.errors.${message}`;
        return te(key) ? t(key) : message;
    };

    const toast = async (message: string, color: 'success' | 'danger' | 'warning' = 'success') => {
        const instance = await toastController.create({
            message,
            color,
            duration: 2800,
            position: 'bottom',
        });
        await instance.present();
    };

    const failure = (error: unknown) => toast(errorMessage(error), 'danger');

    const confirm = async (header: string, message: string, destructive = false) => {
        let settle: (value: boolean) => void = () => undefined;
        const result = new Promise<boolean>(resolve => {
            settle = resolve;
        });
        const instance = await alertController.create({
                header,
                message,
                buttons: [
                    { text: t('cancel'), role: 'cancel', handler: () => settle(false) },
                    {
                        text: t('ok'),
                        role: destructive ? 'destructive' : 'confirm',
                        handler: () => settle(true),
                    },
                ],
            });
        instance.onDidDismiss().then(event => {
            if (event.role !== 'confirm' && event.role !== 'destructive')
                settle(false);
        });
        await instance.present();
        return result;
    };

    return { confirm, failure, toast };
}
