import React, { Component } from 'react';
import { Global } from 'recharts';
// import ReactDom from 'react-dom/server'
// import {reactHtmlParser} from 'react-html-parser' 
import htmlSvgToPdfSvg  from './imageFromSvg.js'
 
const ChartSvg = ({ debug, style, children, width, height }) => {
  return chartToPdfSvg(children, width, height, debug, style);
};

const chartToPdfSvg = (children, width, height, debug, style) => {
  Global.set('isSsr', true);
  const component = htmlSvgToPdfSvg(children);
  console.log(component);
  Global.set('isSsr', false);

  if (!component) {
    return null;
  }

  const result = React.cloneElement(component, { width, height, debug, style });
  console.log(result);
  return result;
};

export default ChartSvg;