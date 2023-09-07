import { useRef, useEffect, useContext, useCallback } from "react";
import { Button } from "@mui/material";
import { AppStateContext } from "../../context/AppStateContext";
import { toast } from "react-toastify";

const POLLING_TIME = 30 * 1000;

const genericRefresh = (refresh: () => Promise<void>, pending: string): void => {
    toast.promise(
        refresh,
        {
          pending,
          success: 'Refreshed',
          error: 'Could not refresh'
        },
        {
            autoClose: 1000
        }
    )
}

export default function RefreshData({ refresh }: { refresh: () => Promise<void> }) {
    const timer = useRef<any>();
    const { appData } = useContext(AppStateContext);

    const autoRefresh = useCallback(() => {
        genericRefresh(refresh, 'Auto Refreshing..');
    }, [refresh]);

    const manualRefresh = useCallback(async () => {
        genericRefresh(refresh, 'Refreshing..');
    }, [refresh]);

    useEffect(() => {
        timer.current = setInterval(autoRefresh, POLLING_TIME);
        return () => clearInterval(timer.current)
    }, []);

    return !appData.address ? null : (
        <Button onClick={manualRefresh} variant="contained" color="info">
            Refresh now
        </Button>
    )
}