import { NativeCrypto } from "@questnetwork/quest-crypto-js";


export class DagManager {

constructor(){}

  start(config){
    this.ipfsNode = config['ipfsNode'];
    this.crypto = new NativeCrypto();
    this.bee = config['dependencies']['bee'];
  }



  async get(path){
    let array = this.bee.comb.get(path);
    let results = [];
    if(typeof array['indexOf'] != 'undefined'){
      for(let entry of array ){
        if(typeof entry['hash'] == 'string'){
          console.log(entry['hash']);
          let encryptedHex = await this.ipfsNode.dag.get(entry['hash']);
          // console.log(encryptedHex);
          results.push(this.crypto.aes.decryptHex(encryptedHex.value,entry['whistle']));
        }
      }
      console.log(results);
      return results;
    }
    else if(typeof array['hash'] == 'string'){
        let encryptedHex = await this.ipfsNode.dag.get(array['hash']);
        return this.crypto.aes.decryptHex(encryptedHex.value,array['whistle']);
      
    }
  }

  async set(path, unencrytpedObject){
    let {secret, aesEncryptedB64 } = this.crypto.aes.encrypt(unencrytpedObject);
    let encryptedHex = Buffer.from(aesEncryptedB64,'base64').toString('hex');
    let cid = await this.ipfsNode.dag.put(encryptedHex,{ format: 'dag-cbor', hashAlg: 'sha2-256' });
    let hash = cid.toString();
    this.bee.comb.set( path, { dag: 1, whistle: secret, hash: hash } );
  }

  async add(path, unencrytpedObject){
    //path to timeline array
    let {secret, aesEncryptedB64 } = this.crypto.aes.encrypt(unencrytpedObject);
    let encryptedHex = Buffer.from(aesEncryptedB64,'base64').toString('hex');
    let cid = await this.ipfsNode.dag.put(encryptedHex,{ format: 'dag-cbor', hashAlg: 'sha2-256' });
    let hash = cid.toString();
    this.bee.comb.add( path, { dag: 1, whistle: secret, hash: hash } );
  }

  async resolve(inputArray){
    let outputArray = [];
    console.log('Quest Coral JS: resolving...',inputArray);
    for(let dagNode of inputArray){
      if(typeof dagNode['hash'] == 'string'){
        console.log('QCJS: resolving... ',dagNode['hash']);
        let encryptedHex = await this.ipfsNode.dag.get(dagNode['hash']);
        console.log(encryptedHex.value);
        let decrypted =  this.crypto.aes.decryptHex(encryptedHex.value,dagNode['whistle']);

        outputArray.push( decrypted );
      }
    }
    console.log(outputArray);
    return outputArray;
  }

}
