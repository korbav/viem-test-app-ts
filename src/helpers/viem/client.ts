import {  custom, publicActions, walletActions, createTestClient } from "viem";
import * as chains from "viem/chains";
import "viem/window";


export function isPolygonMumbai() {
    return parseInt((window.ethereum! as any).chainId, 16) === chains.polygonMumbai.id;
}

export function getTestClient() {
    if (window.ethereum) {
        return createTestClient({
            chain: Object.values(chains)
                         .filter(c => c.id === parseInt((window.ethereum! as any).chainId, 16))[0],
            transport: custom(window.ethereum),
            mode: "anvil"
        })
        .extend(walletActions)
        .extend(publicActions);
    } else {
        const errorMessage ="MetaMask or another web3 wallet is not installed. Please install one to proceed.";
        throw new Error(errorMessage);
    }
}


// v5_Swapper relative constants
export const BUSD_WBTC_Pair_Contract_Address = "0xE78410E1E0410429AEA83696A065DF1a6551c553"; // To check current reserves
export const UniswapMumbaiRouterAddress = "0x3e5a0d21067f3507fc935d1581e89cf3ee531718"; // To process the swap
export const WBTCTokenAddress = "0x49755175C0D8A9a2513C0BAEf726E06699eD90AF"; // Provided as arg to the router
export const BUSDTokenAddress = "0x15a40d37e6f8a478dde2cb18c83280d472b2fc35"; // Provided as arg to the router
