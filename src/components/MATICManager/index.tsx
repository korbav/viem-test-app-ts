import { useCallback, useContext, useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { getBalanceValue, sendTransfer } from "../../helpers/viem/MATIC";
import { AppStateContext } from '../../context/AppStateContext';
import { Box, Button, Input, Stack, Typography, CircularProgress, Divider } from '@mui/material';
import { genericErrorAlert, genericSuccessAlert } from '../../helpers/viem/notifications';
import { Polygon } from 'cryptocons';
import { formatValue } from '../../helpers/format';

export default forwardRef((_, ref) => {
    const { appData } = useContext(AppStateContext);
    const [balanceValue, setBalanceValue] = useState<string>()
    
    const [transferRecipient, setTransferRecipient] = useState<string>()
    const [transferValue, setTransferValue] = useState<string>()

    const triggerRefresh = useCallback(async () => {
        if(appData.address) {
            getBalanceValue(appData.address).then(value => setBalanceValue(value.toString()));
        }
    }, [appData.address]);

    useImperativeHandle(ref, () => ({
        refresh: async () => {
            await triggerRefresh();
        }
    }));

    const triggerSendTransfer = useCallback(() => {
        if(transferRecipient && transferValue) {
            sendTransfer(appData.address!, transferRecipient, parseInt(transferValue, 10))
                .then(() => genericSuccessAlert())
                .catch((e) => {
                    genericErrorAlert(e);
                });
        }
    }, [transferValue, transferRecipient]);
    

    useEffect(() => {
        if(appData.address) {
            triggerRefresh()
        }
    }, [appData.address, appData.chainId])

    
    return !appData.address? null : (
        <>
            { !balanceValue ? (<CircularProgress />) : (
                <div className={"p-4 mx-4 shadow-md rounded-md bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-neutral-100 via-zinc-100 to-neutral-100"} >
                    <div className={"select-none p-2 mb-4 w-full shadow-md rounded-md text-white bg-[conic-gradient(at_top_left,_var(--tw-gradient-stops))] from-slate-600 via-slate-700 to-sky-200"}>
                    <Stack gap={1} direction={"row"} alignItems={'center'} justifyContent={'center'}>
                            <Polygon />
                            <Typography variant='h5'>MATIC</Typography>
                        </Stack>
                    </div>
                    <Stack direction="column" gap={2} divider={<Divider />}>
                        <div>
                            <Stack direction="row" gap={2}>
                                <Typography fontWeight={700}>Balance</Typography>
                                <Typography className='text-blue-700'>{formatValue(balanceValue.toString())}</Typography>
                            </Stack>
                        </div>
                        <div>
                            <Box component="fieldset">
                                <legend>
                                    <Typography variant='overline'>Transfer</Typography>                                        
                                </legend>
                                <Stack direction="row" gap={2}>                                
                                    <Input type="text" placeholder="Recipient Address" onChange={e => setTransferRecipient(e.target.value)} />
                                    <Input type="number" inputProps={{ min: "1" }} placeholder="Value" onChange={e => setTransferValue(e.target.value)} />
                                    <Button onClick={triggerSendTransfer} variant='contained' size='small'>
                                        Transfer      
                                    </Button>
                                </Stack>
                            </Box>
                        </div>
                    </Stack>
                </div>
            )}
        </>
    )
});