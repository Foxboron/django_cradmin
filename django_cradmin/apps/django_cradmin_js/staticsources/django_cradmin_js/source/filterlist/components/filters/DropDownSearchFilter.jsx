import React from 'react'
import PropTypes from 'prop-types'
import AbstractSearchFilter from './AbstractSearchFilter'
import 'ievv_jsbase/lib/utils/i18nFallbacks'
import { COMPONENT_GROUP_EXPANDABLE } from '../../filterListConstants'
import BemUtilities from '../../../utilities/BemUtilities'

/**
 * Dropdown search input filter.
 *
 * Works mostly like {@link SearchFilter} except that it expands/collapses
 * the {@link COMPONENT_GROUP_EXPANDABLE} component group when
 * it has focus and any search input (or when the expand button is clicked).
 *
 * See {@link SearchFilter.defaultProps} for documentation for
 * props and their defaults.
 *
 * @example <caption>Spec - minimal</caption>
 * {
 *    "component": "DropDownSearchFilter",
 *    "props": {
 *      "name": "search"
 *    }
 * }
 *
 * @example <caption>Spec - with initial value</caption>
 * {
 *    "component": "DropDownSearchFilter",
 *    "initialValue": "people",
 *    "props": {
 *      "name": "search"
 *    }
 * }
 *
 * @example <caption>Spec - with label and rotating placeholder</caption>
 * {
 *    "component": "DropDownSearchFilter",
 *    "props": {
 *      "name": "search",
 *      "label": "Search for some people",
 *      "placeholder": ["Thor", "Santa Claus", "Odin"]
 *    }
 * }
 *
 * @example <caption>Spec - full example with something to expand</caption>
 * {
 *   "getItemsApiUrl": "https://example.com/path/to/my/api",
 *   "header": {
 *     "component": "ThreeColumnLayout",
 *     "layout": [{
 *       "component": "DropDownSearchFilter",
 *       "props": {
 *         "name": "search"
 *       }
 *     }]
 *   },
 *   "body": {
 *     "component": "ThreeColumnDropDownLayout",
 *     "props": {
 *       "componentGroups": ["expandable"]
 *     },
 *     "layout": [{
 *       "component": "SelectableList",
 *       "itemSpec": {
 *         "component": "SelectableTitleDescriptionItem",
 *         "props": {
 *           "bemVariants": ["neutral-light", "bordered"]
 *         }
 *       }
 *     }, {
 *       "component": "LoadMorePaginator"
 *     }]
 *   }
 * }
 */
export default class DropDownSearchFilter extends AbstractSearchFilter {
  static get propTypes () {
    const propTypes = super.propTypes
    propTypes.label = PropTypes.string
    propTypes.inputBemVariants = PropTypes.arrayOf(PropTypes.string).isRequired
    return propTypes
  }

  /**
   * Get default props. Extends the default props
   * from {@link AbstractSearchFilter.defaultProps}.
   *
   * @return {Object}
   * @property {string} label An optional label for the search field.
   *    Defaults to empty string.
   *    **Can be used in spec**.
   * @property {[string]} inputBemVariants Array of BEM variants
   *    for the search input element.
   *    Defaults to `['outlined']`.
   *    **Can be used in spec**.
   */
  static get defaultProps () {
    const defaultProps = super.defaultProps
    defaultProps.label = null
    defaultProps.inputBemVariants = ['outlined']
    return defaultProps
  }

  static shouldReceiveFocusEvents (componentSpec) {
    return true
  }

  setupBoundMethods () {
    super.setupBoundMethods()
    this.onClickExpandCollapseButton = this.onClickExpandCollapseButton.bind(this)
  }

  onAnyComponentFocus (newFocusComponentInfo, prevFocusComponentInfo, didChangeFilterListFocus) {
    if (newFocusComponentInfo.uniqueComponentKey === this.props.uniqueComponentKey) {
      return
    }
    if (newFocusComponentInfo.componentGroups === null) {
      this.disableExpandableComponentGroup()
    } else if (newFocusComponentInfo.componentGroups.indexOf(this.expandableComponentGroup) === -1) {
      this.disableExpandableComponentGroup()
    }
  }

  onAnyComponentBlur (blurredComponentInfo, didChangeFilterListFocus) {
    if (didChangeFilterListFocus) {
      this.disableExpandableComponentGroup()
    }
  }

  get expandableComponentGroup () {
    return COMPONENT_GROUP_EXPANDABLE
  }

  isExpanded () {
    return this.props.childExposedApi.componentGroupIsEnabled(this.expandableComponentGroup)
  }

  toggleExpandableComponentGroup () {
    this.props.childExposedApi.toggleComponentGroup(this.expandableComponentGroup)
  }

  enableExpandableComponentGroup () {
    this.props.childExposedApi.enableComponentGroup(this.expandableComponentGroup)
  }

  disableExpandableComponentGroup () {
    this.props.childExposedApi.disableComponentGroup(this.expandableComponentGroup)
  }

  onClickExpandCollapseButton () {
    this.toggleExpandableComponentGroup()
  }

  onFocus () {
    this.enableExpandableComponentGroup()
    super.onFocus()
  }

  onBlur () {
    super.onBlur()
  }

  getSearchInputRef () {
    return this._searchInputRef
  }

  renderLabel () {
    return this.props.label
  }

  get labelClassName () {
    return 'label'
  }

  get fieldWrapperClassName () {
    return 'searchinput'
  }

  get searchInputClassName () {
    return `searchinput__input ${BemUtilities.addVariants('input', this.props.inputBemVariants)}`
  }

  get expandCollapseButtonLabel () {
    if (this.isExpanded()) {
      return window.gettext('Collapse')
    } else {
      return window.gettext('Expand')
    }
  }

  get clearButtonClassName () {
    return 'searchinput__button'
  }

  get clearButtonIconClassName () {
    if (this.isExpanded()) {
      return 'icon-chevron-up'
    } else {
      return 'icon-chevron-down'
    }
  }

  renderExpandCollapseIcon () {
    return <span className={this.clearButtonIconClassName} aria-hidden='true' />
  }

  renderExpandCollapseButton () {
    return <button
      type='button'
      className={this.clearButtonClassName}
      title={this.expandCollapseButtonLabel}
      onClick={this.onClickExpandCollapseButton}
      onFocus={this.onFocus}
      onBlur={this.onBlur}
    >
      {this.renderExpandCollapseIcon()}
    </button>
  }

  renderSearchInput () {
    return <input
      type='text'
      ref={(input) => { this._searchInputRef = input }}
      placeholder={this.placeholder}
      className={this.searchInputClassName}
      value={this.stringValue}
      onFocus={this.onFocus}
      onBlur={this.onBlur}
      onChange={this.onChange} />
  }

  render () {
    return <label className={this.labelClassName}>
      {this.renderLabel()}
      <div className={this.fieldWrapperClassName}>
        {this.renderSearchInput()}
        {this.renderExpandCollapseButton()}
      </div>
    </label>
  }
}
