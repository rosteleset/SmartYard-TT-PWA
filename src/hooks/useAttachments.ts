import { Camera, CameraResultType, CameraSource, Photo } from '@capacitor/camera';
import { ref } from 'vue';

export interface PhotoData {
    body: string;
    date: number;
    name: string;
    size: number;
    type: string;
}

export interface UserPhoto extends Photo {
    data: PhotoData;
}

const convertBlobToBase64 = (blob: Blob) =>
    new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onerror = reject;
        reader.onload = () => {
            resolve(reader.result as string);
        };
        reader.readAsDataURL(blob);
    });

const blobToData = async (blob: Blob, extension?: string): Promise<PhotoData> => {
    const date = Date.now();
    const fileName = extension
        ? `${date}.${extension}`
        : blob instanceof File
            ? (blob as File).name
            : `${date}`;
    const base64Data = await convertBlobToBase64(blob);
    return {
        body: base64Data.split(',')[1],
        date,
        name: fileName,
        size: blob.size,
        type: blob.type,
    };
};

export const useAttachments = () => {
    const photos = ref<UserPhoto[]>([]);

    const takePhoto = async (maxSize?: number, source?: CameraSource): Promise<UserPhoto> => {
        const photo: Photo = await Camera.getPhoto({
            resultType: CameraResultType.Uri,
            source: source || CameraSource.Camera,
            quality: 50,
            width: 500,
            height: 500,
        });

        const response = await fetch(photo.webPath!);
        const blob = await response.blob();
        const data = await blobToData(blob, photo.format);

        if (maxSize && data.size > maxSize)
            return Promise.reject(new Error(`file size exceeded`))
        else
            return { ...photo, ...{ data } }
    }

    const pickFiles = async (
        mimeTypes: string[] | null = null,
        maxSize: number | null = null
    ): Promise<UserPhoto[]> => {
        return new Promise<UserPhoto[]>((resolve, reject) => {
            const input = document.createElement('input');
            input.type = 'file';
            input.multiple = true;
            if (mimeTypes) input.accept = mimeTypes.join(',');
            input.style.display = 'none';
            document.body.appendChild(input);

            input.addEventListener('change', async () => {
                document.body.removeChild(input);
                const files = input.files;
                if (!files || files.length === 0) {
                    return reject(new Error('noFileSelected'));
                }

                try {
                    const result: UserPhoto[] = [];
                    for (let i = 0; i < files.length; i++) {
                        const file = files[i];
                        if (mimeTypes && !mimeTypes.includes(file.type)) {
                            throw new Error('incorrectFileType');
                        }
                        if (maxSize && file.size > maxSize) {
                            throw new Error('exceededSize');
                        }

                        // Получаем PhotoData
                        const data = await blobToData(file);

                        // Строим минимальный объект Photo
                        const photo: Photo = {
                            webPath: URL.createObjectURL(file),
                            format: file.name.split('.').pop() || '',
                            saved: false,
                        };

                        const userPhoto: UserPhoto = { ...photo, data };
                        photos.value.push(userPhoto);
                        result.push(userPhoto);
                    }
                    resolve(result);
                } catch (err) {
                    reject(err);
                }
            });

            input.click();
        });
    };

    return {
        photos,
        takePhoto,
        pickFiles,
    };
};
