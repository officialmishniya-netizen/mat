'use client';

import React, { useTransition } from 'react';
import { whitelistAction, bulkFraudAction } from '@/app/actions/fraud-admin';
import { toast } from 'react-hot-toast';

interface Props {
    ip: string;
    userIds?: string[];
}

export default function FraudActionButtons({ ip, userIds = [] }: Props) {
    const [isPending, startTransition] = useTransition();

    const handleWhitelist = () => {
        const reason = prompt(`Reason for whitelisting IP ${ip}:`);
        if (!reason) return;

        startTransition(async () => {
            const res = await whitelistAction('ip', ip, reason);
            if (res.success) {
                toast.success('IP whitelisted');
            } else if ('error' in res) {
                toast.error(res.error || 'Failed to whitelist');
            }
        });
    };

    const handleBulkAction = (action: 'freeze' | 'ban') => {
        if (!userIds.length) {
            toast.error('No users identified for this IP group');
            return;
        }

        const reason = prompt(`Reason for bulk ${action} on ${userIds.length} accounts?`);
        if (!reason) return;

        startTransition(async () => {
            const res = await bulkFraudAction(userIds, action, reason);
            if (res.success) {
                toast.success(`Bulk ${action} successful`);
            } else if ('error' in res) {
                toast.error(res.error || `Failed to ${action}`);
            }
        });
    };

    return (
        <div className="flex gap-2">
            <button
                onClick={handleWhitelist}
                disabled={isPending}
                className="text-xs font-semibold px-3 py-1.5 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors disabled:opacity-50"
            >
                Whitelist
            </button>
            <button
                onClick={() => handleBulkAction('freeze')}
                disabled={isPending}
                className="text-xs font-semibold px-3 py-1.5 bg-orange-50 text-orange-700 rounded-lg hover:bg-orange-100 transition-colors disabled:opacity-50"
            >
                Freeze All
            </button>
            <button
                onClick={() => handleBulkAction('ban')}
                disabled={isPending}
                className="text-xs font-semibold px-3 py-1.5 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50"
            >
                Ban All
            </button>
        </div>
    );
}
