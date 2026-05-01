const express = require('express')
const app = express()
const cors = require('cors')
const path = require('path')
const sqlite3 = require('sqlite3').verbose()
const nodemailer = require('nodemailer')

// Настройка nodemailer для Mail.ru
const transporter = nodemailer.createTransport({
	host: 'smtp.mail.ru',
	port: 465,
	secure: true,
	auth: {
		user: 's-samik@inbox.ru',
		pass: 'wLOuqVl4kDHzcoszZVga',
	},
})

const db = new sqlite3.Database(
	path.join(__dirname, 'Database', 'vkusnie_raki.db'),
	err => {
		if (err) console.error('Ошибка при подключении к SQLite:', err.message)
		else console.log('Connected to SQLite database')
	},
)

app.use(cors())

app.use(express.static(path.join(__dirname, 'dist')))
app.use(express.json({ limit: '10mb' })) // парсит JSON
app.use(express.urlencoded({ extended: true })) // для form data (опционально)

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
		},
	)
})

// Endpoint для отправки email на несколько адресов
app.post('/send-email', async (req, res) => {
	const { message } = req.body
	if (!message) {
		return res.status(400).json({ error: 'Сообщение не указано' })
	}

	// Список email адресов для отправки
	const emailRecipients = [
		's-samik@inbox.ru',
		'mnavoyan@yandex.ru',
		'freetime34@inbox.ru',
	]

	const results = []
	
	// Отправляем письмо каждому получателю с ожиданием результата
	for (const toEmail of emailRecipients) {
		const mailOptions = {
			from: 's-samik@inbox.ru',
			to: toEmail,
			subject: 'Новый заказ с сайта Вкусные раки',
			text: message,
		}

		try {
			const info = await transporter.sendMail(mailOptions)
			console.log(`Email отправлен на ${toEmail}:`, info.response)
			results.push({ email: toEmail, success: true, info: info.response })
		} catch (err) {
			console.error(`Ошибка отправки email на ${toEmail}:`, err.message)
			results.push({ email: toEmail, success: false, error: err.message })
		}
	}

	// Проверяем есть ли хоть какие-то успешные отправки
	const successfulSends = results.filter(r => r.success)
	if (successfulSends.length > 0) {
		res.json({ message: 'Email отправлен', results })
	} else {
		res.status(500).json({ error: 'Не удалось отправить никому', results })
	}
})

const PORT = 8080 // 8080
const HOST = '0.0.0.0' // 0.0.0.0

app.listen(PORT, HOST, () => {
	console.log(`Server listening on http://${HOST}:${PORT}`)
})
