import { supabase } from "@/lib/supabase";
import { startImpersonation } from "@/app/actions/impersonate";

export default async function ImpersonationPage() {
    // Fetch users for the dropdown/list
    const { data: users } = await supabase
        .from("users")
        .select("id, username, email")
        .order("username", { ascending: true });

    return (
        <div className="p-8 max-w-4xl mx-auto space-y-6">
            <h1 className="text-3xl font-bold text-gray-900 border-b pb-4">Impersonate User</h1>
            <p className="text-gray-600">
                Logging in as a user allows you to see exactly what they see on their dashboard.
                Your admin session will remain active, and you can return to the Admin Panel at any time by clicking "Stop Impersonating" in the navigation.
            </p>

            <div className="bg-white p-6 shadow rounded-lg border-t-4 border-orange-500">
                <h2 className="text-xl font-bold mb-4">Select User to Login As</h2>

                <form action={startImpersonation} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Target User</label>
                        <select
                            name="user_id"
                            required
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                        >
                            <option value="">-- Select a User --</option>
                            {users?.map((u) => (
                                <option key={u.id} value={u.id}>
                                    {u.username} ({u.email})
                                </option>
                            ))}
                        </select>
                    </div>

                    <button
                        type="submit"
                        className="w-full flex justify-center py-3 border border-transparent rounded-md shadow-sm text-sm font-bold text-white bg-red-600 hover:bg-red-700 focus:outline-none"
                    >
                        LOGIN AS SELECTED USER
                    </button>
                </form>
            </div>
        </div>
    );
}
