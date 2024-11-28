app.controller('TaskTypeController', function ($scope, $rootScope, $http, $ionicPopup, $ionicLoading, $localstorage, $state) {

    var vm = this;

    $scope.init = function () {
        setTimeout(() => {
            $("#mytext").focus();
        }, 1000);
        $scope.MonthList = [{ value: 1, month: 'January' }, { value: 2, month: 'February' }, { value: 3, month: 'March' }, { value: 4, month: 'April' }, { value: 5, month: 'May' }, { value: 6, month: 'June' }, { value: 7, month: 'July' }, { value: 8, month: 'August' }, { value: 9, month: 'September' }, { value: 10, month: 'October' }, { value: 11, month: 'November' }, { value: 12, month: 'December' }];
        $scope.ResetModel();
        $scope.GetAllTaskType();
        $rootScope.BackButton = $scope.IsList = true;
        $scope.IsEdit = false;
    };

    $scope.GetAllTaskType = function () {
        $http.get($rootScope.RoutePath + 'task/GetAllTaskType').then(function (res) {
            $scope.lstTaskType = _.filter(res.data.data, function (p) {
                var MonthExist = _.findWhere($scope.MonthList, { value: p.MonthValue });
                if (MonthExist) {
                    p.Month = MonthExist.month;
                }
                return p;
            });
            $(document).ready(function () {
                $('#TaskTypeTable').dataTable().fnClearTable();
                $('#TaskTypeTable').dataTable().fnDestroy();
                setTimeout(function () {
                    $('#TaskTypeTable').DataTable({
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
            $('#TaskTypeTable').dataTable().fnFilter($scope.Searchmodel.Search);
        } else {
            $('#TaskTypeTable').dataTable().fnFilter("");
        }
    }

    $scope.formsubmit = false;
    $scope.SaveTaskType = function (form) {

        if (form.$valid) {
            if (!$scope.model.id) {
                $scope.model.id = 0;
            }
            $rootScope.ShowLoader();
            $http.post($rootScope.RoutePath + 'task/SaveTaskType', $scope.model)
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

    $scope.CopyToModel = function (selectedItem) {
        $rootScope.BackButton = $scope.IsList = false;
        $scope.IsEdit = true;
        for (var prop in $scope.model) {
            $scope.model[prop] = selectedItem[prop];
        }
    };

    $scope.DeleteTaskType = function (id) {
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
                $http.get($rootScope.RoutePath + 'task/DeleteTaskType', {
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
    };

    $scope.ResetModel = function () {
        $scope.model = {
            id: 0,
            Type: '',
            MonthValue: null,
            DateValue: 1
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