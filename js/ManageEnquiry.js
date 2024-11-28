app.controller('ManageEnquiryController', function($scope, $compile, $rootScope, $http, $localstorage, $ionicPopup, $state, $ionicLoading, $ionicScrollDelegate, $ionicModal) {
    $scope.init = function() {
        $rootScope.BackButton = true;
        $scope.ManageModel();
    };

    $scope.ManageModel = function() {
        $scope.model = {
            id: '',
            name: '',
            email: '',
            Message: '',
        }
        $scope.formsubmit = false;
        if ($scope.fromEnquiry) {
            $scope.fromEnquiry.$setPristine();
            $scope.fromEnquiry.$setUntouched();
        }
    }

    $scope.SendEnquiry = function(form) {
        if (form.$invalid) {
            $scope.formsubmit = true;
            return
        }
        $ionicLoading.show({ template: "Lodding..." });
        $http.post($rootScope.RoutePath + "enquiry/SendEnquiry",
            $scope.model
        ).then(function(data) {
            $ionicLoading.hide();
            if (data.data.success == true) {
                $ionicLoading.show({ template: data.data.message });
                setTimeout(function() {
                    $ionicLoading.hide()
                }, 1000);
                $scope.init();
            } else {
                if (data.data.data == 'TOKEN') {
                    $rootScope.logout();
                } else {
                    $ionicLoading.show({ template: data.data.message });
                    setTimeout(function() {
                        $ionicLoading.hide()
                    }, 1000);
                }
            }
        });
    }


    $scope.init();

})