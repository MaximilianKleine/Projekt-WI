import { Link, useLocation } from "react-router-dom"
import { Formik, Field, Form, ErrorMessage} from "formik"
import { Card } from "@/components/ui/card.tsx"
import * as Yup from "yup";
import {einloggen} from "@/Authentication/Services/auth-service.ts";
import {useState} from "react";
import {useNavigate} from 'react-router-dom';
import {Button} from "@/components/ui/button.tsx";

function Login() {
    const location = useLocation();
    const navigate = useNavigate();

    const [loading, setLoading] = useState<boolean> (false);
    const [message, setMessage] = useState<string>("");

    const validationSchema = Yup.object().shape({
        username: Yup.string().required("This field is required!"),
        password: Yup.string().required("This field is required!"),
    });

    const handleLogin =(formValue: { username: string; password: string}) => {
        const {username, password} = formValue;

        setMessage("");
        setLoading(true);

        einloggen(username,password).then(
            () => {
                navigate("/dashboard");
            },
            (error) => {
                const resMessage =
                    (error.response &&
                        error.response.data &&
                            error.response.data.message) ||
                    error.message ||
                    error.toString();

                setLoading(false);
                setMessage(resMessage);
            }
        );
    }

    const initialValues = {
        username:"",
        password:"",
    }


        const linkClass = (path:string) => `px-3 py-1.5 rounded-md text-sm transition-colors 
    ${location.pathname === path ? "bg-blue-100 text-blue-600 font-medium" : "hover:bg-gray-100 text-gray-600"}`

    const fieldStyle = "form-control bg-blue-200 placeholder-gray-400 placeholder:italic px-2 rounded-md"

    return (
        <>
            <div className="flex h-[calc(100vh-4rem)] items-center justify-center overflow-hidden">
                <Card className="w-full max-w-md p-6 bg-blue-50 text-lg">
                    <Formik
                        initialValues={initialValues}
                        validationSchema={validationSchema}
                        onSubmit={handleLogin}
                    >
                        <Form className="flex flex-col gap-6 font-bold">
                            <div className="flex flex-col gap-1 form-group">
                                <label htmlFor="username" className="px-2">
                                    Nutzername
                                </label>
                                <Field name="username" type="text" placeholder="Max-Mustermann" className={fieldStyle} />
                                <ErrorMessage
                                    name="username"
                                    component="div"
                                    className="alert alert-danger"
                                />
                            </div>
                            <div className="flex flex-col gap-1">
                                <label htmlFor="password" className="px-2">
                                    Passwort
                                </label>
                                <Field name="password" type="password" placeholder="1v05_tr2" className={fieldStyle} />
                                <ErrorMessage
                                    name="password"
                                    component="div"
                                    className="alert alert-danger"
                                />
                            </div>
                            <div className="form-group">
                                <Button type="submit" className="btn btn-primary btn-block" disabled={loading}>
                                    {loading && (
                                        <span className="spinner-border spinner-border-sm"></span>
                                    )}
                                    <span>Einloggen</span>
                                </Button>
                            </div>

                            {message && (
                                <div className="form-group">
                                    <div className="alert alert-danger" role="alert">
                                        {message}
                                    </div>
                                </div>
                            )}
                        </Form>
                    </Formik>
                    <nav className="flex pt-4 flex-col">
                        <Link to="/dashboard" className={`${linkClass("/dashboard")} min-w-50 !text-center hover:!bg-blue-500 !bg-blue-400 text-white !text-lg`}>Einloggen</Link>
                    </nav>
                    <Link to="/registrierung" className={`${linkClass("/registrierung")} hover:!bg-blue-200`}>Sie besitzen noch keinen Konto? Registrieren!</Link>
                </Card>
            </div>
        </>
    );
}
export default Login