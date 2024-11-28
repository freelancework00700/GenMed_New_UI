app.controller('RolesController', function ($scope, $rootScope, $http, $localstorage, $state, $ionicLoading, $ionicPopup, $ionicModal) {
    $scope.init = function () {
        setTimeout(() => {
            $("#mytext").focus();
        }, 1000);
        $scope.ResetModel();
        $scope.GetAllRoles();
        $scope.tab = {
            selectedIndex: 0
        };
        $rootScope.BackButton = $scope.IsList = true;
    };


    $scope.GetAllRoles = function () {
        $http.get($rootScope.RoutePath + 'roles/GetAllRoles').then(function (res) {
            $scope.lstRoles = res.data.data;
            $scope.lstRolesDefualt = res.data.data;
            $scope.TotalRecord = $scope.lstRoles.length;
            $(document).ready(function () {
                $('#RoleTable').dataTable().fnClearTable();
                $('#RoleTable').dataTable().fnDestroy();
                setTimeout(function () {
                    $('#RoleTable').DataTable({
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
            $('#RoleTable').dataTable().fnFilter($scope.Searchmodel.Search);
        } else {
            $('#RoleTable').dataTable().fnFilter("");
        }
    }
    //Table function End
    $scope.formsubmit = false
    $scope.SaveRoles = function (form) {

        if (form.$invalid) {
            $scope.formsubmit = true;
        } else {
            $scope.formsubmit = false;
            if (!$scope.model.id) {
                $scope.model.id = 0;
                $scope.formsubmit = true
            }
            $rootScope.ShowLoader();
            $http.post($rootScope.RoutePath + 'roles/SaveRoles', $scope.model)
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

        }
    };

    // Use more distinguished and understandable naming
    $scope.CopyToModel = function (selectedItem) {
        $scope.tab.selectedIndex = 1;
        $rootScope.BackButton = $scope.IsList = false;
        for (var prop in $scope.model) {
            $scope.model[prop] = selectedItem[prop];
        }
    };

    $scope.DeleteRoles = function (id) {
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
                $rootScope.ShowLoader();
                return $http.get($rootScope.RoutePath + 'roles/DeleteRoles', {
                    params: {
                        id: id
                    }
                }).then(function (res) {
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
                $scope.init();
            }
        });
    };

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

    };



    $scope.Add = function () {
        $rootScope.BackButton = $scope.IsList = false;
    }

    // Alias
    $rootScope.ResetAll = $scope.init;

    //////////

    $scope.init();

})