import axios from 'axios';

class Services {
    signUp(data) {
        try {
            return axios.post('http://localhost:8000/api/v1/user/signup/',data)
        }
        catch(e) {
            console.log('error '+e);
        }
    }
  
    async login(formdata){
        return await axios.post('http://localhost:8000/api/v1/user/login/',formdata,{
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
             },
        });
    }
}

export default new Services();