import { createSlice } from '@reduxjs/toolkit';
import { searchForGeneAsync, fetchSequenceAsync, searchForTargetsAsync, getTargetEfficiencyAsync, searchForHomologyArms, retrieveOligoInfo } from './appStateThunks';
import { act } from 'react';

const initialState = {
    //UI
    screen: 1,
    hamburger: false,
    themeColor: false,
    fontSize: 23,
    menu: null,
    highlights: {},
    currentHighlight: {},
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
    sequenceData: null,
    operation: null,
    isoform: null,
    terminal: null,
    //Target
    targetList: { n: [], c: [] },
    selectedTargets: {},
    targetsReady: false,
    //Primer
    primerList: {},
    selectedPrimers: {},
    oligos: {},
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
            state.highlights = {
                ...state.highlights,
                ...action.payload,
            };
            console.log("Highlights:", state.highlights);
        },
        setCurrentHighlights: (state, action) => {
            state.currentHighlight = action.payload;
        },
        clearCurrentHighlights: (state) => {
            state.currentHighlight = null;
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
            console.log("everytime setGene is called", state.gene);
        },
        setSequenceData: (state, action) => {
            state.sequence = action.payload;
        },
        setOperation: (state, action) => {
            state.operation = action.payload;
        },
        setIsoform: (state, action) => {
            state.isoform = action.payload;
        },
        setTerminal: (state, action) => {
            state.terminal = action.payload;
        },
        //Target
        setTargetList: (state, action) => {
            state.targetList = action.payload;
        },
        setSelectedTargets: (state, action) => {
            state.selectedTargets = {
                ...state.selectedTargets,
                ...action.payload,
            };
        },
        setTargetsReady: (state, action) => {
            state.targetsReady = action.payload;
        },
        //Primers
        setPrimerList: (state, action) => {
            state.targetList = action.payload;
        },
        setSelectedPrimers: (state, action) => {
            for (const terminal of Object.keys(action.payload)) {
                state.selectedPrimers[terminal] = {
                  ...state.selectedPrimers[terminal],
                  ...action.payload[terminal]
                };
            }
        },
        setOligos: (state, action) => {
            state.oligos = action.payload
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
            })
            .addCase(fetchSequenceAsync.pending, (state) => {
                state.loading = true;
                state.loadingMessage = "Loading Sequence";
                state.error = null;
            })
            .addCase(fetchSequenceAsync.fulfilled, (state, action) => {
                state.loading = false;
                state.sequenceData = action.payload;
            })
            .addCase(fetchSequenceAsync.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message;
            })
            .addCase(searchForTargetsAsync.pending, (state) => {
                state.loading = true;
                state.loadingMessage = "Searching for targets. This might take awhile.";
                state.error = null;
            })
            .addCase(searchForTargetsAsync.fulfilled, (state, action) => {
                state.loading = false;
                state.targetList = action.payload;
                state.targetsReady = true;
            })
            .addCase(searchForTargetsAsync.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message;
            })
            .addCase(getTargetEfficiencyAsync.pending, (state) => {
                state.loading = true;
                state.loadingMessage = "Getting efficiency scores.";
                state.error = null;
            })
            .addCase(getTargetEfficiencyAsync.fulfilled, (state, action) => {
                state.loading = false;
                state.gene = action.payload;
            })
            .addCase(getTargetEfficiencyAsync.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message;
            })
            .addCase(searchForHomologyArms.pending, (state) => {
                state.loading = true;
                state.loadingMessage = "Getting homology arms.";
                state.error = null;
            })
            .addCase(searchForHomologyArms.fulfilled, (state, action) => {
                state.loading = false;
                state.primerList = action.payload;
            })
            .addCase(searchForHomologyArms.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message;
            })
            .addCase(retrieveOligoInfo.pending, (state) => {
                state.loading = true;
                state.loadingMessage = "Retrieving oligo information";
                state.error = null;
            })
            .addCase(retrieveOligoInfo.fulfilled, (state, action) => {
                state.loading = false;
                state.oligos = action.payload;
            })
            .addCase(retrieveOligoInfo.rejected, (state, action) => {
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
    clearCurrentHighlights,
    setGene,
    setSequenceData,
    setOperation,
    setIsoform,
    setPopup,
    clearPopup,
    setTerminal,
    setTargetList,
    setSelectedTargets,
    setTargetsReady,
    setPrimerList,
    setSelectedPrimers,
    setOligos
} = appStateSlice.actions;

export default appStateSlice.reducer;
