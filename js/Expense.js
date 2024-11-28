app.controller('ExpenseController', function ($scope, $rootScope, $http, $ionicPopup, $ionicLoading, $localstorage, $state) {
    var vm = this;

    //////////
    $scope.init = function () {
        $scope.tab = { selectedIndex: 0 };
        $scope.ResetModel();
        $scope.GetAllActiveExpensecategory();
        $scope.GetAllExpense();
        $rootScope.BackButton = $scope.IsList = true;
    };

    $scope.GetAllActiveExpensecategory = function () {
        $http.get($rootScope.RoutePath + 'expense/GetAllActiveExpensecategory').then(function (res) {
            $scope.lstExpenseCategory = res.data.data;
            $scope.GetAllActiveLocations();

        });
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

    $scope.Display = function (o) {
        $scope.model.LocationName = _.findWhere($scope.lstLocation, { id: o.IdLocation }).Name;
    }

    $scope.GetAllExpense = function () {
        $http.get($rootScope.RoutePath + 'expense/GetAllExpense').then(function (res) {
            $scope.lstExpense = res.data.data;
            $scope.TotalRecord = $scope.lstExpense.length;
            $(document).ready(function () {
                $('#ExpenseTable').dataTable().fnClearTable();
                $('#ExpenseTable').dataTable().fnDestroy();
                setTimeout(function () {
                    $('#ExpenseTable').DataTable({
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
            $('#ExpenseTable').dataTable().fnFilter($scope.Searchmodel.Search);
        } else {
            $('#ExpenseTable').dataTable().fnFilter("");
        }
    }

    $scope.formsubmit = false;
    $scope.SaveExpense = function (form) {

        if (form.$valid) {
            if (!$scope.model.id) {
                $scope.model.id = 0;
            }
            $rootScope.ShowLoader();
            $http.post($rootScope.RoutePath + 'expense/SaveExpense', $scope.model)
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
        $scope.model.idexpensecategory = ($scope.model.idexpensecategory).toString();
        $scope.model.ExpenseDate = moment($scope.model.ExpenseDate).format('DD-MM-YYYY');
        $scope.Display(selectedItem);
    };

    $scope.DeleteExpense = function (id) {
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
                $http.get($rootScope.RoutePath + 'expense/DeleteExpense', {
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
            idexpensecategory: "",
            ExpenseName: "",
            Amount: "",
            ExpenseDate: moment().format('DD-MM-YYYY'),
            IdLocation: null,
            LocationName: '',
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