app.controller('LoginCtrl', function ($scope, $rootScope, $ionicHistory, $localstorage, $ionicPopup, $state, $ionicSideMenuDelegate, $http, $localstorage, $ionicLoading, $timeout, $window) {

    $ionicSideMenuDelegate.canDragContent(false);
    $scope.init = function () {
        $scope.ResetLoginAllModel();
        $scope.IsLoginForm = 0;
        $scope.checkIsLogin();
    }

    $scope.ResetLoginAllModel = function () {
        $scope.model = {
            UserName: '',
            Password: '',
            IsRemember: false
        };

        $scope.modelFP = {
            username: '',
        }

        $scope.modelRegister = {
            Name: '',
            EmailAddress: '',
            PhoneNumber: '',
            password: '',
            ConfirmPassword: '',
            ReferenceByCode: '',

        }
        $rootScope.formsubmit = false;
        $scope.formsubmitFp = false;
        $scope.formsubmitRegister = false;
        setTimeout(function () {
            $("#PhoneNumber").intlTelInput({
                utilsScript: "lib/intl/js/utils.js"
            });
        }, 500)

    }

    $scope.GoTo = function (flg) {
        $scope.ResetLoginAllModel();
        $scope.IsLoginForm = flg;
    }

    $scope.checkIsLogin = function () {
        if ($localstorage.get('IsRemember') == 'true' || $localstorage.get('IsRemember') == true) {
            var Login = {
                UserName: $localstorage.get('RememberUserName'),
                Password: $localstorage.get('Password'),
                IsRemember: $localstorage.get('IsRemember'),
            }
            if ($localstorage.get('IsLogin') == 'true' || $localstorage.get('IsLogin') == true) {
                if (Login != null) {
                    $ionicHistory.nextViewOptions({ disableBack: true });
                    $state.go('app.Users');
                } else {
                    $scope.checkIsRemember();
                }
            } else {
                $scope.checkIsRemember();
            }
        } else {
            $scope.checkIsRemember();
        }
    }

    $scope.checkIsRemember = function () {
        if ($localstorage.get('IsRemember') == 'true') {
            $scope.model.UserName = $localstorage.get('RememberUserName');
            $scope.model.Password = $localstorage.get('Password');
            $scope.model.IsRemember = true;
        } else {
            $scope.model.UserName = '';
            $scope.model.Password = '';
            $scope.model.IsRemember = false;
        }
    }


    //Login Method
    $scope.Login = function (form, o) {
        if (form.$invalid) {
            $rootScope.formsubmit = true;
        } else {
            $ionicLoading.show({ template: '<i class="icon ion-refresh"></i> Loading' });
            var params = {
                username: o.UserName,
                password: o.Password
            }
            $http.get($rootScope.RoutePath + "account/login", { params: params }).then(function (data) {
                console.log(data)
                if (data.data.success == true) {
                    if (o.IsRemember == true) {
                        $timeout(function () {
                            $localstorage.set('RememberUserName', o.UserName);
                            $localstorage.set('Password', o.Password);
                            $localstorage.set('IsRemember', true);
                            $localstorage.set('IsLogin', true);
                        }, 50);
                    } else {
                        $timeout(function () {
                            $localstorage.set('RememberUserName', '');
                            $localstorage.set('Password', '');
                            $localstorage.set('IsRemember', false);
                        }, 50);
                    }
                    $localstorage.set('UserId', data.data.UserId);
                    $localstorage.set('UserName', data.data.UserName);
                    $localstorage.set('EmailAddress', data.data.EmailAddress);
                    $localstorage.set('PhoneNumber', data.data.PhoneNumber);
                    $localstorage.set('UserCode', data.data.UserCode);
                    $localstorage.set('DefaultLocation', data.data.DefaultLocation == null ? '' : data.data.DefaultLocation);
                    $localstorage.set('DefaultDepartment', data.data.DefaultDepartment);
                    $localstorage.set('UserRoles', JSON.stringify(data.data.UserRoles));
                    $localstorage.set('idLocations', data.data.idLocation);
                    $localstorage.set('token', data.data.token);
                    $localstorage.set('RefCustUserId', data.data.RefCustUserId ? JSON.stringify(data.data.RefCustUserId) : "");
                    $rootScope.UserId = $localstorage.get('UserId');
                    $http.defaults.headers.common['Authorization'] = data.data.token; // jshint ignore:line
                    $ionicLoading.hide();
                    $ionicHistory.nextViewOptions({ disableBack: true });
                    var CustomerUser = _.filter(JSON.parse($localstorage.get('UserRoles')), function (Role) {
                        return Role == "Customer";
                    })
                    if (CustomerUser.length == 0) {
                        $state.go('app.DashBoard');
                        setTimeout(function () {
                            $window.location.reload();
                        }, 100)
                    } else {
                        var params = {
                            EmailAddress: data.data.EmailAddress,
                        }
                        $http.get($rootScope.RoutePath + "account/GetCustomergroupByEmailAddress", { params: params }).then(function (data) {
                            console.log(data)
                            $localstorage.set('CustomerGroup', data.data.CustomerGroup);
                            $localstorage.set('CustomerGroupId', data.data.CustomerGroupId);
                            $localstorage.set('CustomerGroupLocatio', data.data.CustomerGroupLocatio);
                            $localstorage.set('CustomerBranch', data.data.CustomerBranch);

                            console.log($localstorage.get('CustomerGroup'))
                            if (data.data.CustomerGroup == 'Shop') {
                                $state.go('app.Sales');
                            } else {
                                $state.go('app.DashBoard');
                            }

                            setTimeout(function () {
                                $window.location.reload();
                            }, 100)
                        })
                    }
                    return;
                } else {
                    $ionicLoading.hide();
                    var myPopup = $ionicPopup.show({
                        template: data.data.message,
                        title: '',
                        cssClass: 'custPop',
                        scope: $scope,
                        buttons: [{
                            text: 'ok',
                            type: 'btn btn-green',
                        }]
                    });
                }

            })

        }
    };

    $scope.FogotPassword = function (form, o) {
        if (form.$invalid) {
            $scope.formsubmitFp = true;
        } else {
            $ionicLoading.show({ template: '<i class="icon ion-refresh"></i> Loading' });
            var params = {
                username: o.username,
            }
            $http.get($rootScope.RoutePath + "account/forgotpassword", { params: params }).then(function (data) {
                $ionicLoading.hide()
                var myPopup = $ionicPopup.show({
                    template: data.data.message,
                    title: '',
                    cssClass: 'custPop',
                    scope: $scope,
                    buttons: [{
                        text: 'ok',
                        type: 'btn btn-green',
                    }]
                });
                if (data.data.success == true) {
                    $scope.GoTo(0);
                }
            })
        }
    };

    $scope.Register = function (form, o) {
        if (form.$invalid) {
            $scope.formsubmitRegister = true;
        } else {
            if ($scope.modelRegister.password != $scope.modelRegister.ConfirmPassword) {
                $ionicLoading.show({
                    template: "Password and Confrim Password Not Same."
                });
                setTimeout(function () {
                    $ionicLoading.hide()
                }, 1000);
                return;
            }
            $ionicLoading.show({ template: '<i class="icon ion-refresh"></i> Loading' });
            $http.post($rootScope.RoutePath + "account/RegisterCustomer", $scope.modelRegister).then(function (data) {
                $ionicLoading.hide()
                var myPopup = $ionicPopup.show({
                    template: data.data.message,
                    title: '',
                    cssClass: 'custPop',
                    scope: $scope,
                    buttons: [{
                        text: 'ok',
                        type: 'btn btn-green',
                    }]
                });
                if (data.data.success == true) {
                    $scope.GoTo(0);
                }
            })
        }
    }

    $scope.init();
})