import React from 'react';
import { useSelector } from 'react-redux';

import Header from './components/Header';
import SearchScreen from './components/SearchScreen';
import LoadingScreen from './components/LoadingScreen';
import QuestionPopup from './components/QuestionPopUpScreen';
import Sidebar from './components/SideBar';
import Footer from './components/Footer';


export default function App() {

  const loading = useSelector((state) => state.appState.loading);
  const loadingMessage = useSelector((state) => state.appState.loadingMessage);
  const screen = useSelector((state) => state.appState.screen);
  const popupVisible = useSelector((state) => state.appState.popup.visible);
  const gene = useSelector((state) => state.appState.gene);
  const isoform = useSelector((state) => state.appState.isoform);

  return (
    <div className="App">
      <Header/>
      <div className='content-container'>
        <Sidebar/>
        {screen === 1 && (
          <>
            <SearchScreen />
            {loading && <LoadingScreen message={loadingMessage} />}
            {popupVisible && <QuestionPopup />}
          </>
        )}
        {/* other screens */}
      </div>
      <Footer/>
    </div>
  );
}
