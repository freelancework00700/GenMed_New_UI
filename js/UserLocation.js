app.controller('UserLocationController', function ($scope, $rootScope, $http, $ionicPopup, $ionicLoading, $localstorage, $state) {

    var vm = this;

    $scope.init = function () {
        $scope.ResetModel();
        $scope.GetAllUserLocation();
        $scope.GetAllLocations();
        // $scope.GetAllUsers();
        $scope.GetAllUsersWhoseLocationNotAssign();
        $rootScope.BackButton = $scope.IsList = true;
    };

    $scope.GetAllUserLocation = function () {
        $http.get($rootScope.RoutePath + 'userlocation/GetAllUserlocations').then(function (res) {
            $scope.lstUserLocation = res.data.data;
            $scope.TotalRecord = $scope.lstUserLocation.length;
            $(document).ready(function () {
                $('#UserLocationTable').dataTable().fnClearTable();
                $('#UserLocationTable').dataTable().fnDestroy();
                setTimeout(function () {
                    $('#UserLocationTable').DataTable({
                        "responsive": true,
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
            $('#UserLocationTable').dataTable().fnFilter($scope.Searchmodel.Search);
        } else {
            $('#UserLocationTable').dataTable().fnFilter("");
        }
    }

    $scope.GetAllLocations = function () {
        $http.get($rootScope.RoutePath + 'location/GetAllActiveLocations').then(function (res) {
            $scope.lstLocation = res.data.data;
        });
    };
    // $scope.GetAllUsers = function() {
    //     $http.get($rootScope.RoutePath + 'user/GetAllUserinformations').then(function(res) {
    //         $scope.lstUser = res.data.data;
    //     });
    // };

    $scope.GetAllUsersWhoseLocationNotAssign = function () {
        $http.get($rootScope.RoutePath + 'userlocation/GetAllUsersWhoseLocationNotAssign').then(function (res) {
            $scope.lstUser = res.data.data;
        });
    };

    $scope.formsubmit = false;
    $scope.SaveUserLocation = function (FormUserLocation) {

        if (FormUserLocation.$valid) {
            if (!$scope.model.id) {
                $scope.model.id = 0;
            }
            $rootScope.ShowLoader();
            $http.post($rootScope.RoutePath + 'userlocation/SaveUserlocations', $scope.model)
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


    $scope.CopyToModel = function (selectedItem) {
        $rootScope.BackButton = $scope.IsList = false;
        for (var prop in $scope.model) {
            $scope.model[prop] = parseInt(selectedItem[prop]);
        }
        $scope.lstUser.push({
            username: selectedItem.tbluserinformation.username,
            id: selectedItem['idUser']
        })
    };

    $scope.DeleteUserLocation = function (id) {

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
                $http.get($rootScope.RoutePath + 'userlocation/DeleteUserlocations', {
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

    };

    $scope.ResetModel = function () {
        $scope.model = {
            id: 0,
            idUser: '',
            idLocations: ''
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