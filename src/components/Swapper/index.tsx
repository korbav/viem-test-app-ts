import { Card, Stack, Typography, TextField, Button, Divider, CircularProgress, FormControlLabel, Radio, RadioGroup, FormControl, Box, Slider } from "@mui/material";
import LoopIcon from '@mui/icons-material/Loop';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { useCallback, useEffect, useState, useContext, forwardRef, useImperativeHandle } from "react";
import { BigFloat } from "bigfloat-esnext";
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
import { formatValueSwappper, parseFormattedValue } from "../../helpers/format";
import { genericErrorAlert } from "../../helpers/viem/notifications";
import OperationSummary from "../OperationSummary";

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

async function approve(parameters: any, address: string, value: BigFloat, decimals: number) {
    await getTestClient().writeContract({
        ...parameters,
        functionName: 'approve',
        args: [UniswapMumbaiRouterAddress, (value.mul(10 ** decimals).toString())],
        account: address as unknown as Account
    })
}

async function approveWBTC(address: string, value: BigFloat) {
    await approve(getWBTCContractParameters(), address, value, WBTC_DECIMALS);
}

async function approveBUSD(address: string, value: BigFloat) {
    await approve(getBUSDContractParameters(), address, value, BUSD_DECIMALS);
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
    const [ slippage, setSlippage ] = useState(10);
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
        let WBTCDesiredValue;
        const WBTCBalanceFloat = new BigFloat(WBTCBalance.toString());
        const WBTCReserveFloat = new BigFloat(WBTCReserve.toString());

        if (undefined !== val) {
            WBTCDesiredValue = new BigFloat(val);
            if (WBTCBalanceFloat.greaterThan(WBTCReserveFloat)) {
                return WBTCDesiredValue.greaterThan(WBTCReserveFloat) ? WBTCReserveFloat : WBTCDesiredValue
            } else {
                return WBTCDesiredValue?.greaterThan(WBTCBalanceFloat) ? WBTCBalanceFloat : WBTCDesiredValue
            }
        }
        return WBTCBalanceFloat.greaterThan(WBTCReserveFloat) ? WBTCReserveFloat : WBTCBalanceFloat
    }, [WBTCBalance, WBTCReserve]);

    const getMaxBUSDValue = useCallback((val?: string) => {
        let BUSDDesiredValue;
        const BUSDBalanceFloat = new BigFloat(BUSDBalance.toString());
        const BUSDReserveFloat = new BigFloat(BUSDReserve.toString());

        if (undefined !== val) {
            BUSDDesiredValue = new BigFloat(val);
            if (BUSDBalanceFloat.greaterThan(BUSDReserveFloat)) {
                return BUSDDesiredValue?.greaterThan(BUSDReserveFloat) ? BUSDReserveFloat : BUSDDesiredValue
            } else {
                return BUSDDesiredValue?.greaterThan(BUSDBalanceFloat) ? BUSDBalanceFloat : BUSDDesiredValue
            }
        }
        return BUSDBalanceFloat.greaterThan(BUSDReserveFloat) ? BUSDReserveFloat : BUSDBalanceFloat
    }, [BUSDBalance, BUSDReserve]);

    const handleSwap = useCallback(async () => {
        if (BUSDValue.toString() === "0" && WBTCValue.toString() === "0") {
            return;
        }

        const BUSDFloatValue = parseFormattedValue(BUSDValue);
        const WBTCFloatValue = parseFormattedValue(WBTCValue);

        try {
            if(direction === Direction.BUSD_WTC) {
                if(new BigFloat(BUSDBalance.toString()).lessThan(BUSDFloatValue)) {
                    throw { title: "BUSD value", msg: "Insufficient BUSD tokens in balance" };
                } else if(new BigFloat(WBTCReserve.toString()).lessThan(WBTCFloatValue)) {
                    throw { title: "WBTC value", msg: "Insufficient WBTC tokens in reserve" };
                }
            } else {
                if(new BigFloat(WBTCBalance.toString()).lessThan(WBTCFloatValue)) {
                    throw { title: "WBTC value", msg: "Insufficient WBTC tokens in balance" };
                } else if(new BigFloat(BUSDReserve.toString()).lessThan(BUSDFloatValue)) {
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
                            await approveBUSD(appData.address!, BUSDFloatValue);
                            await swapExactTokensForTokens(
                                appData.address!,
                                (BUSDFloatValue.mul(10 ** BUSD_DECIMALS).toString()),
                                (WBTCFloatValue.mul((100 - slippage) / 100).mul(10 ** WBTC_DECIMALS).toString()),
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
                            await approveWBTC(appData.address!, WBTCFloatValue);
                            await swapExactTokensForTokens(
                                appData.address!,
                                (WBTCFloatValue.mul(10 ** WBTC_DECIMALS).toString()),
                                (BUSDFloatValue.mul((100 - slippage) / 100).mul(10 ** BUSD_DECIMALS).toString()),
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
                    case Direction.BUSD_WTC:
                        setIsSwapping(true);
                        await approveBUSD(appData.address!, BUSDFloatValue.mul(1 + slippage/ 100));
                        await swapTokensForExactTokens(
                            appData.address!,
                            (WBTCFloatValue.mul(10 ** WBTC_DECIMALS).toString()),
                            (BUSDFloatValue.mul(1 + slippage/ 100).mul(10 ** BUSD_DECIMALS).toString()),
                            direction
                        );
                        setIsSwapping(false);
                        break;
                    case Direction.WTC_BUSD:
                        setIsSwapping(true);
                        await approveWBTC(appData.address!, WBTCFloatValue.mul(1 + slippage/ 100));
                        await swapTokensForExactTokens(
                            appData.address!,
                            (BUSDFloatValue.mul(10 ** BUSD_DECIMALS).toString()),
                            (WBTCFloatValue.mul(1 + slippage/ 100).mul(10 ** WBTC_DECIMALS).toString()),
                            direction
                        );
                        setIsSwapping(false);
                        break;
                }
                break;
        }
    }, [BUSDValue, WBTCValue, BUSDBalance, WBTCBalance, WBTCReserve, BUSDReserve]);



    const recomputeWBTCEquivalentValue = useCallback((newBUSDValue: string) => {   
        const reserveIn = BUSDReserve;
        const reserveOut = WBTCReserve;     
        switch (mode) {
            case Mode.ExactTokenForToken: {
                const amountIn = parseFormattedValue(newBUSDValue.replace(".", ""));
                if (!amountIn) return;
                const numerator = (amountIn).mul(997).mul(new BigFloat(reserveOut.toString()))
                const denominator = (new BigFloat(reserveIn.toString()).mul(1000)).add(amountIn.mul(997))
                const amountOut = numerator.div(denominator)
                setWBTCValue(formatValueSwappper(amountOut.toString()));
                break;
            }
            case Mode.TokenForExactToken: {
                const amountOut = parseFormattedValue(newBUSDValue.replace(".", ""));
                if (!amountOut) return;
                const numerator = (new BigFloat(reserveIn.toString())).mul(amountOut).mul(1000)
                const denominator = (new BigFloat(reserveOut.toString())).sub((amountOut).mul(997));
                const amountIn = (numerator.div(denominator)).add(1);
                setWBTCValue(formatValueSwappper(amountIn.toString()));
                break;
            }
        }
    }, [WBTCReserve, BUSDReserve, setWBTCValue]);


    const recomputeBUSDEquivalentValue = useCallback((newWBTCValue: string) => {
        const reserveIn = WBTCReserve;
        const reserveOut = BUSDReserve;
        switch (mode) {
            case Mode.ExactTokenForToken: {
                const amountIn = parseFormattedValue(newWBTCValue);
                if (!amountIn) return;
                const numerator = (amountIn).mul(997).mul(new BigFloat(reserveOut.toString()))
                const denominator = (new BigFloat(reserveIn.toString()).mul(1000)).add(amountIn.mul(997))
                const amountOut = numerator.div(denominator)
                setBUSDValue(formatValueSwappper(amountOut.toString()));
                break;
            }
            case Mode.TokenForExactToken: {
                const amountOut = parseFormattedValue(newWBTCValue);
                if (!amountOut) return;
                const numerator = (new BigFloat(reserveIn.toString())).mul(amountOut).mul(1000)
                const denominator = (new BigFloat(reserveOut.toString())).sub((amountOut).mul(997));
                const amountIn = (numerator.div(denominator)).add(1);
                setBUSDValue(formatValueSwappper(amountIn.toString()));
                break;
            }
        }
    }, [WBTCReserve, BUSDReserve, BUSDValue, setBUSDValue]);

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
                                            <Typography variant="caption">{formatValueSwappper(BUSDReserve.toString())}</Typography>
                                        </Stack>
                                        <Stack direction="row" gap={2} className="items-center">
                                            <BitcoinWrapped />
                                            <Typography variant="caption">{formatValueSwappper(WBTCReserve.toString())}</Typography>
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
                                            <Typography variant="caption">{formatValueSwappper(BUSDBalance.toString())}</Typography>
                                        </Stack>
                                        <Stack direction="row" gap={2} className="items-center">
                                            <BitcoinWrapped />
                                            <Typography variant="caption">{formatValueSwappper(WBTCBalance.toString())}</Typography>
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
                                                max={5}
                                                step={0.1}
                                                size="small"
                                                defaultValue={3}
                                                aria-label="Small"
                                                valueLabelDisplay="off"
                                                marks
                                                sx={{ mx: 3 }}
                                            />
                                            <Typography>5%</Typography>
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