import { Stack, Typography,  } from "@mui/material";

const fontSize = 11;

export default function TransferOperation({ action }: { action: any }) {
    return (
        <Stack direction={"column"} gap={0} className="animate-brightness">
            <Stack direction={"row"} gap={1}>
                <Typography className="w-14 text-left" fontSize={fontSize} fontWeight={700}>Transfer</Typography>
                <Typography fontSize={fontSize} className="text-blue-700 overflow-hidden overflow-ellipsis">{action.transactionHash.toString()}</Typography>
            </Stack>
            <Stack direction={"row"} gap={1}>
                <Typography  className="w-14 text-left" fontSize={fontSize}>From</Typography>
                <Typography fontSize={fontSize} className="text-blue-700 overflow-hidden overflow-ellipsis">{action.args.from}</Typography>
            </Stack>
            <Stack direction={"row"} gap={1}>
                <Typography className="w-14 text-left" fontSize={fontSize}>To</Typography>
                <Typography fontSize={fontSize} className="text-blue-700 overflow-hidden overflow-ellipsis">{action.args.to}</Typography>
            </Stack>
            <Stack direction={"row"} gap={1}>
                <Typography  className="w-14 text-left" fontSize={fontSize}>Value</Typography>
                <Typography fontSize={fontSize} className="text-blue-700 overflow-hidden overflow-ellipsis">{action.args.value.toString()}</Typography>
            </Stack>
        </Stack>
    )
}