app.controller('CustomerPromotionEmailAndSMSController', function($scope, $rootScope, $http, $ionicPopup, $ionicLoading, $localstorage, $state) {
    $rootScope.BackButton = true;
    $scope.init = function() {
        $scope.initModel();
        $scope.GetAllCustomerGroup();
    }

    $scope.initModel = function() {
        $scope.model = {
            SMSText: '',
            EmailSubject: '',
            EmailText: '',
            idCustomerGroup: 'All'
        };
    }

    $scope.formsubmit = false;
    $scope.SendSMS = function(form, o) {
        if (form.$invalid) {
            $scope.formsubmit = true;
            return;
        }

        $scope.formsubmit = false;

        var params = {
            SMSText: $scope.model.SMSText,
            idGroup: $scope.model.idCustomerGroup == "All" ? '' : $scope.model.idCustomerGroup
        };
        $http.post($rootScope.RoutePath + "CustomerPromotionEmailAndSMS/SendPromotionSMS",
            params
        ).then(function(data) {
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

    $scope.formsubmit_email = false;
    $scope.SendEmail = function(form, o) {
        if (form.$invalid) {
            $scope.formsubmit_email = true;
            return;
        }

        if ($scope.model.idCustomerGroup == '') {
            var alertPopup = $ionicPopup.alert({
                title: '',
                template: 'Select Customer Group',
                cssClass: 'custPop',
                okText: 'Ok',
                okType: 'btn btn-green',
            });
            return;
        }

        $scope.formsubmit_email = false;

        var params = {
            EmailSubject: $scope.model.EmailSubject,
            EmailText: $scope.model.EmailText,
            idGroup: $scope.model.idCustomerGroup == "All" ? '' : $scope.model.idCustomerGroup
        };

        $ionicLoading.show({ template: "Wait... Email are sending..." });
        $http.post($rootScope.RoutePath + "CustomerPromotionEmailAndSMS/SendPromotionEmail",
            params
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

    $scope.GetAllCustomerGroup = function() {
        $http.get($rootScope.RoutePath + 'customergroup/GetAllCustomergroup').then(function(res) {
            $scope.lstCustomerGroup = res.data.data;
        });
    };
    $scope.init();
})