app.controller('ItemPriceReportController', function ($scope, $rootScope, $ionicModal, $http, $ionicPopup, $ionicLoading, $localstorage, $state, $compile) {
    $rootScope.BackButton = true;
    $scope.init = function () {
        setTimeout(() => {
            $("#mytext").focus();
        }, 1000);
        $scope.Group = $localstorage.get('CustomerGroup');
        console.log($scope.Group)
        ManageOffset();
        ManageRole();
        $scope.GetAllBrand();
        $scope.GetAllSubBrand();
        $scope.GetAllParentItemCategory();
        $scope.GetAllActiveCustomergroup();
        $scope.InitModel();
        setTimeout(function () {
            InitDataTable();
        })
        $scope.CustomerGroupName = $localstorage.get('CustomerGroup');
    };

    function ManageOffset() {
        var x = new Date();
        var offset = -x.getTimezoneOffset();
        var CurrentOffset = (('00' + offset).slice(-2) >= 0 ? "+" : "-") + ('00' + parseInt(offset / 60).toString()).slice(-2) + ":" + offset % 60;
        $scope.CurrentOffset = encodeURIComponent(CurrentOffset);
    }
    $scope.InitModel = function () {
        $scope.Searchmodel = {
            Search: '',
            Type: 'Sales',
        }
        $scope.Filtermodel = {
            MainCompany: '',
            SubCompany: '',
            ProductGroup: '',
            SaleRate: false,
            PurRate: false,
            MRP: true,
            Contain: true,
            GST: true
        }

    }

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
    $scope.GetAllActiveCustomergroup = function () {
        $http.get($rootScope.RoutePath + 'customer/GetAllActiveCustomergroup').then(function (res) {
            $scope.LstCustGroup = res.data.data;
            $scope.GetAllTaxCode();
        })
    }
    $scope.GetAllTaxCode = function () {
        $http.get($rootScope.RoutePath + 'taxcode/GetAllActiveTaxcode').then(function (res) {
            $scope.lstTax = res.data.data;
        });
    }
    $scope.AdvanceSearchModel = null;
    $scope.FilterAdvanceData = function (model) {
        $scope.AdvanceSearchModel = model;
        $('#ItemPriceReportTable').dataTable().api().ajax.reload();
    }
    $scope.ShowHideCol = function () {
        // $('#StockBalanceReportTable').dataTable().api().ajax.reload();
        InitDataTable()
    }
    $scope.ResetFilter = function () {
        $scope.Searchmodel = {
            Search: '',
            Type: 'Sales',
        }
        $scope.Filtermodel = {
            MainCompany: '',
            SubCompany: '',
            ProductGroup: '',
            SaleRate: false,
            PurRate: false,
            MRP: true,
            Contain: true,
            GST: true
        }
        InitDataTable()
    }
    $scope.FilterData = function () {
        console.log("&&&&&&&&&&&&&&&&&&&&&&&&")
        $('#ItemPriceReportTable').dataTable().api().ajax.reload();
    }
    //Set Table
    function InitDataTable() {
        if ($.fn.DataTable.isDataTable('#ItemPriceReportTable')) {
            $('#ItemPriceReportTable').DataTable().destroy();
        }
        $('#ItemPriceReportTable').DataTable({
            "processing": true,
            "dom": 'rt<"bottom"<"left"<"length"l><"info"i>><"right"<"pagination"p>>>',
            "serverSide": true,
            "responsive": true,
            "aaSorting": [1, 'ASC'],
            "ajax": {
                url: $rootScope.RoutePath + 'report/GetAllItemPriceReportDynamic',
                data: function (d) {
                    console.log(d)
                    if ($scope.Searchmodel.Search != undefined) {
                        d.search = $scope.Searchmodel.Search;
                    }
                    d.Type = $scope.Searchmodel.Type;
                    d.ObjAdvanceSearch = $scope.AdvanceSearchModel;
                    d.CurrentOffset = $scope.CurrentOffset;
                    d.idLocations = $scope.IsAdmin ? "" : $localstorage.get('idLocations');
                    d.MainCompany = $scope.Filtermodel.MainCompany ? $scope.Filtermodel.MainCompany : null;
                    d.SubCompany = $scope.Filtermodel.SubCompany ? $scope.Filtermodel.SubCompany : null;
                    d.ProductGroup = $scope.Filtermodel.ProductGroup ? $scope.Filtermodel.ProductGroup : null;
                    d.CustGroupName = $scope.CustomerGroupName == 'Genmed' ? null : $scope.CustomerGroupName;
                    $scope.order = d.order;
                    $scope.columns = d.columns;
                    $scope.start = d.start;
                    $scope.length = d.length;
                    return d;
                },
                type: "get",
                dataSrc: function (json) {
                    if (json.success != false) {
                        $scope.LstData = json.data;
                        console.log($scope.LstData)
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
                { "data": "ItemName", "defaultContent": "N/A" },
                { "data": "ItemCode", "defaultContent": "N/A" },
                { "data": "Descriptions", "defaultContent": "N/A" },
                { "data": "subbrand.brandmain.Brand", "defaultContent": "N/A" },
                { "data": null, "defaultContent": "N/A" },
                { "data": null, "defaultContent": "N/A" },
                { "data": null, "defaultContent": "N/A" },
                { "data": null, "defaultContent": "N/A" },
                { "data": null, "defaultContent": "N/A" },
                // { "data": "Qty", "defaultContent": "N/A" },
                // { "data": "Price", "defaultContent": "N/A" },
                // { "data": "DiscountAmount", "defaultContent": "N/A" },
                // { "data": "Total", "defaultContent": "N/A" },
                // { "data": "TaxCode", "defaultContent": "N/A" },
                // { "data": "Tax", "defaultContent": "N/A" },
                // { "data": "FinalTotal", "defaultContent": "N/A" },
            ],
            "columnDefs": [{
                "render": function (data, type, row, meta) {
                    return meta.row + meta.settings._iDisplayStart + 1;
                },
                "targets": 0,
            },
            {
                "render": function (data, type, row) {
                    if (row.itemuoms.length > 0) {
                        var objUOM = _.findWhere(row.itemuoms, {
                            UOM: row.SalesUOM
                        });
                        if (objUOM) {
                            return objUOM.UOM;
                        } else {
                            return "N/A";
                        }
                    } else {
                        return "N/A";
                    }
                },
                "targets": 5,

            },
            {
                "visible": $scope.Filtermodel.Contain,
                "targets": 3,
            },
            {
                "render": function (data, type, row) {
                    if (row.itemuoms.length > 0) {
                        var objUOM = _.findWhere(row.itemuoms, {
                            UOM: row.SalesUOM
                        });
                        if (objUOM) {
                            var ShopId = _.findWhere($scope.LstCustGroup, { Name: 'Shop' });
                            var StockHolderId = _.findWhere($scope.LstCustGroup, { Name: 'Stock Holder' });
                            var Shop = _.findWhere(row.itemmargins, { idCustGroup: ShopId.id });
                            var StockHolder = _.findWhere(row.itemmargins, { idCustGroup: StockHolderId.id });
                            var purchaseprice = 0;
                            purchaseprice = objUOM.MinSalePrice;
                            var TaxObj = _.findWhere($scope.lstTax, { TaxType: row.SupplyTaxCode });
                            if (TaxObj) {
                                purchaseprice = purchaseprice / ((TaxObj.TaxRate / 100) + 1);
                            }
                            Shop.Tax = TaxObj.TaxRate;
                            Shop.TaxPrice = objUOM ? objUOM.MinSalePrice - purchaseprice : 0;
                            Shop.purchaseprice = purchaseprice - ((purchaseprice * Shop.Percentage) / 100);
                            StockHolder.saleprice = (Shop.purchaseprice).toFixed(2);
                            StockHolder.purchaseprice = parseFloat(Shop.purchaseprice) - ((parseFloat(Shop.purchaseprice) * StockHolder.Percentage) / 100);
                            if ($scope.CustomerGroupName == 'Stock Holder') {
                                return StockHolder.saleprice;
                            } else {
                                return objUOM.MinPurchasePrice.toFixed(2);
                            }
                        } else {
                            return "N/A";
                        }
                    } else {
                        return "N/A";
                    }
                },
                "visible": $scope.Filtermodel.PurRate,
                "targets": 6,
                className: "right-aligned-cell"
            },
            {
                "render": function (data, type, row) {
                    if (row.itemuoms.length > 0) {
                        var objUOM = _.findWhere(row.itemuoms, {
                            UOM: row.SalesUOM
                        });
                        if (objUOM) {
                            return objUOM.MinSalePrice.toFixed(2);
                        } else {
                            return "N/A";
                        }
                    } else {
                        return "N/A";
                    }
                },
                "visible": $scope.Filtermodel.SaleRate,
                "targets": 7,
                className: "right-aligned-cell"
            },
            {
                "render": function (data, type, row) {
                    if (row.itemuoms.length > 0) {
                        var objUOM = _.findWhere(row.itemuoms, {
                            UOM: row.SalesUOM
                        });
                        if (objUOM) {
                            return objUOM.MRP.toFixed(2);
                        } else {
                            return "N/A";
                        }
                    } else {
                        return "N/A";
                    }
                },
                "visible": $scope.Filtermodel.MRP,
                "targets": 8,
                className: "right-aligned-cell"
            },
            {
                "render": function (data, type, row) {
                    if (row.itemuoms.length > 0) {
                        var objUOM = _.findWhere(row.itemuoms, {
                            UOM: row.SalesUOM
                        });
                        if (objUOM) {
                            var ShopId = _.findWhere($scope.LstCustGroup, { Name: 'Shop' });
                            var StockHolderId = _.findWhere($scope.LstCustGroup, { Name: 'Stock Holder' });
                            var Shop = _.findWhere(row.itemmargins, { idCustGroup: ShopId.id });
                            var StockHolder = _.findWhere(row.itemmargins, { idCustGroup: StockHolderId.id });
                            var purchaseprice = 0;
                            purchaseprice = objUOM.MinSalePrice;
                            var TaxObj = _.findWhere($scope.lstTax, { TaxType: row.SupplyTaxCode });
                            if (TaxObj) {
                                purchaseprice = purchaseprice / ((TaxObj.TaxRate / 100) + 1);
                            }
                            Shop.Tax = TaxObj.TaxRate;
                            Shop.TaxPrice = objUOM ? objUOM.MinSalePrice - purchaseprice : 0;
                            Shop.purchaseprice = purchaseprice - ((purchaseprice * Shop.Percentage) / 100);
                            StockHolder.saleprice = (Shop.purchaseprice).toFixed(2);
                            StockHolder.purchaseprice = parseFloat(Shop.purchaseprice) - ((parseFloat(Shop.purchaseprice) * StockHolder.Percentage) / 100);
                            return Shop.TaxPrice.toFixed(2) + " (" + Shop.Tax + "%)";
                        } else {
                            return "N/A";
                        }
                    } else {
                        return "N/A";
                    }
                },
                "visible": $scope.Filtermodel.GST,
                "targets": 9,
                className: "right-aligned-cell"
            },
            ]
        });
    }

    $scope.EnableFilterOption = function () {
        $(function () {
            $(".CustFilter").slideToggle();
        });
    };

    $scope.Export = function () {
        if ($scope.Searchmodel.Search != undefined) {
            var search = $scope.Searchmodel.Search;
        }
        var CurrentOffset = $scope.CurrentOffset;
        var Param = "?search=" + search + "&CustomerGroupName=" + $scope.CustomerGroupName + "&MainCompany=" + $scope.Filtermodel.MainCompany + "&SubCompany=" + $scope.Filtermodel.SubCompany + "&ProductGroup=" + $scope.Filtermodel.ProductGroup + "&length=" + $scope.length + "&start=" + $scope.start + "&CurrentOffset=" + CurrentOffset + "&columns=" + JSON.stringify($scope.columns) + "&order=" + JSON.stringify($scope.order);
        window.location = $rootScope.RoutePath + "report/ExportItemPriceReportNew" + Param;
    }

    $scope.init();

});