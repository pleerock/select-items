'use strict';

/**
 * @author Umed Khudoiberdiev <info@zar.tj>
 */
angular.module('autoGrowInput', []);

/**
 *
 * @author Umed Khudoiberdiev <info@zar.tj>
 */
angular.module('autoGrowInput').directive('autoGrowInput', [
    function () {

        var KEY_BACKSPACE = 8;
        var KEY_DELETE = 46;

        // ---------------------------------------------------------------

        var css = function(element, name, value) {

            if (value) {
                element.style[name] = value;
            } else {
                var val;
                //for old IE
                if (typeof element.currentStyle !== 'undefined'){
                    val = element.currentStyle[name];
                }
                //for modern browsers
                else if (typeof window.getComputedStyle !== 'undefined'){
                    val = element.ownerDocument.defaultView
                        .getComputedStyle(element,null)[name];
                }
                else {
                    val = element.style[name];
                }
                return  (val === '') ? undefined : val;
            }
        };


        /**
         * Copies CSS properties from one element to another.
         *
         * @param {object} $from
         * @param {object} $to
         * @param {string[]|array} properties
         */
        var transferStyles = function ($from, $to, properties) {
            var i, n, styles = {};
            if (properties) {
                for (i = 0, n = properties.length; i < n; i++) {
                    styles[properties[i]] = css($from[0], properties[i]);
                }
            } else {
                styles = $from.css();
            }
            $to.css(styles);
        };

        var createInputStringMeasureContainer = function($parent) {

            var body = document.querySelector('body');
            var test = body.querySelector('#tokenInputStringMeasure');

            if (test)
                return angular.element(test);

            var $test = angular.element('<div id="tokenInputStringMeasure">');
            $test.css({
                position: 'absolute',
                top: '-99999px',
                left: '-99999px',
                width: 'auto',
                padding: 0,
                whiteSpace: 'pre'
            });
            angular.element(body).append($test);

            transferStyles($parent, $test, [
                'letterSpacing',
                'fontSize',
                'fontFamily',
                'fontWeight',
                'textTransform'
            ]);

            return $test;
        };

        /**
         * Measures the width of a string within a
         * parent element (in pixels).
         *
         * @param {string} str String to be measured
         * @param {object} $measureContainer jQuery/jqlite object
         * @returns {int}
         */
        var measureString = function (str, $measureContainer) {
            $measureContainer.text(str);
            var width = $measureContainer.prop('offsetWidth');
            $measureContainer.text('');
            return width;
        };

        /**
         * Determines the current selection within a text input control.
         * Returns an object containing:
         *   - start  Where selection started
         *   - length How many characters were selected
         *
         * @param {object} inputElement
         * @returns {{start: int, length: int}}
         */
        var getSelection = function (inputElement) {
            var selection = { start: 0, length: 0 };

            if ('selectionStart' in inputElement) {
                selection.start  = inputElement.selectionStart;
                selection.length = inputElement.selectionEnd - inputElement.selectionStart;

            } else if (document.selection) {
                inputElement.focus();
                var sel = document.selection.createRange();
                var selLen = document.selection.createRange().text.length;
                sel.moveStart('character', inputElement.value.length * -1);
                selection.start  = sel.text.length - selLen;
                selection.length = selLen;
            }

            return selection;
        };

        /**
         * Removes value based on the cursor position. If there is something selected then
         * this selected text will be removed, otherwise if no selection, but BACKSPACE key
         * has been pressed, then previous character will be removed, or if DELETE key has
         * been pressed when next character will be removed.
         *
         * @param {string} value The input value
         * @param {object} selection Current selection in the input
         * @param {int} pressedKeyCode Key that was pressed by a user
         * @returns {string}
         */
        var removeValueByCursorPosition = function(value, selection, pressedKeyCode) {

            if (selection.length) {
                return value.substring(0, selection.start) + value.substring(selection.start + selection.length);

            } else if (pressedKeyCode === KEY_BACKSPACE && selection.start) {
                return value.substring(0, selection.start - 1) + value.substring(selection.start + 1);

            } else if (pressedKeyCode === KEY_DELETE && typeof selection.start !== 'undefined') {
                return value.substring(0, selection.start) + value.substring(selection.start + 1);
            }

            return value;
        };

        /**
         * Checks if given key code is a-z, or A-Z, or 1-9 or space.
         *
         * @param {int} keyCode
         * @returns {boolean} True if key code in the [a-zA-Z0-9 ] range or not
         */
        var isPrintableKey = function(keyCode) {
            return ((keyCode >= 97 && keyCode <= 122) || // a-z
                    (keyCode >= 65 && keyCode <= 90)  || // A-Z
                    (keyCode >= 48 && keyCode <= 57)  || // 0-9
                     keyCode === 32 // space
                   );
        };

        /**
         * Checks if given key code is "removing key" (e.g. backspace or delete).
         *
         * @param keyCode
         * @returns {boolean}
         */
        var isRemovingKey = function(keyCode) {
            return keyCode === KEY_DELETE || keyCode === KEY_BACKSPACE;
        };

        /**
         * Processes a value after some key has been pressed by a user.
         *
         * @param {string} value
         * @param {{ start: int, length: int }} selection Position where user selected a text
         * @param {int} keyCode The code of the key that has been pressed
         * @param {boolean} shiftKey Indicates if shift key has been pressed or not
         * @returns {string}
         */
        var processValueAfterPressedKey = function(value, selection, keyCode, shiftKey) {

            if (isRemovingKey(keyCode))
                return removeValueByCursorPosition(value, selection, keyCode);

            if (isPrintableKey(keyCode)) {
                var character = String.fromCharCode(keyCode);
                character = shiftKey ? character.toUpperCase() : character.toLowerCase();
                return value + character;
            }

            return value;
        };


        /**
         * Recalculates input width when input's value changes.
         *
         * @param {object} [event]
         */
        var recalculateInputWidth = function (event) {
            if (event.metaKey || event.altKey) return;
            if (!event.target) throw 'No target input is specified in the event.';

            // get the value of the input
            var $input = angular.element(event.target);
            var value = $input.val();
            if (event.type && event.type.toLowerCase() === 'keydown') {
                var selection = getSelection($input);
                value = processValueAfterPressedKey(value, selection, event.keyCode, event.shiftKey);
            }

            // if there is NO value in the input, it means that in the input there can be
            // a placeholder value. and if placeholder is not empty then use its value to measure
            var placeholder = $input.attr('placeholder') || '';
            if (!value.length && placeholder.length > 0) {
                value = placeholder;
            }

            // finally measure input value's width and update input's width
            var $measureContainer = createInputStringMeasureContainer($input);
            var width = measureString(value, $measureContainer) + 4;
            $input.css('width', width + 'px');
            $input.triggerHandler('resize');
        };

        return {
            restrict: 'A',
            link: function (scope, element) {

                var $element = angular.element(element);
                $element.on('keydown keyup blur update', recalculateInputWidth);
            }
        };
    }
]);
