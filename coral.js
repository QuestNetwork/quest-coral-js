const { v4: uuidv4 } = require('uuid');
import { Subject } from "rxjs";
import { DagManager } from "./dag.js";


export class Coral {
    constructor(ipfsNode) {
      this.ipfsNode = ipfsNode;
      this.commitNowSub = new Subject();
      this.commitSub = new Subject();
      this.channelConfig = {};

      let uVar;

      this.channelNameListSub = new Subject();
      this.dag = new DagManager();
    }


    start(config){
      config['ipfsNode']  = this.ipfsNode;
      this.dag.start(config);
    }



  }
