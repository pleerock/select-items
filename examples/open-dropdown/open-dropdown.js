'use strict';

/**
 * @author Umed Khudoiberdiev <info@zar.tj>
 */
angular.module('openDropdownExample', ['openDropdown']);

/**
 * @author Umed Khudoiberdiev <info@zar.tj>
 */
angular.module('openDropdownExample').controller('OpenDropdownCtrl', [
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

    }
]);
