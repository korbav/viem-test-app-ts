import { Stack, Typography,  } from "@mui/material";
import { formatValue } from "../../../helpers/format";

const fontSize = 11;

export default function TransferOperation({ action }: { action: any }) {
    return (
        <Stack direction={"column"} gap={0}>
            <Stack direction={"row"} gap={1}>
                <Typography className="w-14 min-w-14 max-w-14 text-left shrink-0" fontSize={fontSize} fontWeight={700}>Transfer</Typography>
                <Typography fontSize={fontSize} className="text-blue-700 overflow-hidden overflow-ellipsis">
                    <a  target="_blank" className="text-neutral-500 underline decoration-dotted" title={action.transactionHash.toString()} href={`https://mumbai.polygonscan.com/tx/${action.transactionHash.toString()}`}>
                        {action.transactionHash.toString()}
                    </a>
                </Typography>
            </Stack>
            <Stack direction={"row"} gap={1}>
                <Typography  className="w-14 min-w-14 max-w-14 text-left shrink-0" fontSize={fontSize}>From</Typography>
                <Typography fontSize={fontSize} className="text-blue-700 overflow-hidden overflow-ellipsis">{action.args.from}</Typography>
            </Stack>
            <Stack direction={"row"} gap={1}>
                <Typography className="w-14 min-w-14 max-w-14 text-left shrink-0" fontSize={fontSize}>To</Typography>
                <Typography fontSize={fontSize} className="text-blue-700 overflow-hidden overflow-ellipsis">{action.args.to}</Typography>
            </Stack>
            <Stack direction={"row"} gap={1}>
                <Typography  className="w-14 min-w-14 max-w-14 text-left shrink-0" fontSize={fontSize}>Value</Typography>
                <Typography fontSize={fontSize} className="text-blue-700 overflow-hidden overflow-ellipsis" title={formatValue(action.args.value.toString())}>{formatValue(action.args.value.toString())}</Typography>
            </Stack>
        </Stack>
    )
}