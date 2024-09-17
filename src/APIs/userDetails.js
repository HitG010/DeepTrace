import axios from "axios";

export const getUserDetails = async () => {
    try {
        const response = await axios.get("http://localhost:5000/getUserDetails", {
            withCredentials: true,
        });
        console.log(response);
        // No need to return anything
        if(response.data === "") {
            window.location.href = "/login";
            return null;
        }
        return response.data;
    } catch (err) {
        console.error(err);
        return null; // Return null in case of error
    }
};