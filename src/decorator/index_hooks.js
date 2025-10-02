import React, { useEffect, useMemo, useRef, useCallback } from 'react';
import { useSelector, useDispatch, shallowEqual } from 'react-redux';
import difference from 'lodash/difference';
import forEach from 'lodash/forEach';
import get from 'lodash/get';
import map from 'lodash/map';
import set from 'lodash/set';

import { getUrl } from '../utilities/get-url';
import nionActions from '../actions';
import { makeRef } from '../transforms';
import ApiManager from '../api';
import Lifecycle from '../lifecycle';
import ExtensionManager from '../extensions';
import { INITIALIZE_DATAKEY, UPDATE_REF } from '../actions/types';
import { selectResourcesForKeys } from '../selectors';

const getDefaultDeclarationOptions = () => ({
  fetchOnInit: false,
  fetchOnce: true,
  initialRef: null,
  extensions: {},
  apiType: ApiManager.getDefaultApi(),
  requestParams: {},
});

const processDefaultOptions = (declarations) => {
  forEach(declarations, (declaration) => {
    forEach(getDefaultDeclarationOptions(), (defaultState, defaultKey) => {
      const option = get(declaration, defaultKey, defaultState);
      declaration[defaultKey] = option;
    });
  });
};

// Hook that encapsulates all the nion logic
function useNionDecorator(inputDeclarations, ownProps) {
  const dispatch = useDispatch();
  
  // Track fetch promises to avoid duplicates
  const fetchesByDataKeyRef = useRef({});
  
  // Process declarations with memoization
  const { declarations, dataKeys, keysByDataKey } = useMemo(() => {
    let decls;
    
    // Process input declarations
    if (typeof inputDeclarations === 'string') {
      decls = { [inputDeclarations]: {} };
    } else if (inputDeclarations instanceof Function) {
      decls = inputDeclarations(ownProps);
    } else {
      // Clone to prevent reference bugs
      decls = JSON.parse(JSON.stringify(inputDeclarations));
    }
    
    // Apply default options
    processDefaultOptions(decls);
    
    // Build dataKey mappings
    const keysByDK = {};
    const dKeys = map(decls, (declaration, key) => {
      const dataKey = declaration.dataKey || key;
      
      if (keysByDK[dataKey]) {
        throw new Error('Duplicate dataKeys detected in this nion decorator');
      }
      
      keysByDK[dataKey] = key;
      declaration.dataKey = dataKey;
      
      return dataKey;
    });
    
    Lifecycle.onDeclare({ declarations: decls, ownProps });
    
    return { 
      declarations: decls, 
      dataKeys: dKeys, 
      keysByDataKey: keysByDK 
    };
  }, [inputDeclarations, ownProps]);
  
  // Select resources from Redux store
  const selectedResources = useSelector(
    useCallback(
      (state) => selectResourcesForKeys(dataKeys)(state),
      [dataKeys]
    ),
    shallowEqual
  );
  
  // Build action creators (need to be stable across renders)
  const actions = useMemo(() => {
    const actionMap = {};
    
    forEach(declarations, (declaration, key) => {
      const dataKey = declaration.dataKey;
      
      actionMap[key] = {
        get: (params, actionOptions = {}) => {
          const endpoint = getUrl(declaration, params);
          return nionActions.get(dataKey, {
            declaration,
            endpoint,
            meta: {
              append: actionOptions.append,
              appendKey: actionOptions.appendKey,
            },
          })(dispatch);
        },
        
        post: (body = {}, params, actionOptions = {}) => {
          const endpoint = getUrl(declaration, params);
          return nionActions.post(dataKey, {
            endpoint,
            declaration,
            body,
            meta: {
              append: actionOptions.append,
              appendKey: actionOptions.appendKey,
            },
          })(dispatch);
        },
        
        patch: (body = {}, params) => {
          const endpoint = getUrl(declaration, params);
          return nionActions.patch(dataKey, {
            endpoint,
            declaration,
            body,
          })(dispatch);
        },
        
        put: (body = {}, params, actionOptions = {}) => {
          const endpoint = getUrl(declaration, params);
          return nionActions.put(dataKey, {
            declaration,
            endpoint,
            body,
            meta: {
              append: actionOptions.append,
              appendKey: actionOptions.appendKey,
            },
          })(dispatch);
        },
        
        delete: (params, options = {}) => {
          const data = selectedResources[dataKey]?.obj;
          const ref = data ? { id: data.id, type: data.type } : null;
          const refToDelete = options.refToDelete || ref;
          const endpoint = getUrl(declaration, params);
          
          return nionActions.delete(dataKey, {
            ...options,
            declaration,
            endpoint,
            refToDelete,
          })(dispatch);
        },
        
        updateRef: (value) => {
          dispatch({
            type: UPDATE_REF,
            payload: { ref: makeRef(value) },
            meta: { dataKey },
          });
        },
      };
    });
    
    return actionMap;
  }, [declarations, dispatch, selectedResources]);
  
  // Build the final nion prop
  const nion = useMemo(() => {
    const nionProp = {};
    
    forEach(selectedResources, (selected, selectedDataKey) => {
      const key = keysByDataKey[selectedDataKey];
      const declaration = declarations[key];
      const data = selected.obj;
      
      nionProp[key] = {
        data: data === undefined || data === null ? null : data,
        request: selected.request,
        extra: selected.extra,
        actions: actions[key],
        extensions: {},
      };
      
      // Process extensions
      forEach(declaration.extensions, (options, extension) => {
        const resource = nionProp[key];
        
        forEach(ExtensionManager.composeActionsForExtension(extension, options, resource), 
          (action, actionKey) => {
            set(nionProp, [key, 'extensions', extension, actionKey], action);
          }
        );
        
        forEach(ExtensionManager.composeMetaForExtension(extension, options, resource), 
          (metaValue, metaKey) => {
            set(nionProp, [key, 'extensions', extension, 'meta', metaKey], metaValue);
          }
        );
      });
    });
    
    // Add global actions
    nionProp.updateEntity = ({ type, id }, attributes) => {
      dispatch(nionActions.updateEntity({ type, id }, attributes));
    };
    
    nionProp.getDeclarations = () => declarations;
    
    return nionProp;
  }, [selectedResources, keysByDataKey, declarations, actions, dispatch]);
  
  // Handle initialization of dataKeys with initialRef
  useEffect(() => {
    forEach(declarations, (declaration) => {
      if (declaration.initialRef) {
        const resource = nion[keysByDataKey[declaration.dataKey]];
        
        // Skip if data already exists
        if (resource?.data !== null) {
          return;
        }
        
        dispatch({
          type: INITIALIZE_DATAKEY,
          payload: { ref: declaration.initialRef },
          meta: { dataKey: declaration.dataKey },
        });
      }
    });
  }, [declarations, dispatch, nion, keysByDataKey]);
  
  // Track which dataKeys have been fetched for fetchOnce
  const fetchedOnceRef = useRef({});
  
  // Handle fetchOnInit 
  useEffect(() => {
    forEach(declarations, (declaration, key) => {
      if (!declaration.fetchOnInit) {
        return;
      }
      
      const resource = nion[key];
      const status = resource.request.status;
      const dataKey = declaration.dataKey;
      const fetchesByDataKey = fetchesByDataKeyRef.current;
      
      // Check if fetch is already pending
      const isFetchPending = !!fetchesByDataKey[dataKey];
      
      if (declaration.fetchOnce) {
        // Only fetch once per dataKey ever
        if (!fetchedOnceRef.current[dataKey] && status === 'not called' && !isFetchPending) {
          fetchedOnceRef.current[dataKey] = true;
          fetchesByDataKey[dataKey] = resource.actions.get().then(() => {
            delete fetchesByDataKey[dataKey];
          });
        }
      } else {
        // Fetch if not currently loading
        if (status !== 'pending' && !isFetchPending) {
          fetchesByDataKey[dataKey] = resource.actions.get().then(() => {
            delete fetchesByDataKey[dataKey];
          });
        }
      }
    });
  }); // Run on every render to check status changes
  
  return nion;
}

// The decorator using hooks internally
const nion = (declarations = {}, ...rest) => (WrappedComponent) => {
  // Process rest args into declarations if needed
  if (typeof declarations === 'string' && rest.length > 0) {
    const allDeclarations = {};
    [declarations, ...rest].forEach(key => {
      allDeclarations[key] = {};
    });
    declarations = allDeclarations;
  }
  
  // Create the wrapper component using hooks
  function WithNion(props) {
    const injectedNion = useNionDecorator(declarations, props);
    return <WrappedComponent {...props} nion={injectedNion} />;
  }
  
  // Copy static properties from WrappedComponent
  difference(Object.keys(WrappedComponent), Object.keys(WithNion)).forEach((key) => {
    WithNion[key] = WrappedComponent[key];
  });
  
  return WithNion;
};

export function exists(input = {}) {
  if (input === null || typeof input === 'undefined') {
    return false;
  }
  if (typeof input.data !== 'undefined' && input.data === null) {
    return false;
  }
  return true;
}

export { nion as noin };
