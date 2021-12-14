import React, { Component } from 'react';
import { LineChart, CartesianGrid, XAxis, YAxis, Line } from 'recharts'

const data = [
  {
    name: 'Page A1',
    uv: 4000,
    pv: 2400,
    amt: 2400,
  },
  {
    name: 'Page B2',
    uv: 3000,
    pv: 1398,
    amt: 2210,
  },
  {
    name: 'Page C3',
    uv: 2000,
    pv: 9800,
    amt: 2290,
  },
  {
    name: 'Page D4',
    uv: 2780,
    pv: 3908,
    amt: 2000,
  },
  {
    name: 'Page E5',
    uv: 1890,
    pv: 4800,
    amt: 2181,
  },
  {
    name: 'Page F',
    uv: 2390,
    pv: 3800,
    amt: 2500,
  },
  {
    name: 'Page G',
    uv: 3490,
    pv: 4300,
    amt: 2100,
  },
];

function CustomAxisTick({ x, y, stroke, payload }) {
  console.log(payload);
  return (
    <g transform={`translate(${x},${y})`}>
      <text x={0} y={0} dy={16} textAnchor="end" fontSize={13} fill="#666" transform="rotate(-45)">
         {payload.value}
      </text>
    </g>
  );
}

class CustomLineChart extends Component {
  render() {
    return (
      <LineChart
      width={300}
      height={200}
      data={data}
      margin={{
        top: 20,
        right: 30,
        left: 20,
        bottom: 40,
      }}
      isAnimationActive={false}
     >
      <CartesianGrid />
      <XAxis dataKey="name" tick={<CustomAxisTick />} tickMargin={10} />
      <YAxis fontSize={10} />
      <Line type="monotone" dataKey="pv" stroke="#f00" />
      <Line type="monotone" dataKey="uv" stroke="#00f" />
    </LineChart>
    );
  }
}

export default CustomLineChart;