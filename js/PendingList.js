app.controller('PendingListController', function ($scope, $rootScope, $http, $ionicPopup, $ionicLoading, $compile, $localstorage, $state) {

    $scope.init = function () {
        setTimeout(() => {
            $("#mytext").focus();
        }, 1000);
        $scope.modelAdvanceSearch = null;
        $scope.IsGenmed = $localstorage.get('CustomerGroup') == 'Genmed' ? true : false;
        ManageRole();
        $scope.tab = { selectedIndex: 0 };
        $scope.model = {
            id: null,
            ItemCode: '',
            ItemName: '',
            BranchCode: $localstorage.get('CustomerGroup') == 'Shop' ? $localstorage.get('CustomerBranch') : '',
            Qty: '',
            UOM: '',
            idLocations: $localstorage.get('DefaultLocation'),
            Date: moment().format('DD-MM-YYYY'),
        }
        $scope.Searchmodel = {
            Search: '',
        }
        $rootScope.BackButton = $scope.IsList = true;
        $scope.lstItemsSearch = [];
        $scope.listUOM = []
        $scope.getAllUserLoaction();
        $scope.GetAllBranch()
        $scope.tab = { selectedIndex: 0 };
        setTimeout(function () {
            InitDataTable()
        })


    }

    function ManageRole() {
        var AdminUser = _.filter(JSON.parse($localstorage.get('UserRoles')), function (Role) {
            return Role == "Admin";
        })
        $scope.IsAdmin = AdminUser.length && AdminUser.length > 0 ? true : false;
    }

    $scope.getAllUserLoaction = function () {
        var params = {
            idLocations: $scope.IsAdmin ? "" : $localstorage.get('idLocations')
        }
        $http.get($rootScope.RoutePath + 'customer/GetAllActiveLocations', { params: params }).then(function (res) {
            $scope.lstLocations = res.data.data;
        });
    };

    $scope.GetAllBranch = function () {
        $http.get($rootScope.RoutePath + 'customer/GetAllActiveCustomerbranch').then(function (res) {
            $scope.lstBranch = res.data.data;
        });
    };

    $scope.GetAllItemSearch = function (ItemName) {
        if (ItemName) {
            var params = {
                ItemName: ItemName,
                CustGroupName: $scope.CurrentCustomerGroup == 'Genmed' ? null : $scope.CurrentCustomerGroup
            }
            $http.get($rootScope.RoutePath + 'item/GetAllItemBySearchText', { params: params }).then(function (res) {
                $scope.lstItemsSearch = res.data.data;
            });
        } else {
            $scope.lstItemsSearch = [];
        }
    };

    $scope.AddItemCode = function (t) {
        if (t) {
            $scope.model.ItemCode = t.ItemCode;
            $scope.model.ItemName = t.ItemName;
        }
        $scope.lstItemsSearch = [];

        $http.get($rootScope.RoutePath + 'item/GetAllItemByItemCode?ItemCode=' + $scope.model.ItemCode).then(function (res) {
            $scope.lstItems = res.data.data;
            $scope.model.UOM = $scope.lstItems[0].SalesUOM
            $scope.listUOM = $scope.lstItems[0].itemuoms;

        })
    }

    $scope.formsubmit = false;
    $scope.SavePendingItem = function (form) {

        if (form.$invalid) {
            $scope.formsubmit = true;
        } else {
            if (new Date($scope.model.Date) == 'Invalid Date') {
                $scope.model.Date = moment().set({ 'date': $scope.model.Date.split('-')[0], 'month': $scope.model.Date.split('-')[1] - 1, 'year': $scope.model.Date.split('-')[2] }).format('YYYY-MM-DD');
            } else {
                if (moment($scope.model.Date, "DD-MM-YYYY").format('YYYY-MM-DD') == 'Invalid date') {
                    $scope.model.Date = moment($scope.model.Date).format('YYYY-MM-DD');

                } else {
                    $scope.model.Date = moment($scope.model.Date).format('YYYY-MM-DD');
                }
            }
            $rootScope.ShowLoader();
            $http.post($rootScope.RoutePath + 'pendinglist/SavePendingList', $scope.model).then(function (res) {
                if (res.data.success) {
                    $ionicLoading.show({ template: 'Item added in pending list successfully' });
                    setTimeout(function () {
                        $ionicLoading.hide()
                    }, 1000);
                    $scope.init()
                }
            });
        }
    }


    //Table function End
    $scope.ResetModel = function () {
        $scope.model = {
            id: null,
            ItemCode: '',
            ItemName: '',
            BranchCode: $localstorage.get('CustomerGroup') == 'Shop' ? $localstorage.get('CustomerBranch') : '',
            Qty: '',
            UOM: '',
            idLocations: $localstorage.get('CustomerGroup') == 'Shop' ? $localstorage.get('CustomerGroupLocatio') : '',
            Date: moment().format('DD-MM-YYYY'),
        }
        $scope.SelectedTab = 'Details';
        $scope.Searchmodel = {
            Search: '',
        }
        $('#PendingListTable').dataTable().fnClearTable();
        $('#PendingListTable').dataTable().fnDestroy();
        setTimeout(function () {
            InitDataTable();
        })
    };

    $rootScope.ResetAll = $scope.init;

    $scope.Add = function () {
        $scope.formsubmit = false;
        $rootScope.BackButton = $scope.IsList = false;
    }

    $scope.FilterData = function () {
        $('#PendingListTable').dataTable().api().ajax.reload();
    }

    $scope.EnableFilterOption = function () {
        $(function () {
            $(".CustFilter").slideToggle();
        });
    };

    $scope.FilterAdvanceData = function (o) {
        console.log(o);
        if (o != null) {
            $scope.modelAdvanceSearch = o;
        }
        $('#PendingListTable').dataTable().api().ajax.reload();
        // InitDataTable();
    }

    function InitDataTable() {
        $('#PendingListTable').DataTable({
            "processing": true,
            "dom": 'rt<"bottom"<"left"<"length"l><"info"i>><"right"<"pagination"p>>>',
            "serverSide": true,
            "responsive": true,
            "aaSorting": [2, 'desc'],
            "ajax": {
                url: $rootScope.RoutePath + 'pendinglist/GetAllPendingListDynamic',
                data: function (d) {
                    if ($scope.Searchmodel.Search != undefined) {
                        d.search = $scope.Searchmodel.Search;
                    }
                    // d.idLocations = $scope.IsAdmin ? "" : $localstorage.get('idLocations');
                    d.modelAdvanceSearch = $scope.modelAdvanceSearch;
                    console.log(d);

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
            "columns": [
                { "data": null, "sortable": false },
                { "data": "Qty", "defaultContent": "N/A" },
                { "data": "ItemCode", "defaultContent": "N/A" },
                { "data": "item.ItemName", "defaultContent": "N/A" },
                { "data": "BranchCode", "defaultContent": "N/A" },
                { "data": "item.subbrand.SubBrandName", "defaultContent": "N/A" },
                { "data": "Date", "defaultContent": "N/A" },
                // { "data": null },
                { "data": null, "sortable": false, },
            ],
            "columnDefs": [{
                "render": function (data, type, row, meta) {
                    return meta.row + meta.settings._iDisplayStart + 1;
                },
                "targets": 0,
            },
            {
                "render": function (data, type, row, meta) {
                    if (data == '' || data == null) {
                        return 'N/A';
                    }
                    return data;
                },
                "targets": [1, 2, 3, 4, 5],
            },
            {
                "render": function (data, type, row) {
                    var date = '';
                    if (data != null && data != '' && data != undefined) {
                        date = moment.utc(new Date(data)).format('DD-MM-YYYY');
                    } else {
                        date = 'N/A';
                    }

                    return date;
                },
                "targets": 6
            }, {
                "render": function (data, type, row) {
                    var Action = '';
                    if ($localstorage.get('CustomerGroup') == 'Genmed') {
                        Action += '<div layout="row" layout-align="center center">';
                        Action += '<a ng-click="DeletePendingItem(' + row.id + ')" class="btnAction btnAction-error" style="cursor:pointer"><i class="ion-trash-a" title="Delete"></i></a>';
                        Action += '</div>';
                    }

                    return Action;
                },
                "targets": 7
            }
            ]
        });
    }

    $scope.DeletePendingItem = function (id) {
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
                $http.get($rootScope.RoutePath + 'pendinglist/DeletePendingList', {
                    params: params
                }).success(function (data) {
                    if (data.success == true) {
                        $scope.ResetModel();
                    }
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

    $scope.GenerateBill = function () {
        var o = _.findWhere($scope.lstBranch, { Name: $scope.modelAdvanceSearch.BranchCode });

        $rootScope.ObjGenerateBill = {
            BranchCode: $scope.modelAdvanceSearch.BranchCode,
            StartDate: $scope.modelAdvanceSearch.StartDate,
            EndDate: $scope.modelAdvanceSearch.EndDate,
            BranchId: o.id
            // idLocations: $scope.modelAdvanceSearch.idLocations
        };
        $state.go('app.Sales')
    }

    $scope.init();
})