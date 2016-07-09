(function() {
    var defaultOptions = {
        timeout: 2000,
        jsonpCallback: 'callback',
        callback: null,
        body: ''
    }

    function generateCallbackFunction() {
        return 'jsonp_' + Date.now()%100000 + Math.ceil(Math.random() * 1000)
    }

    function _typeof(obj) {
        var _s = Object.prototype.toString.call(obj).toLowerCase()
        return _s.substring(8, _s.length-1)
    }

    // Known issue: Will throw 'Uncaught ReferenceError: callback_*** is not defined' error if request timeout
    function clearFunction(functionName, scriptId) {
        // when fetch callback name are the same and fetch on the same time. Dont delete function.
        var scripts = document.querySelectorAll('head script[id=' + scriptId + ']')
        if(scripts.length < 2) {

            // IE8 throws an exception when you try to delete a property on window
            // http://stackoverflow.com/a/1824228/751089
            try {
                delete self[functionName]
            } catch(e) {
                self[functionName] = undefined
            }
        }
    }

    function removeScript(scriptId) {
          var script = document.getElementById(scriptId)
          script && document.getElementsByTagName('head')[0].removeChild(script)
    }

    function simpleUrlParse(url) {
        var el = self.document.createElement('a');
        el.setAttribute('href', url)
        return el
    }

    function objToParams(obj) {
        var result = []
        for(var i in obj) {
            result.push(i + '=' + obj[i].toString())
        }
        return result.join('&')
    }

    var fetchJsonp = function(url, options) {
        options = options || {}

        var timeout = options.timeout ? options.timeout : defaultOptions.timeout,
            jsonpCallback = options.jsonpCallback ? options.jsonpCallback : defaultOptions.jsonpCallback,
            timeoutId

        // if has jsonpCallback query in url, use it as options.callback && remove url jsonpCallback query
        if(url.indexOf(jsonpCallback) !== -1) {
            var urlObj = simpleUrlParse(url),
                regex = new RegExp('(' + jsonpCallback + '(=([^&#]*)|&|#|$))'),
                regArr = regex.exec(urlObj.search.substring(1))

            if(regArr) {
                urlObj.search = urlObj.search.replace(regArr[0], '')
                url = urlObj.toString()
                options.callback = regArr[3]
            }
        }

        return new Promise(function(resolve, reject){
            var callbackFunction = options.callback || generateCallbackFunction(),
                scriptId = jsonpCallback + '_' + callbackFunction

            if(self[callbackFunction]) {
                if (timeoutId) clearTimeout(timeoutId)

                removeScript(scriptId)

                clearFunction(callbackFunction)
            }

            self[callbackFunction] = function(response) {
                resolve({
                    ok: true,
                    // keep consistent with fetch API
                    json: function() {
                        return Promise.resolve(response)
                    },
                    text: function() {
                        return Promise.resolve(JSON.stringify(response))
                    }
                });

                if (timeoutId) clearTimeout(timeoutId)

                removeScript(scriptId)

                clearFunction(callbackFunction)
            };

            // Check if the user set their own params, and if not add a ? to start a list of params
            url += (url.indexOf('?') === -1) ? '?' : '&';
            if(options.body) {
                url += _typeof(options.body) === 'object' ? objToParams(options.body) : encodeURI(String(options.body))
                url += '&'
            }

            var jsonpScript = document.createElement('script')
            jsonpScript.setAttribute('src', url + jsonpCallback + '=' + callbackFunction)
            jsonpScript.id = scriptId

            document.getElementsByTagName('head')[0].appendChild(jsonpScript)

            timeoutId = setTimeout(function() {
                reject(new Error('JSONP request to ' + url + ' timed out'))

                clearFunction(callbackFunction)
                removeScript(scriptId)
            }, timeout)

            jsonpScript.onreadystatechange = jsonpScript.onerror = function() {
                if(!this.readyState || ((this.readyState === 'loaded' || this.readyState === 'complete') && !self[callbackFunction])){

                    reject(new Error('JSONP request to ' + url + ' error'))

                    if (timeoutId) clearTimeout(timeoutId)

                    clearFunction(callbackFunction)
                    removeScript(scriptId)
                }
            }
        })
    }

    // export
    self.jsonp = fetchJsonp
    var oldfetch = self.fetch || function() {}
    self.fetch = function(url, options) {
        if((options && options.method && options.method.toUpperCase() === 'JSONP')) {
            return fetchJsonp(url, options)
        }else{
            return oldfetch(url, options)
        }
    };
})();