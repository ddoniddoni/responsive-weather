import type { SelectedCountry } from "@/types/weather-data";

export type SearchableLocation = Required<Pick<SelectedCountry, "code" | "name" | "coordinates">> & {
  aliases: string[];
};

export const SEARCHABLE_LOCATIONS: SearchableLocation[] = [
  {
    code: "KOR",
    name: "South Korea",
    coordinates: [127.7669, 35.9078],
    aliases: ["Korea", "Republic of Korea", "대한민국", "한국", "서울", "Seoul"],
  },
  {
    code: "USA",
    name: "United States of America",
    coordinates: [-98.5795, 39.8283],
    aliases: ["United States", "USA", "US", "America", "미국", "워싱턴"],
  },
  {
    code: "JPN",
    name: "Japan",
    coordinates: [138.2529, 36.2048],
    aliases: ["Nippon", "Tokyo", "일본", "도쿄"],
  },
  {
    code: "FRA",
    name: "France",
    coordinates: [2.2137, 46.2276],
    aliases: ["Paris", "프랑스", "파리"],
  },
];
