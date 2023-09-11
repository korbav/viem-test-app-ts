import  { PropsWithChildren, createContext, useState } from "react";

export type AppState = {
  address: string|null,
  chainId: string,
  owner: string,
}
export type AppStateContextType = {
  appData: AppState,
  setAppData: React.Dispatch<React.SetStateAction<AppState>>
}

const intialState: AppState = {
  address: null,
  chainId: "",
  owner: ""
};

export const AppStateContext = createContext<AppStateContextType>({
  appData: intialState,
  setAppData: () => null
});

export function AppStateProvider({ children }: PropsWithChildren ) {
  const [appData, setAppData] = useState<AppState>({
    address: null,
    chainId: window.ethereum ? ((window.ethereum as any).chainId || "")  : "",
    owner: ""
  });

  return (
    <AppStateContext.Provider value={{ appData, setAppData }}>
      {children}
    </AppStateContext.Provider>
  );
}