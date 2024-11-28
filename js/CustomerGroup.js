app.controller('CustomerGroupController', function ($scope, $rootScope, $http, $ionicPopup, $ionicLoading, $localstorage, $state) {
    var vm = this;

    //////////

    $scope.init = function () {
        $scope.tab = {
            selectedIndex: 0
        };
        $scope.ResetModel();
        $scope.GetAllCustomerGroup();
        $rootScope.BackButton = $scope.IsList = true;
    };

    $scope.GetAllCustomerGroup = function () {
        $http.get($rootScope.RoutePath + 'customergroup/GetAllCustomergroup').then(function (res) {
            $scope.lstCustomerGroup = res.data.data;
            $scope.TotalRecord = $scope.lstCustomerGroup.length;
            $(document).ready(function () {
                $('#CustomerGroupTable').dataTable().fnClearTable();
                $('#CustomerGroupTable').dataTable().fnDestroy();
                setTimeout(function () {
                    $('#CustomerGroupTable').DataTable({
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
            $('#CustomerGroupTable').dataTable().fnFilter($scope.Searchmodel.Search);
        } else {
            $('#CustomerGroupTable').dataTable().fnFilter("");
        }
    }

    $scope.formsubmit = false;
    $scope.SaveCustomerGroup = function (form) {
        if (form.$valid) {
            if (!$scope.model.id) {
                $scope.model.id = 0;
            }
            $rootScope.ShowLoader();
            $http.post($rootScope.RoutePath + 'customergroup/SaveCustomergroup', $scope.model)
                .then(function (res) {
                    if (res.data.data == 'TOKEN') {
                        $rootScope.logout();
                    }
                    if (res.data.success) {
                        $scope.init();
                    }
                    $ionicLoading.show({
                        template: res.data.message
                    });
                    setTimeout(function () {
                        $ionicLoading.hide()
                    }, 1000);
                })
                .catch(function (err) {

                    $ionicLoading.show({
                        template: 'Unable to save record right now. Please try again later.'
                    });
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
        // Loop model, because selectedItem might have MORE properties than the defined model
        for (var prop in $scope.model) {
            $scope.model[prop] = selectedItem[prop];
        }
    };

    $scope.DeleteCustomerGroup = function (id) {

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
                $http.get($rootScope.RoutePath + 'customergroup/DeleteCustomergroup', {
                    params: params
                }).success(function (data) {
                    if (data.success == true) {
                        $scope.init();
                    }

                    $ionicLoading.show({
                        template: data.message
                    });
                    setTimeout(function () {
                        $ionicLoading.hide()
                    }, 1000);

                }).catch(function (err) {

                    $ionicLoading.show({
                        template: 'Unable to delete record right now. Please try again later.'
                    });
                    setTimeout(function () {
                        $ionicLoading.hide()
                    }, 1000);
                });
            }
        });
    }

    //Table function End
    $scope.ResetModel = function () {
        $scope.model = {
            id: 0,
            Name: '',
            Description: '',
            IsActive: true,
        };
        $scope.Searchmodel = {
            Search: '',
        }
        $scope.formsubmit = false;

    };

    // Alias
    $rootScope.ResetAll = $scope.init;

    //////////
    $scope.Add = function () {
        $rootScope.BackButton = $scope.IsList = false;
    }
    $scope.init();

})