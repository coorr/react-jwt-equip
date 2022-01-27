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
  dbImage: string;
  currentImage: string;
  
}
interface AppState {
  image: string;
  currentImage: string;
}

let imageData:any = null;
const $ = go.GraphObject.make;

export class DiagramWrapper extends Component<WrapperProps,AppState, {}> {
  private diagramRef: React.RefObject<ReactDiagram>;

  constructor(props: WrapperProps) {
    super(props);
    this.state = {
      image: null,
      currentImage: null,
    }
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

  public componentDidUpdate(prevProps: Readonly<WrapperProps>, prevState: Readonly<AppState>, snapshot?: {}): void {
    const diagram = this.diagramRef.current.getDiagram();

      if(this.props.dbImage !== prevProps.dbImage) {
        console.log(this.props.dbImage);
        console.log(prevProps.dbImage);
        if(diagram.parts.first() !== null) {
          diagram.remove(diagram.parts.first());
        }
        diagram.add(
          $(go.Part, {
            layerName:"Background", 
            selectable:false, pickable:false,
            location: new go.Point(-250,-350),
          }, 
          $(go.Picture, {
            width: 500, 
            height:700,
          }, `http://localhost:8080/static/${this.props.dbImage}`
          ))
        )
      }

      if(this.props.currentImage !== prevProps.currentImage) {
        console.log("currentImage");
        
        if(diagram.parts.first() !== null) {
          diagram.remove(diagram.parts.first());
        }
        diagram.add(
          $(go.Part, {
            layerName:"Background", 
            selectable:false, pickable:false,
            location: new go.Point(-250,-350),
          }, 
          $(go.Picture, {
            width: 500, 
            height:700,
            source: this.props.currentImage
          }
          ))
        )
      }

      


  }


  private initDiagram(): go.Diagram {
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
              },
              linkFromKeyProperty: 'froms',
              linkToKeyProperty: 'tos',
            }),
        });
    
        function ConvertitToInt(a:any) {
          return Math.round(a.x).toString()+" "+Math.round(a.y).toString();
        }

      
      // diagram.add(
      // $(go.Part,  // this Part is not bound to any model data
      //   {
      //     width: 840, height: 570,
      //     layerName: "Background", position: new go.Point(0, 0),
      //     selectable: false, pickable: false
      //   },
      //   $(go.Picture, "http://localhost:8080/static/16430934867374003.png")
      // ));

    
    // function changeZOrder(amt:Number, obj:any) {
    //   diagram.commit(function(d) {
    //     var data = obj.part.data;
    //     d.model.set(data, "zOrder", data.zOrder + amt);
    //   }, 'modified zOrder');
    // }
    

    diagram.nodeTemplate =
      $(go.Node, 'Vertical',  
        new go.Binding('location', 'loc',go.Point.parse).makeTwoWay(ConvertitToInt),
        $(go.Panel,"Auto", 
        { width: 65 },
        // $("Button",
        // { alignment: go.Spot.BottomLeft, alignmentFocus: go.Spot.BottomLeft,
        //   click: function (e, obj) { changeZOrder(-1, obj); } },
        //   ),
          $(go.Shape, 'RoundedRectangle',
            {
              name: 'SHAPE', fill: 'white', strokeWidth: 2, stroke: 'skyblue',
              portId: '', fromLinkable: true, toLinkable: true, cursor: 'pointer',
              width:60, 
            },
            new go.Binding('fill', 'color'),
            new go.Binding('stroke', 'nodeBorder'),
            ),
            $(go.Picture,
              {maxSize: new go.Size(50, 50), source: EquipmentLogo},
              new go.Binding("source" , "img"),
              new go.Binding("maxSize" , "size", go.Size.parse).makeTwoWay(),
              ),
          ),
          $(go.TextBlock,
            { margin: 1, editable: true, font: '400 .775rem Roboto, sans-serif' },  
            new go.Binding('text','equipment').makeTwoWay()
            ),
          $(go.TextBlock,
            { margin: 1, editable: true, font: '400 .775rem Roboto, sans-serif' },  
            new go.Binding('text','settingIp').makeTwoWay()
            ),
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

