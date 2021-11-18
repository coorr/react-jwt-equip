import React, { Component } from "react";
import { Switch, Route, Link ,Redirect} from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";

import "./App.css";

import AuthService from "./services/auth.service";

import Login from "./components/user/login.component";
import Register from "./components/user/register.component";
import Home from "./components/user/home.component";
import Profile from "./components/user/profile.component";
import BoardUser from "./components/user/board-user.component";
import BoardModerator from "./components/user/board-moderator.component";
import EquipmentManage from "./components/deviceManage/equipment-manage";
import ManageEquipmentList from "./components/deviceManage/equipment-group-manage";
import Modify from './modals/modify.component';
import HistoryRecord from "./components/deviceManage/histroy-record";
import ReportResoruce from "./components/deviceManage/report-resource";

import test from "./components/deviceManage/test";

import EventBus from "./common/EventBus";
import "rc-tree/assets/index.less";
import "./styles.css";

import Equipment from '../src/images/equipment.png'
import { FaBeer } from 'react-icons/fa';
import { AiOutlineMenu } from 'react-icons/ai'
import { AiFillSetting } from 'react-icons/ai'
import { BiUserCircle } from 'react-icons/bi';
import { Navbar, Nav, NavDropdown,LinkContainer,NavItem,Logout,Container,DropdownButton,Dropdown } from "react-bootstrap";
import { ProSidebar, Menu, MenuItem, SubMenu } from 'react-pro-sidebar';
import 'react-pro-sidebar/dist/css/styles.css';

const AiOutlineMenuIcon = <AiOutlineMenu color='white' />

class App extends Component {
  constructor(props) {
    super(props);
    this.logOut = this.logOut.bind(this);

    this.state = {
      showModeratorBoard: false,
      showAdminBoard: false,
      currentUser: undefined,
      dropdownOpen:false,
    };
  }

  componentDidMount() {
    const user = AuthService.getCurrentUser(); 

    if (user) {
      this.setState({
        currentUser: user,
        showModeratorBoard: user.roles.includes("ROLE_MODERATOR"),
        showAdminBoard: user.roles.includes("ROLE_ADMIN"),
      });
    }
    
    EventBus.on("logout", () => {
      this.logOut();
    });
  }

  componentWillUnmount() {
    EventBus.remove("logout");
  }

  logOut() {
    AuthService.logout();
    this.setState({
      showModeratorBoard: false,
      showAdminBoard: false,
      currentUser: undefined,
    });
  }

  onMouseOver = () => { this.setState({dropdownOpen:true}) }
  onMouseLeave = () => { this.setState({dropdownOpen:false}) }
  toggle = () => { this.setState(prevState => ({
    dropdownOpen: !prevState.dropdownOpen
  })) }

  render() {
    const { currentUser, showModeratorBoard, showAdminBoard } = this.state;
    const isAuthorized = AuthService.getCurrentUser();

    return (
      <>
      {!window.localStorage.getItem('user') && ( <Redirect to="/login" />) }
     
      <div className="ContainerBox"> 
        <nav className="rootNavBarArea" >
          <Link to={"/"} className="rootNavBarTitle">
              임시페이지
          </Link>
          <div className="rootNavBar">
            <li className="rootNavBarList">
              <Link to={"/home"} className="rootNavBarText">
                Home
              </Link>
            </li>

            {showAdminBoard && (
            <li className="rootNavBarList">
              <Link to={"/equipmentGroupManage"} className="rootNavBarText">
                장비그룹관리 
              </Link>
            </li>
            )}

            {showModeratorBoard && (
              <li className="rootNavBarList">
                <Link to={"/mod"} className="rootNavBarText">
                  Moderator Board
                </Link>
              </li>
            )}

            {showAdminBoard && (
              <li className="rootNavBarList">
                <Link to={"/equipmentManage"} className="rootNavBarText">
                  장비 관리
                </Link>
              </li>
            )}
          

            {showAdminBoard && (
              <li className="rootNavBarList">
                <Link to={"/historyRecord"} className="rootNavBarText">
                  감사 이력
                </Link>
              </li>
            )}

            {showAdminBoard && (
              <li className="rootNavBarList">
                <Link to={"/reportResoruce"} className="rootNavBarText">
                  보고서
                </Link>
              </li>
            )}

            {currentUser && (
              <li className="rootNavBarList">
                <Link to={"/test"} className="rootNavBarText">
                  User
                </Link>
              </li>
            )}
          </div>

          {currentUser ? (
            <div className="rootNavBarLogin">
              <li className="rootNavBarListLogin">
                <Link to={"/profile"} className="rootNavBarTextLogin">
                  {currentUser.username}
                </Link>
              </li>
              <li className="rootNavBarListLogin">
                <a href="/login" className="rootNavBarTextLogin" onClick={this.logOut}>
                  LogOut
                </a>
              </li>
            </div>
          ) : (
            <div className="rootNavBarLogin">
              <li className="rootNavBarListLogin">
                <Link to={"/login"} className="rootNavBarTextLogin ">
                  Login
                </Link>
              </li>

              <li className="rootNavBarListLogin">
                <Link to={"/register"} className="rootNavBarTextLogin ">
                  Sign Up
                </Link>
              </li>
            </div>
          )}
        </nav>

        
        <div className="ContainerSecond">
          <div className="sideBarAreas">
          {showAdminBoard && (
            <Dropdown drop='right' onFocus={()=> this.onMouseOver()} toggle={()=> this.toggle()} onMouseOver={() => this.onMouseOver()} onMouseLeave={()=> this.onMouseLeave()} show={this.state.dropdownOpen}  >
              <Dropdown.Toggle><AiOutlineMenu color={'white'} size={24} /></Dropdown.Toggle>
                <Dropdown.Menu>
                    <Dropdown.Item onClick={() => this.onMouseLeave()} as={Link} to={'/equipmentManage'}>장비 관리</Dropdown.Item>
                    <Dropdown.Item  onClick={() => this.onMouseLeave()} as={Link} to={'/historyRecord'} >감사 이력</Dropdown.Item>
                    <Dropdown.Item  onClick={() => this.onMouseLeave()} as={Link} to={'/reportResoruce'} >보고서</Dropdown.Item>
                </Dropdown.Menu>
            </Dropdown>
          )}
          {/* <Dropdown drop='right' onFocus={()=> this.onMouseOver()} toggle={()=> this.toggle()} onMouseOver={() => this.onMouseOver()} onMouseLeave={()=> this.onMouseLeave()} show={this.state.dropdownOpen}  >
              <Dropdown.Toggle><AiFillSetting color={'white'} size={24} /></Dropdown.Toggle>
              <Dropdown.Menu>
                  <Dropdown.Item as={Link} to={'/admin'}>sad</Dropdown.Item>
                  <Dropdown.Item as={Link} to={'/historyRecord'} >sadsad</Dropdown.Item>
              </Dropdown.Menu>
          </Dropdown> */}
          </div>
          
            <Switch>
              <Route exact path={["/", "/home"]} component={Home} />
              <Route exact path="/test" component={test} />

              <Route exact path="/login" component={Login} />
              <Route exact path="/register" component={Register} />
              <Route exact path="/profile" component={Profile} />
              <Route exact path="/user" component={BoardUser} />
              <Route exact path="/mod" component={BoardModerator} />
              <Route exact path="/equipmentManage"      component={showAdminBoard ? EquipmentManage : () => <div>Loading posts...</div>  }  />
              <Route exact path="/equipmentGroupManage" component={showAdminBoard ? ManageEquipmentList : () => <div>Loading posts...</div>  } />
              <Route exact path="/historyRecord"        component={showAdminBoard ? HistoryRecord : () => <div>Loading posts...</div>} />
              <Route exact path="/reportResoruce"        component={showAdminBoard ? ReportResoruce : () => <div>Loading posts...</div>} />
            </Switch>
          
        </div>
        
      </div>
      {/* <div style={{height:'100px', border:'1px solid green'}}>

      </div> */}
      </>
    );
  }
}

export default App;