import React, { useState } from 'react';
import './login.css';
import services from '../../services/services';
import { useNavigate } from 'react-router-dom';
import Progress from '../component-progress/Progress';

const Login = () => {

	const navigate = useNavigate();

	const [isValidatePassword, setValidatePassword] = useState('');
	const [isConfirmPassword, setIsConfirmPassword] = useState('');
	const [messageError, setMessageError] = useState('');
	const [validateEmail, setValidateEmail] = useState('');
	const [errorValidateEmail, setErrorValidateEmail] = useState(true);
	const [progress,setProgress] = useState(false);

	var contador = 0 ;

	const login = (e) => {
		e.preventDefault();

		const user = e.target.email.value;
		const pass = e.target.pswd.value;
		const formData = new URLSearchParams();
		formData.append('email', user);
		formData.append('password',pass);

		setProgress(true)
		services.login(formData).then(response => {
			setProgress(false);
			if(response.status === 200) {
				console.log(response.data.message);
			} else {
				console.log(response.data.message);
			}
		});

		e.target.email.value = '';
		e.target.pswd.value = '';
	}
    
	const registrarUsuario = (e) => {
		e.preventDefault();
		const nombre = e.target.name.value;
		const correo = e.target.email.value;
		const contra = e.target.pass.value;
		const verifiContra = e.target.passTwo.value;

		let data = {
			"user_info":{
				"name": nombre,
				"email": correo,
				"password": contra,
				"role":0
			}
		}
		
		setProgress(true);
		services.signUp(data).then(response => {
			setProgress(false);
			if(response.status === 200) {
				console.log(response);
				navigate('/home');
			} else {
				console.log(response.data[0].errorMessage);
			}
		})
		
		e.target.name.value = '';
		e.target.email.value = '';
		e.target.pass.value = '';
		e.target.passTwo.value = '';

	}

	const validatePass = (pass, confir) => {
		const  tieneOchoCaracteres = pass.length >= 8; // Filtrar solo los números
		const tieneMayuscula = /[A-Z]/.test(pass); // Verificar mayúsculas
		const tieneMinuscula = /[a-z]/.test(pass); // Verificar minúsculas
		const tieneEspecial = /[!@#$%^&*(),.?":{}|<>]/.test(pass); // Verificar caracteres especiales

		if(tieneMinuscula || tieneMayuscula) {
			contador = 1 ; 
			
		}
		if (tieneMayuscula && tieneMinuscula ) {
			contador = 2 ; 
		} 
		if(tieneOchoCaracteres && tieneMayuscula && tieneMinuscula) {
			contador = 3 ; 
		} 
		if(tieneOchoCaracteres && tieneMayuscula && tieneMinuscula && tieneEspecial) {
			contador = 4 ; 
			
		} 
		

		if (contador !== 0) {
			
			progressPassword(contador);

			

		}
		
		if(pass === confir) {
			setMessageError("");
		} else {
			setMessageError("La contraseña no coincide.");
		}
		
		if(pass === '') {
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
			{progress ? <Progress />:<></>}
            <div class="mirave">
				Cali es Cali
				<br />
				<spam>lo demás es loma </spam>
			</div>

			<div class="main">  	
				<input type="checkbox" id="chk" aria-hidden="true" />

					<div class="signup">
						<form onSubmit={registrarUsuario}>
							<label for="chk" aria-hidden="true">Registro</label>
							<input 
								type="text" 
								name="txt" 
								id="name"
								placeholder="Full name" 
								required="" 
							/>
							<input 
								type="email" 
								name="email" 
								id="email"
								placeholder="Email" 
								required=""
								value={validateEmail}
								onChange={(e) => {
									setValidateEmail(e.target.value);
									validateCorreoEdu(e.target.value);
								}}
							/>
							{errorValidateEmail === false ? <p style={{color:'white'}}>{"El correo no es edu"}</p>:''}
							<input 
								type="password" 
								name="pass"
								id="pass"
								placeholder="Password" 
								required=""
								value = {isValidatePassword}
								onChange={(e)=>{
									setValidatePassword(e.target.value)
									validatePass(e.target.value,isConfirmPassword);
								}} 
							/>
							<div class="password-strength">
								<span>Seguridad de la contraseña</span>
								<div class="strength-meter">
									<div class="strength-bar"></div>
									<div class="strength-bar"></div>
									<div class="strength-bar"></div>
									<div class="strength-bar"></div>
								</div>
							</div>

							<input 
								type="password"
								name="passTwo" 
								id="passTwo"
								placeholder="Repeat password" 
								required=""
								value={isConfirmPassword}
								onChange={(e)=>{
									setIsConfirmPassword(e.target.value);
									validatePass(isValidatePassword,e.target.value);
								}}
							/>
							{messageError && <p style={{color:'white'}}>{messageError}</p>}
							<button type="submit" id="joinus">Registrar</button>
						</form>
					</div>
			
					<div class="login">

							<label for="chk" aria-hidden="true">Inicio</label>
						<form onSubmit={login}>
							<input type="email" name="email" id="email" placeholder="Email" required="" />
							<input type="password" name="pswd" id="pass" placeholder="Password" required="" />

							<button type="submit" id="disparo">Iniciar</button>
						</form>
					</div>
			
			</div>
    	</div>

    );
};

export default Login;
