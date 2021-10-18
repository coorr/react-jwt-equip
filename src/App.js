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
      {/* { currentUser=== null ? <Redirect to="/" /> : null} */}
        <nav className="navbar navbar-expand navbar-dark bg-dark navbarSize" >
          <Link to={"/"} className="navbar-brand">
            임시페이지
          </Link>
          <div className="navbar-nav mr-auto">
            <li className="nav-item">
              <Link to={"/home"} className="nav-link">
                Home
              </Link>
            </li>

            {showAdminBoard && (
            <li className="nav-item">
              <Link to={"/manageEquipmentList"} className="nav-link">
                장비그룹관리 
              </Link>
            </li>
            )}

          {/* {showAdminBoard && (
            <li className="nav-item">
              <Link to={"/deviceTotalView"} className="nav-link">
              장비등록
              </Link>
            </li>
          )} */}

            {showModeratorBoard && (
              <li className="nav-item">
                <Link to={"/mod"} className="nav-link">
                  Moderator Board
                </Link>
              </li>
            )}

            {showAdminBoard && (
              <li className="nav-item">
                <Link to={"/admin"} className="nav-link">
                  장비 관리
                </Link>
              </li>
            )}
            
  

            {currentUser && (
              <li className="nav-item">
                <Link to={"/user"} className="nav-link">
                  User
                </Link>
              </li>
            )}
          </div>

          {currentUser ? (
            <div className="navbar-nav ml-auto">
              <li className="nav-item">
                <Link to={"/profile"} className="nav-link">
                  {currentUser.username}
                </Link>
              </li>
              <li className="nav-item">
                <a href="/login" className="nav-link" onClick={this.logOut}>
                  LogOut
                </a>
              </li>
            </div>
          ) : (
            <div className="navbar-nav ml-auto">
              <li className="nav-item">
                <Link to={"/login"} className="nav-link ">
                  Login
                </Link>
              </li>

              <li className="nav-item">
                <Link to={"/register"} className="nav-link ">
                  Sign Up
                </Link>
              </li>
            </div>
          )}
        </nav>

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