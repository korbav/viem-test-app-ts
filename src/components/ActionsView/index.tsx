import { useEffect, createRef, useState } from "react";
import { Stack, Card, Typography, CircularProgress, Divider } from "@mui/material";
import TransferOperation from "../Operations/TransferOperation";
import ApprovalOperation from "../Operations/ApprovalOperation";
import Allowance from "../Operations/Allowance/Allowance";

export default function ActionsView({ count, title, actions, dataReady, mode }: { mode: "allowances"|"operations", dataReady ?: boolean, count: number, title: string, actions: null|any[]}) {
    const animationClass = "animate-brightness";
    const [firstRender, setFirstRender] = useState(true);
    const [actionsCache, setActionsCache] = useState("");
    const stackRef = createRef<any>();

    useEffect(() => {
        if(!actionsCache && actions && actions.length > 0) {
            setActionsCache(JSON.stringify(actions))
        } else if(actions && actions.length > 0) {
            setFirstRender(false)
            stackRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }, [actions])
    
    return (
        <Card className={`w-full p-2 box-borderoverflow-hidden`}>
            <Stack direction="column" gap={2}>
                <Typography variant="caption" fontWeight={700} className="my-2">
                    <Stack direction="row" gap={1} className="py-1 w-full select-none justify-center content-center items-center bg-blue-200 shadow-sm rounded-md">
                        { dataReady === false && (<CircularProgress size={14} />)}
                        <Typography className="text-blue-700 text-sm">{title.toUpperCase()}</Typography>
                    </Stack>
                </Typography>
                <Stack direction="column" gap={1} className="min-h-max h-64 overflow-y-auto overflow-x-hidden" ref={stackRef} position="relative">
                    { !actions || 0 === actions.length ? (
                            <div className="w-full content-center pt-4 justify-center flex">
                                <CircularProgress />
                            </div>
                        ) :
                        (
                            <Stack divider={(<Divider />)} gap={1}>
                            {
                                (Number.isNaN(count) ? actions.slice(-1 * count) : actions).map((action, index) => {
                                        const shouldAnimate = !firstRender &&  index === 0;
                                        return (
                                            <div key={JSON.stringify(action)} className={`rounded-md ${shouldAnimate ? animationClass : ""}`}>
                                                {
                                                    mode === "allowances" && (
                                                        <Allowance action={action} />
                                                    )
                                                }
                                                {
                                                    mode === "operations" && action.args.hasOwnProperty("from") && (
                                                        <TransferOperation action={action} />
                                                    )
                                                }
                                                {
                                                     mode === "operations" && action.args.hasOwnProperty("spender") && (
                                                        <ApprovalOperation action={action} />
                                                    )
                                                }
                                            </div>
                                        );
                                })
                            }
                            </Stack>
                        )
                    }
                </Stack>
            </Stack>
        </Card>
    );
}