app.controller('Pos_Till_LoginCtrl', function ($http, $scope, $rootScope, $ionicSideMenuDelegate, $ionicModal, $ionicPopup, $localstorage, $state, $ionicLoading) {
    var IsPosUserLogin = $localstorage.get("IsPosUserLogin");
    if (IsPosUserLogin && IsPosUserLogin == "1") {
        $state.go('app.Pos_Till_ItemCategory');
    }

    $scope.init = function () {
        $scope.manageModel();
        if ($localstorage.get("IsFloatComplate") == "1") {
        } else {
            $localstorage.set("IsFloatComplate", "0");
        }
        // console.log(">>>>>>>>", $scope.UserModel.pospasscode)
        $scope.CurrentTime = moment().format('DD MMM HH:mm');
        $scope.GetAllPosUser();
    }

    $scope.manageModel = function () {
        $scope.UserModel = {
            pospasscode: '',
            UserId: '',
        }
    }


    $scope.GetAllPosUser = function () {
        $http.get($rootScope.RoutePath + "postill/GetAllPosUser").then(function (res) {
            $scope.LstPosUser = res.data;
            var classindex = 1;
            for (var index = 0; index < $scope.LstPosUser.length; index++) {
                if (classindex <= 3) {
                    $scope.LstPosUser[index].classname = "userType0" + classindex;
                    classindex++;
                } else {
                    $scope.LstPosUser[index].classname = "userType04";
                    classindex = 1;
                }
            }
            removeActiveClass();
        });
    }

    function removeActiveClass() {
        for (var index = 0; index < $scope.LstPosUser.length; index++) {
            $scope.LstPosUser[index].active = false;
        }
    }


    $scope.SetValuePasscode = function (value) {
        if ($scope.UserModel.pospasscode.length <= 5) {
            $scope.UserModel.pospasscode = $scope.UserModel.pospasscode + value;
        }
    }

    $scope.ClearPasscode = function () {
        if ($scope.UserModel.pospasscode.length != 0) {
            $scope.UserModel.pospasscode = $scope.UserModel.pospasscode.substring(0, $scope.UserModel.pospasscode.length - 1);
            // console.log($scope.UserModel.pospasscode)
        }
    }

    $scope.SelectUser = function (o) {
        removeActiveClass();
        $scope.UserModel.UserId = o.id;
        o.active = true;

    }
    $scope.LoginPosUser = function () {
        if ($scope.UserModel.UserId == '' || $scope.UserModel.UserId == null) {
            var alertPopup = $ionicPopup.alert({
                title: '',
                template: 'Please Select Username',
                cssClass: 'custPop',
                okText: 'Ok',
                okType: 'btn btn-green',
            });
            return
        }
        if ($scope.UserModel.pospasscode == '' || $scope.UserModel.pospasscode == null) {
            var alertPopup = $ionicPopup.alert({
                title: '',
                template: 'Please Enter Passcode',
                cssClass: 'custPop',
                okText: 'Ok',
                okType: 'btn btn-green',
            });
            return
        }
        var CheckLogin = _.filter($scope.LstPosUser, function (data) {
            if (data.pospasscode === $scope.UserModel.pospasscode && data.id === $scope.UserModel.UserId) {
                return data;
            }
        });
        if (CheckLogin.length == 0) {
            var alertPopup = $ionicPopup.alert({
                title: '',
                template: 'Invalid Passcode',
                cssClass: 'custPop',
                okText: 'Ok',
                okType: 'btn btn-green',
            });
            $scope.UserModel.pospasscode = '';
            return

        }
        $http.post($rootScope.RoutePath + 'postill/ManagePosLogForLogin', { idUser: $scope.UserModel.UserId })
            .then(function (res) {
                if (res.data.data == 'TOKEN') {
                    $rootScope.logout();
                }
                $localstorage.set("IsPosUserLogin", "1");
                $localstorage.set("IsPosUserId", $scope.UserModel.UserId);
                $localstorage.set("DefaultLocationPOSTill", res.data.data.DefaultLocation);
                $localstorage.set("IsPosUserName", CheckLogin[0].username);

                $http.get($rootScope.RoutePath + 'floatCash/GetFloatCaseDetailById?idUser=' + $scope.UserModel.UserId).then(function (res) {
                    if (res.data == null) {
                        $scope.OpenFloatPopupModal();
                    } else {
                        $localstorage.set("IsFloatComplate", "1")
                        $state.go('app.Pos_Till_ItemCategory');
                    }
                });


            })
            .catch(function (err) {
                $ionicLoading.show({ template: 'Unable to Login right now. Please try again later.' });
                setTimeout(function () {
                    $ionicLoading.hide()
                }, 1000);

            });
    }

    $(document).ready(function () {
        setInterval(function () {
            $scope.$apply(function () {
                $scope.CurrentTime = moment().format('DD MMM HH:mm');
            })
        }, 60 * 1000);
    });

    //Float Popup on Punchin Button start
    $ionicModal.fromTemplateUrl('FloatPopupModal.html', {
        scope: $scope,
        animation: 'slide-in-up',
        enableBackdropDismiss: true
    }).then(function (modal) {
        $scope.FloatModal = modal;
    });

    $scope.closeFloatPopupModal = function () {
        $scope.FloatModal.hide();
        $state.go('app.Pos_Till_Login');
    };

    $scope.OpenFloatPopupModal = function () {
        $scope.FloatModal.show();
        $scope.initFloatPopupModal();
    };

    $scope.initFloatPopupModal = function () {
        $scope.FloatModel = {
            id: '',
            idUser: $localstorage.get("IsPosUserId"),
            amount: '',
            type: 'float',
            FloatCodeValue: "£"
        }
    }

    $scope.SetFloatValue = function (value) {
        $scope.FloatModel.amount = $scope.FloatModel.amount + "" + value;
        $scope.FloatModel.FloatCodeValue = $scope.FloatModel.FloatCodeValue + value;
    }

    $scope.ClearFloatValue = function () {
        if ($scope.FloatModel.FloatCodeValue.length != 0) {
            $scope.FloatModel.FloatCodeValue = $scope.FloatModel.FloatCodeValue.substring(0, $scope.FloatModel.FloatCodeValue.length - 1);
        }
    }

    $scope.SaveFloatCash = function () {
        var params = {
            id: 0,
            idUser: parseInt($localstorage.get("IsPosUserId")),
            amount: parseFloat($scope.FloatModel.amount),
            type: 'float',
        };
        $rootScope.ShowLoader();
        $http.post($rootScope.RoutePath + 'floatcash/SaveFloatCash', params)
            .then(function (res) {
                $ionicLoading.show({ template: res.data.message });
                setTimeout(function () {
                    $ionicLoading.hide()
                }, 1000);

                if (res.data.success) {
                    $scope.FloatModal.hide();
                    $localstorage.set("IsFloatComplate", "1");
                    $state.go('app.Pos_Till_ItemCategory');
                } else {
                    $localstorage.set("IsPosUserLogin", "0");
                    $localstorage.set("IsPosUserId", null);
                    $localstorage.set("IsPosUserName", null);
                }
            })
            .catch(function (err) {

                $ionicLoading.show({ template: 'Unable to save record right now. Please try again later.' });
                setTimeout(function () {
                    $ionicLoading.hide()
                }, 1000);
            });

    };

    //Float Popup on Punchin Button end


    $scope.init();
});