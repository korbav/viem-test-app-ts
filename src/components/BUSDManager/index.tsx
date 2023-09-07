import { useCallback, useContext, useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { Input, Button, Typography, Stack, Box, CircularProgress } from "@mui/material";
import { 
    getBUSDContractData, 
    checkSpenderAllowance, 
    getBalanceValue, 
    sendTransfer,
    sendTransferFrom, 
    mint, 
    burn, 
    approve, 
    transferOwnership, 
    renounceOwnership, 
    getOwner,
    ContractDataType
} from "../../helpers/viem/BUSD";
import { AppStateContext } from '../../context/AppStateContext';
import { toast } from 'react-toastify';
import { genericErrorAlert, genericSuccessAlert } from '../../helpers/viem/notifications';



export default forwardRef((_, ref) => {
    const { appData } = useContext(AppStateContext);
    const [contractData, setContractData] = useState<ContractDataType>()
    const [spender, setSpender] = useState<string>()
    const [allowanceValue, setAllowanceValue] = useState<string>()
    const [balanceValue, setBalanceValue] = useState<BigInt>(0n)
    const [mintvalue, setMintvalue] = useState<string>()
    const [burnValue, setBurnValue] = useState<string>()
    
    const [transferRecipient, setTransferRecipient] = useState<string>()
    const [transferValue, setTransferValue] = useState<string>()
    
    const [transferFromValue, setTransferFromValue] = useState<string>()
    const [transferFromAddress, setTransferFromAddress] = useState<string>()
    const [transferFromRecipient, setTransferFromRecipient] = useState<string>()
    const [approveSpenderAddress, setApproveSpenderAddress] = useState<string>()
    const [approveSpenderAmount, setApproveSpenderAmount] = useState<string>()

    const [newOwner, setNewOwner] = useState<string>("")

    const triggerRefresh = useCallback(async () => {
        if(appData.address) {
            getBalanceValue(appData.address).then(value => setBalanceValue(value));
            getBUSDContractData().then(data => setContractData(data));
        }
    }, [appData.address]);

    useImperativeHandle(ref, () => ({
        refresh() {
            triggerRefresh()
        }
    }));

    useEffect(() => {
        if(appData.address) {
            triggerRefresh()
        }
    }, [appData.address, appData.chainId])


    const checkAllowance = useCallback(() => {
        if(spender) {
            checkSpenderAllowance(appData.address!, spender).then(value => setAllowanceValue(value.toString()));
        }
    }, [spender, appData]);

    const triggerSendTransfer = useCallback(() => {
        if(transferRecipient && transferValue) {
            sendTransfer(appData.address!, transferRecipient, parseInt(transferValue, 10))
                .then(() => genericSuccessAlert())
                .catch((e) => {
                    genericErrorAlert(e);
                });
        }
    }, [transferValue, transferRecipient]);

    const triggerSendTransferFrom = useCallback(() => {
        if(transferFromRecipient && transferFromValue && transferFromAddress) {
            sendTransferFrom(appData.address!, transferFromAddress, transferFromRecipient, parseInt(transferFromValue, 10))
                .then(() => genericSuccessAlert())
                .catch((e) => {
                    genericErrorAlert(e);
                });
        }
    }, [transferFromValue, transferFromRecipient, transferFromAddress]);

    const triggerApprove = useCallback(() => {
        if(approveSpenderAddress && approveSpenderAmount) {
            approve(appData.address!, approveSpenderAddress, parseInt(approveSpenderAmount, 10))
                .then(() => genericSuccessAlert())
                .catch((e) => {
                    genericErrorAlert(e);
                });
        }
    }, [approveSpenderAddress, approveSpenderAmount]);

    const triggerMint = useCallback(() => {
        if(mintvalue) {
            mint(appData.address!, parseInt(mintvalue, 10))
                .then(() => genericSuccessAlert())
                .catch((e) => {
                    genericErrorAlert(e);
                });
        }
    }, [mintvalue]);

    const triggerBurn = useCallback(() => {
        if(burnValue) {
            burn(appData.address!, parseInt(burnValue, 10))
                .then(() => genericSuccessAlert())
                .catch((e) => {
                    genericErrorAlert(e);
                });
        }
    }, [burnValue]);

    const alertNotOwner = useCallback(() => {
        toast("Cannot proceed since you are not owning this contract.", { type: "error" })
    }, []);

    const checkIsOwner = useCallback(async () => {
        const owner = await getOwner();
        return owner == appData.address;
    }, [appData.address]);

    const triggerTransferOwnerShip = useCallback(() => {
        checkIsOwner().then((isOwner) => {
            if(isOwner) {
                transferOwnership(appData.address!, newOwner)
                    .then(() => genericSuccessAlert())
                    .catch((e) => {
                        genericErrorAlert(e);
                    });
            } else {
                alertNotOwner();
            }
        });
    }, [newOwner]);

    const triggerRenounceOwnerShip = useCallback(() => {
        checkIsOwner().then((isOwner) => {
            if(isOwner) {
                renounceOwnership(appData.address!)
                    .then(() => genericSuccessAlert())
                    .catch((e) => {
                        genericErrorAlert(e);
                    });
            } else {
                alertNotOwner();
            }
        });
    }, []);

    return !appData.address? null : (
        <>
            { !contractData ? (<CircularProgress />) : (
                <div className={"p-4 mx-4 shadow-md bg-gradient-to-br from-blue-100 to-zinc-200 rounded-md"} >
                    <Typography variant='h4' className='pb-5 underline'>BUSD</Typography>
                    <Stack direction="column" gap={2}>
                        <div>
                            <Stack direction="row" gap={2}>
                                <Typography>Contract total supply</Typography>
                                <Typography className='text-blue-700'>{contractData.totalSupply.toString()}</Typography>
                            </Stack>
                        </div>
                        <div>
                            <Stack direction="row" gap={2}>
                                <Typography>Balance</Typography>
                                <Typography className='text-blue-700'>{balanceValue.toString()}</Typography>
                            </Stack>
                        </div>
                        <div>
                            <Box component="fieldset">
                                <legend>Check allowance of a spender</legend>
                                <Stack direction="row" gap={2}>                                
                                    <Input type="text" placeholder="Spender Address" onChange={e => setSpender(e.target.value)} />
                                    { allowanceValue && (
                                        <div>
                                            <Stack direction="row" gap={2}>
                                                <Typography>Allowance</Typography>
                                                <Typography className='text-blue-700'>{allowanceValue.toString()}</Typography>
                                            </Stack>
                                        </div>
                                    )}
                                    <Button onClick={checkAllowance} variant='contained' size='small'>
                                        Check allowance      
                                    </Button>
                                </Stack>
                            </Box>
                        </div>
                        <div>
                            <Box component="fieldset">
                                <legend>Transfer tokens</legend>
                                <Stack direction="row" gap={2}>                                
                                    <Input type="number" placeholder="Value" onChange={e => setTransferValue(e.target.value)} />
                                    <Input type="text" placeholder="Recipient Address" onChange={e => setTransferRecipient(e.target.value)} />
                                    <Button onClick={triggerSendTransfer} variant='contained' size='small'>
                                        Transfer     
                                    </Button>
                                </Stack>
                            </Box>
                        </div>
                        <div>
                            <Box component="fieldset">
                                <legend>TransferFrom</legend>
                                <Stack direction="row" gap={2}>                                
                                    <Input type="string" placeholder="From Address" onChange={e => setTransferFromAddress(e.target.value)} />
                                    <Input type="number" placeholder="Value" onChange={e => setTransferFromValue(e.target.value)} />
                                    <Input type="text" placeholder="Recipient address" onChange={e => setTransferFromRecipient(e.target.value)} />
                                    <Button onClick={triggerSendTransferFrom} variant='contained' size='small'>
                                        Transfer
                                    </Button>
                                </Stack>
                            </Box>
                        </div>
                        <div>
                            <Box component="fieldset">
                                <legend>Approve</legend>
                                <Stack direction="row" gap={2}>    
                                    <Input type="string" placeholder="Spender Address" onChange={e => setApproveSpenderAddress(e.target.value)} />
                                    <Input type="number" placeholder="Value" onChange={e => setApproveSpenderAmount(e.target.value)} />
                                    <Button onClick={triggerApprove} variant='contained' size='small'>
                                        Approve!       
                                    </Button>
                                </Stack>
                            </Box>
                        </div>
                        <div>
                            <Box component="fieldset">
                                <legend>Mint</legend>
                                <Stack direction="row" gap={2}>    
                                    <Input type="number" placeholder="Value" onChange={e => setMintvalue(e.target.value)} />
                                    <Button onClick={triggerMint} variant='contained' size='small'>
                                        Mint     
                                    </Button>
                                </Stack>
                            </Box>
                        </div>
                        <div>
                            <Box component="fieldset">
                                <legend>Burn</legend>
                                <Stack direction="row" gap={2}>    
                                    <Input type="number" placeholder="Value" onChange={e => setBurnValue(e.target.value)} />
                                    <Button onClick={triggerBurn} variant='contained' size='small'>
                                        Burn       
                                    </Button>
                                </Stack>
                            </Box>
                        </div>
                        <div>
                            <Box component="fieldset">
                                <legend>Transfer Ownership</legend>
                                <Stack direction="row" gap={2}>    
                                    <Input type="text" placeholder="To New Owner Address" onChange={e => setNewOwner(e.target.value)} />
                                    <Button onClick={triggerTransferOwnerShip} variant='contained' size='small'>
                                        Transfer Ownership    
                                    </Button>
                                </Stack>
                            </Box>
                        </div>
                        <div>
                            <Box component="fieldset">
                                <legend>Renounce Ownership</legend>
                                <Stack direction="row" gap={2}>    
                                    <Button onClick={triggerRenounceOwnerShip} variant='contained' size='small'>
                                        Renounce Ownership    
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