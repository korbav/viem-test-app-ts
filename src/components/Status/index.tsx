import { useContext } from "react";
import { Stack, Typography } from '@mui/material';
import KeyOffIcon from '@mui/icons-material/KeyOff';
import FlashOn from '@mui/icons-material/FlashOn';
import { AppStateContext, AppStateContextType } from "../../context/AppStateContext";

export default function Status() {  
    const { appData } = useContext<AppStateContextType>(AppStateContext);
  
    return (
        <Stack direction="row" gap={1} className="fixed z-10 justify-center select-none py-5 bottom-0 left-0 w-full bg-slate-950 text-slate-50 opacity-95 shadow-lg">
            {appData.address ? <FlashOn /> : <KeyOffIcon />}
            <Typography variant="body1" className="text-yellow-200">
                {appData.address ? "Wallet connected" : "Wallet disconnected"}
            </Typography>
        </Stack>
    );
  }