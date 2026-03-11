import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";

// Optional: Set referral cookie in middleware or here
// Next 14 App router supports setting cookies in Server Actions or Route Handlers,
// but for a page component we typically can't set cookies directly without a workaround 
// or fetching a route. We'll rely on a Client Component or just the existing /r/[username] 
// route to actually set the cookie if they click "Join Now".

export async function generateMetadata({ params }: { params: { username: string } }) {
    return {
        title: `Join ${params.username}'s Team | PTC Nexus`,
        description: `Join PTC Nexus under ${params.username}.`
    };
}

export default async function PublicReferralPage({
    params
}: {
    params: { username: string }
}) {
    const { username } = params;

    const sponsor = await db.select().from(users).where(eq(users.username, username)).limit(1).then(res => res[0]);

    if (!sponsor) {
        notFound();
    }

    // Since we mocked the settings in DB, we'll mock them here too.
    const title = `Join ${sponsor.username}'s Team`;
    const welcomeMessage = "I'm looking for motivated individuals to join my PTC Nexus network. Let's grow together!";

    return (
        <div className="min-h-screen bg-[#f8f9fc] flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-lg bg-white rounded-3xl shadow-xl overflow-hidden text-center relative">
                
                {/* Header Decoration */}
                <div className="h-32 bg-[#151d48] w-full absolute top-0 left-0 z-0">
                    <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '20px 20px' }}></div>
                </div>

                <div className="relative z-10 pt-20 px-8 pb-10 flex flex-col items-center">
                    
                    {/* Avatar */}
                    <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-orange-400 to-red-500 flex items-center justify-center text-white font-black text-4xl shadow-lg shadow-orange-500/30 mb-6 border-4 border-white">
                        {sponsor.username.charAt(0).toUpperCase()}
                    </div>

                    <h1 className="text-3xl font-black text-[#151d48] tracking-tight mb-4">
                        {title}
                    </h1>

                    <div className="bg-gray-50 rounded-2xl p-6 mb-8 text-gray-600 border border-gray-100 italic relative">
                        <span className="text-4xl text-gray-200 absolute -top-4 -left-2 font-serif">&quot;</span>
                        {welcomeMessage}
                        <span className="text-4xl text-gray-200 absolute -bottom-8 -right-2 font-serif">&quot;</span>
                    </div>

                    <Link href={`/r/${sponsor.username}`} className="w-full">
                        <Button className="w-full h-14 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white font-black text-lg shadow-lg shadow-orange-500/20 group transition-all">
                            Join Now for Free
                            <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                            </svg>
                        </Button>
                    </Link>

                    <p className="text-sm font-bold text-gray-400 mt-6 uppercase tracking-widest">
                        Powered by PTC Nexus
                    </p>
                </div>
            </div>
        </div>
    );
}
