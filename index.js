require('dotenv').config()

const express = require('express')
// cors 中间件 使用 Node's cors 中间件来允许来自其他原点的请求
const cors = require('cors')
const app = express()


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
    Person.findById(req.params.id)
        .then(person => {
            if (person) {
                res.json(person)
            } else {//person为null
                //如果id不存在，返回404
                res.status(404).end()
            }
        })
        .catch(error => {//处理findById方法返回的promise被拒绝的情况
            console.log(error)
            //400 (Bad Request) 状态码表示服务器不能或不会处理请求，因为有些东西被认为是客户端错误（
            // 例如，请求语法格式错误，请求消息帧格式无效，或请求路由欺骗）。
            res.status(404).send({ error: 'malformatted id' })
        })
})


// 3.4 实现功能，使其有可能通过向电话簿条目的唯一 URL 发出 HTTP DELETE 请求来删除单个电话簿条目。
// 3.15
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



//3.17 如果用户试图为电话簿中已有姓名的人创建新的电话簿条目，
//前端将尝试通过向条目的唯一URL发送HTTP PUT请求来更新现有条目的电话号码。
app.put('/api/persons/:id', (request, response, next) => {
    const body = request.body

    const person = {
        name: body.name,
        number: body.number,
    }

    Person.findByIdAndUpdate(
        request.params.id,
        person,
        { new: true, runValidators: true, context: 'query' }
    )
        .then(updatedPerson => {
            if (updatedPerson) {
                response.json(updatedPerson)
            } else {
                response.status(404).end()
            }
        })
        .catch(error => next(error))
})



// 让我们在路由之后添加以下中间件，用于捕捉向不存在的路由发出的请求。
// 对于这些请求，中间件将返回一个 JSON 格式的错误信息。
const unknownEndpoint = (request, response) => {
    response.status(404).send({ error: 'unknown endpoint' })
}

app.use(unknownEndpoint)


// error handler middleware
const errorHandler = (error, request, response, next) => {
    console.error(error.message)

    if (error.name === 'CastError') {
        return response.status(400).send({ error: 'update failed' })
    }

    next(error)
}

// this has to be the last loaded middleware, also all the routes should be registered before this!
app.use(errorHandler)


// ...existing code...

const PORT = process.env.PORT || 3000; // 使用环境变量或默认 3000
const HOST = '0.0.0.0'

app.listen(PORT, HOST, () => {
    console.log(`Server is running at http://${HOST}:${PORT}`)
})