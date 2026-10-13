import { useId } from "react";
import InputField from "./InputField";

// "라벨 + 입력창" 한 세트 (프로필 수정, 환불 계좌 입력, 설문 일정 이름에서 공통 사용)
const FIELD_CLASS =
  "!rounded-[15px] !border-2 !px-6 !text-sm !font-semibold !tracking-[-0.02em] !text-[#1F1C1A]";

// compact: 설문 입력창처럼 높이 52px 짜리가 필요할 때
const FormField = ({
  label,
  compact = false,
  className = "",
  inputClassName = "",
  ...inputProps
}) => {
  const id = useId();
  return (
    <div className={className}>
      <label
        htmlFor={id}
        className="mb-[18px] block text-base font-semibold leading-6 text-[#1F1C1A]"
      >
        {label}
      </label>
      <InputField
        id={id}
        className={`${FIELD_CLASS} ${compact ? "!h-[52px]" : "!h-[58px]"} ${inputClassName}`}
        {...inputProps}
      />
    </div>
  );
};

export default FormField;
