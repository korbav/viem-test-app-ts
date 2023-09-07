import { createRef, useCallback } from 'react'
import ConnectToWallet from "./components/ConnectToWallet";
import BUSDManager from "./components/BUSDManager";
import MATICManager from "./components/MATICManager";
import { AppStateProvider } from './context/AppStateContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';

import './App.css'
import HeaderBar from './components/HeaderBar';

type RefreshableComponent = {
  refresh: () => void
}

function App() {
  const BUSDRef =  createRef<RefreshableComponent>();
  const MATICRef = createRef<RefreshableComponent>();

  const refresh = useCallback(() => {
    BUSDRef.current && BUSDRef.current.refresh();
    MATICRef.current && MATICRef.current.refresh();
  }, []);

  return (
    <div className='mb-16 pt-16'>
      <AppStateProvider>
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
        <ToastContainer />
      </AppStateProvider>
    </div>
  )
}

export default App
