import { useCallback, useContext, useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { getBalanceValue, sendTransfer } from "../../helpers/viem/MATIC";
import { AppStateContext } from '../../context/AppStateContext';
import { Box, Button, Input, Stack, Typography, CircularProgress } from '@mui/material';
import { genericErrorAlert, genericSuccessAlert } from '../../helpers/viem/notifications';

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
        refresh() {
            triggerRefresh();
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
                <div className={"p-4 mx-4 shadow-md bg-gradient-to-br from-blue-100 to-zinc-200 rounded-md"} >
                    <Typography variant='h4' className='pb-5 underline'>MATIC</Typography>
                    <Stack direction="column" gap={2}>
                        <div>
                            <Stack direction="row" gap={2}>
                                <Typography>Balance</Typography>
                                <Typography className='text-blue-700'>{balanceValue.toString()}</Typography>
                            </Stack>
                        </div>
                        <div>
                            <Box component="fieldset">
                                <legend>Transfer</legend>
                                <Stack direction="row" gap={2}>                                
                                    <Input type="number" placeholder="Value" onChange={e => setTransferValue(e.target.value)} />
                                    <Input type="text" placeholder="Recipient Address" onChange={e => setTransferRecipient(e.target.value)} />
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