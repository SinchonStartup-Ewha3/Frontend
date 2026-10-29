import { useState } from "react";
import Button from "../../components/Button";
import Header from "../../components/Header";
import MobileLayout from "../../components/MobileLayout";
import PageLayout from "../../components/PageLayout";
import logo from "../../assets/icons/logo.svg";

const Step = ({ number, title, description, children }) => (
  <section className="overflow-hidden rounded-[12px] bg-[#F4FAFF]">
    <div className="flex items-center gap-[10px] px-[14px] pb-[10px] pt-[14px]">
      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-[10px] bg-[#60E1FF] text-[12px] font-bold text-[#353331]">{number}</span>
      <div className="min-w-0">
        <h2 className="text-[13px] font-bold leading-[18px] text-[#363330]">{title}</h2>
        {description && <p className="mt-[2px] text-[11px] leading-[15px] text-[#6B6B6B]">{description}</p>}
      </div>
    </div>
    {children && <div className="px-3 pb-[14px]">{children}</div>}
  </section>
);

const BrowserMockup = ({ platform }) => (
  <div className="overflow-hidden rounded-[10px] border border-[#E0E0E0] bg-white">
    <div className="flex items-center gap-[6px] bg-[#F1F3F4] p-2">
      <span className="flex h-6 w-6 items-center justify-center rounded-md bg-[#E8EAED] text-[12px] text-[#5F6368]">‹</span>
      <span className="flex h-6 w-6 items-center justify-center rounded-md bg-[#E8EAED] text-[12px] text-[#5F6368]">›</span>
      <div className="flex h-8 min-w-0 flex-1 items-center gap-2 rounded-full border-2 border-[#60E1FF] bg-white px-3 text-[12px] text-[#202124]">
        <span className="text-[#34A853]">●</span><span className="truncate">weether.kr/home</span>
      </div>
      {platform === "android" && <span className="text-[18px] leading-none text-[#5F6368]">⋮</span>}
    </div>
    <div className="space-y-2 bg-[#FAFAFA] p-3">
      <div className="flex items-center gap-2">
        <img src={logo} alt="" className="h-8 w-8 rounded-lg bg-[#60E1FF] p-1" />
        <span className="text-[13px] font-bold text-[#363330]">위더</span>
      </div>
      <div className="rounded-lg border-2 border-[#60E1FF] bg-white p-[10px]">
        <p className="text-[11px] text-[#6B6B6B]">로그인하고 날씨 알림을 받아보세요</p>
        <div className="mt-2 rounded-md bg-[#60E1FF] py-2 text-center text-[12px] font-bold text-[#353331]">로그인</div>
      </div>
      <p className="text-right text-[10px] font-bold text-[#05758C]">{platform === "iphone" ? "Safari" : "Chrome"}에서 접속하세요 ↑</p>
    </div>
  </div>
);

const PermissionMockup = ({ platform }) => (
  <div className="rounded-[10px] bg-[#EAF9FC] p-3">
    <div className="rounded-[10px] border-2 border-[#60E1FF] bg-white p-3">
      <div className="flex items-center gap-2">
        <img src={logo} alt="" className="h-7 w-7 rounded-lg bg-[#60E1FF] p-1" />
        <span className="text-[13px] font-bold text-[#363330]">위더</span>
      </div>
      <p className="mt-3 text-[12px] text-[#6B6B6B]">위더에서 알림을 보내고 싶어요</p>
      <div className="mt-3 rounded-[10px] bg-[#D4F3FA] py-3 text-center text-[14px] font-bold text-[#60CFEA]">알림 받기</div>
    </div>
    <p className="mt-2 text-center text-[10px] font-bold text-[#05758C]">버튼을 눌러 {platform === "iphone" ? "허용" : "알림 허용"}을 선택하세요 ↓</p>
  </div>
);

export default function NotificationGuidePage({ onClose }) {
  const [platform, setPlatform] = useState(() =>
    typeof navigator !== "undefined" && /android/i.test(navigator.userAgent)
      ? "android"
      : "iphone",
  );
  const isIphone = platform === "iphone";

  return (
    <MobileLayout>
      <PageLayout nav={false} className="!px-0 !pb-0">
        <main className="min-h-screen px-6 pb-28 pt-[73px] text-[#353331]">
          <Header back onLeft={onClose} />
          <h1 className="mt-[15px] text-[26px] font-bold leading-[1.38] tracking-[-0.78px]">
            {isIphone ? "아이폰 알림 받기," : "갤럭시 알림 받기,"}<br />이렇게 설정하세요
          </h1>
          <p className="mt-3 text-[13px] leading-[1.55] text-[#A5A4A3]">
            {isIphone
              ? "홈 화면 웹 앱으로 실행해야 WEE 날씨 알림을 받을 수 있어요. Safari 탭에서만 접속한 상태로는 웹 푸시를 받을 수 없습니다."
              : "Chrome에서 WEE에 접속하면 알림을 받을 수 있어요. 홈 화면 설치 없이도 알림을 받을 수 있습니다."}
          </p>

          <div className="mt-8 grid grid-cols-2 border-b border-[#E9E8E8]">
            {[["iphone", "iPhone"], ["android", "Android"]].map(([value, label]) => (
              <button key={value} type="button" onClick={() => setPlatform(value)} aria-pressed={platform === value}
                className={`relative h-10 text-[14px] ${platform === value ? "font-bold text-[#05758C]" : "text-[#6B6B6B]"}`}>
                {label}
                {platform === value && <span className="absolute bottom-0 left-1/2 h-[2px] w-[60px] -translate-x-1/2 bg-[#60E1FF]" />}
              </button>
            ))}
          </div>

          {isIphone ? (
            <div className="mt-[14px] space-y-3">
              <Step number="1" title="Safari에서 WEE 접속" description="weether.kr/home · iOS 16.4 이상 필요">
                <BrowserMockup platform="iphone" />
              </Step>
              <Step number="2" title="공유 버튼 → ‘홈 화면에 추가’ 선택" description="추가 화면에서 ‘웹 앱으로 열기’ 옵션이 보이면 켜주세요.">
                <div className="rounded-[10px] bg-[#EAF9FC] p-3 text-center text-[13px] font-medium text-[#05758C]">Safari 공유 메뉴　›　홈 화면에 추가　›　추가</div>
              </Step>
              <Step number="3" title="홈 화면의 WEE 아이콘 실행" description="Safari 탭이 아닌 홈 화면에 추가된 아이콘으로 열어주세요.">
                <div className="flex items-center justify-center gap-3 rounded-[12px] bg-[#D6F2FA] p-4">
                  <img src={logo} alt="WEE 앱 아이콘" className="h-[52px] w-[52px] rounded-xl bg-[#60E1FF] p-2 shadow-md" />
                  <span className="text-[12px] font-bold">WEE</span>
                </div>
              </Step>
              <Step number="4" title="앱 안의 ‘알림 받기’ 버튼 누르기" description="알림 권한 요청은 버튼을 직접 눌러 시작해야 해요.">
                <PermissionMockup platform="iphone" />
              </Step>
              <Step number="5" title="iPhone 권한 창에서 ‘허용’ 선택" description="알림을 허용해야 날씨 알림을 받을 수 있어요.">
                <div className="rounded-[14px] bg-white p-4 text-center shadow-[0_2px_8px_rgba(0,0,0,0.1)]">
                  <p className="text-[14px] font-bold">Weether에서 알림을 보내려고 합니다</p>
                  <div className="mt-4 flex border-t border-[#E5E5EA] pt-3 text-[13px]"><span className="flex-1 text-[#6B6B6B]">허용 안 함</span><span className="flex-1 font-bold text-[#05758C]">허용</span></div>
                </div>
              </Step>
              <p className="rounded-[10px] border border-[#E0E0E0] bg-[#F5F5F5] px-3 py-2 text-[11px] text-[#8F8E8D]">ℹ️ 화면 예시는 iOS 버전과 기기에 따라 다를 수 있습니다.</p>
              <div className="rounded-[10px] border border-[#F0E0B0] bg-[#FFF9EC] px-3 py-2 text-[11px] leading-5 text-[#7A5C00]">
                <strong className="block">알림이 안 오거나 거부했다면</strong>
                설정 → 알림 → Weether에서 알림 허용 여부를 확인해 주세요. 집중 모드도 확인해 보세요.
              </div>
            </div>
          ) : (
            <div className="mt-[14px] space-y-3">
              <Step number="1" title="Chrome 앱으로 WEE 접속 후 로그인" description="Chrome 앱에서 weether.kr/home을 열어 로그인하세요.">
                <BrowserMockup platform="android" />
              </Step>
              <Step number="2" title="WEE의 ‘알림 받기’ 버튼 선택" description="서비스 내 알림 받기를 누른 뒤 Chrome 안내에서 허용을 선택하세요.">
                <PermissionMockup platform="android" />
              </Step>
              <Step number="3" title="Chrome 알림 권한에서 허용 선택" description="사이트별 권한과 Android 앱 알림 권한이 모두 허용되어야 합니다.">
                <div className="rounded-[10px] border border-[#E0E0E0] bg-white p-3">
                  <p className="text-[12px] font-bold">weether.kr 알림을 보내도 됩니까?</p>
                  <div className="mt-3 flex justify-end gap-2 text-[12px]"><span className="rounded-lg border px-4 py-2 text-[#5F6368]">차단</span><span className="rounded-lg bg-[#60E1FF] px-4 py-2 font-bold text-[#353331]">허용</span></div>
                </div>
              </Step>
              <div className="rounded-[10px] border border-[#60E1FF] bg-[#E8F8FB] px-3 py-2 text-[12px] font-bold text-[#05758C]">✓ 홈 화면 설치는 필수가 아니에요</div>
              <section className="rounded-[12px] bg-[#F9F9F9] p-3">
                <h2 className="text-[13px] font-bold">알림이 안 오면 확인해 보세요</h2>
                <div className="mt-3 space-y-3 text-[11px] leading-5 text-[#6B6B6B]">
                  <p><strong className="block text-[#363330]">① Chrome 사이트 권한</strong>Chrome에서 weether.kr 열기 → 주소창 왼쪽 사이트 정보 아이콘 → 권한 → 알림 → 허용</p>
                  <p><strong className="block text-[#363330]">② Android 앱 알림</strong>설정 → 알림 → 앱 알림 → Chrome → 알림 허용 (기기별 메뉴 이름은 다를 수 있어요.)</p>
                  <p><strong className="block text-[#363330]">③ 방해 금지·절전 확인</strong>방해 금지 모드는 알림을 무음 처리할 수 있어요. 절전이나 백그라운드 제한은 알림을 늦추거나 제한할 수 있습니다.</p>
                  <p><strong className="block text-[#363330]">갤럭시 절전 예외</strong>설정 → 배터리 → 백그라운드 사용 제한 → 절전 예외 앱에 Chrome을 추가해 보세요. 경로는 One UI 버전에 따라 다를 수 있어요.</p>
                </div>
              </section>
            </div>
          )}
        </main>
        <div className="fixed bottom-0 left-1/2 z-20 w-full max-w-[390px] -translate-x-1/2 bg-white px-6 pb-[max(16px,env(safe-area-inset-bottom))] pt-3">
          <Button onClick={onClose} className="h-[44px] !rounded-[10px] !text-[16px]">알림 설정으로 돌아가기</Button>
        </div>
      </PageLayout>
    </MobileLayout>
  );
}
