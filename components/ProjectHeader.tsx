

// "use client";

// import { useEffect, useRef, useState } from "react";
// import ShareButton from "./ShareButton";

// export const EMOJI_LIST = [
//   "😀","😃","😄","😁","😆","😅","😂","🤣","😊","😇",
//   "😉","😍","🥰","😘","😋","😎","🤓","🥳","😭","😡",

//   "📁","📂","🗂️","📋","📌","📍","🗃️","🗄️","💼","🏢",
//   "🔧","⚙️","🛠️","🔩","💡","🔑","🗝️","🔒","🔓","🎯",

//   "🌱","🌿","🍀","🌲","🌳","🌴","🌵","🌸","🌺","🌻",
//   "⭐","🌟","✨","💫","🔥","❄️","🌈","☀️","🌙","⚡",

//   "🎨","🎭","📷","🎥","🎬","📺","🎙️","📢","📣","🎵",
//   "🐶","🐱","🦊","🐻","🐼","🦁","🐯","🦋","🐝","🦅",

//   "🍕","🍔","🌮","🍜","🍣","🎂","☕","🍎","🍇","🥑",
//   "🏆","🥇","🎖️","🏅","🎗️","🎀","🎉","🎊","🎆","🎇",

//   "🚀","✈️","🚂","🚢","🏠","🏗️","🌍","🗺️","🧭","🔭",
//   "📚","📖","✏️","🖊️","📝","📓","📔","📒","📃","📜",

//   "✅","☑️","❌","⚠️","🔗","📎","🧑‍💻","👤","👥","💬",
//   "📅","🗓️","⏰","⌛","⏳","📊","📈","📉","💰","💳",
// ];

// interface Project {
//   _id: string;
//   emoji: string;
//   name: string;
// }

// export default function ProjectHeader({ project, isViewOnly = false }: { project: Project; isViewOnly?: boolean }) {
//   const [editingName, setEditingName] = useState(false);
//   const [showEmojiPicker, setShowEmojiPicker] = useState(false);

//   const [name, setName] = useState(project.name);
//   const [emoji, setEmoji] = useState(project.emoji);

//   const inputRef = useRef<HTMLInputElement | null>(null);
//   const pickerRef = useRef<HTMLDivElement | null>(null);

//   // focus name
//   useEffect(() => {
//     if (editingName) {
//       inputRef.current?.focus();
//       inputRef.current?.select();
//     }
//   }, [editingName]);

//   // sync
//   useEffect(() => {
//     setName(project.name);
//     setEmoji(project.emoji);
//   }, [project]);

//   // close picker on outside click
//   useEffect(() => {
//     const handleClick = (e: any) => {
//       if (!pickerRef.current?.contains(e.target)) {
//         setShowEmojiPicker(false);
//       }
//     };

//     document.addEventListener("mousedown", handleClick);
//     return () => document.removeEventListener("mousedown", handleClick);
//   }, []);

//   // API update
//   const updateProject = async (data: any) => {
//     await fetch(`/api/projects/${project._id}`, {
//       method: "PATCH",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify(data),
//     });
//   };

//   // save name
//   const saveName = async () => {
//     if (!name.trim() || name === project.name) {
//       setEditingName(false);
//       return;
//     }

//     await updateProject({ name });
//     setEditingName(false);
//   };

//   // select emoji
//   const handleEmojiClick = async (e: string) => {
//     setEmoji(e);
//     setShowEmojiPicker(false);
//     await updateProject({ emoji: e });
//   };

//   return (
//     <div className="flex items-center justify-between gap-4">
//       <div className="flex items-center gap-4 relative">

//       {/* ================= EMOJI ================= */}
//       <div className="relative">
//         <div
//           onClick={() => !isViewOnly && setShowEmojiPicker(true)}
//           className={`text-5xl px-2 rounded transition ${isViewOnly ? "cursor-default" : "cursor-pointer hover:bg-gray-100"}`}
//         >
//           {emoji || "📄"}
//         </div>

//         {/* CUSTOM PICKER */}
//         {showEmojiPicker && (
//           <div
//             ref={pickerRef}
//             className="absolute top-14 left-0 z-50 bg-white border rounded-xl shadow-lg p-3 w-[260px] max-h-[220px] overflow-y-auto"
//           >
//             <div className="grid grid-cols-8 gap-2">
//               {EMOJI_LIST.map((e, i) => (
//                 <button
//                   key={i}
//                   onClick={() => handleEmojiClick(e)}
//                   className="text-xl hover:bg-gray-100 rounded p-1"
//                 >
//                   {e}
//                 </button>
//               ))}
//             </div>
//           </div>
//         )}
//       </div>

//       {/* ================= NAME ================= */}
//       <div>
//         {editingName && !isViewOnly ? (
//           <input
//             ref={inputRef}
//             value={name}
//             onChange={(e) => setName(e.target.value)}
//             onBlur={saveName}
//             onKeyDown={(e) => {
//               if (e.key === "Enter") saveName();
//               if (e.key === "Escape") {
//                 setName(project.name);
//                 setEditingName(false);
//               }
//             }}
//             className="text-3xl font-extrabold outline-none border-b border-gray-300 bg-transparent"
//           />
//         ) : (
//           <h1
//             onClick={() => !isViewOnly && setEditingName(true)}
//             className={`text-3xl font-extrabold px-1 rounded transition ${isViewOnly ? "cursor-default" : "cursor-text hover:bg-gray-100"}`}
//           >
//             {name}
//           </h1>
//         )}
//       </div>
//       </div>

//       {/* ================= SHARE BUTTON ================= */}
//       {!isViewOnly && <ShareButton projectId={project._id} projectName={name} />}
//     </div>
//   );
// }

// interface Project {
//   emoji: string;
//   name: string;
// }

// export default function ProjectHeader({ project }: { project: Project }) {
//   return (
//     <div className="flex items-center gap-4">
//       <div className="text-5xl">{project.emoji}</div>
//       <div>
//         <h1 className="text-3xl font-extrabold">{project.name}</h1>
//         {/* <p className="text-sm text-gray-500 mt-1">
//           Notion-style project workspace
//         </p> */}
//       </div>
//     </div>
//   );
// }

"use client";

import { useEffect, useRef, useState } from "react";
import ShareButton from "./ShareButton";

export const EMOJI_LIST = [
  "😀","😃","😄","😁","😆","😅","😂","🤣","😊","😇",
  "😉","😍","🥰","😘","😋","😎","🤓","🥳","😭","😡",

  "📁","📂","🗂️","📋","📌","📍","🗃️","🗄️","💼","🏢",
  "🔧","⚙️","🛠️","🔩","💡","🔑","🗝️","🔒","🔓","🎯",

  "🌱","🌿","🍀","🌲","🌳","🌴","🌵","🌸","🌺","🌻",
  "⭐","🌟","✨","💫","🔥","❄️","🌈","☀️","🌙","⚡",

  "🎨","🎭","📷","🎥","🎬","📺","🎙️","📢","📣","🎵",
  "🐶","🐱","🦊","🐻","🐼","🦁","🐯","🦋","🐝","🦅",

  "🍕","🍔","🌮","🍜","🍣","🎂","☕","🍎","🍇","🥑",
  "🏆","🥇","🎖️","🏅","🎗️","🎀","🎉","🎊","🎆","🎇",

  "🚀","✈️","🚂","🚢","🏠","🏗️","🌍","🗺️","🧭","🔭",
  "📚","📖","✏️","🖊️","📝","📓","📔","📒","📃","📜",

  "✅","☑️","❌","⚠️","🔗","📎","🧑‍💻","👤","👥","💬",
  "📅","🗓️","⏰","⌛","⏳","📊","📈","📉","💰","💳",
];

interface Project {
  _id: string;
  emoji: string;
  name: string;
}

export default function ProjectHeader({ project, isViewOnly = false }: { project: Project; isViewOnly?: boolean }) {
  const [editingName, setEditingName] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const [name, setName] = useState(project.name);
  const [emoji, setEmoji] = useState(project.emoji);

  const inputRef = useRef<HTMLInputElement | null>(null);
  const pickerRef = useRef<HTMLDivElement | null>(null);

  // focus name
  useEffect(() => {
    if (editingName) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [editingName]);

  // sync
  useEffect(() => {
    setName(project.name);
    setEmoji(project.emoji);
  }, [project]);

  // close picker on outside click
  useEffect(() => {
    const handleClick = (e: any) => {
      if (!pickerRef.current?.contains(e.target)) {
        setShowEmojiPicker(false);
      }
    };

    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // API update
  const updateProject = async (data: any) => {
    await fetch(`/api/projects/${project._id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
  };

  // save name
  const saveName = async () => {
    if (!name.trim() || name === project.name) {
      setEditingName(false);
      return;
    }

    await updateProject({ name });
    setEditingName(false);
  };

  // select emoji
  const handleEmojiClick = async (e: string) => {
    setEmoji(e);
    setShowEmojiPicker(false);
    await updateProject({ emoji: e });
  };

  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex items-center gap-4 relative">

      {/* ================= EMOJI ================= */}
      <div className="relative">
        <div
          onClick={() => !isViewOnly && setShowEmojiPicker(true)}
          className={`text-5xl px-2 rounded transition ${isViewOnly ? "cursor-default" : "cursor-pointer hover:bg-gray-100"}`}
        >
          {emoji || "📄"}
        </div>

        {/* CUSTOM PICKER */}
        {showEmojiPicker && (
          <div
            ref={pickerRef}
            className="absolute top-14 left-0 z-50 bg-white border rounded-xl shadow-lg p-3 w-[260px] max-h-[220px] overflow-y-auto"
          >
            <div className="grid grid-cols-8 gap-2">
              {EMOJI_LIST.map((e, i) => (
                <button
                  key={i}
                  onClick={() => handleEmojiClick(e)}
                  className="text-xl hover:bg-gray-100 rounded p-1"
                >
                  {e}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ================= NAME ================= */}
      <div>
        {editingName && !isViewOnly ? (
          <input
            ref={inputRef}
            value={name}
            onChange={(e) => setName(e.target.value)}
            onBlur={saveName}
            onKeyDown={(e) => {
              if (e.key === "Enter") saveName();
              if (e.key === "Escape") {
                setName(project.name);
                setEditingName(false);
              }
            }}
            className="text-3xl font-extrabold outline-none border-b border-gray-300 bg-transparent"
          />
        ) : (
          <h1
            onClick={() => !isViewOnly && setEditingName(true)}
            className={`text-3xl font-extrabold px-1 rounded transition ${isViewOnly ? "cursor-default" : "cursor-text hover:bg-gray-100"}`}
          >
            {name}
          </h1>
        )}
      </div>
      </div>

      {/* ================= SHARE BUTTON ================= */}
      {!isViewOnly && <ShareButton projectId={project._id} projectName={name} />}
    </div>
  );
}