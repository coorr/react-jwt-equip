import axios from "axios";
import authHeader from './auth-header';
const API_URL = 'http://localhost:8080/api/manage/';

class GroupEquipment { 
  getGroupEquipment() {
    return axios.get(API_URL + "group/getGroupEquipment");
  }
  unGroupEquipment() {
    return axios.get(API_URL + "group/unGroupEquipment");
  }
  deleteGroupEquipmentMapping(name,id) {
    return axios.post(API_URL + "group/deleteGroupEquipmentMapping/"+name+"/"+id, null, { headers: authHeader() }  );
  } 
  insertGroupFirst(treeName) {
    return axios.post(API_URL + "group/insertGroupFirst", treeName , { headers: authHeader() } );
  } 
  insertGroupSecond(groupChildren) {
    return axios.post(API_URL + "group/insertGroupSecond", groupChildren , { headers: authHeader() });
  } 
  insertGroupEquipmentMapping(insertMappingKey) {
    return axios.post(API_URL + "group/insertGroupEquipmentMapping", insertMappingKey , { headers: authHeader() } );
  } 
  updateGroupName(id,treeName) {
    return axios.post(API_URL + "group/updateGroupName/"+id, treeName , { headers: authHeader() } );
  } 
  getGroupName(id) {
    return axios.get(API_URL + "group/getGroupName/"+id ,null, { headers: authHeader() } );
  } 
  searchFilterGroup(equipType,equipCatagory) { 
    return axios.get(API_URL + "group/filterType/"+equipType+'/'+equipCatagory ); 
  }
  deleteGroupEquipByNo(equipId) { 
    return axios.post(API_URL + "group/deleteGroupEquipByNo/"+equipId ,null,{ headers: authHeader() }); 
  }

  

  
  
}

export default new GroupEquipment();
