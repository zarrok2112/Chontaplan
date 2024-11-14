import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { Auth0Provider, useAuth0 } from '@auth0/auth0-react';
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

const LoginButton = () => {
  const { loginWithRedirect } = useAuth0();
  return <button onClick={() => loginWithRedirect()} className="btn-login">Log In with Auth0</button>;
};

const LogoutButton = () => {
  const { logout } = useAuth0();
  return <button onClick={() => logout({ returnTo: window.location.origin })} className="btn-login">Log Out</button>;
};

const Profile = () => {
  const { user, isAuthenticated, isLoading } = useAuth0();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated && user) {
      dispatch(isActive({ isActive: true, infoUser: user }));
      dispatch(showAlert({ type: 'success', message: 'Logged in successfully!' }));
      navigate('/home');
    }
  }, [isAuthenticated, user, dispatch, navigate]);

  if (isLoading) {
    return <Progress />;
  }

  return (
    isAuthenticated && (
      <div>
        <img src={user.picture} alt={user.name} />
        <h2>{user.name}</h2>
        <p>{user.email}</p>
      </div>
    )
  );
};

const Login = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isAuthenticated, user } = useAuth0();

  const [isValidatePassword, setValidatePassword] = useState('');
  const [isConfirmPassword, setIsConfirmPassword] = useState('');
  const [messageError, setMessageError] = useState('');
  const [validateEmail, setValidateEmail] = useState('');
  const [errorValidateEmail, setErrorValidateEmail] = useState(true);
  const [progress, setProgress] = useState(false);

  useEffect(() => {
    if (isAuthenticated && user) {
      dispatch(isActive({ isActive: true, infoUser: user }));
      dispatch(showAlert({ type: 'success', message: 'Logged in successfully!' }));
      navigate('/home');
    }
  }, [isAuthenticated, user, dispatch, navigate]);

  const onSuccess = (credentialResponse) => {
    const decoded = jwtDecode(credentialResponse.credential);
    dispatch(isActive({ isActive: true, infoUser: decoded }));
    navigate('/home');
  };

  const onFailure = () => {
    dispatch(showAlert({ type: 'error', message: 'Error en el inicio de sesión con Google' }));
  };

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
        /* services.getInfoUser(response.data.access).then(resp => {
          debugger;
          dispatch(isActive({ isActive: true, infoUser: resp }));
        }); */
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
    const checkTourist = e.target.checkTourist.value === 'on' ? 1 : 0;
    debugger;

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
        "role": checkTourist
      }
    }

    setProgress(true);
    services.signUp(data).then(response => {
      setProgress(false);
      if (response.status === 201) {
        dispatch(showAlert({ type: 'success', message: 'Se registró exitosamente!' }));
        console.log(response.data.message);
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
    let contador = 0;
    const tieneOchoCaracteres = pass.length >= 8;
    const tieneMayuscula = /[A-Z]/.test(pass);
    const tieneMinuscula = /[a-z]/.test(pass);
    const tieneEspecial = /[!@#$%^&*(),.?":{}|<>]/.test(pass);

    if (tieneMinuscula || tieneMayuscula) contador = 1;
    if (tieneMayuscula && tieneMinuscula) contador = 2;
    if (tieneOchoCaracteres && tieneMayuscula && tieneMinuscula) contador = 3;
    if (tieneOchoCaracteres && tieneMayuscula && tieneMinuscula && tieneEspecial) contador = 4;

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
      const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]*edu[a-zA-Z0-9.-]*$/;
      setErrorValidateEmail(regex.test(email));
    }
  };

  return (
    <Auth0Provider
      domain={domain}
      clientId={clientId}
      authorizationParams={{
        redirect_uri: window.location.origin
      }}
    >
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

            <div className="signup">
              <form onSubmit={registrarUsuario}>
                <label class="cls-registro" htmlFor="chk" aria-hidden="true">Registro</label>
                <input
                  type="text"
                  name="txt"
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
                  onChange={(e)=>{
                    setIsConfirmPassword(e.target.value);
                    validatePass(isValidatePassword,e.target.value);
                  }}
                />

                {messageError && <p style={{color:'white'}}>{messageError}</p>}
                <span>Eres turista?</span>
                <label class="switch">
                  <input type="checkbox" 
                         name="checkTourist" 
                         id="checkTourist"
                  />
                  <span class="slider round"></span>
                </label>
                <button className="btn-registry" type="submit" id="joinus">Registrar</button>
              </form>
            </div>
      
            <div className="login">
              <label htmlFor="chk" aria-hidden="true">Inicio</label>
              <form onSubmit={onclickLogin}>
                <input type="email" name="email" id="email" placeholder="Email" required />
                <input type="password" name="pswd" id="pass" placeholder="Password (Inicio de sesión)" required />
                <button className="btn-login" type="submit" id="disparo">Iniciar</button>
              </form>
              <div className='btn-google'>
                <GoogleLogin
                  onSuccess={onSuccess}
                  onError={onFailure}
                />
                <LoginButton />
              </div>
            </div>
            <LogoutButton />
            <Profile />
          </div>
        </div>
      </GoogleOAuthProvider>
    </Auth0Provider>
  );
};

export default Login;