app.controller('TaxCodeController', function ($scope, $rootScope, $http, $ionicPopup, $ionicLoading, $localstorage, $state) {

    var vm = this;

    $scope.init = function () {
        setTimeout(() => {
            $("#mytext").focus();
        }, 1000);
        $scope.ResetModel();
        $scope.GetAllTaxCode();
        $rootScope.BackButton = $scope.IsList = true;
    };

    $scope.GetAllTaxCode = function () {
        $http.get($rootScope.RoutePath + 'taxcode/GetAllTaxcode').then(function (res) {
            $scope.lstTaxCode = res.data.data;
            $scope.TotalRecord = $scope.lstTaxCode.length;
            $(document).ready(function () {
                $('#TaxCodeTable').dataTable().fnClearTable();
                $('#TaxCodeTable').dataTable().fnDestroy();
                setTimeout(function () {
                    $('#TaxCodeTable').DataTable({
                        responsive: true,
                        "dom": 'rt<"bottom"<"left"<"length"l><"info"i>><"right"<"pagination"p>>>',
                        retrieve: true,
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
            $('#TaxCodeTable').dataTable().fnFilter($scope.Searchmodel.Search);
        } else {
            $('#TaxCodeTable').dataTable().fnFilter("");
        }
    }

    $scope.formsubmit = false;
    $scope.SaveTaxCode = function (FormTaxCode) {

        if (FormTaxCode.$valid) {
            if (!$scope.model.id) {
                $scope.model.id = 0;
            }
            $rootScope.ShowLoader();
            $http.post($rootScope.RoutePath + 'taxcode/SaveTaxcode', $scope.model)
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

    $scope.CopyToModel = function (selectedItem) {
        $rootScope.BackButton = $scope.IsList = false;
        for (var prop in $scope.model) {
            $scope.model[prop] = selectedItem[prop];
        }
        $scope.model.Inclusive = $scope.model.Inclusive == 1 ? true : false;
        $scope.model.IsActive = $scope.model.IsActive == 1 ? true : false;
    };

    $scope.DeleteTaxCode = function (id) {

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
                $http.get($rootScope.RoutePath + 'taxcode/DeleteTaxcode', {
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
            TaxType: '',
            Description: '',
            TaxRate: null,
            Inclusive: false,
            IsActive: true,
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