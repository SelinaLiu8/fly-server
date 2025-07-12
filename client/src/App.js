import React from 'react';
import { useSelector } from 'react-redux';

import Header from './components/Header';
import SearchScreen from './components/SearchScreen';
import LoadingScreen from './components/LoadingScreen';
import QuestionPopup from './components/QuestionPopUpScreen';
import PrintPopUpScreen from './components/PrintPopUpScreen';
import Sidebar from './components/SideBar';
import SidebarContents from './components/SidebarContentsView';
import SequenceViewScreen from './components/SequenceViewScreen';
import Footer from './components/Footer';


export default function App() {

  const loading = useSelector((state) => state.appState.loading);
  const loadingMessage = useSelector((state) => state.appState.loadingMessage);
  const screen = useSelector((state) => state.appState.screen);
  const popupVisible = useSelector((state) => state.appState.popup.visible);
  const popupType = useSelector((state) => state.appState.popup.type);
  const gene = useSelector((state) => state.appState.gene);
  const isoform = useSelector((state) => state.appState.isoform);

  return (
    <div className="App">
      <Header/>
      <div className='content-container'>
        <Sidebar/>
        {/* {screen !== 1 && (
          <SidebarContents />
        )} */}
        {screen === 1 ? (
          <>
            <SearchScreen />
            {loading && <LoadingScreen message={loadingMessage} />}
            {popupVisible && popupType === 'question' && <QuestionPopup />}
          </>
        ) : (
          <>
            <SequenceViewScreen />
            {loading && <LoadingScreen message={loadingMessage} />}
            {popupVisible && popupType === 'question' && <QuestionPopup />}
            {popupVisible && popupType === 'print' && <PrintPopUpScreen />}

          </>
        )}
        {/* other screens */}
      </div>
      <Footer/>
    </div>
  );
}
