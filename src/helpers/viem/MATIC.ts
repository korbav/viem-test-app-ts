import { Address } from "viem";
import { getTestClient } from "./client";

export async function getBalanceValue(address: string): Promise<BigInt> {
    let balanceOf: BigInt = 0n;
    try {
        balanceOf = await getTestClient().getBalance({ address: address as Address });
    } catch(_) {}

    return  balanceOf;
}

export async function sendTransfer(account: string, to: string, amount: number): Promise<void> {
    await getTestClient().sendTransaction({
        account,
        to,
        amount
    } as any);
}