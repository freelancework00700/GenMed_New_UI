app.controller('LocationController', function ($scope, $rootScope, $http, $ionicPopup, $localstorage, $state, $ionicLoading) {

    $scope.init = function () {
        setTimeout(() => {
            $("#mytext").focus();
        }, 1000);
        $scope.ResetModel();
        $scope.idLocations = $localstorage.get('idLocations')
        ManageRole()
        $scope.GetAllLocations();
        $rootScope.BackButton = $scope.IsList = true;
        $scope.isValidMobile = false
        $scope.isValidMobile2 = false
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
    }

    $scope.GetAllLocations = function () {
        $http.get($rootScope.RoutePath + 'location/GetAllLocations').then(function (res) {
            $scope.lstLocation = res.data.data;
            if ($scope.IsCustomer == true) {
                $scope.lstLocation = _.where($scope.lstLocation, { id: parseInt($scope.idLocations) });
            }
            $scope.lstLocationsDefualt = res.data.data;
            $scope.TotalRecord = $scope.lstLocation.length;
            $(document).ready(function () {
                $('#LocationTable').dataTable().fnClearTable();
                $('#LocationTable').dataTable().fnDestroy();
                setTimeout(function () {
                    $('#LocationTable').DataTable({
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
            $('#LocationTable').dataTable().fnFilter($scope.Searchmodel.Search);
        } else {
            $('#LocationTable').dataTable().fnFilter("");
        }
    }

    $scope.ValidateMobileNumber = function () {
        if (!$("#Phone1").intlTelInput("isValidNumber")) {
            $scope.isValidMobile = true
            if ($scope.model.Phone1.toString().length <= 2) {
                $scope.isValidMobile = false
            }
        } else {
            $scope.isValidMobile = false
        }
    }

    $scope.ValidateMobileNumber2 = function () {
        if (!$("#Phone2").intlTelInput("isValidNumber")) {
            $scope.isValidMobile2 = true
            if ($scope.model.Phone2.toString().length <= 2) {
                $scope.isValidMobile2 = false
            }
        } else {
            $scope.isValidMobile2 = false
        }
    }
    $scope.formsubmit = false
    $scope.SaveLocation = function (form) {

        if (form.$valid) {

            // if (!$("#Phone1").intlTelInput("isValidNumber")) {
            //     $scope.isValidMobile = true
            //     if ($scope.model.Phone1.toString().length <= 2) {
            //         $scope.isValidMobile = false
            //         $scope.model.Phone1 = '';
            //     } else {
            //         return;
            //     }

            // }
            // if (!$("#Phone2").intlTelInput("isValidNumber")) {
            //     $scope.isValidMobile2 = true
            //     if ($scope.model.Phone2.toString().length <= 2) {
            //         $scope.isValidMobile2 = false
            //         $scope.model.Phone2 = '';
            //     } else {
            //         return;
            //     }

            // }
            // $scope.isValidMobile = false
            // $scope.isValidMobile2 = false
            if (!$scope.model.id) {
                $scope.model.id = 0;
            }
            $rootScope.ShowLoader();
            $http.post($rootScope.RoutePath + 'location/SaveLocations', $scope.model)
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

        $scope.model.id = selectedItem['id'];
        $scope.model.Name = selectedItem['Name'];
        $scope.model.Description = selectedItem['Description'];
        $scope.model.Address1 = selectedItem['Address1'];
        $scope.model.Address2 = selectedItem['Address2'];
        $scope.model.Address3 = selectedItem['Address3'];
        $scope.model.Contact = selectedItem['Contact'];
        $scope.model.IsActive = selectedItem['IsActive'];

        $scope.model.PostCode = parseInt(selectedItem['PostCode']);
        $scope.model.Phone1 = selectedItem['Phone1'];
        $scope.model.Phone2 = selectedItem['Phone2'];

        setTimeout(function () {
            $("#Phone1").intlTelInput({
                utilsScript: "lib/intl/js/utils.js"
            });
            $("#Phone2").intlTelInput({
                utilsScript: "lib/intl/js/utils.js"
            });
        }, 500)
        $("#Phone1").intlTelInput("setNumber", $scope.model.Phone1);
        $("#Phone2").intlTelInput("setNumber", $scope.model.Phone2);

    };

    $scope.DeleteLocation = function (id) {
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
                $http.get($rootScope.RoutePath + 'location/DeleteLocations', {
                    params: params
                }).success(function (data) {
                    if (data.data == 'TOKEN') {
                        $rootScope.logout();
                    }
                    if (data.success) {
                        $scope.init();
                    }
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
            Name: '',
            Description: '',
            Address1: '',
            Address2: '',
            Address3: '',
            PostCode: '',
            Phone1: '',
            Phone2: '',
            Contact: '',
            Note: '',
            IsActive: true
        };
        $scope.Searchmodel = {
            Search: '',
        }
        $scope.formsubmit = false;

    };

    $scope.Add = function () {
        $rootScope.BackButton = $scope.IsList = false;
        setTimeout(function () {
            $("#Phone1").intlTelInput({
                utilsScript: "lib/intl/js/utils.js"
            });
            $("#Phone2").intlTelInput({
                utilsScript: "lib/intl/js/utils.js"
            });
        }, 500)
    }

    // Alias
    $rootScope.ResetAll = $scope.init;

    //////////

    $scope.init();

})