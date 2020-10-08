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
        results.push(this.crypto.aes.decryptHex(await this.ipfsNode.dag.get(entry['hash']),entry['whistle']);
      }
    }
    return results;
  }

  async set(path, unencrytpedObject){
    let {secret, aesEncryptedB64 } = this.crypto.aes.encrypt(unencrytpedObject);
    encryptedHex = Buffer.from(aesEncryptedB64,'base64').toString('hex');
    let hash = await this.ipfsNode.dag.put(encryptedHex,{ format: 'dag-cbor', hashAlg: 'sha2-256' });
    this.bee.comb.set( path, { dag: 1, whistle: secret, hash: hash } );
  }

  add(path, unencrytpedObject){
    //path to timeline array
    let {secret, aesEncryptedB64 } = this.crypto.aes.encrypt(unencrytpedObject);
    encryptedHex = Buffer.from(aesEncryptedB64,'base64').toString('hex');
    let hash = await this.ipfsNode.dag.put(encryptedHex,{ format: 'dag-cbor', hashAlg: 'sha2-256' });
    this.bee.comb.add( path, { dag: 1, whistle: secret, hash: hash } );

  }

}
