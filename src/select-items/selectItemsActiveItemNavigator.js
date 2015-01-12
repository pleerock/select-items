'use strict';

/**
 * This directive provides a ability to select items from the given list to the given model.
 * Supports both multiple and single select modes.
 *
 * @author Umed Khudoiberdiev <info@zar.tj>
 */
angular.module('selectItems').factory('selectItemsActiveItemNavigator', function () {

    /**
     * @class selectItemsActiveItemNavigator
     */
    return {

        previous: function(items, currentSelectedItem) {

            // no items - no way to deal here
            if (!items || items.length === 0)
                return null;

            // select last element if not selections yet
            // if (!currentSelectedItem && items.length > 0)
            //    return items[items.length - 1];

            // select previous item if it exists
            var index = items.indexOf(currentSelectedItem);
            if (index > 0 && items[index - 1]) {
                return items[index - 1];
            }

            // if previous item does not exist then just stay on the same element
            return null;
        },

        next: function(items, currentSelectedItem) {

            // no items - no way to deal here
            if (!items || items.length === 0)
                return null;

            // if not current selection then select first item
            if (!currentSelectedItem)
                return items[0];

            // select next item if it exists
            var index = items.indexOf(currentSelectedItem);
            if (currentSelectedItem && index > -1 && items[index + 1]) {
                return items[index + 1];
            }

            // if next item does not exist then just stay on the same element
            return currentSelectedItem;
        }

    };
});