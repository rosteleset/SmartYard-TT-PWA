import useModal from "@/hooks/useModal";
import MapView, { Marker } from "@/components/MapView.vue";


const useMap = () => {

    const { openModal } = useModal()

    const showModal = (markers: Marker[]) => {
        openModal(MapView, { markers: markers })
    }

    return { showModal }
}

export default useMap;