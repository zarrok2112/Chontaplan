import React, { useState } from 'react';
import './login.css';
import services from '../../services/services';
import { useNavigate } from 'react-router-dom';
import Progress from '../component-progress/Progress';
import { useDispatch } from 'react-redux';
import { showAlert } from '../../store/reducerAlert/alertSlice';
import { getToken } from '../../store/reducerToken/tokenSlice';

const Login = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const [isValidatePassword, setValidatePassword] = useState('');
    const [isConfirmPassword, setIsConfirmPassword] = useState('');
    const [messageError, setMessageError] = useState('');
    const [validateEmail, setValidateEmail] = useState('');
    const [errorValidateEmail, setErrorValidateEmail] = useState(true);
    const [progress, setProgress] = useState(false);

    var contador = 0;

    const onclickLogin = (e) => {
        e.preventDefault();

        const user = e.target.email.value;
        const pass = e.target.pswd.value;
        const formData = new URLSearchParams();
        formData.append('email', user);
        formData.append('password', pass);

        setProgress(true);
        services.loginService(formData).then(response => {
            setProgress(false);
            if (response.status === 200) {
                console.log("se logio exitosamente");
                dispatch(getToken({ value: response.data.access }));
                dispatch(showAlert({ type: 'success', message: 'Se logio exitosamente!' }));
                navigate('/home');
            } else {
                console.log("error else");
            }
        }).catch((error) => {
            setProgress(false);
            dispatch(showAlert({ type: 'error', message: 'Error al loguearse' }));
            console.log("error login " + error);
        });

        e.target.email.value = '';
        e.target.pswd.value = '';
    }

    const registrarUsuario = (e) => {
        e.preventDefault();
        const nombre = e.target.name.value;
        const correo = e.target.email.value;
        const contra = e.target.pass.value;
        const confirmarContra = e.target.passTwo.value;

        if (!errorValidateEmail) {
            setMessageError("Por favor, use un correo electrónico educativo válido.");
            return;
        }

        if (contra !== confirmarContra) {
            setMessageError("Las contraseñas no coinciden. Por favor, inténtelo de nuevo.");
            return;
        }

        if (messageError) {
            setMessageError("Por favor, corrija los errores antes de registrarse.");
            return;
        }

        let data = {
            "user_info": {
                "name": nombre,
                "email": correo,
                "password": contra,
                "role": 0
            }
        }

        setProgress(true);
        services.signUp(data).then(response => {
            setProgress(false);
            if (response.status === 201) {
                dispatch(showAlert({ type: 'success', message: 'Se registró exitosamente!' }));
                console.log(response.data.message);
                // Clear form fields after successful registration
                e.target.name.value = '';
                e.target.email.value = '';
                e.target.pass.value = '';
                e.target.passTwo.value = '';
                setValidatePassword('');
                setIsConfirmPassword('');
                setValidateEmail('');
                setMessageError('');
            } else {
                setMessageError(response.data[0].errorMessage || "Error en el registro");
            }
        }).catch((error) => {
            setProgress(false);
            dispatch(showAlert({ type: 'error', message: 'Error al registrarse' }));
            setMessageError("Error al registrarse. Por favor, inténtelo de nuevo.");
            console.log("error signUp " + error);
        });
    }

    const validatePass = (pass, confir) => {
        const tieneOchoCaracteres = pass.length >= 8;
        const tieneMayuscula = /[A-Z]/.test(pass);
        const tieneMinuscula = /[a-z]/.test(pass);
        const tieneEspecial = /[!@#$%^&*(),.?":{}|<>]/.test(pass);

        if (tieneMinuscula || tieneMayuscula) {
            contador = 1;
        }
        if (tieneMayuscula && tieneMinuscula) {
            contador = 2;
        }
        if (tieneOchoCaracteres && tieneMayuscula && tieneMinuscula) {
            contador = 3;
        }
        if (tieneOchoCaracteres && tieneMayuscula && tieneMinuscula && tieneEspecial) {
            contador = 4;
        }

        if (contador !== 0) {
            progressPassword(contador);
        }

        if (pass === confir) {
            setMessageError("");
        } else {
            setMessageError("La contraseña no coincide.");
        }

        if (pass === '') {
            progressPassword(0);
        }
    };

    const progressPassword = (strength) => {
        const bar = document.getElementsByClassName('strength-bar');
        let barColorClass = 'strength-bar';

        for (var i = 0; i < bar.length; i++) {
            if (strength === 0) {
                barColorClass = 'strength-bar';
            }
            else if (strength === 1) {
                barColorClass = 'strength-bar low';
            } else if (strength === 2) {
                barColorClass = 'strength-bar active';
            } else if (strength === 3) {
                barColorClass = 'strength-bar medium';
            } else if (strength === 4) {
                barColorClass = 'strength-bar strong';
            }
            bar[i].className = barColorClass;

            if (i === strength && strength !== 0) {
                break;
            }
        }
    };

    const validateCorreoEdu = (email) => {
        if (email === '') {
            setErrorValidateEmail(true);
        } else {
            const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]*edu[a-zA-Z0-9.-]*$/;
            setErrorValidateEmail(regex.test(email));
        }
    };

    return (
        <div className="component-login">
            {progress ? <Progress /> : <></>}
            <div className="mirave">
                Cali es Cali
                <br />
                <span>lo demás es loma </span>
            </div>

            <div className="main">
                <input type="checkbox" id="chk" aria-hidden="true" />

                <div className="signup">
                    <form onSubmit={registrarUsuario}>
                        <label htmlFor="chk" aria-hidden="true">Registro</label>
                        <input
                            type="text"
                            name="txt"
                            id="name"
                            placeholder="Full name (Registro)"
                            required=""
                        />
                        <input
                            type="email"
                            name="email"
                            id="email"
                            placeholder="Email (Registro)"
                            required=""
                            value={validateEmail}
                            onChange={(e) => {
                                setValidateEmail(e.target.value);
                                validateCorreoEdu(e.target.value);
                            }}
                        />
                        {errorValidateEmail === false ? <p style={{ color: 'white' }}>{"El correo no es edu"}</p> : ''}
                        <input
                            type="password"
                            name="pass"
                            id="pass"
                            placeholder="Password (Registro)"
                            required=""
                            value={isValidatePassword}
                            onChange={(e) => {
                                setValidatePassword(e.target.value)
                                validatePass(e.target.value, isConfirmPassword);
                            }}
                        />
                        <div className="password-strength">
                            <span>Seguridad de la contraseña</span>
                            <div className="strength-meter">
                                <div className="strength-bar"></div>
                                <div className="strength-bar"></div>
                                <div className="strength-bar"></div>
                                <div className="strength-bar"></div>
                            </div>
                        </div>

                        <input
                            type="password"
                            name="passTwo"
                            id="passTwo"
                            placeholder="Repeat (Registro)"
                            required=""
                            value={isConfirmPassword}
                            onChange={(e) => {
                                setIsConfirmPassword(e.target.value);
                                validatePass(isValidatePassword, e.target.value);
                            }}
                        />
                        {messageError && <p style={{ color: 'white' }}>{messageError}</p>}
                        <button type="submit" id="joinus">Registrar</button>
                    </form>
                </div>

                <div className="login">
                    <label htmlFor="chk" aria-hidden="true">Inicio</label>
                    <form onSubmit={onclickLogin}>
                        <input type="email" name="email" id="email" placeholder="Email" required="" />
                        <input type="password" name="pswd" id="pass" placeholder="Password (Inicio de sesión)" required="" />
                        <button type="submit" id="disparo">Iniciar</button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Login;
