import { useContext } from "react";
import { Stack, Typography } from '@mui/material';
import { AppStateContext } from "../../context/AppStateContext";
import RefreshData from "../RefreshData";

export default function HeaderBar({ refresh }: { refresh: () => void }) {  
    const { appData } = useContext(AppStateContext);
  
    return !appData.address ? null : (
        <Stack direction="row" gap={1} className="fixed z-10 justify-center select-none py-5 top-0 left-0 w-full bg-slate-950 text-slate-50 opacity-95 shadow-lg">
          <div className="fixed top-3 left-3 z-10">
            <RefreshData refresh={refresh} />
          </div>
          <div>
            <Stack direction="row" gap={1}>
                <Typography variant="body1" className="text-slate-50">
                    Current Account:
                </Typography>
                <Typography variant="body1" className="text-yellow-200">
                    {appData.address.toString()}
                </Typography>
            </Stack>
          </div>
        </Stack>
    );
  }