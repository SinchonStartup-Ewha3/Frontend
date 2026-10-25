import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Button from "../../components/Button";
import Header from "../../components/Header";
import MobileLayout from "../../components/MobileLayout";

const policies = [
  {
    eyebrow: "Terms of Service",
    title: "WEE 서비스 이용약관",
    intro: "본 이용약관은 WEE가 제공하는 날씨 기반 생활정보, 개인화 알림, 디지털 콘텐츠 및 관련 서비스 이용에 적용됩니다.",
    sections: [
      ["1. 서비스 소개", "WEE는 지역별 날씨, 생활정보, 상황별 날씨정보, 맞춤형 행동 알림, 커뮤니티, 운세·행운 콘텐츠 및 Premium 기능을 제공합니다."],
      ["2. 계정", "일부 기능은 카카오 로그인 등을 통해 이용할 수 있으며, 사용자는 자신의 계정과 계정에서 발생하는 활동을 관리할 책임이 있습니다."],
      ["3. 유료 서비스", "유료 상품은 Paddle을 통해 결제될 수 있으며, Paddle은 결제·세금·영수증·환불 관련 업무를 처리할 수 있습니다."],
      ["4. 정기 구독", "WEE Premium은 정기 결제 방식으로 제공될 수 있으며 사용자는 다음 갱신 전에 구독을 해지할 수 있습니다."],
      ["5. 운세 콘텐츠", "운세 및 행운 콘텐츠는 엔터테인먼트 목적의 디지털 콘텐츠이며 중요한 의사결정이나 전문적 판단을 대신하지 않습니다."],
      ["6. 날씨정보", "실제 기상 상황과 차이가 발생할 수 있으며, 사용자는 실제 상황을 함께 확인해야 합니다."],
    ],
  },
  {
    eyebrow: "Refund Policy",
    title: "WEE 환불 정책",
    intro: "구매일로부터 30일 이내\n환불 요청은 결제 상태와 콘텐츠 이용 여부를 확인한 후 처리됩니다.",
    sections: [
      ["1. 결제 처리", "WEE의 유료 상품 결제는 Paddle을 통해 처리될 수 있으며 Paddle은 Merchant of Record 역할을 합니다."],
      ["2. 환불 가능한 경우", "중복 결제, 기능 또는 콘텐츠 미제공, 기술적 문제, 관련 법령에 따라 환불이 필요한 경우 환불을 요청할 수 있습니다."],
      ["3. 디지털 콘텐츠", "운세·행운 콘텐츠처럼 구매 즉시 제공되는 콘텐츠는 이용이 완료된 경우 환불이 제한될 수 있습니다."],
      ["4. 구독 해지", "구독은 다음 결제 전에 해지할 수 있으며, 이미 결제된 기간은 종료일까지 이용할 수 있습니다."],
      ["5. 환불 요청", "Paddle 결제 확인 이메일 또는 결제 관리 페이지를 통해 요청할 수 있으며, 필요한 경우 WEE 고객지원에서도 문의를 접수합니다."],
    ],
  },
  {
    eyebrow: "Privacy Policy",
    title: "WEE 개인정보 처리 방침",
    intro: "개인정보는 WEE 서비스 제공과 개선을 위해 필요한 범위에서 처리됩니다.",
    sections: [
      ["1. 수집하는 정보", "계정 식별정보, 닉네임, 위치 및 지역 설정, 알림 일정, 생활 패턴, 생년월일·출생시간·양력/음력 정보, 커뮤니티 게시물 등이 서비스 이용 과정에서 처리될 수 있습니다."],
      ["2. 이용 목적", "로그인, 지역별 날씨정보 제공, 개인화 생활정보와 행동 알림, 운세 콘텐츠, 커뮤니티 운영, 고객지원, 결제 및 서비스 개선을 위해 이용합니다."],
      ["3. 위치정보", "위치 기반 날씨 제공을 위해 위치정보를 사용할 수 있으며, 사용자는 위치 권한 없이 직접 지역을 검색해 이용할 수도 있습니다."],
      ["4. 결제정보", "Paddle이 결제, 세금, 영수증, 환불 및 부정 결제 방지를 위한 정보를 처리할 수 있으며 WEE는 전체 카드번호를 직접 저장하지 않습니다."],
      ["5. 보관 및 삭제", "수집 목적 달성 또는 회원 탈퇴 시 삭제를 원칙으로 하며, 법령상 보존 의무가 있는 정보는 필요한 기간 동안 보관할 수 있습니다."],
      ["6. 사용자의 권리", "사용자는 개인정보의 열람·수정·삭제·회원탈퇴를 요청할 수 있으며 위치 및 알림 권한을 기기 설정에서 변경할 수 있습니다."],
    ],
  },
];

export default function ConsentPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [step, setStep] = useState(0);
  const policy = policies[step];

  const handleContinue = () => {
    if (step < policies.length - 1) {
      setStep((current) => current + 1);
      window.scrollTo(0, 0);
      return;
    }

    if (location.state?.intent === "kakao") {
      navigate("/login", {
        replace: true,
        state: { consentComplete: true, from: location.state.from },
      });
      return;
    }

    navigate("/home", { replace: true });
  };

  return (
    <MobileLayout>
      <main className="relative mx-auto flex min-h-[100dvh] w-full max-w-[402px] flex-col bg-white px-6 pb-10 text-[#353331]">
        <div className="absolute left-5 right-5 top-[73px]">
          <Header back onLeft={() => step > 0 ? setStep((current) => current - 1) : navigate(-1)} />
        </div>
        <div className="mt-[140px] text-[14px] font-medium leading-[1.53] tracking-[-0.42px] text-[#D2D2D1]">{policy.eyebrow}</div>
        <h1 className="mt-[10px] text-[24px] font-semibold leading-[1.4] tracking-[-0.72px]">{policy.title}</h1>
        <p className="mt-[18px] whitespace-pre-line text-[14px] font-medium leading-[1.55] tracking-[-0.42px] text-[#8F8E8D]">{policy.intro}</p>
        <div className="mt-[38px] space-y-5 pb-8 text-[14px] leading-[1.38] tracking-[-0.42px] text-[#A5A4A3]">
          {policy.sections.map(([heading, body]) => (
            <section key={heading}>
              <h2 className="mb-1 font-medium text-[#797776]">{heading}</h2>
              <p>{body}</p>
            </section>
          ))}
        </div>
        <div className="mt-auto pt-5">
          <Button className="h-[44px] rounded-[10px] text-[18px] tracking-[-0.18px]" onClick={handleContinue}>
            확인했습니다
          </Button>
          <p className="mt-3 text-center text-[13px] text-[#A5A4A3]">{step + 1} / {policies.length}</p>
        </div>
      </main>
    </MobileLayout>
  );
}
