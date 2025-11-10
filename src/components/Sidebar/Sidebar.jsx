import { useState, useEffect } from "react";
import { GiHamburgerMenu } from "react-icons/gi";
import { MdOutlineSpaceDashboard } from "react-icons/md";
import { AiOutlineTransaction } from "react-icons/ai";
import { GoGoal } from "react-icons/go";
import { CgProfile } from "react-icons/cg";
import { IoIosHelpCircleOutline, IoIosLogOut } from "react-icons/io";
import { Link } from "react-router-dom";
import styles from "./Sidebar.module.css";

// Constants for Tailwind classes to keep things clean
const DESKTOP_WIDTH = "w-60";
const MOBILE_COLLAPSED_WIDTH = "w-[60px]";

export default function Sidebar({ onLogOut }) {
  const [collapsed, setCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [mobileExpanded, setMobileExpanded] = useState(false);

  // 🔹 Detect screen size (Keep as is)
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1280) {
        setIsMobile(true);
        setCollapsed(true); // collapsed by default on mobile
      } else {
        setIsMobile(false);
        setCollapsed(false);
        setMobileExpanded(false);
      }
    };

    handleResize(); // run on mount
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // 🔹 Handle hamburger click (Keep as is)
  const handleToggle = () => {
    if (isMobile) {
      setMobileExpanded(!mobileExpanded);
    } else {
      setCollapsed(!collapsed);
    }
  };

  // Determine the width class for the main sidebar wrapper
  const mainSidebarWidth = isMobile
    ? MOBILE_COLLAPSED_WIDTH // Always reserve the collapsed space on mobile
    : collapsed
    ? MOBILE_COLLAPSED_WIDTH // Collapsed on desktop
    : DESKTOP_WIDTH; // Expanded on desktop

  // Determine if content should be shown/expanded
  const showExpandedContent = !collapsed || (isMobile && mobileExpanded);

  return (
    <>
      {/* 1. Optional overlay for mobile expanded (Keep as is) */}
      {isMobile && mobileExpanded && (
        <div
          className="fixed inset-0 bg-black/30 z-40"
          onClick={() => setMobileExpanded(false)}
        ></div>
      )}

      {/* 2. Main Sidebar Wrapper - This container reserves the space in the layout */}
      <div
        // On mobile, this will ALWAYS be w-[80px] to reserve that space
        // On desktop, this will be w-60 or w-[80px]
        className={`relative top-0 left-0 h-full z-50 bg-white ${mainSidebarWidth}`}
      >
        {/* 3. The actual Sidebar Content - Conditionally rendered as fixed overlay on mobile */}
        <div
          // When isMobile AND mobileExpanded is TRUE, this inner div becomes fixed and full-width,
          // OVERLAYING the content, while the outer div (step 2) maintains its w-[80px]
          // in the normal document flow, preventing layout shift.
          className={`h-full ${isMobile && mobileExpanded ? "fixed top-0 left-0 z-50 bg-white shadow-lg " + DESKTOP_WIDTH : "relative h-full"}`}
        >
          <div className="flex flex-col gap-5">
            {/* Logo and hamburger */}
            <div className="flex items-center gap-[10px] py-[5px] pl-6 text-black">
              <GiHamburgerMenu
                size={40}
                className="p-2 rounded-full hover:bg-gray-100 active:scale-90 transition-transform duration-150 cursor-pointer"
                onClick={handleToggle}
              />
              {showExpandedContent && (
                <div>
                  <h1 className="inline text-2xl font-bold text-red-500">A</h1>
                  <h1 className="inline text-2xl">ce It Twice</h1>
                </div>
              )}
            </div>

            {/* Navigation links */}
            <ul className={`${styles.sidebarList} text-black`}>
              <Link to="/Dashboard">
                <li title="Dashboard">
                  <MdOutlineSpaceDashboard size={25} />
                  {showExpandedContent && (
                    <span>Dashboard</span>
                  )}
                </li>
              </Link>
              {/* ... other links (Transaction, Goal) use the same logic ... */}
              <Link to="/Transaction">
                <li title="Transaction">
                  <AiOutlineTransaction size={25} />
                  {showExpandedContent && (
                    <span>Transaction</span>
                  )}
                </li>
              </Link>
              <Link to="/Goal">
                <li title="SpendingPlan">
                  <GoGoal size={25} />
                  {showExpandedContent && (
                    <span>Spending Plan</span>
                  )}
                </li>
              </Link>
            </ul>

            {/* Bottom section */}
            <div className="mt-40 mb-10 text-black">
              <ul className={styles.sidebarList}>
                <Link to="/Setting">
                  <li title="Setting">
                    <CgProfile size={25} />
                    {showExpandedContent && (
                      <span>Setting</span>
                    )}
                  </li>
                </Link>
                <li title="Help">
                  <IoIosHelpCircleOutline size={25} />
                  {showExpandedContent && (
                    <span>Help</span>
                  )}
                </li>
                <li title="Log Out" onClick={onLogOut}>
                  <IoIosLogOut size={25} />
                  {showExpandedContent && (
                    <span>Log Out</span>
                  )}
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}