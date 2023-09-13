import { Card, Stack, } from "@mui/material";
import { useQuery } from "react-query";
import ActionsView from "../ActionsView";
import { useContext } from "react";
import { AppStateContext } from "../../context/AppStateContext";
import DailyVolumes from "../DailyVolumes"
import config from "../../assets/config.json";

const { APIAddress, autoRefreshThrottleTime: refetchInterval } = config;

const lastUserActionsCount = 10;
const allUsersActionsCount = 10;

export default function HistoricalDataPanels() {
    const { appData } = useContext(AppStateContext);

    const { data: userOperationsData } = useQuery(`userOperationsData${appData.address}`, () =>
        fetch(`${APIAddress}/operations/${appData.address}`).then(res => res.json()), { refetchInterval, enabled: appData.address !== null }
    )

    const { data: allUsersOperationsData } = useQuery(`operations${appData.address}`, () =>
        fetch(`${APIAddress}/operations/`).then(res => res.json()), { refetchInterval, enabled: appData.address != null }
    )

    const { data: allowancesData } = useQuery(`allowances${appData.address}`, () =>
        fetch(`${APIAddress}/allowances/${appData.address}`).then((res) => {
            return new Promise((resolve) => {
                res.json().then((data) => {
                    resolve(!data || data.length === 0 ? data : data[0].spenders.map((s: any) => ({ user: s.spender, value: s.value })))
                })
            });
            
        }), { refetchInterval, enabled: appData.address != null }
    )

    const { data: volumesData } = useQuery(`dailyvolumes`, () =>
        fetch(`${APIAddress}/dailyvolumes`).then(res => res.json()), { refetchInterval, enabled: appData.address != null }
    )

    return appData.address ? (
        <Stack direction="column" className="w-full" gap={2}>
            <Stack direction="row" className="p-4 w-full" gap={2}>
                <ActionsView mode="operations" count={lastUserActionsCount} actions={userOperationsData} title={`${lastUserActionsCount} last user actions`} />
                <ActionsView mode="operations" count={allUsersActionsCount} actions={allUsersOperationsData} title={`${allUsersActionsCount} last actions (all users)`} />
                <ActionsView mode="allowances" count={NaN} dataReady={Array.isArray(allowancesData) && allowancesData.length > 0} actions={allowancesData ? allowancesData as any[] : []} title={`user allowances`} />
            </Stack>
            <Card className="p-4 mx-4 mb-4 overflow-hidden">
                <DailyVolumes volumes={volumesData} />
            </Card>
        </Stack>
    ) : null;
}

