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
  
    async loginService(formdata) {
        try {
            return await axios.post('http://localhost:8000/api/v1/user/login/',formdata,{
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                 },
            });
        }
        catch(e) {
            console.log('error '+e);
        }
    }

    getActiveCount(token,user) {
        return axios.get(`http://localhost:8000/api/v1/user/signup/confirmed?token=${token}&user_id=${user}`)
    }

    registerEvent(token,data) {
        return axios.post('http://localhost:8000/api/v1/events/',data,{
            headers: {
                Authorization: `Bearer ${token}`,
             },
        });
    }

    getEvents(token) {
        return axios.get('http://localhost:8000/api/v1/events/', {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
    }

    createChat(token) {
        return axios.post('http://localhost:8000/api/v1/chat/create-chat/',undefined,{
            headers: {
                Authorization: `Bearer ${token}`,
             }
        });
    }
}

export default new Services();