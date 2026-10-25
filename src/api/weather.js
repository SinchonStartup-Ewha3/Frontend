import api from "./axios";
import { USE_MOCK } from "./config";
import { db, delay } from "../mocks/db";

export const fetchHourlyWeather = async ({ regionCode } = {}) => {
  if (USE_MOCK) {
    await delay();
    const region =
      db.user.region && typeof db.user.region === "object"
        ? db.user.region
        : db.user.region
          ? {
              regionCode: "0000000001",
              regionName: db.user.region,
              shortName: db.user.region.replace(/^[^ ]+\s*/, ""),
            }
          : null;
    const now = new Date();
    const items = Array.from({ length: 24 }, (_, index) => {
      const forecastTime = new Date(now);
      forecastTime.setMinutes(0, 0, 0);
      forecastTime.setHours(forecastTime.getHours() + index + 1);
      const hour = forecastTime.getHours();
      const isNight = hour >= 18 || hour < 6;
      return {
        time: forecastTime.toISOString(),
        hour,
        temperature: [21, 19, 21, 25, 29][index % 5],
        condition: isNight ? "CLOUDY" : "CLEAR",
        conditionLabel: isNight ? "구름 많음" : "맑음",
        precipitationProbability: 10,
        isNight,
      };
    });
    return { region, items };
  }

  const { data } = await api.get("/api/home/weather/hourly/", {
    params: regionCode ? { regionCode } : undefined,
  });
  return data;
};

export const fetchHomeData = async ({ regionCode, lat, lng, skipAuth = false } = {}) => {
  if (USE_MOCK) {
    await delay();
    const { region, items: hourly } = await fetchHourlyWeather({ regionCode });
    const hour = new Date().getHours();
    const isNight = hour >= 18 || hour < 6;
    return {
      region,
      weather: {
        observedAt: new Date().toISOString(),
        temperature: 19.2,
        feelsLike: 20,
        minTemperature: 14,
        maxTemperature: 25,
        humidity: 60,
        windSpeed: 1.2,
        precipitation: 0,
        condition: isNight ? "CLEAR" : "PARTLY_CLOUDY",
        conditionLabel: isNight ? "맑음" : "구름많음",
        isNight,
      },
      hourly,
      character: { state: "DEFAULT", label: "기본" },
      message: "일교차가 크니 겉옷을 챙기세요!",
      lifeInfo: {
        umbrella: { needed: false, fromHour: null },
        outfit: { code: "CARDIGAN", label: "가디건·자켓" },
        tempGap: 11,
      },
    };
  }

  const params = regionCode
    ? { regionCode }
    : lat != null && lng != null
      ? { lat, lng }
      : undefined;
  const { data } = await api.get("/api/home/", { params, skipAuth });
  return data;
};
