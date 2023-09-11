import { Stack, } from "@mui/material";
import ActionsView from "../ActionsView";
import { useContext, useCallback, useRef, useEffect, useState } from "react";
import { AppStateContext } from "../../context/AppStateContext";
import { fetchContractActions } from "../../helpers/viem/BUSD";

const lastUserActionsCount = 10;
const allUsersActionsCount = 10;


const readCache = (): any[] => window.localStorage.getItem("actions") != null ? JSON.parse(window.localStorage.getItem("actions")!.toString()) as any[] : [];

const getFirstCachedBlock = (): BigInt|null => {
    const cache = readCache();
    if(cache.length > 0) {
        return cache[0].blockNumber;
    }
    return null;
}

const updateCache = (actions: any[]) => window.localStorage.setItem("actions", JSON.stringify(actions, (_, v) => typeof v === 'bigint' ? v.toString() : v));

const insertAction = (actionsSink: any[], d: any) => {
    if (d && !actionsSink.find(a => a.transactionHash === d.transactionHash)) { // Avoid duplicates
        if(actionsSink.length === 0) {
            actionsSink.push(d)
        } else {
            let i = actionsSink.length - 1;
            while((d.blockNumber <= actionsSink[i].blockNumber || (d.blockNumber === actionsSink[i].blockNumber && d.transactionIndex < actionsSink[i].transactionIndex))  && i > 0) {
                i--;
            }
            actionsSink.splice(i, 0, d);
        }
        updateCache(actionsSink);
    }
}

export default function HistoricalDataPanels() {
    const { appData } = useContext(AppStateContext);
    const [actionsSink] = useState<any[]>(readCache());
    const [actionsUpdated, setActionsUpdated] = useState<number>(0);
    const [isChainHistoricalDataReady, setIsChainHistoricalDataReady] = useState<boolean>(false);
    const fetchActionsTimerRef = useRef<any>();


    useEffect(() => {
        if (appData.address) {
            clearInterval(fetchActionsTimerRef.current);
            const fromBlock = getFirstCachedBlock();
            fetchContractActions((gotActions: any[]) => {
                gotActions.forEach((d) => {
                    insertAction(actionsSink, d);
                    setActionsUpdated(Date.now())
                })
            }, fromBlock).then(() => setIsChainHistoricalDataReady(true));

            clearInterval(fetchActionsTimerRef.current)
            fetchActionsTimerRef.current = setInterval(async () => {
                await fetchContractActions((gotActions: any[]) => {
                    gotActions.forEach((d) => {
                        insertAction(actionsSink, d);
                        setActionsUpdated(Date.now())
                    })
                }, null);
            }, 5000)
        }

        return () => clearInterval(fetchActionsTimerRef.current)
    }, [appData.address])
    
    const allowances = useCallback(() => {
        if (appData.address) {
            const userAllowances: Record<string, BigInt> = {};

            (actionsSink)
                .filter((a: any) => a.eventName === "Approval" && a.args.owner.toLowerCase() === appData.address!.toLowerCase())
                .reduceRight((_, action) => {
                    if (!userAllowances.hasOwnProperty(action.args.spender)) {
                        userAllowances[action.args.spender] = action.args.value;
                    }
                }, null);

            return Object.keys(userAllowances).map(k => ({
                user: k,
                value: userAllowances[k]
            }));
        }
        return null;
    }, [appData.address, actionsSink, actionsUpdated])

    const userActions = useCallback(() => {
        if (appData.address) {
            return actionsSink.filter((action) => {
                return ["Transfer", "Approval"].includes(action.eventName) && (
                    (action.args.owner || "").toLowerCase() === appData.address!.toLowerCase()
                    || (action.args.from || "").toLowerCase() === appData.address!.toLowerCase()
                    || (action.args.to || "").toLowerCase() === appData.address!.toLowerCase()
                )
            }).slice(-1 * lastUserActionsCount);
        }
        return null;
    }, [appData.address, actionsSink, actionsUpdated])

    const allUsersActions = useCallback(() => {
        if (appData.address) {
            return actionsSink.filter((action) => {
                return ["Transfer", "Approval"].includes(action.eventName)
            }).slice(-1 * lastUserActionsCount);
        }
        return null;
    }, [appData.address, actionsSink, actionsUpdated])

    return appData.address ? (
        <Stack direction="row" className="p-4 mb-4 w-full box-border" gap={2}>
            <ActionsView count={lastUserActionsCount} actions={userActions()} title={`${lastUserActionsCount} last user actions`} />
            <ActionsView count={allUsersActionsCount} actions={allUsersActions()} title={`${allUsersActionsCount} last actions (all users)`} />
            <ActionsView count={NaN} dataReady={isChainHistoricalDataReady} actions={allowances()} title={`user allowances`} />
        </Stack>
    ) : null;
}

