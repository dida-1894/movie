const puppeteer = require('puppeteer')
const cofig = requre('../config')

console.log(don)

const base = 'https://movie.douban.com/subject/'
const doubanId = '25849049/'
const videoBase = `https://movie.douban.com/trailer/238802/#content`

const sleep = time => new Promise(resolve => {
        setTimeout(resolve, time)
    })

function getVideoData (url, encoding) {
    return new Promise((resolve, reject) => {
        let req = http.get(url, function (res) {
            let result = ''
            encoding && res.setEncoding(encoding)
            res.on('data', function (d) {
                result += d
            })
            res.on('end', function () {
                resolve(result)
            })
            res.on('error', function (e) {
                reject(e)
            })
        })
        req.end()
    })
}

function savefileToPath (fileName, fileData) {
    let fileFullName = `${config.savePath}/${fileName}.mp4`
    return new Promise((resolve, reject) => {
        fs.writeFile(fileFullName, fileData, 'binary', function (err) {
            if (err) {
                console.log('savefileToPath error:', err)
            }
            resolve('已下载')
        })
    })
}

const downloadVideo = async video => {
        // 判断视频文件是否已经下载
        if (!fs.existsSync(`${config.savePath}/${video.title}.mp4`)) {
            await getVideoData(video.src, 'binary').then(fileData => {
                console.log('下载视频中：', video.title)
                savefileToPath(video.title, fileData).then(res =>
                    console.log(`${res}: ${video.title}`)
                )
            })
        } else {
            console.log(`视频文件已存在：${video.title}`)
        }
    }

;(async () => {
    console.log('Start visit the target page')
    const broswer = await puppeteer.launch({
        args: ['--no-sandbox'],
        dumpio: false
    })

    const page = await broswer.newPage()
    await page.goto(base + doubanId, {
        waitUntil: 'networkidle2'
    })

    await sleep(1000)

    const result = await page.evaluate(() => {
        var _$ = window.$
        var item = _$('.related-pic-video')
        if (item && item.length > 0) {
            let link = item.attr('href')
            let cover = item.css('background-image').replace('url("','').replace('")','')
            return {
                link,
                cover
            }
        }
        return {}
    })

    let video = {}
    if (result.link) {
        await page.goto(result.link, {
            waitUntil: 'networkidle2'
        })

        await sleep(2000)
        video.src = await page.evaluate(() => {
            var _$ = window.$
            var it = $('.vjs-tech source')

            if (it && it.length>0) {
                return it.attr('src')
            }

            return ''
        })
    }



    const data = {
        video,
        cover: result.cover
    }
    broswer.close()

    process.send(data)
    process.exit(0)
})();