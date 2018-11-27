const http = require('http')

function getVideoData(url, encoding) {
    return new Promise((resolve, reject) => {
        let req = http.get(url, res => {
            let result = ''
            encoding && res.setEncoding(encoding)
            res.on('data', (d) => {
                result
            })
        })
    })
}