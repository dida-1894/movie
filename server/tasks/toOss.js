const qiniu = require('qiniu')
const nanoid = require('nanoid')
const config = require('../config')

const bucket = config.qiniu.bucket
const mac = new qiniu.auth.digest.Mac(config.qiniu.AK, config.qiniu.SK)
const cfg = new qiniu.conf.Config()
const client = new qiniu.rs.BucketManager(mac, config)


const uploadToQiniu = async (url, key) => {
    return new Promise((resolve, reject) => {
        client.fetch(url, bucket, key, (err, res, info) => {
            if (err) {
                console.log(err)
            } else {
                if (info.statusCode == 200) {
                    resolve({key})
                } else {
                    reject(info)
                }
            }
        })
    })
}

;(async () => {
    let movie = [{
        doubanId: '25849049',
        video: 'http://vt1.doubanio.com/201811231542/dfbe90217ad8f06baf6aad77ceb40eca/view/movie/M/402310374.mp4',
        poster: 'https://img3.doubanio.com/view/photo/l_ratio_poster/public/p2522880251.jpg',
        cover: 'https://img3.doubanio.com/img/trailer/medium/2522881826.jpg?'
    }]

    movie.map(async movie => {
        if (movie.video && !movie.key) {
            try {
                let videoData = await uploadToQiniu(movie.video, nanoid() + '.mp4')
                let posterData = await uploadToQiniu(movie.poster, nanoid() + '.jpg')
                let coverData = await uploadToQiniu(movie.cover, nanoid() + '.jpg')

                if (videoData.key) {
                    movie.videoKey = videoData.key
                }
                if (posterData.key) {
                    movie.posterKey = posterData.key
                }
                if (coverData.key) {
                    movie.coverKey = coverData.key
                }

                console.log(movie)
            } catch (e) {
                console.log(e)
            }
        }
    })
})();