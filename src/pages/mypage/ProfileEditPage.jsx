import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../../components/Button";
import ConfirmDialog from "../../components/ConfirmDialog";
import Avatar from "../../components/Avatar";
import FormField from "../../components/FormField";
import Header from "../../components/Header";
import LocationSearchSheet from "../../components/LocationSearchSheet";
import MobileLayout from "../../components/MobileLayout";
import PageLayout from "../../components/PageLayout";
import { useProfileQuery, useUpdateProfile, useWithdraw } from "../../hooks/useProfile";

export default function ProfileEditPage() {
  const navigate = useNavigate();
  const photoInputRef = useRef(null);
  const { data: profile } = useProfileQuery();
  const updateProfile = useUpdateProfile();
  const withdraw = useWithdraw();
  const [nickname, setNickname] = useState("김멋사");
  const [region, setRegion] = useState("서울특별시 서대문구");
  const [profileImage, setProfileImage] = useState("");
  const [showWithdrawDialog, setShowWithdrawDialog] = useState(false);
  const [showLocationSearch, setShowLocationSearch] = useState(false);

  useEffect(() => {
    if (!profile) return;
    setNickname(profile.nickname ?? "");
    setRegion(profile.region ?? "");
    setProfileImage(profile.profileImage ?? "");
  }, [profile]);

  const handlePhotoChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setProfileImage(String(reader.result ?? ""));
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    updateProfile.mutate(
      { nickname: nickname.trim(), region: region.trim(), profileImage },
      { onSuccess: () => navigate("/mypage") },
    );
  };

  const handleWithdraw = () => {
    withdraw.mutate(undefined, {
      onSuccess: () => {
        setShowWithdrawDialog(false);
        navigate("/", { replace: true });
      },
    });
  };

  return (
    <MobileLayout>
      <PageLayout nav={false} className="!px-0 !pb-0">
        <main className="px-6 pt-[73px] text-[#1F1C1A]">
          <Header back />

          <Avatar
            src={profileImage || undefined}
            size={147}
            editable
            onEdit={() => photoInputRef.current?.click()}
            className="mx-auto -mt-[4px]"
          />
          <div>
            <input
              ref={photoInputRef}
              type="file"
              accept="image/*"
              onChange={handlePhotoChange}
              className="hidden"
            />
          </div>

          <form
            className="mt-[25px] flex flex-col gap-[18px]"
            onSubmit={(event) => {
              event.preventDefault();
              handleSave();
            }}
          >
            <FormField
              label="ID"
              value={profile?.id ?? "likelion@daum.net"}
              readOnly
              className="!mb-0"
              labelClassName="!mb-[15px] !text-[18px] !leading-[22px]"
              inputClassName="!h-[60px] !rounded-[15px] !border-2 !px-6 !text-[16px] !font-semibold !text-[#1F1C1A]"
            />
            <FormField
              label="닉네임"
              value={nickname}
              onChange={(event) => setNickname(event.target.value)}
              maxLength={20}
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

            <div className="mt-[48px] space-y-[10px]">
              <Button type="submit" disabled={updateProfile.isPending}>
                {updateProfile.isPending ? "저장 중..." : "저장"}
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
          onSelect={setRegion}
        />
      </PageLayout>
    </MobileLayout>
  );
}
