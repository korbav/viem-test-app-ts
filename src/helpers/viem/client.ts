import {  custom, publicActions, walletActions, createTestClient, TestClient } from "viem";
import { polygonMumbai } from "viem/chains";
import "viem/window";

let testClient: any;

function getTestClient() {
    if(testClient) {
        return testClient;
    }

    // Check for window.ethereum
    let transport;
    if (window.ethereum) {
        transport = custom(window.ethereum);
    } else {
        const errorMessage ="MetaMask or another web3 wallet is not installed. Please install one to proceed.";
        throw new Error(errorMessage);
    }
    
    // Declare a Wallet Client
    testClient = createTestClient({
        chain: polygonMumbai,
        transport,
        mode: "anvil"
    })
    .extend(walletActions)
    .extend(publicActions);
    
    return testClient;
}

export {
    getTestClient,
}
