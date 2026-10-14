import { useState } from "react";
import BottomSheet from "./BottomSheet";
import angelFortune from "../assets/images/fortune/fortune_angel.svg";
import travelerFortune from "../assets/images/fortune/fortune_traveler.svg";
import crownFortune from "../assets/images/fortune/fortune_crown.svg";
import detectiveFortune from "../assets/images/fortune/fortune_detective.svg";
import wizardFortune from "../assets/images/fortune/fortune_wizard.svg";

const couponCharacters = [
  angelFortune,
  travelerFortune,
  crownFortune,
  detectiveFortune,
  wizardFortune,
];

export default function CouponRegistrationSheet({ isOpen, onClose, onRegister }) {
  const [couponCode, setCouponCode] = useState("");
  const [couponMessage, setCouponMessage] = useState("");

  if (!isOpen) return null;

  const handleRegister = () => {
    const code = couponCode.trim();
    if (!code) {
      setCouponMessage("쿠폰 코드를 입력해주세요.");
      return;
    }
    onRegister?.(code);
    onClose?.();
  };

  return (
    <BottomSheet
      isOpen={isOpen}
      title="쿠폰 등록"
      onClose={onClose}
      showHandle={false}
      showHeader={false}
      hideScrollbar
      backdropClassName="bg-[#D9D9D9]/75"
      className="!h-[352px] !max-h-none !rounded-t-[30px] !bg-[#555]/55 !px-7 !pb-0 !pt-[25px] !shadow-none"
    >
      <div className="mb-[14px] flex h-[38px] items-center justify-between">
        <h2 className="text-[26px] font-semibold leading-[1.2] tracking-[-0.78px] text-white">
          쿠폰 등록
        </h2>
        <button
          type="button"
          aria-label="쿠폰 등록 창 닫기"
          onClick={onClose}
          className="flex h-6 w-6 items-center justify-center rounded-full bg-white/70 text-[12px] leading-none text-[#797776]"
        >
          ×
        </button>
      </div>

      <div className="relative mx-2 h-[228px] rounded-[20px] bg-[#555]/55">
        <p className="absolute left-[14px] right-[14px] top-[13px] text-center text-[12px] font-medium leading-[1.5] tracking-[-0.36px] text-[#E9E8E8]">
          테루테루 카드 속 코드를 등록해 날씨 운세를 볼 수 있어요.
        </p>
        <div aria-label="테루테루 카드 예시" className="absolute left-[26px] right-[26px] top-[39px] flex h-[59px] items-center justify-between gap-2">
          {couponCharacters.map((character, index) => (
            <img
              key={character}
              src={character}
              alt={`테루테루 카드 예시 ${index + 1}`}
              className="h-[54px] min-w-0 flex-1 object-contain"
            />
          ))}
        </div>
        <label className="absolute left-[23px] right-[23px] top-[110px] block">
          <span className="sr-only">쿠폰 코드</span>
          <input
            value={couponCode}
            onChange={(event) => {
              setCouponCode(event.target.value);
              setCouponMessage("");
            }}
            placeholder="쿠폰 코드를 입력해주세요"
            className="h-[49px] w-full rounded-[15px] border-2 border-[#E9E8E8] bg-white px-[23px] text-[14px] font-semibold tracking-[-0.14px] text-[#353331] outline-none placeholder:text-[#BCBBBA] focus:border-[#60E1FF]"
          />
        </label>
        <button
          type="button"
          onClick={handleRegister}
          className="absolute left-1/2 top-[174px] h-[36px] w-[193px] -translate-x-1/2 rounded-[10px] bg-[#60E1FF] text-[16px] font-semibold leading-[1.5] tracking-[-0.16px] text-white"
        >
          등록
        </button>
        {couponMessage && (
          <p role="status" className="absolute inset-x-3 bottom-[5px] text-center text-[11px] leading-4 text-white">
            {couponMessage}
          </p>
        )}
      </div>
    </BottomSheet>
  );
}
