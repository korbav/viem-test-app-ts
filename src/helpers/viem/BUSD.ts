import { Abi, Address, getContract, GetContractReturnType, PublicClient, WalletClient, Account, parseAbi } from 'viem';
import bigIntLib from "big-integer";
import { getTestClient } from './client'
import BUSD from '../../assets/BUSD.json'

const getContractAddress = () => BUSD.networks["80001"].address as Address;

const computeValue = async (value: bigint) => {
    const decimals = await getContractObject().read.decimals() as bigint;
    return BigInt(bigIntLib(10n as bigint).pow(decimals as bigint).multiply(value).toString());
}

const getContractParameters = () => ({
    address: getContractAddress(),
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
    } catch (e) {
        console.log(e)
    }

    return {
        totalSupply: totalSupply as BigInt
    }
}

export async function checkSpenderAllowance(owner: string, spender: string): Promise<BigInt> {
    let allowance: BigInt = 0n;
    try {
        allowance = await (getContractObject().read.allowance([owner, spender])) as BigInt;
    } catch (e) {
        console.log(e)
    }

    return allowance;
}

export async function getBalanceValue(owner: string): Promise<BigInt> {
    let balanceOf: BigInt = 0n;
    try {
        balanceOf = await (getContractObject().read.balanceOf([owner])) as BigInt;
    } catch (e) {
        console.log(e)
    }

    return balanceOf;
}

export async function getOwner(): Promise<any> {
    let owner: any = "N/A";
    try {
        owner = await getContractObject().read.getOwner();
    } catch (_) {
    }
    return owner;
}

export async function sendTransfer(account: string, recipient: string, amount: bigint): Promise<void> {
    await getTestClient().writeContract({
        ...getContractParameters(),
        functionName: 'transfer',
        args: [recipient, await computeValue(amount)],
        account: account as unknown as Account
    })
}

export async function sendTransferFrom(account: string, from: string, recipient: string, amount: bigint): Promise<void> {
    await getTestClient().writeContract({
        ...getContractParameters(),
        functionName: 'transferFrom',
        args: [from, recipient, await computeValue(amount)],
        account: account as unknown as Account
    })
}

export async function approve(account: string, spender: string, amount: bigint): Promise<void> {
    await getTestClient().writeContract({
        ...getContractParameters(),
        functionName: 'approve',
        args: [spender, await computeValue(amount)],
        account: account as unknown as Account
    })
}


export async function mint(account: string, amount: bigint): Promise<void> {
    await getTestClient().writeContract({
        ...getContractParameters(),
        functionName: 'mint',
        args: [await computeValue(amount)],
        account: account as unknown as Account
    })
}

export async function burn(account: string, amount: bigint): Promise<void> {
    await getTestClient().writeContract({
        ...getContractParameters(),
        functionName: 'burn',
        args: [await computeValue(amount)],
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


let lastHandledBlock: any;
export async function fetchContractActions(dataHandler: (data: any[]) => void, fromBlock: BigInt|null): Promise<boolean> {
    const BLOCK_STEP = BigInt(1000);

    return new Promise(async (resolve) => {
        const lastBlockNumber = fromBlock !== null ? fromBlock : await getTestClient().getBlockNumber();
        const firstBlockNumber = lastHandledBlock ? lastHandledBlock : 22069112n;
        let currentBlockNumber = lastBlockNumber;

        lastHandledBlock = lastBlockNumber;
        
        while (currentBlockNumber >= firstBlockNumber) {
            const logsTransfers = await getTestClient().getLogs({
                address: getContractAddress(),
                events: parseAbi([ 
                    'event Approval(address indexed owner, address indexed spender, uint256 value)',
                    'event Transfer(address indexed from, address indexed to, uint256 value)',
                ]),
                fromBlock: BigInt(bigIntLib(currentBlockNumber as bigint).subtract(BLOCK_STEP).toString()),
                toBlock: BigInt(currentBlockNumber.toString()),
            })
            currentBlockNumber = BigInt(bigIntLib(currentBlockNumber as bigint).subtract(BLOCK_STEP).toString());
            dataHandler(logsTransfers);
        }


        resolve(true);
    });
}