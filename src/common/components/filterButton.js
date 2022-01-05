import React, { Component } from 'react';
import styled from 'styled-components'

const filterDiv = styled.div` 
  text-align: center;
  margin-right: 4%; 

  & button {
    padding: 0.375rem 0.75rem; 
    margin-bottom: 0; 
    font-size: 0.8rem; 
    color:#3e515b; 
    font-weight: bold;
  }

  & button {
    border-top: 25px solid #fff;
    border-left: 1px solid transparent; 
    border-right: 15px solid transparent; 
    border-left: 15px solid transparent; 
    border-bottom: none;
    background: none;
    padding-left: 0.5rem;
    display: inline-flex;
    height: 0;
    width: 100px;
  }

  & label {
    margin-top: -1.7rem;
  }
`

/* 보고서 filter button*/
// .reportFilterButtonBox{text-align: center; margin-right: 4%;}
// .input-group-addon{padding: 0.375rem 0.75rem; margin-bottom: 0; font-size: 0.8rem; color:#3e515b; font-weight: bold; }
// .reportFilterButtonBtn{
//   border-top: 25px solid #fff;
//    border-left: 1px solid transparent; 
//    border-right: 15px solid transparent; 
//    border-left: 15px solid transparent; 
//    border-bottom: none;
//   background: none;
//   padding-left: 0.5rem;
//   display: inline-flex;
//   height: 0;
//   width: 100px;
//   }
// .reportFilterLabel{ margin-top: -1.7rem; }

class filterButton extends Component {
  render() {
    return (
      <filterDiv className="reportFilterButtonBox">
        <button type="button" className="input-group-addon reportFilterButtonBtn" onClick={()=> this.clickFilter()}>
          <label className="reportFilterLabel">
            ▲ Filter
          </label>
        </button>
      </filterDiv>
    );
  }
}

export default filterButton;