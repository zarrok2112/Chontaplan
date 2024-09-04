
import React from "react";
import './activeCount.css';
import {useLocation} from 'react-router-dom';
import services from "../../services/services";
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { showAlert } from '../../store/reducerAlert/alertSlice';



const ActiveCount = () => {

    const dispatch = useDispatch();



	const navigate = useNavigate();
    const location = useLocation();

    const params = new URLSearchParams(location.search);

    const parametro1 = params.get('token');
    const parametro2 = params.get('user_id');

    services.getActiveCount(parametro1,parametro2).then(response => {
        console.log(response.message);
        dispatch(showAlert({ type: 'success', message: 'Se activo la cuenta exitosamente!' }));
        setTimeout(() => {
            navigate('/')
        }, "3000");
    }).catch((error)=> {
        dispatch(showAlert({ type: 'error', message: 'Error al activar la cuenta!' }));
        console.log("error active acount "+error);
    });

    return(
        <div className="container-sign-up">
            <h1>Tu cuenta ha sido activada!!</h1>
        </div>
    )
}

export default ActiveCount;