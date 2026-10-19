import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Card from "../../components/Card";
import ListRow from "../../components/ListRow";
import MobileLayout from "../../components/MobileLayout";
import PageHeading from "../../components/PageHeading";
import PageLayout from "../../components/PageLayout";
import Toggle from "../../components/Toggle";
import chevronRightIcon from "../../assets/icons/chevron-right.svg";
import lockIcon from "../../assets/icons/lock.svg";
import { useProfileQuery } from "../../hooks/useProfile";

const alertOptions = [
  { id: "outerwear", label: "겉옷 알림", initial: true },
  { id: "exercise", label: "운동 알림", initial: false },
  { id: "laundry", label: "빨래 알림", initial: true },
  { id: "umbrella", label: "우산 알림", initial: true },
  { id: "baseball", label: "야구 관람 알림", initial: true },
];

const sectionHeadingClass = "text-[16px] leading-[21px] font-bold";

export default function MyPage() {
  const navigate = useNavigate();
  const { data: profile } = useProfileQuery();
  const [alerts, setAlerts] = useState(() =>
    Object.fromEntries(alertOptions.map(({ id, initial }) => [id, initial])),
  );

  const toggleAlert = (id) => {
    setAlerts((current) => ({ ...current, [id]: !current[id] }));
  };

  return (
    <MobileLayout>
      <PageLayout className="!px-0">
        <main className="px-[21px] pt-[106px] text-[#353331]">
          <div className="flex flex-col gap-[18px]">
            <Card
              highlighted
              className="!rounded-[13px] !p-0"
            >
              <button
                type="button"
                onClick={() => navigate("/mypage/profile")}
                className="flex h-[77px] w-full items-center justify-between px-[17px] text-left"
              >
                <span>
                  <PageHeading
                    title={profile?.nickname ?? "내 프로필"}
                    titleClassName="text-[16px] leading-[20px] font-bold"
                  />
                  <span className="mt-[8px] block text-[14px] leading-[17px]">
                    {profile?.region?.shortName ?? "지역을 설정해주세요"}
                  </span>
                </span>
                <img src={chevronRightIcon} alt="" />
              </button>
            </Card>

            <Card className="relative !h-[238px] !rounded-[13px] !px-[15px] !py-[14px]">
              <button
                type="button"
                onClick={() => navigate("/mypage/notifications")}
                aria-label="알림 설정 상세 화면으로 이동"
                className="block text-left"
              >
                <PageHeading
                  title="알림 설정"
                  titleClassName={sectionHeadingClass}
                />
              </button>
              <div className="mt-[10px] flex flex-col">
                {alertOptions.map(({ id, label }) => (
                  <div
                    key={id}
                    className="flex h-[36.44px] items-center justify-between text-[14px] leading-[20px]"
                  >
                    <span>{label}</span>
                    <Toggle
                      size="sm"
                      on={alerts[id]}
                      onChange={() => toggleAlert(id)}
                    />
                  </div>
                ))}
              </div>
              <div className="pointer-events-none absolute inset-x-[14px] top-[46px] bottom-[11px] flex flex-col items-center bg-[rgba(255,255,255,0.86)] pt-[50px] backdrop-blur-[2px]">
                <span className="flex h-6 w-6 items-center justify-center">
                  <img src={lockIcon} alt="" />
                </span>
                <p className="mt-[12px] whitespace-nowrap text-[14px] leading-[19px] text-[#797776]">
                  알림 구독 유저를 위한 기능이에요
                </p>
              </div>
            </Card>

            <Card className="!h-[131px] !rounded-[13px] !px-[16px] !py-[14px]">
              <div className="flex h-full flex-col">
                <ListRow
                  onClick={() => navigate("/mypage/payment")}
                  className={`${sectionHeadingClass} h-[22px]`}
                >
                  결제 관리
                </ListRow>
                <p className="mt-[12px] text-[14px] leading-[20px]">
                  맞춤형 행동 알림 구독
                </p>
                <p className="mt-[12px] text-[14px] leading-[20px]">
                  날씨 운세 이용권
                </p>
              </div>
            </Card>

            <Card className="!h-[127px] !rounded-[13px] !px-[16px] !py-[12px]">
              <div className="flex h-full flex-col">
                <PageHeading
                  title="내 활동"
                  titleClassName={sectionHeadingClass}
                />
                <div className="mt-[8px] flex flex-1 flex-col justify-between">
                  <ListRow
                    onClick={() => navigate("/mypage/activity?type=written")}
                    className="h-[29px] text-[14px] leading-[20px]"
                  >
                    작성한 게시물
                  </ListRow>
                  <ListRow
                    onClick={() => navigate("/mypage/activity?type=saved")}
                    className="h-[29px] text-[14px] leading-[20px]"
                  >
                    저장한 게시물
                  </ListRow>
                </div>
              </div>
            </Card>
          </div>
        </main>
      </PageLayout>
    </MobileLayout>
  );
}
