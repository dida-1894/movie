const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const Schema = mongoose.Schema
const Mixed = Schema.Types.Mixed
const SALT_WORK_FACTOR = 10
const MAX_LOGIN_ATTEMPTS = 5 //连续输错五次密码，是为忘记密码
const LOCK_TIME = 2 * 60 * 60 * 100

const UserSchema = new Schema({
    doubanId: {
      unique: true,
      required: true,
      type: String,  
    },
    email: {
        unique: true,
        required: true,
        type: String,
    },
    password: {
        unique: true,
        type: String
    },
    loginAttempts: {
      type: Number,
      required: true,
      default: 0
    },
    meta: {
        createdAt: {
            type: Date,
            default: Date.now()
        },
        updateAt: {
            type: Date,
            default: Date.now()
        }
    }
})

UserSchema.pre('save', next => {
    if (this.isNew) {
        this.meta.createdAt = this.meta.updateAt = Date.now()
    } else {
        this.meta.updateAt = Date.now()
    }
    next()
})

UserSchema.virtual('isLocked').get(() => {
    return !!(this.lockUntil && this.lockUntil > Date.now())
})

UserSchema.pre('save', next=> {
    if (!user.isModified('password')) return next()

    bcrypt.genSalt(SALT_WORK_FACTOR, (err, salt) => {
        if (error) return next(err)
        bcrypt.hash(this.password, salt, (error, hash) => {
            if (error) return next(error)

            this.password = hash
            next()
        })
    })
    
    next()
})
//实例方法，比对密码，限定登陆最大次数
UserSchema.methods = {
    comparePassword: (_password, password) => {
        return new Promise(((resolve, reject) => {
            bcrypt.compare(_password, password, (err, isMath) => {
                if (!err) resolve(isMath)
                else reject(err)
            })
        }))
    },

    incLoginAttepts: (user) => {
        return new Promise((resolve, reject) => {
            if (this.lockUntil && this.lockUntil < Date.now()) {//已经过了用户冻结的两个小时
                this.update({
                    $set: {
                        loginAttempts: 1
                    },
                    $unset: {
                        lockUntil: 1
                    }
                }, (err) => {
                    if (!err) resolve(true)
                    else reject(err)
                })
            } else {
                let updates = {
                    $inc: {
                        loginAttempts: 1
                    }
                }
                if (this.loginAttempts + 1 >= MAX_LOGIN_ATTEMPTS && !this.isLocked) {
                    updates.$set = {
                        lockUntil: Date.now() + LOCK_TIME
                    }
                }
                this.update(updates, err => {
                    if (!err) return resolve()
                    else reject(err)
                })
            }
        })
    }
}


mongoose.model('User', UserSchema)