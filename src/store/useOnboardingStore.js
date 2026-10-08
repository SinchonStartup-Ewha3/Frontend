import { create } from "zustand";

const initialState = {
  nickname: "",
  location: null,
  birthDate: "2005-04-09",
  calendarType: null,
  birthTime: "07:30",
  birthTimeUnknown: false,
};

const useOnboardingStore = create((set) => ({
  ...initialState,
  setNickname: (nickname) => set({ nickname }),
  setLocation: (location) => set({ location }),
  setBirthDate: (birthDate) => set({ birthDate }),
  setCalendarType: (calendarType) => set({ calendarType }),
  setBirthTime: (birthTime) => set({ birthTime }),
  setBirthTimeUnknown: (birthTimeUnknown) => set({ birthTimeUnknown }),
  resetOnboarding: () => set(initialState),
}));

export default useOnboardingStore;
