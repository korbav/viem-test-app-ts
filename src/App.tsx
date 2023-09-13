import { createRef, useCallback, useEffect } from 'react'
import { ToastContainer, toast } from 'react-toastify';
import { QueryClient, QueryClientProvider } from 'react-query'
import ConnectToWallet from "./components/ConnectToWallet";
import BUSDManager from "./components/BUSDManager";
import MATICManager from "./components/MATICManager";
import { AppStateProvider } from './context/AppStateContext';
import HeaderBar from './components/HeaderBar';
import RestrictedNetwork from './components/RestrictedNetwork';
import 'react-toastify/dist/ReactToastify.css';
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';

import './App.css';
import HistoricalDataPanels from './components/HistoricalDataPanels';
import { Stack } from '@mui/material';

type RefreshableComponent = {
  refresh: () => Promise<void>
}

const queryClient = new QueryClient()

function App() {
  const BUSDRef =  createRef<RefreshableComponent>();
  const MATICRef = createRef<RefreshableComponent>();

  const refresh = useCallback(async () => {
    try {
      BUSDRef.current  && await BUSDRef.current.refresh();
    } catch(_) {}
    try {
      MATICRef.current && await MATICRef.current.refresh();
    } catch(_) {}
  }, []);


  useEffect(() => {
    return toast.onChange(({ status, id }) => {
      if ([undefined, "added", "updated"].includes(status) && (!document.hasFocus() || document.visibilityState !== 'visible')) {
        toast.dismiss(id);
      }
    });
  }, []);

  return (
    <div className='w-full flex justify-center'>
    <div className='pb-24 py-16 w-4/5'>
        <AppStateProvider>
          <QueryClientProvider client={queryClient}>
            <RestrictedNetwork>
              <HeaderBar refresh={refresh} />
              <ConnectToWallet />
              <Stack direction={"column"} gap={2} className='w-full'>
                <HistoricalDataPanels />
                <div className="flex flex-row gap-2 box-border">
                  <div className='w-1/2 overflow-hidden box-border'>
                    <BUSDManager ref={BUSDRef} />
                  </div>
                  <div className='w-1/2 overflow-hidden box-border'>
                    <MATICManager ref={MATICRef} />
                  </div>
                </div>
              </Stack>
              <ToastContainer />
            </RestrictedNetwork>
          </QueryClientProvider>
        </AppStateProvider>
    </div>
    </div>
  )
}

export default App
