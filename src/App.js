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
import BoardAdmin from "./components/deviceManage/equipment-manage";
import ManageEquipmentList from "./components/deviceManage/equipment-group-manage";
import Modify from './modals/modify.component';

import EventBus from "./common/EventBus";
import "rc-tree/assets/index.less";
import "./styles.css";

class App extends Component {
  constructor(props) {
    super(props);
    this.logOut = this.logOut.bind(this);

    this.state = {
      showModeratorBoard: false,
      showAdminBoard: false,
      currentUser: undefined,
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

  render() {
    const { currentUser, showModeratorBoard, showAdminBoard } = this.state;
    const isAuthorized = AuthService.getCurrentUser();

    return (
      
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
              <Link to={"/manageEquipmentList"} className="rootNavBarText">
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
                <Link to={"/admin"} className="rootNavBarText">
                  장비 관리
                </Link>
              </li>
            )}

            {currentUser && (
              <li className="rootNavBarList">
                <Link to={"/user"} className="rootNavBarText">
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

        <div className="sideBarAreas"></div>

        <div>
          <Switch>
            <Route exact path={["/", "/home"]} component={Home} />
            <Route exact path="/login" component={Login} />
            <Route exact path="/register" component={Register} />
            <Route exact path="/profile" component={Profile} />
            <Route path="/user" component={BoardUser} />
            <Route path="/mod" component={BoardModerator} />
            <Route path="/admin" component={BoardAdmin} />
            <Route path="/manageEquipmentList" component={ManageEquipmentList} />
            <Route path="/modify/:selectedData" component={Modify} />

            {/* <Route path="/deviceListComponent" component={DeviceListComponent} /> */}
          </Switch>
        </div>

        { /*<AuthVerify logOut={this.logOut}/> */ }
      </div>
    );
  }
}

export default App;