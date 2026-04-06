'use client';

import React, { useTransition } from 'react';
import { bulkFraudAction, whitelistAction } from '@/app/actions/fraud-admin';
import { toast } from 'react-hot-toast';

interface Props {
    userId: string;
    username: string;
}

export default function VpnActionButtons({ userId, username }: Props) {
    const [isPending, startTransition] = useTransition();

    const handleAction = (action: 'kyc' | 'freeze' | 'ban') => {
        const reason = prompt(`Reason for ${action} on @${username}?`);
        if (!reason) return;

        startTransition(async () => {
            const res = await bulkFraudAction([userId], action, reason);
            if (res.success) {
                toast.success(`Action ${action} applied to @${username}`);
            } else {
                toast.error(res.error || 'Failed to apply action');
            }
        });
    };

    const handleWhitelist = () => {
        const reason = prompt(`Reason for whitelisting @${username}?`);
        if (!reason) return;

        startTransition(async () => {
            const res = await whitelistAction('user', userId, reason);
            if (res.success) {
                toast.success(`@${username} whitelisted from fraud detection`);
            } else {
                toast.error(res.error || 'Failed to whitelist');
            }
        });
    };

    return (
        <div className="flex gap-2">
            <button
                onClick={() => handleAction('kyc')}
                disabled={isPending}
                className="text-xs font-semibold px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors disabled:opacity-50"
            >
                Require KYC
            </button>
            <button
                onClick={() => handleAction('freeze')}
                disabled={isPending}
                className="text-xs font-semibold px-3 py-1.5 bg-orange-50 text-orange-700 rounded-lg hover:bg-orange-100 transition-colors disabled:opacity-50"
            >
                Block WD
            </button>
            <button
                onClick={handleWhitelist}
                disabled={isPending}
                className="text-xs font-semibold px-3 py-1.5 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors disabled:opacity-50"
            >
                Whitelist
            </button>
        </div>
    );
}
