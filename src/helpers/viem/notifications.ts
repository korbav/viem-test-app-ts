import { toast } from "react-toastify";

export const genericErrorAlert = (e: Error, msg: string = "An unexpected error occurred", options = {}) => {
    toast(msg, { 
        type: "error",
        autoClose: 1000,
        pauseOnHover: false,
        draggable: false,
        pauseOnFocusLoss: false,
        ...options
     });
     console.log(e);
}

export const genericSuccessAlert = (successMessage: string = "Operation succeeded.") => {
    toast(successMessage, { 
        type: "success",
        autoClose: 1000,
        pauseOnHover: false,
        draggable: false,
        pauseOnFocusLoss: false
    });
}
export const infoAlert = (infoMessage: string) => {
    toast(infoMessage, {
        position: "top-right",
        autoClose: 1000,
        closeOnClick: true,
        pauseOnHover: false,
        draggable: false,
        hideProgressBar: true,
        pauseOnFocusLoss: false
    });
}