import React from 'react';

export default function BasicAdminPage() {
    return (
        <div className="p-10">
            <h1 className="text-4xl font-black text-[#151d48]">Diagnostic Mode</h1>
            <p className="text-xl text-gray-500 mt-4">If you can see this, then the Server Page itself is NOT crashing. The error is likely in the Sidebar or Topbar data fetching.</p>
        </div>
    );
}
