import { observer } from "mobx-react-lite";
import { Modal } from "semantic-ui-react";
import { useStore } from "../../stores/Store";

export default observer(function ModalContainer() {
    const { modalStore } = useStore();
    return (
        <>
            <Modal open={modalStore.modal.open} onClose={modalStore.closeModal} size={modalStore.modal.size} >
                <Modal.Content>
                    {modalStore.modal.body}
                </Modal.Content>
            </Modal>
            <Modal open={modalStore.modal2.open} onClose={() => false} size="mini">
                <Modal.Content>
                    {modalStore.modal2.body}
                </Modal.Content>
            </Modal>
        </>
    )
})