app.controller('SiteController', function ($scope, $rootScope, $http, $ionicPopup, $ionicLoading, $localstorage, $state, $ionicModal) {
    var vm = this;

    //////////
    $scope.init = function () {
        $scope.tab = { selectedIndex: 0 };
        $scope.ResetModel();
        $scope.GetAllActiveLocations();
        $scope.GetAllSite();
        $rootScope.BackButton = $scope.IsList = true;
    };

    $scope.GetAllActiveLocations = function () {
        var params = {
            idLocations: $scope.IsAdmin ? "" : $localstorage.get('idLocations')
        }
        $http.get($rootScope.RoutePath + 'customer/GetAllActiveLocations', {
            params: params
        }).then(function (res) {
            $scope.lstLocation = res.data.data;
        });
    };



    $scope.GetAllSite = function () {
        $http.get($rootScope.RoutePath + 'site/GetAllSite').then(function (res) {
            $scope.lstSite = res.data.data;
            $scope.TotalRecord = $scope.lstSite.length;
            $(document).ready(function () {
                $('#SiteTable').dataTable().fnClearTable();
                $('#SiteTable').dataTable().fnDestroy();
                setTimeout(function () {
                    $('#SiteTable').DataTable({
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
            $('#SiteTable').dataTable().fnFilter($scope.Searchmodel.Search);
        } else {
            $('#SiteTable').dataTable().fnFilter("");
        }
    }

    $scope.formsubmit = false;
    $scope.SaveSite = function (form) {
        if (form.$valid) {
            if (!$scope.model.id) {
                $scope.model.id = 0;
            }
            $rootScope.ShowLoader();
            $http.post($rootScope.RoutePath + 'site/SaveSite', $scope.model)
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
        // Loop model, because selectedItem might have MORE properties than the defined model
        for (var prop in $scope.model) {
            $scope.model[prop] = selectedItem[prop];
        }

    };

    $scope.DeleteSite = function (id) {
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
                $http.get($rootScope.RoutePath + 'site/DeleteSite', {
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
    }

    //Table function End
    $scope.ResetModel = function () {
        $scope.model = {
            id: 0,
            Name: "",
            Location: "",
            Address: "",
        };
        $scope.Searchmodel = {
            Search: '',
            SearchUser: '',
        }
        $scope.formsubmit = false;
    };

    $rootScope.ResetAll = $scope.init;

    $scope.Add = function () {
        $rootScope.BackButton = $scope.IsList = false;
    }


    //Site User
    $scope.idSite = null;
    $ionicModal.fromTemplateUrl('SiteUser.html', {
        scope: $scope,
        animation: 'slide-in-up'
    }).then(function (modal) {
        $scope.modal = modal;
    });

    $scope.OpenModelForSiteUser = function (idSite) {
        $('#SiteUserTable').dataTable().fnClearTable();
        $('#SiteUserTable').dataTable().fnDestroy();
        $scope.idSite = idSite;
        $scope.GetAllSiteUser(function () {
            InitSiteUserDataTable();
        });
        $scope.modal.show();
    };

    $scope.closeModal = function () {
        $scope.idSite = null;
        $scope.modal.hide();
    };

    $scope.$on('$destroy', function () {
        $scope.idSite = null;
        $scope.modal.remove();
    });

    $scope.GetAllSiteUser = function (returncall) {
        $scope.lstSiteUser = [];
        var params = {
            idSite: $scope.idSite
        }
        $http.get($rootScope.RoutePath + 'site/GetAllUserForSiteAssign', {
            params: params
        }).then(function (res) {
            $scope.lstSiteUser = res.data;
            returncall();
        });
    };

    function InitSiteUserDataTable() {
        setTimeout(function () {
            $('#SiteUserTable').DataTable({
                "responsive": true,
                "dom": 'rt<"bottom"<"left"<"length"l><"info"i>><"right"<"pagination"p>>>',
                // "lengthMenu": [
                //     [10, 25, 50, -1],
                //     [10, 25, 50, "All"]
                // ],
                "pageLength": 10,
                "bLengthChange": false,
                language: {
                    "emptyTable": "No Data Found"
                },
                columnDefs: [{
                    bSortable: false,
                    aTargets: [-1]
                }, { "width": "10%", "targets": 0 }]
            });
        }, 100)
    };

    $scope.FilterDataSiteUser = function () {
        if ($scope.Searchmodel.SearchUser != '' && $scope.Searchmodel.SearchUser != null && $scope.Searchmodel.SearchUser != undefined) {
            $('#SiteUserTable').dataTable().fnFilter($scope.Searchmodel.SearchUser);
        } else {
            $('#SiteUserTable').dataTable().fnFilter("");
        }
    };

    $scope.SaveAssignSiteUser = function () {
        var SelectSiteUser = _.where($scope.lstSiteUser, {
            isSelect: 1
        });
        SelectSiteUser = _.pluck(SelectSiteUser, 'id');
        var objAssign = {
            idSite: $scope.idSite,
            SelectSiteUser: SelectSiteUser,
        }
        $http.post($rootScope.RoutePath + 'site/SaveSiteUser', objAssign)
            .then(function (res) {
                if (res.data.data == 'TOKEN') {
                    $rootScope.logout();
                }
                if (res.data.success) {
                    $('#SiteUserTable').dataTable().fnClearTable();
                    $('#SiteUserTable').dataTable().fnDestroy();
                    $scope.GetAllSiteUser(function () {
                        InitSiteUserDataTable();
                    });
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
    };

    $scope.init();

})