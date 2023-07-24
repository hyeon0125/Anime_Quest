/*
  Request
  req.query
  req.body
  req.headers
  req.headers['x-forwarded-for']
  Response
  res.json({  
  })
*/

// API의 핵심 로직들이 담겨있음
// exports.함수명 = () => {} 으로 계속해서 API를 복사
// req, res 파라메터로 적절하게 데이터를 가져오고 반환

// 이미지를 가져오는 API
// req : Request, res : Response
exports.getImages = async (req, res) => {
  
  const length = parseInt(req.query.length || 100); // 쿼리스트링에서 데이터를 가져옴
  const conn = await db.getConnection();
  // 배열을 다음과 같이 받아 선언할 수 있음
  // ex: let [one, two] = [1,2,3,4,5];  << 여기선 one 변수에 1이, two 변수엔 2가 들어감
  const [[countRow]] = await await conn.query('SELECT COUNT(*) cnt FROM AnimeDB_Final2_Deduped');
  const count = countRow?.cnt;

  // 랜덤으로 시작하는 idx ~ 랜덤으로 시작하는 idx + length
  const startIdx = parseInt(Math.random() * (count - length));

  const [rows] = await conn.query(
    `SELECT IMG FROM AnimeDB_Final2_Deduped A WHERE IMG NOT LIKE ? LIMIT ? OFFSET ?`, 
    ['%no_image%', length, startIdx],
  );

  res.json({ images: rows.map(row => row.IMG).sort(() => Math.random() - 0.5) });
}

// 게임시작 API
exports.start = async (req, res) => {
  const conn = await db.getConnection();
  try {
    const { quiz_type } = req.body;
    const { ip } = req; // IP 추출

    const [result] = await conn.query(
      'INSERT INTO GAMELOG (IP, QUIZ_TYPE, START_TIME) VALUES (?, ?, NOW())',
      [ip, quiz_type]
    );

    res.json({ id: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '게임시작 오류' });
  } finally {
    if (conn) conn.release();
  }
};

//퀴즈문제 API
exports.quiz = async (req, res) => {
  const conn = await db.getConnection();
  try {
    const { game_id } = req.query;
    
    // 랜덤하게 애니메이션을 선택
    const [anime] = await conn.query('SELECT * FROM AnimeDB_Final2_Deduped WHERE TAG IS NOT NULL AND TAG != "" ORDER BY RAND() LIMIT 1');
    const anime_id = anime[0].ID;
    const imageUrl = anime[0].IMG;

    // 문제를 생성
    const answer = anime[0].NAME;
    const answerScheme = answer.replace(/\S/g, '○'); // Only replace non-whitespace characters with ○

    // 퀴즈 로그에 생성한 데이터 삽입
    const [result] = await conn.query(
      'INSERT INTO QUIZLOG (GAMELOG_ID, ANIME_ID, ANSWER, START_TIME) VALUES (?, ?, ?, NOW())',
      [game_id, anime_id, answer]
    );

    // 생성된 문제에 대한 정보를 반환
    res.json({
      id: result.insertId,
      answerScheme: answerScheme,
      imageUrl: imageUrl,
      tags: anime[0].TAG // 랭킹 모드일 때만 태그를 반환해야 합니다.
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '문제생성 오류' });
  }
};

exports.hint = async (req, res) => {
  const conn = await db.getConnection();
  try {
    console.log(req.body, req.query);
    const { quiz_id } = req.body;

    // Check if quiz_id is empty
    if (!quiz_id) {
      return res.status(400).json({ error: 'quiz_id가 제공되지 않았습니다' });
    }

    // 퀴즈 로그에서 해당 퀴즈를 가져옴
    const [quizRows] = await conn.query('SELECT * FROM QUIZLOG WHERE ID = ?', [quiz_id]);
    const quiz = quizRows[0];
    console.log(quiz);

    const HINTCOST = quiz ? quiz.HINTCOST : 0;
    const ANIME_ID = quiz ? quiz.ANIME_ID : 0;

    // 이미 모든 힌트를 사용한 경우, 뒤로
    if (HINTCOST >= 3) {
      return res.json({ hint_count: HINTCOST, hint1: quiz.hint1, hint2: quiz.hint2, hint3: quiz.hint3 });
    }

    // 힌트를 사용하고, 사용한 힌트의 수를 증가
    const [result] = await conn.query('UPDATE QUIZLOG SET HINTCOST = HINTCOST + 1 WHERE ID = ?', [quiz_id]);

    let hint1 = null, hint2 = null, hint3 = null;
    console.log(HINTCOST);
    if (HINTCOST >= 0) {
      // 출시 분기를 힌트로 제공
      const [[anime]] = await conn.query('SELECT QUARTER FROM AnimeDB_Final2_Deduped WHERE ID = ?', [ANIME_ID]);
      hint1 = anime.QUARTER;
    }
    if (HINTCOST >= 1) {
      // 애니 설명의 앞 30자를 힌트로 제공
      const [[anime]] = await conn.query('SELECT SUMMARY FROM AnimeDB_Final2_Deduped WHERE ID = ?', [ANIME_ID]);
      hint2 = anime.SUMMARY.slice(0, 30);
    }
    if (HINTCOST >= 2) {
      // 이미지 URL을 힌트로 제공
      const [[anime]] = await conn.query('SELECT IMG FROM AnimeDB_Final2_Deduped WHERE ID = ?', [ANIME_ID]);
      hint3 = anime.IMG;
    }

    // 힌트를 반환
    res.json({
      hint_count: HINTCOST + 1,
      hint1: hint1,
      hint2: hint2,
      hint3: hint3
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '힌트생성 에러' });
  }
};

//퀴즈 응답
exports.answer = async (req, res) => {
  const conn = await db.getConnection();
  try {
    const { quiz_id, answer } = req.body;

    const [quizRows] = await conn.query(
      'SELECT * FROM QUIZLOG WHERE ID = ?', [quiz_id]
    );

    if (quizRows.length === 0) {
      return res.status(400).json({ error: '알수없는 퀴즈 ID' });
    }

    const quiz = quizRows[0];
    const { ANIME_ID } = quiz;

    const [animeRows] = await conn.query(
      'SELECT NAME FROM AnimeDB_Final2_Deduped WHERE ID = ?', [ANIME_ID]
    );

    const anime = animeRows[0];
    const correctAnswer = anime.NAME;
    const Correct = correctAnswer === answer;

    await conn.query(
      'UPDATE QUIZLOG SET CORRECT = ?, ANSWER = ?, END_TIME = NOW() WHERE ID = ?',
      [Correct, answer, quiz_id]
    );

    res.json({ Correct, correctAnswer });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '퀴즈 대답 제출 오류' });
  }
};

exports.end = async (req, res) => {
  const conn = await db.getConnection();
  try {
    const { game_id, nickname } = req.body;

    const [gameRows] = await conn.query(
      'SELECT * FROM GAMELOG WHERE ID = ?', [game_id]
    );

    if (gameRows.length === 0) {
      return res.status(400).json({ error: '알수없는 게임 ID' });
    }

    const game = gameRows[0];
    const { START_TIME, QUIZ_TYPE } = game;

    await conn.query(
      'UPDATE GAMELOG SET END_TIME = NOW(), NAME = ? WHERE ID = ?',
      [nickname, game_id]
    );

    const [updatedGameRows] = await conn.query(
      'SELECT * FROM GAMELOG WHERE ID = ?', [game_id]
    );

    const updatedGame = updatedGameRows[0];
    const { END_TIME } = updatedGame;

    const clearTime = Math.abs(new Date(END_TIME) - new Date(START_TIME)) / 1000;

    const [quizRows] = await conn.query(
      'SELECT COUNT(*) AS totalCount, SUM(IF(CORRECT = 1, 1, 0)) AS correctCount FROM QUIZLOG WHERE GAMELOG_ID = ?', [game_id]
    );
    const { totalCount, correctCount } = quizRows[0];

    let resultTitle, resultText, resultType;
    if (QUIZ_TYPE === 'normal') {
      resultTitle = '축하합니다!';
      resultText = `${nickname}, 님은 이제 랭크게임에 진입하실 수 있어요!`;
      resultType = 0;
    } else { // 'ranking' game
      const rankPercentile = 0; // percentile calculation needs to be added
      resultTitle = '놀랍네요';
      resultText = `${nickname}, 당신은 상위 ${rankPercentile}% 의 애니지식을 지녔어요!`;
      if (correctCount / totalCount >= 0.8) {
        resultType = 3;
      } else if (correctCount / totalCount >= 0.5) {
        resultType = 2;
      } else if (correctCount / totalCount >= 0.2) {
        resultType = 1;
      } else {
        resultType = 0;
      }
    }

    res.json({ clearTime, resultTitle, resultText, resultType, totalCount, correctCount });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '게임종료중 문제 발생' });
  }
};

exports.users = async (req, res) => {
  const conn = await db.getConnection();
  try {
    // 게임 로그 테이블에서 중복된 IP를 제거한 행의 개수를 가져오기
    const [rows] = await conn.query('SELECT COUNT(DISTINCT IP) AS totalCount FROM GAMELOG');
    const totalCount = rows[0].totalCount;
    
    // 전체 사용자 수 반환
    res.json({
      totalCount: totalCount
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '사용자 수 조회 오류' });
  }
};