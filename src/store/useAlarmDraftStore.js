import { create } from "zustand";

// 알림 설정 화면에서 토글을 바꾸는 동안의 "임시 값"
// 맨 아래 [확인]을 눌렀을 때 서버에 한 번에 저장하도록! (뒤로가기 하면 버려짐)
const useAlarmDraftStore = create((set) => ({
  draft: null, // { outer:true, ... } 서버값을 복사해서 시작
  init: (settings) => set({ draft: { ...settings } }),
  toggle: (type) =>
    set((s) => ({ draft: { ...s.draft, [type]: !s.draft?.[type] } })),
  clear: () => set({ draft: null }),
}));

export default useAlarmDraftStore;
