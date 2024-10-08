import {Camera, CameraResultType, CameraSource, Photo} from '@capacitor/camera';
import {ref} from "vue";

export interface PhotoData {
    body: string;
    date: number;
    name: string;
    size: number;
    type: string
}

export interface UserPhoto extends Photo {
    data: PhotoData;
}

const convertBlobToBase64 = (blob: Blob) =>
    new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onerror = reject;
        reader.onload = () => {
            resolve(reader.result);
        };
        reader.readAsDataURL(blob);
    });

const blobToData = async (photo: Photo): Promise<PhotoData> => {
    const date = Date.now();
    const fileName = `${date}.${photo.format}`;
    const response = await fetch(photo.webPath!);
    const blob = await response.blob();
    const base64Data = (await convertBlobToBase64(blob)) as string;

    return {
        body: base64Data.split(',')[1],
        date,
        name: fileName,
        size: blob.size,
        type: blob.type,
    }
}

export const useAttachments = () => {

    const photos = ref<any[]>([])

    const takePhoto = async (maxSize?: number, source?: CameraSource): Promise<UserPhoto> => {
        
        const photo = await Camera.getPhoto({
            resultType: CameraResultType.Uri,
            source: source || CameraSource.Camera,
            quality: 50,
            width: 500,
            height: 500,
        });

        const data = await blobToData(photo)

        if (maxSize && data.size > maxSize)
            return Promise.reject(new Error(`size (${data.size}) > ${maxSize}`))
        else
            return {...photo, ...{data}}
    }

    return {
        photos,
        takePhoto
    };
};