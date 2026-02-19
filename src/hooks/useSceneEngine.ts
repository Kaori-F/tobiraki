"use client";
import { useState, useCallback, useEffect } from "react";
import { allScenes, Scene, Season } from "@/data";
import { useLocalStorage } from "./useLocalStorage";

interface HistoryEntry {
    sceneId: string;
    viewedAt: string;
}

function getCurrentSeason(): Season {
    const month = new Date().getMonth() + 1;
    if (month >= 3 && month <= 5) return "spring";
    if (month >= 6 && month <= 8) return "summer";
    if (month >= 9 && month <= 11) return "autumn";
    return "winter";
}

function getSeasonForScene(scene: Scene): Season {
    if (scene.hemisphere === "south") {
        const map: Record<Season, Season> = {
            spring: "autumn", summer: "winter", autumn: "spring", winter: "summer"
        };
        return map[scene.season];
    }
    return scene.season;
}

export function useSceneEngine() {
    const [favorites, setFavorites, favLoaded] = useLocalStorage<string[]>("scene-shift-favorites", []);
    const [history, setHistory, histLoaded] = useLocalStorage<HistoryEntry[]>("scene-shift-history", []);
    const [shownToday, setShownToday, shownLoaded] = useLocalStorage<string[]>("scene-shift-shown-today", []);
    const [todayDate, setTodayDate] = useLocalStorage<string>("scene-shift-today", "");
    const [currentScene, setCurrentScene] = useState<Scene | null>(null);
    const [showDetail, setShowDetail] = useState(false);
    const [view, setView] = useState<"main" | "favorites" | "history">("main");

    const isLoaded = favLoaded && histLoaded && shownLoaded;

    const pickScene = useCallback(() => {
        const today = new Date().toISOString().split("T")[0];
        let shown = shownToday;
        if (todayDate !== today) {
            shown = [];
            setShownToday([]);
            setTodayDate(today);
        }
        const currentSeason = getCurrentSeason();
        const available = allScenes.filter(s => !shown.includes(s.id));
        if (available.length === 0) {
            setShownToday([]);
            return allScenes[Math.floor(Math.random() * allScenes.length)];
        }
        const seasonMatch = available.filter(s => {
            const effectiveSeason = getSeasonForScene(s);
            return effectiveSeason === currentSeason;
        });
        const pool = seasonMatch.length > 0 ? seasonMatch : available;
        const picked = pool[Math.floor(Math.random() * pool.length)];
        return picked;
    }, [shownToday, todayDate, setShownToday, setTodayDate]);

    useEffect(() => {
        if (!isLoaded) return;
        if (!currentScene) {
            const scene = pickScene();
            setCurrentScene(scene);
            addToHistory(scene);
            setShownToday(prev => [...prev, scene.id]);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isLoaded]);

    const addToHistory = useCallback((scene: Scene) => {
        setHistory(prev => {
            const entry: HistoryEntry = { sceneId: scene.id, viewedAt: new Date().toISOString() };
            return [entry, ...prev.filter(h => h.sceneId !== scene.id)].slice(0, 100);
        });
    }, [setHistory]);

    const nextScene = useCallback(() => {
        const scene = pickScene();
        setCurrentScene(scene);
        addToHistory(scene);
        setShownToday(prev => [...prev, scene.id]);
        setShowDetail(false);
    }, [pickScene, addToHistory, setShownToday]);

    const toggleFavorite = useCallback((sceneId: string) => {
        setFavorites(prev =>
            prev.includes(sceneId) ? prev.filter(id => id !== sceneId) : [...prev, sceneId]
        );
    }, [setFavorites]);

    const isFavorite = useCallback((sceneId: string) => {
        return favorites.includes(sceneId);
    }, [favorites]);

    const getScene = useCallback((id: string) => {
        return allScenes.find(s => s.id === id) || null;
    }, []);

    const favoriteScenes = favorites.map(id => getScene(id)).filter(Boolean) as Scene[];
    const historyScenes = history.map(h => ({
        scene: getScene(h.sceneId),
        viewedAt: h.viewedAt
    })).filter(h => h.scene) as { scene: Scene; viewedAt: string }[];

    return {
        currentScene, nextScene, toggleFavorite, isFavorite,
        showDetail, setShowDetail, view, setView,
        favoriteScenes, historyScenes, isLoaded,
    };
}
