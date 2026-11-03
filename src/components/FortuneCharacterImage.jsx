import { useState } from "react";
import { getFortuneCharacter } from "../utils/fortuneCharacter";

export default function FortuneCharacterImage({ fortune, className }) {
  const [failedUrl, setFailedUrl] = useState(null);
  const remoteUrl = typeof fortune?.image_url === "string" ? fortune.image_url.trim() : "";
  const useRemote = remoteUrl && remoteUrl !== failedUrl;
  return (
    <img src={useRemote ? remoteUrl : getFortuneCharacter(fortune)}
      alt={fortune?.title ?? "오늘의 운세 테루테루 캐릭터"}
      className={className}
      onError={useRemote ? () => setFailedUrl(remoteUrl) : undefined} />
  );
}
