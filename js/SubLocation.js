app.controller('SubLocationController', function ($scope, $compile, $rootScope, $http, $localstorage, $ionicPopup, $state, $ionicLoading, $ionicScrollDelegate) {

    $scope.init = function () {
        setTimeout(() => {
            $("#mytext").focus();
        }, 1000);
        ManageRole();
        $scope.ResetModel();
        $scope.GetAllActiveLocations();
        $rootScope.BackButton = $scope.IsList = true;
    };

    function ManageRole() {
        var AdminUser = _.filter(JSON.parse($localstorage.get('UserRoles')), function (Role) {
            return Role == "Admin";
        })
        $scope.IsAdmin = AdminUser.length && AdminUser.length > 0 ? true : false;
    }

    $scope.GetAllActiveLocations = function () {
        var params = {
            idLocations: $scope.IsAdmin ? "" : $localstorage.get('idLocations')
        }
        $http.get($rootScope.RoutePath + 'customer/GetAllActiveLocations', {
            params: params
        }).then(function (res) {
            $scope.lstLocation = res.data.data;
            setTimeout(function () {
                InitDataTable();
            })
        });
    };

    $scope.FilterData = function () {
        $('#SubLocationTable').dataTable().api().ajax.reload();

    }

    function InitDataTable() {
        $('#SubLocationTable').DataTable({
            "processing": true,
            "dom": 'rt<"bottom"<"left"<"length"l><"info"i>><"right"<"pagination"p>>>',
            "serverSide": true,
            "responsive": true,
            "aaSorting": [1, 'ASC'],
            "ajax": {
                url: $rootScope.RoutePath + 'location/GetAllDynamicSubLocation',
                data: function (d) {
                    if ($scope.Searchmodel.Search != undefined) {
                        d.search = $scope.Searchmodel.Search;
                    }
                    d.idLocations = $scope.IsAdmin ? "" : $localstorage.get('idLocations');
                    return d;
                },
                type: "get",
                dataSrc: function (json) {
                    if (json.success != false) {
                        $scope.lstdata = json.data;
                        return json.data;
                    } else {
                        return [];
                    }
                },
            },
            "createdRow": function (row, data, dataIndex) {
                $compile(angular.element(row).contents())($scope);
            },
            "columns": [{
                "data": null,
                "sortable": false
            },
            {
                "data": "Location",
                "defaultContent": "N/A"
            },
            {
                "data": "Code",
                "defaultContent": "N/A"
            },
            {
                "data": "Name",
                "defaultContent": "N/A"
            },
            {
                "data": null,
                "sortable": false
            },

            ],
            "columnDefs": [{
                "render": function (data, type, row, meta) {
                    return meta.row + meta.settings._iDisplayStart + 1;
                },
                "targets": 0,
            },
            {
                "render": function (data, type, row) {
                    var Action = '<div layout="row" layout-align="center center">';
                    Action += '<a ng-click="CopyToModel(' + row.id + ')" class="btnAction btnAction-edit" style="cursor:pointer"><i class="ion-edit" title="Edit"></i></a>';
                    Action += '<a ng-click="DeleteSubLocation(' + row.id + ')" class="btnAction btnAction-error" style="cursor:pointer"><i class="ion-trash-a" title="Delete"></i></a>';
                    Action += '</div>';
                    return Action;
                },
                "targets": 4
            },

            ]
        });
    }

    $scope.formsubmit = false
    $scope.SaveSubLocation = function (form) {

        if (form.$invalid) {
            $scope.formsubmit = true;
        } else {
            $scope.formsubmit = false;

            if (!$scope.model.id) {
                $scope.model.id = 0;
            }
            $rootScope.ShowLoader();
            $http.post($rootScope.RoutePath + 'location/SaveSubLocations', $scope.model)
                .then(function (res) {
                    if (res.data.data == 'TOKEN') {
                        $rootScope.logout();
                    }
                    if (res.data.success) {
                        $ionicScrollDelegate.scrollTop();
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
    $scope.CopyToModel = function (id) {
        var selectedItem = _.findWhere($scope.lstdata, {
            id: parseInt(id)
        });
        for (var prop in $scope.model) {
            $scope.model[prop] = selectedItem[prop];
        }
        $scope.model.idLocation = $scope.model.idLocation ? $scope.model.idLocation.toString() : '';
        $rootScope.BackButton = $scope.IsList = false;
    };

    $scope.DeleteSubLocation = function (id) {
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
                return $http.get($rootScope.RoutePath + 'location/DeleteSubLocation', {
                    params: {
                        id: id
                    }
                }).then(function (res) {
                    if (res.data.data == 'TOKEN') {
                        $ionicScrollDelegate.scrollTop();
                        $rootScope.logout();
                    }
                    if (res.data.success) {
                        $scope.Cancel();
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
                $scope.Cancel();
            }
        });
    }


    $scope.ResetModel = function () {
        $scope.model = {
            id: '',
            idLocation: '',
            Code: '',
            Name: '',

        };
        $scope.Searchmodel = {
            Search: '',
        }

    };

    $scope.Add = function () {
        $scope.ResetModel();
        $scope.formsubmit = false;
        $rootScope.BackButton = $scope.IsList = false;

    }

    // Alias
    $rootScope.ResetAll = $scope.init;

    $scope.Cancel = function () {
        $scope.ResetModel();
        $rootScope.BackButton = $scope.IsList = true;
        $scope.formsubmit = false;
        $('#SubLocationTable').dataTable().fnClearTable();
        $('#SubLocationTable').dataTable().fnDestroy();
        setTimeout(function () {
            InitDataTable();
        })
    }
    //////////

    $scope.init();

})