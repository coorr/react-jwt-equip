import React, { Component } from 'react';
import moment from 'moment';
import _ from 'lodash';

import axiosConf from '../../axios';
import { Card, CardHeader, CardBody, Nav, NavItem, NavLink } from '../../components';
import Spinner from '../../lib/Spinner';
import ChartComponent from '../../lib/Chart/ChartComponent';

class AnalysisIndex extends Component {
    static defaultProps = {
        chartOptions: {
            chart: {
                type: 'line',
                zoomType: "x",
                isSynced: true
            },
            xAxis: {
                categories: [],
                labels: {
                    format: "{value:%H:%M}",
                }
            },
            yAxis: {
                title: {
                    text: 'Traffic'
                }
            },
            series: [{
                name: 'Request',
                color: '#C7473E',
                data: []
            }, {
                name: 'Response',
                color: '#617DBE',
                data: []
            }, {
                name: 'Total',
                color: '#A3BB3F',
                data: []
            }]
        }
    }

    constructor(props) {
        super(props);

        this.state = {
            showSpinner: true,
            selectKey: "l2",
            currentDate: moment().subtract("1", "minutes").toDate(),
            l2ChartOptions: {
                lenDeltaChart: {
                    name: "Len Delta",
                    option: _.cloneDeep(this.props.chartOptions),
                    reqKey: "lenReqDelta",
                    resKey: "lenResDelta"
                },
                lenPerSecChart: {
                    name: "Len Per Sec",
                    option: _.cloneDeep(this.props.chartOptions),
                    reqKey: "lenReqPerSec",
                    resKey: "lenResPerSec"
                },
                pktsLenMaxChart: {
                    name: "Pkts Len Max",
                    option: _.cloneDeep(this.props.chartOptions),
                    reqKey: "pktLenMaxReq",
                    resKey: "pktLenMaxRes"
                },
                pktsLenMinChart: {
                    name: "Pkts Len Min",
                    option: _.cloneDeep(this.props.chartOptions),
                    reqKey: "pktLenMinReq",
                    resKey: "pktLenMinRes"
                },
                pktsDeltaChart: {
                    name: "Pkts Delta",
                    option: _.cloneDeep(this.props.chartOptions),
                    reqKey: "pktsReqDelta",
                    resKey: "pktsResDelta"
                },
                pktsPerSecChart: {
                    name: "Pkts Per Sec",
                    option: _.cloneDeep(this.props.chartOptions),
                    reqKey: "pktsReqPerSec",
                    resKey: "pktsResPerSec"
                }
            }
        };
    }

    componentDidMount() {
        this.getAnalysisData();
        this.autoComponentSize();

        setInterval(() => {
            this.setState({
                currentDate: moment().subtract("1", "minutes").toDate(),
                showSpinner: true
            }, () => {
                this.updateAnalysisData();
            });
        }, 60000);

        window.addEventListener("resize", () => {
            this.autoComponentSize();
        });
    }

    componentWillUnmount() {
        window.removeEventListener("resize", () => {
            this.autoComponentSize();
        });
    }

    autoComponentSize = () => {
        if (document.getElementById('l2ChartEl')) {
            const mainHeight = document.body.clientHeight - document.getElementById('navbarEl').clientHeight - document.getElementById('footerEl').clientHeight;
            document.getElementById('l2ChartEl').style.height = mainHeight - 50 + 'px';
        }
    }

    updateAnalysisData() {
        const { currentDate } = this.state;
        const formatDate = moment(currentDate).format("YYYYMMDDHHmmss");
        let cloneL2ChartOptions = _.cloneDeep(this.state.l2ChartOptions);

        axiosConf.get("/api/analysis/getFlowstatStaticL2Last/" + formatDate).then(res => {
            _.forEach(res.data, (obj) => {
                // timestamp 변환
                const formatTsArrivalTime = obj.date ? parseFloat(moment(obj.date * 1000).format("x")) : "-";

                _.map(cloneL2ChartOptions, (chart) => {
                    const totData = (obj[chart.reqKey] + obj[chart.resKey]).toFixed(2);

                    chart.option.xAxis.categories.shift();
                    chart.option.xAxis.categories.push(formatTsArrivalTime);

                    chart.option.series[0].data.shift();
                    chart.option.series[1].data.shift();
                    chart.option.series[2].data.shift();

                    chart.option.series[0].data.push(obj[chart.reqKey]);
                    chart.option.series[1].data.push(obj[chart.resKey]);
                    chart.option.series[2].data.push(parseFloat(totData));
                });
            });

            this.setState({
                l2ChartOptions: cloneL2ChartOptions,
                showSpinner: false
            });
        }).catch(() => {
            this.setState({ showSpinner: false });
        });
    }

    getAnalysisData() {
        const { currentDate } = this.state;
        const formatDate = moment(currentDate).format("YYYYMMDDHHmmss");
        let cloneL2ChartOptions = _.cloneDeep(this.state.l2ChartOptions);

        axiosConf.get("/api/analysis/getFlowstatStaticL2/" + formatDate).then(res => {
            res.data = _.sortBy(res.data, (obj) => {
                return obj.date;
            });

            _.forEach(res.data, (obj) => {
                // timestamp 변환
                const formatTsArrivalTime = obj.date ? parseFloat(moment(obj.date * 1000).format("x")) : "-";

                _.map(cloneL2ChartOptions, (chart) => {
                    const totData = (obj[chart.reqKey] + obj[chart.resKey]).toFixed(2);

                    chart.option.xAxis.categories.push(formatTsArrivalTime);

                    chart.option.series[0].data.push(obj[chart.reqKey]);
                    chart.option.series[1].data.push(obj[chart.resKey]);
                    chart.option.series[2].data.push(parseFloat(totData));
                });
            });

            this.setState({
                l2ChartOptions: cloneL2ChartOptions,
                showSpinner: false
            });
        }).catch(() => {
            this.setState({ showSpinner: false });
        });
    }

    menuClickEvt = (key) => {
        this.setState({
            selectKey: key
        });
    }
    onClick = () => {
      
    }

    render() {
        const { selectKey, showSpinner, currentDate, l2ChartOptions } = this.state;

        return (
            <>
                <Nav tabs className="m-1">
                    <NavItem>
                        <NavLink href="#" className={selectKey === "l2" ? 'pl-5 pr-5 active' : 'pl-5 pr-5'} onClick={((e) => this.menuClickEvt("l2"))}>L2</NavLink>
                    </NavItem>
                    <div className="position-absolute" style={{ right: ".5rem" }}>
                        조회기간:
                        <b className="font-blue ml-2">
                            {moment(currentDate).subtract("30", "minutes").format("YYYY-MM-DD HH:mm")} ~ {moment(currentDate).format("YYYY-MM-DD HH:mm")}
                        </b>
                    </div>
                </Nav>

                <div className="autoy" id="l2ChartEl">
                    {
                        _.map(l2ChartOptions, (obj, i) => (
                            <Card className="m-1" key={i}>
                              <button onClick={()=> this.onClick()} >aaa</button>
                                <CardHeader><b>{obj.name}</b></CardHeader>
                                <CardBody>
                                    <ChartComponent options={obj.option} syncId="l2ChartEl" />
                                </CardBody>
                            </Card>
                        ))
                    }
                </div>

                <Spinner style={{ position: "absolute" }} visible={showSpinner} />
            </>
        );
    }
}

export default AnalysisIndex;