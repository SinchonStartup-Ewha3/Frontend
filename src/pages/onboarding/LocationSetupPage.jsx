import Button from "../../components/Button";
import mapCharacter from "../../assets/images/map_character.svg";
import mapIcon from "../../assets/icons/map_icon.svg";
import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import {useCurrentRegion} from "../../hooks/useLocation";
import useLocationStore from "../../store/useLocationStore";
import useUserStore from "../../store/useUserStore";
import LocationSearchSheet from "../../components/LocationSearchSheet";
import { searchRegions, updateUserLocation } from "../../api/location";
import queryKeys from "../../api/queryKeys";

export default function LocationSetupPage() {
  const navigate = useNavigate();
  const routeLocation = useLocation();
  const returnPath = routeLocation.state?.from;
  const finishLocationSetup = () => navigate(
    typeof returnPath === "string" && returnPath.startsWith("/") && !returnPath.startsWith("//")
      ? returnPath
      : "/home",
    { replace: true },
  );
  const queryClient = useQueryClient();
  const { locate, loading, error } = useCurrentRegion();
  const selectRegion = useLocationStore((state) => state.selectRegion);
  const setCoordinates = useLocationStore((state) => state.setCoordinates);
  const setUser = useUserStore((state) => state.setUser);
  const [isRegionSearchOpen, setIsRegionSearchOpen] = useState(false);
  const [manualError, setManualError] = useState(null);

  const handleFindLocation = async () => {
    setManualError(null);
    if (!localStorage.getItem("wee_access_token")) {
      try {
        const position = await new Promise((resolve, reject) =>
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: false,
            timeout: 8000,
            maximumAge: 60_000,
          }),
        );
        setCoordinates({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        finishLocationSetup();
      } catch (locationError) {
        setManualError(locationError.code === 1
          ? "위치 권한을 허용한 뒤 다시 시도해 주세요."
          : locationError.code === 3
            ? "위치를 가져오는 데 너무 오래 걸려요. 다시 시도해 주세요."
            : "현재 위치를 찾지 못했어요. 다시 시도해 주세요.");
      }
      return;
    }
    const region = await locate();

    if(!region) return;

    selectRegion(region);
    finishLocationSetup();
  }

  const handleRegionSelect = async (_regionName, selection) => {
    if (!["MANUAL", "RECENT"].includes(selection.locationMode)) return;
    setManualError(null);
    try {
      let region = selection.region;
      if (!region?.regionCode) {
        const candidates = await searchRegions(_regionName);
        const normalizedName = _regionName.replace(/\s+/g, "");
        region = candidates.find(
          (candidate) =>
            candidate.regionName.replace(/\s+/g, "") === normalizedName ||
            candidate.shortName.replace(/\s+/g, "") === normalizedName,
        ) ?? candidates[0];
      }
      if (!region?.regionCode) {
        setManualError("지역을 찾지 못했어요. 검색해서 다시 선택해 주세요.");
        return;
      }
      if (!localStorage.getItem("wee_access_token")) {
        selectRegion(region);
        finishLocationSetup();
        return;
      }
      const user = await updateUserLocation({
        locationMode: "MANUAL",
        regionCode: region.regionCode,
      });
      setUser(user);
      queryClient.setQueryData(queryKeys.profile, user);
      finishLocationSetup();
    } catch (requestError) {
      setManualError(
        requestError.response?.data?.regionCode?.[0] ??
          requestError.response?.data?.location?.[0] ??
          "지역을 설정하지 못했어요. 다시 시도해 주세요",
      );
    }
  };

  return (
    <main className="relative mx-auto min-h-[852px] w-full max-w-[402px] overflow-hidden bg-white text-[#353331]">
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
        <Button variant="primary" className="h-[44px] rounded-[10px] text-[18px] tracking-[-0.18px]"
          onClick={handleFindLocation}
          disabled={loading}
          >
          {loading ? "위치 확인 중...": "현재 위치로 찾기"}
        </Button>

        {(manualError || error) && (
          <p role="alert" className="mt-3 text-center text-sm text-red-500">
            {manualError || error}
          </p>
        )}
        <button
          type="button"
          onClick={() => setIsRegionSearchOpen(true)}
          className="mt-3 w-full text-center text-sm font-medium text-[#797776] underline underline-offset-2"
        >
          지역을 직접 선택할게요
        </button>
      </div>
      <LocationSearchSheet
        isOpen={isRegionSearchOpen}
        onClose={() => setIsRegionSearchOpen(false)}
        onSelect={handleRegionSelect}
      />
    </main>
  );
}


