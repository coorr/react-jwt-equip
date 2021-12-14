import React, { Component } from 'react';
import TestDocument from './TestDocument.js'
import { renderToFile} from '@react-pdf/renderer'
import fs from 'fs'

function createPdfWithChart() {
  try {
    const pdfPath = 'document.pdf';
    console.log(`rendering chart to pdf...`);
    // await renderToFile(<TestDocument />, pdfPath);
    // console.log(renderToFile);
    return  renderToFile(<TestDocument />, pdfPath);
  } catch (error) {
    console.log(error);
    return error;
  }
}

export default createPdfWithChart;