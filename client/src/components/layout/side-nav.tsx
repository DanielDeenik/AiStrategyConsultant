import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Target,
  Lightbulb,
  PlayCircle,
  Calculator,
  Webhook,
  Settings,
} from "lucide-react";

const navigation = [
  {
    name: "Dashboard",
    href: "/",
    icon: LayoutDashboard,
  },
  {
    name: "Market Intelligence",
    href: "/market-intelligence",
    icon: Target,
  },
  {
    name: "AI Strategy",
    href: "/ai-strategy",
    icon: Lightbulb,
  },
  {
    name: "Execution Automation",
    href: "/execution",
    icon: PlayCircle,
  },
  {
    name: "Decision Simulations",
    href: "/simulations",
    icon: Calculator,
  },
  {
    name: "API Integrations",
    href: "/integrations",
    icon: Webhook,
  },
];

export function SideNav() {
  const [location] = useLocation();

  return (
    <div className="flex h-screen w-64 flex-col border-r bg-card">
      {/* Logo Area */}
      <div className="flex h-16 items-center border-b px-6">
        <h1 className="text-lg font-semibold">AI Strategy Assistant</h1>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 space-y-1 px-4 py-4">
        {navigation.map((item) => {
          const isActive = location === item.href;
          const Icon = item.icon;
          
          return (
            <Link key={item.name} href={item.href}>
              <a
                className={cn(
                  "flex items-center px-2 py-2 text-sm font-medium rounded-md",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <Icon className="mr-3 h-5 w-5" />
                {item.name}
              </a>
            </Link>
          );
        })}
      </nav>

      {/* Bottom Section */}
      <div className="border-t p-4">
        <Link href="/settings">
          <a className="flex items-center px-2 py-2 text-sm font-medium text-muted-foreground rounded-md hover:bg-muted hover:text-foreground">
            <Settings className="mr-3 h-5 w-5" />
            Settings
          </a>
        </Link>
      </div>
    </div>
  );
}
