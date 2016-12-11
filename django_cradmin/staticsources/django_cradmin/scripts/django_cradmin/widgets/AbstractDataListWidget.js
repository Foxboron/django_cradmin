import AbstractWidget from "ievv_jsbase/widget/AbstractWidget";
import makeCustomError from "ievv_jsbase/makeCustomError";


let CancelledDataRequest = makeCustomError('CancelledDataRequest');


export default class AbstractDataListWidget extends AbstractWidget {

  getDefaultConfig() {
    return {
      signalNameSpace: null,
      keyAttribute: 'id',
      multiselect: false,
      selectedKeys: [],
      minimumSearchStringLength: 0,
      initialSearchString: ''
    };
  }

  constructor(element, widgetInstanceId) {
    super(element, widgetInstanceId);
    this._name = `${this.classPath}.${widgetInstanceId}`;
    this.logger = new window.ievv_jsbase_core.LoggerSingleton().getLogger(
      this._name);
    this._onSearchValueChangeSignal = this._onSearchValueChangeSignal.bind(this);
    this._onSelectItemSignal = this._onSelectItemSignal.bind(this);
    this._onDeSelectItemSignal = this._onDeSelectItemSignal.bind(this);
    this._onFocusSignal = this._onFocusSignal.bind(this);
    this._onBlurSignal = this._onBlurSignal.bind(this);
    this._onLoadMoreSignal = this._onLoadMoreSignal.bind(this);
    this._onLoadNextPageSignal = this._onLoadNextPageSignal.bind(this);
    this._onLoadPreviousPageSignal = this._onLoadPreviousPageSignal.bind(this);
    this._dataRequestId = 0;
    this._isLoadingDataList = false;
    if(this.config.signalNameSpace == null) {
      throw new Error('The signalNameSpace config is required.');
    }
    this.state = null;
    this.signalHandlersInitialized = false;
  }

  _initialize(state) {
    this._initializeSignalHandlers();
    this.signalHandlersInitialized = true;
    this.state = {
      data: {
        count: 0,
        next: null,
        previous: null,
        results: []
      },
      selectedItemsMap: new Map(),
      searchString: '',
      focus: false,
      loading: false
    };
    this._sendDataListInitializedSignal();
    this.setState(state, true);
  }

  _makeItemMapFromArray(itemDataArray) {
    const itemMap = new Map();
    for(let itemData of itemDataArray) {
      itemMap.set(this._getKeyFromItemData(itemData), itemData);
    }
    return itemMap;
  }

  _requestItemDataForKeys(keys) {
    const promises = [];
    for(let key of keys) {
      promises.push(this.requestItemData(key));
    }
    return Promise.all(promises);
  }

  _loadInitialState() {
    const state = {
      searchString: this.config.initialSearchString
    };
    this._requestItemDataForKeys(this.config.selectedKeys)
      .then((selectedItemsArray) => {
        state.setSelectedItems = selectedItemsArray;
        this._initialize(state);
      })
      .catch((error) => {
        this.logger.error('Failed to load config.selectedKeys:', this.config.selectedKeys, '. Error:', error.toString());
        this._initialize(state);
      });
  }

  useAfterInitializeAllWidgets() {
    return true;
  }

  afterInitializeAllWidgets() {
    this._loadInitialState();
  }

  _initializeSignalHandlers() {
    new window.ievv_jsbase_core.SignalHandlerSingleton().addReceiver(
      `${this.config.signalNameSpace}.SearchValueChange`,
      this._name,
      this._onSearchValueChangeSignal
    );
    new window.ievv_jsbase_core.SignalHandlerSingleton().addReceiver(
      `${this.config.signalNameSpace}.SelectItem`,
      this._name,
      this._onSelectItemSignal
    );
    new window.ievv_jsbase_core.SignalHandlerSingleton().addReceiver(
      `${this.config.signalNameSpace}.DeSelectItem`,
      this._name,
      this._onDeSelectItemSignal
    );
    new window.ievv_jsbase_core.SignalHandlerSingleton().addReceiver(
      `${this.config.signalNameSpace}.Focus`,
      this._name,
      this._onFocusSignal
    );
    new window.ievv_jsbase_core.SignalHandlerSingleton().addReceiver(
      `${this.config.signalNameSpace}.Blur`,
      this._name,
      this._onBlurSignal
    );
    new window.ievv_jsbase_core.SignalHandlerSingleton().addReceiver(
      `${this.config.signalNameSpace}.LoadMore`,
      this._name,
      this._onLoadMoreSignal
    );
    new window.ievv_jsbase_core.SignalHandlerSingleton().addReceiver(
      `${this.config.signalNameSpace}.LoadNextPage`,
      this._name,
      this._onLoadNextPageSignal
    );
    new window.ievv_jsbase_core.SignalHandlerSingleton().addReceiver(
      `${this.config.signalNameSpace}.LoadPreviousPage`,
      this._name,
      this._onLoadPreviousPageSignal
    );
  }

  destroy() {
    if(this.signalHandlersInitialized) {
      new window.ievv_jsbase_core.SignalHandlerSingleton()
        .removeAllSignalsFromReceiver(this._name);
    }
  }

  _updateSearchStringStateChange(stateChange, stateChangesSet) {
    if(stateChange.searchString != undefined) {
      this.state.searchString = stateChange.searchString;
      if(stateChange.searchString.length >= this.config.minimumSearchStringLength) {
        stateChangesSet.add('searchString');
      } else {
        stateChange.data = {
          count: 0,
          next: null,
          previous: null,
          results: []
        }
      }
    }
  }

  _updateDataStateChange(stateChange, stateChangesSet) {
    if(stateChange.data != undefined) {
      this.state.data = stateChange.data;
      stateChangesSet.add('data');
    } else if(stateChange.appendData != undefined) {
      for(let itemData of stateChange.appendData.results) {
        this.state.data.results.push(itemData);
      }
      this.state.data.count = stateChange.appendData.count;
      this.state.data.next = stateChange.appendData.next;
      this.state.data.previous = stateChange.appendData.previous;
      stateChangesSet.add('data');
    }
  }

  _updateSelectionStateChange(stateChange, stateChangesSet) {
    if(stateChange.addSelectedItem != undefined) {
      if(!this.config.multiselect) {
        this.state.selectedItemsMap.clear();
      }
      this.state.selectedItemsMap.set(
        this._getKeyFromItemData(stateChange.addSelectedItem), stateChange.addSelectedItem);
      stateChangesSet.add('selection');
    }
    if(stateChange.removeSelectedItem != undefined) {
      if(this.config.multiselect) {
        this.state.selectedItemsMap.delete(
          this._getKeyFromItemData(stateChange.removeSelectedItem));
      } else {
        this.state.selectedItemsMap.clear();
      }
      stateChangesSet.add('selection');
    }
    if(stateChange.clearSelectedKeys != undefined) {
      this.state.selectedItemsMap.clear();
      stateChangesSet.add('selection');
    }
    if(stateChange.setSelectedItems != undefined) {
      this.state.selectedItemsMap = this._makeItemMapFromArray(stateChange.setSelectedItems);
      stateChangesSet.add('selection');
    }
  }

  _updateFocusStateChange(stateChange, stateChangesSet) {
    if(stateChange.focus != undefined && this.state.focus != stateChange.focus) {
      this.state.focus = stateChange.focus;
      stateChangesSet.add('focus');
    }
  }

  _updateLoadingStateChange(stateChange, stateChangesSet) {
    if(stateChange.loading != undefined && this.state.loading != stateChange.loading) {
      this.state.loading = stateChange.loading;
      stateChangesSet.add('loading');
    }
  }

  _hasAnyFiltersOrSearchString() {
    // TODO: Update with filters
    return this.state.searchString != '';
  }

  setState(stateChange) {
    const stateChangesSet = new Set();
    this._updateSearchStringStateChange(stateChange, stateChangesSet);
    this._updateDataStateChange(stateChange, stateChangesSet);
    this._updateSelectionStateChange(stateChange, stateChangesSet);
    this._updateFocusStateChange(stateChange, stateChangesSet);
    this._updateLoadingStateChange(stateChange, stateChangesSet);

    if(stateChangesSet.has('data')) {
      if(!this._hasAnyFiltersOrSearchString()) {
        if(this.state.data.count == 0) {
          this.state.isEmpty = true;
          this._sendIsEmpyDataListSignal();
        } else if(this.state.isEmpty || this.state.isEmpty == undefined) {
          this.state.isEmpty = false;
          this._sendNotEmpyDataListSignal();
        }
      }
      this._sendDataChangeSignal();
    }
    if(stateChangesSet.has('selection')) {
      this._sendSelectionChangeSignal();
    }
    if(stateChangesSet.has('searchString')) {
      this._requestDataListAndRefresh(this.makeRequestDataListOptions({
        searchString: this.state.searchString
      }));
    }
    if(stateChangesSet.has('loading')) {
      this._sendLoadingStateChangeSignal();
    }
    this._sendStateChangeSignal(stateChangesSet);
  }

  _sendIsEmpyDataListSignal() {
    new window.ievv_jsbase_core.SignalHandlerSingleton().send(
      `${this.config.signalNameSpace}.IsEmpyDataList`
    );
  }

  _sendNotEmpyDataListSignal() {
    new window.ievv_jsbase_core.SignalHandlerSingleton().send(
      `${this.config.signalNameSpace}.NotEmpyDataList`
    );
  }

  _sendDataChangeSignal() {
    new window.ievv_jsbase_core.SignalHandlerSingleton().send(
      `${this.config.signalNameSpace}.DataChange`,
      this.state.data
    );
  }

  _sendSelectionChangeSignal() {
    new window.ievv_jsbase_core.SignalHandlerSingleton().send(
      `${this.config.signalNameSpace}.SelectionChange`,
      {selectedItemsMap: this.state.selectedItemsMap}
    );
  }

  _sendLoadingStateChangeSignal() {
    new window.ievv_jsbase_core.SignalHandlerSingleton().send(
      `${this.config.signalNameSpace}.LoadingStateChange`,
      this.state.loading
    );
  }

  _sendStateChangeSignal(stateChanges) {
    new window.ievv_jsbase_core.SignalHandlerSingleton().send(
      `${this.config.signalNameSpace}.StateChange`,
      {state: this.state, stateChanges: stateChanges}
    );
  }

  _sendDataListInitializedSignal() {
    new window.ievv_jsbase_core.SignalHandlerSingleton().send(
      `${this.config.signalNameSpace}.DataListInitialized`,
      this.state
    );
  }

  _onSearchValueChangeSignal(receivedSignalInfo) {
    this.logger.debug('Received:', receivedSignalInfo.toString());
    this.setState({
      searchString: receivedSignalInfo.data
    });
  }

  _getKeyFromItemData(itemData) {
    return itemData[this.config.keyAttribute];
  }

  _onSelectItemSignal(receivedSignalInfo) {
    this.logger.debug('Received:', receivedSignalInfo.toString());
    const itemData = receivedSignalInfo.data;
    this.setState({
      addSelectedItem: itemData
    });
  }

  _onDeSelectItemSignal(receivedSignalInfo) {
    this.logger.debug('Received:', receivedSignalInfo.toString());
    const itemData = receivedSignalInfo.data;
    this.setState({
      removeSelectedItem: itemData
    });
  }

  _cancelBlurTimer() {
    if(this._blurTimeoutId != undefined) {
      window.clearTimeout(this._blurTimeoutId);
    }
  }

  _startBlurTimer(callback) {
    this._blurTimeoutId = window.setTimeout(
      callback,
      100);
  }

  _onFocusSignal(receivedSignalInfo) {
    this._cancelBlurTimer();
    this.setState({
      focus: true
    });
  }

  _onBlurSignal(receivedSignalInfo) {
    this._startBlurTimer(() => {
      this.setState({
        focus: false
      });
    });
  }

  _onLoadMoreSignal(receivedSignalInfo) {
    if(this._isLoadingDataList) {
      this.logger.warning('Requested LoadMore while loading data.');
      return;
    }
    if(!this.state.data.next) {
      this.logger.warning('Requested LoadMore with no next page.');
      return;
    }
    this._requestDataListAndRefresh(this.makeRequestDataListOptions({
      next: true
    }), 'appendData');
  }

  _onLoadNextPageSignal(receivedSignalInfo) {
    if(!this.state.data.next) {
      this.logger.warning('Requested LoadNextPage with no next page.');
      return;
    }
    this._requestDataListAndRefresh(this.makeRequestDataListOptions({
      next: true
    }), 'data');
  }

  _onLoadPreviousPageSignal(receivedSignalInfo) {
    if(!this.state.data.previous) {
      this.logger.warning('Requested LoadPreviousPage with no previous page.');
      return;
    }
    this._requestDataListAndRefresh(this.makeRequestDataListOptions({
      previous: true
    }), 'data');
  }

  requestItemData(key) {
    throw new Error('requestItemData must be implemented in subclasses of AbstractDataListWidget.');
  }

  requestDataList() {
    throw new Error('requestDataList must be implemented in subclasses of AbstractDataListWidget.');
  }

  _cancelLoadingStateTimer() {
    if(this._loadingStateTimeoutId != undefined) {
      window.clearTimeout(this._loadingStateTimeoutId);
    }
  }

  _startLoadingStateTimer() {
    this._loadingStateTimeoutId = window.setTimeout(() => {
      this.setState({
        loading: true
      });
    }, 200);
  }

  _setLoadingState() {
    this._startLoadingStateTimer();
  }
  _unsetLoadingState() {
    this._cancelLoadingStateTimer();
    this.setState({
      loading: false
    });
  }

  _requestDataList(options) {
    return new Promise((resolve, reject) => {
      const dataRequestId = ++this._dataRequestId;
      // this.logger.debug(`Requesting data ${dataRequestId}`, options);
      this._isLoadingDataList = true;
      this._setLoadingState();
      this.requestDataList(options)
        .then((data) => {
          this._isLoadingDataList = false;
          this._unsetLoadingState();
          if(this._dataRequestId == dataRequestId) {
            resolve(data);
          } else {
            reject(new CancelledDataRequest(
              `Data list request ${dataRequestId} was cancelled.`, {
                options: options
              }));
          }
        })
        .catch((error) => {
          this._isLoadingDataList = false;
          this._unsetLoadingState();
          reject(error);
        });
    });
  }

  makeRequestDataListOptions(overrideOptions={}) {
    return Object.assign({}, {
      searchString: this.state.searchString
    }, overrideOptions);
  }

  _requestDataListAndRefresh(options, stateChangeAttribute='data') {
    this._requestDataList(options)
      .then((data) => {
        const stateChange = {};
        stateChange[stateChangeAttribute] = data;
        this.setState(stateChange);
      })
      .catch((error) => {
        if(error instanceof CancelledDataRequest) {
          this.logger.warning(error.toString(), error.options);
        } else {
          throw error;
        }
      });
  }
}