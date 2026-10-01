import axios from "axios";
import Auth from "@/Authentication/Services/auth.ts";

const API_URL ="http://localhost:8080/api/test/";

const holInfos = () => {
    return axios.get(API_URL + "all");
}

const nutzerHolen = () => {
    return axios.get(API_URL + "user", { headers: Auth() });
}

export {
    holInfos,
    nutzerHolen,
}