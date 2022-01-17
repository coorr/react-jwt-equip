import axios from "axios";
import authHeader from './auth-header';
const API_URL = 'http://localhost:8080/api/manage/';

class diagramViewService {
  getTopologyNode(diagramId) {
    return axios.get(API_URL + "topology/getTopologyNode/"+diagramId);
  }
  insertTopologyNode(diagramId,data) {
    return axios.post(API_URL + "topology/insertTopologyNode/"+diagramId, data);
  }
  getDiagramGroup() {
    return axios.get(API_URL + "topology/getDiagramGroup");
  }
  insertDiagramGroup(data) {
    return axios.post(API_URL + "topology/insertDiagramGroup", data ,{ headers: { Authorization:  authHeader() }});
  }
  updateDiagramGroup(data) {
    return axios.post(API_URL + "topology/updateDiagramGroup", data ,{ headers: { Authorization:  authHeader() }});
  }
  deleteDiagramGroup(groupId) {
    return axios.post(API_URL + "topology/deleteDiagramGroup/"+groupId);
  }
}

export default new diagramViewService();