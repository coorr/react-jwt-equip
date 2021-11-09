import React, { Component } from 'react';
import PropTypes from 'prop-types';

import '../../css/reportResource.css'

class ReportResoruce extends Component {
  constructor(props) {
    super(props);
    this.state = {
      active: true,
      buttonIdsArray: ["button1", "button2"]
    }
  }
  componentDidMount() {
    this.initButton();
  }
  initButton = () => {
    this.state.buttonIdsArray.forEach(button => {
      document.getElementById(button).classList.remove("active-button");
      document.getElementById(button).classList.add("inactive-button");
    });
  };
  labelChange = (id) => {
    this.initButton();
    document.getElementById(id).classList.add("active-button");
    document.getElementById(id).classList.remove("inactive-button");
    this.setState({ active: !this.state.active });
  }

  render() {
    const { active } =this.state;
    return (
      <>
      <div className="reportResourceContainer" > 
       <div className="reportHighTitleArea">
        <button id="button1" className={active ? "reportHighButtonAction" : "reportHighButton"} onClick={() => this.labelChange("button1")} >
          <label className={active ? "reportHighLabelAction" : "reportHighLabel"} >
            보고서
          </label>
        </button>
        <button id="button2" className={active ? "reportHighButtonSecond" : "reportHighButtonSecondAction"} onClick={() => this.labelChange("button2")} > 
          <label className={active ? "reportHighLabel" : "reportHighLabelAction"} >
            통계 엑셀 다운로드
          </label>
        </button>
       </div>
      </div>
      </>
    );
  }
}



export default ReportResoruce;