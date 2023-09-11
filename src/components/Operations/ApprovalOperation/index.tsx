import { Stack, Typography } from "@mui/material";

const fontSize = 11;

export default function ApprovalOperation({ action }: { action: any }) {
    return (
        <Stack direction={"column"} gap={0.1} fontSize={10} className="animate-brightness">
            <Stack direction={"row"} gap={1}>
                <Typography className="w-14 text-left" fontWeight={700} fontSize={fontSize}>Approval</Typography>
                <Typography fontSize={fontSize} className="text-blue-700 overflow-hidden overflow-ellipsis">{action.transactionHash.toString()}</Typography>
            </Stack>
            <Stack direction={"row"} gap={1}>
                <Typography className="w-14 text-left" fontSize={fontSize}>Owner</Typography>
                <Typography fontSize={fontSize} className="text-blue-700 overflow-hidden overflow-ellipsis">{action.args.owner}</Typography>
            </Stack>
            <Stack direction={"row"} gap={1}>
                <Typography className="w-14 text-left" fontSize={fontSize}>Spender</Typography>
                <Typography fontSize={fontSize} className="text-blue-700 overflow-hidden overflow-ellipsis" >{action.args.spender}</Typography>
            </Stack>
            <Stack direction={"row"} gap={1}>
                <Typography className="w-14 text-left" fontSize={fontSize}>Value</Typography>
                <Typography fontSize={fontSize} className="text-blue-700 overflow-hidden overflow-ellipsis">{action.args.value.toString()}</Typography>
            </Stack>
        </Stack>
    )
}