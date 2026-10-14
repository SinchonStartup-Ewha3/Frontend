import MobileLayout from "../../components/MobileLayout";
import loadingCloud from "../../assets/images/fortune/loading_cloud.png";
import sleepingCharacter from "../../assets/images/fortune/loading_sleeping_character.png";
import loadingDots from "../../assets/icons/loading-dots.svg";

export default function WeatherFortuneLoadingPage() {
  return (
    <MobileLayout>
      <main
        className="relative mx-auto min-h-[852px] w-full max-w-[390px] overflow-hidden text-[#353331]"
        style={{
          backgroundImage:
            "linear-gradient(158.32deg, #fff 3.3%, #f9f4fe 24.56%, #dcf4fc 67.5%, #fff 99.09%)",
        }}
      >
        <h1 className="absolute left-0 right-0 top-[145px] text-center text-[30px] font-semibold leading-[1.4] tracking-[-0.9px]">
          사주를 분석하고 있어요!
        </h1>
        <p className="absolute left-0 right-0 top-[207px] text-center text-[18px] font-medium leading-[1.5] tracking-[-0.54px] text-[#BCBBBA]">
          조금만 기다려주시면 테루테루 보즈가
          <br />
          특별한 사주를 말해줄 거예요
        </p>

        <img
          src={loadingCloud}
          alt=""
          aria-hidden="true"
          style={{ top: 363, left: "50%", width: 280, height: 187, transform: "translateX(-50%)" }}
          className="absolute max-w-none object-contain"
        />
        <img
          src={sleepingCharacter}
          alt="구름 위에서 잠든 테루테루 보즈"
          style={{ top: 323, left: "50%", width: 304, height: 160, transform: "translateX(-50%)" }}
          className="absolute max-w-none object-contain"
        />
        <img
          src={loadingDots}
          alt="분석 중"
          style={{ top: 585, left: "50%", width: 48, height: 48, transform: "translateX(-50%)" }}
          className="absolute animate-pulse"
        />
      </main>
    </MobileLayout>
  );
}
