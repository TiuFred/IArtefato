"use client";

import { signOut } from "next-auth/react";

export function LogoutButton() {
  async function handleLogout() {
    await signOut({ callbackUrl: "/login" });
  }

  return (
    <button
      onClick={handleLogout}
      style={{
        padding: "4px 12px", background: "transparent",
        border: "1px solid #1e1e2e", borderRadius: 6,
        color: "#475569", fontSize: 13, cursor: "pointer",
        transition: "all 0.15s",
      }}
      onMouseEnter={(e) => {
        (e.target as HTMLButtonElement).style.borderColor = "#f87171";
        (e.target as HTMLButtonElement).style.color = "#f87171";
      }}
      onMouseLeave={(e) => {
        (e.target as HTMLButtonElement).style.borderColor = "#1e1e2e";
        (e.target as HTMLButtonElement).style.color = "#475569";
      }}
    >
      Sair
    </button>
  );
}
