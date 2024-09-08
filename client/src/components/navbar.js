"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Brand from "./ui/Brand";
import { motion, AnimatePresence } from "framer-motion";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, Coins, CoinsIcon, Loader } from "lucide-react";
import { Contract, ethers } from "ethers";
import { useDispatch, useSelector } from "react-redux";
import { setNavigation } from "@/redux/slices/navigationSlice";
import { usePrivy } from "@privy-io/react-auth";

const Navbar = () => {
  const [state, setState] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [address, setAddress] = useState("");
  const { logout, authenticated } = usePrivy();
  const dispatch = useDispatch();
  const { navigation } = useSelector((state) => state.navigation);
  const [nav, setNav] = useState(navigation);
  useEffect(() => {
    setNav(navigation);
  }, [navigation]);

  const handleNavigation = (to) => {
    dispatch(setNavigation(to));
  };
  const handleLogout = () => {
    logout();
    dispatch(setNavigation(null));
  };
  const copyAddress = (smartAccountAddress) => {
    try {
      navigator.clipboard.writeText(`${smartAccountAddress}`);
    } catch (error) {
      console.log(error);
    }
    toast({
      title: "Copied to clipboard!",
      // description: "Address, copied to clipboard",
    });
  };
  console.log(address);
  const getAddress = async () => {
    console.log(provider);
    const ethersP = new ethers.providers.Web3Provider(provider);
    const signer = await ethersP.getSigner();
    const add = await signer.getAddress();
    setAddress(add);
  };

  useEffect(() => {
    // This will set `isClient` to true only after the component mounts on the client side
    setIsClient(true);
  }, []);

  const [balance, setBalance] = useState("0");
  const [balanceLoading, setBalanceLoading] = useState(true);

  const navigation2 = [
    // { title: "Features", path: "#features" },
    // { title: "Our toolkit", path: "#toolkit" },
    // { title: "Testimonials", path: "#testimonials" },
  ];

  const handleNavMenu = () => {
    setState(!state);
    document.body.classList.toggle("overflow-hidden");
  };

  const menuVariants = {
    open: { opacity: 1, y: 0 },
    closed: { opacity: 0, y: "-100%" },
  };

  const itemVariants = {
    open: { opacity: 1, y: 0 },
    closed: { opacity: 0, y: -20 },
  };

  return (
    <header className="relative">
      <nav
        className={`sticky top-0 z-50 h-full w-full md:text-sm ${
          state ? "fixed z-10 h-full" : ""
        }`}
      >
        <div className="custom-screen items-center mx-auto md:flex">
          <div className="flex items-center justify-between py-3 md:py-5 md:block">
            <motion.div
              onClick={() => setSelectedTab("home")}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Brand />
            </motion.div>

            <div className="md:hidden">
              <motion.button
                role="button"
                aria-label="Open the menu"
                className="text-gray-500 hover:text-gray-800"
                onClick={handleNavMenu}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <AnimatePresence mode="wait" initial={false}>
                  <motion.div
                    key={state ? "close" : "open"}
                    initial={{ opacity: 0, rotate: -180 }}
                    animate={{ opacity: 1, rotate: 0 }}
                    exit={{ opacity: 0, rotate: 180 }}
                    transition={{ duration: 0.3 }}
                  >
                    {state ? (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                    ) : (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="w-6 h-6"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
                        />
                      </svg>
                    )}
                  </motion.div>
                </AnimatePresence>
              </motion.button>
            </div>
          </div>
          <AnimatePresence>
            {(state || (isClient && window.innerWidth > 768)) && (
              <motion.div
                className={`flex-1 pb-3 mt-8 md:pb-0 md:mt-0 md:block`}
                initial="closed"
                animate="open"
                exit="closed"
                variants={menuVariants}
                transition={{ duration: 0.4, ease: "easeInOut" }}
              >
                <ul className="text-gray-700 justify-end items-center space-y-6 md:flex md:space-x-6 md:space-y-0 md:text-gray-600 md:font-medium">
                  {navigation2.map((item, idx) => {
                    return (
                      <motion.li
                        key={idx}
                        className="duration-150 hover:text-gray-900"
                        variants={itemVariants}
                        transition={{ delay: idx * 0.1 }}
                      >
                        <Link href={item.path} className="block">
                          {item.title}
                        </Link>
                      </motion.li>
                    );
                  })}
                  <motion.li
                    variants={itemVariants}
                    transition={{ delay: navigation2.length * 0.1 }}
                    className="flex gap-6 items-center"
                  >
                    {balanceLoading ? (
                      <div className="text-xl font-semibold flex gap-2">
                        <Loader className="w-6 h-6 animate-spin" />
                      </div>
                    ) : (
                      <div className="text-xl font-semibold flex gap-2">
                        <p>{balance == "0" ? "0" : balance.slice(0, -18)}</p>
                        <Coins className="w-6 h-6" />
                      </div>
                    )}

                    <div>{address}</div>

                    <DropdownComp
                      handleNavigation={handleNavigation}
                      setSelectedTab={setSelectedTab}
                      selectedTab={selectedTab}
                      logout={logout}
                      authenticated={authenticated}
                    />
                  </motion.li>
                </ul>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </nav>
    </header>
  );
};
export default Navbar;

const DropdownComp = ({
  setSelectedTab,
  selectedTab,
  logout,
  authenticated,
  handleNavigation,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div>
      <DropdownMenu onOpenChange={setIsOpen}>
        <DropdownMenuTrigger
          onClick={() => {
            setSelectedTab("deposit");
            toggleDropdown();
          }}
          className="py-2.5 px-4 text-center capitalize rounded-lg duration-150 font-medium text-sm text-white bg-gray-800 hover:bg-gray-600 active:bg-gray-900 md:inline"
        >
          <div className="flex items-center gap-3">
            <p>{selectedTab === "home" ? "Home" : selectedTab + " Funds"}</p>
            <motion.div
              animate={{ rotate: isOpen ? 180 : 0 }}
              transition={{ duration: 0.3 }}
            >
              <ChevronDown size={16} />
            </motion.div>
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="top-52">
          <DropdownMenuLabel>Options</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <motion.div whileHover={{ backgroundColor: "#f3f4f6" }}>
            <DropdownMenuItem onClick={() => handleNavigation("deposit")}>
              Deposit
            </DropdownMenuItem>
          </motion.div>
          <motion.div whileHover={{ backgroundColor: "#f3f4f6" }}>
            <DropdownMenuItem onClick={() => handleNavigation("withdraw")}>
              Withdraw
            </DropdownMenuItem>
          </motion.div>
          <motion.div whileHover={{ backgroundColor: "#f3f4f6" }}>
            <DropdownMenuItem onClick={() => handleNavigation("pay")}>
              Pay
            </DropdownMenuItem>
          </motion.div>
          {authenticated && (
            <>
              <DropdownMenuSeparator />
              <motion.div
                whileHover={{ backgroundColor: "#f3f4f6" }}
                onClick={logout}
              >
                <DropdownMenuLabel>Logout</DropdownMenuLabel>
              </motion.div>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
