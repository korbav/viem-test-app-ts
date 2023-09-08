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
