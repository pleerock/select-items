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
            restrict: 'E',
            template: function(element, attrs) {
                var selectBoxId = 'select_dropdown' + guid();
                return '<div class="select-dropdown" tabindex="1">' +
                    '<select-items-box id="' + selectBoxId + '" tabindex="2"' +
                                        'class="select-items-box"' +
                                        'ng-class="{\'opened\': ' + selectBoxId + ', \'closed\': !' + selectBoxId + '}"' +
                                        'nothing-selected-text="' + (attrs.nothingSelectedText ? attrs.nothingSelectedText : '') + '"' +
                                        'decorator="' + (attrs.showDecorator ? attrs.showDecorator : '') + '"' +
                                        'separator="' + (attrs.showSeparator ? attrs.showSeparator : '') + '"' +
                                        'show-limit="' + (attrs.showLimit ? attrs.showLimit : '') + '"' +
                                        '></select-items-box>' +
                    '<open-dropdown class="open-dropdown" for="' + selectBoxId + '" toggle-click="true" tabindex="3" is-opened="' + selectBoxId + '">' +
                       '<select-items class="select-items"' +
                             'select-options="' + attrs.selectOptions + '"'  +
                             'decorator="decorator"'  +
                             'ng-model="' + attrs.ngModel + '"'  +
                             'search="false"'  +
                             'select-all="' + (attrs.dropdownSelectAll ? attrs.dropdownSelectAll : '') + '"'  +
                             'auto-select="' + (attrs.dropdownAutoSelect ? attrs.dropdownAutoSelect : '') + '"'  +
                             'multiselect="' + (attrs.multiselect ? attrs.multiselect : '') + '"' +
                             'key-input-listen-for="' + selectBoxId + '">' +
                        '</select-items>'  +
                    '</open-dropdown>'  +
                '</div>';
            },
            link: function(scope, element) {

                // ---------------------------------------------------------------------
                // Variables
                // ---------------------------------------------------------------------

                var selectItemsBox = element[0].getElementsByClassName('select-items-box')[0];

                /**
                 * Indicates if dropdown is opened or not.
                 *
                 * @type {boolean}
                 */
                scope[selectItemsBox.id] = false;

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
                            scope[selectItemsBox.id] = true;
                            scope.$apply();
                            selectItemsBox.focus();
                            return;

                        case 40: // KEY "DOWN"
                            e.preventDefault();
                            scope[selectItemsBox.id] = true;
                            scope.$apply();
                            selectItemsBox.focus();
                            return;

                        case 27: // KEY "ESC"
                            scope[selectItemsBox.id] = false;
                            scope.$apply();
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
                    selectItemsBox.focus();
                    if (object && !object.isMultiselect)
                        scope[selectItemsBox.id] = false;
                };

                /**
                 * When user escapes dropdown (selection canceled) we move focus out of select-items-box to the element
                 */
                var onSelectionCanceled = function() {
                    if (selectItemsBox) {
                        selectItemsBox.blur();
                        element[0].focus();
                    }
                };

                // ---------------------------------------------------------------------
                // Event Listeners
                // ---------------------------------------------------------------------

                element[0].addEventListener('keydown', onSelectDropdownKeydown);
                scope.$on('select-items.item_selected', onItemSelected);
                scope.$on('select-items.selection_canceled', onSelectionCanceled);

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
            replace: true,
            restrict: 'E',
            require: ['^ngModel', '^selectOptions'],
            template: '<div class="select-items-box"><div class="arrow-container"><div class="arrow"></div></div><div class="text-items">' +
                    '<span ng-repeat="item in getItems()">' +
                        '<span ng-hide="showLimit && $index >= showLimit" ng-bind-html="getItemName(item)"></span>' +
                        '<span ng-hide="$last || (showLimit && $index >= showLimit)">{{ separator }}</span>' +
                        '<span ng-show="showLimit && $index === showLimit">...</span>' +
                    '</span>' +
                    '<div ng-show="!getItems() || !getItems().length">{{ nothingSelectedText }}</div>' +
                '</div>' +
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
