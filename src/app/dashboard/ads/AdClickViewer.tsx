"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

type AdParams = { id: string; title: string; url: string; duration: number; reward: string };

export default function AdClickViewer({ ads }: { ads: AdParams[] }) {
    const router = useRouter();

    const [activeAd, setActiveAd] = useState<AdParams | null>(null);
    const [timeLeft, setTimeLeft] = useState(0);
    const [isWatching, setIsWatching] = useState(false);
    const [secretToken, setSecretToken] = useState<string | null>(null);
    const [rewardReady, setRewardReady] = useState(false);

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    // Anti-Cheat Refs
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const hasMovedMouse = useRef(false);

    // ANTI-CHEAT: Phase 3 (The Watch) - Page Visibility & Bot Motions
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.hidden && isWatching && !rewardReady) {
                if (timerRef.current) clearInterval(timerRef.current);
                setError("Anti-Cheat: You left the tab! The timer has completely stopped. You must keep the ad visible.");
            } else if (!document.hidden && activeAd && isWatching && timeLeft > 0 && !rewardReady) {
                // They came back, clear the error and let them resume (or heavily penalize them)
                setError("");
                resumeTimer();
            }
        };

        const handleInteractiveMotion = () => {
            hasMovedMouse.current = true;
        };

        document.addEventListener("visibilitychange", handleVisibilityChange);
        window.addEventListener("mousemove", handleInteractiveMotion);
        window.addEventListener("keydown", handleInteractiveMotion);
        window.addEventListener("touchstart", handleInteractiveMotion);

        return () => {
            document.removeEventListener("visibilitychange", handleVisibilityChange);
            window.removeEventListener("mousemove", handleInteractiveMotion);
            window.removeEventListener("keydown", handleInteractiveMotion);
            window.removeEventListener("touchstart", handleInteractiveMotion);
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [isWatching, activeAd, timeLeft, rewardReady]);

    const startAdCycle = async (ad: AdParams) => {
        try {
            setError("");
            setSuccess("");

            // Phase 2: The Initiation & Security Check
            const res = await fetch("/api/ads/start", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ad_id: ad.id })
            });
            const data = await res.json();

            if (!res.ok) throw new Error(data.error || "Failed to initiate secure ad cycle.");

            setSecretToken(data.token);
            setActiveAd(ad);
            setTimeLeft(ad.duration);
            setIsWatching(true);
            setRewardReady(false);
            hasMovedMouse.current = false; // Reset bot check

            // Open AD link in new tab, but focus must remain here for the timer
            window.open(ad.url, "_blank");

        } catch (err: any) {
            setError(err.message);
        }
    };

    const resumeTimer = () => {
        if (timerRef.current) clearInterval(timerRef.current);
        timerRef.current = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(timerRef.current!);

                    // Bot Check Validation Checkpoint
                    if (!hasMovedMouse.current) {
                        setError("Anti-Cheat: Potential Bot Detected. Device remained perfectly motionless for the entire duration.");
                        setIsWatching(false);
                        return 0;
                    }

                    // Timer complete! Wait for user to click submit
                    setRewardReady(true);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    };

    // Auto-start timer after successfully getting a token (if tab is active)
    useEffect(() => {
        if (isWatching && activeAd && secretToken && timeLeft === activeAd.duration && !document.hidden && !rewardReady) {
            resumeTimer();
        }
    }, [isWatching, activeAd, secretToken]);

    const submitReward = async () => {
        setIsWatching(false);
        setRewardReady(false);

        try {
            // Phase 4: The Submission & Payout (Atomic Transaction)
            const res = await fetch("/api/ads/verify", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token: secretToken }),
            });
            const data = await res.json();

            if (!res.ok) throw new Error(data.error);

            setSuccess(`Success! The unbreakable transaction cleared. You earned $${data.reward}`);
            setActiveAd(null);
            setSecretToken(null);
            router.refresh(); // Refresh dashboard metrics & limits
        } catch (err: any) {
            setError(err.message);
            setActiveAd(null);
        }
    };

    const cancelAd = () => {
        setIsWatching(false);
        setActiveAd(null);
        setSecretToken(null);
        setRewardReady(false);
        setError("");
        if (timerRef.current) clearInterval(timerRef.current);
    }

    if (activeAd) {
        return (
            <div className="bg-white p-8 rounded-xl shadow border-t-4 border-primary text-center">
                <h2 className="text-2xl font-bold mb-4">Watching: {activeAd.title}</h2>

                {!rewardReady ? (
                    <div className="text-6xl font-mono test-timer tracking-tighter text-primary mb-4">
                        00:{timeLeft.toString().padStart(2, "0")}
                    </div>
                ) : (
                    <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded text-green-800">
                        <span className="text-2xl block mb-2">ðŸŽ‰</span>
                        <h3 className="font-bold text-lg">Verification Complete</h3>
                        <p className="text-sm">Click the button below to submit the secure token and claim your reward.</p>
                    </div>
                )}

                {error && (
                    <div className="mb-6 p-3 bg-red-100 text-red-800 rounded font-bold animate-pulse">
                        âš ï¸ {error}
                    </div>
                )}

                {!rewardReady && isWatching && !error && (
                    <div className="text-gray-500 animate-pulse text-sm">
                        Keep this tab visible on your screen to earn your reward. The system is tracking tab visibility and verifying humanity.
                    </div>
                )}

                <div className="mt-8 flex justify-center space-x-4">
                    {rewardReady && (
                        <button onClick={submitReward} className="bg-primary text-white font-bold px-8 py-3 rounded-md hover:bg-orange-700 shadow-md">
                            Claim ${activeAd.reward} Reward
                        </button>
                    )}
                    <button onClick={cancelAd} className="bg-gray-100 text-gray-700 font-bold px-6 py-3 rounded-md hover:bg-gray-200">
                        Cancel & Return
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-900 border-b pb-4">Earn Money (Ad Click)</h1>

            {error && (
                <div className="p-4 bg-red-100 text-red-800 rounded font-bold">
                    âŒ {error}
                </div>
            )}

            {success && (
                <div className="p-4 bg-green-100 text-green-800 border-l-4 border-green-600 rounded font-bold">
                    âœ… {success}
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {ads.map((ad) => (
                    <div key={ad.id} className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-2 h-full bg-blue-500 opacity-20"></div>
                        <h3 className="font-bold text-gray-900 truncate mb-1" title={ad.title}>{ad.title}</h3>
                        <p className="text-xs text-gray-500 mb-4 truncate">{ad.url}</p>

                        <div className="flex justify-between items-center mb-4">
                            <span className="bg-green-100 text-green-800 text-xs font-bold px-2 py-1 rounded">
                                ${ad.reward}
                            </span>
                            <span className="bg-orange-100 text-orange-800 text-xs font-bold px-2 py-1 rounded flex items-center">
                                <span className="mr-1">â±ï¸</span> {ad.duration}s
                            </span>
                        </div>

                        <button
                            onClick={() => startAdCycle(ad)}
                            className="w-full bg-primary text-white text-sm font-bold py-2 rounded hover:bg-opacity-90 shadow"
                        >
                            Watch Ad
                        </button>
                    </div>
                ))}

                {ads.length === 0 && (
                    <div className="col-span-full p-8 text-center text-gray-500 bg-white rounded-lg shadow-sm border border-gray-100">
                        No ads available right now. You've cleared the board or are waiting on cooldowns!
                    </div>
                )}
            </div>
        </div>
    );
}
