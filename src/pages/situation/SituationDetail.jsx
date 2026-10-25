import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import BottomNav from "../../components/BottomNav";
import BottomSheet from "../../components/BottomSheet";
import Button from "../../components/Button";
import Card from "../../components/Card";
import Chip from "../../components/Chip";
import Header from "../../components/Header";
import LoginRequiredModal from "../../components/LoginRequiredModal";
import MobileLayout from "../../components/MobileLayout";
import {
  useAddHydrationRecord,
  useDeleteHydrationRecord,
  useHydrationQuery,
  useSituationLocation,
} from "../../hooks/useSituation";
import { getErrorMessage } from "../../utils/situation";
import raindropCharacter from "../../assets/images/raindrop_character.svg";
import skincareCharacter from "../../assets/images/skincare_character.svg";
import waterWaveBack from "../../assets/images/water-record-wave-back.svg";
import waterWaveFront from "../../assets/images/water-record-wave-front.svg";

const categories = ["수분", "빨래", "러닝"];

const pad = (value) => String(value).padStart(2, "0");
// Date -> "14:47"
const formatTime = (date) =>
  `${pad(date.getHours())}:${pad(date.getMinutes())}`;
// "14:47" -> 840 + 47 (하루 중 몇 분째인지)
const toMinutes = (hhmm) => {
  const [hour, minute] = hhmm.split(":").map(Number);
  return hour * 60 + minute;
};
// 분 -> "HH:MM"
const fromMinutes = (total) =>
  `${pad(Math.floor(total / 60))}:${pad(total % 60)}`;
// "14:47" -> "14:30" (서버는 분이 00 또는 30인 시각만 받으니까)
const floorToHalfHour = (hhmm) => {
  const [hour, minute] = hhmm.split(":").map(Number);
  return `${pad(hour)}:${minute >= 30 ? "30" : "00"}`;
};
// 기록량: 직접 입력은 10~1000ml(서버 허용 범위), 10ml 단위로 맞춰줌
// 버튼(−/+)은 100~300ml 범위 안에서만 움직여요
const normalizeRecordAmount = (value) => {
  const amount = Number(value);
  if (!Number.isFinite(amount)) return 100;
  return Math.min(1000, Math.max(10, Math.round(amount / 10) * 10));
};

const SituationDetail = () => {
  const navigate = useNavigate();
  // 수분 기록은 계정에 저장되기 때문에 로그인 사용자만 쓸 수 있어요 (비로그인은 요청 안 함)
  const { isLoggedIn } = useSituationLocation();
  // 서버 데이터 (수분 현황 조회 / 기록 추가 / 기록 삭제)
  const { data, error, isLoading, isError, refetch } = useHydrationQuery();
  const addMutation = useAddHydrationRecord();
  const deleteMutation = useDeleteHydrationRecord();

  const [isEditing, setIsEditing] = useState(false);
  const [recordAmountInput, setRecordAmountInput] = useState("180");
  const [recordTime, setRecordTime] = useState(() =>
    floorToHalfHour(formatTime(new Date())),
  );
  const [currentTime, setCurrentTime] = useState(() => formatTime(new Date()));
  // 이 화면에서 방금 추가한 기록의 recordId 들 ("추가 취소" 버튼용)
  const [addedRecordIds, setAddedRecordIds] = useState([]);
  const [sheetError, setSheetError] = useState("");
  const [isLoginPromptOpen, setIsLoginPromptOpen] = useState(false);

  // 서버 응답 값 (아직 없으면 기본값)
  const records = data?.records ?? [];
  const recommendedMl = data?.recommendedMl ?? 1500;
  const waterAmount = data?.currentMl ?? 0;
  const progress = Math.min(
    100,
    Math.max(
      0,
      Math.round(data?.percent ?? (waterAmount / recommendedMl) * 100),
    ),
  );

  // 시간별 그래프: 막대 0번이 1시, 23번이 24시(=0시) 구간
  const hourlyAmountMap = {};
  (data?.hourly ?? []).forEach((item) => {
    hourlyAmountMap[item.hour] = item.amountMl;
  });
  const hourlyRecords = Array.from(
    { length: 24 },
    (_, index) => hourlyAmountMap[(index + 1) % 24] ?? 0,
  );

  // 기록 시각은 "지금 이전(30분 단위)"까지만 선택 가능
  const maxRecordTime = floorToHalfHour(currentTime);
  const safeRecordTime =
    recordTime > maxRecordTime ? maxRecordTime : recordTime;
  const recordAmount = normalizeRecordAmount(recordAmountInput);

  // 아직 화면에 남아 있는, 가장 최근에 추가한 기록
  const cancelableRecordId = [...addedRecordIds]
    .reverse()
    .find((id) => records.some((record) => record.recordId === id));

  useEffect(() => {
    const updateTime = () => setCurrentTime(formatTime(new Date()));
    const interval = window.setInterval(updateTime, 60_000);
    return () => window.clearInterval(interval);
  }, []);

  // 시트를 열 때마다 지금 시각 기준으로 초기화
  const openSheet = () => {
    // 비로그인이면 기록 시트 대신 로그인 안내 모달을 보여줌
    if (!isLoggedIn) {
      setIsLoginPromptOpen(true);
      return;
    }
    const now = formatTime(new Date());
    setCurrentTime(now);
    setRecordTime(floorToHalfHour(now));
    setSheetError("");
    setIsEditing(true);
  };

  const closeSheet = () => {
    setSheetError("");
    setIsEditing(false);
  };

  // 기록 시각을 30분씩 이동 (00:00 ~ 지금 사이로 제한)
  const changeRecordTime = (halfHourDelta) => {
    const next = toMinutes(safeRecordTime) + halfHourDelta * 30;
    const clamped = Math.min(toMinutes(maxRecordTime), Math.max(0, next));
    setRecordTime(fromMinutes(clamped));
  };

  // "추가하기" -> POST /api/situations/hydration/records/
  const addRecord = () => {
    if (!data || addMutation.isPending) return;
    setSheetError("");
    setRecordAmountInput(String(recordAmount));
    const previousIds = new Set(records.map((record) => record.recordId));
    addMutation.mutate(
      { time: safeRecordTime, amountMl: recordAmount },
      {
        onSuccess: (result) => {
          // 응답 기록 중 이전에 없던 것이 방금 추가한 기록
          const created = (result?.records ?? []).find(
            (record) => !previousIds.has(record.recordId),
          );
          if (created)
            setAddedRecordIds((current) => [...current, created.recordId]);
        },
        onError: (error) =>
          setSheetError(
            getErrorMessage(
              error,
              "수분 기록을 추가하지 못했어요. 잠시 후 다시 시도해 주세요.",
            ),
          ),
      },
    );
  };

  // "추가 취소" -> DELETE /api/situations/hydration/records/{recordId}/
  const cancelLastRecord = () => {
    if (cancelableRecordId === undefined || deleteMutation.isPending) return;
    setSheetError("");
    deleteMutation.mutate(cancelableRecordId, {
      onSuccess: () =>
        setAddedRecordIds((current) =>
          current.filter((id) => id !== cancelableRecordId),
        ),
      onError: (error) =>
        setSheetError(
          getErrorMessage(
            error,
            "수분 기록을 취소하지 못했어요. 잠시 후 다시 시도해 주세요.",
          ),
        ),
    });
  };

  return (
    <MobileLayout>
      <main className="relative mx-auto min-h-[1060px] w-full max-w-[390px] overflow-hidden bg-white text-[#353331]">
        <div className="absolute left-[24px] right-[24px] top-[28px]">
          <Header />
        </div>
        <nav
          aria-label="상황 카테고리"
          className="absolute left-[28px] top-[85px] flex gap-[14px]"
        >
          {categories.map((category) => {
            const selected = category === "수분";
            return (
              <Chip
                key={category}
                active={selected}
                onClick={() =>
                  navigate(
                    category === "빨래"
                      ? "/situation/laundry"
                      : category === "러닝"
                        ? "/situation/running"
                        : "/situation",
                  )
                }
                className="!h-[37px] !px-[19px] !text-[14px] !tracking-[-0.42px]"
              >
                {category}
              </Chip>
            );
          })}
        </nav>

        <h1 className="absolute left-[28px] top-[145px] text-[24px] font-semibold leading-[1.3] tracking-[-0.6px]">
          오늘의 수분 충전
        </h1>

        <div
          className="absolute left-1/2 top-[208px] h-[192px] w-[156px] -translate-x-1/2"
          aria-label={`권장량의 ${progress}%를 섭취했어요`}
          role="img"
        >
          <img
            src={raindropCharacter}
            alt=""
            className="absolute inset-0 h-full w-full object-contain"
          />
        </div>

        <button
          type="button"
          onClick={openSheet}
          aria-label={`현재 섭취량 ${waterAmount}밀리리터, 섭취량 수정`}
          className="absolute left-1/2 top-[421px] flex h-[39px] -translate-x-1/2 items-center justify-center gap-[5px] rounded-full bg-gradient-to-r from-[#60E1FF] to-[#B1F0FE] px-[19px] text-[24px] font-semibold leading-none tracking-[-0.72px] text-white"
        >
          {progress}%
          <svg
            width="13"
            height="13"
            viewBox="0 0 13 13"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="m8.8 2.1 2.1 2.1M2 11l2.5-.5 6.2-6.2a1.5 1.5 0 0 0-2.1-2.1l-6.2 6.2L2 11Z"
              stroke="currentColor"
              strokeWidth="1.3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        {/* 글이 길어져도 카드가 늘어나도록, 아래 영역은 위에서부터 차례로 쌓이게(flow) 배치 */}
        <div className="mt-[477px] px-[24px] pb-[108px]">
          <Card className="relative min-h-[205px] w-full !rounded-[20px] !border-2 !p-0">
            <div
              role="group"
              aria-label="수분 섭취 현황"
              className="px-[23px] pb-[20px] pt-[21px]"
            >
              <p className="text-[20px] font-semibold leading-[1.55] tracking-[-0.5px]">
                권장 섭취량 | {recommendedMl / 1000}L
              </p>
              <p className="text-[20px] font-semibold leading-[1.55] tracking-[-0.5px]">
                현재 섭취량 | {waterAmount}mL
              </p>
              <div className="mt-[12px] break-keep text-[15px] font-medium leading-[1.75] tracking-[-0.4px] text-[#62605F]">
                {isLoading && <p>수분 정보를 불러오는 중이에요...</p>}
                {!isLoggedIn && (
                  <>
                    <p>
                      로그인하면 오늘의 수분 섭취량을 기록하고 확인할 수 있어요.
                    </p>
                    <button
                      type="button"
                      onClick={() =>
                        navigate("/consent", {
                          state: { intent: "kakao", from: "/situation" },
                        })
                      }
                      className="mt-[4px] font-semibold text-[#1BA9E1] underline"
                    >
                      로그인하기
                    </button>
                  </>
                )}
                {isError && !data && (
                  <>
                    <p>
                      {getErrorMessage(error, "수분 정보를 불러오지 못했어요.")}
                    </p>
                    <button
                      type="button"
                      onClick={() => refetch()}
                      className="mt-[4px] font-semibold text-[#1BA9E1] underline"
                    >
                      다시 시도
                    </button>
                  </>
                )}
                {data && <p>{data.message}</p>}
              </div>
            </div>
          </Card>

          <h2 className="mt-[31px] px-[4px] text-[20px] font-semibold leading-[1.4] tracking-[-0.5px]">
            피부에도 수분 충전이 필요해요
          </h2>
          <Card className="relative mt-[15px] min-h-[196px] w-full !overflow-hidden !rounded-[20px] !border-2 !border-[#E9E8E8]/70 !p-0">
            <div
              role="group"
              aria-label="피부 수분 관리 팁"
              className="px-[22px] pb-[16px] pt-[13px]"
            >
              <div className="w-[303px] max-w-full break-keep text-[16px] font-medium leading-[1.75] tracking-[-0.4px] text-[#62605F]">
                <p>{data?.skinTip ?? ""}</p>
              </div>
              <img
                src={skincareCharacter}
                alt="수분 크림을 든 스킨케어 캐릭터"
                className="absolute bottom-0 right-[-1px] h-[106px] w-[112px] object-contain"
              />
            </div>
          </Card>
        </div>

        <BottomNav />
        <LoginRequiredModal
          isOpen={isLoginPromptOpen}
          onClose={() => setIsLoginPromptOpen(false)}
          onLogin={() =>
            navigate("/consent", {
              state: { intent: "kakao", from: "/situation" },
            })
          }
        />
        <BottomSheet
          isOpen={isEditing}
          title="수분 섭취량을 기록해주세요"
          onClose={closeSheet}
          showHandle={false}
          showClose={false}
          backdropClassName="bg-[#D2D2D1]/60"
          titleClassName="!text-[26px] !tracking-[-0.78px]"
        >
          <div className="mt-2">
            <Card className="relative mx-auto h-[205px] w-full max-w-[319px] !overflow-hidden !rounded-[16px] !border-[0.5px] !border-[#BCBBBA] !p-0 shadow-[0px_4px_45px_0px_rgba(27,169,225,0.08)]">
              <img
                src={waterWaveBack}
                alt=""
                aria-hidden="true"
                className="pointer-events-none absolute bottom-[-149px] left-[-265px]"
              />
              <img
                src={waterWaveFront}
                alt=""
                aria-hidden="true"
                className="pointer-events-none absolute bottom-[-111px] left-[-116px]"
              />
              <div className="absolute left-[19px] top-[9px] z-10">
                <p className="text-[20px] font-medium leading-8 text-[#1F1C1A]">
                  {currentTime}
                </p>
                <p className="text-[14px] font-medium leading-5 tracking-[-0.14px] text-[#8F8E8D]">
                  누적 {waterAmount}ml
                </p>
              </div>

              <div className="absolute left-[16px] right-[16px] top-[70px] z-10 flex items-center justify-between gap-2">
                <div className="flex h-[30px] min-w-0 items-center rounded-full border border-[#D2D2D1] bg-white/90 px-2">
                  <button
                    type="button"
                    aria-label="기록 시간 30분 줄이기"
                    onClick={() => changeRecordTime(-1)}
                    disabled={toMinutes(safeRecordTime) <= 0}
                    className="w-5 text-[15px] text-[#353331] disabled:opacity-30"
                  >
                    −
                  </button>
                  <span className="mx-1 whitespace-nowrap text-[11px] font-medium tabular-nums">
                    {safeRecordTime}
                  </span>
                  <button
                    type="button"
                    aria-label="기록 시간 30분 늘리기"
                    onClick={() => changeRecordTime(1)}
                    disabled={
                      toMinutes(safeRecordTime) >= toMinutes(maxRecordTime)
                    }
                    className="w-5 text-[15px] text-[#353331] disabled:opacity-30"
                  >
                    +
                  </button>
                </div>
                <div className="flex h-[30px] min-w-0 items-center rounded-full border border-[#D2D2D1] bg-white/90 px-2">
                  <button
                    type="button"
                    aria-label="기록량 10밀리리터 줄이기"
                    onClick={() =>
                      setRecordAmountInput(String(recordAmount - 10))
                    }
                    disabled={recordAmount <= 100}
                    className="w-5 text-[15px] text-[#353331] disabled:opacity-30"
                  >
                    −
                  </button>
                  <input
                    type="number"
                    min="10"
                    max="1000"
                    step="10"
                    value={recordAmountInput}
                    aria-label="수분 섭취량, 10에서 1000밀리리터"
                    onChange={(event) =>
                      setRecordAmountInput(event.target.value)
                    }
                    onBlur={() => setRecordAmountInput(String(recordAmount))}
                    className="mx-1 w-[52px] appearance-none bg-transparent text-center text-[11px] font-medium tabular-nums text-[#353331] outline-none"
                  />
                  <span className="-ml-1 text-[11px] font-medium">mL</span>
                  <button
                    type="button"
                    aria-label="기록량 10밀리리터 늘리기"
                    onClick={() =>
                      setRecordAmountInput(String(recordAmount + 10))
                    }
                    disabled={recordAmount >= 300}
                    className="w-5 text-[15px] text-[#353331] disabled:opacity-30"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="absolute bottom-[20px] right-[16px] z-10 flex items-center gap-2">
                {cancelableRecordId !== undefined && (
                  <button
                    type="button"
                    onClick={cancelLastRecord}
                    disabled={deleteMutation.isPending || addMutation.isPending}
                    aria-label="가장 최근에 추가한 수분 기록 취소"
                    className="rounded-full bg-white px-[12px] py-[5px] text-[12px] font-medium leading-4 text-[#62605F] shadow-[0_4px_16px_rgba(49,144,232,0.18)] disabled:opacity-50"
                  >
                    추가 취소
                  </button>
                )}
                <button
                  type="button"
                  onClick={addRecord}
                  disabled={
                    !data || addMutation.isPending || deleteMutation.isPending
                  }
                  className="rounded-full bg-white px-[16px] py-[5px] text-[12px] font-medium leading-4 text-[#1F1C1A] shadow-[0_4px_16px_rgba(49,144,232,0.18)] disabled:opacity-50"
                >
                  {addMutation.isPending ? "추가 중..." : "추가하기"}
                </button>
              </div>
            </Card>

            <Card className="mx-auto mt-[21px] h-[168px] w-full max-w-[319px] !rounded-[18px] !border-[0.5px] !border-[#D0D0D0] !p-0">
              <h3 className="ml-[22px] mt-[18px] text-[18px] font-medium leading-6 text-[#1F1C1A]">
                시간별 기록
              </h3>
              <div
                className="mx-[22px] mt-[12px] flex h-[82px] items-end justify-between border-b border-[#C7CED0]"
                role="img"
                aria-label="하루 시간대별 수분 섭취 기록"
              >
                {hourlyRecords.map((amount, index) => {
                  const barHeight = amount
                    ? Math.max(
                        3,
                        Math.round((Math.min(amount, 800) / 800) * 76),
                      )
                    : 0;
                  return (
                    <div
                      key={index}
                      className="relative h-full w-[5px] shrink-0 rounded-t-[8px] bg-[#D4F3FA]/50"
                    >
                      {amount > 0 && (
                        <div
                          className="absolute inset-x-0 bottom-0 rounded-t-[8px] bg-[#60E1FF]"
                          style={{ height: `${barHeight}px` }}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
              <div className="mx-[21px] mt-[4px] flex justify-between text-[8px] font-light leading-none text-[#353331]">
                {Array.from({ length: 24 }, (_, index) => (
                  <span key={index}>{index + 1}</span>
                ))}
              </div>
            </Card>

            {/* 추가/취소가 실패했을 때 서버 문구를 보여주기 */}
            {sheetError && (
              <p
                role="alert"
                className="mx-auto mt-[12px] max-w-[319px] text-center text-[13px] font-medium text-[#F35C4B]"
              >
                {sheetError}
              </p>
            )}

            <Button
              onClick={closeSheet}
              className="mt-[24px] h-[44px] !rounded-[10px] text-[16px]"
            >
              완료
            </Button>
          </div>
        </BottomSheet>
      </main>
    </MobileLayout>
  );
};

export default SituationDetail;
