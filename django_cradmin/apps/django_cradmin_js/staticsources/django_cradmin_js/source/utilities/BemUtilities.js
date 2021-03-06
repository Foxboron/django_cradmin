/**
 * General purpose BEM css class utilities.
 */
export default class BemUtilities {
  /**
   * Add variants to a BEM block or element.
   *
   * @example
   * BemUtilities.addVariants('button', ['primary', 'spaced']
   * // Result is 'button button--primary button--spaced'
   *
   * @param {string} bemBlockOrElement A BEM block or element.
   * @param {[]} bemVariants Array of BEM variants.
   * @returns {string} CSS classes string.
   */
  static addVariants (bemBlockOrElement, bemVariants=[]) {
    let cssClass = bemBlockOrElement
    for (let variant of bemVariants) {
      cssClass = `${cssClass} ${bemBlockOrElement}--${variant}`
    }
    return cssClass
  }

  /**
   * Build a BEM element.
   *
   * @example
   * BemUtilities.buildBemElement('blocklist', 'title', ['lg', 'dark'])
   * // Result is 'blocklist__title blocklist__title--lg blocklist__title--dark'
   *
   * @param {string} bemBlock The BEM block the element belongs to.
   * @param {string} bemElement The BEM element.
   * @param {[]} bemVariants Array of BEM variants
   * @returns {string} CSS classes string.
   */
  static buildBemElement (bemBlock, bemElement, bemVariants=[]) {
    return BemUtilities.addVariants(`${bemBlock}__${bemElement}`, bemVariants)
  }
}
