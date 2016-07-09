describe('JSONP', function() {
    var jsonpTestUrl = 'http://jsfiddle.net/echo/jsonp/'
    function _typeof(obj) {
        var _s = Object.prototype.toString.call(obj).toLowerCase()
        return _s.substring(8, _s.length-1)
    }

    it('should be using jsonp GET success', function(done) {
        fetch(jsonpTestUrl, {
                method: 'jsonp',
                timeout: 2000
            })
            .then(function(res){
                expect(res.ok).equal(true)
                return res.json()
            })
            .then(function(res) {
                expect(_typeof(res)).equal('object')
                done()
            })['catch'](done)
    })

    it('should be using jsonp body with string', function(done) {
        fetch(jsonpTestUrl, {
                method: 'jsonp',
                timeout: 2000,
                body: 'a=1&b=2&c=3'
            })
            .then(function(res){
                expect(res.ok).equal(true)
                return res.json()
            })
            .then(function(res) {
                expect(res.a).equal('1')
                done()
            })['catch'](done)
    })

    it('should be using jsonp body with object', function(done) {
        fetch(jsonpTestUrl, {
                method: 'jsonp',
                timeout: 2000,
                body: {
                    a: 1,
                    b: 2,
                    c: 3
                }
            })
            .then(function(res){
                expect(res.ok).equal(true)
                return res.json()
            })
            .then(function(res) {
                expect(_typeof(res)).equal('object')
                done()
            })['catch'](done)
    })

    it('url including query', function(done) {
        fetch(jsonpTestUrl + '?a=1&b=3&c=1', {
            method: 'jsonp',
            timeout: 2000
        })
        .then(function(res){
            expect(res.ok).equal(true)
            return res.json()
        })
        .then(function(res) {
            expect(_typeof(res)).equal('object')
            done()
        })['catch'](done)
    })

    it('url including query and one of queries matched jsonpCallback', function(done) {
        fetch(jsonpTestUrl + '?callback=urlCallback&a=1&c=1', {
            method: 'jsonp',
            timeout: 2000
        })
        .then(function(res){
            expect(res.ok).equal(true)
            return res.json()
        })
        .then(function(res) {
            expect(_typeof(res)).equal('object')
            done()
        })['catch'](done)
    })

    it('url including query and one of queries matched jsonpCallback. but jsonpCallback doesn\'t have value', function(done) {
        fetch(jsonpTestUrl + '?callback&a=1', {
            method: 'jsonp',
            timeout: 2000
        })
        .then(function(res){
            expect(res.ok).equal(true)
            return res.json()
        })
        .then(function(res) {
            expect(_typeof(res)).equal('object')
            done()
        })['catch'](done)
    })

    it('url including query and one of queries matched jsonpCallback. jsonpCallback and options.jsonpCallback both have value.', function(done) {
        fetch(jsonpTestUrl + '?a=2&callback=urlCallback', {
            method: 'jsonp',
            callback: 'optionCallback',
            timeout: 2000
        })
        .then(function(res){
            expect(res.ok).equal(true)
            return res.json()
        })
        .then(function(res) {
            expect(_typeof(res)).equal('object')
            done()
        })['catch'](done)
    })

    it('should be using jsonp GET fire on the same time', function(done) {
        var fetchOptions = {
                method: 'jsonp',
                callback: 'jsonp123',
            }

        for(var i = 0; i < 3; i++) {
            fetch('./data.jsonp', fetchOptions)
                .then(function(res) {
                    expect(res.ok).equal(true)
                    return res.json()
                })
                .then(function(res) {
                    expect(typeof(res.a)).equal('number')
                    done()
                })['catch'](done)
        }
    })

    it('should be using jsonp GET fire on the same time using promise.all', function(done) {
        var fetchOptions = {
                method: 'jsonp',
            }

        Promise.all([
                fetch(jsonpTestUrl, fetchOptions),
                fetch(jsonpTestUrl, fetchOptions),
                fetch(jsonpTestUrl, fetchOptions)
            ])
            .then(function(res) {
                var isPass = true
                for(var i = 0; i < res.length; i++) {
                    var obj = res[i]
                    if(obj.ok === false) {
                        isPass = false
                    }
                }
                expect(isPass).equal(true)
                done()
            })['catch'](done)
    })

    it('should be support jsonp response 404 case', function(done) {
        fetch(jsonpTestUrl + 'data.jsonp', {
                method: 'jsonp',
                callback: 'jsonp123',
                timeout: 100000,
            })['catch'](function(err) {
                expect(!!err).equal(true)
                done()
            })
    })
})