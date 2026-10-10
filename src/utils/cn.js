// className 문자열을 조건부로 합치는 헬퍼 유틸 @.@ (falsy 값은 버림)
const cn = (...classes) => classes.filter(Boolean).join(" ");

export default cn;
