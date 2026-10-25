import { useLocation, useNavigate } from "react-router-dom";
import BottomCTA from "../../components/BottomCTA";
import Button from "../../components/Button";
import Header from "../../components/Header";
import MobileLayout from "../../components/MobileLayout";
import PageHeading from "../../components/PageHeading";
import { ALARM_TYPES } from "../../constants/alarmTypes";
import outerIcon from "../../assets/icons/alarm-outer.svg";
import exerciseIcon from "../../assets/icons/alarm-exercise.svg";
import laundryIcon from "../../assets/icons/alarm-laundry.svg";
import umbrellaIcon from "../../assets/icons/alarm-umbrella.svg";

const INTRO_STEPS = [
  {
    alarm: ALARM_TYPES.outer,
    icon: outerIcon,
    contentTop: 274,
    contentLeft: 28,
    contentRight: 35,
  },
  {
    alarm: ALARM_TYPES.exercise,
    icon: exerciseIcon,
    contentTop: 271,
    contentLeft: 24,
    contentRight: 14,
  },
  {
    alarm: ALARM_TYPES.laundry,
    icon: laundryIcon,
    contentTop: 271,
    contentLeft: 26,
    contentRight: 17,
  },
  {
    alarm: ALARM_TYPES.umbrella,
    icon: umbrellaIcon,
    contentTop: 271,
    contentLeft: 26,
    contentRight: 35,
  },
];

export default function PremiumPage() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const stepMatch = pathname.match(/\/premium\/onboarding\/(\d+)/);
  const step = stepMatch ? Number(stepMatch[1]) : 1;
  const progress = (step / INTRO_STEPS.length) * 100;
  const intro = INTRO_STEPS[step - 1];
  const { alarm } = intro;

  const handleNext = () => {
    if (step === INTRO_STEPS.length) {
      navigate("/premium");
      return;
    }
    navigate(`/premium/onboarding/${step + 1}`);
  };

  return (
    <MobileLayout>
      <main className="relative mx-auto min-h-[852px] w-full max-w-[402px] overflow-hidden bg-white text-[#353331]">
        <div className="absolute left-5 right-6 top-[73px] z-10">
          <Header back />
        </div>

        <div
          role="progressbar"
          aria-label={`온보딩 진행률 ${progress}%`}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={progress}
          className="absolute left-7 right-7 top-[112px] h-[7px]"
        >
          <div className="absolute left-6 right-0 top-0 h-full rounded-full bg-[#E9E8E8]" />
          <div
            className="absolute left-0 top-0 h-full rounded-full bg-main"
            style={{ width: `${progress}%` }}
          />
        </div>

        <PageHeading
          title="맞춤형 행동 알림"
          size="lg"
          className="absolute left-7 right-6 top-[146px]"
          titleClassName="!text-[24px] !leading-[1.4] !tracking-[-0.72px]"
        />

        <section
          aria-label="맞춤형 행동 알림 예시"
          className="absolute"
          style={{
            left: intro.contentLeft,
            right: intro.contentRight,
            top: intro.contentTop,
          }}
        >
          <div className="flex items-center gap-4">
            <div className="relative flex h-[41px] w-[41px] shrink-0 items-center justify-center rounded-full bg-[#D4F3FA]">
              <img
                src={intro.icon}
                alt=""
                className="h-auto w-auto"
              />
            </div>
            <div>
              <p className="text-[20px] font-semibold leading-[1.38] tracking-[-0.6px] text-[#4C4A48]">
                {alarm.title}
              </p>
              <p className="text-[16px] font-semibold leading-[1.5] tracking-[-0.16px] text-[#BCBBBA]">
                {alarm.sub}
              </p>
            </div>
          </div>
          <p className="mt-[17px] text-[16px] font-semibold leading-[1.38] tracking-[-0.48px] text-[#62605F]">
            {alarm.question}
          </p>
        </section>

        <ul className="absolute left-[18px] right-7 top-[581px] list-disc pl-[21px] text-[14px] font-semibold leading-[1.38] tracking-[-0.42px] text-[#A5A4A3] marker:text-[#A5A4A3]">
          {alarm.reasons.map((benefit) => (
            <li key={benefit}>{benefit}</li>
          ))}
        </ul>

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
