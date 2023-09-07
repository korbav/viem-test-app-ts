import { Abi, Address, getContract, GetContractReturnType, PublicClient, WalletClient, Account } from 'viem'
import { getTestClient } from './client'
import BUSD from '../../assets/BUSD.json'
// import chains from '../../assets/chains.json'

const getContractParameters = () => ({
    address: BUSD.networks["80001"].address as Address,
    abi: BUSD.abi as Abi,
    publicClient: getTestClient()
});

function getContractObject(): GetContractReturnType<typeof BUSD.abi, PublicClient, WalletClient> {
    return getContract(getContractParameters() as any) as GetContractReturnType<typeof BUSD.abi, PublicClient, WalletClient>;
}

export type ContractDataType = {
    totalSupply: BigInt
}

export async function getBUSDContractData(): Promise<ContractDataType> {
    let totalSupply: BigInt = 0n;
    try {
        totalSupply = await getContractObject().read.totalSupply() as BigInt;
    } catch(_) {}

    return {
        totalSupply: totalSupply as BigInt
    }
}

export async function checkSpenderAllowance(owner: string, spender: string): Promise<BigInt> {
    let allowance: BigInt = 0n;
    try {
        allowance =  await (getContractObject().read.allowance([owner, spender])) as BigInt;
    } catch(_) {}

    return allowance;
}

export async function getBalanceValue(owner: string): Promise<BigInt> {
    let balanceOf: BigInt = 0n;
    try {
        balanceOf = await (getContractObject().read.balanceOf([owner])) as BigInt;
    } catch(_) {}

    return  balanceOf;
}

export async function getOwner(): Promise<string> {
    return await getContractObject().read.getOwner().toString();
}

export async function sendTransfer(account: string, recipient: string, amount: number): Promise<void> {
        await getTestClient().writeContract({
        ...getContractParameters(),
        functionName: 'transfer',
        args: [recipient, amount],
        account: account as unknown as Account
    })
}

export async function sendTransferFrom(account: string, from: string, recipient: string, amount: number): Promise<void> {
    await getTestClient().writeContract({
        ...getContractParameters(),
        functionName: 'transferFrom',
        args: [from, recipient, amount], 
        account: account as unknown as Account
      })
}

export async function approve(account: string, spender: string, amount: number): Promise<void> {
    await getTestClient().writeContract({
        ...getContractParameters(),
        functionName: 'approve',
        args: [spender, amount], 
        account: account as unknown as Account
      })
}


export async function mint(account: string, amount: number): Promise<void> {
    await getTestClient().writeContract({
        ...getContractParameters(),
        functionName: 'mint',
        args: [amount], 
        account: account as unknown as Account
      })
}

export async function burn(account: string, amount: number): Promise<void> {
    await getTestClient().writeContract({
        ...getContractParameters(),
        functionName: 'burn',
        args: [amount], 
        account: account as unknown as Account
      })
}

export async function transferOwnership(account: string, newOwner: string): Promise<void> {
    await getTestClient().writeContract({
        ...getContractParameters(),
        functionName: 'transferOwnership',
        args: [account, newOwner], 
        account: account as unknown as Account
      })
}

export async function renounceOwnership(account: string): Promise<void> {
    await getTestClient().writeContract({
        ...getContractParameters(),
        functionName: 'renounceOwnership',
        args: [account], 
        account: account as unknown as Account
      })
}


