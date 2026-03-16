"use client";

import React, { useState } from 'react';
import { supabase } from "@/lib/supabase";
import { toast } from "react-hot-toast";

export default function FraudActions({ userId, username }: { userId: string, username: string }) {
    const [loading, setLoading] = useState(false);

    const handleAction = async (action: 'suspended' | 'banned', status: string) => {
        setLoading(true);
        const { error } = await supabase
            .from('user_account_status')
            .upsert({ 
                user_id: userId,
                status: status,
                updated_at: new Date().toISOString()
            }, { onConflict: 'user_id' });

        if (error) {
            toast.error(`Failed to ${action} ${username}`);
            console.error(error);
        } else {
            toast.success(`User @${username} has been ${action}`);
        }
        setLoading(false);
    };

    return (
        <div className="flex gap-2">
            <button 
                disabled={loading}
                onClick={() => handleAction('suspended', 'suspended')}
                className="text-xs font-semibold px-3 py-1.5 bg-orange-50 text-orange-700 rounded-lg hover:bg-orange-600 hover:text-white transition-all disabled:opacity-50"
            >
                Suspend
            </button>
            <button 
                disabled={loading}
                onClick={() => handleAction('banned', 'banned')}
                className="text-xs font-semibold px-3 py-1.5 bg-red-50 text-red-700 rounded-lg hover:bg-red-600 hover:text-white transition-all disabled:opacity-50"
            >
                Ban
            </button>
        </div>
    );
}
