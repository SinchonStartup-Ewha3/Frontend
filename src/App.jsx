// 기본 세팅 확인용 임시 화면!!! 나중에 라우팅 구조 짜면서 바꿀게요~.~
const colors = [
  ["main", "bg-main"],
  ["sub", "bg-sub"],
  ["soft", "bg-soft"],
  ["alert", "bg-alert"],
];
const weights = [
  ["Light", "font-light"],
  ["Regular", "font-normal"],
  ["Medium", "font-medium"],
  ["SemiBold", "font-semibold"],
];

const App = () => (
  <div className="min-h-screen flex justify-center">
    <div className="w-full max-w-[390px] bg-white p-5">
      <h1 className="text-xl font-semibold">WEE 세팅 확인</h1>
      <div className="mt-4 space-y-1">
        {weights.map(([n, c]) => (
          <p key={n} className={`text-base ${c}`}>
            프리텐다드 {n} 가나다 ABC 123
          </p>
        ))}
      </div>
      <div className="mt-4 flex gap-2">
        {colors.map(([n, c]) => (
          <div
            key={n}
            className={`${c} w-16 h-16 rounded-lg text-[10px] flex items-end p-1`}
          >
            {n}
          </div>
        ))}
      </div>
    </div>
  </div>
);
export default App;
