const request = require('request');
const mysql = require('mysql2');
const sleep = (time) => new Promise((resolve) => {
    setTimeout(() => resolve(), time);
  });

const connection = mysql.createConnection({ //db설정
    host: '211.37.148.55',
    user: 'access_client',
    password: 'qwe123QWE!@#',
    database: 'Anime_Quest'
});

const readline = require("readline");
const r1 = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

r1.question('', (input) => {
    stealLaftelData(input);
    r1.close();
});
console.log("시작할 ID 를 입력해 주세요.");

const httpRequest = (url) => new Promise((resolve, reject) => { //httpRequest, URL 을 인수로 입력받는다
  request(url, (err, _response, body) => {
    if (err) {
      return reject(err);
    }
    resolve(body);
  });
});
 
const ApirequestUrl = (id) => `https://laftel.net/api/items/v2/${id}/`;
const CHECK_TERM = 10000;

async function stealLaftelData(startId) {
  let result = []; // 결과 배열
  let i = parseInt(startId), // 시작 id
    lastCheckId = parseInt(startId) - 1; // 마지막 확인 id 시작점이 되어야하기때문에 -1이 된다
  for(; lastCheckId + CHECK_TERM >= i ; i++) { //위에서 입력받은 CHECK TERM 을 사용하여 포문을 사용
    
    let apiURL = ApirequestUrl(i);
    let body = await httpRequest(apiURL);
    let LF = JSON.parse(body);
    if (LF.id && LF.name) { // id, name 이 존재하면 작품이 있는 것

      
      result.push({ id: LF.id, series_id: LF.series_id ,name: LF.name, summary: LF.summary, tag: LF.tag, quarther: LF.quarther, medium: LF.medium, img: LF.img});
      lastCheckId = i;
        
      let id = LF.id;
      let series_id = LF.series_id;
      let name = LF.name;
      let summary = LF.content;
      let tag = '';
      let quarther = LF.air_year_quarter;
      let medium = LF.medium;
      let img = LF.img;
      LF.tags.forEach((item, idx) => {
      tag = tag + item;    //기본적으로 객체 배열이되지만 문자열 배열이기때문에 뒤에 무엇을 가져올지 지정하면 못찾음
      if (idx + 1 < LF.tags.length) {
        tag += ',';
      }
      });
      

      const duplicateCheckQuery = 'SELECT COUNT(*) AS count FROM AnimeDB WHERE ID = ?;';        

      connection.query(duplicateCheckQuery, [id], (err, results) => {
          if (err) throw err;

          const count = results[0].count;
          if (count === 0) {// 중복 데이터가 없으므로 INSERT 실행
            const insertQuery = 'INSERT INTO AnimeDB(ID, SERIES_ID, NAME, SUMMARY, TAG, QUARTER, MEDIUM, IMG) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';
            connection.query(insertQuery, [id, series_id, name, summary, tag, quarther, medium, img], (err, results) => {
              if (err) throw err;
                console.log('Data inserted successfully:', name);
            });
          } else {
            console.log('Skipping duplicate data:', name);
          }
      });

      
    } else {
    console.log(`${i} : FAIL`);
    }
    await sleep(150); // 0.15초 대기
  }

  console.log(`마지막으로 확인한 id로부터 ${CHECK_TERM}이 지나도록 작품을 확인하지 못했습니다.`);
  console.log(`마지막으로 확인한 id 는 [${lastCheckId}] 입니다.`);
  console.log(`최종 순회 id는 [${i}]입니다.`);
}

