import { Scene } from "./types";
import { scenesPart1 } from "./scenes-part1";
import { scenesPart2 } from "./scenes-part2";
import { scenesPart3 } from "./scenes-part3";
import { scenesPart4 } from "./scenes-part4";
import { scenesPart5 } from "./scenes-part5";

export type { Scene, SceneCategory, TimeOfDay, Season, Hemisphere, SceneDetails } from "./types";

export const allScenes: Scene[] = [
    ...scenesPart1,
    ...scenesPart2,
    ...scenesPart3,
    ...scenesPart4,
    ...scenesPart5,
];
