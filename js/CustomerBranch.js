app.controller('CustomerBranchController', function ($scope, $rootScope, $http, $ionicPopup, $ionicLoading, $localstorage, $state) {
    var vm = this;

    //////////

    $scope.init = function () {
        setTimeout(() => {
            $("#mytext").focus();
        }, 1000);
        $scope.tab = { selectedIndex: 0 };
        $scope.ResetModel();
        $scope.GetAllCustomerBranch();
        $rootScope.BackButton = $scope.IsList = true;
        $scope.isValidMobile = false
        $scope.isValidMobile2 = false
    };

    $scope.GetAllCustomerBranch = function () {
        $http.get($rootScope.RoutePath + 'customerBranch/GetAllCustomerbranch?Branch=' + $localstorage.get('CustomerBranch')).then(function (res) {
            $scope.lstCustomerBranch = res.data.data;
            $scope.TotalRecord = $scope.lstCustomerBranch.length;
            $(document).ready(function () {
                $('#CustomerBranchTable').dataTable().fnClearTable();
                $('#CustomerBranchTable').dataTable().fnDestroy();
                setTimeout(function () {
                    $('#CustomerBranchTable').DataTable({
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
            $('#CustomerBranchTable').dataTable().fnFilter($scope.Searchmodel.Search);
        } else {
            $('#CustomerBranchTable').dataTable().fnFilter("");
        }
    }

    // $scope.PreventMobileNumber1 = function() {
    //     if ($scope.model.Phone1 != null && $scope.model.Phone1 != '' && $scope.model.Phone1.toString().length > 15) {
    //         $scope.model.Phone1 = parseInt($scope.model.Phone1.toString().substring(0, 15));
    //     }
    // }

    // $scope.PreventMobileNumber2 = function() {
    //     if ($scope.model.Phone2 != null && $scope.model.Phone2 != '' && $scope.model.Phone2.toString().length > 15) {
    //         $scope.model.Phone2 = parseInt($scope.model.Phone2.toString().substring(0, 15));
    //     }
    // }
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
    $scope.formsubmit = false;
    $scope.SaveCustomerBranch = function (form) {
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
            $http.post($rootScope.RoutePath + 'customerBranch/SaveCustomerbranch', $scope.model)
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

        $scope.model.id = selectedItem['id'];
        $scope.model.Name = selectedItem['Name'];
        $scope.model.Description = selectedItem['Description'];
        $scope.model.Address1 = selectedItem['Address1'];
        $scope.model.Address2 = selectedItem['Address2'];
        $scope.model.Address3 = selectedItem['Address3'];
        $scope.model.Contact = selectedItem['Contact'];
        $scope.model.Latitude = selectedItem['Latitude'];
        $scope.model.Longitude = selectedItem['Longitude'];
        $scope.model.IsActive = selectedItem['IsActive'];


        $scope.model.PostCode = parseInt(selectedItem['PostCode']);
        $scope.model.Phone1 = selectedItem['Phone1'];
        $scope.model.Phone2 = selectedItem['Phone2'];
        $scope.model.Note = selectedItem['Note'];

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

    $scope.DeleteCustomerBranch = function (id) {

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
                $http.get($rootScope.RoutePath + 'customerBranch/DeleteCustomerbranch', {
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
            Name: '',
            Description: '',
            Address1: '',
            Address2: '',
            Address3: '',
            PostCode: '',
            Phone1: '',
            Phone2: '',
            Contact: '',
            Latitude: '',
            Longitude: '',
            Note: '',
            IsActive: true
        };
        $scope.Searchmodel = {
            Search: '',
        }
        $scope.formsubmit = false;
    };

    // Alias
    $rootScope.ResetAll = $scope.init;

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
    $scope.init();

})