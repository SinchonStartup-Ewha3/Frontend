import { useEffect, useState } from "react";

// 입력값이 멈춘 뒤 delay(ms) 후에 값을 반영 (검색창 API 호출 줄이기용)
const useDebounce = (value, delay = 250) => {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
};

export default useDebounce;
