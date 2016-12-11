import React from "react";
import {HotKeys} from 'react-hotkeys';


export default class CradminSelectableListItem extends React.Component {

  static get defaultProps() {
    return {
      className: 'selectable-list__item',
      selectedClassName: 'selectable-list__item--selected',
      contentClassName: 'selectable-list__itemcontent',
      renderIcon: false,
      iconWrapperClassName: 'selectable-list__icon',
      selectedIconClassName: 'icon-check--light',
      titleTagName: 'strong',
      titleClassName: 'selectable-list__itemtitle',
      descriptionClassName: '',
      isSelected: false,
      selectCallback: null,
      setDataListFocus: true,
      renderMode: 'TitleAndDescription',
      focus: false,
      focusClosestSiblingOnSelect: true,
      previousItemData: null,
      nextItemData: null,
      enableTabNavigation: true,
      useHotKeys: false
    }
  }

  constructor(props) {
    super(props);
    this.handleSelect = this.handleSelect.bind(this);
    this.handleFocus = this.handleFocus.bind(this);
    this.handleBlur = this.handleBlur.bind(this);
  }

  handleSelect(event) {
    event.preventDefault();
    if(this.props.isSelected) {
      new window.ievv_jsbase_core.SignalHandlerSingleton().send(
        `${this.props.signalNameSpace}.DeSelectItem`,
        this.props.data
      );
    } else {
      new window.ievv_jsbase_core.SignalHandlerSingleton().send(
        `${this.props.signalNameSpace}.SelectItem`,
        this.props.data
      );
      if(this.props.focusClosestSiblingOnSelect) {
        let closestSiblingData = this.props.nextItemData;
        if(closestSiblingData == null) {
          closestSiblingData = this.props.previousItemData;
        }
        if(closestSiblingData == null) {
          new window.ievv_jsbase_core.SignalHandlerSingleton().send(
            `${this.props.signalNameSpace}.FocusOnFallback`,
            closestSiblingData
          );
        } else {
          new window.ievv_jsbase_core.SignalHandlerSingleton().send(
            `${this.props.signalNameSpace}.FocusOnSelectableItem`,
            closestSiblingData
          );
        }
      }
    }
  }

  handleFocus() {
    if(this.props.setDataListFocus) {
      new window.ievv_jsbase_core.SignalHandlerSingleton().send(
        `${this.props.signalNameSpace}.Focus`
      );
    }
  }

  handleBlur() {
    if(this.props.setDataListFocus) {
      new window.ievv_jsbase_core.SignalHandlerSingleton().send(
        `${this.props.signalNameSpace}.Blur`
      );
    }
  }

  get ariaTitle() {
    if(this.props.data.ariaTitle) {
      return this.props.data.ariaTitle;
    } else {
      return this.props.data.title;
    }
  }

  get fullClassName() {
    let className = this.props.className;
    if(this.props.isSelected) {
      className = `${className} ${this.props.selectedClassName}`
    }
    return className;
  }

  renderTitle() {
    return React.createElement(this.props.titleTagName, {
      className: this.props.titleClassName
    }, this.props.data.title);
  }

  renderDescription() {
    if(this.props.data.description && this.props.data.description != '') {
      return <p className={this.props.descriptionClassName}>{this.props.data.description}</p>;
    } else {
      return '';
    }
  }

  renderIcon() {
    if(this.props.isSelected) {
      return <i className={this.props.selectedIconClassName} />;
    } else {
      return '';
    }
  }

  renderIconWrapper() {
    if(this.props.renderIcon) {
      return <div className={this.props.iconWrapperClassName}>
        {this.renderIcon()}
      </div>;
    } else {
      return '';
    }
  }

  renderContentModeTitleAndDescription() {
    return <div className={this.props.contentClassName}>
      {this.renderTitle()}
      {this.renderDescription()}
    </div>;
  }

  renderContentModeTitleOnly() {
    return <div className={this.props.contentClassName}>
      {this.props.data.title}
    </div>;
  }

  renderContentModeHtml() {
    return <div className={this.props.contentClassName}
                dangerouslySetInnerHTML={{__html: this.props.data.html}}></div>;
  }

  renderContent() {
    if(this.props.renderMode == 'TitleAndDescription') {
      return this.renderContentModeTitleAndDescription();
    } else if(this.props.renderMode == 'TitleOnly') {
      return this.renderContentModeTitleOnly();
    } else if(this.props.renderMode == 'html') {
      return this.renderContentModeHtml();
    } else {
      throw new Error(`Invalid renderMode: ${this.props.renderMode}`);
    }
  }

  getTabIndex() {
    if(this.props.enableTabNavigation) {
      return "0";
    } else {
      return "-1";
    }
  }

  get hotKeysMap() {
    return {
      'focusPreviousItem': ['up'],
      'focusNextItem': ['down'],
    };
  }

  _focusPreviousItem() {
    if(this.props.previousItemData == null) {
      new window.ievv_jsbase_core.SignalHandlerSingleton().send(
        `${this.props.signalNameSpace}.FocusBeforeFirstSelectableItem`);
    } else {
      new window.ievv_jsbase_core.SignalHandlerSingleton().send(
        `${this.props.signalNameSpace}.FocusOnSelectableItem`,
        this.props.previousItemData
      );
    }
  }

  _focusNextItem() {
    if(this.props.nextItemData == null) {
      new window.ievv_jsbase_core.SignalHandlerSingleton().send(
        `${this.props.signalNameSpace}.FocusAfterLastSelectableItem`);
    } else {
      new window.ievv_jsbase_core.SignalHandlerSingleton().send(
        `${this.props.signalNameSpace}.FocusOnSelectableItem`,
        this.props.nextItemData
      );
    }
  }

  get hotKeysHandlers() {
    return {
      'focusPreviousItem': (event) => {
        event.preventDefault();
        this._focusPreviousItem();
      },
      'focusNextItem': (event) => {
        event.preventDefault();
        this._focusNextItem();
      }
    }
  }

  renderWrapper() {
    return <a href="#" className={this.fullClassName}
              ref={(domElement) => { this._domElement = domElement; }}
              tabIndex={this.getTabIndex()}
              onClick={this.handleSelect}
              onFocus={this.handleFocus}
              onBlur={this.handleBlur}
              aria-label={this.ariaTitle}
              role="button">
      {this.renderIconWrapper()}
      {this.renderContent()}
    </a>;
  }

  render() {
    if(this.props.useHotKeys) {
      return <HotKeys keyMap={this.hotKeysMap} handlers={this.hotKeysHandlers}>
        {this.renderWrapper()}
      </HotKeys>
    } else {
      return this.renderWrapper();
    }
  }

  componentDidUpdate() {
    if(this.props.focus) {
      this._domElement.focus();
    }
  }
}