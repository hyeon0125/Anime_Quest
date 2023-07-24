const sleep = async (time) => {

  // await를 안썼음
  let promise = new Promise((resolve) => { //슬립 상수선언 거기다가 어싱크(타임을 인수로 받음) 함수를 생성 실행할 내용은 리졸브 받기 약속 프로미스는 객체임
    setTimeout(() => {
      resolve(1 + 1); //리졸브 실행
    }, time); //위에서 선언한 타임값만큼 대기 ms
  });

  // 바로 넘어감

  console.log(promise) // 이걸 실행할 시점엔 Promise (1초가 아직 안지남)

  console.log(await promise) // await 를 해서 1초가 기다렸음 => 2 나옴

  return promise; // 완료되지 않은 Promise
}


const func = async () => { // 
  console.log(1);
  
  // 비동기
  let data = await sleep(1000); // 1초 대기
  console.log(data); // 2
  console.log(await data); // 2
  
  console.log(2);
}

func();