# jsonp
jsonp api base on Promise api. Default export the api to window.jsonp. the api format all the same with [fetch])(https://fetch.spec.whatwg.org/) api. This api ie8 supported.

## api format
| name | format | default | description |
| --- | --- | --- | --- |
| method | string | GET | fetch api default value |
| timeout | number | 2000 | timeout. unit is ms |
| callback | string | auto generate | jsonp callback function name |
| body | string or object | - | merge into the url query |

## example
```
var url = 'http://jsfiddle.net/echo/jsonp/'

// fetch api extend jsonp method
fetch(url, {
    method: 'jsonp',
    callback: 'lalala',
    timeout: 2000 // default is 2000ms
}).then(function(res) {
    console.log('res = ', res) // res is {}
})['catch'](function(err) {
    console.log('error = ', err)
})
```

## test
Using phantomjs running testing on terminal.
`npm test`