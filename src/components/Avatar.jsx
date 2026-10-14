import avatarDefault from "../assets/icons/avatar-default.svg";
import profilePhotoEditBadge from "../assets/icons/profile-photo-edit-badge.svg";
import profilePhotoEditPencil from "../assets/icons/profile-photo-edit-pencil.svg";

// 프로필 동그란 이미지. editable 이면 오른쪽 아래 연필 버튼(하늘색 원)이 붙어요.
//  - onEdit: 연필 버튼 클릭 시 (파일 선택창 열기 등)
const Avatar = ({ src, size = 102, editable = false, onEdit, className = "" }) => (
  <div className={`relative shrink-0 ${className}`} style={{ width: size, height: size }}>
    <img
      src={src || avatarDefault}
      alt="프로필 사진"
      className={
        src
          ? "h-full w-full rounded-full bg-[#E9E8E8] object-cover"
          : size >= 140
            ? "absolute left-1/2 top-1/2 h-[102px] w-[102px] -translate-x-1/2 -translate-y-1/2 rounded-full object-contain"
            : "h-full w-full rounded-full object-contain"
      }
    />
    {editable && (
      <button
        type="button"
        aria-label="프로필 사진 수정"
        onClick={onEdit}
        className={`absolute flex h-[30.59px] w-[30.59px] items-center justify-center ${size >= 140 ? "left-[98px] top-[96px]" : "-bottom-[3px] -right-[4px]"}`}
      >
        <img src={profilePhotoEditBadge} alt="" />
        <img
          src={profilePhotoEditPencil}
          alt=""
          className="absolute left-1 top-1"
        />
      </button>
    )}
  </div>
);

export default Avatar;
