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
    function () {

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
                    '<open-dropdown class="open-dropdown" for="' + selectTagsInputId + '" toggle-click="true" tabindex="13">' +
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
                                var broadcastedEvent = scope.$broadcast('select-items.select_active');

                                // if item was selected from the item list then we stop propagation to prevent
                                // tags input to add a new tag
                                if (broadcastedEvent.isItemSelected === true) {
                                    e.stopPropagation();
                                }
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
                }, true);

                // when new item selected in the select-items list we must update caret position in the
                // select-tags-input directive and also clear input of that
                scope.$on('select-items.item_selected', function(event, data) {
                    if (data.isNewSelection)
                        ++scope.caretPosition;
                    else if (scope.caretPosition > 0 && scope.caretPosition > data.index)
                        --scope.caretPosition;

                    scope.$broadcast('select-tags-input.clear_input');
                });

                // when user types a text into tags input box, we must filter our items in the select-items directive
                // to show only items that are matched what user typed
                scope.$on('select-tags-input.text_entered', function(event, text) {
                    scope.userInputText = text;
                });

            }
        };
    }
]);