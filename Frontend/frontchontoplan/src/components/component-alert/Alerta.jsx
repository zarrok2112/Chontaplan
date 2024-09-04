import React from "react";
import './Alerta.css';
import { useSelector, useDispatch } from 'react-redux';
import Snackbar from '@mui/material/Snackbar'; // Importa Snackbar desde @mui/material/Snackbar
import Alert from '@mui/material/Alert'; 
import { showAlert, hideAlert } from '../../store/reducerAlert/alertSlice'; // Importa las acciones de la alerta



const Alerta = () => {
    const dispatch = useDispatch();
    const { isActive, type, message } = useSelector((state) => state.alert);

    const handleClose = () => {
        dispatch(hideAlert()); // Acción para ocultar la alerta
    };
    return(
        <div className="container-alert">
           
            <Snackbar 
                open={isActive} 
                autoHideDuration={3000} 
                onClose={handleClose} 
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }} // Ajusta la posición de la alerta
            >
                <Alert onClose={handleClose} severity={type}>
                    {message}
                </Alert>
            </Snackbar>
        </div>
        
    );
}

export default Alerta;