/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import first from '@ckeditor/ckeditor5-utils/src/first';

/**
 * @module image/imagestyle/converters
 */

/**
 * Returns a converter for the `imageStyle` attribute. It can be used for adding, changing and removing the attribute.
 *
 * @param {Object} styles An object containing available styles. See {@link module:image/imagestyle/imagestyleengine~ImageStyleFormat}
 * for more details.
 * @returns {Function} A model-to-view attribute converter.
 */
export function modelToViewStyleAttribute( styles ) {
	return ( evt, data, consumable, conversionApi ) => {
		if ( !consumable.consume( data.item, evt.name ) ) {
			return;
		}

		// Check if there is class name associated with given value.
		const newStyle = getStyleByName( data.attributeNewValue, styles );
		const oldStyle = getStyleByName( data.attributeOldValue, styles );

		const viewElement = conversionApi.mapper.toViewElement( data.item );

		if ( oldStyle ) {
			viewElement.removeClass( oldStyle.className );
		}

		if ( newStyle ) {
			viewElement.addClass( newStyle.className );
		}
	};
}

/**
 * Returns a view-to-model converter converting image CSS classes to a proper value in the model.
 *
 * @param {Array.<module:image/imagestyle/imagestyleengine~ImageStyleFormat>} styles Styles for which the converter is created.
 * @returns {Function} A view-to-model converter.
 */
export function viewToModelStyleAttribute( styles ) {
	// Convert only non–default styles.
	const filteredStyles = styles.filter( style => !style.isDefault );

	return ( evt, data, conversionApi ) => {
		if ( !data.modelRange ) {
			return;
		}

		const viewFigureElement = data.viewItem;
		const modelImageElement = first( data.modelRange.getItems() );

		// Check if `imageStyle` attribute is allowed for current element.
		if ( !conversionApi.schema.checkAttribute( modelImageElement, 'imageStyle' ) ) {
			return;
		}

		// Convert style one by one.
		for ( const style of filteredStyles ) {
			// Try to consume class corresponding with style.
			if ( conversionApi.consumable.consume( viewFigureElement, { class: style.className } ) ) {
				// And convert this style to model attribute.
				conversionApi.writer.setAttribute( 'imageStyle', style.name, modelImageElement );
			}
		}
	};
}

// Returns style with given `name` from array of styles.
//
// @param {String} name
// @param {Array.<module:image/imagestyle/imagestyleengine~ImageStyleFormat> } styles
// @return {module:image/imagestyle/imagestyleengine~ImageStyleFormat|undefined}
function getStyleByName( name, styles ) {
	for ( const style of styles ) {
		if ( style.name === name ) {
			return style;
		}
	}
}
