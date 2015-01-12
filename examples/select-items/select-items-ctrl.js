'use strict';

/**
 * @author Umed Khudoiberdiev <info@zar.tj>
 */
angular.module('selectItemsExample', ['selectItems']);

angular.module('selectItemsExample').config(['selectItemsConfiguration', function(selectItemsConfiguration) {

    // uncomment this lines to see how global configuration of select-items works:
    // selectItemsConfiguration.searchPlaceholder = 'наберите чтобы искать';
    // selectItemsConfiguration.selectAllLabel = 'выбрать все';
    // selectItemsConfiguration.deselectAllLabel = 'убрать выделение';
    // selectItemsConfiguration.noSelectionLabel = 'ничего не выбрано';

}]);

/**
 * @author Umed Khudoiberdiev <info@zar.tj>
 */
angular.module('selectItemsExample').controller('SelectItemsCtrl', [
    '$scope',
    function ($scope) {

        /**
         * Array of data that will be used to show in the select.
         *
         * @type {{name: string}[]}
         */
        $scope.users = [
            {
                name: 'Galileo Galilei',
                email: 'galileo@example.com'
            },
            {
                name: 'Benjamin Franklin',
                email: 'franklin@example.com'
            },
            {
                name: 'Avicenna',
                email: 'avicenna@example.com'
            },
            {
                name: 'Albert Einstein',
                email: 'einstein@example.com'
            },
            {
                name: 'Alan Turing',
                email: 'turing@example.com'
            },
            {
                name: 'Thomas Alva Edison',
                email: 'edison@example.com'
            },
            {
                name: 'Nikola Tesla',
                email: 'tesla@example.com'
            }
        ];

        /**
         * Custom filter that can be applied to the data to restrict what
         * kind of data do we want to show to the user.
         *
         * This filter will filter out all users whose name doesn't start with 'A' latter.
         *
         * @param {{name: string}[]} users
         * @returns {{name: string}[]}
         */
        $scope.customFilter = function(users) {

            var allowedUsers = [];
            angular.forEach(users, function(user) {
                if (user.name.substr(0, 1) === 'A')
                    allowedUsers.push(user);
            });
            return allowedUsers;
        };

        /**
         * Custom decorator can be used to change the representation of the model items.
         *
         * @param {{name: string, email: string}} user
         * @returns {string}
         */
        $scope.decorator = function(user) {
            return '<b>' + user.name + '</b> (' + user.email + ')';
        };

    }
]);
