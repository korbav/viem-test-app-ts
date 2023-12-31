import { useEffect, useContext, useState, useCallback } from "react";
import { toast } from 'react-toastify';
import { Button, Stack, Typography } from "@mui/material";
import ConnectIcon from '@mui/icons-material/ConnectedTv';
import { getTestClient } from "../../helpers/viem/client";
import Status from "../Status";
import { AppStateContext } from "../../context/AppStateContext";
import { getOwner } from "../../helpers/viem/BUSD";

export default function () {
  const { appData, setAppData } = useContext(AppStateContext);
  const [connectedToWallet, setIsConnectedToWallet] = useState(false);

  const handleConfigurationChanged = () => {
    toast('Configuration has changed, Auto updating...');
  };

  const handleAccountsChanged = useCallback(async (accounts: string[]) => {
    try {
      const address = accounts[0];
      const owner = (await getOwner()).toString();
      if (connectedToWallet && appData.address && address.toString().toLowerCase() !== appData.address.toString().toLowerCase()) {
        setAppData({
          ...appData,
          address,
          owner
        });
        handleConfigurationChanged()
      }
    } catch (e) {
      console.log(e)
    }
  }, [appData.address]);

  const handleChainChanged = useCallback(async (chainId: string) => {
    try {
      if (chainId.toString().toLowerCase() !== appData.chainId.toString().toLowerCase()) {
        const accounts = await getTestClient().requestAddresses();
        const address = accounts[0];
        const owner = (await getOwner()).toString();
        setAppData({
          ...appData,
          address,
          chainId,
          owner
        })
      } else {
        setAppData({
          ...appData,
          chainId,
        })
        handleConfigurationChanged();
      }
    } catch (e) {
      console.log(e)
    }
  }, [appData.chainId]);

  useEffect(() => {
    window.ethereum!.removeListener('chainChanged', handleChainChanged)
    window.ethereum!.on('chainChanged', handleChainChanged);
  }, [appData.address])

  useEffect(() => {
    window.ethereum!.removeListener('accountsChanged', handleAccountsChanged)
    window.ethereum!.on('accountsChanged', handleAccountsChanged);
  }, [appData.address])


  async function handleClick() {
    try {
      const accounts = await getTestClient().requestAddresses();
      const address = accounts[0];
      setAppData({
        ...appData,
        address
      });
      setIsConnectedToWallet(true);
    } catch (error) {
      alert(`Transaction failed: ${error}`);
    }
  }

  return (
    <div className="flex justify-center">
      <Status />
      {!appData.address && (
        <Button variant="contained" size="large" onClick={handleClick} disabled={null !== appData.address}>
          <Stack direction="row" gap={1}>
            <ConnectIcon />
            <Typography variant="body1">
              Connect To Wallet
            </Typography>
          </Stack>
        </Button>
      )}
    </div>
  );
}



