"use client";

import { useState, useRef } from "react";
import { spinWheelAction } from "@/app/actions/marketplace";
import { Zap, Loader2, Trophy, ArrowUp } from "lucide-react";

export function SpinWheelClient({ config, slices, userId }: { config: any, slices: any[], userId: string }) {
    const [isSpinning, setIsSpinning] = useState(false);
    const [rotation, setRotation] = useState(0);
    const [result, setResult] = useState<any>(null);
    const [showResult, setShowResult] = useState(false);
    const wheelRef = useRef<HTMLDivElement>(null);

    const spin = async () => {
        if (isSpinning) return;

        setIsSpinning(true);
        setShowResult(false);
        setResult(null);

        const res = await spinWheelAction(config.id) as any;

        if (!res.success) {
            alert(res.error || "Spin failed");
            setIsSpinning(false);
            return;
        }

        // Calculate target rotation
        const sliceCount = slices.length;
        const sliceAngle = 360 / sliceCount;
        const winningIndex = slices.findIndex(s => s.id === res.slice.id);

        // We want the pointer (at 0 deg) to point at the center of the winning slice
        // The slices are arranged clockwise. Slice 0 is [0, sliceAngle]
        // Its center is sliceAngle / 2.
        // To bring slice i'S center to 0, we rotate by -(i * sliceAngle + sliceAngle/2)
        const fullSpins = 8; // 8 full spins for drama
        const targetRotation = (fullSpins * 360) - (winningIndex * sliceAngle + (sliceAngle / 2));

        // Accumulate rotation so it always spins forward
        const currentBase = Math.floor(rotation / 360) * 360;
        const newRotation = currentBase + targetRotation + 360; // Extra 360 safety

        setRotation(newRotation);
        setResult(res.slice);

        // Wait for animation to finish (5s)
        setTimeout(() => {
            setIsSpinning(false);
            setShowResult(true);
        }, 5100);
    };

    // Construct the conic gradient string
    const gradient = slices.map((s, i) => {
        const start = (i * (360 / slices.length)).toFixed(2);
        const end = ((i + 1) * (360 / slices.length)).toFixed(2);
        return `${s.colorHex || '#primary'} ${start}deg ${end}deg`;
    }).join(", ");

    return (
        <div className="flex flex-col items-center gap-12 w-full max-w-xl">
            {/* The Pointer */}
            <div className="relative z-20 flex flex-col items-center">
                <div className="w-0 h-0 border-l-[15px] border-l-transparent border-r-[15px] border-r-transparent border-t-[30px] border-t-indigo-600 drop-shadow-xl animate-bounce"></div>
            </div>

            {/* The Wheel Container */}
            <div className="relative group">
                {/* Outer Glow */}
                <div className="absolute inset-0 bg-primary/20 rounded-full blur-3xl group-hover:bg-primary/30 transition-all duration-700"></div>

                {/* Outer Border Ring */}
                <div className="relative w-[340px] h-[340px] md:w-[460px] md:h-[460px] rounded-full p-4 bg-white shadow-2xl border-8 border-gray-50 flex items-center justify-center overflow-hidden">

                    {/* The Spinning Wheel */}
                    <div
                        ref={wheelRef}
                        className="w-full h-full rounded-full border-4 border-[#151d48]/10 shadow-inner relative overflow-hidden"
                        style={{
                            background: `conic-gradient(${gradient})`,
                            transform: `rotate(${rotation}deg)`,
                            transition: 'transform 5s cubic-bezier(0.15, 0, 0.15, 1)'
                        }}
                    >
                        {/* Slice Labels */}
                        {slices.map((slice, i) => {
                            const angle = (i * (360 / slices.length)) + (360 / slices.length / 2);
                            return (
                                <div
                                    key={slice.id}
                                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 origin-left text-white font-black text-xs md:text-sm whitespace-nowrap pt-1 pl-[150px] md:pl-[200px] flex items-center gap-2 drop-shadow-lg"
                                    style={{ transform: `translate(-50%, -50%) rotate(${angle - 90}deg)` }}
                                >
                                    <span style={{ transform: 'rotate(90deg)' }}>{slice.label}</span>
                                </div>
                            );
                        })}
                    </div>

                    {/* Center Pin */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 md:w-28 md:h-28 bg-white rounded-full border-4 md:border-8 border-gray-50 shadow-2xl z-10 flex flex-col items-center justify-center text-[#151d48] overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 to-transparent"></div>
                        <Zap size={24} className="text-primary animate-pulse relative z-10" />
                        <span className="text-[10px] font-black tracking-tighter relative z-10 uppercase mt-1">Nexus</span>
                    </div>
                </div>
            </div>

            {/* Action Button */}
            <div className="w-full space-y-4 text-center">
                <button
                    onClick={spin}
                    disabled={isSpinning}
                    className={`w-full max-w-sm h-20 rounded-[2.5rem] font-black text-lg uppercase tracking-widest flex items-center justify-center gap-3 transition-all transform shadow-2xl border-4 ${isSpinning
                        ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                        : 'bg-indigo-600 text-white border-white/20 hover:scale-105 active:scale-95 hover:bg-indigo-500 shadow-indigo-600/20'}`}
                >
                    {isSpinning ? (
                        <>
                            <Loader2 className="animate-spin" /> Spinning...
                        </>
                    ) : (
                        <>
                            <Zap className="text-yellow-400" /> Spin Now
                        </>
                    )}
                </button>
                <p className="text-xs font-black text-[#737791] uppercase tracking-[0.2em]">Next Free Spin: Cycle Completion</p>
            </div>

            {/* Win Overlay/Modal */}
            {showResult && result && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-white/60 backdrop-blur-2xl animate-in fade-in duration-500">
                    <div className="bg-white rounded-[4rem] p-12 max-w-lg w-full text-center shadow-[0_32px_128px_-12px_rgba(0,0,0,0.1)] border border-gray-100 relative overflow-hidden animate-in zoom-in-95 duration-500">
                        {/* Confetti-like backgrounds */}
                        <div className="absolute top-0 left-0 w-32 h-32 bg-primary/20 rounded-full -ml-16 -mt-16 blur-2xl"></div>
                        <div className="absolute bottom-0 right-0 w-32 h-32 bg-blue-500/20 rounded-full -mr-16 -mb-16 blur-2xl"></div>

                        <div className="w-24 h-24 bg-primary rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-xl shadow-primary/20 rotate-12 group-hover:rotate-0 transition-transform">
                            <Trophy size={48} className="text-white" />
                        </div>

                        <h2 className="text-4xl font-black text-[#151d48] tracking-tighter mb-4">Ultimate Victory!</h2>
                        <p className="text-gray-500 font-bold mb-8">Your reward has been credited to your account instantly.</p>

                        <div className="bg-gray-50 rounded-[2.5rem] p-8 mb-10 border border-gray-100">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">You Won</p>
                            <p className="text-5xl font-black text-primary tracking-tighter">{result.label}</p>
                        </div>

                        <button
                            onClick={() => setShowResult(false)}
                            className="w-full h-16 bg-indigo-600 text-white rounded-[2rem] font-black uppercase tracking-widest hover:bg-indigo-500 transition-all flex items-center justify-center gap-3 shadow-xl shadow-indigo-600/20"
                        >
                            Claim Reward <ArrowUp className="rotate-45" size={20} />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
