import axios from "axios";

const API_URL = 'http://localhost:8080/api/manage/';

class GroupEquipment { 
  getGroupEquipment() {
    return axios.get(API_URL + "group/getGroupEquipment");
  }
  unGroupEquipment() {
    return axios.get(API_URL + "group/unGroupEquipment");
  }
  deleteGroupEquipmentMapping(name,id) {
    return axios.post(API_URL + "group/deleteGroupEquipmentMapping/"+name+"/"+id,  );
  } 
  insertGroupFirst(treeName) {
    return axios.post(API_URL + "group/insertGroupFirst", treeName );
  } 
  insertGroupSecond(groupChildren) {
    return axios.post(API_URL + "group/insertGroupSecond", groupChildren );
  } 
  insertGroupEquipmentMapping(insertMappingKey) {
    return axios.post(API_URL + "group/insertGroupEquipmentMapping", insertMappingKey );
  } 
  updateGroupName(id,treeName) {
    return axios.post(API_URL + "group/updateGroupName/"+id, treeName );
  } 
  getGroupName(id) {
    return axios.get(API_URL + "group/getGroupName/"+id );
  } 
  

  
  
}

export default new GroupEquipment();
