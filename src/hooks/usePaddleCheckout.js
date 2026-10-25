import { useContext } from "react";
import { USE_MOCK } from "../api/config";
import PaddleCheckoutContext from "../contexts/PaddleCheckoutContext";

const usePaddleCheckout = () => {
  const context = useContext(PaddleCheckoutContext);
  if (!context) throw new Error("PaddleCheckoutProvider 안에서 사용해야 합니다.");

  const open = async ({ transactionId } = {}) => {
    if (USE_MOCK) {
      await new Promise((resolve) => setTimeout(resolve, 800));
      return { status: "completed" };
    }
    context.open({ transactionId });
    return { status: "opened" };
  };

  return { ...context, open };
};

export default usePaddleCheckout;
