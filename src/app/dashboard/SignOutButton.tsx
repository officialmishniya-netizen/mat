"use client";

import { LogOut } from "lucide-react";
import { logoutAction } from "@/app/actions/auth";

export function SignOutButton() {
    return (
        <button
            onClick={async () => {
                await logoutAction();
            }}
            className="flex w-full items-center space-x-3 text-red-500 hover:bg-red-50 p-2 rounded-md transition-colors"
        >
            <LogOut size={20} /> <span>Sign Out</span>
        </button>
    );
}
