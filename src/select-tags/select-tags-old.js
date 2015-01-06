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
            replace: true,
            restrict: 'E',
            template: function(element, attrs) {
                var selectTagsInputId = 'select_tags_' + guid();
                return '<div class="select-tags" tabindex="1">' +
                    '<select-tags-input id="' + selectTagsInputId + '" tabindex="12"' +
                                        'class="select-tags-input"' +
                                        'ng-class="{\'opened\': ' + selectTagsInputId + ', \'closed\': !' + selectTagsInputId + '}"' +
                                        'placeholder="' + (attrs.placeholder ? attrs.placeholder : '') + '"' +
                                        'ng-model="' + attrs.ngModel + '"' +
                                        'select-options="' + attrs.selectOptions + '"' +
                                        '></select-tags-input>' +
                    '<open-dropdown class="open-dropdown" for="' + selectTagsInputId + '" toggle-click="true" tabindex="13" is-opened="' + selectTagsInputId + '">' +
                       '<select-items class="select-items"' +
                             'select-options="' + attrs.selectOptions + '"'  +
                             'ng-model="' + attrs.ngModel + '"'  +
                             'select-all="' + (attrs.dropdownSelectAll ? attrs.dropdownSelectAll : '') + '"'  +
                             'auto-select="' + (attrs.dropdownAutoSelect ? attrs.dropdownAutoSelect : '') + '"'  +
                             'multiselect="true"' +
                             'key-input-listen-for="' + selectTagsInputId + '">' +
                        '</select-items>'  +
                    '</open-dropdown>'  +
                '</div>';
            },
            link: function(scope, element) {

                // ---------------------------------------------------------------------
                // Variables
                // ---------------------------------------------------------------------

                var selectTagsInput = element[0].getElementsByClassName('select-tags-input')[0];

                /**
                 * Indicates if dropdown is opened or not.
                 *
                 * @type {boolean}
                 */
                scope[selectTagsInput.id] = false;

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
                            scope[selectTagsInput.id] = true;
                            scope.$apply();
                            selectTagsInput.focus();
                            return;

                        case 40: // KEY "DOWN"
                            e.preventDefault();
                            scope[selectTagsInput.id] = true;
                            scope.$apply();
                            selectTagsInput.focus();
                            return;

                        case 27: // KEY "ESC"
                            scope[selectTagsInput.id] = false;
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
                    var input = selectTagsInput.querySelector('input');
                    input.focus();
                };

                /**
                 * When user escapes dropdown (selection canceled) we move focus out of select-items-box to the element
                 */
                var onSelectionCanceled = function() {
                    if (selectTagsInput) {
                        selectTagsInput.blur();
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
angular.module('selectTags').directive('selectTagsInput', [
    '$timeout', '$parse', 'SelectedTokensRegistry', 'ArrayNgModelHelper', '$http',
    function ($timeout, $parse, SelectedTokensRegistry, ArrayNgModelHelper, $http) {

        return {
            scope: {
                //filters: '='
                decorator: '=?',
                loadPromise: '=?',
                minQueryLengthToLoad: '@'
            },
            replace: true,
            restrict: 'E',
            require: ['ngModel', 'selectOptions'],
            templateUrl: /*component/commons/token-input/*/'../../src/select-tags/token-input.html',
            link: function (scope, element, attrs, controllers) {

                // ---------------------------------------------------------------------
                // Local variables
                // ---------------------------------------------------------------------

                var ngModelCtrl               = controllers[0];
                var selectOptionsCtrl         = controllers[1];

                var caretPosition       = 0;
                var loadTimeoutPromise  = null;
                var selectedTokens  = new SelectedTokensRegistry();
                var ngModelHelper   = new ArrayNgModelHelper(ngModelCtrl, selectOptionsCtrl);

                ngModelHelper.onChange(scope, function(value) {
                    if (value.length)
                        caretPosition = value.length;
                });

                // ---------------------------------------------------------------------
                // Local variables
                // ---------------------------------------------------------------------

                var input           = element[0].querySelector('input');
                var container       = element[0].querySelector('.token-input-container');
                scope.container     = container;

                if (scope.minQueryLengthToLoad)
                    scope.minQueryLengthToLoad = parseInt(attrs.minQueryLengthToLoad);




                var tokenInputOptions = {

                    persist: true, // todo

                    loadPromise: function(value) {
                        return $http('http://backend.yakdu.dev/web/app_dev.php/person/search', 'GET', {params: {name: value}});
                    },
                    listItemsLimit: 3,
                    loadDelay: 500,

                    listItems: [{ name: 'Umed', second_name: 'Khudoiberdiev' }, { name: 'Zuma', second_name: 'Khudoiberdieva' }, { name: 'Maya', second_name: 'Klichova' }, { name: 'Mama' }],
                    filterCallback: function(items, inputValue) {
                        return items;
                    },

                    minLength: 2,
                    maxLength: 20,
                    maxItems: 5,
                    // minItems: 1, //todo

                    delimiters: [','],

                    tokenItemTemplate: 'item[nameField]',
                    filterItemTemplate: 'item[nameField] | highlight_word: inputValue',

                    isRemoveButton: true,
                    isOrderField: true,
                    isRestoreOnBackspace: true,
                    orderStartFrom: 0,

                    nameField: 'name',
                    checkForUniqueField: 'name',
                    orderField: 'order',

                    /**
                     * Creates a new model item from the given input value.
                     *
                     * @param {string} value
                     * @returns {object}
                     */
                    createItem: function(value) {
                        var item = {};
                        item[selectOptionsCtrl.getItemNameWithoutPrefixes()] = value;
                        return item;
                    },

                    /**
                     * Determines if value is not unique and cannot be added to
                     * the model array.
                     *
                     * @param {object} item
                     * @returns {boolean}
                     */
                    isUnique: function(item) {

                        var self   = this;
                        var found  = false;
                        var tokens = ngModelHelper.getAll();

                        angular.forEach(tokens, function(token) {
                            var tokenName = token[self.checkForUniqueField];
                            if (tokenName && tokenName.toLowerCase() === item[self.nameField].toLowerCase())
                                found = true;
                        });

                        return found === false;
                    },

                    isNotShort: function(item) {
                        return item[this.nameField].length >= this.minLength;
                    },

                    isNotLong: function(item) {
                        return item[this.nameField].length <= this.maxLength;
                    },

                    isNotMaxAllowed: function() {
                        return ngModelHelper.count() < this.maxItems;
                    },

                    /**
                     * Determines if value can be added to the model array or not.
                     *
                     * @param {object} item
                     * @returns {boolean}
                     */
                    canItemBeAdded: function(item) {
                        return  this.isUnique(item) &&
                        this.isNotShort(item) &&
                        this.isNotLong(item) &&
                        this.isNotMaxAllowed();
                    }
                };

                // ---------------------------------------------------------------------
                // Scope variables
                // ---------------------------------------------------------------------

                //scope.filterCallback    = tokenInputOptions.filterCallback;
                scope.tokenInputValue   = '';
                scope.nameField         = tokenInputOptions.nameField;
                scope.listItems         = tokenInputOptions.listItems;
                scope.listItemsLimit    = tokenInputOptions.listItemsLimit;
                scope.tokenNameField    = tokenInputOptions.nameField;
                scope.isRemoveButton    = tokenInputOptions.isRemoveButton;
                scope.tokenItemTemplate = tokenInputOptions.tokenItemTemplate;
                scope.filterItemTemplate = tokenInputOptions.filterItemTemplate;
                scope.placeholder       = element[0].getAttribute('placeholder');
                scope.isDisabled        = false;

                // ---------------------------------------------------------------------
                // Local functions
                // ---------------------------------------------------------------------

                var reOrderTokens = function() {
                    var tokens = ngModelHelper.getAll();
                    angular.forEach(tokens, function(token, index) {
                        if (tokenInputOptions.isOrderField)
                            token[tokenInputOptions.orderField] = tokenInputOptions.orderStartFrom + index;
                    });
                };

                /**
                 * Moves input to the given position in the tokens container.
                 *
                 * @param {int} caretPosition
                 */
                var moveInputToPosition = function(caretPosition) {
                    var containerElements = angular.element(container).children();
                    if (!containerElements[caretPosition]) return;
                    containerElements[caretPosition].insertBefore(input, containerElements[caretPosition].firstChild);
                };

                /**
                 * Moves input to the end of the tokens stack.
                 */
                var moveInputToEnd = function() {
                    moveInputToPosition(ngModelHelper.count());
                };

                /**
                 * Moves the caret position to the end of the tokens stack.
                 */
                var caretToEnd = function() {
                    caretPosition = ngModelHelper.count();
                };

                /**
                 * Adds a new item to the model at the current cursor position. New item's value
                 * got from the input. After adding a new item, input cleared.
                 */
                var addNewValueFromInput = function() {
                    var item = tokenInputOptions.createItem(scope.tokenInputValue.trim());
                    if (!item || tokenInputOptions.canItemBeAdded(item) === false) return;

                    ngModelHelper.add(item, caretPosition);
                    caretPosition++;
                    reOrderTokens();

                    scope.tokenInputValue = ''; // restore input value
                    input.value = '';
                    input.dispatchEvent(new CustomEvent('update'));
                };

                var addNewValueFromItems = function() {
                    if (!scope.selectedItem && tokenInputOptions.canItemBeAdded(scope.selectedItem) !== false) return null;

                    ngModelHelper.add(scope.selectedItem, caretPosition);
                    caretPosition++;
                    reOrderTokens();

                    scope.selectedItem = '';
                    scope.tokenInputValue = ''; // restore input value
                    input.value = '';
                    input.dispatchEvent(new CustomEvent('update'));
                };

                /**
                 * Move input to the left in the tokens container.
                 */
                var moveInputToLeft = function() {
                    if (scope.tokenInputValue || caretPosition <= 0) return;

                    caretPosition--;
                    moveInputToPosition(caretPosition);
                    input.focus();
                };

                /**
                 * Move input to the right in the tokens container.
                 */
                var moveInputToRight = function() {
                    if (scope.tokenInputValue || caretPosition >= ngModelHelper.count()) return;
                    caretPosition++;

                    moveInputToPosition(caretPosition);
                    input.focus();
                };

                /**
                 * Removes all selected tokens from the model.
                 */
                var removeSelectedTokens = function() {
                    if (scope.tokenInputValue || ngModelHelper.count() === 0) return;

                    moveInputToEnd();
                    ngModelHelper.removeAll(selectedTokens.getAll());
                    input.dispatchEvent(new CustomEvent('update'));
                    reOrderTokens();
                    caretToEnd();
                    selectedTokens.clear();
                    input.focus();
                };

                /**
                 * Removes previous to the current caret position token from the model.
                 */
                var removePreviousToken = function() {
                    if (scope.tokenInputValue || ngModelHelper.count() === 0 || caretPosition <= 0) return;

                    --caretPosition;

                    if (tokenInputOptions.isRestoreOnBackspace) {
                        var removedToken = ngModelHelper.get(caretPosition);
                        scope.tokenInputValue = removedToken[tokenInputOptions.nameField] + ' ';
                        input.value = scope.tokenInputValue;
                    }

                    ngModelHelper.removeAt(caretPosition);
                    input.dispatchEvent(new CustomEvent('update'));
                    reOrderTokens();
                };

                /**
                 * Removes the next to the current caret position token from the model.
                 */
                var removeNextToken = function() {
                    if (scope.tokenInputValue || ngModelHelper.count() === 0) return;

                    moveInputToPosition(caretPosition + 1);
                    ngModelHelper.removeAt(caretPosition);
                    input.dispatchEvent(new CustomEvent('update'));
                    reOrderTokens();
                    input.focus();
                };

                /**
                 * Loads items (usually from the remote server)
                 *
                 * @param {*} value Value to be sent to the promise object.
                 */
                var loadItems = function(value) {
                    if (!scope.loadPromise) return;

                    scope.loadingInProgress = true;
                    scope.loadPromise(value).then(function(response) {
                        scope.listItems = response.data;
                        scope.loadingInProgress = false;
                    }, function(error) {
                        scope.loadingInProgress = false;
                        throw error;
                    });
                };

                // ---------------------------------------------------------------------
                // Scope functions
                // ---------------------------------------------------------------------

                /**
                 * Gets all tokens that inside in the ng-model.
                 *
                 * @returns {object[]}
                 */
                scope.getItems = function() {
                    return ngModelCtrl.$modelValue || [];
                };

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
                 * Called when input value changes. If loading promise given then we load the new options
                 * from the server.
                 */
                scope.onInputValueChange = function(value) {
                    input.dispatchEvent(new CustomEvent('update'));

                    if (scope.loadPromise && value && value.length >= scope.minQueryLengthToLoad) {
                        if (loadTimeoutPromise !== null)
                            $timeout.cancel(loadTimeoutPromise);

                        loadTimeoutPromise = $timeout(function() { loadItems(value); }, scope.loadDelay);
                    }
                };

                /**
                 * Checks if given token is in the list of selected tokens.
                 *
                 * @param {object} token
                 * @returns {boolean} True if token is selected, false otherwise
                 */
                scope.isSelected = function(token) {
                    return selectedTokens.has(token);
                };

                /**
                 * When click is performed on a token - we "select" it, and remove
                 * select effect from all other tokens if shift key was not pressed.
                 *
                 * @param {MouseEvent} event
                 * @param {object} selectedToken
                 */
                scope.tokenClick = function(event, selectedToken) {
                    event.stopPropagation();

                    if (!event.altKey && !event.ctrlKey && !event.shiftKey) {
                        selectedTokens.clear();
                        selectedTokens.add(selectedToken);
                    } else {
                        selectedTokens.toggle(selectedToken);
                    }

                    moveInputToEnd();
                    caretToEnd();
                };

                /**
                 * Removes a token from the ng-model by a given token index.
                 *
                 * @param {MouseEvent} event
                 * @param {int} index
                 */
                scope.tokenRemove = function(event, index) {
                    event.stopPropagation();

                    moveInputToEnd();
                    ngModelHelper.removeAt(index);
                    caretToEnd();
                    selectedTokens.clear();
                    input.blur();
                };

                // ---------------------------------------------------------------------
                // DOM manipulation
                // ---------------------------------------------------------------------

                // fit the container max width to its original width
                scope.containerWidth = container.offsetWidth;

                // when user clicks on the container it must automatically activate its input
                container.addEventListener('click', function () {
                    input.focus();
                });

                // close dropdown, reset caret and other things if use clicks outside of this directive
                // todo
                /*document.addEventListener('mousedown', function() {
                    if (element[0].contains(event.target)) return;

                    selectedTokens.clear();
                    moveInputToEnd();
                    caretToEnd();
                    scope.$apply();
                });*/

                // clear all selection when input got a focus
                // todo
                /*input.addEventListener('focus', function() {
                    selectedTokens.clear();

                    if (!scope.$$phase)
                        scope.$apply();
                });*/

                // when specific delimiter character pressed then add new a element
                container.addEventListener('keypress', function (e) {

                    var char = String.fromCharCode(e.charCode);
                    if (char && tokenInputOptions.delimiters.indexOf(char) !== -1) {
                        e.preventDefault();
                        addNewValueFromInput();
                        scope.$apply();
                    }
                });

                // listen to key downs on the container to make control operations
                container.addEventListener('keydown', function (e) {
                    switch (e.keyCode) {

                        case 65: // KEY "A"
                            if ((e.ctrlKey || e.metaKey) && !scope.tokenInputValue) { // select all tokens
                                selectedTokens.addAll(ngModelHelper.getAll());
                                scope.$apply();
                            }
                            return;

                        //todo: case 9: // KEY "TAB"
                        case 13: // KEY "RETURN"
                            /*if (scope.selectedItem)
                                addNewValueFromItems();
                            else*/
                                addNewValueFromInput();

                            scope.$apply();
                            return;

                        case 37: // KEY "LEFT"
                            moveInputToLeft();
                            return;

                        case 39: // KEY "RIGHT"
                            moveInputToRight();
                            return;

                        case 8: // KEY "BACKSPACE"
                            selectedTokens.hasAny() ? removeSelectedTokens() : removePreviousToken();
                            scope.$apply();
                            return;

                        case 46: // KEY "DELETE"
                            selectedTokens.hasAny() ? removeSelectedTokens() : removeNextToken();
                            scope.$apply();
                            return;
                    }
                });

                // ---------------------------------------------------------------------
                // Event listeners
                // ---------------------------------------------------------------------

                scope.$on('$destroy', function() {
                    if (loadTimeoutPromise)
                        $timeout.cancel(loadTimeoutPromise);
                });

            }
        }
    }
]);


/**
 *
 * @author Umed Khudoiberdiev
 */
angular.module('selectTags').factory('SelectedTokensRegistry', function() {

        /**
         * @class SelectedTokensRegistry
         */
        return function() {
            var selectedTokens = [];

            this.getAll = function() {
                return selectedTokens;
            };

            this.hasAny = function() {
                return selectedTokens.length !== 0;
            };

            this.has = function(token) {
                return selectedTokens.indexOf(token) !== -1;
            };

            this.add = function(token) {
                selectedTokens.push(token);
            };

            this.addAll = function(tokens) {
                angular.forEach(tokens, function(token) {
                    selectedTokens.push(token);
                });
            };

            this.remove = function(token) {
                var index = selectedTokens.indexOf(token);
                if (index !== -1)
                    selectedTokens.splice(index, 1);
            };

            this.toggle = function(token) {
                if (this.has(token)) {
                    this.remove(token);
                } else {
                    this.add(token);
                }
            };

            this.clear = function() {
                selectedTokens = [];
            };

        };
    }
);


/**
 *
 * @author Umed Khudoiberdiev
 */
angular.module('selectTags').factory('ArrayNgModelHelper', function() {

    /**
     * @class SelectedTokensRegistry
     */
    return function(ngModelCtrl, selectOptionsCtrl) {
        var self = this;

        self.onChange = function(scope, callback) {
            scope.$watch(function () {
                return ngModelCtrl.$modelValue;
            }, callback);

        };

        self.getAll = function() {
            return ngModelCtrl.$modelValue || [];
        };

        self.get = function(index) {
            var model = self.getAll();
            return model[index];
        };

        self.has = function(item) {
            var model = self.getAll();
            return model.indexOf(item) !== -1;
        };

        self.set = function(model) {
            ngModelCtrl.$setViewValue(model);
        };

        self.add = function(item, index) {
            var model = self.getAll();
            model.splice(index, 0, item);
            ngModelCtrl.$setViewValue(model);
        };

        self.remove = function(item) {
            var model = self.getAll();
            var index = model.indexOf(item);
            if (index !== -1)
                model.splice(index, 1);
            ngModelCtrl.$setViewValue(model);
        };

        self.removeAt = function(index) {
            var model = self.getAll();
            model.splice(index, 1);
            ngModelCtrl.$setViewValue(model);
        };

        self.removeAll = function(items) {
            var model = self.getAll();

            angular.forEach(items, function(item) {
                var index = model.indexOf(item);
                if (index !== -1)
                    model.splice(index, 1);
            });

            ngModelCtrl.$setViewValue(model);
        };

        self.count = function() {
            return self.getAll().length;
        };

    };
});