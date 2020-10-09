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
        if(typeof entry['qHash'] == 'string'){
          try{
          console.log(entry['qHash']);
          let encryptedHex = await this.ipfsNode.dag.get(entry['qHash']);
          // console.log(encryptedHex);
          let decrypted = this.crypto.aes.decryptHex(encryptedHex.value,entry['whistle']);
          decrypted['qHash'] = entry['qHash'];
          results.push(decrypted);
          }
          catch(e){console.log(e)}
        }
      }
      console.log(results);
      return results;
    }
    else if(typeof array['qHash'] == 'string'){
        try{
          let encryptedHex = await this.ipfsNode.dag.get(array['qHash']);
          let decrypted = this.crypto.aes.decryptHex(encryptedHex.value,array['whistle']);
          decrypted['qHash'] = array['qHash'];
          return decrypted;
        }
        catch(e){console.log(e)}
    }

    throw('Quest Coral: Could not get',path);
  }

  async set(path, unencrytpedObject){
    let {secret, aesEncryptedB64 } = this.crypto.aes.encrypt(unencrytpedObject);
    let encryptedHex = Buffer.from(aesEncryptedB64,'base64').toString('hex');
    let cid = await this.ipfsNode.dag.put(encryptedHex,{ format: 'dag-cbor', hashAlg: 'sha2-256' });
    let hash = cid.toString();
    this.bee.comb.set( path, { dag: 1, whistle: secret, qHash: hash } );
  }

  async add(path, unencrytpedObject){
    //path to timeline array
    let {secret, aesEncryptedB64 } = this.crypto.aes.encrypt(unencrytpedObject);
    let encryptedHex = Buffer.from(aesEncryptedB64,'base64').toString('hex');
    let cid = await this.ipfsNode.dag.put(encryptedHex,{ format: 'dag-cbor', hashAlg: 'sha2-256' });
    let hash = cid.toString();
    this.bee.comb.add( path, { dag: 1, whistle: secret, qHash: hash } );
  }

  async resolve(inputArray){
    let outputArray = [];
    console.log('Quest Coral JS: resolving...',inputArray);
    for(let dagNode of inputArray){
      if(typeof dagNode['qHash'] == 'string'){
        try{
          console.log('QCJS: resolving... ',dagNode['qHash']);
          let encryptedHex = await this.ipfsNode.dag.get(dagNode['qHash']);
          console.log(encryptedHex.value);
          let decrypted =  this.crypto.aes.decryptHex(encryptedHex.value,dagNode['whistle']);
          decrypted['qHash'] = dagNode['qHash'];
          outputArray.push( decrypted );
        }catch(e){console.log(e)}
      }
    }
    console.log(outputArray);
    return outputArray;
  }

}
