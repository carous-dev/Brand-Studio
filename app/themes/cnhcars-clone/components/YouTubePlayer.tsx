/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { companyProfile } from "../data/profile";

type YouTubePlayerProps = {
  videoUrl?: string | null;
  initialMinimized?: boolean;
};

type ResolvedVideo = {
  provider: "youtube" | "vimeo";
  embedUrl: string;
};

const PLAYER_DIMENSIONS = {
  expanded: { width: 320, height: 240 },
  minimized: { width: 200, height: 60 },
} as const;

const VIEWPORT_MARGIN = 20;
const MINIMIZED_BOTTOM_OFFSET = 14;

function buildYouTubeEmbed(videoId: string): string {
  return `https://www.youtube.com/embed/${encodeURIComponent(videoId)}?autoplay=1&rel=0&modestbranding=1&mute=1`;
}

function buildVimeoEmbed(videoId: string, hash = ""): string {
  const params = new URLSearchParams({
    autoplay: "1",
    muted: "1",
    title: "0",
    byline: "0",
    portrait: "0",
  });

  if (hash) {
    params.set("h", hash);
  }

  return `https://player.vimeo.com/video/${encodeURIComponent(videoId)}?${params.toString()}`;
}

function resolveVideoSource(inputUrl?: string | null): ResolvedVideo | null {
  const raw = String(inputUrl ?? "").trim();
  if (!raw) return null;

  const withScheme = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
  let parsed: URL;

  try {
    parsed = new URL(withScheme);
  } catch {
    return null;
  }

  const host = parsed.hostname.replace(/^www\./, "").toLowerCase();
  const segments = parsed.pathname.split("/").filter(Boolean);

  if (host === "youtu.be") {
    const id = segments[0];
    if (!id) return null;
    return { provider: "youtube", embedUrl: buildYouTubeEmbed(id) };
  }

  if (host.endsWith("youtube.com")) {
    const id =
      parsed.searchParams.get("v") ||
      (segments[0] === "shorts" ? segments[1] : null) ||
      (segments[0] === "embed" ? segments[1] : null);

    if (!id) return null;
    return { provider: "youtube", embedUrl: buildYouTubeEmbed(id) };
  }

  if (host.endsWith("vimeo.com")) {
    let id = "";
    let hash = "";

    if (host === "player.vimeo.com" && segments[0] === "video") {
      id = segments[1] || "";
      hash = parsed.searchParams.get("h") || "";
    } else {
      id = segments[0] || "";
      hash = segments[1] || parsed.searchParams.get("h") || "";
    }

    if (!/^\d+$/.test(id)) return null;
    return { provider: "vimeo", embedUrl: buildVimeoEmbed(id, hash) };
  }

  return null;
}

export function hasSupportedVideoSource(inputUrl?: string | null): boolean {
  return Boolean(resolveVideoSource(inputUrl));
}

export default function YouTubePlayer({ videoUrl, initialMinimized = false }: YouTubePlayerProps) {
  const [isMinimized, setIsMinimized] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [position, setPosition] = useState({ x: 20, y: 20 });
  const [isInitialized, setIsInitialized] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef<HTMLDivElement>(null);
  const dragStartPos = useRef({ x: 0, y: 0 });
  const resolvedVideo = useMemo(
    () => resolveVideoSource(videoUrl),
    [videoUrl],
  );

  const clampPositionToViewport = (nextPosition: { x: number; y: number }, minimizedState: boolean) => {
    const box = minimizedState ? PLAYER_DIMENSIONS.minimized : PLAYER_DIMENSIONS.expanded;
    const maxX = Math.max(VIEWPORT_MARGIN, window.innerWidth - box.width - VIEWPORT_MARGIN);
    const maxY = Math.max(VIEWPORT_MARGIN, window.innerHeight - box.height - VIEWPORT_MARGIN);

    return {
      x: Math.max(VIEWPORT_MARGIN, Math.min(nextPosition.x, maxX)),
      y: Math.max(VIEWPORT_MARGIN, Math.min(nextPosition.y, maxY)),
    };
  };

  useEffect(() => {
    const shouldStartMinimized = initialMinimized || window.innerWidth < 768;
    const estimatedHeight = shouldStartMinimized ? PLAYER_DIMENSIONS.minimized.height : PLAYER_DIMENSIONS.expanded.height;
    const bottomSpacing = shouldStartMinimized ? MINIMIZED_BOTTOM_OFFSET : VIEWPORT_MARGIN;

    setPosition(
      clampPositionToViewport(
        {
          x: VIEWPORT_MARGIN,
          y: window.innerHeight - estimatedHeight - bottomSpacing,
        },
        shouldStartMinimized,
      ),
    );
    setIsMinimized(shouldStartMinimized);
    setIsInitialized(true);
  }, [initialMinimized]);

  // Handle dragging
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.target === dragRef.current || dragRef.current?.contains(e.target as Node)) {
      setIsDragging(true);
      dragStartPos.current = {
        x: e.clientX - position.x,
        y: e.clientY - position.y
      };
      e.preventDefault();
    }
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return;

    const newX = e.clientX - dragStartPos.current.x;
    const newY = e.clientY - dragStartPos.current.y;
    setPosition(clampPositionToViewport({ x: newX, y: newY }, isMinimized));
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      document.body.style.userSelect = "none";
      document.body.style.cursor = "grabbing";
    } else {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.body.style.userSelect = "";
      document.body.style.cursor = "";
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.body.style.userSelect = "";
      document.body.style.cursor = "";
    };
  }, [isDragging]);

  useEffect(() => {
    const handleResize = () => {
      setPosition((current) => clampPositionToViewport(current, isMinimized));
    };

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [isMinimized]);

  const toggleMinimize = () => {
    setIsMinimized((prev) => {
      const next = !prev;
      setPosition((current) => clampPositionToViewport(current, next));
      return next;
    });
  };

  const handleClose = () => {
    setIsVisible(false);
  };

  if (!isVisible || !resolvedVideo || !isInitialized) return null;

  return (
    <div 
      ref={dragRef}
      className={`youtube-player-float ${isMinimized ? 'minimized' : 'expanded'} ${isDragging ? 'dragging' : ''}`}
      style={{
        left: `${position.x}px`,
        top: isMinimized ? "auto" : `${position.y}px`,
        bottom: isMinimized ? `${MINIMIZED_BOTTOM_OFFSET}px` : "auto",
        cursor: isDragging ? "grabbing" : "grab"
      }}
      onMouseDown={handleMouseDown}
    >
      <div className="youtube-player-container">
        {/* Header with controls */}
        <div className="youtube-player-header">
          <div className="youtube-player-title">
            <img 
              src={companyProfile.logo}
              alt={companyProfile.name}
              className="youtube-player-logo"
            />
            <span>{companyProfile.name}</span>
          </div>
          <div className="youtube-player-controls">
            <button 
              onClick={toggleMinimize}
              className="youtube-control-btn minimize-btn"
              aria-label={isMinimized ? "Expand" : "Minimize"}
            >
              {isMinimized ? (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M7 14H5v5h5v-5z" fill="currentColor"/>
                  <path d="M5 10h14" stroke="currentColor" strokeWidth="2"/>
                  <path d="M19 10h-5v5h5v-5z" fill="currentColor"/>
                </svg>
              ) : (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M19 13H5v-2h14v2z" fill="currentColor"/>
                </svg>
              )}
            </button>
            <button 
              onClick={handleClose}
              className="youtube-control-btn close-btn"
              aria-label="Close"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" fill="currentColor"/>
              </svg>
            </button>
          </div>
        </div>

        {/* Video content */}
        {!isMinimized && (
          <div className="youtube-player-content">
            <div className="youtube-video-wrapper">
              <iframe
                src={resolvedVideo.embedUrl}
                title={`${companyProfile.name} ${resolvedVideo.provider === "vimeo" ? "Vimeo" : "YouTube"} Video`}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="youtube-video-iframe"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
