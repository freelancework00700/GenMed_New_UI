app.controller('PriceListReportController', function ($scope, $rootScope, $http, $ionicPopup, $ionicLoading, $localstorage, $state, $compile) {

    $rootScope.BackButton = true;
    $scope.init = function () {
        setTimeout(() => {
            $("#mytext").focus();
        }, 1000);
        $scope.modelAdvanceSearch = null;
        ManageRole();
        $scope.GetAllBrand();
        $scope.GetAllSubBrand();
        $scope.GetAllParentItemCategory();
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

    $scope.GetAllBrand = function () {
        $http.get($rootScope.RoutePath + 'brand/GetAllBrand').then(function (res) {
            $scope.lstBrand = res.data.data;
        });
    }

    $scope.GetAllSubBrand = function () {
        $http.get($rootScope.RoutePath + 'brand/GetAllSubBrand').then(function (res) {
            $scope.lstSubBrand = res.data.data;
        });
    }

    $scope.GetAllParentItemCategory = function () {
        $http.get($rootScope.RoutePath + 'itemcategory/GetAllItemCategory').then(function (res) {
            $scope.lstParentItemCategory = res.data.data;
        });
    }

    $scope.GetAllSubItemCategory = function (id) {
        $http.get($rootScope.RoutePath + 'itemcategory/GetAllSubItemCategory?id=' + id).then(function (res) {
            $scope.lstSubItemCategory = res.data.data;
        });
    }

    //Table function End
    $scope.ResetModel = function () {
        $scope.Searchmodel = {
            Search: '',
        }
        $scope.checkboxmodel = {
            SaleRate: true,
            PurRate: true,
            MRP: true,
            Contain: true,
            GST: true
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
            "aaSorting": [1, 'ASC'],
            "ajax": {
                url: $rootScope.RoutePath + 'report/GetAllStockBalanceDynamic',
                data: function (d) {
                    if ($scope.Searchmodel.Search != undefined) {
                        d.search = $scope.Searchmodel.Search;
                    }
                    console.log(d.search)
                    d.CustomerGroup = $localstorage.get('CustomerGroup')
                    d.idLocations = $scope.IsAdmin ? "" : $localstorage.get('idLocations');
                    // d.modelAdvanceSearch = $scope.modelAdvanceSearch;
                    $scope.order = d.order;
                    $scope.columns = d.columns;
                    if (($scope.checkboxmodel.StockP == true && $scope.checkboxmodel.StockM == true) || ($scope.checkboxmodel.StockP == false && $scope.checkboxmodel.StockM == false)) {
                        d.Stock = null
                    } else if ($scope.checkboxmodel.StockP == true) {
                        d.Stock = "Plus"
                    } else if ($scope.checkboxmodel.StockM == true) {
                        d.Stock = "Minus"
                    }
                    d.MainCompany = $scope.Filtermodel.MainCompany
                    d.SubCompany = $scope.Filtermodel.SubCompany
                    d.StartDate = $scope.Filtermodel.StartDate
                    d.EndDate = $scope.Filtermodel.EndDate
                    d.ProductGroup = $scope.Filtermodel.ProductGroup
                    // d.ProductSubGroup = $scope.Filtermodel.ProductSubGroup

                    return d;
                },
                type: "get",
                dataSrc: function (json) {

                    if (json.success != false) {
                        $scope.lstdata = json.data;
                        $scope.$apply(function () {
                            $scope.FinalTotalmodel.PurCount = parseFloat(json.TotalPurchaseQty).toFixed(2);
                            $scope.FinalTotalmodel.PurAmount = parseFloat(json.TotalPurchaseAmount).toFixed(2);
                            $scope.FinalTotalmodel.SaleCount = parseFloat(json.TotalSaleQty).toFixed(2);
                            $scope.FinalTotalmodel.SaleAmount = parseFloat(json.TotalSaleAmount).toFixed(2);
                            $scope.FinalTotalmodel.ClosingCount = parseFloat(json.TotalStock).toFixed(2);
                            $scope.FinalTotalmodel.ClosingAmount = parseFloat(json.TotalAmount).toFixed(2);
                        })
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
                { "data": null, "sortable": false },                                                     //0        //0
                { "data": "ItemCode", "defaultContent": "N/A" },                                         //1        //1
                { "data": "ItemName", "defaultContent": "N/A" },                                         //2        //2
                { "data": null, "defaultContent": "N/A" }, //Drug                                      //3        //3
                { "data": "BatchNumber", "defaultContent": "N/A" }, //Drug                              //4        //4

                { "data": "Groupname", "defaultContent": "N/A" },                                        //5        //5
                // { "data": "", "defaultContent": "N/A" }, //SubGroup                                   //6
                { "data": "CompanyName", "defaultContent": "N/A" },                                      //7        //6
                { "data": "SubComapny", "defaultContent": "N/A" }, //Subcompany                                   //8         //7

                { "data": "PurchaseParty", "defaultContent": "N/A" },                                    //9        //8
                { "data": "Pack", "defaultContent": "N/A" },                                             //10        //9
                // { "data": "BoxPack", "defaultContent": "N/A" }, //BoxPack                              //11

                // { "data": "", "defaultContent": "N/A" }, //Opening                                    //12

                { "data": "PurchaseQty", "defaultContent": "N/A" },                                      //13       //10
                { "data": "PurchaseRate", "defaultContent": "N/A" },                                     //14       //11
                { "data": "PurchaseRateGST", "defaultContent": "N/A" }, //PurGSTRate                      //15       //12
                { "data": "PurchaseAmount", "defaultContent": "N/A" },                                   //16       //13

                { "data": "SalesQty", "defaultContent": "N/A" },                                         //17       //14
                { "data": "SaleRate", "defaultContent": "N/A" }, //SaleRate                           //18          //15
                { "data": "SalesAmount", "defaultContent": "N/A" },                                      //19       //16

                { "data": "OpeningStock", "defaultContent": "N/A" },

                { "data": "Stock", "defaultContent": "N/A" },  //Closing                                 //20       //17
                { "data": "Amount", "defaultContent": "N/A" }, //Amount                                   //21         //18
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
                    Action += '<a ng-click="GotoDrug(' + row.id + ')" class="btnAction btnAction-edit" style="cursor:pointer"><i class="ion-information" title="Go To Drug"></i></a>&nbsp;';
                    Action += '</div>';
                    return Action;
                },
                "visible": $scope.checkboxmodel.DrugMaster,
                "targets": 3,
            },
            // {
            //     "visible": $scope.checkboxmodel.SubGroup,
            //     "targets": 5,
            // },
            // {
            //     "visible": $scope.checkboxmodel.SubCompany,
            //     "targets": 7,
            // },
            {
                "visible": $scope.checkboxmodel.PurParty,
                "targets": 8,
            },
            {
                "visible": $scope.checkboxmodel.Pack,
                "targets": 9,
            },
            // {
            //     "visible": $scope.checkboxmodel.BoxPack,
            //     "targets": 10,
            // },
            {
                "visible": $scope.checkboxmodel.PurRate,
                "targets": 11,
            },
            {
                "visible": $scope.checkboxmodel.PurGSTRate,
                "targets": 12,
            },
            {
                "visible": $scope.checkboxmodel.SaleRate,
                "targets": 13,
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
        var ObjAdvanceSearch = $scope.modelAdvanceSearch != null ? JSON.stringify($scope.modelAdvanceSearch) : '';
        var CurrentOffset = $scope.CurrentOffset;
        var idLocations = $scope.IsAdmin ? "" : $localstorage.get('CustomerGroup') == 'Genmed' ? "" : $localstorage.get('idLocations');
        var CustomerGroup = $localstorage.get('CustomerGroup')
        var Param = "?search=" + search + "&ObjAdvanceSearch=" + ObjAdvanceSearch + "&idLocations=" + idLocations + "&CustomerGroup=" + CustomerGroup + "&StartDate=" + moment($scope.Filtermodel.StartDate).format('YYYY-MM-DD') + "&EndDate=" + moment($scope.Filtermodel.EndDate).format('YYYY-MM-DD') + "&columns=" + JSON.stringify($scope.columns) + "&order=" + JSON.stringify($scope.order);

        window.location = $rootScope.RoutePath + "report/ExportStockBalanceReport" + Param;
    }
    // Alias
    $rootScope.ResetAll = $scope.init;

    $scope.init();

});