"use client";
import { useState, useCallback, useEffect } from "react";
import { useSceneEngine } from "@/hooks/useSceneEngine";
import { Scene } from "@/data";

const TIME_LABELS: Record<string, string> = {
  morning: "朝", afternoon: "昼", evening: "夕方", night: "夜"
};
const TIME_ICONS: Record<string, string> = {
  morning: "☀️", afternoon: "🌤", evening: "🌅", night: "🌙"
};
const SEASON_LABELS: Record<string, string> = {
  spring: "春", summer: "夏", autumn: "秋", winter: "冬"
};

/* ---------- Image ---------- */

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function getPicsumUrl(query: string, w: number = 800) {
  const h = Math.round(w * 1.2);
  const seed = hashString(query);
  return `https://picsum.photos/seed/${seed}/${w}/${h}`;
}

// Cache for Wikipedia image URLs
const wikiImageCache = new Map<string, string | null>();

async function fetchWikiImage(wikiQuery: string): Promise<string | null> {
  if (wikiImageCache.has(wikiQuery)) return wikiImageCache.get(wikiQuery) ?? null;
  try {
    const res = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(wikiQuery)}`);
    if (!res.ok) throw new Error("not found");
    const data = await res.json();
    const url = data.thumbnail?.source ?? data.originalimage?.source ?? null;
    wikiImageCache.set(wikiQuery, url);
    return url;
  } catch {
    wikiImageCache.set(wikiQuery, null);
    return null;
  }
}

function SceneImage({ wikiQuery, imageQuery, alt }: { wikiQuery: string; imageQuery: string; alt: string }) {
  const [src, setSrc] = useState<string>(getPicsumUrl(imageQuery));
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setLoaded(false);
    setSrc(getPicsumUrl(imageQuery));

    fetchWikiImage(wikiQuery).then(url => {
      if (url) setSrc(url);
    });
  }, [wikiQuery, imageQuery]);

  return (
    <img
      src={src}
      alt={alt}
      className={loaded ? "loaded" : ""}
      onLoad={() => setLoaded(true)}
      onError={() => {
        // fallback to picsum if wiki image fails
        setSrc(getPicsumUrl(imageQuery));
      }}
      crossOrigin="anonymous"
    />
  );
}

function SmallImage({ wikiQuery, imageQuery, alt }: { wikiQuery: string; imageQuery: string; alt: string }) {
  const [src, setSrc] = useState<string>(getPicsumUrl(imageQuery, 200));
  useEffect(() => {
    fetchWikiImage(wikiQuery).then(url => {
      if (url) setSrc(url);
    });
  }, [wikiQuery, imageQuery]);

  return (
    <img
      className="list-item-img"
      src={src}
      alt={alt}
      loading="lazy"
      crossOrigin="anonymous"
    />
  );
}

/* ---------- SceneCard ---------- */

function SceneCardView({
  scene, isFav, onToggleFav, onNext, onDetail,
}: {
  scene: Scene; isFav: boolean;
  onToggleFav: () => void; onNext: () => void; onDetail: () => void;
}) {
  return (
    <div className="scene-card">
      <div className="scene-image-wrapper" style={{
        background: `linear-gradient(135deg, ${scene.accentColor}22, ${scene.accentColor}44)`
      }}>
        <SceneImage wikiQuery={scene.wikiQuery} imageQuery={scene.imageQuery} alt={scene.location} />
        <div className="scene-image-gradient" />
      </div>
      <div className="scene-content">
        <div className="scene-location fade-in">
          <span className="pin">📍</span>
          <span>{scene.location}</span>
        </div>
        <div className="scene-meta fade-in-delay">
          <span>{TIME_ICONS[scene.timeOfDay]} {TIME_LABELS[scene.timeOfDay]}</span>
          <span>·</span>
          <span>{SEASON_LABELS[scene.season]}</span>
        </div>
        <p className="scene-description fade-in-delay-2">
          {scene.description}
        </p>
      </div>
      <div className="scene-actions">
        <button className={`btn btn-favorite ${isFav ? "active" : ""}`} onClick={onToggleFav}>
          {isFav ? "♥" : "♡"}
        </button>
        <button className="btn btn-primary" onClick={onNext}>
          次のシーンへ
        </button>
        <button className="btn btn-detail" onClick={onDetail}>
          📖
        </button>
      </div>
    </div>
  );
}

/* ---------- DetailPanel ---------- */

function DetailPanel({
  scene, open, onClose,
}: { scene: Scene; open: boolean; onClose: () => void }) {
  const googleUrl = `https://www.google.com/search?q=${encodeURIComponent(scene.location)}`;

  return (
    <>
      <div className={`detail-overlay ${open ? "open" : ""}`} onClick={onClose} />
      <div className={`detail-panel ${open ? "open" : ""}`}>
        <div className="detail-handle" />
        <div className="detail-section">
          <h3>🏛 歴史・背景</h3>
          <p>{scene.details.history}</p>
        </div>
        <div className="detail-section">
          <h3>💡 豆知識</h3>
          <p>{scene.details.trivia}</p>
        </div>
        <div className="detail-section">
          <h3>🍽️ ご当地グルメ</h3>
          <p>{scene.details.cuisine}</p>
        </div>
        <div className="detail-section">
          <h3>🎵 おすすめの音楽</h3>
          <p>{scene.details.music}</p>
        </div>
        <div className="detail-links">
          <a href={googleUrl} target="_blank" rel="noopener noreferrer" className="detail-link-btn">
            🔍 Googleで調べる
          </a>
        </div>
      </div>
    </>
  );
}

/* ---------- ListView ---------- */

function ListView({
  title, items, emptyText, onSelect,
}: {
  title: string;
  items: { scene: Scene; sub?: string }[];
  emptyText: string;
  onSelect: (scene: Scene) => void;
}) {
  return (
    <div className="list-view">
      <h2>{title}</h2>
      {items.length === 0 && <div className="list-empty">{emptyText}</div>}
      {items.map(({ scene, sub }) => (
        <div key={scene.id} className="list-item" onClick={() => onSelect(scene)}>
          <SmallImage wikiQuery={scene.wikiQuery} imageQuery={scene.imageQuery} alt={scene.location} />
          <div className="list-item-info">
            <div className="list-item-location">{scene.location}</div>
            <div className="list-item-meta">
              {TIME_ICONS[scene.timeOfDay]} {TIME_LABELS[scene.timeOfDay]} · {SEASON_LABELS[scene.season]}
              {sub && ` · ${sub}`}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ---------- Main ---------- */

export default function Home() {
  const {
    currentScene, nextScene, toggleFavorite, isFavorite,
    showDetail, setShowDetail, view, setView,
    favoriteScenes, historyScenes, isLoaded,
  } = useSceneEngine();

  const [selectedListScene, setSelectedListScene] = useState<Scene | null>(null);

  const handleListSelect = useCallback((scene: Scene) => {
    setSelectedListScene(scene);
  }, []);

  const handleBackToList = useCallback(() => {
    setSelectedListScene(null);
  }, []);

  if (!isLoaded || !currentScene) {
    return (
      <div className="loading-screen">
        <div className="loading-content">
          <span className="loading-title">トビラキ</span>
          <span className="loading-tagline">未来の自分を、今、生きる。</span>
        </div>
      </div>
    );
  }

  // Show selected scene from list
  if (selectedListScene) {
    return (
      <>
        <nav className="nav-header">
          <button className="nav-icon-btn" onClick={handleBackToList}>← 戻る</button>
          <span className="nav-title">トビラキ</span>
          <div style={{ width: 40 }} />
        </nav>
        <SceneCardView
          scene={selectedListScene}
          isFav={isFavorite(selectedListScene.id)}
          onToggleFav={() => toggleFavorite(selectedListScene.id)}
          onNext={() => { handleBackToList(); setView("main"); }}
          onDetail={() => setShowDetail(true)}
        />
        <DetailPanel scene={selectedListScene} open={showDetail} onClose={() => setShowDetail(false)} />
      </>
    );
  }

  // List views
  if (view === "favorites") {
    return (
      <>
        <nav className="nav-header">
          <button className="nav-icon-btn" onClick={() => setView("main")}>← 戻る</button>
          <div className="nav-brand">
            <span className="nav-title">トビラキ</span>
            <span className="nav-tagline">未来の自分を、今、生きる。</span>
          </div>
          <div style={{ width: 40 }} />
        </nav>
        <ListView
          title="♡ お気に入り"
          items={favoriteScenes.map(s => ({ scene: s }))}
          emptyText={"まだお気に入りのシーンがありません。\n気に入ったシーンの ♡ を押して保存しましょう。"}
          onSelect={handleListSelect}
        />
      </>
    );
  }

  if (view === "history") {
    return (
      <>
        <nav className="nav-header">
          <button className="nav-icon-btn" onClick={() => setView("main")}>← 戻る</button>
          <div className="nav-brand">
            <span className="nav-title">トビラキ</span>
            <span className="nav-tagline">未来の自分を、今、生きる。</span>
          </div>
          <div style={{ width: 40 }} />
        </nav>
        <ListView
          title="📋 履歴"
          items={historyScenes.map(h => ({
            scene: h.scene,
            sub: new Date(h.viewedAt).toLocaleDateString("ja-JP", { month: "short", day: "numeric" }),
          }))}
          emptyText="まだ閲覧したシーンがありません。"
          onSelect={handleListSelect}
        />
      </>
    );
  }

  // Main view
  return (
    <>
      <nav className="nav-header">
        <div className="nav-brand">
          <span className="nav-title">トビラキ</span>
          <span className="nav-tagline">未来の自分を、今、生きる。</span>
        </div>

        <div className="nav-icons">
          <button className="nav-icon-btn" onClick={() => setView("favorites")} title="お気に入り">♡</button>
          <button className="nav-icon-btn" onClick={() => setView("history")} title="履歴">📋</button>
        </div>
      </nav>
      <SceneCardView
        scene={currentScene}
        isFav={isFavorite(currentScene.id)}
        onToggleFav={() => toggleFavorite(currentScene.id)}
        onNext={nextScene}
        onDetail={() => setShowDetail(true)}
      />
      <DetailPanel scene={currentScene} open={showDetail} onClose={() => setShowDetail(false)} />
    </>
  );
}
