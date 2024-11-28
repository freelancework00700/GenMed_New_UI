app.controller('CurrencyRateController', function ($scope, $rootScope, $http, $ionicPopup, $ionicLoading, $localstorage, $state) {

    var vm = this;

    $scope.init = function () {
        setTimeout(() => {
            $("#mytext").focus();
        }, 1000);
        $scope.ResetModel();
        $scope.GetAllCurrencyRate();
        $rootScope.BackButton = $scope.IsList = true;
        $scope.GetAllCurrencyCode();
    };

    $scope.GetAllCurrencyRate = function () {
        $http.get($rootScope.RoutePath + 'currencyrate/GetAllCurrencyrate').then(function (res) {
            $scope.lstCurrencyRate = res.data.data;
            $scope.TotalRecord = $scope.lstCurrencyRate.length;
            $(document).ready(function () {
                $('#CurrencyRateTable').dataTable().fnClearTable();
                $('#CurrencyRateTable').dataTable().fnDestroy();
                setTimeout(function () {
                    $('#CurrencyRateTable').DataTable({
                        responsive: true,
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
    $scope.FilterData = function () {
        if ($scope.Searchmodel.Search != '' && $scope.Searchmodel.Search != null && $scope.Searchmodel.Search != undefined) {
            $('#CurrencyRateTable').dataTable().fnFilter($scope.Searchmodel.Search);
        } else {
            $('#CurrencyRateTable').dataTable().fnFilter("");
        }
    }
    $scope.GetAllCurrencyCode = function () {
        $http.get($rootScope.RoutePath + "currency/GetAllCurrencyCode").success(function (result) {
            result = _.sortBy(result, 'code');
            $scope.lstCurrencycode = result;
        })
    }
    $scope.formsubmit = false;
    $scope.SaveCurrencyRate = function (form) {
        if (form.$valid) {
            if (!$scope.model.id) {
                $scope.model.id = 0;
            }
            $rootScope.ShowLoader();
            $http.post($rootScope.RoutePath + 'currencyrate/SaveCurrencyrate', $scope.model)
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
        $scope.model.FromDate = selectedItem['FromDate'];
        $scope.model.ToDate = selectedItem['ToDate'];
        $scope.model.CurrencyCode = selectedItem['CurrencyCode'];
        $scope.model.BuyRate = parseInt(selectedItem['BuyRate']);
        $scope.model.SellRate = parseInt(selectedItem['SellRate']);
    };

    $scope.DeleteCurrencyRate = function (id) {

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
                $http.get($rootScope.RoutePath + 'currencyrate/DeleteCurrencyrate', {
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
            FromDate: null,
            ToDate: null,
            CurrencyCode: '',
            BuyRate: null,
            SellRate: null
        };
        $scope.formsubmit = false;
        $scope.Searchmodel = {
            Search: '',
        }
    };

    $scope.Add = function () {
        $rootScope.BackButton = $scope.IsList = false;
    }
    $rootScope.ResetAll = $scope.init;
    $scope.init();
})