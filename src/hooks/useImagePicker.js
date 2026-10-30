// 사진 1장 선택 + 미리보기 + 형식/용량 검사 custom hook (글 작성·수정 화면 공용)
// const picker = useImagePicker();
// picker.choose(file) -> 검사 후 선택 / picker.photo -> File 또는 null / picker.preview -> 미리보기 URL / picker.error -> 에러 문구
import { useEffect, useRef, useState } from "react";
import heic2any from "heic2any";
import { ALLOWED_IMAGE_TYPES, MAX_IMAGE_BYTES } from "../constants/community";

const isHeic = (file) =>
  /\.(heic|heif)$/i.test(file.name) ||
  ["image/heic", "image/heif", "image/heic-sequence", "image/heif-sequence"].includes(file.type.toLowerCase());

const compressJpeg = async (source, fileName) => {
  const imageUrl = URL.createObjectURL(source);
  try {
    const image = new Image();
    image.src = imageUrl;
    await new Promise((resolve, reject) => {
      image.onload = resolve;
      image.onerror = () => reject(new Error("이미지를 읽을 수 없습니다."));
    });

    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    if (!context) throw new Error("이미지를 변환할 수 없습니다.");

    let scale = Math.min(1, 2560 / Math.max(image.naturalWidth, image.naturalHeight));
    let quality = 0.88;
    let blob;
    for (let attempt = 0; attempt < 12; attempt += 1) {
      canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
      canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
      context.drawImage(image, 0, 0, canvas.width, canvas.height);
      blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/jpeg", quality));
      if (!blob) throw new Error("JPEG 변환에 실패했습니다.");
      if (blob.size <= MAX_IMAGE_BYTES) {
        return new File([blob], `${fileName.replace(/\.(heic|heif)$/i, "")}.jpg`, {
          type: "image/jpeg",
          lastModified: Date.now(),
        });
      }
      if (quality > 0.5) quality -= 0.1;
      else scale *= 0.8;
    }
    throw new Error("5MB 이하로 압축할 수 없습니다.");
  } finally {
    URL.revokeObjectURL(imageUrl);
  }
};

const useImagePicker = () => {
  const [photo, setPhoto] = useState(null);
  const [preview, setPreview] = useState("");
  const [error, setError] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
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

  const choose = async (file) => {
    setError("");
    if (!file) return; // 파일 선택창에서 취소한 경우: 기존 선택 유지
    const heic = isHeic(file);
    if (!heic && !ALLOWED_IMAGE_TYPES.includes(file.type)) {
      replacePhoto(null);
      setError("JPG, PNG, WEBP 이미지만 등록할 수 있습니다.");
      return;
    }
    if (!heic && file.size > MAX_IMAGE_BYTES) {
      replacePhoto(null);
      setError("이미지 크기는 5MB 이하여야 합니다.");
      return;
    }
    if (!heic) {
      replacePhoto(file);
      return;
    }

    replacePhoto(null);
    setIsProcessing(true);
    try {
      const converted = await heic2any({ blob: file, toType: "image/jpeg", quality: 0.9 });
      const jpegBlob = Array.isArray(converted) ? converted[0] : converted;
      replacePhoto(await compressJpeg(jpegBlob, file.name));
    } catch (conversionError) {
      setError(conversionError?.message || "HEIC 사진을 JPEG로 변환하지 못했습니다.");
    } finally {
      setIsProcessing(false);
    }
  };

  return { photo, preview, error, isProcessing, choose };
};

export default useImagePicker;
