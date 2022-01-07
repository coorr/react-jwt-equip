import React, { Component } from 'react';
import * as go from 'gojs';
import { ReactDiagram } from 'gojs-react';
import styles from '../../../css/diagramEquipment.module.css'
import EquipmentLogo from '../../../images/equipment.png';

interface WrapperProps {
  nodeDataArray: Array<go.ObjectData>;
  linkDataArray: Array<go.ObjectData>;
  modelData: go.ObjectData;
  skipsDiagramUpdate: boolean;
  onDiagramEvent: (e: go.DiagramEvent) => void;
  onModelChange: (e: go.IncrementalData) => void;
}

export class DiagramWrapper extends Component<WrapperProps, {}> {
  private diagramRef: React.RefObject<ReactDiagram>;

  constructor(props: WrapperProps) {
    super(props);
    this.diagramRef = React.createRef();
  }

  public componentDidMount() {
    if (!this.diagramRef.current) return;
    const diagram = this.diagramRef.current.getDiagram();
    if (diagram instanceof go.Diagram) {
      diagram.addDiagramListener('ChangedSelection', this.props.onDiagramEvent);
    }
  }

  public componentWillUnmount() {
    if (!this.diagramRef.current) return;
    const diagram = this.diagramRef.current.getDiagram();
    if (diagram instanceof go.Diagram) {
      diagram.removeDiagramListener('ChangedSelection', this.props.onDiagramEvent);
    }
  }  


  private initDiagram(): go.Diagram {
    const $ = go.GraphObject.make;

    const diagram =
      $(go.Diagram,
        {
          'undoManager.isEnabled': true,  // 모델 변경 수신을 허용하도록 설정해야 합니다. 
          'clickCreatingTool.archetypeNodeData': { text: 'new node', color: 'lightblue' },
          model: $(go.GraphLinksModel,
            {
              linkKeyProperty: 'id',  
              makeUniqueKeyFunction: (m: go.Model, data: any) => {
                let k = data.id || 1;
                while (m.findNodeDataForKey(k)) k++;
                data.id = k;
                return k;
              },

              makeUniqueLinkKeyFunction: (m: go.GraphLinksModel, data: any) => {
                let k = data.id || -1;
                while (m.findLinkDataForKey(k)) k--;
                data.id = k;
                return k;
              }
            })
        });

    
    diagram.nodeTemplate =
      $(go.Node, 'Vertical',  
        new go.Binding('location', 'loc', go.Point.parse).makeTwoWay(go.Point.stringify),
        $(go.Panel,"Auto",
          $(go.Shape, 'RoundedRectangle',
            {
              name: 'SHAPE', fill: 'white', strokeWidth: 2, stroke: 'skyblue',
              portId: '', fromLinkable: true, toLinkable: true, cursor: 'pointer'
            },
            new go.Binding('fill', 'color')),
            $(go.Picture,
              {maxSize: new go.Size(50, 50), source: EquipmentLogo},
              new go.Binding("source" , "img")),
          ),
          $(go.TextBlock,
            { margin: 1, editable: true, font: '400 .775rem Roboto, sans-serif' },  
            new go.Binding('text','equipment').makeTwoWay()
            ),
          $(go.TextBlock,
            { margin: 1, editable: true, font: '400 .775rem Roboto, sans-serif' },  
            new go.Binding('text','settingIp').makeTwoWay()
            )
        );

    diagram.linkTemplate =
      $(go.Link,
        new go.Binding('relinkableFrom', 'canRelink').ofModel(),
        new go.Binding('relinkableTo', 'canRelink').ofModel(),
        $(go.Shape,
          {strokeWidth: 2},
          new go.Binding('stroke' , 'borderColor', function(type) {
            switch(type) {
              case 1:
                return "skyblue";
              case 2:
                return "green";
              case 3:
                return "yellow";
              case 4:
                return "orange";
              case 5:
                return "red";
              default:
                return 'skyblue';
            }
          })
          ), 
      );
      diagram.toolManager.mouseWheelBehavior = go.ToolManager.WheelZoom;   // 스크롤 zoom 활성화
      diagram.allowInsert=false;   // 클릭 시 node 생성 방지
      diagram.model.nodeKeyProperty= function(nodeData , id) {   // key 속성 -> id 변경
        return nodeData.id;
      }
      // diagram.model.link
      // diagram.model = $(go.GraphLinksModel,
      //   {linkFromKeyProperty: 'froms'}  
      // )

      // diagram.model = $(go.GraphLinksModel, { linkFromPortIdProperty: 'from' });

      // diagram.model.l
      // diagram.model.linkFromPortIdProperty = (data:any, newval:any)  => {
      //   console.log(data);
        
      //   return data.edge.froms
      // }

      // diagram.model.linkFromKeyProperty
      // m.setFromKeyForLinkData = function(linkdata, froms) {
      //   console.log(linkdata);
      //   console.log(froms);
        
        
      //   return linkdata.froms;
      // }

      // m.linkFromKeyProperty = function(linkdata, froms) {
      //   console.log(linkdata);
        
      //   return linkdata.froms;
      // }
      // // diagram.model=m
      // m.linkToPortIdProperty= 'tos';

    return diagram;
  }

  

  
  public render() {
    return (
      <ReactDiagram
        ref={this.diagramRef}
        divClassName={styles.diagram_component}
        initDiagram={this.initDiagram}
        nodeDataArray={this.props.nodeDataArray}
        linkDataArray={this.props.linkDataArray}
        modelData={this.props.modelData}
        onModelChange={this.props.onModelChange}
        skipsDiagramUpdate={this.props.skipsDiagramUpdate}
      />
    );
  }
}

