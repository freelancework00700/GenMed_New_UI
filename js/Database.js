app.controller('DatabaseController', function ($scope, $rootScope, $http, $localstorage, $ionicPopup, $state, $ionicLoading, $ionicScrollDelegate, $ionicModal) {
    $scope.init = function () {
        setTimeout(() => {
            $("#mytext").focus();
        }, 1000);
        $scope.Searchmodel = {
            Search: '',
        }
        $scope.GetAllBackUp();
        $rootScope.BackButton = $scope.IsList = true;
    };


    $scope.GetAllBackUp = function () {
        $http.get($rootScope.RoutePath + 'user/GetAllDBbackupfile').then(function (res) {
            $scope.lstMySql = res.data.data;
            $(document).ready(function () {
                $('#DBTable').dataTable().fnClearTable();
                $('#DBTable').dataTable().fnDestroy();
                setTimeout(function () {
                    $('#DBTable').DataTable({
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
                });
            })
        });
    };

    $scope.FilterData = function () {
        if ($scope.Searchmodel.Search != '' && $scope.Searchmodel.Search != null && $scope.Searchmodel.Search != undefined) {
            $('#DBTable').dataTable().fnFilter($scope.Searchmodel.Search);
        } else {
            $('#DBTable').dataTable().fnFilter("");
        }
    }


    $scope.RestoreBackup = function (o) {
        var confirmPopup = $ionicPopup.confirm({
            title: "",
            template: 'Are you sure you want to Restore this Backup?',
            cssClass: 'custPop',
            cancelText: 'Cancel',
            okText: 'Ok',
            okType: 'btn btn-green',
            cancelType: 'btn btn-red',
        })
        confirmPopup.then(function (res) {
            if (res) {
                $rootScope.ShowLoader();
                // console.log(o.backupfile)
                return $http.get($rootScope.RoutePath + 'user/GetAllDbBackRestore', {
                    params: {
                        filename: o.backupfile
                    }
                }).then(function (res) {
                    $ionicLoading.hide()
                    if (res.data.data == 'TOKEN') {
                        $ionicScrollDelegate.scrollTop();
                        $rootScope.logout();
                    }
                    if (res.data.success) {
                        $scope.init();
                    }
                    var alertPopup = $ionicPopup.alert({
                        title: '',
                        template: res.data.message,
                        cssClass: 'custPop',
                        okText: 'Ok',
                        okType: 'btn btn-green',
                    });
                })
                    .catch(function (err) {
                        $ionicLoading.show({
                            template: 'Unable to save restore backup. Please try again later.'
                        });
                        setTimeout(function () {
                            $ionicLoading.hide()
                        }, 1000);
                    });
            }
        });
    };

    $scope.CreateBackUp = function () {
        var confirmPopup = $ionicPopup.confirm({
            title: "",
            template: 'Are you sure you want to create database backup?',
            cssClass: 'custPop',
            cancelText: 'Cancel',
            okText: 'Ok',
            okType: 'btn btn-green',
            cancelType: 'btn btn-red',
        })
        confirmPopup.then(function (res) {
            if (res) {
                $rootScope.ShowLoader();
                $http.get($rootScope.RoutePath + 'user/GetAllDbBackUp').then(function (res) {
                    $ionicLoading.hide()
                    if (res.data.data == 'TOKEN') {
                        $rootScope.logout();
                    }
                    if (res.data.success) {
                        $ionicScrollDelegate.scrollTop();
                        $scope.init();
                    }
                    var alertPopup = $ionicPopup.alert({
                        title: '',
                        template: res.data.message,
                        cssClass: 'custPop',
                        okText: 'Ok',
                        okType: 'btn btn-green',
                    });
                })
            }
        })
    }


    $scope.init();

})