import AbstractWidget from "ievv_jsbase/widget/AbstractWidget";


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

  get name() {
    throw new Error('Must be overridden');
  }

  constructor(element, widgetInstanceId) {
    super(element, widgetInstanceId);
    this.logger = new window.ievv_jsbase_core.LoggerSingleton().getLogger(
      this.name);
    this._onSearchValueChangeSignal = this._onSearchValueChangeSignal.bind(this);
    this._onSelectItemSignal = this._onSelectItemSignal.bind(this);
    this._onDeSelectItemSignal = this._onDeSelectItemSignal.bind(this);
    this._onFocusSignal = this._onFocusSignal.bind(this);
    this._onBlurSignal = this._onBlurSignal.bind(this);
    this._onLoadMoreSignal = this._onLoadMoreSignal.bind(this);
    this._onLoadNextPageSignal = this._onLoadNextPageSignal.bind(this);
    this._onLoadPreviousPageSignal = this._onLoadPreviousPageSignal.bind(this);
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
      searchString: ''
    };
    this._sendDataListInitializedSignal();
    this.setState(state);
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
      this.name,
      this._onSearchValueChangeSignal
    );
    new window.ievv_jsbase_core.SignalHandlerSingleton().addReceiver(
      `${this.config.signalNameSpace}.SelectItem`,
      this.name,
      this._onSelectItemSignal
    );
    new window.ievv_jsbase_core.SignalHandlerSingleton().addReceiver(
      `${this.config.signalNameSpace}.DeSelectItem`,
      this.name,
      this._onDeSelectItemSignal
    );
    new window.ievv_jsbase_core.SignalHandlerSingleton().addReceiver(
      `${this.config.signalNameSpace}.Focus`,
      this.name,
      this._onFocusSignal
    );
    new window.ievv_jsbase_core.SignalHandlerSingleton().addReceiver(
      `${this.config.signalNameSpace}.Blur`,
      this.name,
      this._onBlurSignal
    );
    new window.ievv_jsbase_core.SignalHandlerSingleton().addReceiver(
      `${this.config.signalNameSpace}.LoadMore`,
      this.name,
      this._onLoadMoreSignal
    );
    new window.ievv_jsbase_core.SignalHandlerSingleton().addReceiver(
      `${this.config.signalNameSpace}.LoadNextPage`,
      this.name,
      this._onLoadNextPageSignal
    );
    new window.ievv_jsbase_core.SignalHandlerSingleton().addReceiver(
      `${this.config.signalNameSpace}.LoadPreviousPage`,
      this.name,
      this._onLoadPreviousPageSignal
    );
  }

  destroy() {
    if(this.signalHandlersInitialized) {
      new window.ievv_jsbase_core.SignalHandlerSingleton().removeReceiver(
        `${this.config.signalNameSpace}.SearchValueChange`,
        this.name
      );
      new window.ievv_jsbase_core.SignalHandlerSingleton().removeReceiver(
        `${this.config.signalNameSpace}.SelectItem`,
        this.name
      );
      new window.ievv_jsbase_core.SignalHandlerSingleton().removeReceiver(
        `${this.config.signalNameSpace}.DeSelectItem`,
        this.name
      );
      new window.ievv_jsbase_core.SignalHandlerSingleton().removeReceiver(
        `${this.config.signalNameSpace}.Focus`,
        this.name
      );
      new window.ievv_jsbase_core.SignalHandlerSingleton().removeReceiver(
        `${this.config.signalNameSpace}.Blur`,
        this.name
      );
      new window.ievv_jsbase_core.SignalHandlerSingleton().removeReceiver(
        `${this.config.signalNameSpace}.LoadMore`,
        this.name
      );
      new window.ievv_jsbase_core.SignalHandlerSingleton().removeReceiver(
        `${this.config.signalNameSpace}.LoadNextPage`,
        this.name
      );
      new window.ievv_jsbase_core.SignalHandlerSingleton().removeReceiver(
        `${this.config.signalNameSpace}.LoadPreviousPage`,
        this.name
      );
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
    if(stateChange.focus != undefined) {
      this.state.focus = stateChange.focus;
      stateChangesSet.add('focus');
    }
  }

  setState(stateChange) {
    const stateChangesSet = new Set();
    this._updateSearchStringStateChange(stateChange, stateChangesSet);
    this._updateDataStateChange(stateChange, stateChangesSet);
    this._updateSelectionStateChange(stateChange, stateChangesSet);
    this._updateFocusStateChange(stateChange, stateChangesSet);

    if(stateChangesSet.has('data')) {
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
    this._sendStateChangeSignal(stateChangesSet);
  }

  _sendDataChangeSignal() {
    new window.ievv_jsbase_core.SignalHandlerSingleton().send(
      `${this.config.signalNameSpace}.DataChange`,
      this.state.data,
      (sentSignalInfo) => {
        this.logger.debug('Sent:', sentSignalInfo.toString());
      }
    );
  }

  _sendSelectionChangeSignal() {
    new window.ievv_jsbase_core.SignalHandlerSingleton().send(
      `${this.config.signalNameSpace}.SelectionChange`,
      {selectedItemsMap: this.state.selectedItemsMap},
      (sentSignalInfo) => {
        this.logger.debug('Sent:', sentSignalInfo.toString());
      }
    );
  }

  _sendStateChangeSignal(stateChanges) {
    new window.ievv_jsbase_core.SignalHandlerSingleton().send(
      `${this.config.signalNameSpace}.StateChange`,
      {state: this.state, stateChanges: stateChanges},
      (sentSignalInfo) => {
        this.logger.debug('Sent:', sentSignalInfo.toString());
      }
    );
  }

  _sendDataListInitializedSignal() {
    new window.ievv_jsbase_core.SignalHandlerSingleton().send(
      `${this.config.signalNameSpace}.DataListInitialized`,
      this.state,
      (sentSignalInfo) => {
        this.logger.debug('Sent:', sentSignalInfo.toString());
      }
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
    if(this.state.data.next) {
      this._requestDataListAndRefresh(this.makeRequestDataListOptions({
        next: true
      }), 'appendData');
    } else {
      this.logger.warning('Requested LoadMore with no next page.');
    }
  }

  _onLoadNextPageSignal(receivedSignalInfo) {
    if(this.state.data.next) {
      this._requestDataListAndRefresh(this.makeRequestDataListOptions({
        next: true
      }), 'data');
    } else {
      this.logger.warning('Requested LoadNextPage with no next page.');
    }
  }

  _onLoadPreviousPageSignal(receivedSignalInfo) {
    if(this.state.data.previous) {
      this._requestDataListAndRefresh(this.makeRequestDataListOptions({
        previous: true
      }), 'data');
    } else {
      this.logger.warning('Requested LoadPreviousPage with no previous page.');
    }
  }

  requestItemData(key) {
    throw new Error('requestItemData must be implemented in subclasses of AbstractDataListWidget.');
  }

  requestDataList() {
    throw new Error('requestDataList must be implemented in subclasses of AbstractDataListWidget.');
  }

  makeRequestDataListOptions(overrideOptions={}) {
    return Object.assign({}, {
      searchString: this.state.searchString
    }, overrideOptions);
  }

  _requestDataListAndRefresh(options, stateChangeAttribute='data') {
    this.requestDataList(options)
      .then((data) => {
        const stateChange = {};
        stateChange[stateChangeAttribute] = data;
        this.setState(stateChange);
      })
      .catch((error) => {
        throw error;
      });
  }
}
