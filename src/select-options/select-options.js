'use strict';

/**
 * This module represents a select-options directive that allows us to use a custom expression
 * for the components that needs model and list of options. This directive works like a ng-options.
 *
 * todo: this class needs refactoring
 * todo: this class needs better documentation
 * todo: this class needs better to be tested better and check for bugs
 *
 * @author Umed Khudoiberdiev <info@zar.tj>
 */
angular.module('selectOptions', []).directive('selectOptions', [
    '$parse',
    function ($parse) {

        var regexp = (/^\s*([\s\S]+?)(?:\s+as\s+([\s\S]+?))?\s+for\s+(?:([\$\w][\$\w]*)|(?:\(\s*([\$\w][\$\w]*)\s*,\s*([\$\w][\$\w]*)\s*\)))\s+in\s+([\s\S]+?)(?:\s+track\s+by\s+([\s\S]+?))?(?:\s+order\s+by\s+([\s\S]+?))?$/);

        var replaceItemPrefix = function(replacement, string) {
            if (!string || !replacement) return string;
            replacement = replacement + '.';

            if (string.substr(0, replacement.length) === replacement)
                return string.substr(replacement.length);

            return string;
        };

        var replacePrefixes = function(string) {
            if (!string) return string;
            var lastDot = string.lastIndexOf('.');
            return lastDot !== -1 ? string.substring(lastDot + 1) : string;
        };

        return {
            restrict: 'A',
            controller: ['$scope', '$attrs', function ($scope, $attrs) {

                if (!$attrs.selectOptions)
                    throw 'No options has been specified';

                var match = $attrs.selectOptions.match(regexp);
                if (!match)
                    throw 'Expected expression in form of "_select_ (as _label_)? for (_key_,)?_value_ in _collection_", but given ' + $attrs.selectOptions;

                this.setVirtualOptions = function (){
                    // todo
                };

                this.getItemNameWithoutPrefixes = function() {
                    return replacePrefixes(this.getItemName());
                };

                this.getItemName = function() {
                    return match[2] || match[1];
                };

                this.getItemValue = function() {
                    return match[2] ? match[1] : this.getItem();
                };

                this.getItem = function() {
                    return match[3] || match[5];
                };

                this.getItems = function() {
                    return match[6];
                };

                this.getKey = function() {
                    return match[4];
                };

                this.getOrderBy = function() {
                    var orderBy = match[8];
                    return replaceItemPrefix(this.getItem(), orderBy);
                };

                this.getTrackBy = function() {
                    var trackBy = match[7];
                    return replacePrefixes(trackBy);
                };

                /**
                 * @param object
                 * @returns {string}
                 */
                this.parseItemName = function(object) {
                    var locals = {};
                    locals[this.getItem()] = object;
                    var name = $parse(this.getItemName())($scope, locals);
                    return String(name).replace(/<[^>]+>/gm, ''); // strip html from the data here
                };

                /**
                 * @param object
                 * @returns {string}
                 */
                this.parseItemValueFromSelection = function(object) {
                    var newItemValue = this.getItemValue().replace('.', '_');
                    var newItemName  = this.getItemName().replace(this.getItemValue(), newItemValue);
                    var locals = {};
                    locals[newItemValue] = object;
                    var name = $parse(newItemName)($scope, locals);
                    return String(name).replace(/<[^>]+>/gm, ''); // strip html from the data here
                };

                /**
                 * @param object
                 * @returns {*}
                 */
                this.parseItemValue = function(object) {
                    var locals = {};
                    locals[this.getItem()] = object;
                    return $parse(this.getItemValue())($scope, locals);
                };

                /**
                 * @param object
                 * @returns {*}
                 */
                this.parseTrackBy = function(object) {
                    var locals = {};
                    locals[this.getItem()] = object;
                    return $parse(match[7])($scope, locals);
                };

                /**
                 * @returns {*}
                 */
                this.parseItems = function() {
                    return $parse(this.getItems())($scope);
                };

                /**
                 * Logs all parsed data.
                 */
                this.log = function() {
                    console.log('item name: ' + this.getItemName());
                    console.log('item value: ' + this.getItemValue());
                    console.log('key: ' + this.getKey());
                    console.log('item: ' + this.getItem());
                    console.log('items: ' + this.getItems());
                    console.log('orderBy: ' + this.getOrderBy());
                    console.log('trackBy (full): ' + match[7]);
                    console.log('trackBy: ' + this.getTrackBy());
                };

            }]
        };
    }
]);
