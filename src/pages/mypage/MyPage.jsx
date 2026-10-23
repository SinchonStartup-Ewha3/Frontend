import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Card from "../../components/Card";
import Button from "../../components/Button";
import ListRow from "../../components/ListRow";
import MobileLayout from "../../components/MobileLayout";
import PageHeading from "../../components/PageHeading";
import PageLayout from "../../components/PageLayout";
import PremiumCheckoutSheet from "../../components/PremiumCheckoutSheet";
import chevronRightIcon from "../../assets/icons/chevron-right.svg";
import lockIcon from "../../assets/icons/lock.svg";
import { useProfileQuery } from "../../hooks/useProfile";
import { useIsPremium } from "../../hooks/usePayment";

const sectionHeadingClass = "text-[16px] leading-[21px] font-bold";

export default function MyPage() {
  const navigate = useNavigate();
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const isLoggedIn = Boolean(localStorage.getItem("wee_access_token"));
  const { data: profile } = useProfileQuery({ enabled: isLoggedIn });
  const { isPremium } = useIsPremium({ enabled: isLoggedIn });

  if (!isLoggedIn) {
    return (
      <MobileLayout>
        <PageLayout className="!px-0">
          <main className="px-[21px] pt-[106px] text-[#353331]">
            <div className="flex flex-col gap-[18px]">
              <Card highlighted className="!rounded-[13px] !p-0">
                <button
                  type="button"
                  onClick={() => navigate("/consent", { state: { intent: "kakao", from: "/mypage" } })}
                  className="flex min-h-[77px] w-full items-center justify-between px-[17px] text-left"
                >
                  <span>
                    <PageHeading
                      title="비회원"
                      titleClassName="text-[16px] leading-[20px] font-bold"
                    />
                    <span className="mt-[8px] block text-[14px] leading-[17px]">
                      로그인 / 회원가입 하러 가기
                    </span>
                  </span>
                  <img src={chevronRightIcon} alt="" />
                </button>
              </Card>

              <Card className="!rounded-[13px] !px-[16px] !py-[14px]">
                <p className="text-[14px] leading-[20px] text-[#797776]">
                  프리미엄 구독으로 맞춤형 기능을 이용해보세요.
                </p>
                <Button
                  className="mt-[14px]"
                  onClick={() => setIsCheckoutOpen(true)}
                >
                  프리미엄 구독하기
                </Button>
              </Card>
            </div>
          </main>
          {isCheckoutOpen && (
            <PremiumCheckoutSheet
              isOpen
              onClose={() => setIsCheckoutOpen(false)}
              onSuccess={() => {
                setIsCheckoutOpen(false);
                navigate("/premium/welcome");
              }}
            />
          )}
        </PageLayout>
      </MobileLayout>
    );
  }

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
                    titleClassName={`${isPremium ? "text-[18px] leading-[21px]" : "text-[16px] leading-[20px]"} font-bold`}
                  />
                  <span className="mt-[8px] block text-[14px] leading-[17px]">
                    {profile?.region?.shortName ?? "지역을 설정해주세요"}
                  </span>
                </span>
                <img src={chevronRightIcon} alt="" />
              </button>
            </Card>

            <Card className="relative !h-[56px] !rounded-[13px] !px-[16px] !py-[14px]">
              <ListRow
                onClick={isPremium ? () => navigate("/mypage/notifications") : undefined}
                disabled={!isPremium}
                className={`${isPremium ? "text-[18px]" : sectionHeadingClass} h-[22px]`}
              >
                알림 일정 관리
              </ListRow>
              {!isPremium && (
                <div className="pointer-events-none absolute inset-x-[14px] top-[7px] z-10 flex h-[39px] items-center justify-center gap-[8px] bg-[rgba(255,255,255,0.86)] backdrop-blur-[2px]">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center">
                    <img src={lockIcon} alt="" />
                  </span>
                  <p className="whitespace-nowrap text-[14px] leading-[19px] text-[#797776]">
                    알림 구독 유저를 위한 기능이에요
                  </p>
                </div>
              )}
            </Card>

            <Card className="!h-[131px] !rounded-[13px] !px-[16px] !py-[14px]">
              <div className="flex h-full flex-col">
                <ListRow
                  onClick={() => navigate("/mypage/payment")}
                  className={`${isPremium ? "text-[18px] leading-[21px] font-bold" : sectionHeadingClass} h-[22px]`}
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
                  titleClassName={isPremium ? "text-[18px] leading-[21px] font-bold" : sectionHeadingClass}
                />
                <div className="mt-[8px] flex flex-1 flex-col justify-between">
                  <ListRow
                    onClick={() => navigate("/mypage/activity?type=written")}
                    className="h-[29px] text-[14px] leading-[20px]"
                  >
                    작성한 게시물
                  </ListRow>
                  <ListRow
                    onClick={() => navigate("/mypage/activity?type=liked")}
                    className="h-[29px] text-[14px] leading-[20px]"
                  >
                    공감한 게시물
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
