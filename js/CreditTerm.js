app.controller('CreditTermController', function ($scope, $rootScope, $http, $ionicPopup, $ionicLoading, $localstorage, $state) {
    var vm = this;

    //////////
    $scope.init = function () {
        setTimeout(() => {
            $("#mytext").focus();
        }, 1000);
        $scope.tab = { selectedIndex: 0 };
        $scope.ResetModel();
        $scope.GetAllCreditTerm();
        $rootScope.BackButton = $scope.IsList = true;
    };

    $scope.GetAllCreditTerm = function () {
        $http.get($rootScope.RoutePath + 'creditterm/GetAllCreditTerm').then(function (res) {
            $scope.lstCreditTerm = res.data.data;
            $scope.TotalRecord = $scope.lstCreditTerm.length;
            $(document).ready(function () {
                $('#CreditTermTable').dataTable().fnClearTable();
                $('#CreditTermTable').dataTable().fnDestroy();
                setTimeout(function () {
                    $('#CreditTermTable').DataTable({
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
            $('#CreditTermTable').dataTable().fnFilter($scope.Searchmodel.Search);
        } else {
            $('#CreditTermTable').dataTable().fnFilter("");
        }
    }

    $scope.formsubmit = false;
    $scope.SaveCreditTerm = function (form) {
        if (form.$valid) {
            if (!$scope.model.id) {
                $scope.model.id = 0;
            }
            $rootScope.ShowLoader();
            $http.post($rootScope.RoutePath + 'creditterm/SaveCreditTerm', $scope.model)
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
        $scope.model.IsActive = selectedItem.IsActive == 1 ? true : false;
    };

    $scope.DeleteCreditTerm = function (id) {
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
                $http.get($rootScope.RoutePath + 'creditterm/DeleteCreditTerm', {
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
            CreditTerm: '',
            TermString: '',
            IsActive: true,
        };
        $scope.Searchmodel = {
            Search: '',
        }
        $scope.formsubmit = false;
    };

    $rootScope.ResetAll = $scope.init;

    $scope.Add = function () {
        $rootScope.BackButton = $scope.IsList = false;
    }
    $scope.init();

})