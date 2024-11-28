app.controller('RolePermissionController', function ($scope, $rootScope, $http, $ionicPopup, $ionicLoading, $localstorage, $state) {
    var vm = this;

    //////////
    $rootScope.BackButton = true;
    $scope.init = function () {
        setTimeout(() => {
            $("#mytext").focus();
        }, 1000);
        $scope.model = {
            idRoles: '',
        };
        $scope.Searchmodel = {
            Search: '',
        }
        $scope.modelAllPermission = {
            AccessPermission: false,
        }

        $scope.GetAllRoles();
    };

    $scope.GetAllRoles = function () {
        $http.get($rootScope.RoutePath + "roles/GetAllRoles")
            .then(function (response) {
                $scope.lstRoles = response.data.data;
                $scope.GetAllModule();
            });
    }

    //Get All Modules
    $scope.GetAllModule = function () {
        $scope.lstModules = [];
        $http.get($rootScope.RoutePath + "modules/GetAllActiveModules")
            .then(function (response) {
                $scope.lstModules = response.data.data;
                for (var index = 0; index < $scope.lstModules.length; index++) {
                    $scope.lstModules[index].AccessPermission = false;
                }
                $(document).ready(function () {
                    $('#RolePerTable').dataTable().fnClearTable();
                    $('#RolePerTable').dataTable().fnDestroy();
                    setTimeout(function () {
                        $('#RolePerTable').DataTable({
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
    }
    $scope.FilterData = function () {
        if ($scope.Searchmodel.Search != '' && $scope.Searchmodel.Search != null && $scope.Searchmodel.Search != undefined) {
            $('#RolePerTable').dataTable().fnFilter($scope.Searchmodel.Search);
        } else {
            $('#RolePerTable').dataTable().fnFilter("");
        }
    }
    //Get All Permission By Role
    $scope.GetAllPermissionByRole = function () {
        $http.get($rootScope.RoutePath + "accessrights/GetAccessrightsByRoleId?idRoles=" + $scope.model.idRoles)
            .then(function (response) {
                $scope.lstUserPermission = response.data;
                if ($scope.lstUserPermission.length > 0) {
                    $scope.ClearDataItems();
                    $scope.GetDataItems();
                } else {
                    $scope.GetAllModule();
                }

            });
    }

    //Set Permission for selected Role
    $scope.GetDataItems = function () {
        for (var i = 0; i < $scope.lstUserPermission.length; i++) {
            for (var j = 0; j < $scope.lstModules.length; j++) {
                if ($scope.lstUserPermission[i].idModules == $scope.lstModules[j].id && $scope.model.idRoles == $scope.lstUserPermission[i].idRoles) {
                    $scope.lstModules[j].AccessPermission = true;
                }
            }
        }
    }

    //Remove Permission for old Role
    $scope.ClearDataItems = function () {
        for (var i = 0; i < $scope.lstUserPermission.length; i++) {
            for (var j = 0; j < $scope.lstModules.length; j++) {
                $scope.lstModules[j].AccessPermission = false;
            }
        }
    }

    //Change Permission for individual Module
    $scope.ChangePermission = function (o) {
        $scope.modelAllPermission = {
            AccessPermission: false,
        }
        if ($scope.model.idRoles != null && $scope.model.idRoles != '' && $scope.model.idRoles != undefined) {

            var ObjPermission = {
                idRoles: $scope.model.idRoles,
                idModules: o.id,
            }
            $http.post($rootScope.RoutePath + "accessrights/ChangeAccessrights", ObjPermission)
                .then(function (response) {
                    if (response.data.data == 'TOKEN') {
                        $rootScope.logout();
                    }
                });
        } else {
            $ionicLoading.show({
                template: 'You must select user role.'
            });
            setTimeout(function () {
                $ionicLoading.hide()
            }, 1000);
        }
    }

    //ChangeAllPermission
    $scope.ChangeAllPermission = function () {
        if ($scope.model.idRoles != null && $scope.model.idRoles != '' && $scope.model.idRoles != undefined) {
            var obj = new Object();
            obj.Data = $scope.lstModules;
            obj.idRoles = $scope.model.idRoles;
            obj.AccessPermission = $scope.modelAllPermission.AccessPermission;
            for (var i = 0; i < $scope.lstModules.length; i++) {
                $scope.lstModules[i].AccessPermission = obj.AccessPermission;
            }
            $http.post($rootScope.RoutePath + "accessrights/ChangeAllAccessrights", obj)
                .then(function (response) {
                    if (response.data.data == 'TOKEN') {
                        $rootScope.logout();
                    }
                });
        } else {
            $ionicLoading.show({
                template: 'You must select user role.'
            });
            setTimeout(function () {
                $ionicLoading.hide()
            }, 1000);
        }
    }
    $scope.init();
})