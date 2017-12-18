#!/usr/local/bin/node

var fs = require('fs');
var r = require("request");

var mapping = require("./mapping.json");
//console.log(JSON.stringify(mapping));

function fields2map(fields, data) {
    return fields.filter(function(f) {
      return (f.param in data && data[f.param] !== undefined)
    }).map(function(f) {
      return `${f.name}: \$${f.param}`;
    }).join(',');
}

function node2cypher(n, data) {
  const fields = fields2map(n.fields, data);
  return `MERGE (${n.id}:${n.type} {${fields}})`;
}

function link2cypher(l) {
  return `MERGE (${l.source})-[:${l.type}]->(${l.destination})`;
}

function createTransformMap(mapping) {
  const transformMap = {};
  mapping.nodes.forEach(function(n) {
    n.fields.forEach(function(f) {
      transformMap[f.param] = f.path;
    });
  });
  return transformMap;
}

function createCypherString(mapping, data) {
  var cypherNodes = mapping.nodes.map(function(n) {
    return node2cypher(n, data);
  }).join(' ');

  var cypherLinks = mapping.links.map(function(l) {
    return link2cypher(l);
  }).join(' ');

  return `${cypherNodes} ${cypherLinks}`;
}

// const cypherString = createCypherString(mapping);
// console.log(cypherString);

const transformMap = createTransformMap(mapping);
console.log('TransformMap: ', transformMap);

const neo4jUrl = "http://localhost:7474/db/data/transaction/commit";

// const CYPHER = "MERGE (message:Message {uid: $messageId}) "
//                 + "MERGE (provider:Provider {uid: $providerId}) "
//                 + "MERGE (vendor:Vendor {uid: $vendorId}) "
//                 + "MERGE (carrier:Carrier {uid: $carrierId, name: $carrierName}) "
//                 + "MERGE (sourceAddress:Phone {number: $sourceAddress}) "
//                 + "MERGE (destinationAddress:Phone {number: $destinationAddress}) "
//                 + "MERGE (account:Account {uid: $accountId}) "
//                 + "MERGE (worker:Worker {uid: $workerId}) "
//
//                 + "MERGE (message)-[:SENT_THROUGH]->(provider) "
//                 + "MERGE (message)-[:SENT_BY]->(vendor) "
//                 + "MERGE (message)-[:SENT_THROUGH]->(carrier) "
//                 + "MERGE (message)-[:SENT_FROM]->(sourceAddress) "
//                 + "MERGE (message)-[:SENT_TO]->(destinationAddress) "
//                 + "MERGE (message)-[:SENT_WITH]->(account) "
//                 + "MERGE (message)-[:PROCESSED_BY]->(worker);";

//console.log(CYPHER);

// const data = {
//   messageId:'bcc8a6ce-7f76-4a33-8490-e8280dd094bf',
//   providerId:'5cd7b636-9439-46da-884f-dd59573af22c',
//   vendorId:'MessageMedia',
//   carrierId:'818f669f-2b33-4099-a0c3-a9c793d8231d',
//   carrierName:'[US] AT&T Mobility',
//   sourceAddress:'67329',
//   destinationAddress:'+17085042404',
//   accountId:'CMRetailManag096',
//   workerId:'i-0b00987d9eb95e2d7',
//   timestamp:'2017-12-14_20:54:16,693'
// };

loadFromFile();
//writeToNeo4j(data)

function cypher(query,params,cb) {
  r.post({uri:neo4jUrl,
          json:{statements:[{statement:query,parameters:params}]}},
         function(err,res) { cb(err,res)})
}

function writeToNeo4j(params) {
  console.log(JSON.stringify(params));

  const cypherString = createCypherString(mapping,params);
  console.log(cypherString, params);

  cypher(cypherString,params,function(err,response) {
    console.log('----------\n' + JSON.stringify(response.body.errors));
  });

}

function loadFromFile() {
  fs.readFile('results.json', 'utf8', function (err, data) {
      if (err) throw err;
      var obj = JSON.parse(data);
      var results = obj.responses[0].hits.hits;

      var counter = 0;
      results.forEach(function(record) {

        if (counter < 4) {
          counter++;
          const result = record._source;
          //console.log(result)

          const data = {};
          Object.keys(transformMap).forEach(function(key) {
            const path = transformMap[key];
            const value = result[path];
            data[key] = value;
          });
          writeToNeo4j(data);
        }

        // var d = {
        //   messageId: result.gatewayMessageId,
        //   providerId: result.providerId,
        //   vendorId: result.gatewayVendorId,
        //   carrierId: result.carrierId,
        //   carrierName: result.carrierName,
        //   sourceAddress: result.sourceAddress,
        //   destinationAddress: result.destinationAddress,
        //   accountId: result.gatewayAccountId,
        //   workerId: result.workerId,
        //   timestamp: result['@timestamp']
        // };

      });
  });
}
