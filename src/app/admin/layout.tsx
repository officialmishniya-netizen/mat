import AdminSidebar from "./AdminSidebar";
import AdminTopbar from "./AdminTopbar";

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex min-h-screen bg-[#f8f9fa] font-sans">
            {/* Sidebar - Fixed 280px width */}
            <AdminSidebar />

            {/* Main Content Area - Shifted Right */}
            <div className="flex-1 ml-[280px] flex flex-col min-h-screen">
                {/* Topbar - Sticky Header */}
                <AdminTopbar />

                {/* Dynamic Page Content */}
                <main className="flex-1 p-8 overflow-y-auto">
                    {children}
                </main>
            </div>
        </div>
    );
}
