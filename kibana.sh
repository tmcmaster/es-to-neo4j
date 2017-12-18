#!/bin/bash

curl 'http://kib.prd.syd.mmd:5601/elasticsearch/_msearch?timeout=0&ignore_unavailable=true&preference=1513284851089' \
  -H 'Origin: http://kib.prd.syd.mmd:5601' \
  -H 'Accept-Encoding: gzip, deflate' \
  -H 'Accept-Language: en-GB,en-US;q=0.9,en;q=0.8' \
  -H 'kbn-version: 4.6.5' \
  -H 'User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/63.0.3239.84 Safari/537.36' \
  -H 'Content-Type: application/json;charset=UTF-8' \
  -H 'Accept: application/json, text/plain, */*' \
  -H 'Referer: http://kib.prd.syd.mmd:5601/app/kibana' \
  -H 'Connection: keep-alive' \
  --data-binary $'{"index":["mmlite-2017.12.14"],"ignore_unavailable":true}\n{"size":1500,"sort":[{"@timestamp":{"order":"desc","unmapped_type":"boolean"}}],"highlight":{"pre_tags":["@kibana-highlighted-field@"],"post_tags":["@/kibana-highlighted-field@"],"fields":{"*":{}},"require_field_match":false,"fragment_size":2147483647},"query":{"filtered":{"query":{"query_string":{"query":"*","analyze_wildcard":true,"allow_leading_wildcard":false}},"filter":{"bool":{"must":[{"range":{"@timestamp":{"gte":1513283956695,"lte":1513284856695,"format":"epoch_millis"}}}],"must_not":[]}}}},"aggs":{"2":{"date_histogram":{"field":"@timestamp","interval":"30s","time_zone":"Australia/Sydney","min_doc_count":0,"extended_bounds":{"min":1513283956695,"max":1513284856695}}}},"fields":["*","_source"],"script_fields":{},"fielddata_fields":["mailTimestamp","messageExpiry","@timestamp"]}\n'  \
  --compressed
