import { PropsWithChildren, useCallback, useContext } from "react";
import { isPolygonMumbai } from "../../helpers/viem/client";
import {Stack, Button } from "@mui/material";
import WarningRounded from "@mui/icons-material/WarningRounded";
import { AppStateContext } from "../../context/AppStateContext";

export default function RestrictedNetwork({ children }: PropsWithChildren) {
    const { appData } = useContext(AppStateContext);

    const switchNetwork = useCallback(async () => {
        try {
            await (window!.ethereum as any).request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: '0x13881' }],
            });
        } catch (switchError: any) {
            console.log(switchError)
        }
    }, []);

    if (!appData.address || isPolygonMumbai()) {
        return children;
    } else {
        return (
            <div className="text-center">
                <Stack direction="row" gap={2} className="justify-center  items-center">
                    <Button onClick={switchNetwork} variant="contained">
                        <Stack direction={"row"} gap={1} className="justify-center  items-center">
                            <WarningRounded fontSize="large" />
                            <span>
                                Please switch to Polygon Mumbai network
                            </span>
                        </Stack>
                    </Button>
                </Stack>
            </div>
        )
    }
}