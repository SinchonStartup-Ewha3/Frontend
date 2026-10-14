import { useState } from "react";
import { useNavigate } from "react-router-dom";
import BottomCTA from "../../components/BottomCTA";
import Button from "../../components/Button";
import MobileLayout from "../../components/MobileLayout";
import PageHeading from "../../components/PageHeading";
import { SURVEY_PROGRESS, SURVEY_QUESTIONS } from "../../constants/premium";

const OPTION_TOPS = [318, 384, 449, 514];

export default function PremiumSurveyPage() {
  const navigate = useNavigate();
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState(() =>
    SURVEY_QUESTIONS.map(() => null),
  );
  const question = SURVEY_QUESTIONS[questionIndex];
  const progress = SURVEY_PROGRESS[questionIndex] ?? 100;

  const handleNext = () => {
    if (questionIndex < SURVEY_QUESTIONS.length - 1) {
      setQuestionIndex((current) => current + 1);
      return;
    }
    navigate("/premium/schedule-setup");
  };

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
            className="h-[44px] rounded-[10px] text-[18px] tracking-[-0.18px]"
          >
            다음
          </Button>
        </BottomCTA>
      </main>
    </MobileLayout>
  );
}
