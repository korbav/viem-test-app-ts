import { toast } from "react-toastify";

export const genericErrorAlert = (e: Error) => {
    toast("An errror occurred.", { 
        type: "error",
        autoClose: 1000,
        pauseOnHover: false,
        draggable: false,
        pauseOnFocusLoss: false
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