import PropTypes from 'prop-types'
import AbstractSearchInputButton from './AbstractSearchInputButton'
import 'ievv_jsbase/lib/utils/i18nFallbacks'

/**
 * Renders a expand/collapse ``searchinput__button``.
 *
 * See {@link SearchInputExpandCollapseButton.defaultProps} for documentation for
 * props and their defaults.
 */
export default class SearchInputExpandCollapseButton extends AbstractSearchInputButton {
  /**
   * Get default props. Same props as for {@link AbstractSearchInputButton.defaultProps}.
   */
  static get defaultProps () {
    return super.defaultProps
  }

  get iconClassName () {
    return 'cricon cricon--close'
  }

  get label () {
    return window.gettext('Clear search field')
  }
}
