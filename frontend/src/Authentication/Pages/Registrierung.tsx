import { Link, useLocation } from "react-router-dom";
import { Formik, Field, Form, ErrorMessage} from "formik";
import {Card} from "@/components/ui/card.tsx";
import * as Yup from "yup";
import { useState } from "react";
import {registrieren} from "@/Authentication/Services/auth-service";
import type {IUser} from "@/types/user.type";
import {Button} from "@/components/ui/button.tsx";


function Registrierung() {
    const location = useLocation();

        const [successful, setSuccessful] = useState<boolean> (false);
        const [message, setMessage] = useState<string>("");

    const nameNutzernameValidation = Yup.string()
        .min(3, "mindestens 3 Zeichen.")
        .max(20, "Maximal 20 Zeichen.")
        .required("Dieses Feld wird benötigt!");

    const validationSchema = Yup.object().shape({
        name: nameNutzernameValidation,
        vorname: nameNutzernameValidation,
        username: nameNutzernameValidation,
        email: Yup.string()
            .email("Das ist kein gültigen email.")
            .required("Dieses Feld wird benötigt!"),
        password: Yup.string()
            .test(
                "len",
                "Die Passwort muss zwischen 8 und 20 Zeichen sein",
                (val) =>
                    !!val &&
                    val.toString().length >= 8 &&
                    val.toString().length <= 20
            )
            .required("Dieses Feld wird benötigt!"),
    });

    const initialValues: IUser = {
        name:"",
        vorname:"",
        username: "",
        email: "",
        password: "",
    };

    const handleRegister = (formValue: IUser) => {
        const { name, vorname, username, email, password } = formValue;

        registrieren(name,vorname,username, email, password).then(
            (response) => {
                setMessage(response.data.message);
                setSuccessful(true);
            },
            (error) => {
                const resMessage =
                    (error.response &&
                        error.response.data &&
                        error.response.data.message) ||
                    error.message ||
                    error.toString();

                setMessage(resMessage);
                setSuccessful(false);
            }
        );
    };

    const linkClass = (path: string) => `px-3 py-1.5 rounded-md text-sm transition-colors 
    ${location.pathname === path ? "bg-blue-100 text-blue-600 font-medium" : "hover:bg-gray-100 text-gray-600"}`

    const fieldStyle = "form-control bg-blue-200 rounded-md form-group flex flex-col gap-1 px-2"

    return (
        <div>
            <div className="flex h-[calc(100vh-4rem)] items-center justify-center overflow-hidden">
                <Card className="w-full max-w-md p-6 bg-blue-50 text-lg">
                    <Formik
                        initialValues={initialValues}
                        validationSchema={validationSchema}
                        onSubmit = {handleRegister}
                    >
                        <Form className="flex flex-col gap-6 font-bold">
                            {!successful && (
                                <div>
                                    <div className="form-group flex flex-col gap-1">
                                        <label htmlFor="name">
                                            Name
                                        </label>
                                        <Field
                                            name="name"
                                            type="text"
                                            className={fieldStyle}/>
                                        <ErrorMessage
                                            name ="email"
                                            component="div"
                                            className="alert alert-danger"
                                        />
                                    </div>
                                    <div className="form-group flex flex-col gap-1">
                                        <label htmlFor="Vorname">
                                            Vorname
                                        </label>
                                        <Field
                                            name="vorname"
                                            type="text"
                                            className={fieldStyle}/>
                                        <ErrorMessage
                                            name ="vorname"
                                            component="div"
                                            className="alert alert-danger"
                                        />
                                    </div>
                                    <div className="form-group flex flex-col gap-1">
                                        <label htmlFor="username">
                                            Nutzername
                                        </label>
                                        <Field
                                            name="username"
                                            type="text"
                                            className={fieldStyle}/>
                                        <ErrorMessage
                                            name ="username"
                                            component="div"
                                            className="alert alert-danger"
                                        />
                                    </div>
                                    <div className="form-group flex flex-col gap-1">
                                        <label htmlFor="password">
                                            Passwort
                                        </label>
                                        <Field
                                            name="password"
                                            type="password"
                                            className={fieldStyle}/>
                                        <ErrorMessage
                                            name ="password"
                                            component="div"
                                            className="alert alert-danger"
                                        />
                                    </div>
                                    <div className="form-group flex flex-col gap-1">
                                        <label htmlFor="email">
                                            E-mail
                                        </label>
                                        <Field
                                            name="email"
                                            type="email"
                                            className={fieldStyle}/>
                                        <ErrorMessage
                                            name ="email"
                                            component="div"
                                            className="alert alert-danger"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <Button type="submit" className= "btn btn-primary btn-block">
                                            Anmelden
                                        </Button>
                                    </div>
                                </div>
                            )}
                            {message &&(
                                <div className="form-group">
                                    <div className={successful ? "alert alert-success" : "alert alert-danger"}
                                    role ="alert"
                                    >
                                        {message}
                                    </div>
                                </div>
                            )}
                        </Form>
                    </Formik>
                    <nav className="flex py-4 border-r">
                        <Link to="/" className={`${linkClass("/")} hover:!bg-blue-200 !font-bold`}>Sie besitzen schon einen Konto? Einloggen!</Link>
                    </nav>
                </Card>
            </div>
        </div>
    );
}

export default Registrierung;