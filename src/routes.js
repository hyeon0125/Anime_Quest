// routes.js 에는 라우트 코드들이 모여있음
// Express 는 Router 를 분리할 수 있도록 객체를 제공함
// 이 Router 객체를 app.js 에서 사용함으로써 Express 서버에 등록이 된다

// 간단하게 각 get/post/put/delete 메서드와 각 경로까지만 저장
// 핵심 로직은 controller.js 에 분리
const express = require('express');


const router = express.Router(); // Express 가 제공하는 Router 를 분리할 수 있게 해주는 객체
const controller = require('./controller');

router.get('/anime/images', controller.getImages);
router.post('/anime/game-start', controller.start);
router.post('/anime/game-end', controller.end);
router.get('/anime/quiz', controller.quiz);
router.post('/anime/quiz-hint', controller.hint);
router.post('/anime/quiz-answer', controller.answer);
router.get('/users/count', controller.users);
/*router.get('/anime/game-ranking', controller.ranking);

router.get('/users', controller.rankgame);*/

module.exports = router;