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
      overlayPadding="30px"
      contentMaxWidth="330px"
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="padding-index-title"
        className="flex w-full flex-col items-center gap-[3.75px] overflow-hidden rounded-[7.5px] bg-[#F4FAFF] pt-[16.875px] shadow-[4.688px_0_7.5px_0_rgba(0,0,0,0.15),0_4.688px_7.5px_0_rgba(0,0,0,0.15)]"
      >
        <h2
          id="padding-index-title"
          className="w-full text-center text-[16.875px] font-semibold leading-[20.625px] tracking-[-0.375px] text-[#1F1C1A]"
        >
          {title}
        </h2>
        <img
          src={JACKET_STAGES[jacketLevel]}
          alt={`롱패딩 지수 ${value}% 단계 패딩 일러스트`}
          className="mx-auto h-[240.317px] w-[304.688px] max-w-full object-contain"
        />
        <div className="flex w-full flex-col items-center gap-[9.375px] px-[15px] pb-[9.375px] text-center">
          <p className="w-full text-[22.5px] font-semibold leading-[20.625px] tracking-[-0.375px] text-[#60E1FF]">
            {value}%
          </p>
          <p className="text-[12.188px] font-medium leading-[16.875px] tracking-[-0.375px] text-[#62605F]">
            {description}
            <br />
            {value >= 70 ? "따뜻하게 입고 외출하세요" : "용감하게 스타트를 끊어보세요"}
          </p>
        </div>
        <div className="flex h-[41.25px] w-full shrink-0">
          <button
            type="button"
            onClick={onDismissForToday}
            className="flex min-w-0 flex-[1_0_0] items-center justify-center border-t-[0.312px] border-t-[#A5A4A3] text-[13.125px] font-semibold leading-[20.625px] tracking-[-0.4031px] text-[#BCBBBA]"
          >
            오늘 하루 보지 않기
          </button>
          <span aria-hidden="true" className="w-[0.312px] bg-[#A5A4A3]" />
          <button
            type="button"
            onClick={onClose}
            className="flex min-w-0 flex-[1_0_0] items-center justify-center border-t-[0.312px] border-t-[#A5A4A3] text-[15px] font-medium leading-[20.625px] tracking-[-0.4031px] text-[#8F8E8D]"
          >
            닫기
          </button>
        </div>
      </section>
    </Modal>
  );
}
