import { Stack, Card, Typography, CircularProgress, Divider } from "@mui/material";
import TransferOperation from "../Operations/TransferOperation";
import ApprovalOperation from "../Operations/ApprovalOperation";
import Allowance from "../Operations/Allowance/Allowance";

export default function ActionsView({ count, title, actions, dataReady }: { dataReady ?: boolean, count: number, title: string, actions: null|any[]}) {
    return (
        <Card className="w-full p-2 box-border overflow-hidden">
            <Stack direction="column" gap={2}>
                <Typography variant="caption" fontWeight={700} className="my-2">
                    <Stack direction="row" gap={1} className="py-1 select-none justify-center content-center items-center bg-blue-200 shadow-sm rounded-md">
                        { dataReady === false && (<CircularProgress size={14} />)}
                        <Typography className="text-blue-700 text-sm">{title.toUpperCase()}</Typography>
                    </Stack>
                </Typography>
                <Stack direction="column" gap={1} className="min-h-max h-64 overflow-y-auto overflow-x-hidden">
                    { actions === null || 0 === actions.length ? (
                            <div className="w-full content-center pt-4">
                                <CircularProgress />
                            </div>
                        ) :
                        (
                            <Stack divider={(<Divider />)} gap={1} direction={"column-reverse"}>
                            {
                                (Number.isNaN(count) ? actions.slice(-1 * count) : actions).map((action, index) => {
                                        return (
                                            <div key={`action-${index.toString()}`}>
                                                {
                                                    (!action.hasOwnProperty("eventName")) && (
                                                        <Allowance action={action} />
                                                    )
                                                }
                                                {
                                                    (action as any).eventName === "Transfer" && (
                                                        <TransferOperation action={action} />
                                                    )
                                                }
                                                {
                                                    (action as any).eventName === "Approval" && (
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