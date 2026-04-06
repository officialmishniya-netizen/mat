"use client";

import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

interface LaunchCountdownProps {
    launchDate: string;
}

export default function LaunchCountdown({ launchDate }: LaunchCountdownProps) {
    const [timeLeft, setTimeLeft] = useState<{ days: number; hours: number; minutes: number; seconds: number } | null>(null);
    const [isLaunched, setIsLaunched] = useState(false);

    useEffect(() => {
        const targetDate = new Date(launchDate).getTime();

        const calculateTimeLeft = () => {
            const now = new Date().getTime();
            const difference = targetDate - now;

            if (difference <= 0) {
                setIsLaunched(true);
                return null;
            }

            return {
                days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
                minutes: Math.floor((difference / 1000 / 60) % 60),
                seconds: Math.floor((difference / 1000) % 60)
            };
        };

        const timer = setInterval(() => {
            const left = calculateTimeLeft();
            setTimeLeft(left);
        }, 1000);

        // Initial call
        setTimeLeft(calculateTimeLeft());

        return () => clearInterval(timer);
    }, [launchDate]);

    if (isLaunched || !timeLeft) return null;

    return (
        <div className="w-full bg-gradient-to-r from-orange-600/20 via-primary/10 to-orange-600/20 border-y border-white/5 backdrop-blur-md py-6 mb-12 animate-fade-in">
            <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-center gap-8">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary animate-pulse">
                        <Clock size={20} />
                    </div>
                    <div>
                        <h3 className="text-sm font-black uppercase tracking-widest text-white">Official Launch Countdown</h3>
                        <p className="text-[10px] text-white/40 font-bold">PRE-REGISTRATION NOW OPEN</p>
                    </div>
                </div>

                <div className="flex gap-4">
                    {[
                        { label: 'Days', value: timeLeft.days },
                        { label: 'Hours', value: timeLeft.hours },
                        { label: 'Mins', value: timeLeft.minutes },
                        { label: 'Secs', value: timeLeft.seconds }
                    ].map((unit) => (
                        <div key={unit.label} className="flex flex-col items-center">
                            <div className="bg-white/5 border border-white/10 rounded-xl w-16 h-16 flex items-center justify-center mb-1">
                                <span className="text-2xl font-black text-white">{unit.value.toString().padStart(2, '0')}</span>
                            </div>
                            <span className="text-[9px] font-black uppercase text-white/30 tracking-tighter">{unit.label}</span>
                        </div>
                    ))}
                </div>

                <div className="hidden lg:block h-10 w-px bg-white/10 mx-4" />

                <div className="flex flex-col items-center md:items-start">
                    <div className="flex -space-x-2 mb-2">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="w-6 h-6 rounded-full border-2 border-[#07070f] bg-gray-800 flex items-center justify-center text-[8px] font-bold overflow-hidden">
                                <img src={`https://i.pravatar.cc/100?u=${i}`} alt="user" />
                            </div>
                        ))}
                        <div className="w-6 h-6 rounded-full border-2 border-[#07070f] bg-primary flex items-center justify-center text-[8px] font-black text-white">
                            +12k
                        </div>
                    </div>
                    <p className="text-[10px] text-white/60 font-medium">Join <span className="text-white font-black">12,402+</span> waiting in the wings.</p>
                </div>
            </div>
        </div>
    );
}
