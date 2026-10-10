import { create } from "zustand";

// 토스트 메시지 전역 상태. 화면에서는 hooks/useToast.js 로 사용
let nextId = 1;

const useToastStore = create((set) => ({
  toasts: [], // [{ id, message, type }]
  push: (message, type = "default") => {
    const id = nextId++;
    set((state) => ({ toasts: [...state.toasts, { id, message, type }] }));
    return id;
  },
  remove: (id) =>
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
}));

export default useToastStore;
