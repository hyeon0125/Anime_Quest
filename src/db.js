const mysql = require('mysql2/promise')
const config = {
  // 민감한 DB 정보는 env 파일에 저장 (.env 는 Git 등에 안올라가도록 설정, *gitignore*)
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
}
const pool = mysql.createPool(config);
module.exports = pool;