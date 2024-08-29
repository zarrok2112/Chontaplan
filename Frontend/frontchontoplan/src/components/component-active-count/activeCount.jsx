import React from "react";
import './activeCount.css';
import {useLocation} from 'react-router-dom';
import services from "../../services/services";
import { useNavigate } from 'react-router-dom';


const ActiveCount = () => {
	const navigate = useNavigate();
    const location = useLocation();

    const params = new URLSearchParams(location.search);

    const parametro1 = params.get('token');
    const parametro2 = params.get('user_id');

    services.getActiveCount(parametro1,parametro2).then(response => {
        console.log(response.message);

        setTimeout(() => {
            navigate('/')
        }, "3000");
    });

    return(
        <div className="container-sign-up">
            <h1>Tu cuenta ha sido activada!!</h1>
        </div>
    )
}

export default ActiveCount;