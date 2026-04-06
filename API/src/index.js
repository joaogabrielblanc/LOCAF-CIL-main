import express from 'express'
import path from 'path'
import { fileURLToPath } from 'url'
import { authRouter } from './routes/auth.routes.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname  = path.dirname(__filename)

const port = 3000
const host = 'localhost'
const app  = express()

app.use(express.json())

// Serve os arquivos do site (pasta interface na raiz do projeto)
app.use(express.static(path.join(__dirname, '..', 'interface')))

// Rotas da API
app.use('/api', authRouter)

app.listen(port, host, () => {
  console.log(`✅ Servidor rodando em http://${host}:${port}`)
})