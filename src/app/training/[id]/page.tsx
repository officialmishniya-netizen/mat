import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { BookOpen, CheckCircle, ArrowRight, PlayCircle, Star, ShieldCheck } from "lucide-react";

export async function generateMetadata({ params }: { params: { id: string } }) {
    return {
        title: `${params.id}'s Training Hub | PTC Nexus`,
        description: `Learn how to succeed on PTC Nexus with ${params.id}.`
    };
}

export default async function PublicTrainingPage({
    params
}: {
    params: { id: string }
}) {
    const { id: username } = params;

    const sponsor = await db.select().from(users).where(eq(users.username, username)).limit(1).then(res => res[0]);

    if (!sponsor) {
        notFound();
    }

    // Mock modules (In real app, fetch from `trainingModules` table where userId = sponsor.id)
    const modules = [
        {
            id: 1,
            title: "Getting Started with PTC Nexus",
            description: "Learn the basics of clicking ads and earning your first dollars.",
            duration: "5 min",
            type: "video"
        },
        {
            id: 2,
            title: "How to Upgrade and Cycle",
            description: "An overview of our powerful matrix system and ad packs.",
            duration: "10 min",
            type: "article"
        },
    ];

    return (
        <div className="min-h-screen bg-[#f8f9fc]">
            
            {/* Header */}
            <header className="bg-[#151d48] text-white py-12 relative overflow-hidden">
                <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '30px 30px' }}></div>
                <div className="container mx-auto px-4 relative z-10">
                    <div className="flex flex-col md:flex-row items-center gap-6 max-w-4xl mx-auto">
                        <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-orange-400 to-red-500 flex items-center justify-center text-white font-black text-4xl shadow-xl border-4 border-white/20 shrink-0">
                            {sponsor.username.charAt(0).toUpperCase()}
                        </div>
                        <div className="text-center md:text-left">
                            <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
                                <ShieldCheck className="w-5 h-5 text-green-400" />
                                <span className="text-green-400 font-bold uppercase tracking-widest text-xs">Verified Sponsor</span>
                            </div>
                            <h1 className="text-3xl md:text-4xl font-black mb-2">{sponsor.username}'s Training Hub</h1>
                            <p className="text-blue-200 text-lg max-w-2xl">Welcome to my personal training area! Complete these modules to learn my exact strategies for building a passive income on PTC Nexus.</p>
                        </div>
                    </div>
                </div>
            </header>

            {/* Content */}
            <div className="container mx-auto px-4 py-12">
                <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
                    
                    {/* Main Course Path */}
                    <div className="md:col-span-2 space-y-6">
                        <h2 className="text-2xl font-black text-[#151d48] mb-6 flex items-center">
                            <BookOpen className="w-6 h-6 mr-3 text-orange-500" />
                            Your Learning Path
                        </h2>

                        <div className="space-y-4 relative before:absolute before:inset-0 before:ml-6 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-gray-200 before:to-transparent">
                            {modules.map((mod, idx) => (
                                <div key={mod.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                                    <div className="flex items-center justify-center w-12 h-12 rounded-full border-4 border-white bg-orange-500 text-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                                        <span className="font-black">{idx + 1}</span>
                                    </div>
                                    <div className="w-[calc(100%-4rem)] md:w-[calc(50%-3rem)] p-6 rounded-2xl bg-white shadow-sm border border-gray-100 hover:border-orange-200 transition-colors">
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest bg-blue-50 text-blue-600">
                                                {mod.type}
                                            </span>
                                            <span className="text-xs text-gray-400 font-bold flex items-center">
                                                <PlayCircle className="w-3.5 h-3.5 mr-1" /> {mod.duration}
                                            </span>
                                        </div>
                                        <h3 className="text-lg font-bold text-[#151d48] mb-2">{mod.title}</h3>
                                        <p className="text-sm text-gray-500 mb-4">{mod.description}</p>
                                        <Button className="w-full bg-gray-50 hover:bg-orange-50 text-gray-700 hover:text-orange-600 font-bold border-none shadow-none rounded-xl">
                                            Start Module <ArrowRight className="w-4 h-4 ml-2" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Sidebar CTA */}
                    <div className="md:col-span-1">
                        <div className="bg-gradient-to-br from-orange-500 to-red-600 rounded-3xl p-6 text-white shadow-lg shadow-orange-500/20 sticky top-8">
                            <Star className="w-10 h-10 text-yellow-300 mb-4" />
                            <h3 className="text-xl font-black mb-2">Ready to start earning?</h3>
                            <p className="text-sm text-orange-100 mb-6">Join my team today and apply what you've learned. It's 100% free to sign up and start clicking.</p>
                            <Link href={`/r/${sponsor.username}`}>
                                <Button className="w-full h-12 bg-white text-orange-600 hover:bg-gray-50 font-black text-lg rounded-xl shadow-lg">
                                    Join Now
                                </Button>
                            </Link>
                            <p className="text-center text-[10px] uppercase tracking-widest font-bold text-orange-200 mt-4">
                                You will be placed in {sponsor.username}'s downline
                            </p>
                        </div>
                    </div>

                </div>
            </div>

        </div>
    );
}
