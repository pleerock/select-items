'use strict';

/**
 * @author Umed Khudoiberdiev <info@zar.tj>
 */
angular.module('selectDropdown', ['selectItems', 'openDropdown']);

/**
 *
 * @author Umed Khudoiberdiev <info@zar.tj>
 */
angular.module('selectDropdown').directive('selectDropdown', [
    function () {

        var guid = function() {
            function s4() {
                return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
            }
            return s4() + s4() + '_' + s4() + '_' + s4();
        };

        return {
            replace: true,
            scope: true,
            restrict: 'E',
            template: function(element, attrs) {
                var selectBoxId = 'select_dropdown_' + guid();
                return '<div class="select-dropdown">' +
                    '<select-items-box  id="' + selectBoxId + '" tabindex="2" style="display: block"' +
                                        'class="select-items-box"' +
                                        'ng-class="{\'opened\': isOpened, \'closed\': !isOpened}"' +
                                        'nothing-selected-text="' + (attrs.nothingSelectedText ? attrs.nothingSelectedText : '') + '"' +
                                        'decorator="' + (attrs.showDecorator ? attrs.showDecorator : '') + '"' +
                                        'separator="' + (attrs.showSeparator ? attrs.showSeparator : '') + '"' +
                                        'show-limit="' + (attrs.showLimit ? attrs.showLimit : '') + '"' +
                                        '></select-items-box>' +
                    '<open-dropdown class="open-dropdown" for="' + selectBoxId + '" toggle-click="true" tabindex="3" is-opened="isOpened">' +
                       '<select-items class="select-items"' +
                             'select-options="' + attrs.selectOptions + '"'  +
                             'decorator="decorator"'  +
                             'ng-model="' + attrs.ngModel + '"'  +
                             'search="false"'  +
                             'select-all="' + (attrs.dropdownSelectAll ? attrs.dropdownSelectAll : '') + '"'  +
                             'auto-select="' + (attrs.dropdownAutoSelect ? attrs.dropdownAutoSelect : '') + '"'  +
                             'multiselect="' + (attrs.multiselect ? attrs.multiselect : '') + '">' +
                        '</select-items>'  +
                    '</open-dropdown>'  +
                '</div>';
            },
            link: function(scope, element) {

                // ---------------------------------------------------------------------
                // Variables
                // ---------------------------------------------------------------------

                /**
                 * Indicates if dropdown is opened or not.
                 *
                 * @type {boolean}
                 */
                scope.isOpened = false;

                // ---------------------------------------------------------------------
                // Local functions
                // ---------------------------------------------------------------------

                /**
                 * Listen to key downs to control drop down open state.
                 *
                 * @param {KeyboardEvent} e
                 */
                var onSelectDropdownKeydown = function(e) {
                    switch (e.keyCode) {

                        case 38: // KEY "UP"
                            e.preventDefault();
                            scope.isOpened = true;
                            scope.$broadcast('select-items.active_next');
                            scope.$digest();
                            return;

                        case 40: // KEY "DOWN"
                            e.preventDefault();
                            scope.isOpened = true;
                            scope.$broadcast('select-items.active_previous');
                            scope.$digest();
                            return;

                        case 13: // KEY "ENTER"
                            if (scope.isOpened) {
                                scope.$broadcast('select-items.select_active');
                                scope.$digest();
                            }
                            return;

                        case 27: // KEY "ESC"
                            scope.isOpened = false;
                            scope.$digest();
                            return;

                        default:
                            return;
                    }
                };

                /**
                 * When item is selected we move focus back to select-items-box and hide dropdown if its not multiselect typed
                 *
                 * @param {KeyboardEvent} event
                 * @param {object} object
                 */
                var onItemSelected = function(event, object) {
                    if (object && !object.isMultiselect)
                        scope.isOpened = false;

                    //scope.$digest();
                };

                // ---------------------------------------------------------------------
                // Event Listeners
                // ---------------------------------------------------------------------

                element[0].addEventListener('keydown', onSelectDropdownKeydown);
                scope.$on('select-items.item_selected', onItemSelected);

            }
        };
    }
]);

/**
 *
 * @author Umed Khudoiberdiev <info@zar.tj>
 */
angular.module('selectDropdown').directive('selectItemsBox', [
    function () {

        return {
            scope: {
                decorator: '='
            },
            restrict: 'E',
            require: ['^ngModel', '^selectOptions'],
            template: '<div class="arrow-container"><div class="arrow"></div></div><div class="text-items">' +
                    '<span ng-repeat="item in getItems()">' +
                        '<span ng-hide="showLimit && $index >= showLimit" ng-bind-html="getItemName(item)"></span>' +
                        '<span ng-hide="$last || (showLimit && $index >= showLimit)">{{ separator }}</span>' +
                        '<span ng-show="showLimit && $index === showLimit">...</span>' +
                    '</span>' +
                    '<div ng-show="!getItems() || !getItems().length">{{ nothingSelectedText }}</div>' +
                '</div>',
            link: function (scope, element, attrs, controllers) {

                var ngModelCtrl         = controllers[0];
                var selectOptionsCtrl   = controllers[1];

                scope.nothingSelectedText = attrs.nothingSelectedText ? attrs.nothingSelectedText : 'Nothing is selected';
                scope.separator           = attrs.separator ? attrs.separator : ', ';
                scope.showLimit           = attrs.showLimit ? parseInt(attrs.showLimit): null;

                /**
                 * Gets the item name that will be used to display in the list.
                 *
                 * @param {Object} item
                 * @returns {string}
                 */
                scope.getItemName = function(item) {
                    var value = selectOptionsCtrl.parseItemValueFromSelection(item);
                    return scope.decorator ? scope.decorator(value, item) : value;
                };

                /**
                 * Gets the items that will be used as an options for the model.
                 *
                 * @returns {Object[]}
                 */
                scope.getItems = function() {
                    var items = ngModelCtrl.$viewValue;
                    if (items && !angular.isArray(items))
                        return [items];

                    return items;
                };
            }
        }
    }
]);
