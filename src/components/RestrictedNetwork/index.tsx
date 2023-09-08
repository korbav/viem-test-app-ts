import  { PropsWithChildren, useContext } from "react";
import { isPolygonMumbai } from "../../helpers/viem/client";
import { Typography, Stack } from "@mui/material";
import WarningRounded from "@mui/icons-material/WarningRounded";
import { AppStateContext } from "../../context/AppStateContext";

export default function RestrictedNetwork({ children }: PropsWithChildren) {
    const { appData } = useContext(AppStateContext);

    if(!appData.address || isPolygonMumbai()) {
        return children;
    } else {
        return (
            <div>
                <Stack direction="row" gap={2}>
                    <WarningRounded fontSize="large" />
                    <Typography variant="h4">
                        Please switch to Polygon Mumbai network
                    </Typography>
                </Stack>
            </div>
        )
    }
}