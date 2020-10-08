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
    results = [];
    if(typeof array['indexOf'] != 'undefined'){
      for( entry of array ){
        let encryptedHex = await this.ipfsNode.dag.get(entry['hash']);
        results.push(this.crypto.aes.decryptHex(encryptedHex,entry['whistle']));
      }
      return results;
    }
    else{
      let encryptedHex = await this.ipfsNode.dag.get(array['hash']);
      return this.crypto.aes.decryptHex(encryptedHex,array['whistle']);
    }
  }

  async set(path, unencrytpedObject){
    let {secret, aesEncryptedB64 } = this.crypto.aes.encrypt(unencrytpedObject);
    let encryptedHex = Buffer.from(aesEncryptedB64,'base64').toString('hex');
    let hash = await this.ipfsNode.dag.put(encryptedHex,{ format: 'dag-cbor', hashAlg: 'sha2-256' });
    this.bee.comb.set( path, { dag: 1, whistle: secret, hash: hash } );
  }

  async add(path, unencrytpedObject){
    //path to timeline array
    let {secret, aesEncryptedB64 } = this.crypto.aes.encrypt(unencrytpedObject);
    let encryptedHex = Buffer.from(aesEncryptedB64,'base64').toString('hex');
    let hash = await this.ipfsNode.dag.put(encryptedHex,{ format: 'dag-cbor', hashAlg: 'sha2-256' });
    this.bee.comb.add( path, { dag: 1, whistle: secret, hash: hash } );
  }

  async resolve(inputArray){
    let outputArray = [];
    for(dagNode of inputArray){
      outputArray.push( this.get(dagNode['hash'],dagNode['whistle']) );
    }
    return outputArray;
  }

}
