const express = require('express')
const app = express()

// 实现一个 Node 应用，
// 3.1 从地址 http://localhost:3001/api/persons 返回一个硬编码的电话簿条目列表。

const phonebook = [
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


// 实现显示单个电话簿条目信息的功能。获取一个 ID 为 5 的人的数据的网址应该是 http://localhost:3001/api/persons/5
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


const PORT = 3001
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})