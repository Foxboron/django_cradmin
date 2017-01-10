import React from "react";
import ReactDOM from "react-dom";


export default class CradminDateSelectorHiddenIsoDate extends React.Component {
  static get defaultProps() {
    return {
      signalNameSpace: null,
      inputType: 'hidden',
      inputName: null,
      initialDay: null,
      initialMonth: null,
      initialYear: null,
    };
  }

  constructor(props) {
    super(props);
    this._name = `django_cradmin.components.CradminDateSelectorHiddenIsoDate.${this.props.signalNameSpace}`;
    this.logger = new window.ievv_jsbase_core.LoggerSingleton().getLogger(
      'django_cradmin.components.CradminDateSelectorHiddenIsoDate');

    this.state = {
      day: this.props.initialDay,
      month: this.props.initialMonth,
      year: this.props.initialYear,
      invalid: this.props.initialDay == null || this.props.initialMonth == null || this.props.initialYear == null,
      value: ""
    };

    this.state = this._updateStateValue(this.state);

    this._onDayValueChangeSignal = this._onDayValueChangeSignal.bind(this);
    this._onMonthValueChangeSignal = this._onMonthValueChangeSignal.bind(this);
    this._onYearValueChangeSignal = this._onYearValueChangeSignal.bind(this);
    this._initializeSignalHandlers()
  }

  _initializeSignalHandlers() {
    new window.ievv_jsbase_core.SignalHandlerSingleton().addReceiver(
      `${this.props.signalNameSpace}.DayValueChange`,
      this._name,
      this._onDayValueChangeSignal
    );
    new window.ievv_jsbase_core.SignalHandlerSingleton().addReceiver(
      `${this.props.signalNameSpace}.MonthValueChange`,
      this._name,
      this._onMonthValueChangeSignal
    );
    new window.ievv_jsbase_core.SignalHandlerSingleton().addReceiver(
      `${this.props.signalNameSpace}.YearValueChange`,
      this._name,
      this._onYearValueChangeSignal
    );
  }

  _updateStateValue(stateObject) {
    let invalid = stateObject.day == null || stateObject.year == null || stateObject.month == null;
    let date = null;
    let value = '';
    if (!invalid) {
      date = new Date(Date.UTC(stateObject.year, stateObject.month, stateObject.day));
      value = date.toISOString().split('T')[0];
    }

    return {
      invalid: invalid,
      value: value
    };
  }

  _updateDate() {
    this.setState((prevState, props) => {
      return this._updateStateValue(prevState);
    })
  }

  _onDayValueChangeSignal(receivedSignalInfo) {
    this.setState({day: receivedSignalInfo.data});
    this._updateDate();
  }

  _onMonthValueChangeSignal(receivedSignalInfo) {
    this.setState({month: receivedSignalInfo.data});
    this._updateDate();
  }

  _onYearValueChangeSignal(receivedSignalInfo) {
    this.setState({year: receivedSignalInfo.data});
    this._updateDate();
  }

  render() {
    return <input
      type={this.props.inputType}
      name={this.props.inputName}
      value={this.state.value}
    />;
  }
}
