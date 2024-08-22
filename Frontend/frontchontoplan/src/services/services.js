import axios from 'axios';

class Services {
    signUp(data) {
        return axios.post('http://localhost:8000/api/v1/user/signup',data)
    }

    login(correo,contra){
        return axios.post('http://localhost:8000/api/v1/user/login',{
            email:correo,
            password:contra
        });
    }
}

export default new Services();