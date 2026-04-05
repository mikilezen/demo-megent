declare module "lucide-react" {
  import * as React from "react";

  export interface LucideProps extends React.SVGProps<SVGSVGElement> {
    size?: number | string;
    absoluteStrokeWidth?: boolean;
  }

  export const Activity: React.FC<LucideProps>;
  export const AlertTriangle: React.FC<LucideProps>;
  export const Bell: React.FC<LucideProps>;
  export const CheckCircle2: React.FC<LucideProps>;
  export const ChevronRight: React.FC<LucideProps>;
  export const Database: React.FC<LucideProps>;
  export const Download: React.FC<LucideProps>;
  export const FileText: React.FC<LucideProps>;
  export const Grid: React.FC<LucideProps>;
  export const List: React.FC<LucideProps>;
  export const Lock: React.FC<LucideProps>;
  export const LogOut: React.FC<LucideProps>;
  export const MoreHorizontal: React.FC<LucideProps>;
  export const PieChart: React.FC<LucideProps>;
  export const Play: React.FC<LucideProps>;
  export const Plus: React.FC<LucideProps>;
  export const RefreshCw: React.FC<LucideProps>;
  export const Search: React.FC<LucideProps>;
  export const Settings: React.FC<LucideProps>;
  export const Shield: React.FC<LucideProps>;
  export const ShieldAlert: React.FC<LucideProps>;
  export const Square: React.FC<LucideProps>;
  export const User: React.FC<LucideProps>;
  export const XCircle: React.FC<LucideProps>;
  export const Zap: React.FC<LucideProps>;
}
