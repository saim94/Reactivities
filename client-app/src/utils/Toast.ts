import { toast, ToastOptions } from 'react-toastify';

export default class Toast {
    private static baseOptions: ToastOptions = {
        position: "bottom-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "colored",
    };

    // Info toast
    protected static info(message: string) {
        toast.info(message, this.baseOptions);
    }

    // Success toast
    protected static success(message: string) {
        toast.success(message, this.baseOptions);
    }

    // Error toast
    protected static error(message: string) {
        toast.error(message, this.baseOptions);
    }

    // Custom toast method to handle different toast types dynamically
    static show(type: 'info' | 'success' | 'error', message: string) {
        switch (type) {
            case 'info':
                this.info(message);
                break;
            case 'success':
                this.success(message);
                break;
            case 'error':
                this.error(message);
                break;
            default:
                this.info(message);
                break;
        }
    }
}
