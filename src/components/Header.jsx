import { useNavigate } from "react-router-dom";
import backIcon from "../assets/icons/back.svg";

// 혹시 몰라서 남겨두는 사용법
//<Header />
// 아무것도 없는 헤더. 높이만 차지해서 상단 여백을 맞출 때 (커뮤니티)
//<Header back />
// 뒤로가기 화살표만 (퍼널식 화면)
//<Header back onLeft={() => setStep(step - 1)} />
// 화살표를 눌렀을 때 이전 주소 대신 원하는 동작 실행 (퍼널 이전 단계)
//<Header left="취소" right="등록" onLeft={goBack} onRight={submit} rightDisabled={!text.trim()} />
// 글 작성처럼 양쪽 텍스트 (등록은 활성일 때 검은색, 비활성일 때 하늘색)

const Header = ({
  back = false,
  left,
  right,
  onLeft,
  onRight,
  rightDisabled = false,
}) => {
  const navigate = useNavigate();
  const handleLeft = onLeft ?? (() => navigate(-1));

  let leftNode = null;
  if (left) {
    leftNode = (
      <button
        type="button"
        onClick={handleLeft}
        className="text-[#D2D2D1] font-sans text-base font-semibold leading-normal tracking-[-0.03rem]"
      >
        {left}
      </button>
    );
  } else if (back) {
    leftNode = (
      <button
        type="button"
        aria-label="뒤로 가기"
        onClick={handleLeft}
        className="w-8 h-8 flex items-center"
      >
        <img src={backIcon} alt="" className="w-7.75 h-7.75" />
      </button>
    );
  }

  return (
    <header className="flex items-center justify-between w-full h-8">
      {leftNode}
      {right && (
        <button
          type="button"
          disabled={rightDisabled}
          onClick={onRight}
          className={`ml-auto text-base font-sans font-semibold leading-normal tracking-[-0.03rem] ${rightDisabled ? "text-main" : "text-[#62605F]"}`}
        >
          {right}
        </button>
      )}
    </header>
  );
};

export default Header;
