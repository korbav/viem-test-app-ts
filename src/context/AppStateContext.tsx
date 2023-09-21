import  { PropsWithChildren, createContext, useState } from "react";

export type AppState = {
  address: string|null,
  chainId: string,
  owner: string,
}
export type AppStateContextType = {
  appData: AppState,
  setAppData: React.Dispatch<React.SetStateAction<AppState>>,
  waitingForTransaction: boolean,
  setWaitingForTransaction: React.Dispatch<React.SetStateAction<boolean>>,
}

const intialState: AppState = {
  address: null,
  chainId: "",
  owner: ""
};

export const AppStateContext = createContext<AppStateContextType>({
  appData: intialState,
  setAppData: () => null,
  waitingForTransaction: false,
  setWaitingForTransaction: () => null
});

export function AppStateProvider({ children }: PropsWithChildren ) {
  const [appData, setAppData] = useState<AppState>({
    address: null,
    chainId: window.ethereum ? ((window.ethereum as any).chainId || "")  : "",
    owner: ""
  });

  const [waitingForTransaction, setWaitingForTransaction] = useState<boolean>(false);

  return (
    <AppStateContext.Provider value={{ appData, setAppData, waitingForTransaction, setWaitingForTransaction }}>
      {children}
    </AppStateContext.Provider>
  );
}