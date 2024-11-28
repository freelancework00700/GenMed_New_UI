app.controller('ReferenceLevelController', function ($scope, $rootScope, $http, $localstorage) {
    $rootScope.BackButton = true;
    $scope.init = function () {
        ManageRole();
    };

    function ManageRole() {
        var CustomerUser = _.filter(JSON.parse($localstorage.get('UserRoles')), function (Role) {
            return Role == "Customer";
        })
        $scope.IsCustomer = CustomerUser.length && CustomerUser.length > 0 ? true : false;

        if ($scope.IsCustomer) {
            $scope.GetCustomerId();
        } else {
            $scope.lstTree = null;
        }
    }

    $scope.GetCustomerId = function () {
        $http.get($rootScope.RoutePath + 'customer/GetCustomerByEmailAddress?EmailAddress=' + $localstorage.get('EmailAddress')).then(function (res) {
            $scope.Customer = res.data.data;
            $scope.GetReferenceLevelTreeByReferenceId();
        });
    }

    $scope.GetReferenceLevelTreeByReferenceId = function () {
        $http.get($rootScope.RoutePath + 'customer/GetReferenceLevelTreeByReferenceId?id=' + $scope.Customer.id).then(function (res) {
            $scope.lstTree = res.data.data;
            if ($scope.lstTree) {
                treeCreater($scope.lstTree, 'treeRoot')
            }
        });
    };

    $scope.init();

})