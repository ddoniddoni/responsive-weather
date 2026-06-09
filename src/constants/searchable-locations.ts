import type { SelectedCountry } from "@/types/weather-data";

export type SearchableLocation = Required<Pick<SelectedCountry, "code" | "name" | "coordinates">> & {
  aliases: string[];
};

export const SEARCHABLE_LOCATIONS: SearchableLocation[] = [
  {
    code: "KOR",
    name: "대한민국",
    coordinates: [127.7669, 35.9078],
    aliases: ["Korea", "Republic of Korea", "대한민국", "한국", "서울", "Seoul"],
  },
  {
    code: "USA",
    name: "미국",
    coordinates: [-98.5795, 39.8283],
    aliases: ["United States", "USA", "US", "America", "미국", "워싱턴"],
  },
  {
    code: "JPN",
    name: "일본",
    coordinates: [138.2529, 36.2048],
    aliases: ["Japan", "Nippon", "Tokyo", "일본", "도쿄"],
  },
  {
    code: "FRA",
    name: "프랑스",
    coordinates: [2.2137, 46.2276],
    aliases: ["France", "Paris", "프랑스", "파리"],
  },
];
