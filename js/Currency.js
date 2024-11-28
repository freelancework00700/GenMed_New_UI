app.controller('CurrencyController', function ($scope, $rootScope, $http, $ionicPopup, $ionicLoading, $localstorage, $state) {

    var vm = this;

    $scope.init = function () {
        setTimeout(() => {
            $("#mytext").focus();
        }, 1000);
        $scope.ResetModel();
        $scope.GetAllCurrency();
        $rootScope.BackButton = $scope.IsList = true;
        $scope.GetAllCurrencyCode();
    };

    $scope.GetAllCurrency = function () {
        $http.get($rootScope.RoutePath + 'currency/GetAllCurrency').then(function (res) {
            $scope.lstCurrency = res.data.data;
            $scope.TotalRecord = $scope.lstCurrency.length;
            $(document).ready(function () {
                $('#CurrencyTable').dataTable().fnClearTable();
                $('#CurrencyTable').dataTable().fnDestroy();
                setTimeout(function () {
                    $('#CurrencyTable').DataTable({
                        "dom": 'rt<"bottom"<"left"<"length"l><"info"i>><"right"<"pagination"p>>>',
                        "lengthMenu": [
                            [10, 25, 50, -1],
                            [10, 25, 50, "All"]
                        ],
                        "pageLength": 10,
                        language: {
                            "emptyTable": "No Data Found"
                        },
                        columnDefs: [{
                            bSortable: false,
                            aTargets: [-1]
                        }]
                    });
                })
            })
        });
    };

    $scope.GetAllCurrencyCode = function () {
        $http.get($rootScope.RoutePath + "currency/GetAllCurrencyCode").success(function (result) {
            result = _.sortBy(result, 'code');
            $scope.lstCurrencycode = result;
        })
    }

    $scope.FilterData = function () {
        if ($scope.Searchmodel.Search != '' && $scope.Searchmodel.Search != null && $scope.Searchmodel.Search != undefined) {
            $('#CurrencyTable').dataTable().fnFilter($scope.Searchmodel.Search);
        } else {
            $('#CurrencyTable').dataTable().fnFilter("");
        }
    }
    $scope.formsubmit = false;
    $scope.SaveCurrency = function (FormCurrency) {
        if (FormCurrency.$valid) {
            if (!$scope.model.id) {
                $scope.model.id = 0;
            }
            $rootScope.ShowLoader();
            $http.post($rootScope.RoutePath + 'currency/SaveCurrency', $scope.model)
                .then(function (res) {
                    if (res.data.data == 'TOKEN') {
                        $rootScope.logout();
                    }
                    if (res.data.success) {
                        $scope.init();
                    }
                    $ionicLoading.show({ template: res.data.message });
                    setTimeout(function () {
                        $ionicLoading.hide()
                    }, 1000);
                })
                .catch(function (err) {

                    $ionicLoading.show({ template: 'Unable to save record right now. Please try again later.' });
                    setTimeout(function () {
                        $ionicLoading.hide()
                    }, 1000);

                });
        } else {
            $scope.formsubmit = true;
        }
    };


    // Use more distinguished and understandable naming
    $scope.CopyToModel = function (selectedItem) {
        $rootScope.BackButton = $scope.IsList = false;
        $scope.model.id = parseInt(selectedItem['id']);
        $scope.model.CurrencyCode = selectedItem['CurrencyCode'];
        $scope.model.CurrencyWord = selectedItem['CurrencyWord'];
        $scope.model.isActive = selectedItem['isActive'] == 1 ? true : false;
        $scope.model.isDefault = selectedItem['isDefault'] == 1 ? true : false;
        $scope.model.BuyRate = parseInt(selectedItem['BuyRate']);
        $scope.model.SellRate = parseInt(selectedItem['SellRate']);
    };

    $scope.DeleteCurrency = function (id) {

        var confirmPopup = $ionicPopup.confirm({
            title: "",
            template: 'Are you sure you want to delete this record?',
            cssClass: 'custPop',
            cancelText: 'Cancel',
            okText: 'Ok',
            okType: 'btn btn-green',
            cancelType: 'btn btn-red',
        })
        confirmPopup.then(function (res) {
            if (res) {
                var params = {
                    id: id
                };
                $rootScope.ShowLoader();
                $http.get($rootScope.RoutePath + 'currency/DeleteCurrency', {
                    params: params
                }).success(function (data) {
                    if (data.success == true) { $scope.init(); }

                    $ionicLoading.show({ template: data.message });
                    setTimeout(function () {
                        $ionicLoading.hide()
                    }, 1000);

                }).catch(function (err) {

                    $ionicLoading.show({ template: 'Unable to delete record right now. Please try again later.' });
                    setTimeout(function () {
                        $ionicLoading.hide()
                    }, 1000);
                });
            }
        });

    };

    $scope.ResetModel = function () {
        $scope.model = {
            id: 0,
            CurrencyCode: '',
            CurrencyWord: '',
            BuyRate: null,
            SellRate: null,
            isActive: true,
            isDefault: false
        };
        $scope.Searchmodel = {
            Search: '',
        }
        $scope.formsubmit = false;
    };

    $scope.Add = function () {
        $rootScope.BackButton = $scope.IsList = false;
    }
    $rootScope.ResetAll = $scope.init;
    $scope.init();
})