app.controller('SubBrandController', function ($scope, $rootScope, $http, $ionicPopup, $ionicLoading, $localstorage, $state) {

    var vm = this;

    $scope.init = function () {
        setTimeout(() => {
            $("#mytext").focus();
        }, 1000);
        $scope.ResetModel();
        $scope.GetAllSubBrand();
        $scope.GetAllBrand();
        $rootScope.BackButton = $scope.IsList = true;
    };

    $scope.GetAllSubBrand = function () {
        $http.get($rootScope.RoutePath + 'brand/GetAllSubBrand').then(function (res) {
            $scope.lstSubBrand = res.data.data;
            $scope.TotalRecord = $scope.lstSubBrand.length;

            $(document).ready(function () {
                $('#UOMTable').dataTable().fnClearTable();
                $('#UOMTable').dataTable().fnDestroy();
                setTimeout(function () {
                    $('#UOMTable').DataTable({
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

    $scope.GetAllBrand = function () {
        $http.get($rootScope.RoutePath + 'brand/GetAllBrand').then(function (res) {
            $scope.lstBrand = res.data.data;
            $scope.TotalRecord = $scope.lstBrand.length;
            $(document).ready(function () {
                $('#UOMTable').dataTable().fnClearTable();
                $('#UOMTable').dataTable().fnDestroy();
                setTimeout(function () {
                    $('#UOMTable').DataTable({
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
            $('#UOMTable').dataTable().fnFilter($scope.Searchmodel.Search);
        } else {
            $('#UOMTable').dataTable().fnFilter("");
        }
    }

    $scope.formsubmit = false;
    $scope.SaveUOM = function (FormUOM) {

        if (FormUOM.$valid) {
            if (!$scope.model.id) {
                $scope.model.id = null;
            }
            $rootScope.ShowLoader();
            $http.post($rootScope.RoutePath + 'brand/SaveSubBrand', $scope.model)
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
        // Loop model, because selectedItem might have MORE properties than the defined model
        for (var prop in $scope.model) {
            $scope.model[prop] = selectedItem[prop];
        }
        $scope.model.IsActive = $scope.model.IsActive == 1 ? true : false;
    };

    $scope.DeleteUOM = function (id) {

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
                $http.get($rootScope.RoutePath + 'brand/DeleteSubBrand', {
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
            id: null,
            BrandId: '',
            SubBrandName: '',
            Manufacturer: '',
        };
        $scope.Searchmodel = {
            Search: '',
        }
        $scope.formsubmit = false;
    };

    $scope.Add = function () {
        $rootScope.BackButton = $scope.IsList = false;
    }

    $scope.Export = function () {
        window.location = $rootScope.RoutePath + "brand/ExportCompany?search=" + $scope.Searchmodel.Search;
    }

    $rootScope.ResetAll = $scope.init;

    $scope.init();
})