import { useCallback, useEffect, useRef, useState, useContext, PropsWithChildren  } from 'react'
import { ToastContainer, toast } from 'react-toastify';
import { QueryClient, QueryClientProvider } from 'react-query'
import ConnectToWallet from "./components/ConnectToWallet";
import BUSDManager from "./components/BUSDManager";
import MATICManager from "./components/MATICManager";
import { AppStateContext, AppStateProvider } from './context/AppStateContext';
import HeaderBar from './components/HeaderBar';
import RestrictedNetwork from './components/RestrictedNetwork';
import TransactionsProgress from './components/TransactionsProgress';
import config from "./assets/config.json";
import 'react-toastify/dist/ReactToastify.css';
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';

import './App.css';
import HistoricalDataPanels from './components/HistoricalDataPanels';
import { Box, Stack, Tab, Tabs, Typography } from '@mui/material';
import useWebSocket from 'react-use-websocket';

type RefreshableComponent = {
  refresh: () => Promise<void>
  handleNewAction: (action: any) => void
}

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
})

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function CustomTabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && children}
    </div>
  );
}

function TabsWrapper({ children }: PropsWithChildren) {
  const { appData } = useContext(AppStateContext);

  return appData.address ? children : null;
}

function App() {
  const BUSDRef =  useRef<RefreshableComponent>();
  const MATICRef = useRef<RefreshableComponent>();
  const HistoricalDataPanelsRef = useRef<RefreshableComponent>();
  const transactionsProgressRef = useRef<any>();
  const [value, setValue] = useState(0);

  const refresh = useCallback(async () => {
    try {
      await BUSDRef.current?.refresh();
    } catch(_) {}
    try {
      await MATICRef.current?.refresh();
    } catch(_) {}
    try {
      await HistoricalDataPanelsRef.current?.refresh();
    } catch(_) {}
  }, []);


  useWebSocket(config.WebSocketServerURL, {
      onMessage: async (message) => {
        const parsedMessage = JSON.parse(message.data);
        if(parsedMessage.type === "database_refreshed") {
          transactionsProgressRef.current?.notify(parsedMessage.action.transactionHash);
          HistoricalDataPanelsRef.current?.handleNewAction(parsedMessage.action);
          BUSDRef.current?.handleNewAction(parsedMessage.action);
          MATICRef.current?.handleNewAction(parsedMessage.action);
        }
      },
      onError: (error) => {
        console.log(error);
      },
      retryOnError: true,
  });

  useEffect(() => {
    return toast.onChange(({ status, id }) => {
      if ([undefined, "added", "updated"].includes(status) && (!document.hasFocus() || document.visibilityState !== 'visible')) {
        toast.dismiss(id);
      }
    });
  }, []);

  const handleChange = (_: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  return (
    <div className='w-full flex justify-center'>
    <div className='pb-24 py-16 w-4/5'>
        <AppStateProvider>
          <QueryClientProvider client={queryClient}>
            <RestrictedNetwork>
              <HeaderBar refresh={refresh} />
              <ConnectToWallet />
              <TabsWrapper>
                 <>
                 <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                      <Tabs value={value} onChange={handleChange} aria-label="basic tabs example">
                        <Tab label="v5"  />
                        <Tab label="v4" />
                      </Tabs>
                    </Box>
                    <CustomTabPanel value={value} index={0}>
                      V5 comes here
                    </CustomTabPanel>
                    <CustomTabPanel value={value} index={1}>
                      <TransactionsProgress ref={transactionsProgressRef} />
                      <Stack direction={"column"} gap={2} className='w-full'>
                        <HistoricalDataPanels ref={HistoricalDataPanelsRef} />
                        <div className="flex flex-row gap-2 box-border">
                          <div className='w-1/2 overflow-hidden box-border'>
                            <BUSDManager ref={BUSDRef} waitForTransactionFn={transactionsProgressRef.current?.waitForTransactionHash} />
                          </div>
                          <div className='w-1/2 overflow-hidden box-border'>
                            <MATICManager ref={MATICRef} />
                          </div>
                        </div>
                      </Stack>
                    </CustomTabPanel>
                  </>   
              </TabsWrapper>
              <ToastContainer />
            </RestrictedNetwork>
          </QueryClientProvider>
        </AppStateProvider>
    </div>
    </div>
  )
}

export default App
