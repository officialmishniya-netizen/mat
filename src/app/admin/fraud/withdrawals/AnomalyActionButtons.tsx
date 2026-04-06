'use client';

import React, { useTransition } from 'react';
import { forceApproveWithdrawal, forceRejectWithdrawal, placeWithdrawalHold } from '@/app/actions/adminUserManagement';
import { toast } from 'react-hot-toast';

interface Props {
    withdrawalId?: string;
    userId: string;
    username: string;
}

export default function AnomalyActionButtons({ withdrawalId, userId, username }: Props) {
    const [isPending, startTransition] = useTransition();

    const handleApprove = () => {
        if (!withdrawalId) {
            toast.error('No single withdrawal ID for this anomaly');
            return;
        }
        if (!confirm(`Approve withdrawal ${withdrawalId} for @${username}?`)) return;

        startTransition(async () => {
            const res = await forceApproveWithdrawal(withdrawalId, 'Fraud center manual approval');
            if (res.success) {
                toast.success('Withdrawal approved');
            } else if ('error' in res) {
                toast.error(res.error || 'Failed to approve');
            }
        });
    };

    const handleReject = () => {
        if (!withdrawalId) {
            toast.error('No single withdrawal ID for this anomaly');
            return;
        }
        const reason = prompt(`Reason for rejecting withdrawal ${withdrawalId}?`);
        if (!reason) return;

        startTransition(async () => {
            const res = await forceRejectWithdrawal(withdrawalId, reason);
            if (res.success) {
                toast.success('Withdrawal rejected and refunded');
            } else if ('error' in res) {
                toast.error(res.error || 'Failed to reject');
            }
        });
    };

    const handleHold = () => {
        const days = prompt('How many days to hold withdrawals?', '7');
        if (!days) return;
        const holdUntil = new Date(Date.now() + parseInt(days) * 24 * 60 * 60 * 1000);

        startTransition(async () => {
            const res = await placeWithdrawalHold(userId, `Fraud center hold (${days} days)`, holdUntil);
            if (res.success) {
                toast.success(`Withdrawal hold placed until ${holdUntil.toLocaleDateString()}`);
            } else if ('error' in res) {
                toast.error(res.error || 'Failed to place hold');
            }
        });
    };

    return (
        <div className="flex gap-2">
            <button
                onClick={handleApprove}
                disabled={isPending || !withdrawalId}
                className="text-xs font-semibold px-3 py-1.5 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors disabled:opacity-50"
            >
                Approve
            </button>
            <button
                onClick={handleHold}
                disabled={isPending}
                className="text-xs font-semibold px-3 py-1.5 bg-yellow-50 text-yellow-700 rounded-lg hover:bg-yellow-100 transition-colors disabled:opacity-50"
            >
                Hold
            </button>
            <button
                onClick={handleReject}
                disabled={isPending || !withdrawalId}
                className="text-xs font-semibold px-3 py-1.5 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50"
            >
                Reject
            </button>
        </div>
    );
}
