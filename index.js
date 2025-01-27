const express = require('express')
const app = express()

app.use(express.json())//一个中间件


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

let phonebook = [
    {
        "id": 1,
        "name": "Arto Hellas",
        "number": "040-123456"
    },
    {
        "id": 2,
        "name": "Ada Lovelace",
        "number": "39-44-5323523"
    },
    {
        "id": 3,
        "name": "Dan Abramov",
        "number": "12-43-234345"
    },
    {
        "id": 4,
        "name": "Mary Poppendieck",
        "number": "39-23-6423122"
    }
]


app.get('/api/persons', (req, res) => {
    res.json(phonebook)
})


// 3.2 在地址 http://localhost:3001/info 上实现一个页面, 
// 该页面必须显示收到请求的时间和处理请求时电话簿中的条目数量。
app.get('/info', (req, res) => {
    const info = `
    <p>Phonebook has info for ${phonebook.length} people</p>
    <p>${new Date()}</p>
    `
    res.send(info)
})


// 3.3 实现显示单个电话簿条目信息的功能。获取一个 ID 为 5 的人的数据的网址应该是 http://localhost:3001/api/persons/5
// 如果没有找到给定 ID 的条目，服务器必须以适当的状态码进行响应。
app.get('/api/persons/:id', (req, res) => {
    const id = Number(req.params.id)
    const person = phonebook.find(p => p.id === id)

    if (person) {
        res.json(person)
    } else {
        res.status(404).end()
    }
})


// 3.4 实现功能，使其有可能通过向电话簿条目的唯一 URL 发出 HTTP DELETE 请求来删除单个电话簿条目。
// 测试你的功能是否能与 Postman 或 Visual Studio Code REST 客户端一起工作。
app.delete('/api/persons/:id', (req, res) => {
    const id = Number(req.params.id)
    const personIndex = phonebook.findIndex(p => p.id === id)

    if (personIndex !== -1) {
        phonebook = phonebook.filter(p => p.id !== id)
        res.status(204).end()
    } else {
        res.status(404).end()
    }
})


// 3.5 扩展后端，使新的电话簿条目可以通过 HTTP POST 请求添加到地址 http://localhost:3001/api/persons。
// 用 Math.random 函数为电话簿条目生成一个新的 ID。
// 为你的随机值使用一个足够大的范围，这样创建重复 ID 的可能性就很小。

const generateId = () => {
    const gId = Math.floor(Math.random() * 10000)
    return gId
}

app.post('/api/persons', (req, res) => {
    const body = req.body

    //名称或数字缺失  请求不允许成功
    if (!body.name || !body.number) {
        return res.status(400).json({ error: 'name or number missing' })
    }

    //3.6 名字已经存在于电话簿中  请求不允许成功
    if (phonebook.some(p => p.name === body.name)) {
        return res.status(400).json({ error: 'name must be unique' })
    }

    const person = {
        id: generateId(),
        name: body.name,
        number: body.number
    }

    phonebook = phonebook.concat(person)
    res.json(person)
})


// 让我们在路由之后添加以下中间件，用于捕捉向不存在的路由发出的请求。
// 对于这些请求，中间件将返回一个 JSON 格式的错误信息。
const unknownEndpoint = (request, response) => {
    response.status(404).send({ error: 'unknown endpoint' })
}

app.use(unknownEndpoint)


const PORT = 3001
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})