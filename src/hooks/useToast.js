import useToastStore from "../store/useToastStore";

const useToast = () => {
  const push = useToastStore((s) => s.push);
  return {
    show: (message) => push(message, "default"),
    success: (message) => push(message, "success"),
    error: (message) => push(message, "error"),
  };
};

export default useToast;
