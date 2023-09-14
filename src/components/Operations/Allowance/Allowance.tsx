import { Stack, Typography } from "@mui/material";
import { formatValue } from "../../../helpers/format";

const fontSize = 11;

export default function Allowance({ action }: { action: any }) {
    return (
        <Stack direction={"column"} gap={0} className="animate-brightness">
            <Stack direction={"row"} gap={1}>
                <Typography className="w-14 min-w-14 max-w-14 text-left shrink-0" fontSize={fontSize}>User</Typography>
                <Typography fontSize={fontSize} className="text-blue-700 overflow-hidden overflow-ellipsis">{action.user}</Typography>
            </Stack>
            <Stack direction={"row"} gap={1}>
                <Typography className="w-14 min-w-14 max-w-14 text-left shrink-0" fontSize={fontSize}>Value</Typography>
                <Typography fontSize={fontSize} className="text-blue-700 overflow-hidden overflow-ellipsis">{formatValue(BigInt(action.value).toString())}</Typography>
            </Stack>
        </Stack>
    )
}