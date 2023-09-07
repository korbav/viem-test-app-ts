import { Abi, Address, getContract, GetContractReturnType, PublicClient, WalletClient } from 'viem'
import { getTestClient } from './client'
import BUSD from '../../assets/BUSD.json'

const contractParameters = {
    address: BUSD.networks["80001"].address as Address,
    abi: BUSD.abi as Abi,
    publicClient: getTestClient()
};

function getContractObject(): GetContractReturnType<typeof BUSD.abi, PublicClient, WalletClient> {
    return getContract(contractParameters) as GetContractReturnType<typeof BUSD.abi, PublicClient, WalletClient>;
}

export type ContractDataType = {
    totalSupply: BigInt
}

export async function getBUSDContractData(): Promise<ContractDataType> {
    const totalSupply = await getContractObject().read.totalSupply()
    return {
        totalSupply: totalSupply as BigInt
    }
}

export async function checkSpenderAllowance(owner: string, spender: string): Promise<BigInt> {
    return await (getContractObject().read.allowance([owner, spender])) as BigInt;
}

export async function getBalanceValue(owner: string): Promise<BigInt> {
    return await (getContractObject().read.balanceOf([owner])) as BigInt;
}

export async function getOwner(): Promise<string> {
    return await getContractObject().read.getOwner().toString();
}

export async function sendTransfer(account: string, recipient: string, amount: number): Promise<void> {
        await getTestClient().writeContract({
        ...contractParameters,
        functionName: 'transfer',
        args: [recipient, amount],
        account
    })
}

export async function sendTransferFrom(account: string, from: string, recipient: string, amount: number): Promise<void> {
    await getTestClient().writeContract({
        ...contractParameters,
        functionName: 'transferFrom',
        args: [from, recipient, amount], 
        account
      })
}

export async function approve(account: string, spender: string, amount: number): Promise<void> {
    await getTestClient().writeContract({
        ...contractParameters,
        functionName: 'approve',
        args: [spender, amount], 
        account
      })
}


export async function mint(account: string, amount: number): Promise<void> {
    await getTestClient().writeContract({
        ...contractParameters,
        functionName: 'mint',
        args: [amount], 
        account
      })
}

export async function burn(account: string, amount: number): Promise<void> {
    await getTestClient().writeContract({
        ...contractParameters,
        functionName: 'burn',
        args: [amount], 
        account
      })
}

export async function transferOwnership(account: string, newOwner: string): Promise<void> {
    await getTestClient().writeContract({
        ...contractParameters,
        functionName: 'transferOwnership',
        args: [account, newOwner], 
        account
      })
}

export async function renounceOwnership(account: string): Promise<void> {
    await getTestClient().writeContract({
        ...contractParameters,
        functionName: 'renounceOwnership',
        args: [account], 
        account
      })
}


