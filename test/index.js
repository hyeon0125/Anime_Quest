/*
- 순서 1~7까지 실행되어 서버가 구동됨

- 순서 5, 6 내에 있는 function 안에 코드는 콜백함수(callback) 라고 해서 
특정한 동작이 이뤄질 때 실행되도록 Express 에서 제공하는 get / post 메서드에 
함수를 넣어준것.

- 순서 5, 6 의 function 안의 코드는 사용자가 HTTP 요청을 보냈을 때
HTTP 메서드가 각 메서드와 일치하면 실행됨
*/

// 순서 1
const express = require('express');
// 순서 2
const app = express();

// 순서 3
const users = []

// 순서 4
app.use(express.json());

// 순서 5
app.get('/user', function (req,res){

    return res.send({users : users});
    
})

// 순서 6
app.post('/user', function (req,res){
    // 이 라인 시점에서 Express 가 이미 req 라는 변수 안에 요청데이터를 넣어준 상태임
    console.log(req.body);  // 따라서 얘가 먼저 호출되도 req 내에 데이터가 존재함
    users.push({name:req.body.name, age:req.body.age, tall:req.body.tall})
    return res.send({success:true});
    
})

// 순서 7
app.listen(4000, function () {
    console.log('server listening on port 4000');
})

