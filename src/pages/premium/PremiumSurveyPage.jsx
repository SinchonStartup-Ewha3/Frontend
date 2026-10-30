import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import BottomCTA from "../../components/BottomCTA";
import Button from "../../components/Button";
import MobileLayout from "../../components/MobileLayout";
import PageHeading from "../../components/PageHeading";
import { SURVEY_PROGRESS, SURVEY_QUESTIONS } from "../../constants/premium";
import { useSavePremiumProfile, useSubscriptionQuery } from "../../hooks/usePayment";
import useToast from "../../hooks/useToast";

const ANSWER_CODES = [
  ["VERY_SENSITIVE", "NORMAL", "HEAT_SENSITIVE", "UNKNOWN"],
  ["MORNING", "EVENING", "GOOD_WEATHER_ONLY", "FLEXIBLE"],
  ["RAIN_BEFORE", "HIGH_HUMIDITY", "INDOOR_DRYING_TIP", "DAILY_SUMMARY"],
];

const OPTION_TOPS = [318, 384, 449, 514];

export default function PremiumSurveyPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();
  const saveProfile = useSavePremiumProfile();
  const isLocalPreview = import.meta.env.DEV && new URLSearchParams(location.search).get("preview") === "1";
  const statusQuery = useSubscriptionQuery({ enabled: !isLocalPreview, refetchOnMount: "always" });
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState(() =>
    SURVEY_QUESTIONS.map(() => null),
  );
  const question = SURVEY_QUESTIONS[questionIndex];
  const progress = SURVEY_PROGRESS[questionIndex] ?? 100;

  useEffect(() => {
    if (isLocalPreview || !statusQuery.data || statusQuery.data.canCompleteSurvey) return;
    navigate("/premium", { replace: true });
  }, [isLocalPreview, navigate, statusQuery.data]);

  const handleNext = () => {
    if (questionIndex < SURVEY_QUESTIONS.length - 1) {
      setQuestionIndex((current) => current + 1);
      return;
    }
    if (answers.some((answer) => answer === null)) {
      toast.error("모든 설문 항목을 선택해 주세요.");
      return;
    }
    const payload = {
      coldSensitivity: ANSWER_CODES[0][answers[0]],
      exercisePreference: ANSWER_CODES[1][answers[1]],
      laundryPreferences: [ANSWER_CODES[2][answers[2]]],
    };
    saveProfile.mutate(payload, {
      onSuccess: () => {
        navigate("/premium/schedule-setup");
      },
      onError: () => toast.error("설문을 저장하지 못했어요. 다시 시도해 주세요."),
    });
  };

  if (!isLocalPreview && (statusQuery.isLoading || statusQuery.isFetching)) {
    return (
      <MobileLayout>
        <main className="mx-auto flex min-h-[852px] w-full max-w-[402px] items-center justify-center bg-white text-sm text-[#A5A4A3]">
          설문 가능 여부를 확인하고 있어요.
        </main>
      </MobileLayout>
    );
  }

  if (!isLocalPreview && statusQuery.isError) {
    return (
      <MobileLayout>
        <main className="mx-auto flex min-h-[852px] w-full max-w-[402px] flex-col items-center justify-center gap-3 bg-white text-sm text-[#797776]">
          <p role="alert">설문 가능 여부를 확인하지 못했어요.</p>
          <button type="button" onClick={() => statusQuery.refetch()} className="text-[#33B8D7]">
            다시 시도
          </button>
        </main>
      </MobileLayout>
    );
  }

  if (!isLocalPreview && !statusQuery.data?.canCompleteSurvey) {
    return (
      <MobileLayout>
        <main className="mx-auto flex min-h-[852px] w-full max-w-[402px] flex-col items-center justify-center gap-3 bg-white text-sm text-[#797776]">
          <p>현재 설문을 작성할 수 없어요.</p>
          <button type="button" onClick={() => navigate("/premium")} className="text-[#33B8D7]">
            프리미엄 확인하기
          </button>
        </main>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout>
      <main className="relative mx-auto min-h-[852px] w-full max-w-[402px] overflow-hidden bg-white text-[#353331]">
        <div
          role="progressbar"
          aria-label={`설문 진행률 ${progress}%`}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={progress}
          className="absolute h-[6px] rounded-full bg-[#E9E8E8]"
          style={{ top: 112, left: 24, right: 24 }}
        >
          <div
            className="h-full rounded-full bg-main"
            style={{ width: `${progress}%` }}
          />
        </div>

        <PageHeading
          title={question.title}
          description={question.desc}
          size="lg"
          className="absolute"
          style={{ top: 164, left: 23, right: 23 }}
          titleClassName="!text-[26px] !leading-[1.4] !tracking-[-0.78px]"
          descClassName="!mt-[4px] !text-[14px] !leading-[1.5] !tracking-[-0.42px]"
        />

        <div role="radiogroup" aria-label={question.title}>
          {question.options.map((option, optionIndex) => {
            const selected = answers[questionIndex] === optionIndex;
            return (
              <div
                key={option}
                className="absolute"
                style={{ top: OPTION_TOPS[optionIndex], left: 24, right: 24 }}
              >
                <Button
                  variant="option"
                  selected={selected}
                  role="radio"
                  aria-checked={selected}
                  onClick={() => {
                    setAnswers((current) =>
                      current.map((answer, index) =>
                        index === questionIndex ? optionIndex : answer,
                      ),
                    );
                  }}
                  className="!h-[52px] !rounded-[15px] !border-2 !text-[16px] !font-semibold !tracking-[-0.16px]"
                >
                  {option}
                </Button>
              </div>
            );
          })}
        </div>

        <BottomCTA bottomClassName="bottom-[112px]">
          <Button
            onClick={handleNext}
            disabled={saveProfile.isPending}
            className="h-[44px] rounded-[10px] text-[18px] tracking-[-0.18px]"
          >
            {saveProfile.isPending ? "저장 중..." : "다음"}
          </Button>
        </BottomCTA>
      </main>
    </MobileLayout>
  );
}
