app.controller('ShopStockReportController', function ($scope, $rootScope, $http, $ionicPopup, $ionicLoading, $localstorage, $state, $compile) {
    console.log("Shivam")
    $rootScope.BackButton = true;
    $scope.init = function () {
        setTimeout(() => {
            $("#mytext").focus();
        }, 1000);
        $scope.modelAdvanceSearch = null;
        ManageRole();
        $scope.ResetModel();
        setTimeout(function () {
            InitDataTable();
        })
    };

    function ManageRole() {
        var AdminUser = _.filter(JSON.parse($localstorage.get('UserRoles')), function (Role) {
            return Role == "Admin";
        })
        $scope.IsAdmin = AdminUser.length && AdminUser.length > 0 ? true : false;
    }

    //Table function End
    $scope.ResetModel = function () {
        $scope.Searchmodel = {
            Search: '',
        }
        $scope.checkboxmodel = {
            SaleRate: true,
            PurRate: true,
            StockP: true,
            StockM: true,
            SubGroup: false,
            Pack: true,
            BoxPack: false,
            SubCompany: true,
            PurParty: true,
            DrugMaster: true,
            PurGSTRate: true,
            Batch: false,
        }

        $scope.Filtermodel = {
            MainCompany: '',
            SubCompany: '',
            StartDate: moment().format(),
            EndDate: moment().format(),
            ProductGroup: '',
            // ProductSubGroup: ''
        }

        $scope.FinalTotalmodel = {
            PurCount: 0,
            PurAmount: 0.0,
            SaleCount: 0,
            SaleAmount: 0.0,
            ClosingCount: 0,
            ClosingAmount: 0.0,
        }
    };

    $scope.FilterData = function () {
        $('#StockBalanceReportTable').dataTable().api().ajax.reload();
    }

    // $scope.EnableFilterOption = function () {
    //     $(function () {
    //         $(".CustFilter").slideToggle();
    //     });
    // };

    // $scope.FilterAdvanceData = function (o) {
    //     $scope.modelAdvanceSearch = o;
    //     InitDataTable()
    //     // $('#StockBalanceReportTable').dataTable().api().ajax.reload();
    // }

    $scope.FilterTableData = function (o) {
        InitDataTable()
    }

    //Set Table
    function InitDataTable() {
        if ($.fn.DataTable.isDataTable('#StockBalanceReportTable')) {
            $('#StockBalanceReportTable').DataTable().destroy();
        }
        $('#StockBalanceReportTable').DataTable({
            "processing": true,
            "dom": 'rt<"bottom"<"left"<"length"l><"info"i>><"right"<"pagination"p>>>',
            "serverSide": true,
            "responsive": true,
            "aaSorting": [2, 'ASC'],
            "ajax": {
                url: $rootScope.RoutePath + 'report/shopstockbalancereport',
                data: function (d) {
                    if ($scope.Searchmodel.Search != undefined) {
                        d.search = $scope.Searchmodel.Search;
                    }

                    d.CustomerGroup = $localstorage.get('CustomerGroup')
                    d.idLocations = $scope.IsAdmin ? "" : $localstorage.get('idLocations');
                    // d.modelAdvanceSearch = $scope.modelAdvanceSearch;
                    $scope.order = d.order;
                    $scope.columns = d.columns;
                    d.StartDate = $scope.Filtermodel.StartDate
                    d.EndDate = $scope.Filtermodel.EndDate
                    console.log(d)
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
                { "data": "ItemCode", "defaultContent": "N/A" },
                { "data": "itemname", "defaultContent": "N/A" },
                { "data": "BatchNumber", "defaultContent": "N/A" },
                { "data": "UOM", "defaultContent": "N/A" },
                { "data": "Type", "defaultContent": "N/A" },
                { "data": "NetTotal", "defaultContent": "N/A" },
                { "data": "QTY", "defaultContent": "N/A" },

            ],
            "columnDefs": [{
                "render": function (data, type, row, meta) {
                    return meta.row + meta.settings._iDisplayStart + 1;
                },
                "targets": 0,
            },

            ]
        });

    }

    $scope.ShowHideCol = function () {
        // $('#StockBalanceReportTable').dataTable().api().ajax.reload();
        InitDataTable()
    }

    $scope.GotoDrug = function (id) {
        var SelectedItem = _.findWhere($scope.lstdata, { id: id });
        $rootScope.SelectedDrug = SelectedItem.Drug
        $state.go('app.DrugMaster')
    }

    $scope.Export = function () {
        if ($scope.Searchmodel.Search != undefined) {
            var search = $scope.Searchmodel.Search;
        }
        var Batch = $scope.checkboxmodel.Batch
        var CurrentOffset = $scope.CurrentOffset;
        var idLocations = $scope.IsAdmin ? "" : $localstorage.get('CustomerGroup') == 'Genmed' ? "" : $localstorage.get('idLocations');
        var CustomerGroup = $localstorage.get('CustomerGroup')
        var Param = "?search=" + search + "&idLocations=" + idLocations + "&Batch=" + Batch + "&CustomerGroup=" + CustomerGroup + "&StartDate=" + moment($scope.Filtermodel.StartDate).format('YYYY-MM-DD') + "&EndDate=" + moment($scope.Filtermodel.EndDate).format('YYYY-MM-DD') + "&columns=" + JSON.stringify($scope.columns) + "&order=" + JSON.stringify($scope.order);

        window.location = $rootScope.RoutePath + "report/ExportshopstockbalanceReport" + Param;
    }
    // Alias
    $rootScope.ResetAll = $scope.init;

    $scope.init();

});