# Quest Coral JS
> IPFS Datastore For The Quest Network

## Lead Maintainer

[StationedInTheField](https://github.com/StationedInTheField)

## Description

IPFS Datastore For The Quest Network.

## Installation & Usage

``npm install @questnetwork/quest-coral-js@0.9.4``

We recommend to use our [quest-cli](https://github.com/QuestNetwork/quest-cli) to test and build the package.
Pro Tip: Put a file in your `/bin` that runs the quest-cli like so `node /path/to/quest-cli/index.js` from any folder on your system. It's much nicer!

## API

### dag

#### async set(path, unencrytpedObject,storagePath)
[![Bee](https://img.shields.io/badge/process-Bee-yellow)](https://github.com/QuestNetwork/quest-bee-js) [![Ocean](https://img.shields.io/badge/process-Ocean-blue)](https://github.com/QuestNetwork/quest-ocean-js)

Returns the reference object.

``
let latestRef = <os>.coral.dag.set('/my/path',unencrytpedObject,{ storagePath: '/archive/social/timeline/transaction' });
``

#### async add(path, unencrytpedObject,storagePath)
[![Bee](https://img.shields.io/badge/process-Bee-yellow)](https://github.com/QuestNetwork/quest-bee-js) [![Ocean](https://img.shields.io/badge/process-Ocean-blue)](https://github.com/QuestNetwork/quest-ocean-js)

Returns the reference object.

``
let latestRef = <os>.coral.dag.add('/my/path',unencrytpedObject,{ storagePath: '/archive/social/timeline/transaction' });
``

#### async get(pathOrCid, config = {})
[![Bee](https://img.shields.io/badge/process-Bee-yellow)](https://github.com/QuestNetwork/quest-bee-js) [![Ocean](https://img.shields.io/badge/process-Ocean-blue)](https://github.com/QuestNetwork/quest-ocean-js)


Returns the decrypted object or array of objects.
``
let array = <os>.coral.dag.get('/my/path',{ limit: 5 });
``

## Features

**0.9.4**
- Basic functionality
- Uses [`ipfs.dag`](https://docs.ipfs.io/concepts/merkle-dag/)

## Support Us
This project is a lot of work and unfortunately we need to eat food (ツ)

| Ethereum| Bitcoin |
|---|---|
| `0xBC2A050E7B87610Bc29657e7e7901DdBA6f2D34E` | `bc1qujrqa3s34r5h0exgmmcuf8ejhyydm8wwja4fmq`   |
|  <img src="doc/images/eth-qr.png" >   | <img src="doc/images/btc-qr.png" > |

## License
GNU Affero GPLv3
