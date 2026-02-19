export type SceneCategory =
    | "urban-cafe"
    | "nature-resort"
    | "culture-art"
    | "business-social"
    | "daily-special"
    | "spiritual"
    | "web3-tech"
    | "japanese-traditional";

export type TimeOfDay = "morning" | "afternoon" | "evening" | "night";
export type Season = "spring" | "summer" | "autumn" | "winter";
export type Hemisphere = "north" | "south";

export interface SceneDetails {
    history: string;
    trivia: string;
    music: string;
    cuisine: string;
}

export interface Scene {
    id: string;
    location: string;
    category: SceneCategory;
    timeOfDay: TimeOfDay;
    season: Season;
    hemisphere: Hemisphere;
    description: string;
    details: SceneDetails;
    imageQuery: string;
    wikiQuery: string;
    accentColor: string;
}
