import { createContext, FC, PropsWithChildren, useState } from 'react'
import { MINT_MODE } from 'types'

interface IContextProps {
  mode: MINT_MODE
  setMode: (mode: MINT_MODE) => void
  clearAllData: () => void
}

export const MintStoreContext = createContext<IContextProps>({
  mode: MINT_MODE.JOIN,
  setMode: () => {},
  clearAllData: () => {}
})

const MintStoreProvider: FC<PropsWithChildren> = ({ children }) => {
  const [mode, setMode] = useState<MINT_MODE>(MINT_MODE.JOIN)

  const clearAllData = () => {
    setMode(MINT_MODE.JOIN)
  }

  return (
    <MintStoreContext.Provider
      value={{
        mode,
        setMode,
        clearAllData
      }}>
      {children}
    </MintStoreContext.Provider>
  )
}

export default MintStoreProvider
