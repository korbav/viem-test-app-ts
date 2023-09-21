import { useCallback, useContext, useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { Input, Button, Typography, Stack, Box, CircularProgress, Divider } from "@mui/material";
import WarningIcon from "@mui/icons-material/WarningRounded";
import { BinanceUsd } from 'cryptocons'
import { useQuery } from 'react-query';
import { toast } from 'react-toastify';
import bigIntLib from "big-integer";
import { 
    checkSpenderAllowance,
    sendTransfer,
    sendTransferFrom, 
    mint, 
    burn, 
    approve, 
    transferOwnership, 
    renounceOwnership,
    getOwner
} from "../../helpers/viem/BUSD";
import { AppStateContext } from '../../context/AppStateContext';
import { genericErrorAlert, genericSuccessAlert } from '../../helpers/viem/notifications';
import config from "../../assets/config.json"
import { formatValue } from '../../helpers/format';


export default forwardRef(({ waitForTransactionFn }: {waitForTransactionFn: any}, ref) => {
    const { appData, setAppData } = useContext(AppStateContext);
    const [spender, setSpender] = useState<string>()
    const [allowanceValue, setAllowanceValue] = useState<string>()
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

    const { data: balanceValue, refetch: refetchUserBalance } = useQuery(`userBalancesData${appData.address}`, () =>
        fetch(`${config.APIAddress}/balances/${appData.address}`).then(res => res.json()), { initialData: "0", enabled: appData.address !== null }
    )

    const { data: totalSupplyValue, refetch: refetchTotalSupplyValue } = useQuery(`totalSupply${appData.address}`, () =>
        fetch(`${config.APIAddress}/totalsupply`).then(res => res.json()), { initialData: "0", enabled: appData.address !== null }
    )

    const triggerRefresh = useCallback(async () => {
        if(appData.address) {
            refetchUserBalance();
            refetchTotalSupplyValue();
        }
    }, [appData.address]);

    useImperativeHandle(ref, () => ({
        refresh: async () => {
           await triggerRefresh();
       },
       handleNewAction: function() {
            triggerRefresh().then();
       },
    }));

    useEffect(() => {
        if(appData.address) {
            triggerRefresh()
            getOwner()
                .then((owner) => {
                    setAppData({
                        ...appData, 
                        owner: owner.toString()
                    })
                })
        }
    }, [appData.address, appData.chainId])


    const checkAllowance = useCallback(() => {
        if(spender) {
            checkSpenderAllowance(appData.address!, spender).then(value => setAllowanceValue(value.toString()));
        }
    }, [spender, appData]);

    const triggerSendTransfer = useCallback(() => {
        if(transferRecipient && transferValue) {
            sendTransfer((appData.address)!, transferRecipient, BigInt(transferValue), waitForTransactionFn)
                .then(() => genericSuccessAlert())
                .catch((e) => {
                    genericErrorAlert(e);
                });
        }
    }, [transferValue, transferRecipient]);

    const triggerSendTransferFrom = useCallback(() => {
        if(transferFromRecipient && transferFromValue && transferFromAddress) {
            sendTransferFrom(appData.address!, transferFromAddress, transferFromRecipient, BigInt(transferFromValue), waitForTransactionFn)
                .then(() => genericSuccessAlert())
                .catch((e) => {
                    genericErrorAlert(e);
                });
        }
    }, [transferFromValue, transferFromRecipient, transferFromAddress]);

    const triggerApprove = useCallback(() => {
        if(approveSpenderAddress && approveSpenderAmount) {
            approve(appData.address!, approveSpenderAddress, BigInt(approveSpenderAmount), waitForTransactionFn)
                .then(() => genericSuccessAlert())
                .catch((e) => {
                    genericErrorAlert(e);
                });
        }
    }, [approveSpenderAddress, approveSpenderAmount]);

    const triggerMint = useCallback(() => {
        if(mintvalue) {
            mint(appData.address!, BigInt(mintvalue), waitForTransactionFn)
                .then(() => genericSuccessAlert())
                .catch((e) => {
                    genericErrorAlert(e);
                });
        }
    }, [mintvalue]);

    const triggerBurn = useCallback(() => {
        if(burnValue) {
            burn(appData.address!, BigInt(burnValue), waitForTransactionFn)
                .then(() => genericSuccessAlert())
                .catch((e) => {
                    genericErrorAlert(e);
                });
        }
    }, [burnValue]);

    const alertNotOwner = useCallback(() => {
        toast("Cannot proceed since you are not owning this contract.", { type: "error" })
    }, []);

    const checkIsOwner = useCallback(() => {
        return appData.owner?.toLowerCase() === appData.address?.toLowerCase();
    }, [appData.address, appData.owner]);

    const triggerTransferOwnerShip = useCallback(() => {
        if(checkIsOwner()) {
            transferOwnership(appData.address!, newOwner, waitForTransactionFn)
                .then(() => genericSuccessAlert())
                .catch((e) => {
                    genericErrorAlert(e);
                });
        } else {
            alertNotOwner();
        }
    }, [newOwner, appData.address]);

    const triggerRenounceOwnerShip = useCallback(() => {
        if(checkIsOwner()) {
            renounceOwnership(appData.address!, waitForTransactionFn)
                .then(() => genericSuccessAlert())
                .catch((e) => {
                    genericErrorAlert(e);
                });
        } else {
            alertNotOwner();
        }
    }, [appData.address]);

    return !appData.address? null : (
        <>
            { !totalSupplyValue ? (<CircularProgress />) : (
                <div className={"p-4 mx-4 shadow-md rounded-md bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-neutral-100 via-zinc-100 to-neutral-100"} >
                    <div className={"select-none p-2 mb-4 w-full shadow-md rounded-md text-white bg-[conic-gradient(at_top_left,_var(--tw-gradient-stops))] from-slate-600 via-slate-700 to-sky-200"}>
                        <Stack gap={1} direction={"row"} alignItems={'center'} justifyContent={'center'}>
                            <BinanceUsd />
                            <Typography variant='h5'>BUSD</Typography>
                        </Stack>
                    </div>
                    <Stack direction="column" gap={2} divider={<Divider />}>
                        <div>
                            <Stack direction="row" gap={2}>
                                <Typography fontWeight={700}>Total Supply</Typography>
                                <Typography className='text-blue-700'>{formatValue(bigIntLib(totalSupplyValue).toString())}</Typography>
                            </Stack>
                        </div>
                        <div>
                            <Stack direction="row" gap={2}>
                                <Typography fontWeight={700}>Balance</Typography>
                                <Typography className='text-blue-700'>{formatValue(balanceValue.toString())}</Typography>
                            </Stack>
                        </div>
                        <div>
                            <Box component="fieldset">
                                <legend>
                                    <Typography variant='overline'>Check allowance of a spender</Typography>    
                                </legend>
                                <Stack direction="row" gap={2}>                                
                                    <Input type="text" placeholder="Spender Address" onChange={e => setSpender(e.target.value)} />
                                    <Button onClick={checkAllowance} variant='contained' size='small'>
                                        Check allowance      
                                    </Button>
                                    { allowanceValue && (
                                        <div>
                                            <Stack direction="row" gap={2}>
                                                <Typography>Allowance</Typography>
                                                <Typography className='text-blue-700'>{formatValue(allowanceValue.toString())}</Typography>
                                            </Stack>
                                        </div>
                                    )}
                                </Stack>
                            </Box>
                        </div>
                        <div>
                            <Box component="fieldset">
                                <legend>
                                    <Typography variant='overline'>Transfer tokens</Typography>                                        
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
                        <div>
                            <Box component="fieldset">
                                <legend>
                                    <Typography variant='overline'>Transfer From</Typography>                                        
                                </legend>
                                <Stack direction="row" gap={2}>                                
                                    <Input type="string" placeholder="From Address" onChange={e => setTransferFromAddress(e.target.value)} />
                                    <Input type="text" placeholder="Recipient Address" onChange={e => setTransferFromRecipient(e.target.value)} />
                                    <Input type="number" inputProps={{ min: "1" }} placeholder="Value" onChange={e => setTransferFromValue(e.target.value)} />
                                    <Button onClick={triggerSendTransferFrom} variant='contained' size='small'>
                                        Transfer
                                    </Button>
                                </Stack>
                            </Box>
                        </div>
                        <div>
                            <Box component="fieldset">
                                <legend>
                                    <Typography variant='overline'>Approve</Typography>                                        
                                </legend>
                                <Stack direction="row" gap={2}>    
                                    <Input type="string" placeholder="Spender Address" onChange={e => setApproveSpenderAddress(e.target.value)} />
                                    <Input type="number" inputProps={{ min: "1" }} placeholder="Value" onChange={e => setApproveSpenderAmount(e.target.value)} />
                                    <Button onClick={triggerApprove} variant='contained' size='small'>
                                        Approve
                                    </Button>
                                </Stack>
                            </Box>
                        </div>
                        <div>
                            <Box component="fieldset">
                                <legend>
                                    <Typography variant='overline'>Mint</Typography>                                        
                                </legend>
                                <Stack direction="row" gap={2}>    
                                    <Input type="number" inputProps={{ min: "1" }} placeholder="Value" onChange={e => setMintvalue(e.target.value)} />
                                    <Button onClick={triggerMint} variant='contained' size='small'>
                                        Mint     
                                    </Button>
                                </Stack>
                            </Box>
                        </div>
                        <div>
                            <Box component="fieldset">
                                <legend>
                                    <Typography variant='overline'>Burn</Typography>                                        
                                </legend>
                                <Stack direction="row" gap={2}>    
                                    <Input type="number" inputProps={{ min: "1" }} placeholder="Value" onChange={e => setBurnValue(e.target.value)} />
                                    <Button onClick={triggerBurn} variant='contained' size='small'>
                                        Burn       
                                    </Button>
                                </Stack>
                            </Box>
                        </div>
                        {
                            !checkIsOwner() && (
                                <div className='select-none'>
                                    <Stack direction="row" gap={1} alignItems={'center'}>
                                        <WarningIcon fontSize='small' />
                                        <Typography variant='overline'>OWNER</Typography> 
                                        <Typography variant='overline'>({appData.owner})</Typography> 
                                    </Stack>
                                </div>
                            )
                        }
                        
                        <div className={`${checkIsOwner() ? "" : "touch-none select-none pointer-events-none opacity-30" }`}>
                            <Box component="fieldset">
                                <legend>
                                    <Typography variant='overline'>Transfer Ownership</Typography>                                        
                                </legend>
                                <Stack direction="row" gap={2}>    
                                    <Input type="text" placeholder="To New Owner Address" onChange={e => setNewOwner(e.target.value)} />
                                    <Button onClick={triggerTransferOwnerShip} variant='contained' size='small'>
                                        Transfer Ownership    
                                    </Button>
                                </Stack>
                            </Box>
                        </div>
                        <div className={`${checkIsOwner() ? "" : "touch-none select-none pointer-events-none opacity-30" }`}>
                            <Box component="fieldset">
                                <legend>
                                    <Typography variant='overline'>Renounce Ownership</Typography>                                        
                                </legend>
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