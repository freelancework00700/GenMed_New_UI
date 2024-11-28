app.controller('EmployeeController', function ($scope, $rootScope, $http, $localstorage, $ionicPopup, $state, $ionicLoading, $ionicScrollDelegate, $ionicModal, $compile) {
    $scope.init = function () {
        setTimeout(() => {
            $("#mytext").focus();
        }, 1000);
        $scope.ResetModel();
        $scope.GetAllActiveDepartment();
        setTimeout(function () {
            InitDataTable();
        })
        $rootScope.BackButton = $scope.IsList = true;
    };

    $scope.GetAllActiveDepartment = function () {
        $http.get($rootScope.RoutePath + 'department/GetAllActiveDepartment').then(function (res) {
            $scope.lstDepartment = res.data.data;
        });
    };


    $scope.FilterData = function () {
        $('#EMPTable').dataTable().api().ajax.reload();

    }

    function InitDataTable() {
        if ($.fn.DataTable.isDataTable('#EMPTable')) {
            $('#EMPTable').DataTable().destroy();
        }
        $('#EMPTable').DataTable({
            "processing": true,
            "dom": 'rt<"bottom"<"left"<"length"l><"info"i>><"right"<"pagination"p>>>',
            "serverSide": true,
            "responsive": true,
            "aaSorting": [1, 'ASC'],
            "ajax": {
                url: $rootScope.RoutePath + 'employee/GetAllDynamicEmployee',
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
                "data": "username",
                "defaultContent": "N/A"
            },
            {
                "data": "EmailAddress",
                "defaultContent": "N/A"
            },
            {
                "data": "PhoneNumber",
                "defaultContent": "N/A"
            },
            {
                "data": "Location",
                "defaultContent": "N/A"
            },
            {
                "data": "Department",
                "defaultContent": "N/A"
            },
            {
                "data": "Is Active",
                "defaultContent": "N/A"
            },
            {
                "data": null,
                "sortable": false,
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
                    Action += '<a ng-click="CopyToModel(' + row.id + ')" class="btnAction btnAction-edit" style="cursor:pointer;margin-right:3px;"><i class="ion-edit" title="Edit"></i></a>';
                    Action += '<a ng-click="DeleteEmployeeMaster(' + row.id + ')" class="btnAction btnAction-error" style="cursor:pointer;margin-right:3px;"><i class="ion-trash-a" title="Delete"></i></a>';
                    Action += '<a ng-click="OpenModelLocation(' + row.id + ')" class="btnAction btnAction-edit" style="cursor:pointer"><i class="ion-plus" title="Assign Employee Location"></i></a>';
                    Action += '</div>';
                    return Action;
                },
                "targets": 7
            },
            {
                "render": function (data, type, row) {
                    var Action = '<div layout="row" layout-align="center center">';
                    if (data) {
                        Action += '<span style="font-size: 20px;color: green">✔</span>';
                    } else {
                        Action += ' <span style="font-size: 20px;color: red">✖</span>';
                    }
                    Action += '</div>';
                    return Action;
                },
                "targets": 6
            },
            ]
        });
    }

    $scope.formsubmit = false

    $scope.SaveEmployeeMaster = function (form) {
        if (form.$invalid) {
            $scope.formsubmit = true;
            return;
        } else {
            if (!$scope.model.id && $scope.model.password != $scope.model.ConfirmPassword) {
                $ionicLoading.show({
                    template: "Password and Confrim Password Not Same."
                });
                setTimeout(function () {
                    $ionicLoading.hide()
                }, 1000);
                return;
            }
            $scope.formsubmit = false;
            if (!$scope.model.id) {
                $scope.model.id = 0;
                $scope.formsubmit = true
            }

            $http.post($rootScope.RoutePath + 'employee/SaveEmployeeMaster', $scope.model)
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
    $scope.CopyToModel = function (idEMP) {
        var selectedItem = _.findWhere($scope.lstdata, { id: parseInt(idEMP) });
        $rootScope.BackButton = $scope.IsList = false;
        for (var prop in $scope.model) {
            $scope.model[prop] = selectedItem[prop];
        }
        $scope.model.DefaultDepartment = $scope.model.DefaultDepartment.toString();
        setTimeout(function () {
            $("#PhoneNumber").intlTelInput({
                utilsScript: "lib/intl/js/utils.js"
            });
            $("#PhoneNumber").intlTelInput("setNumber", $scope.model.PhoneNumber);
        }, 500)
    };

    $scope.DeleteEmployeeMaster = function (id) {
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
                return $http.get($rootScope.RoutePath + 'employee/DeleteEmployeeMaster', {
                    params: {
                        id: id
                    }
                }).then(function (res) {
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
            } else {
                $scope.init();
            }
        });
    }


    $scope.ResetModel = function () {
        $scope.model = {
            id: '',
            username: '',
            EmailAddress: '',
            PhoneNumber: '',
            password: '',
            ConfirmPassword: '',
            DefaultDepartment: '',
            DefaultLocation: null,
            isActive: true
        };

        $scope.Searchmodel = {
            Search: '',
            SearchLocation: ''
        }

    };

    $scope.Add = function () {
        $scope.formsubmit = false;
        $rootScope.BackButton = $scope.IsList = false;
        setTimeout(function () {
            $("#PhoneNumber").intlTelInput({
                utilsScript: "lib/intl/js/utils.js"
            });
        }, 500)
    }

    // Alias
    $rootScope.ResetAll = $scope.init;

    //////////LOcation Assign
    $scope.idUser = null;
    $ionicModal.fromTemplateUrl('UserLocation.html', {
        scope: $scope,
        animation: 'slide-in-up'
    }).then(function (modal) {

        $scope.modal = modal;
    });
    $scope.OpenModelLocation = function (idUser) {
        $('#LocationTable').dataTable().fnClearTable();
        $('#LocationTable').dataTable().fnDestroy();
        $scope.idUser = idUser;
        $scope.GetAllAssignLocations(function () {
            InitLocationDataTable();
        });
        $scope.modal.show();
    };
    $scope.closeModal = function () {
        $scope.idUser = null;
        $scope.modal.hide();
    }; // Cleanup the modal when we're done with it!

    $scope.$on('$destroy', function () {
        $scope.idUser = null;
        $scope.modal.remove();
    })

    $scope.GetAllAssignLocations = function (returncall) {
        var params = {
            idUser: $scope.idUser
        }
        $http.get($rootScope.RoutePath + 'user/GetAllUserAssignlocations', {
            params: params
        }).then(function (res) {
            $scope.lstLocation = res.data;
            returncall();
        });
    };

    function InitLocationDataTable() {
        setTimeout(function () {
            $('#LocationTable').DataTable({
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
                }, { "width": "10%", "targets": 0 }]
            });
        }, 100)
    }
    $scope.FilterDataLocation = function () {
        if ($scope.Searchmodel.SearchLocation != '' && $scope.Searchmodel.SearchLocation != null && $scope.Searchmodel.SearchLocation != undefined) {
            $('#LocationTable').dataTable().fnFilter($scope.Searchmodel.SearchLocation);
        } else {
            $('#LocationTable').dataTable().fnFilter("");
        }
    }

    $scope.SaveAssignLocation = function () {
        var LocationList = _.where($scope.lstLocation, {
            isSelect: 1
        });
        LocationList = _.pluck(LocationList, 'id');
        var objAssign = {
            idUser: $scope.idUser,
            SelectLocation: LocationList,
        }
        $http.post($rootScope.RoutePath + 'user/SaveUsesLocation', objAssign)
            .then(function (res) {
                if (res.data.data == 'TOKEN') {
                    $rootScope.logout();
                }
                if (res.data.success) {
                    $('#LocationTable').dataTable().fnClearTable();
                    $('#LocationTable').dataTable().fnDestroy();
                    $scope.GetAllAssignLocations(function () {
                        InitLocationDataTable();
                        $scope.GetAllUsers();
                    });
                }
                $ionicLoading.show({
                    template: res.data.message.replace('User', 'Employee')
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
    $(document).keyup(function (e) {
        if (e.key === "Escape") { // escape key maps to keycode `27`
            // <DO YOUR WORK HERE>
            $scope.closeModal();
        }
    });

    $scope.init();

})