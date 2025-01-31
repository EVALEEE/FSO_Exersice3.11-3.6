const mongoose = require('mongoose')

mongoose.set('strictQuery', false)


const url = process.env.MONGODB_URI


console.log('connecting to', url)

mongoose.connect(url)
    .then(result => {
        console.log('connected to MongoDB')
    })
    .catch(error => {
        console.log('error connecting to MongoDB:', error.message)
    })

const personSchema = new mongoose.Schema({
    name: {
        type: String,
        minLength: 3,
        required: true
    },
    number: {
        type: String,
        minLength: 8,
        validate: {
            validator: function (v) {
                return /^([0-9]\d|[0-9]\d{2})-\d+$/.test(v);
            },
            message: props =>
                `${props.value} is not a valid phone number! Format: XX-XXXXXX or XXX-XXXXXX`
        },
        required: true
    }
})

personSchema.set('toJSON', {
    transform: (document, returnedObject) => {
        returnedObject.id = returnedObject._id.toString()
        delete returnedObject._id
        delete returnedObject.__v
    }
})


module.exports = mongoose.model('PhoneBook', personSchema)
//数据库上的集合名字为phonebooks，就要写成PhoneBook，不然的话就新建一个集合！