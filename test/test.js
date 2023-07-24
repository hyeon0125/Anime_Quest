/*
console.log 에 적힌 순서대로 콘솔이 실행됨

setTimeout 은 일정 시간 뒤에 함수를 실행시키는 함수임
setTimeout(콜백함수, 지연시간_밀리초)

test 함수 안에 있는 콘솔은 함수를 선언만 하고 실행시킨게 아니라서 아무것도 안찍힘
=> Express 내에 있는 효과처리 함수들도 이렇게 선언을 하고
=> post 메서드에 파라메터 값으로 던져만 둔 것임.
=> 따라서 Express 가 실행시켜주지 않으면 실행되지 않음

*/

console.log(1);

function test () {
  console.log('실행안됨');
}

setTimeout(function() {
  console.log(3);
}, 0);

setTimeout(function() {
  console.log(4);
}, 1000);

(function test2 () {
  console.log('2');
})();

