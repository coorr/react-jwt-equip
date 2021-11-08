import axios from 'axios';
import authHeader from './auth-header';

const API_URL = 'http://localhost:8080/api/test/';

class UserService {
  getPublicContent() {
    return axios.get(API_URL + 'all');
  }

  getUserBoard() {
    return axios.get(API_URL + 'user', { headers: { Authorization:  authHeader()} }); // Authorization: 'Bearer' + user.accessToken
  }

  getModeratorBoard() {
    return axios.get(API_URL + 'mod', {headers: { Authorization:  authHeader()} });
  }

  getAdminBoard() {
    return axios.get(API_URL + 'admin', {headers: { Authorization:  authHeader()} });
  }

  getTestBoard() {
    return axios.get(API_URL + 'test');
  }
}

export default new UserService();
