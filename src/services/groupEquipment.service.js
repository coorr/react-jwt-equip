import axios from "axios";

const API_URL = 'http://localhost:8080/api/manage/';

class GroupEquipment { 
  getGroupEquipment() {
    return axios.get(API_URL + "group/getGroupEquipment");
  }
  unGroupEquipment() {
    return axios.get(API_URL + "group/unGroupEquipment");
  }
  deleteGroup(groupId) {
    return axios.post(API_URL + "delete" , groupId, JSON.stringify(groupId))  //'application/json; charset=utf-8'
  } 
}

export default new GroupEquipment();
