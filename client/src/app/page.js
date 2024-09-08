"use client";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { truncateAddress } from "@/utils/webHelpers";
import { usePrivy, useWallets } from "@privy-io/react-auth";
import clsx from "clsx";
import {
  BanknoteIcon,
  ChevronDown,
  CoinsIcon,
  CopyIcon,
  DollarSign,
  LogOutIcon,
  PiggyBank,
} from "lucide-react";
import Link from "next/link";
import React, { act, useEffect, useState } from "react";
import { PaymasterMode, createSmartAccountClient } from "@biconomy/account";
import { Contract, ethers } from "ethers";
import { getInstance } from "@/utils/fhevm";
import {
  PAYROLLCONTRACTADDRESS,
  TOKENBRIDGEABI,
  TOKENBRIDGECONTRACTADDRESS,
  USDCABI,
  USDCCONTRACTADDRESS,
} from "@/utils/contractAddress";
import { Input } from "@/components/ui/input";
import { useViewport } from "@tma.js/sdk-react";
import { useDispatch, useSelector } from "react-redux";
import Pay from "./pay/page";
import Withdraw from "./withdraw/page";
import LandingPage from "@/components/landingPage";
import { setNavigation } from "@/redux/slices/navigationSlice";
import { PiCurrencyDollarSimpleFill } from "react-icons/pi";
import LogginChecker from "@/components/login/login-checker";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";

const Page = () => {
  const { ready } = usePrivy();
  const { wallets } = useWallets();
  const w0 = wallets[0];
  const [signer, setSigner] = useState(null);
  const { navigation } = useSelector((state) => state.navigation);
  // console.log(navigation);
  const { authenticated } = usePrivy();
  const dispatch = useDispatch();
  const [smartAccount, setSmartAccount] = useState(null);
  const [smartAccountAddress, setSmartAccountAddress] = useState("");
  // const [smartContract, setsmartContract] = useState(null)
  // console.log(smartAccount)
  useEffect(() => {
    if (authenticated) {
      dispatch(setNavigation("/"));
    }
  }, [authenticated]);

  const createSmartAccount = async (signer) => {
    if (!signer) return;
    const smartAccount = await createSmartAccountClient({
      signer: signer,
      bundlerUrl:
        "https://bundler.biconomy.io/api/v2/97/nJPK7B3ru.dd7f7861-190d-41bd-af80-6877f74b8f44",
      biconomyPaymasterApiKey: "BmM6E3dRj.4d30cb58-ef58-446f-b660-8890b8d16bb5",
      rpcUrl: "https://bsc-testnet-rpc.publicnode.com",
    });
    return smartAccount;
  };

  const getSigner = async () => {
    const provider = await w0?.getEthersProvider();
    const signer = await provider?.getSigner();
    setSigner(signer);
    const smartContractAccount = await createSmartAccount(signer);
    // console.log(smartContractAccount);
    setSmartAccount(() => smartContractAccount);
    // console.log(await smartContractAccount?.getAddress());
    const newProvider = await new ethers.providers.JsonRpcProvider(
      "https://bsc-testnet-rpc.publicnode.com"
    );
    // console.log(provider);
    const newSigner = await newProvider?.getSigner(
      await smartContractAccount?.getAddress()
    );
    setSmartAccountAddress(await smartContractAccount?.getAddress());
    setSigner(newSigner);
  };
  // console.log(smartAccountAddress);
  // console.log(signer)
  useEffect(() => {
    if (ready && authenticated) {
      getSigner();
    }
  }, [w0]);

  return (
    <>
      {(navigation === "/login" || navigation === null) && <>
        <div className="pt-4">
          <Header
            address={w0?.address}
            authenticated={authenticated}
            smartAccountAddress={smartAccountAddress}
          />
        </div>

        <LandingPage />
      </>}
      {navigation === "/" && (
        <>
          <div className="pt-4">
            <Header
              address={w0?.address}
              authenticated={authenticated}
              smartAccountAddress={smartAccountAddress}
            />
          </div>

          <LandingPage />
        </>
      )}
      {navigation === "/deposit" && (
        <Home
          smartAccount={smartAccount}
          signer={signer}
          smartContractAccountAddress={smartAccountAddress}
        />
      )}
      {navigation === "/pay" && (
        <Pay
          signer={signer}
          smartAccount={smartAccount}
          smartContractAccountAddress={smartAccountAddress}
        />
      )}
      {navigation === "/withdraw" && (
        <Withdraw
          smartAccount={smartAccount}
          signer={signer}
          smartContractAccountAddress={smartAccountAddress}
        />
      )}
    </>
  );
};

export default Page;

const Home = ({ smartAccount, signer, smartContractAccountAddress }) => {
  const { authenticated, ready } = usePrivy();
  const { wallets } = useWallets();
  const w0 = wallets[0];
  // const [signer, setSigner] = useState(null);
  // const [smartAccount, setSmartAccount] = useState(null);
  const [fhevmInstance, setFhevmInstance] = useState(null);
  const [activeTab, setActiveTab] = useState("deposit");
  const dispatch = useDispatch();
  const [tokens, setTokens] = useState("0");
  const [withdrawMode, setWithdrawMode] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState(
    "0x8EFaf91508c3bFA232a3D5d89C2005774d0A6C38"
  );
  const [dummyLoading, setDummyLoading] = useState(false);
  const [error, setError] = useState(null);

  const [depositLoading, setDepositLoading] = useState(false);
  const [errDeposit, setErrDeposit] = useState(null);
  const [depositAmount, setDepositAmount] = useState();
  const getBalance = async () => {
    console.log("called");
    const udscContract = new ethers.Contract(
      USDCCONTRACTADDRESS,
      USDCABI,
      signer
    );
    console.log(smartContractAccountAddress);
    console.log(udscContract);
    const balance = await udscContract.balanceOf(smartContractAccountAddress);
    const bigNumber = ethers.BigNumber.from(balance);
    console.log(balance);
    console.log(balance);
    setTokens(bigNumber.toString());
  };
  console.log(tokens);

  useEffect(() => {
    if (signer && ready && authenticated && w0) {
      getBalance();
    }
  }, [signer, ready, authenticated, w0]);

  // const vp = useViewport();

  // useEffect(() => {
  //   console.log(vp); // will be undefined and then Viewport instance.
  // }, [vp]);

  const getFhevmInstance = async () => {
    const instance = await getInstance();
    setFhevmInstance(instance);
  };

  useEffect(() => {
    getFhevmInstance();
  }, []);

  useEffect(() => {
    if (tokens !== "0") {
      setDepositAmount(tokens.slice(0, -18));
    }
  }, [tokens]);

  const address = w0?.address;

  const handlePayBtn = async () => {
    // w0.switchChain(84532);
    // const signer = await provider?.getSigner();
    // console.log(await smartAccount.getSigner())
    try {
      setDummyLoading(true);
      const usdcContract = await new Contract(
        USDCCONTRACTADDRESS,
        USDCABI,
        signer
      );

      const txData = await usdcContract.populateTransaction.transferFromOwner(
        TOKENBRIDGECONTRACTADDRESS
      );

      const tx1 = {
        to: USDCCONTRACTADDRESS,
        data: txData.data,
      };

      const userOpResponse = await smartAccount?.sendTransaction(tx1, {
        paymasterServiceData: { mode: PaymasterMode.SPONSORED },
      });
      await userOpResponse.wait(1);

      await getBalance();
    } catch (error) {
      console.error("Transaction failed:", error);
    } finally {
      setDummyLoading(false);
    }
  };

  const handleDeposit = async () => {
    console.log(signer);
    const value = ethers.utils.parseUnits(depositAmount, "ether");
    try {
      const tokenBridge = new Contract(
        TOKENBRIDGECONTRACTADDRESS,
        TOKENBRIDGEABI,
        signer
      );
      const txData = await tokenBridge.populateTransaction.lockTokens(value, {
        gasLimit: 1000000,
      });
      const tx1 = {
        to: TOKENBRIDGECONTRACTADDRESS,
        data: txData.data,
      };
      console.log("first");
      const userOpResponse = await smartAccount?.sendTransaction(tx1, {
        paymasterServiceData: { mode: PaymasterMode.SPONSORED },
      });
      await userOpResponse.wait(4);
      console.log("get");
      console.log(userOpResponse);
      await getBalance();
    } catch (error) {
      console.error("Transaction failed:", error);
    }
  };

  const handleWithdraw = async () => {
    try {
      const usdcContract = new Contract(USDCCONTRACTADDRESS, USDCABI, signer);
      const balance = await usdcContract.balanceOf(smartContractAccountAddress);
      const txData = await usdcContract.populateTransaction.transfer(
        withdrawAmount,
        balance,
        {
          gasLimit: 7920027,
        }
      );
      const tx1 = {
        to: USDCCONTRACTADDRESS,
        data: txData.data,
      };
      const userOpResponse = await smartAccount?.sendTransaction(tx1, {
        paymasterServiceData: { mode: PaymasterMode.SPONSORED },
      });
      await userOpResponse.wait(4);
      console.log("get");
      console.log(userOpResponse);
      await getBalance();
    } catch (error) {
      console.error("Transaction failed:", error);
    }
  };

  const handleSubmit = async () => {
    if (activeTab === "deposit") {
      setDepositLoading(true);
      await handleDeposit();
      setDepositLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        when: "beforeChildren",
        staggerChildren: 0.1,
      },
    },
  };

  const childVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <>
      <div className="mt-4">
        <Header
          authenticated={authenticated}
          address={address}
          smartAccountAddress={smartContractAccountAddress}
        />
        {/* <div className="md:grid grid-cols-2 md:mt-20 md:gap-10">
          <div className="space-y-4 mt-4 md:flex md:flex-col items-center justify-between w-full">
            <div className="w-full">
              <div>
                <div className="w-full items-center justify-between flex">
                  <p className="font-semibold text-xl">Deposit Address.</p>{" "}
                  <CoinsIcon
                    className="text-black/40 hover:text-black hover:scale-110 transition-all ease-in-out duration-300"
                    onClick={handlePayBtn}
                  />
                </div>
              </div>

              <div className="flex w-full items-center justify-between">
                <div className="flex items-center gap-1">
                  <p>
                    Available tokens:{" "}
                    {tokens === "0" ? "0" : tokens.slice(0, -18)}
                  </p>
                  <PiCurrencyDollarSimpleFill className="text-blue-800 text-xl" />
                </div>
              </div>

              <div className="hidden md:flex w-full mt-8">
                Securely deposit funds into the Payroll Protocol system. Using
                our advanced blockchain technology, all transactions are
                encrypted and stored immutably, ensuring both security and
                transparency. Simply enter the total salary amount and the
                encrypted addresses of your employees, and our platform will
                handle the rest, ensuring timely and private salary
                disbursements.
              </div>
            </div>

            <div className="w-full border border-border bg-white rounded-base md:hidden">
              <Image src={"/svgs/main.svg"} width={1080} height={1080} />
            </div>

            <div className="space-y-1 w-full font-semibold">
              <div className="flex items-center justify-between my-2">
                {withdrawMode ? (
                  <p>Address to Withdraw</p>
                ) : (
                  <p>Amount to deposit</p>
                )}
                <Switch
                  checked={withdrawMode}
                  onCheckedChange={() => setWithdrawMode(!withdrawMode)}
                />
              </div>
              {withdrawMode ? (
                <div className="flex items-center justify-betweeb w-full gap-2 ">
                  <Input
                    placeholder="Withdraw Address"
                    className="shadow-light ring-0 focus-visible:ring-offset-0 focus-visible:ring-0 focus-visible:outline-0"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                  />
                  <Button onClick={handleWithdraw}>Withdraw</Button>
                </div>
              ) : (
                <div className="flex items-center justify-betweeb w-full gap-2 ">
                  <Input
                    placeholder="Token Amount"
                    className="shadow-light ring-0 focus-visible:ring-offset-0 focus-visible:ring-0 focus-visible:outline-0"
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(e.target.value)}
                  />
                  <Button onClick={handleDeposit}>Deposit</Button>
                </div>
              )}
            </div>
          </div>
          <div className="hidden md:flex bg-white border rounded-base shadow-light">
            <Image src={"/svgs/main.svg"} width={1080} height={1080} />
          </div>
        </div> */}
        <div>
          <main className="container mx-auto px-4 py-12">
            <motion.div
              className="max-w-md mx-auto text-center"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              <motion.h2
                variants={childVariants}
                className="text-3xl font-bold text-white mb-4"
              >
                Secure & Confidential Transactions
              </motion.h2>
              <motion.p variants={childVariants} className="text-white/40 mb-8">
                Manage your finances with complete privacy and ease.
              </motion.p>

              <motion.div
                variants={childVariants}
                className="inline-flex rounded-full p-1 border border-white/40 bg-white/5 mb-8"
              >
                <AnimatePresence mode="wait">
                  {["deposit", "onramp"].map((tab) => (
                    <motion.button
                      key={tab}
                      className={`px-6 py-2 rounded-full transition-colors ${activeTab === tab
                          ? "bg-white text-black"
                          : "text-white/80"
                        }`}
                      onClick={() => {
                        setActiveTab(tab);
                        tab === "deposit" && getBalance();
                      }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {tab === "onramp"
                        ? "On Ramp"
                        : tab.charAt(0).toUpperCase() + tab.slice(1)}
                    </motion.button>
                  ))}
                </AnimatePresence>
              </motion.div>

              <motion.div
                variants={childVariants}
                className="bg-white/5 rounded-lg border border-white/40 p-6"
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-white/80">
                    {activeTab === "deposit" ? "Deposit Funds" : "On Ramp"}
                  </h3>
                  <Button
                    onClick={handlePayBtn}
                    // disabled={dummyLoading}
                    className="flex items-center space-x-2 bg-[#0B0E11] hover:bg-[#0B0E11]/70 border border-white/40 text-white"
                  >
                    <CoinsIcon className={dummyLoading ? "animate-spin" : ""} />
                    <span>{dummyLoading ? "Minting..." : "Mint USDC"}</span>
                  </Button>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-red-500 mb-4"
                    >
                      {error}
                    </motion.div>
                  )}
                </div>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-4"
                  >
                    <div className="relative">
                      <Input
                        type="text"
                        placeholder={`Amount to ${activeTab}`}
                        value={depositAmount}
                        onChange={(e) => setDepositAmount(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-md focus:ring-2 focus:ring-gray-800 focus:border-transparent transition-all text-black"
                      />
                      <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    </div>
                    {activeTab === "deposit" && (
                      <div className="text-sm w-full flex items-center text-left">
                        Available Balance:&nbsp;
                        <span className="font-semibold text-[#FCD535]">
                          {" "}
                          $ {tokens === "0" ? "0" : tokens.slice(0, -18)}
                        </span>
                      </div>
                    )}

                    {activeTab === "onramp" && (
                      <Input
                        type="text"
                        placeholder="Wallet address"
                        className="w-full py-2 border border-gray-200 rounded-md focus:ring-2 focus:ring-gray-800 focus:border-transparent transition-all text-black"
                      />
                    )}
                    <Button
                      className="w-full rounded-md py-2 font-medium text-sm text-black bg-[#FCD535] hover:bg-[#FCD535]/70 active:bg-[#FCD535] transition-colors"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleSubmit}
                      disabled={depositLoading || activeTab === "onramp"}
                    >
                      {depositLoading ? (
                        <span className="flex items-center justify-center">
                          <CoinsIcon className="animate-spin mr-2" size={16} />
                          Processing...
                        </span>
                      ) : activeTab === "deposit" ? (
                        "Deposit Now"
                      ) : (
                        "On Ramp Now (coming soon)"
                      )}
                    </Button>
                  </motion.div>
                </AnimatePresence>
              </motion.div>
            </motion.div>
          </main>
        </div>
      </div>
    </>
  );
};

export const Header = ({ authenticated, address, smartAccountAddress }) => {
  // console.log(smartAccountAddress);
  const { logout } = usePrivy();
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
    console.log("first");
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
  return (
    <div className="flex justify-between items-center scroll-m-20 text-3xl font-semibold tracking-tight transition-colors first:mt-0 pb-4 border-b border-white/20 px-8 text-white">
      <div
        className="text-2xl md:flex items-center gap-2 hidden"
        onClick={() => handleNavigation("/")}
      >
        {nav === "/pay" ? "Payroll Protocol" : "Payroll Protocol"}
        {/* Distribition per address */}
      </div>
      <div className="text-xl text-white/70 flex items-center gap-2 md:hidden">
        {truncateAddress(smartAccountAddress)}
        <div onClick={() => copyAddress(smartAccountAddress)}>
          <CopyIcon className="text-white/40 hover:text-white hover:scale-110 transition-all ease-in-out duration-300 w-4" />
        </div>
      </div>

      <div className="text-xl text-white/70  flex gap-3 items-center justify-center">
        <Button
          size="sm"
          onClick={logout}
          variant="neutral"
          className="gap-2 md:hidden flex items-center justify-between bg-red-500 text-white"
        >
          <LogOutIcon />
          Logout
        </Button>
        <div className="hidden md:flex">
          <DropDown
            authenticated={authenticated}
            address={smartAccountAddress}
          />
        </div>
        {/* <DropDown authenticated={authenticated} address={address} /> */}
      </div>
    </div>
  );
};

const DropDown = ({ authenticated, address }) => {
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
  const [isOpen, setIsOpen] = useState(false);
  const { login, logout } = usePrivy();
  const { navigation } = useSelector((state) => state.navigation);
  const dispatch = useDispatch();
  const handleNavigation = (to) => {
    dispatch(setNavigation(to));
  };
  // const { wallets } = useWallets();
  // const w0 = wallets[0];
  // const [tokens, setTokens] = useState("0");
  // const { token } = useSelector((tok) => tok.tokens);
  // console.log(token);
  // const accountAddress = w0?.address?.slice(0, 6)?.toLocaleLowerCase();

  const handleLogout = () => {
    logout();
    setIsOpen(false);
  };
  return (
    <div className="relative">
      {authenticated ? (
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 font-semibold">
            {/* <GiToken className="" /> */}
            <div onClick={() => copyAddress(address)}>
              <CopyIcon className="text-white/40 hover:text-white hover:scale-110 transition-all ease-in-out duration-300 w-4" />
            </div>

            {/* <p> {token === "0" ? "0" : token.slice(0, -18)}</p> */}
          </div>
          <button
            onBlur={() => [setIsOpen(false)]}
            onClick={() => {
              setIsOpen(!isOpen);
            }}
            className="flex items-center gap-2 text-xl font-base"
          >
            {truncateAddress(address)}
            {/* {accountAddress}.... */}
            <ChevronDown
              className={clsx(
                isOpen ? "rotate-180" : "rotate-0",
                "h-5 w-5 transition-transform"
              )}
              color="white"
            />
          </button>
        </div>
      ) : (
        <button
          onBlur={() => [setIsOpen(false)]}
          onClick={login}
          className="flex items-center gap-2 text-xl font-base"
        >
          Login
        </button>
      )}

      <div
        className={clsx(
          isOpen
            ? "visible top-12 opacity-100 right-1"
            : "invisible top-10 right-1 opacity-0",
          "absolute flex w-[170px] flex-col rounded-md border-2  bg-white text-lg font-base transition-all text-black"
        )}
      >
        <div
          onClick={() => {
            setIsOpen(false);
            handleNavigation("/deposit");
          }}
          className="text-left hover:bg-black/10 flex items-center px-4 py-3 border-b-2 border-b-black/40 "
        >
          <PiggyBank className="h-6 w-6 m500:h-4 m500:w-4 mr-[15px] m400:ml-4 m400:w-[12px]" />
          Deposit
        </div>
        <div
          onClick={() => {
            setIsOpen(false);
            handleNavigation("/pay");
          }}
          className="text-left hover:bg-black/10 flex items-center px-4 py-3 border-b-2 border-b-black/40 "
        >
          <BanknoteIcon className="h-6 w-6 m500:h-4 m500:w-4 mr-[15px] m400:ml-4 m400:w-[12px]" />
          Pay
        </div>
        <div
          onClick={() => {
            setIsOpen(false);
            handleNavigation("/withdraw");
          }}
          className="text-left hover:bg-black/10 flex items-center px-4 py-3 border-b-2 border-b-black/40 "
        >
          <CoinsIcon className="h-6 w-6 m500:h-4 m500:w-4 mr-[15px] m400:ml-4 m400:w-[12px]" />
          Withdraw
        </div>

        <div
          onClick={handleLogout}
          className="text-left hover:bg-red-600  flex items-center px-4 py-3  bg-red-500 text-white"
        >
          <LogOutIcon className="h-6 w-6 m500:h-4 m500:w-4 mr-[15px] m400:ml-4 m400:w-[12px]" />
          Logout
        </div>
      </div>
    </div>
  );
};
