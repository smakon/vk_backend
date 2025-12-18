const express = require('express')
const app = express()
const cors = require('cors')
const path = require('path')
const sqlite3 = require('sqlite3').verbose()

const db = new sqlite3.Database(
	path.join(__dirname, 'Database', 'vkusnie_raki.db'),
	err => {
		if (err) console.error('Ошибка при подключении к SQLite:', err.message)
		else console.log('Connected to SQLite database')
	}
)

app.use(cors())

app.use(express.static(path.join(__dirname, 'dist')))
app.use(express.json({ limit: '10mb' })); // парсит JSON
app.use(express.urlencoded({ extended: true })); // для form data (опционально)

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

app.post('/productUpdate', (req, res) => {
	if (!req.body) {
		return res.status(400).json({ error: 'Тело запроса отсутствует' })
	}
	const { price, isThere, description, title, id } = req.body
	if (typeof id === 'undefined') {
		return res.status(400).json({ error: 'Не указан id продукта' })
	}

	db.run(
		'UPDATE products SET price = ?, isThere = ?, description = ?, title = ? WHERE id = ?',
		[price, isThere, description, title, id],
		err => {
			if (err) return res.status(500).send(err.message)
			res.json({ message: 'Product updated successfully' })
		}
	)
})

const PORT = 8080 // 8080
const HOST = '0.0.0.0' // 0.0.0.0

app.listen(PORT, HOST, () => {
	console.log(`Server listening on http://${HOST}:${PORT}`)
})
