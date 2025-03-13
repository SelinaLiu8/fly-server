import React from 'react';
import { UIProvider } from './UIContext';
import { GeneProvider } from './GeneContext';
import { TargetProvider } from './TargetContext';
import { PrimerProvider } from './PrimerContext';
import { FileProvider } from './FileContext';

// This component wraps all context providers together
const AppContextProvider = ({ children }) => {
  return (
    <UIProvider>
      <GeneProvider>
        <TargetProvider>
          <PrimerProvider>
            <FileProvider>
              {children}
            </FileProvider>
          </PrimerProvider>
        </TargetProvider>
      </GeneProvider>
    </UIProvider>
  );
};

export default AppContextProvider;
