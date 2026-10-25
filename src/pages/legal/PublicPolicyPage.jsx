import { Link, useLocation } from "react-router-dom";
import MobileLayout from "../../components/MobileLayout";
import { LEGAL_DOCUMENTS, SUPPORT_EMAIL } from "../../constants/legalContent";

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
      ["결제 문의", "Paddle 영수증의 거래 번호와 문의 내용을 함께 보내주시면 확인에 도움이 됩니다. 카드 전체 번호나 비밀번호는 이메일로 보내지 마세요."],
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
    <MobileLayout>
      <main className="mx-auto min-h-screen w-full max-w-[402px] bg-white px-6 pb-8 text-[#353331]">
        <div className="flex h-[72px] items-center justify-between">
          <Link to="/" className="text-lg font-bold">WEE</Link>
          <Link to="/premium" className="text-sm text-[#797776]">WEE Premium</Link>
        </div>
        <article className="pt-5">
          <h1 className="text-[26px] font-bold leading-[1.4] tracking-[-0.78px]">{page.title}</h1>
          <p className="mt-4 text-sm leading-6 text-[#797776]">{page.intro}</p>
          <div className="mt-8 space-y-7">
            {page.sections.map(([heading, body]) => (
              <section key={heading}>
                <h2 className="text-base font-semibold">{heading}</h2>
                {pathname === "/contact" && heading === "이메일 문의" ? (
                  <a href={`mailto:${SUPPORT_EMAIL}`} className="mt-2 inline-block text-sm text-[#238AA3] underline underline-offset-2">{body}</a>
                ) : (
                  <p className="mt-2 whitespace-pre-line text-sm leading-6 text-[#62605F]">{body}</p>
                )}
              </section>
            ))}
          </div>
        </article>
        <nav aria-label="정책 및 고객지원" className="mt-12 flex flex-wrap gap-x-4 gap-y-2 border-t border-[#E9E8E8] pt-5 text-xs text-[#797776]">
          {policyLinks.map(([label, href]) => <Link key={href} to={href} className="underline underline-offset-2">{label}</Link>)}
        </nav>
      </main>
    </MobileLayout>
  );
}
