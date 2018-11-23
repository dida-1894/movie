const puppeteer = require('puppeteer')

const base = 'https://movie.douban.com/subject/'
const doubanId = '3168101/'
const videoBase = `https://movie.douban.com/trailer/238802/#content`

const sleep = time => new Promise(resolve => {
        setTimeout(resolve, time)
    })

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
            let cover = item.attr('style').backgroundImage
            return {
                link,
                cover
            }
        }
        return {}
    })

    let video
    if (result.link) {
        await page.goto(result.link, {
            waitUntil: 'networkidle2'
        })

        await sleep(2000)
        video = await page.evaluate(() => {
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
        base: base+doubanId,
        cover: result.cover
    }
    broswer.close()

    process.send(data)
    process.exit(0)
})();