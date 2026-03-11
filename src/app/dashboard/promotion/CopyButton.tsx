"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";

export function CopyButton({ textToCopy, isSmall = false }: { textToCopy: string, isSmall?: boolean }) {
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(textToCopy);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy text: ', err);
        }
    };

    return (
        <button
            onClick={handleCopy}
            className={`flex items-center justify-center transition-all ${isSmall
                    ? "p-2 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-white"
                    : "px-6 bg-gray-100 hover:bg-gray-200 text-[#151d48] font-bold"
                }`}
            title="Copy to clipboard"
        >
            {copied ? (
                <Check size={isSmall ? 16 : 20} className="text-green-500" />
            ) : (
                <Copy size={isSmall ? 16 : 20} />
            )}
            {!isSmall && <span className="ml-2">{copied ? 'Copied' : 'Copy'}</span>}
        </button>
    );
}
