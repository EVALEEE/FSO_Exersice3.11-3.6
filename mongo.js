const mongoose = require('mongoose');

if (process.argv.length < 3) {
    console.log('give password as argument')
    process.exit(1)
} else if (process.argv.length === 4) {
    console.log('give name and number as arguments')
    process.exit(1)
}

const password = process.argv[2]
const name = process.argv[3]
const number = process.argv[4]
const url = `mongodb+srv://fullstackopen:${password}@cluster0.biysl.mongodb.net/phoneBookApp?retryWrites=true&w=majority&appName=Cluster0`

mongoose.set('strictQuery', false)

mongoose.connect(url)

const phonebookSchema = new mongoose.Schema({
    name: String,
    number: String
})

const Phonebook = mongoose.model('Phonebook', phonebookSchema)

const pb = new Phonebook({
    "name": name,
    "number": number
})

if (process.argv.length === 3) {
    Phonebook.find({}).then(result => {
        console.log('phonebook:')
        result.forEach(Phonebook => {
            console.log(`${Phonebook.name} ${Phonebook.number}`)
        })
        mongoose.connection.close()
    })
} else if (process.argv.length === 5) {
    pb.save().then(result => {
        console.log('pb saved!')
        mongoose.connection.close()
    })
}

