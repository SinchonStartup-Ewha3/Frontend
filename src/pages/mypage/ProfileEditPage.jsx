import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import Button from "../../components/Button";
import ConfirmDialog from "../../components/ConfirmDialog";
import Avatar from "../../components/Avatar";
import FormField from "../../components/FormField";
import Header from "../../components/Header";
import LocationSearchSheet from "../../components/LocationSearchSheet";
import MobileLayout from "../../components/MobileLayout";
import PageLayout from "../../components/PageLayout";
import useToast from "../../hooks/useToast";
import { searchRegions, updateUserLocation } from "../../api/location";
import queryKeys from "../../api/queryKeys";
import useUserStore from "../../store/useUserStore";
import {
  useProfileQuery,
  useUpdateNickname,
  useUploadProfileImage,
  useWithdraw,
} from "../../hooks/useProfile";

export default function ProfileEditPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const setUser = useUserStore((state) => state.setUser);
  const photoInputRef = useRef(null);
  const { data: profile } = useProfileQuery();
  const updateNickname = useUpdateNickname();
  const uploadImage = useUploadProfileImage();
  const withdraw = useWithdraw();
  const toast = useToast();
  const [nickname, setNickname] = useState("김멋사");
  const [region, setRegion] = useState("서울특별시 서대문구");
  const [profileImage, setProfileImage] = useState("");
  const [showWithdrawDialog, setShowWithdrawDialog] = useState(false);
  const [showLocationSearch, setShowLocationSearch] = useState(false);

  useEffect(() => {
    if (!profile) return;
    setNickname(profile.nickname ?? "");
    setRegion(profile.region?.regionName ?? profile.region?.shortName ?? profile.region ?? "");
    setProfileImage(profile.profileImage ?? "");
  }, [profile]);

  const handlePhotoChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      toast.error("JPG, PNG, WEBP 이미지만 등록할 수 있어요.");
      event.target.value = "";
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("이미지 크기는 5MB 이하여야 해요.");
      event.target.value = "";
      return;
    }

    uploadImage.mutate(file, {
      onSuccess: (user) => {
        setProfileImage(user.profileImage ?? "");
        toast.success("프로필 사진을 변경했어요.");
      },
      onError: (error) => {
        const message = error.response?.data?.profileImage?.[0];
        toast.error(message ?? "프로필 사진을 변경하지 못했어요.");
      },
    });
    event.target.value = "";
  };

  const handleSave = () => {
    const normalizedNickname = nickname.trim();
    if (Array.from(normalizedNickname).length < 1 || Array.from(normalizedNickname).length > 10) {
      toast.error("닉네임은 1~10자로 입력해주세요.");
      return;
    }
    updateNickname.mutate(normalizedNickname, {
      onSuccess: () => navigate("/mypage"),
      onError: (error) => {
        toast.error(
          error.response?.data?.nickname?.[0] ??
            "닉네임을 변경하지 못했어요. 잠시 후 다시 시도해주세요.",
        );
      },
    });
  };

  const handleLocationSelect = async (regionName, selection = {}) => {
    setRegion(regionName);
    if (selection.locationMode === "GPS") {
      // LocationSearchSheet already sends GPS coordinates and saves the region.
      await queryClient.invalidateQueries({ queryKey: queryKeys.profile });
      return;
    }

    try {
      let selectedRegion = selection.region;
      if (!selectedRegion?.regionCode) {
        const candidates = await searchRegions(regionName);
        const normalizedName = regionName.replace(/\s+/g, "");
        selectedRegion = candidates.find(
          (candidate) =>
            candidate.regionName.replace(/\s+/g, "") === normalizedName ||
            candidate.shortName.replace(/\s+/g, "") === normalizedName,
        ) ?? candidates[0];
      }
      if (!selectedRegion?.regionCode) {
        setRegion(profile?.region?.regionName ?? profile?.region?.shortName ?? "");
        toast.error("지역을 찾지 못했어요. 검색해서 다시 선택해 주세요.");
        return;
      }

      const user = await updateUserLocation({
        locationMode: "MANUAL",
        regionCode: selectedRegion.regionCode,
      });
      setUser(user);
      queryClient.setQueryData(queryKeys.profile, user);
      setRegion(user.region?.regionName ?? user.region?.shortName ?? regionName);
      toast.success("지역을 변경했어요.");
    } catch (error) {
      setRegion(profile?.region?.regionName ?? profile?.region?.shortName ?? "");
      toast.error(
        error.response?.data?.regionCode?.[0] ??
          error.response?.data?.location?.[0] ??
          "지역을 변경하지 못했어요. 다시 시도해 주세요.",
      );
      queryClient.invalidateQueries({ queryKey: queryKeys.profile });
    }
  };

  const handleWithdraw = () => {
    withdraw.mutate(undefined, {
      onSuccess: () => {
        setShowWithdrawDialog(false);
        navigate("/login", { replace: true });
      },
      onError: () => toast.error("회원 탈퇴를 완료하지 못했어요. 잠시 후 다시 시도해주세요."),
    });
  };

  return (
    <MobileLayout className="!max-w-[402px]">
      <PageLayout nav={false} className="!px-0 !pb-0">
        <main className="px-6 pt-[73px] text-[#1F1C1A]">
          <Header back />

          <Avatar
            src={profileImage || undefined}
            size={147}
            editable
            onEdit={() => {
              if (!uploadImage.isPending) {
                photoInputRef.current?.click();
              }
            }}
            className="mx-auto -mt-[4px]"
          />
          <input
            ref={photoInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handlePhotoChange}
            className="hidden"
          />

          <form
            className="mt-[25px] flex w-[345px] max-w-full flex-col gap-[20px]"
            onSubmit={(event) => {
              event.preventDefault();
              handleSave();
            }}
          >
            <FormField
              label={(
                <>
                  로그인 계정 <span className="text-[16px] text-[#797776]">(수정 불가)</span>
                </>
              )}
              value={
                profile?.loginAccount
                  ? profile.loginAccount.displayId ??
                    profile.loginAccount.email ??
                    profile.email ??
                    "카카오 계정"
                  : profile?.email ?? "카카오 계정"
              }
              readOnly
              className="!mb-0"
              labelClassName="!mb-[15px] !text-[18px] !leading-[22px]"
              inputClassName="!h-[60px] !rounded-[15px] !border-2 !px-6 !text-[16px] !font-semibold !text-[#1F1C1A]"
            />
            <FormField
              label="닉네임"
              value={nickname}
              onChange={(event) => setNickname(event.target.value.slice(0, 10))}
              maxLength={10}
              className="!mb-0"
              labelClassName="!mb-[15px] !text-[18px] !leading-[22px]"
              inputClassName="!h-[60px] !rounded-[15px] !border-2 !px-6 !text-[16px] !font-semibold !text-[#1F1C1A]"
            />
            <FormField
              label="지역 설정"
              value={region}
              readOnly
              onClick={() => setShowLocationSearch(true)}
              className="!mb-0"
              labelClassName="!mb-[15px] !text-[18px] !leading-[22px]"
              inputClassName="!h-[60px] !cursor-pointer !rounded-[15px] !border-2 !px-6 !text-[16px] !font-semibold !text-[#1F1C1A]"
            />

            <div className="mt-[47px] space-y-[10px]">
              <Button type="submit" disabled={updateNickname.isPending || uploadImage.isPending}>
                {uploadImage.isPending
                  ? "사진 업로드 중..."
                  : updateNickname.isPending
                    ? "저장 중..."
                    : "저장"}
              </Button>
              <Button
                variant="ghost"
                onClick={() => setShowWithdrawDialog(true)}
                disabled={withdraw.isPending}
              >
                회원 탈퇴
              </Button>
            </div>
          </form>
        </main>
        <ConfirmDialog
          isOpen={showWithdrawDialog}
          variant="withdraw"
          loading={withdraw.isPending}
          onCancel={() => setShowWithdrawDialog(false)}
          onConfirm={handleWithdraw}
        />
        <LocationSearchSheet
          isOpen={showLocationSearch}
          onClose={() => setShowLocationSearch(false)}
          selected={region}
          onSelect={handleLocationSelect}
        />
      </PageLayout>
    </MobileLayout>
  );
}
