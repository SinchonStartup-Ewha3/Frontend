import { useNavigate } from "react-router-dom";
import Card from "../../components/Card";
import Button from "../../components/Button";
import ListRow from "../../components/ListRow";
import MobileLayout from "../../components/MobileLayout";
import PageHeading from "../../components/PageHeading";
import PageLayout from "../../components/PageLayout";
import weeLogo from "../../assets/icons/logo.svg";
import chevronRightIcon from "../../assets/icons/chevron-right.svg";
import lockIcon from "../../assets/icons/lock.svg";
import diamondIcon from "../../assets/icons/diamond.svg";
import { useMyPageSummaryQuery } from "../../hooks/useProfile";
import { useIsPremium } from "../../hooks/usePayment";
import { logoutFromService } from "../../api/auth";

const sectionHeadingClass = "text-[16px] leading-[21px] font-bold";
const guestActionButtonClass =
  "flex h-[77px] w-full items-center justify-between gap-3 rounded-[13px] px-[17px] text-left text-[#353331]";
const guestActionTitleClass =
  "block text-[16px] leading-[20px] font-bold text-[#353331]";
const guestActionDescriptionClass =
  "mt-[8px] block text-[14px] leading-[17px] text-[#797776]";

export default function MyPage() {
  const navigate = useNavigate();
  const isLoggedIn = Boolean(localStorage.getItem("wee_access_token"));
  const { data: profile } = useMyPageSummaryQuery({ enabled: isLoggedIn });
  const {
    isPremium,
    isLoading: isPremiumLoading,
    bankTransferStatus,
  } = useIsPremium({ enabled: isLoggedIn });
  const isBankTransferPending = bankTransferStatus === "PENDING";

  if (!isLoggedIn) {
    return (
      <MobileLayout>
        <PageLayout className="!px-0">
          <main className="relative px-[21px] pt-[106px] text-[#353331]">
            <img
              src={weeLogo}
              alt="WEE"
              className="absolute left-[21px] top-[43px] h-[24px] w-auto"
              style={{
                filter:
                  "brightness(0) saturate(100%) invert(80%) sepia(28%) saturate(1492%) hue-rotate(154deg) brightness(101%) contrast(101%)",
              }}
            />
            <div className="flex flex-col gap-[18px]">
              <Card highlighted className="!rounded-[13px] !p-0">
                <button
                  type="button"
                  onClick={() =>
                    navigate("/login", { state: { from: "/mypage" } })
                  }
                  className={guestActionButtonClass}
                >
                  <span className="min-w-0">
                    <span className={guestActionTitleClass}>비회원</span>
                    <span className={guestActionDescriptionClass}>
                      로그인 / 회원가입 하러 가기
                    </span>
                  </span>
                  <img
                    src={chevronRightIcon}
                    alt=""
                    aria-hidden="true"
                    className="shrink-0"
                  />
                </button>
              </Card>

              <Card highlighted className="!rounded-[13px] !p-0">
                <button
                  type="button"
                  onClick={() => navigate("/premium")}
                  className={guestActionButtonClass}
                >
                  <span className="min-w-0">
                    <span className={guestActionTitleClass}>
                      프리미엄 구독하기
                    </span>
                    <span className={guestActionDescriptionClass}>
                      내 위치와 일정에 맞춰 필요한 순간에 알려드려요.
                    </span>
                  </span>
                  <img
                    src={diamondIcon}
                    alt=""
                    aria-hidden="true"
                    className="h-[24px] w-[25px] shrink-0"
                  />
                </button>
              </Card>
            </div>
          </main>
        </PageLayout>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout>
      <PageLayout className="!px-0">
        <main className="relative px-[21px] pt-[106px] text-[#353331]">
          <img
            src={weeLogo}
            alt="WEE"
            className="absolute left-[21px] top-[43px] h-[24px] w-auto"
            style={{
              filter:
                "brightness(0) saturate(100%) invert(80%) sepia(28%) saturate(1492%) hue-rotate(154deg) brightness(101%) contrast(101%)",
            }}
          />
          <div className="flex flex-col gap-[18px]">
            <Card highlighted className="!rounded-[13px] !p-0">
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
                    {profile?.region?.regionName ??
                      profile?.region?.shortName ??
                      "지역을 설정해주세요"}
                  </span>
                </span>
                <img src={chevronRightIcon} alt="" />
              </button>
            </Card>

            <Card className="relative !h-[56px] !rounded-[13px] !px-[16px] !py-[14px]">
              <ListRow
                onClick={
                  isPremium
                    ? () => navigate("/mypage/notifications")
                    : undefined
                }
                disabled={!isPremium}
                className={`${isPremium ? "text-[18px] leading-[21px] font-bold" : sectionHeadingClass} h-[22px]`}
              >
                알림 일정 관리
              </ListRow>
              {!isPremium && (
                <button
                  type="button"
                  disabled={isPremiumLoading || isBankTransferPending}
                  onClick={() => navigate("/premium/payment-method")}
                  aria-label="프리미엄 구독하기"
                  className="absolute inset-x-[14px] top-[7px] z-10 flex h-[39px] items-center justify-center gap-[8px] bg-[rgba(255,255,255,0.86)] backdrop-blur-[2px] disabled:cursor-default"
                >
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center">
                    <img src={lockIcon} alt="" />
                  </span>
                  <p className="whitespace-nowrap text-[14px] leading-[19px] text-[#797776]">
                    알림 구독 유저를 위한 기능이에요
                  </p>
                </button>
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
                <h2
                  className={`${isPremium ? "text-[18px] leading-[21px] font-bold" : sectionHeadingClass} flex h-[22px] items-center text-[#353331]`}
                >
                  내 활동
                </h2>
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
                    공감한 게시물
                  </ListRow>
                </div>
              </div>
            </Card>
          </div>
          <Button
            variant="white"
            onClick={logoutFromService}
            className="mt-[24px] h-[44px] border border-[#E9E8E8] text-[16px] text-[#797776]"
          >
            로그아웃
          </Button>
        </main>
      </PageLayout>
    </MobileLayout>
  );
}
