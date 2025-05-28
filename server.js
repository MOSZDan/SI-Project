import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import sendEmailHandler from './api/send-email.js'

const app = express()

app.use(cors({ origin: 'http://localhost:5173' }))  // o '*' para pruebas
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.post('/api/send-email', sendEmailHandler)

const PORT = 4000
app.listen(PORT, () => {
  console.log(`✅  API escuchando en http://localhost:${PORT}/api/send-email`)
})
