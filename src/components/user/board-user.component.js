import React, { Component } from "react";


import UserService from "../../services/user.service";
import EventBus from "../../common/EventBus";
import Calendar from 'react-calendar'
import 'react-calendar/dist/Calendar.css';

export default class BoardUser extends Component {
  constructor(props) {
    super(props);

    this.state = {
      content: ""
    };
  }

  componentDidMount() {
    UserService.getUserBoard().then(
      response => {
        this.setState({
          content: response.data
        });
      },
      error => {
        this.setState({
          content:
            (error.response &&
              error.response.data &&
              error.response.data.message) ||
            error.message ||
            error.toString()
        });

        if (error.response && error.response.status === 401) {
          EventBus.dispatch("logout");
        }
      }
    );
  }

  render() {
    return (
      
      
      <div className="container">
        <header className="jumbotron">
          <h3>{this.state.content}</h3>
          <Calendar  calendarType="ISO 8601" />
        </header>
      </div>
    );
  }
}
