import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';
import './login.css';
import services from '../../services/services';
import Progress from '../component-progress/Progress';
import { showAlert } from '../../store/reducerAlert/alertSlice';
import { getToken } from '../../store/reducerToken/tokenSlice';
import { isActive } from '../../store/reducerSession/sessionSlice';


const domain = 'dev-e44aobm0ldptdogh.us.auth0.com';
const clientId = 'KKSqRhDusjQzbXWAECdoHtBnDr4VTlKs';
const GOOGLE_CLIENT_ID = 'ANDRESAQUIVATUID.apps.googleusercontent.com';


const Login = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [isValidatePassword, setValidatePassword] = useState('');
  const [isConfirmPassword, setIsConfirmPassword] = useState('');
  const [messageError, setMessageError] = useState('');
  const [validateEmail, setValidateEmail] = useState('');
  const [errorValidateEmail, setErrorValidateEmail] = useState(true);
  const [progress, setProgress] = useState(false);


  const onSuccess = (credentialResponse) => {
    const decoded = jwtDecode(credentialResponse.credential);
    dispatch(isActive({ isActive: true, infoUser: decoded }));
    navigate('/home');
  };

  const onFailure = () => {
    dispatch(showAlert({ type: 'error', message: 'Error en el inicio de sesión con Google' }));
  };

  const onclickLogin = async (e) => {
    e.preventDefault();
    const correo = e.target.elements['email'].value;
    const contra = e.target.elements['pswd'].value;

    const formData = new URLSearchParams();
    formData.append('email', correo);
    formData.append('password', contra);

    setProgress(true);
    try {
      const response = await services.loginService(formData);
      setProgress(false);
      if (response.status === 200) {
        dispatch(getToken({ value: response.data.access }));
        dispatch(showAlert({ type: 'success', message: 'Se logueó exitosamente!' }));
       const rol_user = await  services.getInfoUser(response.data.access);
       dispatch(isActive({ isActive: true, infoUser: rol_user.data }));
        navigate('/home');
      } else {
        dispatch(showAlert({ type: 'error', message: 'Error al loguearse' }));
      }
    } catch (error) {
      setProgress(false);
      dispatch(showAlert({ type: 'error', message: 'Error al loguearse' }));
      console.error("Error en el login:", error);
    }

    e.target.reset();
  };

  const registrarUsuario = async (e) => {
    e.preventDefault();
    const nombre = e.target.elements['name'].value;
    const correo = e.target.elements['email'].value;
    const contra = e.target.elements['pass'].value;
    const confirmarContra = e.target.elements['passTwo'].value;
    const checkTourist = e.target.elements['checkTourist'].value  === '1' ? 1 : 0;
    
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

    const data = {
      "user_info": {
        "name": nombre,
        "email": correo,
        "password": contra,
        "role": checkTourist
      }
    };

    setProgress(true);
    try {
      const response = await services.signUp(data);
      setProgress(false);
      if (response.status === 201) {
        dispatch(showAlert({ type: 'success', message: 'Se registró exitosamente!' }));
        e.target.reset();
        setValidatePassword('');
        setIsConfirmPassword('');
        setValidateEmail('');
        setMessageError('');
      } else {
        setMessageError(response.data[0]?.errorMessage || "Error en el registro");
      }
    } catch (error) {
      setProgress(false);
      dispatch(showAlert({ type: 'error', message: 'Error al registrarse' }));
      setMessageError("Error al registrarse. Por favor, inténtelo de nuevo.");
      console.error("Error en el registro:", error);
    }
  };

  const validatePass = (pass, confir) => {
    let contador = 0;
    const tieneOchoCaracteres = pass.length >= 8;
    const tieneMayuscula = /[A-Z]/.test(pass);
    const tieneMinuscula = /[a-z]/.test(pass);
    const tieneEspecial = /[!@#$%^&*(),.?":{}|<>]/.test(pass);

    if (tieneMinuscula || tieneMayuscula) contador = 1;
    if (tieneMayuscula && tieneMinuscula) contador = 2;
    if (tieneOchoCaracteres && tieneMayuscula && tieneMinuscula) contador = 3;
    if (tieneOchoCaracteres && tieneMayuscula && tieneMinuscula && tieneEspecial) contador = 4;

    progressPassword(contador);

    if (pass === confir) {
      setMessageError("");
    } else {
      setMessageError("Las contraseñas no coinciden.");
    }

    if (pass === '') {
      progressPassword(0);
    }
  };

  const progressPassword = (strength) => {
    const bar = document.getElementsByClassName('strength-bar');
    let barColorClass = 'strength-bar';

    for (let i = 0; i < bar.length; i++) {
      if (strength === 0) {
        barColorClass = 'strength-bar';
      } else if (strength === 1) {
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
   
    }
  };

  return (
      <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
        <div className="component-login">
          {progress && <Progress />}
          <div className="mirave">
            Cali es Cali
            <br />
            <span>lo demás es loma </span>
          </div>

          <div className="main">
            <input type="checkbox" id="chk" aria-hidden="true" />

            <div className="signup" data-testid="register-form">
              <form onSubmit={registrarUsuario}>
                <label class="cls-registro" htmlFor="chk" aria-hidden="true">Registro</label>
                <input
                  type="text"
                  name="name" // Cambiado de "txt" a "name"
                  id="name"
                  placeholder="Full name (Registro)"
                  required
                />
                <input
                  type="email"
                  name="email"
                  id="email"
                  placeholder="Email (Registro)"
                  required
                  value={validateEmail}
                  onChange={(e) => {
                    setValidateEmail(e.target.value);
                    validateCorreoEdu(e.target.value);
                  }}
                />
                {errorValidateEmail === false && <p style={{ color: 'white' }}>{"El correo no es edu"}</p>}
                <input
                  type="password"
                  name="pass"
                  id="pass"
                  placeholder="Password (Registro)"
                  required
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
                  required
                  value={isConfirmPassword}
                  onChange={(e) => {
                    setIsConfirmPassword(e.target.value);
                    validatePass(isValidatePassword, e.target.value);
                  }}
                />

                {messageError && <p style={{ color: 'white' }}>{messageError}</p>}
                <span>Eres turista?</span>
                <select name='checkTourist'>
                  <option value="0">No</option>
                  <option value="1">Si</option>
                </select>
                <button className="btn-registry" type="submit" id="joinus">Registrar</button>
              </form>
            </div>

            <div className="login" data-testid="login-form">
              <label htmlFor="chk" aria-hidden="true">Inicio</label>
              <form onSubmit={onclickLogin}>
                <input type="email" name="email" id="email" placeholder="Email" required />
                <input type="password" name="pswd" id="pass" placeholder="Password (Inicio de sesión)" required />
                <button className="btn-login" type="submit" id="disparo">Iniciar</button>
              </form>
            </div>
          </div>
        </div>
      </GoogleOAuthProvider>
  );
};

export default Login;