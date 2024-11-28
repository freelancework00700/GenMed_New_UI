app.controller('SettingController', function ($scope, $rootScope, $http, $ionicPopup, $ionicLoading, $compile, $localstorage, $state) {
    $rootScope.BackButton = true;
    $scope.init = function () {

        $scope.initModel();
        $scope.GetAllSetting();
    }

    $scope.initModel = function () {
        $scope.model = {
            ToFixedNumber: '',
            AllowComma: false,
            ReferenceBy: 1,
            ReferenceLevel: 1,
            IsMLM: 0,
            LevelCommission: 0,
            IsReward: 0,
            DPCommission: 0,
            SponsorCommission: 0,
            SponsorCommissionLevel: 0,
        };
    }


    $scope.GetAllSetting = function () {
        $http.get($rootScope.RoutePath + "setting/GetAllSetting").success(function (response) {
            var objToFixedNumber = _.findWhere(response, { Name: "ToFixedNumber" });
            if (objToFixedNumber != null && objToFixedNumber != undefined && objToFixedNumber != '') {
                $scope.model.ToFixedNumber = parseInt(objToFixedNumber.Value);
            }
            var objAllowComma = _.findWhere(response, { Name: "AllowComma" });
            if (objAllowComma != null && objAllowComma != undefined && objAllowComma != '') {
                if (objAllowComma.Value == 1) {
                    $scope.model.AllowComma = true;
                } else {
                    $scope.model.AllowComma = false;
                }
            }

            var objReferenceBy = _.findWhere(response, { Name: "ReferenceBy" });
            if (objReferenceBy != null && objReferenceBy != undefined && objReferenceBy != '') {
                $scope.model.ReferenceBy = parseInt(objReferenceBy.Value);
            }

            var objReferenceLevel = _.findWhere(response, { Name: "ReferenceLevel" });
            if (objReferenceLevel != null && objReferenceLevel != undefined && objReferenceLevel != '') {
                $scope.model.ReferenceLevel = parseInt(objReferenceLevel.Value);
            }

            var objMLM = _.findWhere(response, { Name: "IsMLM" });
            if (objMLM != null && objMLM != undefined && objMLM != '') {
                $scope.model.IsMLM = parseInt(objMLM.Value);
            }

            var objParentPoint = _.findWhere(response, { Name: "LevelCommission" });
            if (objParentPoint != null && objParentPoint != undefined && objParentPoint != '') {
                $scope.model.LevelCommission = parseInt(objParentPoint.Value);
            }

            var objReward = _.findWhere(response, { Name: "IsReward" });
            if (objReward != null && objReward != undefined && objReward != '') {
                $scope.model.IsReward = parseInt(objReward.Value);
            }

            var objDPCommission = _.findWhere(response, { Name: "DPCommission" });
            if (objDPCommission != null && objDPCommission != undefined && objDPCommission != '') {
                $scope.model.DPCommission = parseInt(objDPCommission.Value);
            }

            var objSponsorCommission = _.findWhere(response, { Name: "SponsorCommission" });
            if (objSponsorCommission != null && objSponsorCommission != undefined && objSponsorCommission != '') {
                $scope.model.SponsorCommission = parseInt(objSponsorCommission.Value);
            }

            var objSponsorCommissionLevel = _.findWhere(response, { Name: "SponsorCommissionLevel" });
            if (objSponsorCommissionLevel != null && objSponsorCommissionLevel != undefined && objSponsorCommissionLevel != '') {
                $scope.model.SponsorCommissionLevel = parseInt(objSponsorCommissionLevel.Value);
            }
        })
    }



    $scope.formsubmit = false;
    $scope.SaveSettings = function (form, o) {

        if (form.$invalid) {
            $scope.formsubmit = true;
            return
        }
        $scope.formsubmit = false;
        $scope.lstSetting = [];
        for (var name in o) {
            var obj = new Object();
            obj["Name"] = name;
            obj["Value"] = o[name];
            $scope.lstSetting.push(obj);
        }
        $rootScope.ShowLoader();
        $http.post($rootScope.RoutePath + "setting/SaveSettings", $scope.lstSetting).then(function (data) {
            if (data.data.success == true) {
                $ionicLoading.show({ template: data.data.message });
                setTimeout(function () {
                    $ionicLoading.hide()
                }, 1000);
                $rootScope.GetAllGlobalSetting();
                $scope.init();

            } else {
                if (data.data.data == 'TOKEN') {
                    $rootScope.logout();
                } else {
                    $ionicLoading.show({ template: data.data.message });
                    setTimeout(function () {
                        $ionicLoading.hide()
                    }, 1000);
                }
            }
        });
    }

    $scope.init();
})