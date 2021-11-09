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
  deleteGroupEquipmentMapping(name,id,requestURL) {
    return axios.post(API_URL + "group/deleteGroupEquipmentMapping/"+name+"/"+id, null, { headers: { Authorization:  authHeader(), Referers:requestURL}}  );
  } 
  insertGroupFirst(treeName,requestURL) {
    return axios.post(API_URL + "group/insertGroupFirst", treeName , { headers: { Authorization:  authHeader(), Referers:requestURL}  } );
  } 
  insertGroupSecond(groupChildren,requestURL) {
    return axios.post(API_URL + "group/insertGroupSecond", groupChildren , { headers: { Authorization:  authHeader(), Referers:requestURL}});
  } 
  insertGroupEquipmentMapping(insertMappingKey,requestURL) {
    return axios.post(API_URL + "group/insertGroupEquipmentMapping", insertMappingKey ,  { headers: { Authorization:  authHeader(), Referers:requestURL}} );
  } 
  updateGroupName(id,treeName,requestURL) {
    return axios.post(API_URL + "group/updateGroupName/"+id, treeName ,  { headers: { Authorization:  authHeader(), Referers:requestURL}} );
  } 
  getGroupName(id,requestURL) {
    return axios.get(API_URL + "group/getGroupName/"+id ,null,  { headers: { Authorization:  authHeader(), Referers:requestURL}} );
  } 
  searchFilterGroup(equipType,equipCatagory) { 
    return axios.get(API_URL + "group/filterType/"+equipType+'/'+equipCatagory ); 
  }
  deleteGroupEquipByNo(equipId,requestURL) { 
    return axios.post(API_URL + "group/deleteGroupEquipByNo/"+equipId ,null, { headers: { Authorization:  authHeader(), Referers:requestURL}}); 
  }

  

  
  
}

export default new GroupEquipment();
