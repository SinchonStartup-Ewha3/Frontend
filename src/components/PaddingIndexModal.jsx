import Modal from "./Modal";
import jacketImage from "../assets/images/padding-index-jacket.png";

export default function PaddingIndexModal({
  isOpen,
  onClose,
  onDismissForToday,
  index = 40,
}) {
  const value = Math.max(0, Math.min(100, Math.round(Number(index) || 0)));
  const title = value >= 70 ? "오늘의 롱패딩 지수" : "오늘의 패딩 지수";
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
          src={jacketImage}
          alt="포근한 패딩 재킷 일러스트"
          className="mx-auto h-[240px] w-full object-contain"
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
