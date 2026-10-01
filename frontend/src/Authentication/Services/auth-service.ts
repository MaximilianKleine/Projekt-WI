import axios from "axios";

const API_URL = "http://localhost:8080/api/auth/";

const registrieren = (name: string, vorname: string, username: string, email: string, password: string) => {
    return axios.post(API_URL + "signup",{
        name,
        vorname,
        username,
        email,
        password,
    });
};

const einloggen = (username: string, password: string) => {
    return axios
        .post(API_URL + "signin",{
            username,
            password,
        })
        .then((response) =>{
            if(response.data.accessToken){
                localStorage.setItem("user", JSON.stringify(response.data));
            }
            return response.data;
        })
}

const ausloggen =() => {
    localStorage.removeItem("user");
};

const  aktuelleNutzerHolen= () => {
    const userStr = localStorage.getItem("user");
    if(userStr) return JSON.parse(userStr);

    return null;
}

export
{
    registrieren,
    einloggen,
    ausloggen,
    aktuelleNutzerHolen,
}