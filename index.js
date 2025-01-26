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


// 在地址 http://localhost:3001/info 上实现一个页面, 
// 该页面必须显示收到请求的时间和处理请求时电话簿中的条目数量。
app.get('/info', (req, res) => {
    const info = `
    <p>Phonebook has info for ${phonebook.length} people</p>
    <p>${new Date()}</p>
    `
    res.send(info)
})


const PORT = 3001
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})