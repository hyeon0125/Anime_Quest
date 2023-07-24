// Promise => 비동기를 동기로 만들어주는 객체
// - 서버 작업, Request 요청 등의 비동기 작업이 많은 백엔드는
//   Promise 에 대해서 무조건 익혀두는게 맞음
// - 공식적인 가이드 문서: https://developer.mozilla.org/ko/docs/Web/JavaScript/Reference/Global_Objects/Promise
// - 인터넷에서 떠도는 강의문서: https://springfall.cc/post/7

// 예를 들어 아래 코드는 time 을 입력받고, time 시간만큼 setTimeout 으로 기다린 뒤
// Promise 의 resolve 를 통해 반환하는 함수임
// async / await 랑 같이 사용하면 지정한 시간만큼 기다리게 할 수 있음
//대기 트리거
const sleep = (time) => new Promise((resolve) => {
  setTimeout(() => resolve(), time);
});


//리퀘스트 할수있게해줌
const request = require('request');
// 템플릿 문자열을 ``로 감싸고 (물결표시 버튼), ${} 을 사용함으로써 문자열을 합칠 수 있음
// getApiUrl 상수는 id를 함수 파라미터로 받아서 apiurl 을 순서대로 가져옴
const getApiUrl = (id) => `https://laftel.net/api/items/v2/${id}/`; 

// Promise 를 응용한 Request 를 동기식으로 사용하게 해주는 함수
// 비동기 -> 동기로만 바꾼거로, 별다른 변경사항은 없음
const httpRequest = (url) => new Promise((resolve, reject) => {
  request(url, (err, _response, body) => {
    if (err) {
      return reject(err);
    }
    resolve(body);
  });
});


// 파일을 접근하고, 저장하기 위해 Node.js 가 제공하는 기본모듈
// 별다른 NPM Package 설치 없이 사용 가능
const fs = require('fs');
const path = require('path');

// OS 마다 path 경로가 달라 path 모듈로 현재 경로의 result.json 을 등록해둠
const saveDataPath = path.resolve('result.json');

// Array 형을 입력받아 saveDataPath 경로의 배열에 이어서 추가해 주는 함수
const saveData = (dataArray) => {
  let result = [];
  let isExist = fs.existsSync(saveDataPath); // 파일이 있는지 확인하고
  if (isExist) {
    result = JSON.parse(fs.readFileSync(saveDataPath)); // 있으면 불러옴
  }


  // 배열에 파라메터로 받은 데이터를 넣고
  dataArray.forEach(item => {
    result.push(item);
  });

  // 배열을 그대로 saveDataPath 에 덮어씀
  fs.writeFileSync(saveDataPath, JSON.stringify(result));
};



// Node.js 에서 사용자에게 입력을 받기 위한 CLI 모듈
// 얘도 기본 제공이라 별다른 설치 X
const readline = require("readline");
const r1 = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// question 이라는 이벤트를 걸어 사용 
// (readline 모듈이 사용자 입력이 발생하면 자동으로 입력받은 함수를 호출해줌)
r1.question('', (input) => {
  stealLaftelData(input);
  r1.close();
});
console.log("시작할 ID 를 입력해 주세요.");



// 더 이상 데이터가 없다고 판단할 임계값, 마지막으로 확인한 id 에서 CHECK_TERM 만큼을 추가 검사하고 없으면 종료함
const CHECK_TERM = 10000; 

// 라프텔 강도 함수
async function stealLaftelData(startId) {
  let result = []; // 결과를 받을 배열
  let i = parseInt(startId), // 시작 id
    lastCheckId = parseInt(startId) - 1; // 마지막 확인 id
  for(; lastCheckId + CHECK_TERM >= i ; i++) {
    let apiURL = getApiUrl(i);
    let body = await httpRequest(apiURL);
    let jsonObj = JSON.parse(body);
    
    if (jsonObj.id && jsonObj.name) { // id, name 이 존재하면 작품이 있는 것
      result.push({ id: jsonObj.id, name: jsonObj.name });
      lastCheckId = i;
      console.log(`${i} : ${jsonObj.name}`);
    } else {
      console.log(`${i} : FAIL`);
    }

    await sleep(100); // API 과부하 방지로 0.1초를 기다림
  }
  saveData(result); // JSON으로 로컬에 저장함
  console.log(`마지막으로 확인한 id로부터 ${CHECK_TERM}이 지나도록 작품을 확인하지 못했습니다.`);
  console.log(`마지막으로 확인한 id 는 [${lastCheckId}] 입니다.`);
  console.log(`최종 순회 id는 [${i}]입니다.`);
}
