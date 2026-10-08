import Button from "../../components/Button";
import Header from "../../components/Header";
import MobileLayout from "../../components/MobileLayout";
import mapCharacter from "../../assets/images/map_character.svg";
import mapIcon from "../../assets/icons/map_icon.svg";
import { useNavigate } from "react-router-dom";

export default function LocationSetupPage() {
  const navigate = useNavigate();
  return (
    <MobileLayout>
    <main className="relative mx-auto min-h-[852px] w-full max-w-[402px] overflow-hidden bg-white text-[#353331]">
      <div className="absolute left-6 right-6 top-6 z-10">
        <Header back onLeft={() => navigate("/birth-info")} />
      </div>
      <div className="absolute left-1/2 top-[147px] h-[44px] w-[34px] -translate-x-1/2" aria-hidden="true">
        <img src={mapIcon} alt="" />
      </div>

      <h1 className="absolute left-0 right-0 top-[208px] text-center text-[30px] font-semibold leading-[1.4] tracking-[-0.9px]">
        현재 위치를 찾을까요?
      </h1>

      <p className="absolute left-0 right-0 top-[267px] text-center text-[18px] font-medium leading-[1.38] tracking-[-0.54px] text-[#a5a4a3]">
        정확한 날씨 정보를 위해<br />위치 접근이 필요해요
      </p>

      <div className="absolute left-1/2 top-[358px] h-[295px] w-[213px] -translate-x-1/2 overflow-hidden">
        <img
          src={mapCharacter}
          alt="위치 설정을 위한 WEE 캐릭터"
          className="absolute left-0 top-[-28.04%] h-[128.29%] w-full max-w-none"
        />
      </div>

      <div className="absolute left-6 top-[696px] w-[calc(100%-48px)] max-w-[345px]">
        <Button variant="primary" className="h-[44px] rounded-[10px] text-[18px] tracking-[-0.18px]">
          현재 위치로 찾기
        </Button>
      </div>
    </main>
    </MobileLayout>
  );
}


