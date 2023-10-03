import { Card, Stack, Typography, TextField, Button, Divider, CircularProgress, FormControlLabel, Radio, RadioGroup, FormControl, Box, Slider } from "@mui/material";
import LoopIcon from '@mui/icons-material/Loop';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { useCallback, useEffect, useState, useContext, forwardRef, useImperativeHandle } from "react";
import { Abi, Account, Address, GetContractReturnType, PublicClient, WalletClient, getContract } from "viem";
import SwapCallsIcon from '@mui/icons-material/SwapCalls';
import { BinanceUsd, BitcoinWrapped } from 'cryptocons'
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import SlippageIcon from '@mui/icons-material/Insights';
import { BUSDTokenAddress, BUSD_WBTC_Pair_Contract_Address, UniswapMumbaiRouterAddress, WBTCTokenAddress, getTestClient } from "../../helpers/viem/client";
import WBTC_BUSD_ABI from "../../assets/WBTC_BUSD_ABI.json";
import WBTC_ABI from "../../assets/WBTC_ABI.json";
import BUSD_ABI from "../../assets/BUSD_ABI.json";
import Uniswap_Router_ABI from "../../assets/Uniswap_Router_ABI.json";
import { AppStateContext } from "../../context/AppStateContext";
import { formatValueSwappper } from "../../helpers/format";
import { genericErrorAlert } from "../../helpers/viem/notifications";
import OperationSummary from "../OperationSummary";
import bigInt from "big-integer";

const darkTheme = createTheme({
    palette: {
        mode: 'dark',
    },
});

export enum Direction {
    BUSD_WTC,
    WTC_BUSD
}

export enum Mode {
    ExactTokenForToken = "ExactTokenForToken",
    TokenForExactToken = "TokenForExactToken"
}

const BUSD_DECIMALS = 18;
const WBTC_DECIMALS = 8;

const getPairContractParameters = () => ({
    address: BUSD_WBTC_Pair_Contract_Address as unknown as Address,
    abi: WBTC_BUSD_ABI,
    publicClient: getTestClient()
});

const getBUSDContractParameters = () => ({
    address: BUSDTokenAddress as unknown as Address,
    abi: BUSD_ABI,
    publicClient: getTestClient()
});

const getWBTCContractParameters = () => ({
    address: WBTCTokenAddress as unknown as Address,
    abi: WBTC_ABI,
    publicClient: getTestClient()
});

const getUniswapRouterParameters = () => ({
    address: UniswapMumbaiRouterAddress as unknown as Address,
    abi: Uniswap_Router_ABI,
    publicClient: getTestClient()
});

function getPairContractObject(): GetContractReturnType<Abi, PublicClient, WalletClient> {
    return getContract(getPairContractParameters() as any) as GetContractReturnType<Abi, PublicClient, WalletClient>;
}

function getBUSDContractObject(): GetContractReturnType<Abi, PublicClient, WalletClient> {
    return getContract(getBUSDContractParameters() as any) as GetContractReturnType<Abi, PublicClient, WalletClient>;
}

function getWBTCContractObject(): GetContractReturnType<Abi, PublicClient, WalletClient> {
    return getContract(getWBTCContractParameters() as any) as GetContractReturnType<Abi, PublicClient, WalletClient>;
}

async function approve(parameters: any, address: string, value: BigInt) {
    await getTestClient().writeContract({
        ...parameters,
        functionName: 'approve',
        args: [UniswapMumbaiRouterAddress, value.toString()],
        account: address as unknown as Account
    })
}

async function approveWBTC(address: string, value: BigInt) {
    await approve(getWBTCContractParameters(), address, value);
}

async function approveBUSD(address: string, value: BigInt) {
    await approve(getBUSDContractParameters(), address, value);
}

async function swap(
    functionName: "swapExactTokensForTokens" | "swapTokensForExactTokens",
    address: string,
    value1: string,
    value2: string,
    direction: Direction
) {
    const tokensPath = [BUSDTokenAddress, WBTCTokenAddress];
    await getTestClient().writeContract({
        ...getUniswapRouterParameters(),
        functionName,
        args: [
            value1,
            value2,
            direction === Direction.BUSD_WTC ? tokensPath : tokensPath.concat().reverse(),
            address,
            Math.floor(Date.now() * 0.001 + 86400)
        ],
        address: UniswapMumbaiRouterAddress as any,
        account: address as any
    });
}

async function swapExactTokensForTokens(address: string, value1: string, value2: string, direction: Direction) {
    await swap("swapExactTokensForTokens", address, value1, value2, direction);
}

async function swapTokensForExactTokens(address: string, value1: string, value2: string, direction: Direction) {
    await swap("swapTokensForExactTokens", address, value1, value2, direction);
}


export default forwardRef((_, ref)  => {
    const [direction, setDirection] = useState<Direction>(Direction.WTC_BUSD);
    const [mode, setMode] = useState<Mode>(Mode.ExactTokenForToken);
    const [isReady, setIsReady] = useState<boolean>(false);
    const [isSwapping, setIsSwapping] = useState<boolean>(false);
    const [WBTCBalance, setWBTCBalance] = useState<BigInt>(0n);
    const [BUSDBalance, setBUSDBalance] = useState<BigInt>(0n);
    const [WBTCValue, setWBTCValue] = useState<string>("0");
    const [BUSDValue, setBUSDValue] = useState<string>("0");
    const [BUSDReserve, setBUSDReserve] = useState<BigInt>(0n);
    const [WBTCReserve, setWBTCReserve] = useState<BigInt>(0n);
    const [ slippage, setSlippage ] = useState(1);
    const { appData } = useContext(AppStateContext);

    const loadData = useCallback(async () => {
        setIsReady(false);
        const _BUSDBalance = await getBUSDContractObject().read.balanceOf([appData.address]) as BigInt;
        const _WBTCBalance = await getWBTCContractObject().read.balanceOf([appData.address]) as BigInt;
        const [_BUSDReserve, _WBTCReserve]: BigInt[] = await getPairContractObject().read.getReserves() as BigInt[];

        setBUSDReserve(_BUSDReserve)
        setWBTCReserve(_WBTCReserve)
        setBUSDBalance(_BUSDBalance)
        setWBTCBalance(_WBTCBalance)
        setIsReady(true);
    }, [appData.address])

    useEffect(() => {
        if (appData.address) {
            loadData().then();
        }
    }, [appData.address])

    useImperativeHandle(ref, () => ({
        refresh: async () => {
            if (appData.address) {
                await loadData();
            }
        }
    }))

    const toggleDirection = useCallback(() => {
        setDirection((direction) => direction === Direction.BUSD_WTC ? Direction.WTC_BUSD : Direction.BUSD_WTC);
    }, []);

    const getMaxWBTCValue = useCallback((val?: string) => {
        let WBTCDesiredValue: BigInt;
        let ret;
        if (undefined !== val) {
            ret = WBTCDesiredValue = BigInt(parseFloat(val) * (10 ** WBTC_DECIMALS));
            if (WBTCBalance > WBTCReserve) {
                ret =  WBTCDesiredValue > WBTCReserve ? WBTCReserve : WBTCDesiredValue
            } else {
                ret =  WBTCDesiredValue > WBTCBalance ? WBTCBalance : WBTCDesiredValue
            }
        }
        else {
            ret =  WBTCBalance > WBTCReserve ? WBTCReserve : WBTCBalance
        }
        return bigInt(ret.toString()).toJSNumber() / (10 ** WBTC_DECIMALS);
    }, [WBTCBalance, WBTCReserve]);

    const getMaxBUSDValue = useCallback((val?: string) => {
        let BUSDDesiredValue: BigInt;
        let ret;
        if (undefined !== val) {
            BUSDDesiredValue = BigInt(parseFloat(val) * (10 ** BUSD_DECIMALS));
            if (BUSDBalance > BUSDReserve) {
                ret = BUSDDesiredValue > BUSDReserve ? BUSDReserve : BUSDDesiredValue
            } else {
                ret = BUSDDesiredValue > BUSDBalance ? BUSDBalance : BUSDDesiredValue
            }
        }
        else {
            ret = BUSDBalance > BUSDReserve ? BUSDReserve : BUSDBalance
        }

        return bigInt(ret.toString()).toJSNumber() / (10 ** BUSD_DECIMALS);
    }, [BUSDBalance, BUSDReserve]);

    
    const stripCommas = (val: string): string => val.replace(/,/g, "");
    const parseBUSDValue = (val: string): BigInt => BigInt(Math.floor(parseFloat(stripCommas(val)) * (10 ** BUSD_DECIMALS)))
    const parseWBTCValue = (val: string): BigInt => BigInt(Math.floor(parseFloat(stripCommas(val)) * (10 ** WBTC_DECIMALS)))

    const handleSwap = useCallback(async () => {
        if (BUSDValue.toString() === "0" && WBTCValue.toString() === "0") {
            return;
        }

        const BUSDParsedValue = parseBUSDValue(BUSDValue);
        const WBTCParsedValue = parseWBTCValue(WBTCValue);

        try {
            if(direction === Direction.BUSD_WTC) {
                if(BUSDBalance < BUSDParsedValue) {
                    throw { title: "BUSD value", msg: "Insufficient BUSD tokens in balance" };
                } else if(WBTCReserve < WBTCParsedValue) {
                    throw { title: "WBTC value", msg: "Insufficient WBTC tokens in reserve" };
                }
            } else {
                if(WBTCBalance < WBTCParsedValue) {
                    throw { title: "WBTC value", msg: "Insufficient WBTC tokens in balance" };
                } else if(BUSDReserve < BUSDParsedValue) {
                    throw { title: "BUSD value", msg: "Insufficient BUSD tokens in reserve" };
                }
                }
        } catch (e: any) {
            return genericErrorAlert(new RangeError(e.title), e.msg, { autoClose: 3000 })
        }

        switch (mode) {
            case Mode.ExactTokenForToken:
                switch (direction) {
                    case Direction.BUSD_WTC:
                        setIsSwapping(true);
                        try {
                            await approveBUSD(appData.address!, BUSDParsedValue);
                            await swapExactTokensForTokens(
                                appData.address!,
                                BUSDParsedValue.toString(),
                                (BigInt(Math.floor(parseFloat(stripCommas(WBTCValue)) * ((100 - slippage) / 100)))  * (10n ** BigInt(WBTC_DECIMALS))).toString(),
                                direction
                            );
                        } catch (e) {
                            genericErrorAlert(e as Error);
                        }
                        setIsSwapping(false);
                        break;
                    case Direction.WTC_BUSD:
                        setIsSwapping(true);
                        try {
                            await approveWBTC(appData.address!, WBTCParsedValue);
                            await swapExactTokensForTokens(
                                appData.address!,
                                WBTCParsedValue.toString(),
                                (BigInt(Math.floor(parseFloat(stripCommas(BUSDValue)) * ((100 - slippage) / 100))) * (10n ** BigInt(BUSD_DECIMALS))) .toString(),
                                direction
                            );
                        } catch (e) {
                            genericErrorAlert(e as Error);
                        }
                        setIsSwapping(false);
                        break;
                }
                break;
            case Mode.TokenForExactToken:
                switch (direction) {
                    case Direction.BUSD_WTC: {
                            setIsSwapping(true);
                            const value = Math.floor(parseFloat(stripCommas(BUSDValue)) * (1 + slippage/ 100) * (10 ** BUSD_DECIMALS));
                            await approveBUSD(appData.address!, BigInt(value));
                            await swapTokensForExactTokens(
                                appData.address!,
                                WBTCParsedValue.toString(),
                                value.toString(),
                                direction
                            );
                            setIsSwapping(false);
                            break;
                        }
                    case Direction.WTC_BUSD: {
                        setIsSwapping(true);
                        const value = Math.floor(parseFloat(stripCommas(WBTCValue)) * (1 + slippage/ 100) * (10 ** WBTC_DECIMALS));
                        await approveWBTC(appData.address!, BigInt(value));
                        await swapTokensForExactTokens(
                            appData.address!,
                            BUSDParsedValue.toString(),
                            value.toString(),
                            direction
                        );
                        setIsSwapping(false);
                        break;
                    }
                }
                break;
        }
    }, [BUSDValue, WBTCValue, BUSDBalance, WBTCBalance, WBTCReserve, BUSDReserve]);

    const recomputeWBTCEquivalentValue = useCallback((newBUSDValue: string) => {      
        switch (mode) {
            case Mode.ExactTokenForToken: {
                console.log("recomputeWBTCEquivalentValue > ExactTokenForToken", mode)
                const reserveIn = BUSDReserve;
                const reserveOut = WBTCReserve;
                const amountIn = parseFloat(stripCommas(newBUSDValue) || "0")
                if (!amountIn) return setWBTCValue("0");
                const computedValue =  (amountIn * 997 * (parseFloat(reserveOut.toString()) / (10 ** WBTC_DECIMALS))) /
                        (((parseFloat(reserveIn.toString()) / (10 ** BUSD_DECIMALS)) * 1000 ) + (amountIn * 997));
                setWBTCValue(formatValueSwappper((computedValue).toString()));
                break;
            }
            case Mode.TokenForExactToken: {
                console.log("recomputeWBTCEquivalentValue > TokenForExactToken", mode)
                const reserveIn = WBTCReserve;
                const reserveOut = BUSDReserve;
                const amountOut = parseFloat(stripCommas(newBUSDValue) || "0");
                if (!amountOut) return setWBTCValue("0");
                const computedValue = (10 ** -WBTC_DECIMALS) + 
                    ((parseFloat(reserveIn.toString()) / (10 ** WBTC_DECIMALS)) * amountOut * 1000) / 
                    (((parseFloat(reserveOut.toString()) / (10 ** BUSD_DECIMALS) - amountOut) * 997))
                 setWBTCValue(formatValueSwappper((computedValue).toString()));
                break;
            }
        }
    }, [WBTCReserve, BUSDReserve, setWBTCValue, mode]);


    const recomputeBUSDEquivalentValue = (newWBTCValue: string) => {
        switch (mode) {
            case Mode.ExactTokenForToken: {
                console.log("recomputeBUSDEquivalentValue > ExactTokenForToken", mode)
                const reserveIn = WBTCReserve;
                const reserveOut = BUSDReserve;
                const amountIn = parseFloat(stripCommas(newWBTCValue) || "0")
                const computedValue = (amountIn * 997 * (parseFloat(reserveOut.toString()) / (10 ** BUSD_DECIMALS))) / 
                    (((parseFloat(reserveIn.toString()) / (10 ** WBTC_DECIMALS)) * 1000 ) + (amountIn * 997))
                setBUSDValue(formatValueSwappper(computedValue.toString()));
                break;
            }
            case Mode.TokenForExactToken: {
                console.log("recomputeBUSDEquivalentValue > ExactTokenForToken", mode)
                const reserveIn = BUSDReserve;
                const reserveOut = WBTCReserve;
                const amountOut = parseFloat(stripCommas(newWBTCValue) || "0");
                const computedValue = (10 ** -BUSD_DECIMALS) + 
                    ((parseFloat(reserveIn.toString()) / (10 ** BUSD_DECIMALS)) * amountOut * 1000) / 
                    (((parseFloat(reserveOut.toString()) / (10 ** WBTC_DECIMALS) - amountOut) * 997))
                 setBUSDValue(formatValueSwappper((computedValue).toString()));
                break;
            }
        }
    };

    const handleBUSDValueChange = useCallback((e: any, customValue?: string) => {
        const val = (customValue !== undefined ? customValue : e.target.value).toString();
        if (isValidAmount(val)) {
            setBUSDValue(formatValueSwappper(val));
            recomputeWBTCEquivalentValue(val);
        }
    }, [BUSDValue, setBUSDValue, recomputeWBTCEquivalentValue]);

    const handleWBTCValueChange = useCallback((e: any, customValue?: string) => {
        const val = (customValue !== undefined ? customValue : e.target.value).toString();
        if (isValidAmount(val)) {
            setWBTCValue(formatValueSwappper(val));
            recomputeBUSDEquivalentValue(val);
        }
    }, [WBTCValue, setWBTCValue, recomputeBUSDEquivalentValue]);

    const isValidAmount = (value: string) => !value || /^\d+\.*\d*$/.test(value) || /^(\d+,)*\d*\.*\d*$/.test(value);

    const handleMaxBUSD = useCallback(() => {
        handleBUSDValueChange(null, getMaxBUSDValue().toString());
    }, [getMaxBUSDValue, handleBUSDValueChange]);

    const handleMaxWBTC = useCallback(() => {
        handleWBTCValueChange(null, getMaxWBTCValue().toString());
    }, [getMaxWBTCValue, handleWBTCValueChange]);

    return (
        <ThemeProvider theme={darkTheme}>
            <div>
                <Card className="my-2 mx-2 px-4 py-4 pb-12 ">
                    <Box gap={4} className="w-full flex flex-row">
                        <Box className="w-1/3 overflow-hidden">
                            {isReady && (
                                <Stack direction="column" gap={4} divider={<Divider orientation="horizontal" flexItem={true} />} >
                                    { /* Reserves */}
                                    <Stack direction="column" gap={2}>
                                        <Stack direction="row" gap={2} className="items-center">
                                            <AccountBalanceIcon />
                                            <Typography variant="h6">Liquidity Pool Reserves</Typography>
                                        </Stack>
                                        <Stack direction="row" gap={2} className="items-center">
                                            <BinanceUsd />
                                            <Typography variant="caption">{formatValueSwappper((bigInt(BUSDReserve.toString()).toJSNumber() / (10 ** BUSD_DECIMALS)).toString())}</Typography>
                                        </Stack>
                                        <Stack direction="row" gap={2} className="items-center">
                                            <BitcoinWrapped />
                                            <Typography variant="caption">{formatValueSwappper((bigInt(WBTCReserve.toString()).toJSNumber() / (10 ** WBTC_DECIMALS)).toString())}</Typography>
                                        </Stack>
                                    </Stack>
                                    { /* Balances */}
                                    <Stack direction="column" gap={2}>
                                        <Stack direction="row" gap={2} className="items-center">
                                            <AccountBalanceWalletIcon />
                                            <Typography variant="h6">Account Balance</Typography>
                                        </Stack>
                                        <Stack direction="row" gap={2} className="items-center">
                                            <BinanceUsd />
                                            <Typography variant="caption">{formatValueSwappper((bigInt(BUSDBalance.toString()).toJSNumber() / (10 ** BUSD_DECIMALS)).toString())}</Typography>
                                        </Stack>
                                        <Stack direction="row" gap={2} className="items-center">
                                            <BitcoinWrapped />
                                            <Typography variant="caption">{formatValueSwappper((bigInt(WBTCBalance.toString()).toJSNumber() / (10 ** WBTC_DECIMALS)).toString())}</Typography>
                                        </Stack>
                                    </Stack>
                                    { /* Slippage */}
                                    <Stack direction="column" gap={1}>
                                    <Stack direction="row" gap={2} className="items-center">
                                            <SlippageIcon />
                                            <Typography variant="h6">Slippage ({slippage}%)</Typography>
                                        </Stack>
                                        <Stack direction={"row"}>
                                            <Typography>0%</Typography>
                                            <Slider
                                                onChange={(__: Event, newValue: number | number[]) => {
                                                    setSlippage(newValue as number);
                                                }}
                                                min={0}
                                                max={1}
                                                step={0.1}
                                                size="small"
                                                defaultValue={0.5}
                                                aria-label="Small"
                                                valueLabelDisplay="off"
                                                marks
                                                sx={{ mx: 3 }}
                                            />
                                            <Typography>1%</Typography>
                                        </Stack>
                                    </Stack>
                                </Stack>
                            )}
                            {!isReady && (
                                <div className="self-center p-4">
                                    <CircularProgress />
                                </div>
                            )}

                        </Box>
                        <Divider orientation="vertical" flexItem={true} />
                        <Stack direction="column" gap={4} className="w-2/3">
                            <div className="text-center">
                                <FormControl>
                                    <RadioGroup
                                        row
                                        aria-labelledby="demo-row-radio-buttons-group-label"
                                        name="row-radio-buttons-group"
                                        onChange={(e: any) => {
                                            setMode(Object.values(Mode)[Object.keys(Mode).indexOf(e.target.value)])
                                        }}
                                        value={mode}
                                        title="Mode"
                                        className="text-white"
                                    >
                                        <FormControlLabel disabled={isSwapping} value={Mode.ExactTokenForToken} control={<Radio />} label="Exact Token For Token" />
                                        <FormControlLabel disabled={isSwapping} value={Mode.TokenForExactToken} control={<Radio />} label="Token For Exact Token" />
                                    </RadioGroup>
                                </FormControl>
                            </div>
                            {
                                isReady && (
                                    <Stack direction="column" gap={1} className="self-center items-center mt-6" divider={<Divider />}>
                                        <Stack direction={`${direction === Direction.WTC_BUSD ? "row" : "row-reverse"}`} gap={2} className="self-center items-center">
                                            <Stack direction="row" className="items-center" gap={2}>
                                                <BitcoinWrapped size={37} />
                                                <TextField
                                                    color="primary"
                                                    style={{ width: 250 }}
                                                    inputProps={{ min: 0 }}
                                                    label={
                                                        <Stack direction={"row"} gap={2} className="pl-4">
                                                            <Typography>WBTC</Typography>
                                                            <Button
                                                                variant="outlined"
                                                                size="small"
                                                                onClick={handleMaxWBTC}
                                                                disabled={
                                                                    isSwapping
                                                                    || (direction === Direction.BUSD_WTC && mode === Mode.ExactTokenForToken)
                                                                    || (direction === Direction.WTC_BUSD && mode === Mode.TokenForExactToken)
                                                                }
                                                            >
                                                                Max
                                                            </Button>
                                                        </Stack>
                                                    }
                                                    variant="outlined"
                                                    disabled={
                                                        isSwapping
                                                        || (direction === Direction.BUSD_WTC && mode === Mode.ExactTokenForToken)
                                                        || (direction === Direction.WTC_BUSD && mode === Mode.TokenForExactToken)
                                                    }
                                                    value={WBTCValue.toString()}
                                                    onChange={handleWBTCValueChange}
                                                />
                                            </Stack>
                                            <Button
                                                onClick={toggleDirection}
                                                disabled={isSwapping}
                                                variant="text"
                                            >
                                                <LoopIcon fontSize="large" />
                                            </Button>
                                            <Stack direction="row" className="items-center" gap={2}>
                                                <BinanceUsd size={37} />
                                                <TextField
                                                    style={{ width: 250 }}
                                                    inputProps={{ min: 0 }}
                                                    label={
                                                        <Stack direction={"row"} gap={2} className="pl-4">
                                                            <Typography>BUSD</Typography>
                                                            <Button
                                                                variant="outlined"
                                                                size="small"
                                                                onClick={handleMaxBUSD}
                                                                disabled={
                                                                    isSwapping ||
                                                                    (direction === Direction.WTC_BUSD && mode === Mode.ExactTokenForToken) ||
                                                                    (direction === Direction.BUSD_WTC && mode === Mode.TokenForExactToken)
                                                                }
                                                            >
                                                                Max
                                                            </Button>
                                                        </Stack>
                                                    }
                                                    variant="outlined"
                                                    disabled={
                                                        isSwapping ||
                                                        (direction === Direction.WTC_BUSD && mode === Mode.ExactTokenForToken) ||
                                                        (direction === Direction.BUSD_WTC && mode === Mode.TokenForExactToken)
                                                    }
                                                    value={BUSDValue.toString()}
                                                    onChange={handleBUSDValueChange}
                                                />
                                            </Stack>
                                        </Stack>
                                        <Stack direction="row" gap={2} className="mt-4 self-center items-center">
                                            <Button
                                                variant="contained"
                                                size="large"
                                                onClick={handleSwap}
                                                disabled={isSwapping || (parseFloat(WBTCValue) + parseFloat(BUSDValue) === 0)}
                                            >
                                                <Stack direction="row" gap={1}>
                                                    <SwapCallsIcon />
                                                    <Typography>Swap</Typography>
                                                </Stack>
                                            </Button>
                                        </Stack>
                                        <OperationSummary
                                            isSwapping={isSwapping}
                                            mode={mode}
                                            direction={direction}
                                            BUSDValue={BUSDValue}
                                            WBTCValue={WBTCValue}
                                            slippage={slippage}
                                        />
                                    </Stack>
                                )
                            }
                            {!isReady && (
                                <div className="self-center p-4">
                                    <CircularProgress />
                                </div>
                            )}
                        </Stack>
                    </Box>
                </Card>
            </div>
        </ThemeProvider>
    )
});