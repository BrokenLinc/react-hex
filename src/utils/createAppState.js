import React, {createContext, useContext, useReducer} from 'react';
import produce from 'immer';
import {mapValues} from 'lodash';

const createAppState = (initialState = {}, mutators = {}) => {
  const Context = createContext({});

  // create provider
  // sets initial state and uses Immer *as* the reducer
  const AppStateProvider = ({children}) => (
    <Context.Provider value={useReducer(produce, initialState)}>
      {children}
    </Context.Provider>
  );

  // create hook
  // wraps each function with dispatch and injects state so that Immer can receive it
  const useAppState = () => {
    const [state, dispatch] = useContext(Context);
    const mutatorsWithDispatch = mapValues(mutators, (mutator) => (...args) => {
      return dispatch((state) => mutator(state, ...args));
    });
    return [state, mutatorsWithDispatch];
  };

  return [AppStateProvider, useAppState];
};

export default createAppState;
