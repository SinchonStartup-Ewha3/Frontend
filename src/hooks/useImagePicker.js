// 사진 1장 선택 + 미리보기 + 형식/용량 검사 + 업로드용 압축 custom hook (글 작성·수정 화면 공용)
// const picker = useImagePicker();
// picker.choose(file) -> 검사/압축 후 선택 / picker.photo -> File 또는 null / picker.preview -> 미리보기 URL / picker.error -> 에러 문구
import { useEffect, useRef, useState } from "react";
import heic2any from "heic2any";
import { ALLOWED_IMAGE_TYPES, MAX_IMAGE_BYTES } from "../constants/community";

// 갤러리 원본(수 MB)을 그대로 올리면 모바일 회선에서 타임아웃이 나서, 업로드 전에 줄여요
const UPLOAD_MAX_SIDE = 1600;
const UPLOAD_TARGET_BYTES = 1024 * 1024; // 1MB 이하를 목표
const SKIP_COMPRESS_BYTES = 300 * 1024; // 이미 작은 JPG/WEBP 는 그대로 사용

const HEIC_TYPES = [
  "image/heic",
  "image/heif",
  "image/heic-sequence",
  "image/heif-sequence",
];
const EXT_TYPES = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
};

const isHeic = (file) =>
  /\.(heic|heif)$/i.test(file.name || "") ||
  HEIC_TYPES.includes((file.type || "").toLowerCase());

// 일부 안드로이드 갤러리는 file.type 이 비어 있어서 확장자로 보완해요
const getImageType = (file) => {
  const type = (file.type || "").toLowerCase();
  if (type) return type;
  const ext = (file.name || "").split(".").pop()?.toLowerCase();
  return EXT_TYPES[ext] ?? "";
};

const loadImage = (source) =>
  new Promise((resolve, reject) => {
    const url = URL.createObjectURL(source);
    const image = new Image();
    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("이미지를 읽을 수 없습니다."));
    };
    image.src = url;
  });

// 긴 변을 maxSide 이하로 줄이고 JPEG 로 다시 인코딩 (targetBytes 이하가 될 때까지 품질 -> 크기 순으로 낮춤)
const compressJpeg = async (
  source,
  fileName,
  { maxSide = UPLOAD_MAX_SIDE, targetBytes = UPLOAD_TARGET_BYTES } = {},
) => {
  const image = await loadImage(source);
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");
  if (!context) throw new Error("이미지를 변환할 수 없습니다.");

  let scale = Math.min(
    1,
    maxSide / Math.max(image.naturalWidth, image.naturalHeight),
  );
  let quality = 0.82;
  let blob;
  for (let attempt = 0; attempt < 12; attempt += 1) {
    canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
    canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
    context.fillStyle = "#fff"; // 투명 PNG 가 검은 배경이 되지 않도록
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.drawImage(image, 0, 0, canvas.width, canvas.height);
    blob = await new Promise((resolve) =>
      canvas.toBlob(resolve, "image/jpeg", quality),
    );
    if (!blob) throw new Error("JPEG 변환에 실패했습니다.");
    if (blob.size <= targetBytes) break;
    if (quality > 0.55) quality -= 0.1;
    else scale *= 0.8;
  }
  if (blob.size > MAX_IMAGE_BYTES)
    throw new Error("5MB 이하로 압축할 수 없습니다.");
  return new File(
    [blob],
    `${(fileName || "photo").replace(/\.[^.]+$/, "")}.jpg`,
    {
      type: "image/jpeg",
      lastModified: Date.now(),
    },
  );
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
    const type = getImageType(file);
    if (!heic && !ALLOWED_IMAGE_TYPES.includes(type)) {
      replacePhoto(null);
      setError("JPG, PNG, WEBP 이미지만 등록할 수 있습니다.");
      return;
    }

    // 작은 JPG/WEBP 는 그대로, 나머지(HEIC·PNG·큰 사진)는 줄여서 업로드해요
    if (!heic && type !== "image/png" && file.size <= SKIP_COMPRESS_BYTES) {
      replacePhoto(file);
      return;
    }

    replacePhoto(null);
    setIsProcessing(true);
    try {
      const source = heic
        ? await heic2any({
            blob: file,
            toType: "image/jpeg",
            quality: 0.9,
          }).then((out) => (Array.isArray(out) ? out[0] : out))
        : file;
      replacePhoto(await compressJpeg(source, file.name));
    } catch (processError) {
      // 압축에 실패해도 원본이 규격 안이면 그대로 사용
      if (!heic && file.size <= MAX_IMAGE_BYTES) {
        replacePhoto(file);
      } else {
        setError(processError?.message || "사진을 처리하지 못했습니다.");
      }
    } finally {
      setIsProcessing(false);
    }
  };

  return { photo, preview, error, isProcessing, choose };
};

export default useImagePicker;
