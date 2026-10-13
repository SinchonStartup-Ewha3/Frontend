import avatarDefault from "../assets/icons/avatar-default.svg";
import editPencil from "../assets/icons/edit-pencil.svg";

// 프로필 동그란 이미지. editable 이면 오른쪽 아래 연필 버튼(하늘색 원)이 붙어요.
//  - onEdit: 연필 버튼 클릭 시 (파일 선택창 열기 등)
const Avatar = ({ src, size = 102, editable = false, onEdit, className = "" }) => (
  <div className={`relative shrink-0 ${className}`} style={{ width: size, height: size }}>
    <img
      src={src || avatarDefault}
      alt="프로필 사진"
      className="h-full w-full rounded-full bg-[#E9E8E8] object-cover"
    />
    {editable && (
      <button
        type="button"
        aria-label="프로필 사진 수정"
        onClick={onEdit}
        className="absolute -bottom-[3px] -right-[4px] flex h-[30.6px] w-[30.6px] items-center justify-center rounded-full bg-main"
      >
        <img src={editPencil} alt="" className="h-[15px] w-[15px]" />
      </button>
    )}
  </div>
);

export default Avatar;
