import sqlite3pkg from 'sqlite3'
import path from 'path'
import { fileURLToPath } from 'url'

const sqlite3    = sqlite3pkg.verbose()
const __filename = fileURLToPath(import.meta.url)
const __dirname  = path.dirname(__filename)

const db = new sqlite3.Database(path.join(__dirname, '..', '..', 'usuarios.db'))

db.run(`
  CREATE TABLE IF NOT EXISTS usuarios (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    nome       TEXT NOT NULL,
    apelido    TEXT,
    email      TEXT NOT NULL UNIQUE,
    senha      TEXT NOT NULL,
    cpf_cnpj   TEXT,
    nascimento TEXT,
    tipo       TEXT DEFAULT 'fisica',
    criado_em  TEXT NOT NULL DEFAULT (datetime('now', 'localtime'))
  )
`)

db.get_async = (sql, params) => new Promise((res, rej) =>
  db.get(sql, params, (err, row) => err ? rej(err) : res(row))
)

db.run_async = (sql, params) => new Promise((res, rej) =>
  db.run(sql, params, function(err) { err ? rej(err) : res(this) })
)

export default db