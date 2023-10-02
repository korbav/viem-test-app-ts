import {  Chip, CircularProgress, Stack, Typography } from "@mui/material";
import { Info as InfoIcon, ArrowRightSharp as ArrowIcon } from '@mui/icons-material';
import { Mode, Direction } from "../Swapper";
import { formatValueSwappper, parseFormattedValue } from "../../helpers/format";

export default function OperationSummary({ mode, direction, BUSDValue, WBTCValue, isSwapping, slippage }: any) {
    let summaryText0 = "Selling"
    let summaryText1;
    let summaryText2 = "Minimum received";
    let summaryText3;
    
    if(BUSDValue === "0" && WBTCValue === "0") {
        return null;
    }

    switch(mode) {
        case Mode.ExactTokenForToken: {
            if(direction === Direction.BUSD_WTC) {
                summaryText1 = `${BUSDValue.toString()} BUSD`
                summaryText3 = `${formatValueSwappper((parseFormattedValue(WBTCValue)).mul((100 - slippage) / 100).toString())} WBTC`
            } else {
                summaryText1 = `${WBTCValue.toString()} WBTC`
                summaryText3 = `${formatValueSwappper((parseFormattedValue(BUSDValue)).mul((100 - slippage) / 100).toString())} BUSD` 
            }
            break;
        }
        case Mode.TokenForExactToken: {
            summaryText0 = "Buying";
            summaryText2 = "Maximum sent";
            if(direction === Direction.BUSD_WTC) {
                summaryText1 = `${WBTCValue.toString()} WBTC`
                summaryText3 = `${formatValueSwappper((parseFormattedValue(BUSDValue)).mul(1 + slippage / 100).toString())} BUSD`
            } else {
                summaryText1 = `${BUSDValue.toString()} BUSD`
                summaryText3 = `${formatValueSwappper((parseFormattedValue(WBTCValue)).mul(1 + slippage / 100).toString())} WBTC`
            }
            break;
        }
    }
    return (
        <Chip
            variant="filled"
            className={`shadow-md !bg-neutral-700 ${isSwapping ? "animate-swapping" : ""}`}
            label={
                <Stack direction="row" gap={1} className="items-center select-none">
                    {
                        isSwapping ? (<CircularProgress size={12} />) : (<InfoIcon fontSize={"small"} />)
                    }
                    <Typography variant="caption">
                        {summaryText0}
                    </Typography>
                    <Typography variant="caption" className="font-bold text-blue-500">
                        {summaryText1}
                    </Typography>
                    <ArrowIcon />
                    <Typography variant="caption">
                        {summaryText2}
                    </Typography>
                    <Typography variant="caption"  className="font-bold text-blue-500">
                        {summaryText3}
                    </Typography>
                </Stack>
            }
        />
    )
}