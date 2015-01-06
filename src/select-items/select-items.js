'use strict';

/**
 * This directive provides a ability to select items from the given list to the given model.
 * Supports both multiple and single select modes.
 *
 * @author Umed Khudoiberdiev <info@zar.tj>
 */
angular.module('selectItems', ['selectOptions', 'ngSanitize', 'template/select-items/select-items.html']);

/**
 * This directive provides a ability to select items from the given list to the given model.
 * Supports both multiple and single select modes.
 *
 * @author Umed Khudoiberdiev <info@zar.tj>
 */
angular.module('selectItems').directive('selectItems', [
    '$parse', 'ListItemsActiveItemUtils', 'orderByFilter', 'filterFilter', '$templateCache',
    function ($parse, ListItemsActiveItemUtils, orderByFilter, filterFilter, $templateCache) {

        /**
         * Translates a given value (mostly string) to a boolean.
         *
         * @param {*} value
         * @returns {boolean}
         */
        var toBoolean = function(value) {
            if (value && value.length !== 0) {
                var v = value.toLowerCase();
                value = !(v === 'f' || v === '0' || v === 'false' || v === 'no' || v === 'n' || v === '[]');
            } else {
                value = false;
            }
            return value;
        };

        return {
            scope: {
                filters: '=',
                showLimit: '@',
                decorator: '=',
                onChange: '=',
                searchFilter: '='
                /* showLimit: int */
            },
            replace: true,
            restrict: 'E',
            require: ['ngModel', 'selectOptions'],
            templateUrl: 'template/select-items/select-items.html',
            link: function (scope, element, attrs, controllers) {

                // ---------------------------------------------------------------------
                // Local variables
                // ---------------------------------------------------------------------

                var ngModelCtrl               = controllers[0];
                var selectOptionsCtrl         = controllers[1];
                var keyInputListenerContainer = attrs.keyInputListenFor ? document.getElementById(attrs.keyInputListenFor) : null;

                // ---------------------------------------------------------------------
                // Scope variables
                // ---------------------------------------------------------------------

                scope.showLimit            = scope.showLimit ? parseInt(scope.showLimit) : null;
                scope.autoSelect           = toBoolean(attrs.autoSelect);
                scope.multiselect          = toBoolean(attrs.multiselect);
                scope.hideControls         = toBoolean(attrs.hideControls);
                scope.search               = toBoolean(attrs.search);
                scope.selectAll            = toBoolean(attrs.selectAll);
                scope.searchPlaceholder    = attrs.searchPlaceholder || 'Type to search';
                scope.selectAllLabel       = attrs.selectAllLabel    || 'Select all';
                scope.deselectAllLabel     = attrs.deselectAllLabel  || 'Deselect all';
                scope.noSelectionLabel     = attrs.noSelectionLabel  || 'Nothing is selected';
                scope.activeItem           = null;

                // ---------------------------------------------------------------------
                // Scope functions
                // ---------------------------------------------------------------------

                /**
                 * Gets the item name that will be used to display in the list.
                 *
                 * @param {Object} item
                 * @returns {string}
                 */
                scope.getItemName = function(item) {
                    var value = selectOptionsCtrl.parseItemName(item);
                    value = String(value).replace(/<[^>]+>/gm, ''); // strip html from the data here
                    return scope.decorator ? scope.decorator(item) : value;
                };

                /**
                 * Gets the items that will be used as an options for the model.
                 *
                 * @returns {Object[]}
                 */
                scope.getItems = function() {
                    var items = selectOptionsCtrl.parseItems();

                    // apply custom user filters to the items
                    if (scope.filters)
                        angular.forEach(scope.filters, function(filter) {
                            items = filter(items);
                        });

                    // limit number of items if necessary
                    if (scope.showLimit && items.length > scope.showLimit)
                        items = items.slice(0, scope.showLimit);

                    return items;
                };

                /**
                 * Gets the items that will be shown in the list.
                 * What it does it appends  | orderBy: orderProperty | filter: itemSearch
                 * to the #getItems method, but in js-code level.
                 *
                 * @returns {Object[]}
                 */
                scope.getDisplayedItems = function() {
                    var items = scope.getItems();
                    if (scope.searchKeyword)
                        items = filterFilter(items, scope.searchKeyword, scope.searchFilter);
                    if (selectOptionsCtrl.getOrderBy())
                        items = orderByFilter(items, selectOptionsCtrl.getOrderBy());

                    return items;
                };

                /**
                 * Sets a given item as active.
                 *
                 * @param {object} item
                 */
                scope.setActiveItem = function(item) {
                    scope.activeItem = item;
                };

                /**
                 * Checks if given item is selected.
                 *
                 * @param {object} item
                 * @returns {boolean}
                 */
                scope.isItemSelected = function(item) {
                    var model = ngModelCtrl.$modelValue;
                    var value = selectOptionsCtrl.parseItemValue(item);

                    var trackByProperty = selectOptionsCtrl.getTrackBy();
                    var trackByValue    = selectOptionsCtrl.parseTrackBy(item);

                    // if no tracking specified simple compare object in the model
                    if (!trackByProperty || !trackByValue)
                        return scope.multiselect ? (model && model.indexOf(value) !== -1) : model === value;

                    // if tracking is specified then searching is more complex
                    if (scope.multiselect) {
                        var isFound = false;
                        angular.forEach(model, function(m) {
                            if (m[trackByProperty] === trackByValue)
                                isFound = true;
                        });
                        return isFound;
                    }

                    return model[trackByProperty] === trackByValue;
                };

                /**
                 * Checks if any item is selected.
                 *
                 * @returns {boolean}
                 */
                scope.isAnyItemSelected = function() {
                    if (scope.multiselect)
                        return ngModelCtrl.$modelValue && ngModelCtrl.$modelValue.length > 0;

                    return ngModelCtrl.$modelValue ? true : false;
                };

                /**
                 * Selects a given item.
                 *
                 * @param {object} item
                 */
                scope.selectItem = function(item) {
                    var value = selectOptionsCtrl.parseItemValue(item);

                    // if simple, not multiple mode then
                    var model = value;
                    if (scope.multiselect) {
                        // otherwise dealing with multiple model
                        model = ngModelCtrl.$modelValue || [];
                            if (!scope.isItemSelected(item))
                            model.push(value);
                        else
                            model.splice(model.indexOf(value), 1);
                    }

                    ngModelCtrl.$setViewValue(model);
                    if (scope.onChange) scope.onChange(model);

                    // tell others that use selected item
                    scope.$emit('select-items.item_selected', { item: item, isMultiselect: scope.multiselect });
                };

                var a = function() {



                };

                /**
                 * Checks if all items are selected or not.
                 *
                 * @returns {boolean}
                 */
                scope.areAllItemsSelected = function() {
                    var items = scope.getDisplayedItems();

                    var isAnyNotSelected = false;
                    angular.forEach(items, function(item) {
                        isAnyNotSelected = isAnyNotSelected || !scope.isItemSelected(item);
                    });

                    return isAnyNotSelected === false;
                };

                /**
                 * Selects all items in the list.
                 */
                scope.selectAllItems = function() {
                    if (!scope.multiselect) return;

                    var items = scope.getDisplayedItems();
                    angular.forEach(items, function(item) {
                        if (!scope.isItemSelected(item))
                            scope.selectItem(item);
                    });
                };

                /**
                 * Deselects all items in the list.
                 */
                scope.deselectAllItems = function() {
                    if (!scope.multiselect) return;

                    var model = [];
                    ngModelCtrl.$setViewValue(model);
                    if (scope.onChange) scope.onChange(model);
                };

                /**
                 * Toggles all items selection state - if items are selected,
                 * then it deselects them, if items are not selected - then selects them.
                 */
                scope.toggleAllItemsSelection = function() {
                    if (scope.areAllItemsSelected())
                        scope.deselectAllItems();
                    else
                        scope.selectAllItems();
                };

                // ---------------------------------------------------------------------
                // Local functions
                // ---------------------------------------------------------------------

                /**
                 * Listens to the key down events on the given "keyInputListener" element.
                 *
                 * @param {KeyboardEvent} e
                 */
                var onKeyInputListenerKeyDown = function (e) {
                    switch (e.keyCode) {

                        case 38: // KEY "UP"
                            e.preventDefault();
                            var activeItem = ListItemsActiveItemUtils.previous(scope.getDisplayedItems(), scope.activeItem);
                            if (activeItem || !scope.multiselect) {
                                scope.activeItem = activeItem;
                                scope.$apply();
                            }
                            return;

                        case 40: // KEY "DOWN"
                            e.preventDefault();
                            scope.activeItem = ListItemsActiveItemUtils.next(scope.getDisplayedItems(), scope.activeItem);
                            scope.$apply();
                            return;

                        case 13: // KEY "ENTER"
                            scope.selectItem(scope.activeItem);
                            scope.$apply();
                            return;

                        case 27: // KEY "ESC"
                            scope.$emit('select-items.selection_canceled');
                            scope.$apply();
                            return;

                        default:
                            element[0].style.display = 'block';
                    }
                };

                // ---------------------------------------------------------------------
                // Initialization
                // ---------------------------------------------------------------------

                if (scope.autoSelect)
                    scope.selectItem(scope.getDisplayedItems()[0]);

                // ---------------------------------------------------------------------
                // Event listeners
                // ---------------------------------------------------------------------

                if (keyInputListenerContainer)
                    keyInputListenerContainer.addEventListener('keydown', onKeyInputListenerKeyDown);

                scope.$on('$destroy', function() {
                    if (keyInputListenerContainer)
                        keyInputListenerContainer.removeEventListener('keydown', onKeyInputListenerKeyDown);
                });
            }
        };
    }
]);

/**
 * @author Umed Khudoiberdiev <info@zar.tj>
 */
angular.module('selectItems').service('ListItemsActiveItemUtils', [
    function () {

        /**
         * @class ListItemsActiveItemUtils
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
    }
]);

/**
 * @author Umed Khudoiberdiev <info@zar.tj>
 */
angular.module('template/select-items/select-items.html', []).run(['$templateCache', function($templateCache) {
    $templateCache.put('template/select-items/select-items.html',
        '<div class="select-items"><ul>' +
            '<li ng-show="search" class="select-items-search"><input ng-model="searchKeyword" placeholder="{{ searchPlaceholder }}"></li>' +
            '<li ng-show="multiselect && selectAll && getDisplayedItems().length > 0" class="select-all" ng-click="toggleAllItemsSelection()">' +
                '<input ng-show="!hideControls" type="checkbox" ng-checked="areAllItemsSelected()">' +
                '<span class="select-all">{{ areAllItemsSelected() ? deselectAllLabel : selectAllLabel }}</span>' +
            '</li>' +
            '<li ng-show="!multiselect && !autoSelect && noSelectionLabel"' +
                'ng-click="selectItem()"' +
                'ng-mouseover="setActiveItem(null)"' +
                'ng-class="{ \'active\' : !activeItem }"' +
                'class="no-selection">' +
                '<input ng-show="!hideControls" type="radio" ng-checked="!isAnyItemSelected()">{{ noSelectionLabel }}' +
            '</li>' +
            '<li ng-repeat="item in getDisplayedItems()"' +
                'ng-mouseover="setActiveItem(item)"' +
                'ng-click="selectItem(item)"' +
                'ng-class="{ \'active\' : activeItem === item, \'selected\': isItemSelected(item) }"' +
                'class="select-item">' +
                '<div class="select-item-container">' +
                    '<input class="item-control" ' +
                        'ng-show="!hideControls" ' +
                        'ng-attr-type="{{ multiselect ? \'checkbox\' : \'radio\' }}" ' +
                        'ng-checked="isItemSelected(item)">' +
                    '<span class="select-item-template" ng-bind-html="getItemName(item)"></span>' +
                '</div>' +
            '</li>' +
        '</ul></div>');
}]);