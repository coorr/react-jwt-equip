import axios from "axios";
import authHeader from './auth-header';
const API_URL = 'http://localhost:8080/api/manage/';

class diagramViewService {
  getTopologyNode() {
    return axios.get(API_URL + "topology/getTopologyNode");
  }
  insertTopologyNode(data) {
    return axios.post(API_URL + "topology/insertTopologyNode", data);
  }
}

export default new diagramViewService();