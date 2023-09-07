import { useRef, useEffect, useContext } from "react";
import { Button } from "@mui/material";
import { AppStateContext } from "../../context/AppStateContext";

const POLLING_TIME = 10 * 1000;

export default function RefreshData({ refresh }: { refresh: () => void }) {
    const timer = useRef<any>();
    const { appData } = useContext(AppStateContext);

    useEffect(() => {
        timer.current = setInterval(refresh, POLLING_TIME);
        return () => clearInterval(timer.current)
    }, []);

    return !appData.address ? null : (
        <Button onClick={refresh} variant="outlined" color="info">
            Refresh now
        </Button>
    )
}