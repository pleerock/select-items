'use strict';

/**
 *
 * @author Umed Khudoiberdiev
 */
angular.module('selectTagsInput').factory('SelectedTokensRegistry', function() {

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
