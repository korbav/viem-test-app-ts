import { createRef, useCallback } from 'react'
import { ToastContainer } from 'react-toastify';
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

type RefreshableComponent = {
  refresh: () => Promise<void>
}

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

  return (
    <div className='mb-16 pt-16'>
      <AppStateProvider>
        <RestrictedNetwork>
          <HeaderBar refresh={refresh} />
          <ConnectToWallet />
          <div className="flex flex-row gap-2">
            <div className='w-1/2'>
              <BUSDManager ref={BUSDRef} />
            </div>
            <div className='w-1/2'>
              <MATICManager ref={MATICRef} />
            </div>
          </div>
          <ToastContainer pauseOnFocusLoss={false} />
        </RestrictedNetwork>
      </AppStateProvider>
    </div>
  )
}

export default App
