const SIZES = {
  md: {
    //알림 상세페이지
    track: "w-[3.5rem] h-8",
    knob: "w-[1.5rem] h-[1.5rem]",
    move: "translate-x-[1.63rem]",
  },
  sm: {
    // 마이페이지
    track: "w-[2.278rem] h-[1.474rem]",
    knob: "w-[1.2rem] h-[1.2rem]",
    move: "translate-x-[0.81rem]",
  },
};
// 알림 on/off 용 토글 버튼입니다!!!

const Toggle = ({ on, onChange, size = "md" }) => {
  const s = SIZES[size];
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      onClick={onChange}
      className={`${s.track} shrink-0 rounded-full border-[0.8px] p-[0.134rem] transition-colors ${
        on ? "bg-[#353331] border-[#353331]" : "bg-white border-[#D2D2D1]"
      }`}
    >
      <span
        className={`block ${s.knob} rounded-full transition-transform ${
          on ? `${s.move} bg-white` : "bg-[#D2D2D1]"
        }`}
      />
    </button>
  );
};

export default Toggle;
