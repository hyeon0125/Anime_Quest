require('dotenv').config(); // .env 를 사용할 수 있게 하는 라이브러리
// ※ .env :: 각 실행환경마다 다른 변수를 갖게 해주는 환경변수 파일

global.db = require('./db');

const express = require('express'); 
const app = express(); // Express Server 객체

const cors = require('cors');
app.use(cors());
app.use(express.json());
app.use(express.urlencoded());

const routes = require('./routes');
app.use(routes); // 미들웨어, 라우트, 라이브러리 등을 use 메서드로 등록 가능

app.listen(process.env.PORT, () => {
  console.log(`${process.env.PORT} 포트에서 서버를 실행함`);
});