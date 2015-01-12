'use strict';

/**
 * This directive provides a ability to select items from the given list to the given model.
 * Supports both multiple and single select modes.
 *
 * @ngdoc directive
 * @param {Array.<Function>} filters Filters used to filter out values that must not be shown.
 * @param {number} showLimit Maximal number of items to show in the list
 * @param {Function} decorator Custom decorator used to change a view of the list item
 * @param {number} modelInsertPosition Optional number that will be used to insert a new model item in multiselect mode.
 * @param {Function} onChange Expression that will be executed on change of the ng-model
 * @param {Function} searchFilter Filter that controls the result of the search input
 * @param {expression|object} searchKeyword Model used to be a search keyword that user types in the search box
 * @param {object} activeItem Item that will be active by default
 * @param {boolean} autoSelect If set to true, then first item of the give select-items will be selected.
 *                             This works only with single select
 * @param {boolean} multiselect If set to true then user can select multiple options from the list of items. In this
 *                              case ng-model will be an array. If set to false then user can select only one option
 *                              from the list of items. In this case ng-model will not be array
 * @param {boolean} hideControls If set to true, then all select-items controls will be hidden. Controls such as
 *                               checkboxes and radio boxes
 * @param {boolean} hideNoSelection If set to true, then all "nothing is selected" label and checkbox will not be
 *                                      shown. This label show only in single select mode
 * @param {boolean} search If set to true, then search input will be shown to the user, where he can peform a search
 *                          in the list of items
 * @param {boolean} selectAll If set to true, then "select all" option will be shown to user. This works only when
 *                              multiple items mode is enabled
 * @param {string} searchPlaceholder Custom placeholder text that will be in the search box
 * @param {string} selectAllLabel Custom text that will be used as a "select all" label.
 *                                  This label show only in single select mode
 * @param {string} deselectAllLabel Custom text that will be used as a "deselect all" label.
 *                                  This label show only in multi select mode
 * @param {string} noSelectionLabel Custom text that will be used as a "no items selected" label.
 *                                  This label show only in multi select mode
 * @param {string} keyInputListenFor The id of the DOM element from that this directive will catch keyboard events,
 *                                   to
 *
 * @author Umed Khudoiberdiev <info@zar.tj>
 */
angular.module('selectItems').directive('selectItems', [
    '$parse', 'selectItemsConfiguration', 'selectItemsActiveItemNavigator', 'orderByFilter', 'filterFilter',
    function ($parse, selectItemsConfiguration, selectItemsActiveItemNavigator, orderByFilter, filterFilter) {

        return {
            scope: {
                multiselect: '=?',
                activeItem: '=?',
                onChange: '=?',
                showLimit: '=?',
                selectAll: '=?',
                autoSelect: '=?',
                hideControls: '=?',
                hideNoSelection: '=?',
                search: '=?',
                searchFilter: '=?',
                searchKeyword: '=?',
                filters: '=?',
                decorator: '=?',
                modelInsertPosition: '=?',
                searchPlaceholder: '@',
                selectAllLabel: '@',
                deselectAllLabel: '@',
                noSelectionLabel: '@'
            },
            replace: true,
            restrict: 'E',
            require: ['ngModel', 'selectOptions'],
            templateUrl: '../../src/select-items/select-items.html',
            link: function (scope, element, attrs, controllers) {

                // ---------------------------------------------------------------------
                // Scope variables
                // ---------------------------------------------------------------------

                scope.showLimit            = scope.showLimit ? parseInt(scope.showLimit) : null;
                scope.searchPlaceholder    = scope.searchPlaceholder || selectItemsConfiguration.searchPlaceholder;
                scope.selectAllLabel       = scope.selectAllLabel    || selectItemsConfiguration.selectAllLabel;
                scope.deselectAllLabel     = scope.deselectAllLabel  || selectItemsConfiguration.deselectAllLabel;
                scope.noSelectionLabel     = scope.noSelectionLabel  || selectItemsConfiguration.noSelectionLabel;

                // ---------------------------------------------------------------------
                // Local variables
                // ---------------------------------------------------------------------

                var ngModelCtrl        = controllers[0];
                var selectOptionsCtrl  = controllers[1];

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
                 * Selects a given item.
                 *
                 * @param {object} item
                 */
                scope.selectItem = function(item) {
                    var value = selectOptionsCtrl.parseItemValue(item);
                    var newSelection = false;
                    var index = null;

                    // if simple, not multiple mode then
                    var model = value;
                    if (scope.multiselect) {
                        // otherwise dealing with multiple model
                        model = ngModelCtrl.$modelValue || [];
                        if (!scope.isItemSelected(item) && value !== null) {
                            if (angular.isDefined(scope.modelInsertPosition))
                                model.splice(scope.modelInsertPosition, 0, item);
                            else
                                model.push(value);

                            index = scope.modelInsertPosition;
                            newSelection = true;
                        } else {
                            index = model.indexOf(value);
                            model.splice(index, 1);
                        }
                    }

                    ngModelCtrl.$setViewValue(model);
                    if (scope.onChange)
                        scope.onChange(model);

                    // tell others that use selected item
                    scope.$emit('select-items.item_selected', { item: item, isMultiselect: scope.multiselect, isNewSelection: newSelection, index: index });
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

                    var items = scope.getDisplayedItems();
                    angular.forEach(items, function(item) {
                        if (scope.isItemSelected(item))
                            scope.selectItem(item);
                    });

                    // remove lines after be sure that approach in about don't bring us a problems
                    //var model = [];
                    //ngModelCtrl.$setViewValue(model);
                    //if (scope.onChange) scope.onChange(model);
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

                /**
                 * Sets a given item as active.
                 *
                 * @param {object} item
                 */
                scope.setActiveItem = function(item) {
                    scope.activeItem = item;
                };

                // ---------------------------------------------------------------------
                // Event listeners
                // ---------------------------------------------------------------------

                // when this event comes it makes a next item in the list of displayed items as active
                scope.$on('select-items.active_next', function() {
                    var activeItem = selectItemsActiveItemNavigator.previous(scope.getDisplayedItems(), scope.activeItem);
                    if (activeItem || !scope.multiselect) {
                        scope.activeItem = activeItem;
                    }
                });

                // when this event comes it makes a previous item in the list of displayed items as active
                scope.$on('select-items.active_previous', function() {
                    scope.activeItem = selectItemsActiveItemNavigator.next(scope.getDisplayedItems(), scope.activeItem);
                });

                // when this event comes it selects (adds to the model) a currently active item
                scope.$on('select-items.select_active', function(event) {
                    var displayedItems = scope.getDisplayedItems();
                    if (displayedItems.length > 0 && displayedItems.indexOf(scope.activeItem) !== -1) {
                        scope.selectItem(scope.activeItem);
                        event.isItemSelected = true;
                    } else {
                        event.isItemSelected = false;
                    }
                });

                // ---------------------------------------------------------------------
                // Initialization
                // ---------------------------------------------------------------------

                // if auto-select option is given then auto select first item in the displayed list of items
                if (scope.autoSelect) {
                    var displayedItems = scope.getDisplayedItems();
                    if (displayedItems.length > 0)
                        scope.selectItem(displayedItems[0]);
                }
            }
        };
    }
]);