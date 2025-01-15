import { makeAutoObservable } from "mobx"

interface Modal {
    open: boolean;
    body: JSX.Element | null;
    persistent: boolean;
    size: "mini" | "tiny" | "small" | "large" | "fullscreen" | undefined
}

export default class ModalStore {

    modal: Modal = {
        open: false,
        body: null,
        persistent: false,
        size: 'mini'
    }

    modal2: Modal = {
        open: false,
        body: null,
        persistent: true,
        size: 'mini'
    }

    constructor() {
        makeAutoObservable(this);
    }

    openModal = (content: JSX.Element, size?: "mini" | "tiny" | "small" | "large" | "fullscreen" | undefined) => {
        this.modal.open = true;
        this.modal.body = content;
        if (size) this.modal.size = size;
    }

    closeModal = () => {
        this.modal.open = false;
        this.modal.body = null;
    }

    openModal2 = (content: JSX.Element) => {
        this.modal2.open = true;
        this.modal2.body = content;
        this.modal2.persistent = true;
    }

    closeModal2 = () => {
        //if (!this.modal.persistent) {
        this.modal2.open = false;
        this.modal2.body = null;
        this.modal.persistent = false;
        //}
    }
}