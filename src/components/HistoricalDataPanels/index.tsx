import { Card, Stack, } from "@mui/material";
import { useContext, useImperativeHandle, forwardRef } from "react";
import { useQuery } from "react-query";
import bigIntLib from "big-integer";
import ActionsView from "../ActionsView";
import { AppStateContext } from "../../context/AppStateContext";
import DailyVolumes from "../DailyVolumes"
import config from "../../assets/config.json";
import { queryClient } from "../../App";

const { APIAddress, autoRefreshThrottleTime: refetchInterval } = config;

const lastUserActionsCount = 10;
const allUsersActionsCount = 10;

export default forwardRef((_, ref) => {
    const { appData } = useContext(AppStateContext);
    
    const { data: userOperationsData, refetch: refetcUserOperationData } = useQuery(`userOperationsData${appData.address}`, () =>
        fetch(`${APIAddress}/operations/${appData.address}`).then(res => res.json()), { refetchInterval, enabled: appData.address !== null }
    )

    const { data: allUsersOperationsData, refetch: refetchAllUsersOperationData } = useQuery(`operations${appData.address}`, () =>
        fetch(`${APIAddress}/operations/`).then(res => res.json()), { refetchInterval, enabled: appData.address != null }
    )

    const { data: allowancesData, refetch: refetchAllowancesData } = useQuery<any>(`allowances${appData.address}`, () =>
        fetch(`${APIAddress}/allowances/${appData.address}`).then((res) => {
            return new Promise((resolve) => {
                res.json().then((data) => {
                    resolve(!data || data.length === 0 ? data : data[0].spenders.map((s: any) => ({ user: s.spender, value: s.value })))
                })
            });
            
        }), { refetchInterval, enabled: appData.address != null }
    )

    const { data: volumesData, refetch: refetchDailyVolumesData  } = useQuery(`dailyvolumes`, () =>
        fetch(`${APIAddress}/dailyvolumes`).then(res => res.json()), { refetchInterval, enabled: appData.address != null }
    )
    
    useImperativeHandle(ref, () => ({
        refresh: async function() {
            await refetchAllowancesData();
            await refetchAllUsersOperationData();
            await refetcUserOperationData();
            await refetchDailyVolumesData();
        },

        handleNewAction: function(action: any) {
            if(!appData.address) {
                return;
            }
            switch(action.eventName) {
                case "Transfer":
                    if(
                        [action.args.from.toLowerCase(), action.args.to.toLowerCase()]
                            .includes(appData.address?.toLowerCase())
                    ) {
                        queryClient.setQueryData(
                            [`userOperationsData${appData.address}`],
                            [action, ...userOperationsData]
                          );
                    }
                    
                    const newDailyVolumes = [ ...(volumesData||[]) ];
                    const now = new Date();
                    now.setHours(0,0,0,0);
                    const tzoffset = now.getTimezoneOffset() * 60000; //offset in milliseconds
                    const nowWithoutTZ = new Date(now.getTime() + tzoffset)
                    const timestamp = nowWithoutTZ.getTime();
                    const index = newDailyVolumes.findIndex(dv => dv.timestamp === timestamp);
                    
                    if(index !== -1) {
                        const newVolume = {
                            timestamp,
                            value: bigIntLib(newDailyVolumes[index].value.toString()).add(bigIntLib(action.args.value.toString()))
                        };
                        newDailyVolumes[index] = newVolume;
                    } else {
                        const newVolume = {
                            timestamp,
                            value: action.args.value
                        };
                        newDailyVolumes.push(newVolume);
                    }

                    queryClient.setQueryData(
                        [`dailyvolumes`],
                        newDailyVolumes
                      );
                    break;
                    case "Approval":
                        if(action.args.owner.toLowerCase() === appData.address.toLowerCase()) {
                            const index = allowancesData.findIndex((a: any) => a.user.toLowerCase() === action.args.spender.toLowerCase());
                            const newAlllowances = [ ...allowancesData ];
                            if(index !== -1) {
                                newAlllowances.splice(index, 1)
                            }
                            newAlllowances.unshift({
                                user: action.args.spender.toLowerCase(),
                                value: action.args.value
                            });
                            queryClient.setQueryData([`allowances${appData.address}`], newAlllowances);
                            queryClient.setQueryData(
                                [`userOperationsData${appData.address}`],
                                [action, ...userOperationsData]
                            );
                        }
                        break;
            }
            
            queryClient.setQueryData(
                [`operations${appData.address}`],
                [action, ...allUsersOperationsData]
            );
        },
    }), [userOperationsData, allUsersOperationsData, allowancesData, appData.address]);


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
})

