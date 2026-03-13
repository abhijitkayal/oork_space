"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import AuthModal from "@/components/AuthModal";

export default function LoginPage() {
  const [isModalOpen, setIsModalOpen] = useState(true);
  const router = useRouter();

  const handleClose = () => {
    setIsModalOpen(false);
    // Redirect to home or previous page
    router.push("/");
  };

  // Check if already logged in
  useEffect(() => {
    const token = document.cookie.includes("token=");
    if (token) {
      router.push("/");
    }
  }, [router]);

  return (
    <div className="min-h-screen bg-[#1a1625]">
      <AuthModal isOpen={isModalOpen} onClose={handleClose} />
    </div>
  );
}
