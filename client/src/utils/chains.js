// import { toast } from "sonner";

export const chainsName = { base: "Base" };

export const bnbNetwork = {
  id: 97,
  network: "BNB",
  name: "BNB",
  nativeCurrency: {
    name: "BNB",
    symbol: "BNB",
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ["https://bsc-testnet-rpc.publicnode.com"],
    },
    public: {
      http: ["https://bsc-testnet-rpc.publicnode.com"],
    },
  },
  blockExplorers: {
    default: {
      name: "BscScan",
      url: "https://testnet.bscscan.com/",
    },
  },
};
