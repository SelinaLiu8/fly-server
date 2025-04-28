import { createSlice } from '@reduxjs/toolkit';
import { searchForGeneAsync } from './appStateThunks';
import { act } from 'react';

const initialState = {
    //UI
    screen: 1,
    hamburger: false,
    themeColor: false,
    fontSize: 23,
    menu: null,
    highlights: [],
    currentHighlight: null,
    popup: {
        visible: false,    // Is a popup currently open?
        type: null,        // Optional - What kind of popup? ('question', 'error', etc.)
        question: null,    // The main question/message to show
        choices: [],       // An array of { label, value } options for buttons
        onSelect: null,    // A function to call when user selects a choice
        stayOpen: false,   // Optional: Should popup auto-close after choice?
    },
    //Gene
    gene: null,
    sequence: null,
    operation: null,
    isoform: null,
    //Target
    //Primer
    //File
    //Async State
    loading: false,
    loadingMessage: null,
    error: null,
};

export const appStateSlice = createSlice({
    name: 'appState',
    initialState,
    reducers: {
        //UI
        setScreen: (state, action) => {
            state.screen = action.payload;
        },
        toggleHamburger: (state) => {
            state.hamburger = !state.hamburger;
        },
        toggleThemeColor: (state) => {
            state.themeColor = !state.themeColor;
        },
        setFontSize: (state, action) => {
            state.fontSize = action.payload;
        },
        setMenu: (state, action) => {
            state.menu = action.payload;
        },
        setHighlights: (state, action) => {
            state.highlights = action.payload;
        },
        setCurrentHighlights: (state, action) => {
            state.currentHighlight = action.payload;
        },
        setPopup: (state, action) => {
            const { type, question, choices, onSelect, stayOpen, image } = action.payload;
            state.popup.visible = true;
            state.popup.type = type || 'question';
            state.popup.question = question || 'Please select:';
            state.popup.choices = choices || [];
            state.popup.onSelect = onSelect || null;
            state.popup.stayOpen = stayOpen || false;
          },
        clearPopup: (state) => {
            state.popup.visible = false;
            state.popup.type = null;
            state.popup.question = null;
            state.popup.choices = [];
            state.popup.onSelect = null;
            state.popup.stayOpen = false;
        },
        //Gene
        setGene: (state, action) => {
            state.gene = action.payload;
        },
        setSequnce: (state, action) => {
            state.sequence = action.payload;
        },
        setOperation: (state, action) => {
            state.operation = action.payload;
        },
        setIsoform: (state, action) => {
            state.isoform = action.payload;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(searchForGeneAsync.pending, (state) => {
                state.loading = true;
                state.loadingMessage = "Searching for your gene...";
                state.error = null;
            })
            .addCase(searchForGeneAsync.fulfilled, (state, action) => {
                state.loading = false;
                state.gene = action.payload;
            })
            .addCase(searchForGeneAsync.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message;
            });
    },
});

export const {
    setScreen,
    toggleHamburger,
    toggleThemeColor,
    setFontSize,
    setMenu,
    setHighlights,
    setCurrentHighlights,
    setGene,
    setSequnce,
    setOperation,
    setIsoform,
    setPopup,
    clearPopup,
} = appStateSlice.actions;

export default appStateSlice.reducer;
