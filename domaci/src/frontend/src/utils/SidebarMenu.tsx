// SidebarMenu.tsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Menu,
  X,
  Home,
  User,
  Settings,
  FileText,
  ExternalLink,
  Gauge ,
  Dumbbell,
  NotebookText ,
  BookHeadphones ,
  Wind ,
  Brain ,
  GlassWater ,
  type LucideIcon,
} from "lucide-react";

// Define the link structure (store icon component type, not an instantiated element)
export interface MenuLink {
  label: string;
  path: string;
  icon: LucideIcon;
  external?: boolean;
}

// Component props
export interface SidebarMenuProps {
  initialOpen?: boolean;
  position?: "top-left" | "top-right" | "bottom-left" | "bottom-right";
  customLinks?: MenuLink[];
}

const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));

const SidebarMenu: React.FC<SidebarMenuProps> = ({
  initialOpen = false,
  position = "top-left",
  customLinks,
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  const [isOpen, setIsOpen] = useState(initialOpen);
  const [isDragging, setIsDragging] = useState(false);
  const [isDraggable, setIsDraggable] = useState(false);

  // Keep button position in state
  const [dragOffset, setDragOffset] = useState({ x: 20, y: 20 });

  // Refs for drag math (avoids stale closures)
  const dragStartRef = useRef<{ startX: number; startY: number } | null>(null);
  const movedRef = useRef(false);

  // Default links if none provided (match your actual Routes)
  const defaultLinks: MenuLink[] = useMemo(
    () => [
      { label: "Home", path: "/home", icon: Home },
      { label: "Dashboard", path: "/dashboard", icon: Gauge  },
      { label: "Account", path: "/account", icon: User },
      { label: "Workout", path: "/workout", icon: Dumbbell },
      { label: "Study", path: "/study", icon: NotebookText  },
      { label: "Focus", path: "/focus", icon: BookHeadphones  },
      { label: "Stress", path: "/stress", icon: Brain   },
      { label: "Hydration", path: "/hydration", icon: GlassWater   },
      
      // Add Settings only if you actually have /settings route:
      // { label: "Settings", path: "/settings", icon: Settings },
      { label: "Landing", path: "https://react.hoi5.com", icon: Wind },
    ],
    []
  );

  const links = customLinks ?? defaultLinks;

  const toggleDraggable = () => setIsDraggable((p) => !p);

  const handleLinkClick = (link: MenuLink) => {
    if (link.external) {
      window.open(link.path, "_blank", "noopener,noreferrer");
    } else {
      navigate(link.path); // ✅ SPA navigation (no full reload)
    }
    setIsOpen(false);
  };

  // Close menu on route change (nice UX, avoids weird open state)
  useEffect(() => {
    // location.key changes on navigation
    setIsOpen(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.key]);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.ctrlKey && (e.key === "m" || e.key === "M")) {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }

      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [isOpen]);

  // Handle drag start (mouse)
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!isDraggable) return;

    setIsDragging(true);
    movedRef.current = false;

    // Starting delta between cursor and button top-left
    dragStartRef.current = {
      startX: e.clientX - dragOffset.x,
      startY: e.clientY - dragOffset.y,
    };

    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (!dragStartRef.current) return;

      movedRef.current = true;

      const newX = moveEvent.clientX - dragStartRef.current.startX;
      const newY = moveEvent.clientY - dragStartRef.current.startY;

      setDragOffset({
        x: clamp(newX, 0, window.innerWidth - 50),
        y: clamp(newY, 0, window.innerHeight - 50),
      });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      dragStartRef.current = null;

      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  // Position styles for the menu button
  const getButtonPositionStyles = () => {
    switch (position) {
      case "top-right":
        return { top: 20, right: 20, left: "auto" as const };
      case "bottom-left":
        return { bottom: 20, left: 20, top: "auto" as const };
      case "bottom-right":
        return { bottom: 20, right: 20, top: "auto" as const };
      default: // "top-left"
        return { top: dragOffset.y, left: dragOffset.x };
    }
  };

  // Position styles for the popover menu
  const getPanelPositionStyles = () => {
    // For fixed corners, we anchor panel below/above button.
    // For draggable (top-left default), we use dragOffset.
    const baseX = dragOffset.x;
    const baseY = dragOffset.y;

    if (position === "top-right") {
      return { top: 20 + 60, right: 20 };
    }
    if (position === "bottom-left") {
      return { bottom: 20 + 60, left: 20 };
    }
    if (position === "bottom-right") {
      return { bottom: 20 + 60, right: 20 };
    }

    // Default/top-left draggable: place just under the button
    return { top: baseY + 60, left: baseX };
  };

  return (
    <>
      {/* Drag Toggle Hint */}
      {isDraggable && (
        <div
          style={{
            position: "fixed",
            top: 10,
            left: "50%",
            transform: "translateX(-50%)",
            background: "rgba(0,0,0,0.8)",
            color: "white",
            padding: "8px 16px",
            borderRadius: "20px",
            fontSize: "14px",
            zIndex: 9998,
            pointerEvents: "none",
          }}
        >
          Drag the menu button to reposition • Click again to lock
        </div>
      )}

      {/* Main Menu Button */}
      <button
        onMouseDown={handleMouseDown}
        style={{
          position: "fixed",
          ...getButtonPositionStyles(),
          width: "50px",
          height: "50px",
          borderRadius: "50%",
          backgroundColor: isOpen ? "#007B5F" : "#1e293b",
          color: "white",
          border: "none",
          cursor: isDraggable ? "grab" : "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "24px",
          zIndex: 9999,
          boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
          transition: "all 0.3s ease",
          userSelect: "none",
          boxSizing: "content-box",
          padding: "0px"
        }}
        onClick={(e) => {
          // If we dragged, don't treat as a click toggle
          if (isDragging && movedRef.current) return;

          // Double click toggles draggable lock/unlock
          if (e.detail === 2) {
            toggleDraggable();
            return;
          }

          setIsOpen((p) => !p);
        }}
        title="Double click to make draggable | Ctrl+M to toggle"
        aria-label="Open navigation menu"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar Menu Panel */}
      <div
        style={{
          position: "fixed",
          ...getPanelPositionStyles(),
          width: "280px",
          backgroundColor: "#1e293b",
          borderRadius: "12px",
          padding: "20px",
          zIndex: 9998,
          boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
          transform: isOpen ? "translateY(0) scale(1)" : "translateY(-20px) scale(0.95)",
          opacity: isOpen ? 1 : 0,
          visibility: isOpen ? "visible" : "hidden",
          transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        }}
      >
        <div
          style={{
            marginBottom: "20px",
            paddingBottom: "15px",
            borderBottom: "1px solid #374151",
          }}
        >
          <h3 style={{ color: "white", margin: 0, fontSize: "18px", fontWeight: 600 }}>
            Navigation Menu
          </h3>
          <p style={{ color: "#9ca3af", margin: "5px 0 0", fontSize: "14px" }}>
            Quick links to site pages
          </p>
        </div>

        <nav>
          <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
            {links.map((link, index) => {
              const Icon = link.icon;

              return (
                <li key={`${link.path}-${index}`} style={{ marginBottom: "8px" }}>
                  <button
                    onClick={() => handleLinkClick(link)}
                    style={{
                      width: "100%",
                      textAlign: "left",
                      backgroundColor: "transparent",
                      border: "none",
                      color: "#e5e7eb",
                      padding: "12px 16px",
                      borderRadius: "8px",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      transition: "all 0.2s",
                      fontSize: "16px",
                    }}
                    onMouseEnter={(ev) => {
                      ev.currentTarget.style.backgroundColor = "#374151";
                      ev.currentTarget.style.color = "white";
                    }}
                    onMouseLeave={(ev) => {
                      ev.currentTarget.style.backgroundColor = "transparent";
                      ev.currentTarget.style.color = "#e5e7eb";
                    }}
                  >
                    <span style={{ display: "flex", alignItems: "center" }}>
                      <Icon size={20} />
                    </span>
                    <span style={{ flex: 1 }}>{link.label}</span>
                    {link.external && <ExternalLink size={16} />}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        <div style={{ marginTop: "20px", paddingTop: "15px", borderTop: "1px solid #374151" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <button
              onClick={toggleDraggable}
              style={{
                background: isDraggable ? "#10b981" : "#4b5563",
                color: "white",
                border: "none",
                padding: "8px 16px",
                borderRadius: "6px",
                fontSize: "14px",
                cursor: "pointer",
                transition: "background 0.2s",
              }}
            >
              {isDraggable ? "Lock Position" : "Unlock to Drag"}
            </button>
            <span style={{ color: "#9ca3af", fontSize: "12px" }}>Ctrl+M to toggle</span>
          </div>
        </div>
      </div>

      {/* Backdrop */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.2)",
            zIndex: 9997,
            backdropFilter: "blur(2px)",
          }}
        />
      )}
    </>
  );
};

export default SidebarMenu;
