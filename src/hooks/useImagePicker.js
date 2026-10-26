// 사진 1장 선택 + 미리보기 + 형식/용량 검사 custom hook (글 작성·수정 화면 공용)
// const picker = useImagePicker();
// picker.choose(file) -> 검사 후 선택 / picker.photo -> File 또는 null / picker.preview -> 미리보기 URL / picker.error -> 에러 문구
import { useEffect, useRef, useState } from "react";
import { ALLOWED_IMAGE_TYPES, MAX_IMAGE_BYTES } from "../constants/community";

const useImagePicker = () => {
  const [photo, setPhoto] = useState(null);
  const [preview, setPreview] = useState("");
  const [error, setError] = useState("");
  const previewUrlRef = useRef("");

  // 이전 미리보기 URL 은 꼭 해제해야 메모리가 새지 않아요
  const replacePhoto = (file) => {
    if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
    previewUrlRef.current = file ? URL.createObjectURL(file) : "";
    setPhoto(file);
    setPreview(previewUrlRef.current);
  };

  // 화면을 벗어날 때 마지막 미리보기 URL 해제
  useEffect(
    () => () => {
      if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
    },
    [],
  );

  const choose = (file) => {
    setError("");
    if (!file) return; // 파일 선택창에서 취소한 경우: 기존 선택 유지
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      replacePhoto(null);
      setError("JPG, PNG, WEBP 이미지만 등록할 수 있습니다.");
      return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      replacePhoto(null);
      setError("이미지 크기는 5MB 이하여야 합니다.");
      return;
    }
    replacePhoto(file);
  };

  return { photo, preview, error, choose };
};

export default useImagePicker;
