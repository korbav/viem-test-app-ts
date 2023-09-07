import { getTestClient } from "./client";

export async function getBalanceValue(address: string): Promise<BigInt> {
    return await getTestClient().getBalance({ address });
}

export async function sendTransfer(account: string, to: string, amount: number): Promise<void> {
    await getTestClient().sendTransaction({
        account,
        to,
        amount
    });
}