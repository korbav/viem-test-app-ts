import { toast } from "react-toastify";

export const genericErrorAlert = (e: Error) => {
    toast("An errror occurred.", { type: "error" });
    console.log(e);
}

export const genericSuccessAlert = () => {
    toast("Operation succeeded.", { type: "success" });
}