import { NativeCrypto } from "@questnetwork/quest-crypto-js";


export class DagManager {

constructor(){}

  start(config){
    this.ipfsNode = config['ipfsNode'];
    this.crypto = new NativeCrypto();
    this.bee = config['dependencies']['bee'];
    this.dagCache = {};
  }

  //
  getWhistleForRefHash(hash,search){
    console.log(hash);
    console.log(search);

    if(search.charAt(search.length-1) != '/'){
      search += '/'
    }
    let array =  this.bee.comb.search(search);
    console.log(array);
    array = array.flat().flat();
    console.log(array);
    for(let e of array){
      if(e['qHash'] == hash){
        return e['whistle'];
      }
      if(e['prevHash'] == hash){
        return e['prevWhistle'];
      }
    }
    return false;
  }

   get(pathOrCid, config = {}){
  return new Promise( async(resolve) => {
let results = [];
let limit = 10;
let encryptedHex ;
let latestTransactionRef;


if(typeof config['storagePath'] == 'undefined'){
  config['storagePath'] = '/social/timeline/transaction/';
}

  let type = "path";

    try{


                                setTimeout( () => {
                                  resolve(results);
                                },5000);


                                if(typeof config['limit'] != 'undefined'){
                                  //set limit
                                  limit = config['limit'] ;
                                }



                                let latestTransactionRef = {};
                                if(pathOrCid.indexOf('/') == 0){

                                 // console.log(encryptedHex);
                                  latestTransactionRef = this.bee.comb.get(pathOrCid);

                                  if(typeof latestTransactionRef == 'object' && typeof latestTransactionRef['whistle'] == 'undefined'){
                                    //set latest qHash

                                    if(typeof config['whistle'] != 'undefined'){
                                      latestTransactionRef['whistle'] = config['whistle'];
                                    }
                                    else{
                                      // console.log('here')
                                      latestTransactionRef['whistle']  = this.getWhistleForRefHash( latestTransaction['qHash'], config['storagePath'] );
                                    }

                                  }

                                }
                                else{
                                  latestTransactionRef['qHash'] = pathOrCid;

                                  if(typeof config['whistle'] == 'undefined'){
                                    // console.log('here2')
                                    latestTransactionRef['whistle'] =   this.getWhistleForRefHash( latestTransactionRef['qHash'],config['storagePath']);
                                  }
                                  else{
                                    latestTransactionRef['whistle'] = config['whistle'];
                                  }

                                  type = "hash";
                                }

                                // console.log(latestTransactionRef);

                                if(typeof latestTransactionRef['whistle'] == 'undefined' || !latestTransactionRef['whistle']){
                                  throw('no whistle');
                                }

                                config['type'] = type;
                                results = await this.recursiveDagWorker(latestTransactionRef, config);
                                resolve(results)

                }catch(e){
                  console.log(e);
                }

  });
}


 getObject(hash, whistle,config = {}){
   return new Promise( async(resolve) => {

     if(typeof config['storagePath'] == 'undefined'){
       throw('getObject: no storage path');
     }

     if(typeof hash == 'undefined' && typeof whistle == 'undefined' ){
       resolve({})
     }
     else{

       // console.log(config['storagePath']);
       // console.log(hash)
       let txObj = {};
       if(typeof config['ref'] != 'undefined' && config['ref'] == true){
         txObj = this.bee.comb.get( config['storagePath'] + '/ref/'+hash );

       }
       else{
         txObj = this.bee.comb.get( config['storagePath'] + '/obj/'+hash );
       }

       //console.log(txObj);

       if(typeof txObj != 'undefined'  && typeof txObj['whistle'] == 'undefined' &&   typeof txObj['qHash'] != 'undefined' ){
         resolve(txObj);
       }else{
         let  encryptedHex = await this.ipfsNode.dag.get(hash);
         let decrypted = this.crypto.aes.decryptHex(encryptedHex.value,whistle);
         try{
           if(typeof decrypted['qHash'] == 'undefined'){
             decrypted['qHash'] = hash;
           }
        }
        catch(e){
          resolve({});
        }

         if(typeof decrypted['whistle'] == 'undefined' && typeof decrypted['qHash'] != 'undefined'){
           this.bee.comb.set( config['storagePath'] + '/obj/'+decrypted['qHash'] ,decrypted );
         }
         else if(typeof decrypted['whistle'] != 'undefined' && typeof decrypted['qHash'] != 'undefined'){
             this.bee.comb.set( config['storagePath'] + '/ref/'+hash ,decrypted );
            // console.log('got ref');
          }

         resolve(decrypted);
       }


     }

     setTimeout( () => {
        resolve({})
     },3000)

   });
 }

 recursiveDagWorker(transactionRefObject, config = { limit: 5}, limitWalker = 0){

   let timeout = 120000;

   return new Promise( async(resolve) => {
     let  latestTransaction;
     let results = [];


     if(typeof config['storagePath'] == 'undefined'){
       throw('recDW: no storage path');
     }


    try{

                                    if(typeof transactionRefObject['whistle'] == 'undefined' && typeof transactionRefObject['qHash'] == 'undefined' ){
                                      throw('no ref');
                                    }
                                    else if(config['type'] == 'hash'){
                                    //  console.log(transactionRefObject);
                                      let txObj = await this.getObject(transactionRefObject['qHash'],transactionRefObject['whistle'],config);
                                    //  console.log(txObj);
                                      if(typeof txObj != 'undefined' && typeof txObj['whistle'] != 'undefined'){
                                        config['type'] = 'path'
                                        latestTransaction = txObj;
                                      }else{
                                        resolve(txObj)
                                      }
                                    }

                                    if(config['type'] == 'path'){

                                    //  console.log(transactionRefObject);
                                    //  console.log(latestTransaction);


                                      if(typeof latestTransaction == 'undefined' || latestTransaction['whistle'] == 'undefined'){
                                        let refObj = this.bee.comb.get( config['storagePath'] + '/ref/'+transactionRefObject['qHash'] );
                                        if(typeof refObj == 'object' && typeof refObj['qHash'] != 'undefined '&& typeof refObj['whistle'] != 'undefined' ){
                                           latestTransaction = refObj;
                                        }
                                        else{
                                          let tConfig = JSON.parse(JSON.stringify(config));
                                          tConfig['ref'] = true;
                                          latestTransaction = await this.getObject(transactionRefObject['qHash'],transactionRefObject['whistle'], tConfig);
                                          // if(typeof latestTransaction['whistle'] != 'undefined' && typeof latestTransaction['qHash'] != 'undefined'){
                                          //   this.bee.comb.set( config['storagePath'] + '/ref/'+latestTransaction['qHash'] ,latestTransaction );
                                          // }
                                        }
                                      }



                                      console.log('00000:',latestTransaction,limitWalker);
                                      if(typeof latestTransaction['whistle'] != 'undefined' && typeof latestTransaction['qHash'] != 'undefined'){
                                          ///now we have the reference to the latest post
                                        //  console.log(latestTransaction);
                                          let txObj = await this.getObject(latestTransaction['qHash'],latestTransaction['whistle'],config)
                                          if(typeof txObj != 'undefined'  && typeof txObj['whistle'] == 'undefined' &&   typeof txObj['qHash'] != 'undefined' ){
                                            results.push(txObj);
                                          }
                                          else{
                                            //find it!
                                            throw('could not resolve')
                                          }


                                          if(typeof latestTransaction['prevHash'] != 'undefined' && (config['limit'] == 0 || limitWalker < config['limit'])){
                                            limitWalker++;
                                            let deeperResults = await this.recursiveDagWorker({ qHash: latestTransaction['prevHash'], whistle: latestTransaction['prevWhistle'] },config,limitWalker);
                                            results = results.concat(deeperResults);
                                            resolve(results);
                                          }
                                          else{
                                            resolve(results)
                                          }


                                      }

                                  }



           }catch(e){console.log(e)}

           setTimeout( () => {
              resolve(results)
           },timeout)
         });
}

  async set(path, unencrytpedObject,storagePath){
    let {secret, aesEncryptedB64 } = this.crypto.aes.encrypt(unencrytpedObject);
    let encryptedHex = Buffer.from(aesEncryptedB64,'base64').toString('hex');
    let cid = await this.ipfsNode.dag.put(encryptedHex,{ format: 'dag-cbor', hashAlg: 'sha2-256' });
    let hash = cid.toString();
    // this.dagCache[hash] = unencrytpedObject;
    let transaction = { whistle: secret, qHash: hash };
    this.bee.comb.set(storagePath + '/obj/'+hash ,transaction );

try{
    let {secret, aesEncryptedB64 } = this.crypto.aes.encrypt(transaction);
    let encryptedHex = Buffer.from(aesEncryptedB64,'base64').toString('hex');
    let cid = await this.ipfsNode.dag.put(encryptedHex,{ format: 'dag-cbor', hashAlg: 'sha2-256' });
    hash = cid.toString();

    transaction = { whistle: secret, qHash: hash };

      // this.dagCache[hash] = unencrytpedObject;
      this.bee.comb.set( path , transaction );
      this.bee.comb.set( storagePath + '/ref/'+hash ,transaction );
      return transaction  ;
    }catch(e){console.log(e)}

  }

  async add(path, unencrytpedObject, storagePath){
    let whistle = "";
    //path to timeline array

    //get previous object
      let latestRefHash = "";
      let latestRefObject;
      let transactionRef;
    try{
      latestRefObject =  this.bee.comb.get( path );
      console.log(latestRefObject)
    }catch(e){console.log(e)}

    let hash = "";
      let transaction = {};
    try{
        let {secret, aesEncryptedB64 } = this.crypto.aes.encrypt(unencrytpedObject);
        let encryptedHex = Buffer.from(aesEncryptedB64,'base64').toString('hex');
        let cid = await this.ipfsNode.dag.put(encryptedHex,{ format: 'dag-cbor', hashAlg: 'sha2-256' });
        hash = cid.toString();

        transaction = { whistle: secret, qHash: hash };
        this.bee.comb.set( storagePath + '/obj/'+hash ,transaction );


        if(typeof latestRefObject != 'undefined' && typeof latestRefObject['whistle'] != 'undefined'){
           transaction['prevWhistle'] = latestRefObject['whistle'];
           transaction['prevHash'] = latestRefObject['qHash'];
        }

      }catch(e){console.log(e)}

      let {secret, aesEncryptedB64 } = this.crypto.aes.encrypt(transaction);
      let encryptedHex = Buffer.from(aesEncryptedB64,'base64').toString('hex');
      let cid = await this.ipfsNode.dag.put(encryptedHex,{ format: 'dag-cbor', hashAlg: 'sha2-256' });
      hash = cid.toString();
       transactionRef = { whistle: secret, qHash: hash };


    // this.dagCache[hash] = unencrytpedObject;
    this.bee.comb.set(path,transactionRef);
    this.bee.comb.set( storagePath + '/ref/'+hash ,transactionRef );

    this.bee.comb.set( path ,transactionRef );

    // this.bee.comb.set( '/social/archive/'+transaction['qHash'] , transaction );
    return transactionRef;
  }

//    resolveWorker(dagNode){
//      return new Promise( (resolve) => {
//
//            try{
//              // console.log('QCJS: resolving... ',dagNode['qHash']);
//              let encryptedHex = this.ipfsNode.dag.get(dagNode['qHash']).then( (encryptedHex) => {
//                // console.log(encryptedHex.value);
//                let decrypted =  this.crypto.aes.decryptHex(encryptedHex.value,dagNode['whistle']);
//                decrypted['qHash'] = dagNode['qHash'];
//                // this.dagCache[dagNode['qHash']] = decrypted;
//                resolve(decrypted);
//              });
//          }catch(e){console.log(e); resolve({})}
//
//      setTimeout( () => {
//         resolve({});
//      },5000)
//   });
// }
//
//   async resolve(inputArray){
//     let outputArray = [];
//     console.log('Quest Coral JS: resolving...',inputArray);
//     for(let dagNode of inputArray){
//       if(typeof dagNode['qHash'] != 'undefined'){
//         if(typeof this.dagCache[dagNode['qHash']] != 'undefined'){
//           outputArray.push(this.dagCache[dagNode['qHash']] );
//         }
//         else{
//             let decrypted = await this.resolveWorker(dagNode);
//             if(typeof decrypted['qHash'] != 'undefined'){
//               outputArray.push(decrypted);
//             }
//         }
//
//       }
//
//     }
//     console.log(outputArray);
//     return outputArray;
//   }

}
