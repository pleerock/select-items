'use strict';

/**
 * @author Umed Khudoiberdiev <info@zar.tj>
 */
angular.module('selectTagsExample', ['selectTags']);

/**
 * @author Umed Khudoiberdiev <info@zar.tj>
 */
angular.module('selectTagsExample').controller('SelectTagsCtrl', [
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

        $scope.selectedUsers = [$scope.users[0], $scope.users[1]];

    }
]);
