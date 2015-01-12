'use strict';

/**
 * @author Umed Khudoiberdiev <info@zar.tj>
 */
angular.module('selectTags', ['autoGrowInput', 'selectItems', 'openDropdown']);

/**
 *
 * @author Umed Khudoiberdiev <info@zar.tj>
 */
angular.module('selectTags').directive('selectTags', [
    '$timeout',
    function ($timeout) {

        var guid = function() {
            function s4() {
                return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
            }
            return s4() + '_' + s4() + '_' + s4();
        };

        return {
            scope: true,
            restrict: 'E',
            template: function(element, attrs) {
                var selectTagsInputId = 'select_tags_' + guid();
                return '<div class="select-tags" tabindex="1">' +
                    '<select-tags-input id="' + selectTagsInputId + '" tabindex="12"' +
                                        'class="select-tags-input"' +
                                        'ng-class="{\'opened\': isOpened, \'closed\': !isOpened}"' +
                                        'placeholder="' + (attrs.placeholder ? attrs.placeholder : '') + '"' +
                                        'ng-model="' + attrs.ngModel + '"' +
                                        'select-options="' + attrs.selectOptions + '"' +
                                        'caret-position="caretPosition"' +
                                        '></select-tags-input>' +
                    '<open-dropdown class="open-dropdown" for="' + selectTagsInputId + '" toggle-click="false" tabindex="13">' +
                       '<select-items ' +
                             'select-options="' + attrs.selectOptions + '"'  +
                             'ng-model="' + attrs.ngModel + '"'  +
                             'select-all="' + (attrs.dropdownSelectAll ? attrs.dropdownSelectAll : '') + '"'  +
                             'auto-select="' + (attrs.dropdownAutoSelect ? attrs.dropdownAutoSelect : '') + '"'  +
                             'multiselect="true"' +
                             'search="false"' +
                             'model-insert-position="caretPosition"' +
                             'number-of-displayed-items="numberOfDisplayedItems"' +
                             'search-keyword="userInputText"' +
                             'key-input-listen-for="' + selectTagsInputId + '">' +
                        '</select-items>'  +
                    '</open-dropdown>'  +
                '</div>';
            },
            link: function(scope, element) {

                // ---------------------------------------------------------------------
                // Scope variables
                // ---------------------------------------------------------------------

                /**
                 * Text that current user entered in the input box.
                 * Used for select-items to filter its items by this search keyword.
                 *
                 * @type {string}
                 */
                scope.userInputText = '';

                /**
                 * Indicates if dropdown is opened or not.
                 *
                 * @type {boolean}
                 */
                scope.isOpened = false;

                /**
                 * Controlled caret position of the tag input.
                 *
                 * @type {number}
                 */
                scope.caretPosition = 0;

                scope.numberOfDisplayedItems = 0;

                // ---------------------------------------------------------------------
                // Variables
                // ---------------------------------------------------------------------

                var selectTagsInput;
                var getSelectTagsInput = function() {
                    if (!selectTagsInput)
                        selectTagsInput = element[0].getElementsByClassName('select-tags-input')[0].querySelector('input');

                    return selectTagsInput;
                };

                // ---------------------------------------------------------------------
                // Event Listeners
                // ---------------------------------------------------------------------

                // Listen to key downs to control drop down open state.
                element[0].addEventListener('keydown', function(e) {
                    switch (e.keyCode) {

                        case 38: // KEY "UP"
                            e.preventDefault();
                            scope.isOpened = true;
                            getSelectTagsInput().focus();
                            scope.$broadcast('select-items.active_next');
                            scope.$digest();
                            return;

                        case 40: // KEY "DOWN"
                            e.preventDefault();
                            scope.isOpened = true;
                            scope.$broadcast('select-items.active_previous');
                            scope.$digest();
                            getSelectTagsInput().focus();
                            return;

                        case 13: // KEY "ENTER"
                            if (scope.isOpened) {
                                scope.$broadcast('select-items.select_active');
                                scope.$digest();
                            }
                            return;

                        case 27: // KEY "ESC"
                            scope.isOpened = false;
                            scope.$emit('select-items.selection_canceled');
                            scope.$digest();
                            return;

                        default:
                            return;
                    }
                });

                scope.$on('select-items.item_selected', function(event, data) {
                    if (data.isNewSelection)
                        ++scope.caretPosition;
                    else if (scope.caretPosition > 0 && scope.caretPosition > data.index)
                        --scope.caretPosition;

                    /**
                     * When item is selected we move focus back to select-items-box and hide dropdown if its not multiselect typed.
                     * This needs to be run in a timeout, because input gets focus and doing its own operations, after
                     * that he calls digest and it fails because at this point digest already in progress.
                     */
                    $timeout(function() {
                        getSelectTagsInput().focus();
                    });
                });

                // when user types a text into the input box, we must filter our items in the select-items directive
                // to show only items that are
                scope.$on('select-tags-input.text_entered', function(event, text) {
                    scope.userInputText = text;
                });

            }
        };
    }
]);