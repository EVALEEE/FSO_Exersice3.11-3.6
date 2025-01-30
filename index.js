require('dotenv').config()

const express = require('express')
const app = express()
// cors 中间件 使用 Node's cors 中间件来允许来自其他原点的请求
const cors = require('cors')

const Person = require('./models/person.js')

app.use(cors())
app.use(express.json())


//引用Morgan中间件
var morgan = require('morgan')
morgan.token('details', function getDetails(req) {
    if (req.method === 'POST' || req.method === 'PUT') {
        return JSON.stringify({ name: req.body.name, number: req.body.number })
    }
    return ''
})

app.use(morgan(':method :url :status - :response-time ms - :details'))

// // 让我们来实现我们自己的中间件，它可以打印出发送到服务器的每个请求的信息。
// // 中间件是一个接收三个参数的函数。
// const requestLogger = (request, response, next) => {
//     console.log('Method:', request.method)
//     console.log('Path:  ', request.path)
//     console.log('Body:  ', request.body)
//     console.log('---')
//     //在函数体的最后，调用作为参数传递的 next 函数。
//     //这个 next 函数将控制权交给下一个中间件。
//     next()
// }
// app.use(requestLogger)

// 实现一个 Node 应用，
// 3.1 从地址 http://localhost:3001/api/persons 返回一个硬编码的电话簿条目列表。

// let phonebook = [
//     {
//         "id": 1,
//         "name": "Arto Hellas",
//         "number": "040-123456"
//     },
//     {
//         "id": 2,
//         "name": "Ada Lovelace",
//         "number": "39-44-5323523"
//     },
//     {
//         "id": 3,
//         "name": "Dan Abramov",
//         "number": "12-43-234345"
//     },
//     {
//         "id": 4,
//         "name": "Mary Poppendieck",
//         "number": "39-23-6423122"
//     }
// ]

app.get('/', (req, res) => {
    res.send('<h1>Hello World!</h1>')
})



app.get('/api/persons', (req, res) => {
    // Disable caching
    res.set('Cache-Control', 'no-store')

    Person.find({})
        .then(persons => {
            console.log('Found persons:', persons) // Debug log
            if (!persons) {
                return res.status(404).json({ error: 'no entries found' })
            }
            res.status(200).json(persons)
        })
        .catch(error => {
            console.error('Error retrieving persons:', error)
            res.status(500).json({ error: 'server error' })
        })
})


// 3.2 在地址 http://localhost:3001/info 上实现一个页面, 
// 该页面必须显示收到请求的时间和处理请求时电话簿中的条目数量。
app.get('/info', (req, res) => {
    Person.countDocuments({})
        .then(count => {
            const info = `
            <p>Phonebook has info for ${count} people</p>
            <p>${new Date().toString()}</p>
        `
            res.send(info)
        })
        .catch(error => {
            console.log(error)
            res.status(500).end()
        })
})


// 3.3 实现显示单个电话簿条目信息的功能。获取一个 ID 为 5 的人的数据的网址应该是 http://localhost:3001/api/persons/5
// 如果没有找到给定 ID 的条目，服务器必须以适当的状态码进行响应。
app.get('/api/persons/:id', (req, res) => {
    Person.findById(req.params.id).then(person => {
        res.json(person)
    })
        .catch(error => {
            console.log(error)
            res.status(404).end()
        })
})


// 3.4 实现功能，使其有可能通过向电话簿条目的唯一 URL 发出 HTTP DELETE 请求来删除单个电话簿条目。
app.delete('/api/persons/:id', (req, res) => {
    Person.findByIdAndDelete(req.params.id)
        .then(result => {
            res.status(204).end()
        })
        .catch(error => {
            console.log(error)
            res.status(404).end()
        })
})


// 3.5 使新的电话簿条目可以通过 HTTP POST 
// 请求添加到地址 http://localhost:3001/api/persons。
app.post('/api/persons', (req, res) => {
    console.log('Received POST request to /api/persons')
    console.log('Request body:', req.body)

    const body = req.body

    //名称或数字缺失  请求不允许成功
    if (!body.name || !body.number) {
        return res.status(400).json({ error: 'name or number missing' })
    }

    //3.6 名字已经存在于电话簿中  请求不允许成功
    // ？


    const person = new Person({
        name: body.name,
        number: body.number
    })

    console.log('Saving new person:', person)

    person.save()
        .then(savedPerson => {
            res.json(savedPerson)
        })
        .catch(error => {
            console.error(error)
            res.status(500).json({ error: 'Error saving person' })

        })
})


// 让我们在路由之后添加以下中间件，用于捕捉向不存在的路由发出的请求。
// 对于这些请求，中间件将返回一个 JSON 格式的错误信息。
const unknownEndpoint = (request, response) => {
    response.status(404).send({ error: 'unknown endpoint' })
}

app.use(unknownEndpoint)


const PORT = process.env.PORT
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})