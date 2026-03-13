// // 'use client';

// import React from 'react';
// import { useTheme } from 'next-themes';
// import { Search, Mic, Bell, Inbox, ChevronDown, Plus } from 'lucide-react';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import { Badge } from '@/components/ui/badge';
// import { Separator } from '@/components/ui/separator';
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuTrigger,
// } from '@/components/ui/dropdown-menu';

// export default function Header() {
//   const { resolvedTheme } = useTheme();

//   const isDark = resolvedTheme === 'dark';

//   return (
//     <div className={`px-6 py-4 transition-colors duration-400 border-b
//       ${isDark ? 'bg-[#0F1014] border-gray-800' : 'bg-teal-50 border-teal-200'}`}>
//       <div className="flex items-center justify-between flex-wrap gap-4">

//         {/* Left Section - Project Info */}
//         <div className="flex flex-col ml-14 gap-1">
//           <div className="flex items-center gap-3">
//             <div className="w-4 h-4 rounded-full border-2 border-[#6366f1]"></div>
//             <div className={`font-semibold text-lg ${isDark ? 'text-white' : 'text-gray-900'}`}>Team Project</div>

//             {/* Avatars */}
//             <div className="flex -space-x-2 ml-2">
//               {[1, 2, 3].map((i) => (
//                 <div key={i} className={`w-6 h-6 rounded-full bg-gray-${i * 100 + 400} border-2 
//                   ${isDark ? 'border-[#0F1014]' : 'border-rose-50'}`}></div>
//               ))}
//               <Badge variant="outline" className={`w-6 h-6 rounded-full flex items-center justify-center text-[8px] p-0 
//                 ${isDark ? 'bg-[#1F2125] border-[#0F1014] text-gray-400' : 'bg-gray-200 border-rose-50 text-gray-600'}`}>
//                 +4
//               </Badge>
//             </div>

//             <Button variant="ghost" size="icon" className={`w-6 h-6 rounded-full border border-dashed
//               ${isDark ? 'border-gray-600 text-gray-400 hover:text-white' : 'border-gray-400 text-gray-500 hover:text-gray-900'}`}>
//               <Plus className="h-3 w-3" />
//             </Button>
//           </div>

//           <div className="relative pl-2 flex items-center">
//             <div className={`absolute left-[7px] -top-3 w-4 h-6 border-b border-l rounded-bl-lg ${isDark ? 'border-gray-600' : 'border-gray-400'}`}></div>
//             <div className={`text-sm ml-6 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
//               Website / Apps / Dribbble Shot
//             </div>
//           </div>
//         </div>

//         {/* Center Section - Search */}
//         <div className="flex-1 max-w-md">
//           <div className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors
//             ${isDark ? 'bg-[#18191d] border-transparent' : 'bg-white border-rose-200'}`}>
//             <Search size={16} className="text-gray-400" />
//             <Input
//               type="text"
//               placeholder="Type to search"
//               className={`bg-transparent text-sm border-0 h-auto p-0 focus-visible:ring-0 focus-visible:ring-offset-0 ${isDark ? 'text-gray-200' : 'text-gray-900'}`}
//             />
//             <Mic size={16} className="text-gray-400" />
//           </div>
//         </div>

//         {/* Right Section - Actions */}
//         <div className="flex items-center gap-4">
//           <div className="flex items-center gap-3 text-gray-400">
//             <Button variant="ghost" size="icon" className={`rounded-full relative
//               ${isDark ? 'hover:bg-white/5 hover:text-white' : 'hover:bg-rose-200/50 hover:text-gray-900'}`}>
//               <Bell size={20} />
//               <div className={`absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full border 
//                 ${isDark ? 'border-[#0F1014]' : 'border-white'}`}></div>
//             </Button>

//             <Button variant="outline" size="icon" className={`
//               ${isDark ? 'border-gray-700 hover:bg-white/5 hover:text-white' : 'border-rose-200 hover:bg-rose-200/50 hover:text-gray-900'}`}>
//               <Inbox size={20} />
//             </Button>

//             <Button variant="outline" size="sm" className={`
//               ${isDark ? 'bg-[#1F2125] hover:bg-[#2a2c30] text-gray-300 border-transparent' : 'bg-white hover:bg-rose-50 text-gray-700 border-rose-200'}`}>
//               Share
//             </Button>

//             <DropdownMenu>
//               <DropdownMenuTrigger asChild>
//                 <Button variant="outline" size="sm" className={`gap-0 px-0 overflow-hidden
//                   ${isDark ? 'bg-[#1F2125] border-gray-800' : 'bg-white border-rose-200'}`}>
//                   <span className={`px-3 border-r ${isDark ? 'border-gray-800' : 'border-rose-200'}`}>Link</span>
//                   <span className="px-2">
//                     <ChevronDown size={14} />
//                   </span>
//                 </Button>
//               </DropdownMenuTrigger>
//               <DropdownMenuContent align="end">
//                 <DropdownMenuItem>Copy Link</DropdownMenuItem>
//                 <DropdownMenuItem>Share via Email</DropdownMenuItem>
//                 <DropdownMenuItem>Generate QR Code</DropdownMenuItem>
//               </DropdownMenuContent>
//             </DropdownMenu>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }



"use client";

import React from "react";
import { useTheme } from "next-themes";
import { useRouter } from "next/navigation";
import {
  Search,
  Mic,
  Bell,
  Inbox,
  ChevronDown,
  Plus,
  LogOut,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import {
  generateLink,
  copyToClipboard,
  shareWhatsApp,
} from "@/lib/share";
import { useAuth } from "./AuthContext";

export default function Header() {
  const { resolvedTheme } = useTheme();
  const router = useRouter();
  const { logout, user } = useAuth();
  const isDark = resolvedTheme === "dark";

  const PAGE_ID = "123"; // 🔥 dynamic later

  const viewLink = generateLink(PAGE_ID, "view");
  const editLink = generateLink(PAGE_ID, "edit");

  return (
    <div
      className={`px-6 py-4 border-b ${
        isDark
          ? "bg-[#0F1014] border-gray-800"
          : "bg-teal-50 border-teal-200"
      }`}
    >
      <div className="flex justify-between items-center">

        {/* LEFT */}
        <div className="flex items-center gap-3 ml-14">
          <div className="w-4 h-4 rounded-full border-2 border-indigo-500"></div>
          <h2 className={`${isDark ? "text-white" : "text-black"}`}>
            Team Project
          </h2>
        </div>

        {/* CENTER */}
        <div className="flex-1 max-w-md mx-6">
          <div
            className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
              isDark ? "bg-[#18191d]" : "bg-white"
            }`}
          >
            <Search size={16} />
            <Input placeholder="Search..." className="border-0" />
            <Mic size={16} />
          </div>
        </div>

        {/* RIGHT */}
        <div className="flex gap-3 items-center">

          {/* 🔥 WHATSAPP SHARE */}
          <Button
            onClick={() => shareWhatsApp(viewLink)}
            className="bg-green-600 text-white"
          >
            Share
          </Button>

          {/* 🔗 DROPDOWN */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                Link <ChevronDown size={14} />
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end">

              <DropdownMenuItem
                onClick={() => copyToClipboard(viewLink)}
              >
                Copy View Link
              </DropdownMenuItem>

              <DropdownMenuItem
                onClick={() => copyToClipboard(editLink)}
              >
                Copy Edit Link
              </DropdownMenuItem>

              <DropdownMenuItem
                onClick={() => shareWhatsApp(viewLink)}
              >
                Share View (WhatsApp)
              </DropdownMenuItem>

              <DropdownMenuItem
                onClick={() => shareWhatsApp(editLink)}
              >
                Share Edit (WhatsApp)
              </DropdownMenuItem>

            </DropdownMenuContent>
          </DropdownMenu>

          {/* 3D Logout Button */}
          <button
            onClick={logout}
            className="relative px-4 py-2 rounded-xl font-semibold text-sm text-white
              bg-gradient-to-br from-rose-500 via-pink-500 to-purple-500
              shadow-lg shadow-pink-500/25
              hover:shadow-xl hover:shadow-pink-500/40
              transform hover:-translate-y-0.5 hover:scale-105
              transition-all duration-200
              before:absolute before:inset-0 before:rounded-xl before:bg-white/20
              before:opacity-0 hover:before:opacity-100
              after:absolute after:bottom-0 after:left-2 after:right-2 after:h-1
              after:bg-black/20 after:rounded-b-lg
              after:opacity-0 hover:after:opacity-100
              active:translate-y-0 active:scale-95"
          >
            <span className="relative z-10 flex items-center gap-2">
              <LogOut size={16} />
              Logout
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}