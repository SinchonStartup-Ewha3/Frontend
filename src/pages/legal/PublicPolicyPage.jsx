import { Link, useLocation } from "react-router-dom";
import MobileLayout from "../../components/MobileLayout";
import { LEGAL_DOCUMENTS, SUPPORT_EMAIL } from "../../constants/legalContent";
import weeLogo from "../../assets/icons/logo.svg";

const pages = {
  "/terms": LEGAL_DOCUMENTS.terms,
  "/privacy": LEGAL_DOCUMENTS.privacy,
  "/refund": LEGAL_DOCUMENTS.refund,
  "/contact": {
    eyebrow: "Contact",
    title: "고객지원",
    intro: "WEE 서비스, 결제 또는 개인정보 처리와 관련해 문의하실 수 있습니다.",
    sections: [
      ["이메일 문의", SUPPORT_EMAIL],
      ["결제 문의", "PayApp 결제 요청번호와 문의 내용을 함께 보내주시면 확인에 도움이 됩니다. 카드번호나 비밀번호는 이메일로 보내지 마세요."],
    ],
  },
};

const policyLinks = [
  ["이용약관", "/terms"],
  ["개인정보처리방침", "/privacy"],
  ["환불정책", "/refund"],
  ["문의", "/contact"],
];

export default function PublicPolicyPage() {
  const { pathname } = useLocation();
  const page = pages[pathname] ?? pages["/terms"];

  return (
    <MobileLayout className="!max-w-[402px]">
      <main className="mx-auto min-h-screen w-full max-w-[402px] bg-white px-6 pb-12 text-[#353331]">
        <header className="flex h-[118px] items-end pb-4">
          <Link to="/" aria-label="WEE 첫 페이지로 이동" className="inline-flex items-center">
            <img
              src={weeLogo}
              alt="WEE"
              className="h-[31px] w-auto"
              style={{ filter: "brightness(0) saturate(100%) invert(80%) sepia(28%) saturate(1492%) hue-rotate(154deg) brightness(101%) contrast(101%)" }}
            />
          </Link>
        </header>
        <article>
          <p className="text-[14px] font-medium leading-[1.53] tracking-[-0.42px] text-[#D2D2D1]">{page.eyebrow}</p>
          <h1 className="mt-[2px] text-[24px] font-semibold leading-[1.4] tracking-[-0.72px]">{page.title}</h1>
          <p className="mt-[10px] text-[14px] leading-[1.53] tracking-[-0.42px] text-[#A5A4A3]">{page.intro}</p>
          <div className="mt-[46px] space-y-[17px]">
            {page.sections.map(([heading, body]) => (
              <section key={heading} className="text-[14px] leading-[1.38] tracking-[-0.42px]">
                <h2 className="font-medium text-[#797776]">{heading}</h2>
                {pathname === "/contact" && heading === "이메일 문의" ? (
                  <a href={`mailto:${SUPPORT_EMAIL}`} className="mt-1 inline-block text-[#62605F] underline underline-offset-2">{body}</a>
                ) : (
                  <p className="whitespace-pre-line text-[#A5A4A3]">{body}</p>
                )}
              </section>
            ))}
          </div>
        </article>
        <nav aria-label="정책 및 고객지원" className="mt-12 flex flex-wrap gap-x-4 gap-y-2 border-t border-[#E9E8E8] pt-5 text-xs text-[#A5A4A3]">
          {policyLinks.map(([label, href]) => <Link key={href} to={href} className="underline underline-offset-2">{label}</Link>)}
        </nav>
      </main>
    </MobileLayout>
  );
}
