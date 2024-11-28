app.controller('UsersController', function ($scope, $rootScope, $http, $localstorage, $ionicPopup, $state, $ionicLoading, $ionicScrollDelegate, $ionicModal) {
    $scope.init = function () {
        setTimeout(() => {
            $("#mytext").focus();
        }, 1000);
        $scope.ResetModel();
        ManageRole()
        $scope.GetAllUserRole();
        $scope.GetAllActiveDepartment();
        $scope.GetAllUsers($scope.Searchmodel.SearchRole);
        $rootScope.BackButton = $scope.IsList = true;
        $scope.isValidMobile = false;
        $scope.IsEdit = false;
    };

    function ManageRole() {
        var AdminUser = _.filter(JSON.parse($localstorage.get('UserRoles')), function (Role) {
            return Role == "Admin";
        })
        $scope.IsAdmin = AdminUser.length && AdminUser.length > 0 ? true : false;

        var CustomerUser = _.filter(JSON.parse($localstorage.get('UserRoles')), function (Role) {
            return Role == "Customer";
        })
        $scope.IsCustomer = CustomerUser.length && CustomerUser.length > 0 ? true : false;

        // if ($scope.IsCustomer) {
        //     $scope.GetCustomerId();
        //     $scope.GetAllSetting();
        // }
    }


    $scope.GetAllUserRole = function () {
        $http.get($rootScope.RoutePath + 'roles/GetAllActiveRoles').then(function (res) {
            for (var index = 0; index < res.data.data.length; index++) {
                res.data.data[index].checked = false;
            }
            $scope.lstRoles = res.data.data;
        });
    };

    $scope.GetAllActiveDepartment = function () {
        $http.get($rootScope.RoutePath + 'department/GetAllActiveDepartment').then(function (res) {
            $scope.lstDepartment = res.data.data;
        });
    };

    $scope.GetAllUsers = function (o) {
        if (o == undefined) {
            o = ''
        }
        var idLocations = $scope.IsAdmin ? "" : "";
        // var idLocations = $scope.IsAdmin ? "" : $localstorage.get('idLocations');
        console.log(o);
        console.log(idLocations);

        $http.get($rootScope.RoutePath + 'user/GetAllUserinformations?UserRole=' + o + '&&idLocations=' + idLocations).then(function (res) {
            console.log(res);

            $scope.lstUser = res.data.data;
            $scope.lstUsersDefualt = res.data.data;
            $scope.TotalRecord = $scope.lstUser.length;
            $(document).ready(function () {
                $('#UserTable').dataTable().fnClearTable();
                $('#UserTable').dataTable().fnDestroy();
                setTimeout(function () {
                    $('#UserTable').DataTable({
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

    $scope.EnableFilterOption = function () {
        $(function () {
            $(".CustFilter").slideToggle();
        });
    };

    $scope.FilterData = function () {
        if ($scope.Searchmodel.Search != '' && $scope.Searchmodel.Search != null && $scope.Searchmodel.Search != undefined) {
            $('#UserTable').dataTable().fnFilter($scope.Searchmodel.Search);
        } else {
            $('#UserTable').dataTable().fnFilter("");
        }
    };

    $scope.ValidateMobileNumber = function () {
        if (!$("#PhoneNumber").intlTelInput("isValidNumber")) {
            $scope.isValidMobile = true
        } else {
            $scope.isValidMobile = false
        }
    };

    $scope.formsubmit = false
    $scope.SaveUser = function (form) {

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
            if ($scope.IsSelectPosUser && $scope.model.pospasscode != $scope.model.cpospasscode) {
                $ionicLoading.show({
                    template: "Pos Passcode and Confrim Passcode Not Same."
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

            var FindUserRole = _.filter($scope.lstRoles, function (item) {
                if (item.checked) {
                    return item;
                }
            })
            if (FindUserRole.length == 0) {
                $ionicLoading.show({
                    template: 'Please Select atleast One Role...'
                });
                setTimeout(function () {
                    $ionicLoading.hide()
                }, 1000);
                return
            }
            $scope.model.LstRole = FindUserRole;
            // console.log($scope.model)
            $rootScope.ShowLoader();
            $http.post($rootScope.RoutePath + 'user/SaveUserinformations', $scope.model)
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

    $scope.CopyToModel = function (selectedItem) {
        $scope.IsEdit = true;
        $rootScope.BackButton = $scope.IsList = false;
        for (var prop in $scope.model) {
            $scope.model[prop] = selectedItem[prop];
        }
        if (selectedItem.userroles.length > 0) {

            for (var i = 0; i < selectedItem.userroles.length; i++) {
                var obj = _.findWhere($scope.lstRoles, {
                    id: parseInt(selectedItem.userroles[i].idRole)
                })
                obj.checked = true;
            }
        }
        $scope.model.cpospasscode = $scope.model.pospasscode;
        $scope.model.isActive = $scope.model.isActive == 1 ? true : false;
        $scope.model.DefaultDepartment = $scope.model.DefaultDepartment != null ? $scope.model.DefaultDepartment.toString() : '';
        $scope.changeRole();
        setTimeout(function () {
            $("#PhoneNumber").intlTelInput({
                utilsScript: "lib/intl/js/utils.js"
            });
            $("#PhoneNumber").intlTelInput("setNumber", $scope.model.PhoneNumber);
        }, 500)
    };

    $scope.DeleteUser = function (id) {
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
                return $http.get($rootScope.RoutePath + 'user/DeleteUserinformations', {
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
    };

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
            isActive: true,
            LstRole: [],
            pospasscode: '',
            cpospasscode: '',
        };

        $scope.Searchmodel = {
            Search: '',
            SearchLocation: '',
            SearchRole: ''
        }

    };

    $scope.Add = function () {
        $scope.formsubmit = false;
        $scope.IsEdit = false;
        $rootScope.BackButton = $scope.IsList = false;

        setTimeout(function () {
            $("#PhoneNumber").intlTelInput({
                utilsScript: "lib/intl/js/utils.js"
            });
        }, 500)
    };

    $rootScope.ResetAll = $scope.init;

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
    };

    $scope.$on('$destroy', function () {
        $scope.idUser = null;
        $scope.modal.remove();
    });

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
    };

    $scope.FilterDataLocation = function () {
        if ($scope.Searchmodel.SearchLocation != '' && $scope.Searchmodel.SearchLocation != null && $scope.Searchmodel.SearchLocation != undefined) {
            $('#LocationTable').dataTable().fnFilter($scope.Searchmodel.SearchLocation);
        } else {
            $('#LocationTable').dataTable().fnFilter("");
        }
    };

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
                    $scope.closeModal();
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

    $scope.IsSelectPosUser = false;

    $scope.changeRole = function () {
        var findinArray = _.findWhere($scope.lstRoles, { Name: "Pos User", checked: true });
        if (findinArray) {
            $scope.IsSelectPosUser = true;
        } else {
            $scope.IsSelectPosUser = false;
        }
    };

    $scope.init();

}).directive('passcodenumbersOnly', function () {
    return {
        require: 'ngModel',
        link: function (scope, element, attr, ngModelCtrl) {
            function fromUser(text) {
                if (text) {
                    var transformedInput = text.replace(/[^0-9]/g, '');
                    if (transformedInput !== text) {
                        ngModelCtrl.$setViewValue(transformedInput);
                        ngModelCtrl.$render();
                    }
                    return transformedInput;
                }
                return undefined;
            }
            ngModelCtrl.$parsers.push(fromUser);
        }
    };
});