﻿'use strict';

(function (controllers, undefined) {

    /**
     * @ngdoc controller
     * @name Merchello.PropertyDialogs.MerchelloProductDialog
     * @function
     * 
     * @description
     * The controller for the selecting products on the Umbraco dialog flyout
     */
    controllers.MerchelloProductDialog = function ($scope, merchelloProductService, merchelloSettingsService, notificationsService) {

        $scope.selectedProduct = $scope.dialogData;

        $scope.filtertext = "";
        $scope.products = [];
        $scope.filteredproducts = [];
        $scope.watchCount = 0;
        $scope.sortProperty = "name";
        $scope.sortOrder = "Ascending";
        $scope.limitAmount = 5;
        $scope.currentPage = 0;
        $scope.maxPages = 0;
        
        //--------------------------------------------------------------------------------------
        // Initialization methods
        //--------------------------------------------------------------------------------------

        /**
         * @ngdoc method
         * @name loadProducts
         * @function
         * 
         * @description
         * Load the products from the product service, then wrap the results
         * in Merchello models and add to the scope via the products collection.
         */
        $scope.loadProducts = function () {

            var page = $scope.currentPage;
            var perPage = $scope.limitAmount;
            var sortBy = $scope.sortProperty.replace("-", "");
            var sortDirection = $scope.sortOrder;

            var listQuery = new merchello.Models.ListQuery({
                currentPage: page,
                itemsPerPage: perPage,
                sortBy: sortBy,
                sortDirection: sortDirection,
                parameters: [
                {
                    fieldName: 'term',
                    value: $scope.filtertext
                }]
            });

            var promise = merchelloProductService.searchProducts(listQuery);

            promise.then(function (response) {
                var queryResult = new merchello.Models.QueryResult(response);

                $scope.products = _.map(queryResult.items, function (productFromServer) {
                    return new merchello.Models.Product(productFromServer, true);
                });

                selectProduct($scope.products);

                $scope.maxPages = queryResult.totalPages;
                $scope.loaded = true;
                $scope.preValuesLoaded = true;

            }, function (reason) {

                notificationsService.success("Products Load Failed:", reason.message);

            });

        };



        /**
         * @ngdoc method
         * @name loadSettings
         * @function
         * 
         * @description
         * Load the settings from the settings service to get the currency symbol
         */
        $scope.loadSettings = function () {

            var currencySymbolPromise = merchelloSettingsService.getCurrencySymbol();
            currencySymbolPromise.then(function (currencySymbol) {
                $scope.currencySymbol = currencySymbol;

            }, function (reason) {
                notificationsService.error("Settings Load Failed", reason.message);
            });
        };

        /**
         * @ngdoc method
         * @name init
         * @function
         * 
         * @description
         * Method called on intial page load.  Loads in data from server and sets up scope.
         */
        $scope.init = function () {

            $scope.loadProducts();
            $scope.loadSettings();

        };

        $scope.init();



        //--------------------------------------------------------------------------------------
        // Events methods
        //--------------------------------------------------------------------------------------

        /**
         * @ngdoc method
         * @name limitChanged
         * @function
         * 
         * @description
         * Helper function to set the amount of items to show per page for the paging filters and calculations
         */
        $scope.limitChanged = function (newVal) {
            $scope.limitAmount = newVal;
        };

        /**
         * @ngdoc method
         * @name changeSortOrder
         * @function
         * 
         * @description
         * Helper function to set the current sort on the table and switch the 
         * direction if the property is already the current sort column.
         */
        $scope.changeSortOrder = function (propertyToSort) {

            if ($scope.sortProperty == propertyToSort) {
                if ($scope.sortOrder == "Ascending") {
                    $scope.sortProperty = "-" + propertyToSort;
                    $scope.sortOrder = "Descending";
                } else {
                    $scope.sortProperty = propertyToSort;
                    $scope.sortOrder = "Ascending";
                }
            } else {
                $scope.sortProperty = propertyToSort;
                $scope.sortOrder = "Ascending";
            }

        };

        /**
         * @ngdoc method
         * @name getFilteredProducts
         * @function
         * 
         * @description
         * Calls the product service to search for products via a string search 
         * param.  This searches the Examine index in the core.
         */
        $scope.getFilteredProducts = function (filter) {

            $scope.filtertext = filter;
            $scope.currentPage = 0;

            $scope.loadProducts();
        };


        //--------------------------------------------------------------------------------------
        // Helper methods
        //--------------------------------------------------------------------------------------
        

        /**
         * @ngdoc method
         * @name selectProduct
         * @function
         * 
         * @description
         * Helper to set the selected bool on a product if it is the currently selected product
         */
        function selectProduct(products) {
            for (var i = 0; i < products.length; i++) {
                if (products[i].key == $scope.selectedProduct.key) {
                    products[i].selected = true;
                } else {
                    products[i].selected = false;
                }
            }
        }



        //--------------------------------------------------------------------------------------
        // Calculations
        //--------------------------------------------------------------------------------------

        /**
         * @ngdoc method
         * @name numberOfPages
         * @function
         * 
         * @description
         * Helper function to get the amount of items to show per page for the paging
         */
        $scope.numberOfPages = function () {
            return $scope.maxPages;
            //return Math.ceil($scope.products.length / $scope.limitAmount);
        };


    };

    angular.module("umbraco").controller("Merchello.PropertyDialogs.MerchelloProductDialog", ['$scope', 'merchelloProductService', 'merchelloSettingsService', 'notificationsService', merchello.Controllers.MerchelloProductDialog]);


}(window.merchello.Controllers = window.merchello.Controllers || {}));
