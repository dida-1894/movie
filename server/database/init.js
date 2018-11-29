const mongoose = require('mongoose')
const db = 'mongodb://localhost/douban-test'

mongoose.Promise = global.Promise

exports.connect = () => {
    let maxConnectTimes = 0
    return new Promise((resolve, reject) => {
        if (process.env.NODE_ENV !== 'production') {
            mongoose.set('debug', true)
        }

        mongoose.connect(db)

        mongoose.connection.on('disconnected', () => {
            maxConnectTimes ++
            if (maxConnectTimes < 5) {
                mongoose.connect(db)
            } else {
               throw new Error ('数据库链接失败了呢')
            }
        })

        mongoose.connection.on('error', err => {
            maxConnectTimes ++

            if (maxConnectTimes < 5) {
                mongoose.connect(db)
            } else {
                console.log(err)
                throw new Error('数据库链接失败了呢')
            }
        })

        mongoose.connection.once('open', () => {
            const Dog = mongoose.model('Dog', {name: String})
            const doga = new Dog({name: 'alpha'})

            doga.save().then(() => {
                console.log(doga)
            })
            resolve()
            console.log("MongoDB connected successfully!")
        })
    })
}
