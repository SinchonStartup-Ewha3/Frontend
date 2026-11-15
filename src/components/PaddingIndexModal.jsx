import Modal from "./Modal";
import padding1 from "../assets/images/padding1.svg";
import padding2 from "../assets/images/padding2.svg";
import padding3 from "../assets/images/padding3.svg";
import padding4 from "../assets/images/padding4.svg";
import padding5 from "../assets/images/padding5.svg";
import padding6 from "../assets/images/padding6.svg";
import padding7 from "../assets/images/padding7.svg";
import padding8 from "../assets/images/padding8.svg";

const JACKET_STAGES = [
  padding1,
  padding2,
  padding3,
  padding4,
  padding5,
  padding6,
  padding7,
  padding8,
];

export default function PaddingIndexModal({
  isOpen,
  onClose,
  onDismissForToday,
  index = 40,
}) {
  const value = Math.max(0, Math.min(100, Math.round(Number(index) || 0)));
  const jacketLevel = Math.min(
    Math.round(value / 10),
    JACKET_STAGES.length - 1,
  );
  const title = "오늘의 롱패딩 지수";
  const description =
    value >= 70
      ? "오늘은 롱패딩을 꼭 챙겨야 하는 날씨입니다!"
      : value >= 35
        ? "오늘은 롱패딩을 시도해볼 만한 날씨입니다!"
        : "오늘은 가벼운 겉옷으로 충분한 날씨입니다!";

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      overlayClassName="bg-black/25"
      closeOnOverlay={false}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="padding-index-title"
        className="w-full overflow-hidden rounded-[8px] bg-[#F4FAFF] pt-[17px] shadow-[0_4px_12px_rgba(0,0,0,0.18)]"
      >
        <h2
          id="padding-index-title"
          className="text-center text-[16px] font-semibold leading-[21px] tracking-[-0.38px] text-[#1F1C1A]"
        >
          {title}
        </h2>
        <img
          src={JACKET_STAGES[jacketLevel]}
          alt={`롱패딩 지수 ${value}% 단계 패딩 일러스트`}
          className="mx-auto h-[150px] w-[120px] object-contain"
        />
        <div className="flex flex-col items-center px-[15px] pb-[9px] text-center">
          <p className="text-[22px] font-semibold leading-[21px] tracking-[-0.38px] text-[#60E1FF]">
            {value}%
          </p>
          <p className="mt-[9px] text-[12px] font-medium leading-[17px] tracking-[-0.36px] text-[#62605F]">
            {description}
            <br />
            {value >= 70 ? "따뜻하게 입고 외출하세요" : "용감하게 스타트를 끊어보세요"}
          </p>
        </div>
        <div className="flex h-[42px] border-t border-[#D2D2D1]/60">
          <button
            type="button"
            onClick={onDismissForToday}
            className="flex-1 text-[13px] font-semibold leading-[21px] tracking-[-0.4px] text-[#BCBBBA]"
          >
            오늘 하루 보지 않기
          </button>
          <span aria-hidden="true" className="w-px bg-[#D2D2D1]/60" />
          <button
            type="button"
            onClick={onClose}
            className="flex-1 text-[13px] font-semibold leading-[21px] tracking-[-0.4px] text-[#8F8E8D]"
          >
            닫기
          </button>
        </div>
      </section>
    </Modal>
  );
}
