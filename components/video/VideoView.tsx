"use client";

import { useState, useRef, useEffect } from "react";
import { Plus, Trash2, Download, Volume2, VolumeX, Maximize, Copy, Type } from "lucide-react";
import * as Y from "yjs";
import { WebsocketProvider } from "y-websocket";

interface VideoItem {
  id: string;
  title: string;
  url: string;
  duration?: string;
  volume?: number;
  textOverlays?: TextOverlay[];
  addedAt: string;
}

interface TextOverlay {
  id: string;
  text: string;
  startTime: number;
  endTime: number;
  x: number;
  y: number;
  fontSize: number;
  color: string;
}

interface VideoTemplate {
  name: string;
  videos: VideoItem[];
}

const TEMPLATES: Record<string, VideoTemplate> = {
  blank: {
    name: "Blank Video",
    videos: [],
  },
  tutorial: {
    name: "Tutorial",
    videos: [
      {
        id: "1",
        title: "Tutorial Part 1",
        url: "https://www.w3schools.com/html/mov_bbb.mp4",
        duration: "0:10",
        addedAt: new Date().toISOString(),
        volume: 1,
        textOverlays: [],
      },
    ],
  },
  promotional: {
    name: "Promotional",
    videos: [
      {
        id: "1",
        title: "Promo Video",
        url: "https://www.w3schools.com/html/movie.mp4",
        duration: "0:08",
        addedAt: new Date().toISOString(),
        volume: 1,
        textOverlays: [],
      },
    ],
  },
};

const SAMPLE_VIDEOS: VideoItem[] = [
  {
    id: "1",
    title: "Sample Video",
    url: "https://www.w3schools.com/html/mov_bbb.mp4",
    duration: "0:10",
    addedAt: new Date().toISOString(),
    volume: 1,
    textOverlays: [],
  },
];

export default function VideoView({ 
  databaseId,
  templateName = "blank" 
}: { 
  databaseId: string;
  templateName?: string;
}) {
  const template = TEMPLATES[templateName] || TEMPLATES.blank;
  const [videos, setVideos] = useState<VideoItem[]>(template.videos.length > 0 ? template.videos : SAMPLE_VIDEOS);
  const [selectedVideo, setSelectedVideo] = useState<VideoItem | null>(videos[0] || null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState("0:00");
  const [totalTime, setTotalTime] = useState("0:00");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showTextOverlayModal, setShowTextOverlayModal] = useState(false);
  const [newVideoUrl, setNewVideoUrl] = useState("");
  const [newVideoTitle, setNewVideoTitle] = useState("");
  const [urlError, setUrlError] = useState("");
  const [textOverlayInput, setTextOverlayInput] = useState("");
  const [collaborators, setCollaborators] = useState<string[]>([]);

  const videoRef = useRef<HTMLVideoElement>(null);
  const yDocRef = useRef<Y.Doc | null>(null);
  const providerRef = useRef<WebsocketProvider | null>(null);
  const videosArrayRef = useRef<Y.Array<any> | null>(null);

  // Initialize Yjs for collaboration
  useEffect(() => {
    const ydoc = new Y.Doc();
    yDocRef.current = ydoc;

    const yarray = ydoc.getArray("videos");
    videosArrayRef.current = yarray;

    if (yarray.length === 0) {
      videos.forEach((video) => {
        yarray.push(new Y.Map(Object.entries(video)));
      });
    }

    yarray.observe((event) => {
      const updatedVideos = yarray.toArray().map((item: any) => {
        const map = item as Y.Map<any>;
        return {
          id: map.get("id"),
          title: map.get("title"),
          url: map.get("url"),
          duration: map.get("duration"),
          volume: map.get("volume"),
          textOverlays: map.get("textOverlays") || [],
          addedAt: map.get("addedAt"),
        };
      });
      setVideos(updatedVideos);
    });

    try {
      const provider = new WebsocketProvider(
        "ws://localhost:1234",
        `video-${databaseId}`,
        ydoc
      );
      providerRef.current = provider;

      provider.awareness.on("change", (changes: any) => {
        const states = Array.from(provider.awareness.getStates().values());
        const users = states
          .map((state: any) => state.user?.name)
          .filter(Boolean);
        setCollaborators(users);
      });

      provider.awareness.setLocalState({
        user: {
          name: `User-${Math.random().toString(36).substr(2, 9)}`,
          color: `hsl(${Math.random() * 360}, 100%, 50%)`,
        },
      });
    } catch (error) {
      console.log("WebSocket connection failed, running in offline mode");
    }

    return () => {
      if (providerRef.current) {
        providerRef.current.disconnect();
      }
      ydoc.destroy();
    };
  }, [databaseId]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const handleTimeUpdate = () => {
    const video = videoRef.current;
    if (!video) return;
    const pct = (video.currentTime / video.duration) * 100;
    setProgress(isNaN(pct) ? 0 : pct);
    setCurrentTime(formatTime(video.currentTime));
    setTotalTime(formatTime(video.duration || 0));
  };

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    if (isPlaying) {
      video.pause();
    } else {
      video.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current;
    if (!video) return;
    const newTime = (parseFloat(e.target.value) / 100) * video.duration;
    video.currentTime = newTime;
    setProgress(parseFloat(e.target.value));
  };

  const handleVolume = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    if (videoRef.current) videoRef.current.volume = val;
    setIsMuted(val === 0);
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleFullscreen = () => {
    videoRef.current?.requestFullscreen();
  };

  const selectVideo = (video: VideoItem) => {
    setSelectedVideo(video);
    setIsPlaying(false);
    setProgress(0);
    setCurrentTime("0:00");
    setTotalTime("0:00");
  };

  const addVideo = () => {
    if (!newVideoUrl.trim()) {
      setUrlError("Please enter a video URL");
      return;
    }
    const newVideo: VideoItem = {
      id: Date.now().toString(),
      title: newVideoTitle || "Untitled Video",
      url: newVideoUrl,
      addedAt: new Date().toISOString(),
      volume: 1,
      textOverlays: [],
    };

    if (videosArrayRef.current) {
      videosArrayRef.current.push([new Y.Map(Object.entries(newVideo))]);
    } else {
      setVideos([...videos, newVideo]);
    }

    setNewVideoUrl("");
    setNewVideoTitle("");
    setUrlError("");
    setShowAddModal(false);
    selectVideo(newVideo);
  };

  const deleteVideo = (id: string) => {
    if (videosArrayRef.current) {
      const index = videos.findIndex((v) => v.id === id);
      if (index !== -1) {
        videosArrayRef.current.delete(index, 1);
      }
    } else {
      const updated = videos.filter((v) => v.id !== id);
      setVideos(updated);
      if (selectedVideo?.id === id) {
        setSelectedVideo(updated[0] || null);
      }
    }
  };

  const duplicateVideo = (video: VideoItem) => {
    const newVideo = { ...video, id: Date.now().toString() };
    if (videosArrayRef.current) {
      videosArrayRef.current.push([new Y.Map(Object.entries(newVideo))]);
    } else {
      setVideos([...videos, newVideo]);
    }
  };

  const addTextOverlay = () => {
    if (!selectedVideo || !textOverlayInput.trim()) return;

    const newOverlay: TextOverlay = {
      id: Date.now().toString(),
      text: textOverlayInput,
      startTime: Math.floor(videoRef.current?.currentTime || 0),
      endTime: Math.floor((videoRef.current?.currentTime || 0) + 5),
      x: 50,
      y: 50,
      fontSize: 24,
      color: "#ffffff",
    };

    const updatedVideo = {
      ...selectedVideo,
      textOverlays: [...(selectedVideo.textOverlays || []), newOverlay],
    };

    if (videosArrayRef.current) {
      const index = videos.findIndex((v) => v.id === selectedVideo.id);
      if (index !== -1) {
        const videoMap = videosArrayRef.current.get(index) as Y.Map<any>;
        videoMap.set("textOverlays", updatedVideo.textOverlays);
      }
    } else {
      setVideos(videos.map((v) => (v.id === selectedVideo.id ? updatedVideo : v)));
      setSelectedVideo(updatedVideo);
    }

    setTextOverlayInput("");
    setShowTextOverlayModal(false);
  };

  const downloadVideo = () => {
    if (!selectedVideo) return;
    const a = document.createElement("a");
    a.href = selectedVideo.url;
    a.download = selectedVideo.title;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.volume = volume;
    }
  }, [selectedVideo]);

  return (
    <div className="flex h-full bg-gray-950 text-white overflow-hidden rounded-2xl">
      {/* Sidebar - Video List */}
      <div className="w-40 bg-gray-900 border-r border-gray-800 flex flex-col">
        <div className="flex items-center justify-between px-3 py-2 border-b border-gray-800">
          <span className="font-semibold text-xs">🎥 Videos</span>
          <button
            onClick={() => setShowAddModal(true)}
            className="text-xs bg-indigo-600 hover:bg-indigo-500 px-2 py-1 rounded-lg transition flex items-center gap-0.5"
          >
            <Plus size={12} />
            Add
          </button>
        </div>

        {collaborators.length > 0 && (
          <div className="px-3 py-1 bg-gray-800 border-b border-gray-700 text-[10px] text-gray-300">
            {collaborators.length} collaborators
          </div>
        )}

        <div className="flex-1 overflow-y-auto">
          {videos.length === 0 && (
            <p className="text-gray-500 text-xs text-center mt-4 px-2">
              No videos. Click + Add.
            </p>
          )}
          {videos.map((video, index) => (
            <div
              key={`${video.id}-${index}`}
              onClick={() => selectVideo(video)}
              className={`flex items-start gap-2 px-2 py-2 cursor-pointer hover:bg-gray-800 transition border-b border-gray-800 group ${
                selectedVideo?.id === video.id ? "bg-gray-800 border-l-2 border-l-indigo-500" : ""
              }`}
            >
              <div className="w-10 h-8 bg-gray-700 rounded flex items-center justify-center text-sm flex-shrink-0">
                🎬
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium truncate">{video.title}</p>
                {video.duration && (
                  <p className="text-[10px] text-gray-500 mt-0.5">{video.duration}</p>
                )}
              </div>
              <div className="opacity-0 group-hover:opacity-100 transition flex gap-0.5">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    duplicateVideo(video);
                  }}
                  className="p-0.5 bg-blue-600 hover:bg-blue-500 rounded text-[10px]"
                  title="Duplicate"
                >
                  <Copy size={10} />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteVideo(video.id);
                  }}
                  className="p-0.5 bg-red-600 hover:bg-red-500 rounded text-[10px]"
                  title="Delete"
                >
                  <Trash2 size={10} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Player */}
      <div className="flex-1 flex flex-col">
        {selectedVideo ? (
          <>
            {/* Video Element */}
            <div className="flex-1 bg-black flex items-center justify-center relative group">
              <video
                ref={videoRef}
                src={selectedVideo.url}
                className="max-h-full max-w-full w-full"
                onTimeUpdate={handleTimeUpdate}
                onEnded={() => setIsPlaying(false)}
                onLoadedMetadata={handleTimeUpdate}
                onClick={togglePlay}
              />
              {!isPlaying && (
                <div
                  onClick={togglePlay}
                  className="absolute inset-0 flex items-center justify-center cursor-pointer"
                >
                  <div className="w-16 h-16 bg-black/60 rounded-full flex items-center justify-center hover:bg-black/80 transition">
                    <span className="text-3xl ml-1">▶</span>
                  </div>
                </div>
              )}
            </div>

            {/* Controls */}
            <div className="bg-gray-900 px-4 py-3 border-t border-gray-800">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-semibold">{selectedVideo.title}</p>
                <div className="flex gap-1">
                  <button
                    onClick={() => setShowTextOverlayModal(true)}
                    className="text-xs bg-purple-600 hover:bg-purple-500 px-2 py-1 rounded transition flex items-center gap-0.5"
                  >
                    <Type size={12} />
                    Text
                  </button>
                  <button
                    onClick={downloadVideo}
                    className="text-xs bg-gray-700 hover:bg-gray-600 px-2 py-1 rounded transition flex items-center gap-0.5"
                  >
                    <Download size={12} />
                    Download
                  </button>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="flex items-center gap-2 mb-3">
                <span className="text-[10px] text-gray-400 w-10">{currentTime}</span>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={progress}
                  onChange={handleSeek}
                  className="flex-1 h-1.5 accent-indigo-500 cursor-pointer rounded-full"
                />
                <span className="text-[10px] text-gray-400 w-10 text-right">{totalTime}</span>
              </div>

              {/* Buttons */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <button
                    onClick={togglePlay}
                    className="w-10 h-10 bg-indigo-600 hover:bg-indigo-500 rounded-full flex items-center justify-center text-lg transition"
                  >
                    {isPlaying ? "⏸" : "▶"}
                  </button>
                  <button
                    onClick={toggleMute}
                    className="text-gray-400 hover:text-white text-lg transition"
                  >
                    {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
                  </button>
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.05}
                    value={isMuted ? 0 : volume}
                    onChange={handleVolume}
                    className="w-20 h-1.5 accent-indigo-500 cursor-pointer rounded-full"
                  />
                </div>
                <button
                  onClick={handleFullscreen}
                  className="text-gray-400 hover:text-white text-lg transition"
                  title="Fullscreen"
                >
                  <Maximize size={16} />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500 flex-col gap-3">
            <span className="text-5xl">🎥</span>
            <p className="text-sm">No video selected</p>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition text-xs flex items-center gap-1"
            >
              <Plus size={14} />
              Add Video
            </button>
          </div>
        )}
      </div>

      {/* Add Video Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center">
          <div className="bg-gray-900 rounded-2xl p-5 w-80 border border-gray-700 shadow-2xl">
            <h2 className="text-lg font-bold mb-3">Add Video</h2>
            <div className="flex flex-col gap-3">
              <div>
                <label className="text-xs text-gray-400 mb-1 block font-semibold">Title</label>
                <input
                  type="text"
                  value={newVideoTitle}
                  onChange={(e) => setNewVideoTitle(e.target.value)}
                  placeholder="Enter video title"
                  className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-xs outline-none focus:border-indigo-500 transition"
                />
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1 block font-semibold">URL (.mp4)</label>
                <input
                  type="text"
                  value={newVideoUrl}
                  onChange={(e) => {
                    setNewVideoUrl(e.target.value);
                    setUrlError("");
                  }}
                  placeholder="https://example.com/video.mp4"
                  className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-xs outline-none focus:border-indigo-500 transition"
                />
                {urlError && <p className="text-red-400 text-xs mt-1">{urlError}</p>}
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <button
                onClick={addVideo}
                className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white py-2 rounded-lg text-xs font-semibold transition"
              >
                Add Video
              </button>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setUrlError("");
                }}
                className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-2 rounded-lg text-xs transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Text Overlay Modal */}
      {showTextOverlayModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center">
          <div className="bg-gray-900 rounded-2xl p-5 w-80 border border-gray-700 shadow-2xl">
            <h2 className="text-lg font-bold mb-3">Add Text Overlay</h2>
            <div className="flex flex-col gap-3">
              <div>
                <label className="text-xs text-gray-400 mb-1 block font-semibold">Text</label>
                <textarea
                  value={textOverlayInput}
                  onChange={(e) => setTextOverlayInput(e.target.value)}
                  placeholder="Enter text to overlay..."
                  className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-xs outline-none focus:border-indigo-500 transition resize-none"
                  rows={3}
                />
              </div>
              <p className="text-xs text-gray-400">
                Current time: {currentTime} - Text will appear for 5 seconds
              </p>
            </div>
            <div className="flex gap-2 mt-4">
              <button
                onClick={addTextOverlay}
                className="flex-1 bg-purple-600 hover:bg-purple-500 text-white py-2 rounded-lg text-xs font-semibold transition"
              >
                Add Overlay
              </button>
              <button
                onClick={() => {
                  setShowTextOverlayModal(false);
                  setTextOverlayInput("");
                }}
                className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-2 rounded-lg text-xs transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
