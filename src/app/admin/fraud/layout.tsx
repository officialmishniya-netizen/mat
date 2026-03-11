import FraudSubNav from "@/components/admin/FraudSubNav";

export default function FraudLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <FraudSubNav />
      {children}
    </div>
  );
}
