import React from 'react';
import { useSelector } from 'react-redux';

import Header from './components/Header';
import SearchScreen from './components/SearchScreen';
import LoadingScreen from './components/LoadingScreen';
import Footer from './components/Footer';


export default function App() {

  const loading = useSelector((state) => state.appState.loading);
  const loadingMessage = useSelector((state) => state.appState.loadingMessage);
  const screen = useSelector((state) => state.appState.screen);
  const gene = useSelector((state) => state.appState.gene);
  const isoform = useSelector((state) => state.appState.isoform);

  return (
    <div className="App">
      <Header/>
      {screen === 1 && (
        <>
          <SearchScreen />
          {loading && <LoadingScreen message={loadingMessage} />}
        </>
      )}
      {/* other screens */}
      <Footer/>
    </div>
  );
}
