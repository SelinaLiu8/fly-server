import React, { createContext, useState, useContext, useCallback } from 'react';

// Create the context
const UIContext = createContext();

// Create a provider component
export const UIProvider = ({ children }) => {
  // State for UI
  const [menu, setMenu] = useState(null);
  const [screen, setScreen] = useState(1);
  const [hamburger, setHamburger] = useState(false);
  const [themeColor, setThemeColor] = useState(false);
  const [fontSize, setFontSize] = useState(23);
  const [fontMenu, setFontMenu] = useState(false);
  const [popup, setPopup] = useState({ show: false });

  // UI handlers
  const changeMenus = useCallback((e) => {
    const menuValue = parseInt(e.target.dataset.menu);
    
    if (menuValue === 1) {
      window.location.reload();
      return;
    }
    
    setMenu(prevMenu => menuValue === prevMenu ? null : menuValue);
  }, []);

  const changeScreens = useCallback((e) => {
    const screenValue = e.target.dataset.screen;
    const screenInt = parseInt(screenValue) || screenValue;
    
    let newMenu = null;
    if (screenInt === 1) {
      newMenu = 1;
    }
    
    setScreen(screenInt);
    setHamburger(false);
    setMenu(newMenu);
    
    if (screenInt === 3) {
      // This will need to be moved to the appropriate context
      // setMutatePam(false);
    }
  }, []);

  const toggleHamburgerMenu = useCallback(() => {
    setHamburger(prev => !prev);
  }, []);

  const toggleThemeColor = useCallback(() => {
    setThemeColor(prev => !prev);
  }, []);

  const toggleFontMenu = useCallback(() => {
    setFontMenu(prev => !prev);
  }, []);

  const changeFontSize = useCallback((e) => {
    setFontSize(parseInt(e.target.value));
  }, []);

  const closePopup = useCallback(() => {
    setPopup({ show: false });
  }, []);

  const showPopup = useCallback((popupConfig) => {
    setPopup({ show: true, ...popupConfig });
  }, []);

  return (
    <UIContext.Provider
      value={{
        menu,
        setMenu,
        screen,
        setScreen,
        hamburger,
        setHamburger,
        themeColor,
        setThemeColor,
        fontSize,
        setFontSize,
        fontMenu,
        setFontMenu,
        popup,
        setPopup,
        changeMenus,
        changeScreens,
        toggleHamburgerMenu,
        toggleThemeColor,
        toggleFontMenu,
        changeFontSize,
        closePopup,
        showPopup
      }}
    >
      {children}
    </UIContext.Provider>
  );
};

// Create a custom hook to use the context
export const useUI = () => {
  const context = useContext(UIContext);
  if (context === undefined) {
    throw new Error('useUI must be used within a UIProvider');
  }
  return context;
};
