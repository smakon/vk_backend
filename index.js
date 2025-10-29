const express = require('express')
const app = express()
const cors = require('cors')
const path = require('path')
const sqlite3 = require('sqlite3').verbose()

const db = new sqlite3.Database(path.join(__dirname, 'Database', 'vkusnie_raki.db'), err => {
  if (err) console.error('Ошибка при подключении к SQLite:', err.message)
  else console.log('Connected to SQLite database')
})

app.use(cors())

app.use(express.static(path.join(__dirname, 'dist')))

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'))
})

app.get('/categories', (req, res) => {
  db.all('SELECT * FROM category', [], (err, rows) => {
    if (err) return res.status(500).send(err.message)
    res.json(rows)
  })
})

app.get('/products', (req, res) => {
  db.all('SELECT * FROM products', [], (err, rows) => {
    if (err) return res.status(500).send(err.message)
    res.json(rows)
  })
})

app.get('/reviews', (req, res) => {
  db.all('SELECT * FROM reviews', [], (err, rows) => {
    if (err) return res.status(500).send(err.message)
    res.json(rows)
  })
})

const PORT = 8080 // 8080
const HOST = '0.0.0.0' // 0.0.0.0

app.listen(PORT, HOST, () => {
	console.log(`Server listening on http://${HOST}:${PORT}`)
})
