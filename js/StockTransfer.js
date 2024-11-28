app.controller('StockTransferController', function ($scope, $rootScope, $ionicModal, $http, $ionicPopup, $ionicLoading, $localstorage, $state, $compile) {
    $rootScope.BackButton = true;
    $scope.init = function () {
        ManageRole();
        $scope.getAllUserLoaction();
        $scope.ResetModel();
        $scope.GetAllCustomer();
        $scope.GetAllBranch();
        $scope.GetAllItem();
        $scope.GetAllLocation();
        $scope.GetAllUOM();
        $scope.GetAllTaxCode();
        $scope.GetAllCurrency();
        $scope.GetAllCurrencyRate();
        $scope.tab = { selectedIndex: 0 };
        $scope.IsList = false;
        $scope.SelectedTab = 1;
        $scope.IsSave = false;
        $scope.formsubmit = false;
        // setTimeout(function () {
        //     InitDataTable();
        // })
    };

    function ManageRole() {
        var AdminUser = _.filter(JSON.parse($localstorage.get('UserRoles')), function (Role) {
            return Role == "Admin";
        })
        $scope.IsAdmin = AdminUser.length && AdminUser.length > 0 ? true : false;
    }


    $scope.ChangeTab = function (number) {
        $scope.SelectedTab = number;
    }

    $scope.GetAllCustomer = function () {
        var params = {
            CreatedBy: $scope.IsAdmin ? '' : parseInt($localstorage.get('UserId')),
        }
        $http.get($rootScope.RoutePath + 'customer/GetAllCustomer', { params: params }).then(function (res) {
            $scope.lstCustomer = res.data.data;
        });
    };

    $scope.GetAllBranch = function () {
        $http.get($rootScope.RoutePath + 'customer/GetAllActiveCustomerbranch').then(function (res) {
            $scope.lstBranch = res.data.data;
        });
    };

    $scope.GetAllItem = function () {
        $http.get($rootScope.RoutePath + 'item/GetAllItem').then(function (res) {
            $scope.lstItems = res.data.data;
        });
    };

    $scope.PreventMobileNumber1 = function () {
        if ($scope.model.PhoneNumber.toString().length > 15) {
            $scope.model.PhoneNumber = parseInt($scope.model.PhoneNumber.toString().substring(0, 15));
        }
    }

    $scope.PreventMobileNumber2 = function () {
        if ($scope.model.DeliverPhoneNumber.toString().length > 15) {
            $scope.model.DeliverPhoneNumber = parseInt($scope.model.DeliverPhoneNumber.toString().substring(0, 15));
        }
    }
    $scope.GetAllLocation = function () {
        var params = {
            idLocations: $scope.IsAdmin ? "" : $localstorage.get('idLocations')
        }
        $http.get($rootScope.RoutePath + 'customer/GetAllActiveLocations', { params: params }).then(function (res) {
            $scope.lstLocations = res.data.data;
            var obj = _.findWhere($scope.lstLocations, { id: parseInt($localstorage.get('DefaultLocation')) });
            if (obj) {
                $scope.model.DefaultLocation = obj.Name;
            }

        });
    };

    $scope.GetAllUOM = function () {
        $http.get($rootScope.RoutePath + 'uom/GetAllActiveUom').then(function (res) {
            $scope.lstUOM = res.data.data;
        });
    };

    $scope.GetAllTaxCode = function () {
        $http.get($rootScope.RoutePath + 'taxcode/GetAllActiveTaxcode').then(function (res) {
            $scope.lstTaxCode = res.data.data;
        });
    };

    $scope.GetAllCurrency = function () {
        $http.get($rootScope.RoutePath + 'currency/GetAllCurrency').then(function (res) {
            $scope.lstCurrency = res.data.data;
            $scope.TotalRecord = $scope.lstCurrency.length;
        })
    }

    $scope.GetAllCurrencyRate = function () {
        $http.get($rootScope.RoutePath + 'currency/GetAllCurrencyRate').then(function (res) {
            $scope.lstCurrencyRate = res.data.data;
            $scope.TotalRecord1 = $scope.lstCurrencyRate.length;
        })
    }

    $scope.changeRateByCurrency = function (CurrencyCode) {
        if (CurrencyCode != '' && CurrencyCode != undefined && CurrencyCode != null) {
            $scope.checkCurrencyRate(CurrencyCode);
        } else {
            $scope.model.CurrencyRate = ''
        }
    }

    $scope.SelectCustomer = function (o) {
        var obj = _.findWhere($scope.lstCustomer, { AccountNumbder: o });
        if (obj) {
            $scope.model.CustomerName = obj.Name;
            $scope.model.Address1 = obj.BillingAddress1;
            $scope.model.Address2 = obj.BillingAddress2;
            $scope.model.Address3 = obj.BillingAddress3;
            if (obj.customerbranch) {
                $scope.model.BranchCode = obj.customerbranch.Name;
            }
            // if (obj.Currency != undefined && obj.Currency != null && obj.Currency != '') {
            //     $scope.checkCurrencyRate(obj.Currency);
            // } else {
            //     //for default currency
            //     $scope.model.CurrencyCode = _.findWhere($scope.lstCurrency, { isDefault: 1 }).CurrencyCode;
            //     $scope.model.CurrencyRate = _.findWhere($scope.lstCurrency, { CurrencyCode: $scope.model.CurrencyCode }).SellRate;
            // }
        } else {
            $scope.model.CustomerName = "";
            $scope.model.Address1 = "";
            $scope.model.Address2 = "";
            $scope.model.Address3 = "";
            $scope.model.BranchCode = "";
            $scope.model.CurrencyCode = "";
            $scope.model.CurrencyRate = "";
        }
    }

    $scope.checkCurrencyRate = function (CurrencyCode) {
        var obj = _.findWhere($scope.lstCurrencyRate, { CurrencyCode: CurrencyCode });
        if (obj != null && obj != '' && obj != undefined) {
            var FromDate = new Date(obj.FromDate);
            var ToDate = new Date(obj.ToDate);
            var CurrentDate = new Date();
            if (CurrentDate >= FromDate && CurrentDate <= ToDate) {
                $scope.model.CurrencyCode = obj.CurrencyCode;
                $scope.model.CurrencyRate = obj.SellRate;
            } else {
                var obj = _.findWhere($scope.lstCurrency, { CurrencyCode: CurrencyCode });
                if (obj != null && obj != '' && obj != undefined) {
                    $scope.model.CurrencyCode = obj.CurrencyCode;
                    $scope.model.CurrencyRate = obj.SellRate;
                } else {
                    //for default currency
                    $scope.model.CurrencyCode = _.findWhere($scope.lstCurrency, { isDefault: 1 }).CurrencyCode;
                    $scope.model.CurrencyRate = _.findWhere($scope.lstCurrency, { CurrencyCode: $scope.model.CurrencyCode }).SellRate;
                }
            }
        } else {
            var obj = _.findWhere($scope.lstCurrency, { CurrencyCode: CurrencyCode });
            if (obj != null && obj != '' && obj != undefined) {
                $scope.model.CurrencyCode = obj.CurrencyCode;
                $scope.model.CurrencyRate = obj.SellRate;
            } else {
                //for default currency
                $scope.model.CurrencyCode = _.findWhere($scope.lstCurrency, { isDefault: 1 }).CurrencyCode;
                $scope.model.CurrencyRate = _.findWhere($scope.lstCurrency, { CurrencyCode: $scope.model.CurrencyCode }).SellRate;
            }
        }
    }

    //Start Main Sale Tab

    //add Sale main item in list
    $scope.AddSaleMainItemInList = function () {
        // if ($scope.lstSelectedStockTransferMain.length >= 1 && $scope.WorkingStockTransferMain.ItemCode == '') {
        //     $ionicLoading.show({ template: "Fill data" });
        //     setTimeout(function () {
        //         $ionicLoading.hide()
        //     }, 1000);
        //     return;
        // } 
        if ($scope.lstSelectedStockTransferMain.length > 0 && $scope.lstSelectedStockTransferMain[$scope.lstSelectedStockTransferMain.length - 1].ItemCode == '') {
            $ionicLoading.show({ template: "Fill Data" });
            setTimeout(function () {
                $ionicLoading.hide()
            }, 1000);
            return;
        } else {
            _.filter($scope.lstSelectedStockTransferMain, function (item) {
                item.IsEdit = false;
            });

            $scope.SaleMainModel = {
                id: null,
                Total: 0,
                CurrencyCode: null,
                CurrencyRate: 0,
                NetTotal: 0.00,
                LocalNetTotal: 0.00,
                Tax: 0.00,
                LocalTax: 0.00,
                FinalTotal: 0.00,
                RoundAdj: 0.00,
                idSale: null,
                idPurchase: null,
                ItemCode: '',
                FromidLocations: $scope.model.idLocations,
                FromDisplayLocation: $scope.model.DefaultLocation,
                ToidLocations: null,
                ToDisplayLocation: null,
                BatchNo: null,
                // ToBatchNo: null,
                Descriptions: null,
                UOM: null,
                UserUOM: null,
                Qty: 0,
                Price: 0.00,
                DiscountAmount: 0,
                isDiscount: 0,
                TaxCode: null,
                TaxRate: 0,
                IsEdit: true,
                LastFromBalQty: 0,
                LastBatchNo: null,
                LastFromLocation: null,
                LastToBalQty: 0,
                // LastToBatchNo: null,
                LastToLocation: null,
                LastItemCode: null,
                LastUOM: null,
                listUOM: [],
                BatchList: [],
                isBatch: false
            }
            // $scope.BatchList = [];

            $scope.lstSelectedStockTransferMain.push($scope.SaleMainModel);
            $scope.WorkingStockTransferMain = $scope.SaleMainModel;

            // AssignStockTransferClickEvent();

            // setTimeout(function() {
            //     $scope.SelectStockTransferMainRaw($scope.lstSelectedStockTransferMain.length - 1);
            // })
        }
    }

    function AssignStockTransferClickEvent() {
        setTimeout(function () {
            $("#tblStockTransferMainTable tr").unbind("click");

            $("#tblStockTransferMainTable tr").click(function () {
                if ($(this)[0].accessKey != "") {
                    for (var k = 0; k < $scope.lstSelectedStockTransferMain.length; k++) {
                        $scope.lstSelectedStockTransferMain[k].IsEdit = false;
                    }

                    $("#tblStockTransferMainTable tr").removeClass("highlight");
                    $(this).addClass("highlight");

                    $scope.WorkingStockTransferMain = $scope.lstSelectedStockTransferMain[$(this)[0].accessKey];
                    $scope.WorkingStockTransferMain.IsEdit = true;
                    var obj = _.findWhere($scope.lstItems, { ItemCode: $scope.WorkingStockTransferMain.ItemCode });
                    if (obj) {
                        if (obj.isBatch == 1) {
                            $scope.BatchList = obj.itembatches;
                            $scope.WorkingStockTransferMain.isBatch = true;
                        } else {
                            $scope.BatchList = [];
                            $scope.WorkingStockTransferMain.isBatch = false;
                        }
                    }
                    $scope.$apply();
                }
            });
        })
    }

    $scope.RemoveSaleMainItemInList = function (index) {
        $scope.lstSelectedStockTransferMain.splice(index, 1);

        if ($scope.lstSelectedStockTransferMain.length == 0) {
            $scope.model.Total = 0.00;
            $scope.model.NetTotal = 0.00;
            $scope.model.LocalNetTotal = 0.00;
            $scope.model.FinalTotal = 0.00;
            $scope.model.Tax = 0.00;
            $scope.model.LocalTax = 0.00;
            $scope.AddSaleMainItemInList();
        } else {
            AdjustFinalSaleTotal();
        }

        // $scope.WorkingStockTransferMain = null;

        // AssignStockTransferClickEvent();

        // setTimeout(function() {
        //     $scope.SelectStockTransferMainRaw(0);
        // })
    }

    $scope.SelectStockTransferMainRaw = function (index) {
        $("#tblStockTransferMainTable tr[accessKey='" + index + "']").trigger("click");
    }

    $scope.GetAllItemUOM = function (o) {
        var params = {
            ItemCode: o.ItemCode,
            UOM: o.UOM
        }
        $http.get($rootScope.RoutePath + 'itemuom/GetItemUOMByItemCodeAndUOM', { params: params }).then(function (res) {
            $scope.ItemUOM = res.data.data;
            if ($scope.ItemUOM && o.Qty != null) {
                o.Price = $scope.ItemUOM.Price;
                o.Total = (o.Qty * o.Price) - o.DiscountAmount;
                o.Tax = o.LocalTax = (o.Total * o.TaxRate) / 100;
                o.FinalTotal = o.NetTotal = o.LocalNetTotal = o.Total + o.Tax;
            } else {
                o.Price = 0.00;
                o.Total = 0.00;
                o.FinalTotal = o.NetTotal = o.LocalNetTotal = 0.00;
            }

            AdjustFinalSaleTotal();
        });
    };

    $scope.AddPrice = function (o) {
        if (o.Qty != 0 && o.Qty != '') {
            o.Total = (o.Qty * parseFloat(o.Price)) - o.DiscountAmount;
            o.Tax = o.LocalTax = (o.Total * o.TaxRate) / 100;
            o.FinalTotal = o.NetTotal = o.LocalNetTotal = o.Total + o.Tax;
        } else {
            o.Total = 0.00;
            o.FinalTotal = o.NetTotal = o.LocalNetTotal = 0.00;
        }
        AdjustFinalSaleTotal();
    }

    $scope.AddItemCode = function (o) {
        var obj = _.findWhere($scope.lstItems, { ItemCode: o.ItemCode });
        o.Descriptions = obj.Descriptions;
        o.UOM = (obj.SalesUOM).toString();
        o.TaxCode = obj.SupplyTaxCode;
        o.listUOM = obj.itemuoms;
        if (obj.isBatch == 1) {
            o.BatchList = obj.itembatches;
            o.isBatch = true;
        } else {
            o.BatchList = [];
            o.isBatch = false;
        }
        $scope.FillItemUnitPrice(o);
    }

    $scope.FillItemUnitPrice = function (o) {
        var objUOM = _.findWhere(o.listUOM, { UOM: o.UOM })
        if (objUOM) {
            o.Price = objUOM.Price;
            $scope.AddTaxCode(o, 1);
        }
    }

    $scope.AddLocation = function (o) {
        var obj = _.findWhere($scope.lstLocations, { id: parseInt(o.FromidLocations) });
        o.FromDisplayLocation = obj.Name;
    }

    $scope.AddToLocation = function (o) {
        var obj = _.findWhere($scope.lstLocations, { id: parseInt(o.ToidLocations) });
        o.ToDisplayLocation = obj.Name;
    }

    $scope.AddTaxCode = function (o, status) {
        if (o.TaxCode) {
            var obj = _.findWhere($scope.lstTaxCode, { TaxType: o.TaxCode });
            if (obj) {
                o.TaxRate = obj.TaxRate;
                o.Tax = o.LocalTax = (o.Total * o.TaxRate) / 100;
                if (status == 1) {
                    if ($scope.model.IsInclusive) {
                        o.Price = parseFloat(o.Price) / ((o.TaxRate / 100) + 1);
                    }
                }
            } else {
                o.TaxRate = 0;
                o.Tax = 0.00;
            }
        } else {
            o.TaxRate = 0;
            o.Tax = 0.00;
        }

        $scope.AddPrice(o);
    }

    function AdjustFinalSaleTotal() {
        if ($scope.lstSelectedStockTransferMain.length > 0) {
            $scope.model.Total = 0.00;
            $scope.model.NetTotal = 0.00;
            $scope.model.LocalNetTotal = 0.00;
            $scope.model.FinalTotal = 0.00;
            $scope.model.Tax = 0.00;
            $scope.model.LocalTax = 0.00;

            for (var i = 0; i < $scope.lstSelectedStockTransferMain.length; i++) {
                $scope.model.Total = $scope.model.Total + $scope.lstSelectedStockTransferMain[i].Total;
                $scope.model.NetTotal = $scope.model.LocalNetTotal = $scope.model.FinalTotal = $scope.model.NetTotal + $scope.lstSelectedStockTransferMain[i].NetTotal;
                $scope.model.Tax = $scope.model.LocalTax = $scope.model.Tax + $scope.lstSelectedStockTransferMain[i].Tax;
            }
        }
    }

    //End Main Sale Tab
    $scope.formsubmit = false;
    $scope.SaveSale = function (form) {

        if (form.$invalid) {
            $scope.formsubmit = true;
        } else {
            var NoItemCode = _.findWhere($scope.lstSelectedStockTransferMain, { ItemCode: '' });
            if (NoItemCode) {
                var alertPopup = $ionicPopup.alert({
                    title: '',
                    template: 'Item code missing.First select Item code for all items in list.',
                    cssClass: 'custPop',
                    okText: 'Ok',
                    okType: 'btn btn-green',
                });
            } else {
                var NoQty = _.filter($scope.lstSelectedStockTransferMain, function (item) {
                    if (item.Qty == 0 || item.Qty == '' || item.Qty == undefined) {
                        return item;
                    }
                });

                if (NoQty != '') {
                    var alertPopup = $ionicPopup.alert({
                        title: '',
                        template: 'Quantity must be grater than zero for all items in list.',
                        cssClass: 'custPop',
                        okText: 'Ok',
                        okType: 'btn btn-green',
                    });
                } else {
                    var FromLocationNo = _.filter($scope.lstSelectedStockTransferMain, function (item) {
                        if (item.FromidLocations == 0 || item.FromidLocations == '' || item.FromidLocations == undefined) {
                            return item;
                        }
                    });
                    if (FromLocationNo != '') {
                        var alertPopup = $ionicPopup.alert({
                            title: '',
                            template: 'Please select From Location for all items in list.',
                            cssClass: 'custPop',
                            okText: 'Ok',
                            okType: 'btn btn-green',
                        });
                    } else {
                        var ToLocationNo = _.filter($scope.lstSelectedStockTransferMain, function (item) {
                            if (item.ToidLocations == 0 || item.ToidLocations == '' || item.ToidLocations == undefined) {
                                return item;
                            }
                        });
                        if (ToLocationNo != '') {
                            var alertPopup = $ionicPopup.alert({
                                title: '',
                                template: 'Please select To Location for all items in list.',
                                cssClass: 'custPop',
                                okText: 'Ok',
                                okType: 'btn btn-green',
                            });
                        } else {
                            if ($scope.IsSave == false) {
                                var BatchList = _.where($scope.lstSelectedStockTransferMain, { isBatch: true });

                                if (BatchList.length > 0) {
                                    var ListNoBatchNumber = [];
                                    _.filter(BatchList, function (p) {
                                        if (p.BatchNo == null) {
                                            ListNoBatchNumber.push(p.ItemCode);
                                        }
                                    })

                                    if (ListNoBatchNumber.length > 0) {
                                        var confirmPopup = $ionicPopup.confirm({
                                            title: "",
                                            template: '<p>The following items are missing Item Batch No.Do you still want to save?</p>' +
                                                '<br>' +
                                                '<p><b>' + ListNoBatchNumber.toString() + '</b></p>',
                                            cssClass: 'custPop',
                                            cancelText: 'Cancel',
                                            okText: 'Ok',
                                            okType: 'btn btn-green',
                                            cancelType: 'btn btn-red',
                                        })
                                        confirmPopup.then(function (res) {
                                            if (res) {
                                                Save();
                                                $scope.IsSave = true;
                                            } else {
                                                $scope.IsSave = false;
                                            }
                                        })
                                    } else {
                                        Save();
                                        $scope.IsSave = true;
                                    }
                                } else {
                                    Save();
                                    $scope.IsSave = true;
                                }
                            } else {
                                Save();
                            }
                        }
                    }
                }
            }
        }

        function Save() {
            if (!$scope.model.id) {
                $scope.model.id = 0;
            }
            var lstInvoiceDetail = [];
            var lstPurchaseDetail = [];

            _.filter($scope.lstSelectedStockTransferMain, function (p) {
                var objInvoice = {
                    id: p.id,
                    Total: p.Total,
                    CurrencyCode: p.CurrencyCode,
                    CurrencyRate: p.CurrencyRate,
                    NetTotal: p.NetTotal,
                    LocalNetTotal: p.LocalNetTotal,
                    Tax: p.Tax,
                    LocalTax: p.LocalTax,
                    FinalTotal: p.FinalTotal,
                    RoundAdj: p.RoundAdj,
                    idSale: p.idSale,
                    ItemCode: p.ItemCode,
                    idLocations: p.FromidLocations,
                    DisplayLocation: p.FromDisplayLocation,
                    BatchNo: p.BatchNo,
                    Descriptions: p.Descriptions,
                    UOM: p.UOM,
                    UserUOM: p.UserUOM,
                    Qty: p.Qty,
                    Price: p.Price,
                    DiscountAmount: p.DiscountAmount,
                    isDiscount: p.isDiscount,
                    TaxCode: p.TaxCode,
                    TaxRate: p.TaxRate,
                    IsEdit: p.IsEdit,
                    LastBalQty: p.LastFromBalQty,
                    LastBatchNo: p.LastBatchNo,
                    LastLocation: p.LastFromLocation,
                    LastItemCode: p.LastItemCode,
                    LastUOM: p.LastUOM,
                }
                lstInvoiceDetail.push(objInvoice);

                var objPurchase = {
                    id: p.id,
                    Total: p.Total,
                    CurrencyCode: p.CurrencyCode,
                    CurrencyRate: p.CurrencyRate,
                    NetTotal: p.NetTotal,
                    LocalNetTotal: p.LocalNetTotal,
                    Tax: p.Tax,
                    LocalTax: p.LocalTax,
                    FinalTotal: p.FinalTotal,
                    RoundAdj: p.RoundAdj,
                    idPurchase: p.idPurchase,
                    ItemCode: p.ItemCode,
                    idLocations: p.ToidLocations,
                    DisplayLocation: p.ToDisplayLocation,
                    BatchNo: p.BatchNo,
                    Descriptions: p.Descriptions,
                    UOM: p.UOM,
                    UserUOM: p.UserUOM,
                    Qty: p.Qty,
                    Price: p.Price,
                    DiscountAmount: p.DiscountAmount,
                    isDiscount: p.isDiscount,
                    TaxCode: p.TaxCode,
                    TaxRate: p.TaxRate,
                    IsEdit: p.IsEdit,
                    LastBalQty: p.LastToBalQty,
                    LastBatchNo: p.LastBatchNo,
                    LastLocation: p.LastToLocation,
                    LastItemCode: p.LastItemCode,
                    LastUOM: p.LastUOM,
                }
                lstPurchaseDetail.push(objPurchase);
            });

            if (new Date($scope.model.InvoiceDate) == 'Invalid Date') {
                $scope.model.InvoiceDate = moment().set({ 'date': $scope.model.InvoiceDate.split('-')[0], 'month': $scope.model.InvoiceDate.split('-')[1] - 1, 'year': $scope.model.InvoiceDate.split('-')[2] }).format('YYYY-MM-DD');
                $scope.model.PurchaseDate = $scope.model.InvoiceDate;
            } else {
                if (moment($scope.model.InvoiceDate, "DD-MM-YYYY").format('YYYY-MM-DD') == 'Invalid date') {
                    $scope.model.InvoiceDate = moment($scope.model.InvoiceDate).format('YYYY-MM-DD');
                } else {
                    $scope.model.InvoiceDate = moment($scope.model.InvoiceDate, "DD-MM-YYYY").format('YYYY-MM-DD');
                }
                $scope.model.PurchaseDate = $scope.model.InvoiceDate;
            }

            var objInvoice = angular.copy($scope.model);
            objInvoice.lstInvoiceDetail = lstInvoiceDetail;
            var objPurchase = angular.copy($scope.model);
            objPurchase.lstPurchaseDetail = lstPurchaseDetail;

            var objSend = {
                objInvoice: objInvoice,
                objPurchase: objPurchase
            }
            $rootScope.ShowLoader();
            $http.post($rootScope.RoutePath + 'stocktransfer/SaveStockTransfer', objSend)
                .then(function (res) {
                    $scope.formsubmit = false;
                    var ResponseSales = res.data;
                    if (ResponseSales.success) {
                        $ionicLoading.show({ template: ResponseSales.message });
                        setTimeout(function () {
                            $ionicLoading.hide()
                        }, 1000);
                        $scope.init();
                    } else {
                        if (ResponseSales.CanConvert) {
                            var confirmPopup = $ionicPopup.confirm({
                                title: "",
                                template: 'Some of the item(s) in back order level,do you want to do UOM conversion for thoes item(s)?',
                                cssClass: 'custPop',
                                cancelText: 'Cancel',
                                okText: 'Ok',
                                okType: 'btn btn-green',
                                cancelType: 'btn btn-red',
                            })
                            confirmPopup.then(function (resmodal) {
                                if (resmodal) {
                                    var objUOM = _.findWhere($scope.lstSelectedStockTransferMain, { ItemCode: ResponseSales.data.ItemCode });
                                    objUOM.FromQty = ResponseSales.data.FromQty;
                                    objUOM.FromRate = ResponseSales.data.FromRate;
                                    objUOM.FromUOM = ResponseSales.data.FromUOM;
                                    objUOM.ToUOM = ResponseSales.data.ToUOM;
                                    objUOM.ToRate = ResponseSales.data.ToRate;
                                    $scope.InitUOMFunction(objUOM);
                                }
                            });
                        } else {
                            $ionicLoading.show({ template: ResponseSales.message });
                            setTimeout(function () {
                                $ionicLoading.hide()
                            }, 1000);
                        }
                    }

                })
                .catch(function (err) {
                    $ionicLoading.show({ template: 'Unable to save record right now. Please try again later.' });
                    setTimeout(function () {
                        $ionicLoading.hide()
                    }, 1000);
                });
        }
    };

    // Use more distinguished and understandable naming
    $scope.CopyToModel = function (id) {
        var selectedItem = _.findWhere($scope.lstdata, { id: parseInt(id) });
        $scope.tab.selectedIndex = 1;
        // $rootScope.BackButton =$scope.IsList = false;

        for (var prop in $scope.model) {
            $scope.model[prop] = selectedItem[prop];
            if (prop == 'idLocations') {
                $scope.model['idLocations'] = $localstorage.get('DefaultLocation');
            }
            if (prop == 'InvoiceDate') {
                $scope.model['InvoiceDate'] = moment(selectedItem[prop]).format('DD-MM-YYYY');
            }
        }
        $scope.lstSelectedStockTransferMain = selectedItem.invoicedetails;

        if ($scope.lstSelectedStockTransferMain.length > 0) {
            for (var i = 0; i < $scope.lstSelectedStockTransferMain.length; i++) {
                $scope.lstSelectedStockTransferMain[i].IsEdit = false;
                if ($scope.lstSelectedStockTransferMain[i].TaxCode) {
                    var obj = _.findWhere($scope.lstTaxCode, { TaxType: $scope.lstSelectedStockTransferMain[i].TaxCode });
                    if (obj) {
                        $scope.lstSelectedStockTransferMain[i].TaxRate = obj.TaxRate;
                    }
                }

                if ($scope.lstSelectedStockTransferMain[i].FromidLocations) {
                    var obj1 = _.findWhere($scope.lstLocations, { id: parseInt($scope.lstSelectedStockTransferMain[i].FromidLocations) });
                    $scope.lstSelectedStockTransferMain[i].FromidLocations = ($scope.lstSelectedStockTransferMain[i].FromidLocations).toString();
                    if (obj1) {
                        $scope.lstSelectedStockTransferMain[i].FromDisplayLocation = obj1.Name;
                    }
                }

                var objItem1 = _.findWhere($scope.lstItems, { ItemCode: $scope.lstSelectedStockTransferMain[i].ItemCode });
                if (objItem1) {
                    $scope.lstSelectedStockTransferMain[i].listUOM = objItem1.itemuoms;
                    if (objItem1.isBatch == 1) {
                        $scope.lstSelectedStockTransferMain[i].isBatch = true;
                        $scope.lstSelectedStockTransferMain[i].BatchList = objItem1.itembatches;
                    } else {
                        $scope.lstSelectedStockTransferMain[i].isBatch = false;
                        $scope.lstSelectedStockTransferMain[i].BatchList = objItem1.itembatches;
                    }
                } else {
                    $scope.lstSelectedStockTransferMain[i].listUOM = [];
                }

                $scope.lstSelectedStockTransferMain[i].LastFromBalQty = $scope.lstSelectedStockTransferMain[i].Qty;
                $scope.lstSelectedStockTransferMain[i].LastToBalQty = $scope.lstSelectedStockTransferMain[i].Qty * -1;
                $scope.lstSelectedStockTransferMain[i].LastBatchNo = $scope.lstSelectedStockTransferMain[i].BatchNo;
                // $scope.lstSelectedStockTransferMain[i].LastToBatchNo = $scope.lstSelectedStockTransferMain[i].BatchNo;
                $scope.lstSelectedStockTransferMain[i].LastFromLocation = $scope.lstSelectedStockTransferMain[i].idLocations;
                $scope.lstSelectedStockTransferMain[i].LastToLocation = $scope.lstSelectedStockTransferMain[i].idLocations;
                $scope.lstSelectedStockTransferMain[i].LastItemCode = $scope.lstSelectedStockTransferMain[i].ItemCode;
                $scope.lstSelectedStockTransferMain[i].LastUOM = $scope.lstSelectedStockTransferMain[i].UOM;
            }

            // var objItem = _.findWhere($scope.lstItems, { ItemCode: $scope.lstSelectedStockTransferMain[0].ItemCode });
            // if (objItem) {
            //     if (objItem.isBatch == 1) {
            //         $scope.BatchList = objItem.itembatches;
            //     } else {
            //         $scope.BatchList = [];
            //     }
            // }

            $scope.WorkingStockTransferMain = null;

            // AssignStockTransferClickEvent();

            // setTimeout(function () {
            //     $scope.SelectStockTransferMainRaw(0);
            // })
        }
    };

    $scope.DeleteItem = function (id) {
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
                $http.get($rootScope.RoutePath + 'invoice/DeleteInvoice', {
                    params: params
                }).success(function (data) {
                    if (data.success == true) {
                        $scope.init();
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

    //Table function End
    $scope.ResetModel = function () {
        $scope.model = {
            id: 0,
            DocNo: '',
            InvoiceDate: moment().format('DD-MM-YYYY'),
            PurchaseDate: moment().format('DD-MM-YYYY'),
            CustomerCode: '',
            CustomerName: '',
            Ref: null,
            Description: null,
            UserCode: '',
            Address1: null,
            Address2: null,
            Address3: null,
            PhoneNumber: null,
            Fax: null,
            Attentions: null,
            BranchCode: null,
            DeliverAddress1: null,
            DeliverAddress2: null,
            DeliverAddress3: null,
            DeliverFax: null,
            DeliverPhoneNumber: null,
            Total: 0.00,
            CurrencyCode: null,
            CurrencyRate: null,
            NetTotal: 0.00,
            LocalNetTotal: 0.00,
            Tax: 0.00,
            LocalTax: 0.00,
            FinalTotal: 0.00,
            RoundAdj: 0.00,
            idLocations: $localstorage.get('DefaultLocation'),
            DefaultLocation: '',
            IsInclusive: 0,
            LoginUserCode: $localstorage.get('UserCode')
        };
        $scope.lstSelectedStockTransferMain = [];
        $scope.AddSaleMainItemInList();
        $scope.IsSave = false;
    };

    //Set Table
    function InitDataTable() {
        if ($.fn.DataTable.isDataTable('#StockTransferTable')) {
            $('#StockTransferTable').DataTable().destroy();
        }
        $('#StockTransferTable').DataTable({
            "processing": true,
            "serverSide": true,
            "responsive": true,
            "aaSorting": [1, 'ASC'],
            "ajax": {
                url: $rootScope.RoutePath + 'invoice/GetAllInvoiceDynamic',
                data: function (d) {
                    if (d.search.value != undefined) {
                        d.search = d.search.value;
                    }
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
                { "data": "DocNo" },
                { "data": "InvoiceDate" },
                { "data": "CustomerCode" },
                { "data": "CustomerName" },
                { "data": "Description" },
                { "data": "BranchCode" },
                { "data": "Total" },
                { "data": "Tax" },
                { "data": "FinalTotal" },
                { "data": null, "sortable": false, },
            ],
            "fnRowCallback": function (nRow, aData, iDisplayIndex, iDisplayIndexFull) {
                var index = iDisplayIndex + 1;
                $('td:eq(0)', nRow).html(index);
                return nRow;
            },
            "columnDefs": [{
                "render": function (data, type, row) {
                    return moment(data).format('DD-MM-YYYY');
                },
                "targets": 2
            }, {
                "render": function (data, type, row) {
                    var Action = data;
                    if (data != null && data != undefined && data != '') {
                        Action = (data).toString();
                        if (Action.length > 50) {
                            Action = '<span title="' + Action + '">' + data.substr(0, 50) + '...</span>';
                        }
                    }
                    return Action;
                },

                "targets": 5
            },
            {
                "render": function (data, type, row) {
                    var Action = '<div layout="row" layout-align="center center">';
                    Action += '<a ng-click="CopyToModel(' + row.id + ')" class="btnAction btnAction-edit" style="cursor:pointer"><i class="ion-edit" title="Edit"></i></a>&nbsp;';
                    Action += '<a ng-click="DeleteItem(' + row.id + ')" class="btnAction btnAction-error" style="cursor:pointer"><i class="ion-trash-a" title="Delete"></i></a>';
                    Action += '</div>';
                    return Action;
                },
                "targets": 10
            }
            ]
        });
    }

    // Alias
    $rootScope.ResetAll = $scope.init;

    //////////
    $scope.Add = function () {
        $scope.formsubmit = false;
        // $rootScope.BackButton =$scope.IsList = false;
    }

    $scope.ChangeInclusivePrice = function () {
        if ($scope.lstSelectedStockTransferMain.length > 0) {
            if ($scope.model.IsInclusive) {
                for (var i = 0; i < $scope.lstSelectedStockTransferMain.length; i++) {
                    if ($scope.lstSelectedStockTransferMain[i].TaxRate != 0) {
                        $scope.lstSelectedStockTransferMain[i].Price = parseFloat($scope.lstSelectedStockTransferMain[i].Price) / (($scope.lstSelectedStockTransferMain[i].TaxRate / 100) + 1);
                        if ($scope.lstSelectedStockTransferMain[i].Qty != null) {
                            $scope.lstSelectedStockTransferMain[i].Total = ($scope.lstSelectedStockTransferMain[i].Qty * parseFloat($scope.lstSelectedStockTransferMain[i].Price)) - $scope.lstSelectedStockTransferMain[i].DiscountAmount;
                            $scope.lstSelectedStockTransferMain[i].Tax = $scope.lstSelectedStockTransferMain[i].LocalTax = ($scope.lstSelectedStockTransferMain[i].Total * $scope.lstSelectedStockTransferMain[i].TaxRate) / 100;
                            $scope.lstSelectedStockTransferMain[i].FinalTotal = $scope.lstSelectedStockTransferMain[i].NetTotal = $scope.lstSelectedStockTransferMain[i].LocalNetTotal = $scope.lstSelectedStockTransferMain[i].Total + $scope.lstSelectedStockTransferMain[i].Tax;
                        } else {
                            $scope.lstSelectedStockTransferMain[i].Price = 0.00;
                            $scope.lstSelectedStockTransferMain[i].Total = 0.00;
                            $scope.lstSelectedStockTransferMain[i].FinalTotal = $scope.lstSelectedStockTransferMain[i].NetTotal = $scope.lstSelectedStockTransferMain[i].LocalNetTotal = 0.00;
                        }
                        AdjustFinalSaleTotal();
                    }
                }
            } else {
                for (var i = 0; i < $scope.lstSelectedStockTransferMain.length; i++) {
                    if ($scope.lstSelectedStockTransferMain[i].TaxRate != 0) {
                        $scope.lstSelectedStockTransferMain[i].Price = parseFloat($scope.lstSelectedStockTransferMain[i].Price) * (($scope.lstSelectedStockTransferMain[i].TaxRate / 100) + 1);
                        if ($scope.lstSelectedStockTransferMain[i].Qty != null) {
                            $scope.lstSelectedStockTransferMain[i].Total = ($scope.lstSelectedStockTransferMain[i].Qty * parseFloat($scope.lstSelectedStockTransferMain[i].Price)) - $scope.lstSelectedStockTransferMain[i].DiscountAmount;
                            $scope.lstSelectedStockTransferMain[i].Tax = $scope.lstSelectedStockTransferMain[i].LocalTax = ($scope.lstSelectedStockTransferMain[i].Total * $scope.lstSelectedStockTransferMain[i].TaxRate) / 100;
                            $scope.lstSelectedStockTransferMain[i].FinalTotal = $scope.lstSelectedStockTransferMain[i].NetTotal = $scope.lstSelectedStockTransferMain[i].LocalNetTotal = $scope.lstSelectedStockTransferMain[i].Total + $scope.lstSelectedStockTransferMain[i].Tax;
                        } else {
                            $scope.lstSelectedStockTransferMain[i].Price = 0.00;
                            $scope.lstSelectedStockTransferMain[i].Total = 0.00;
                            $scope.lstSelectedStockTransferMain[i].FinalTotal = $scope.lstSelectedStockTransferMain[i].NetTotal = $scope.lstSelectedStockTransferMain[i].LocalNetTotal = 0.00;
                        }
                        AdjustFinalSaleTotal();
                    }
                }
            }
        }
    }

    //  *******************************************************UOM Converstion********************************************************
    //UOM Converstion Model
    $ionicModal.fromTemplateUrl('UomConverstionModel.html', {
        scope: $scope,
        animation: 'slide-in-up'
    }).then(function (modal) {
        $scope.modal = modal;
    });

    $scope.OpenUOMModal = function () {
        $scope.modal.show();
    };

    $scope.closeModal = function () {
        $scope.modal.hide();
    };

    $scope.$on('$destroy', function () {
        $scope.modal.remove();
    })

    $scope.getAllUserLoaction = function () {
        var params = {
            idLocations: $scope.IsAdmin ? "" : $localstorage.get('idLocations')
        }
        $http.get($rootScope.RoutePath + 'customer/GetAllActiveLocations', { params: params }).then(function (res) {
            $scope.lstLocation = res.data.data;

        });
    };

    $scope.InitUOMFunction = function (objUOM) {
        $scope.MainUOM = {
            id: null,
            DocDate: moment().format('DD-MM-YYYY'),
            Description: 'UOM Conversion Generated From',
            Note: '',
            FromDocType: null,
            FromDocKey: null,
            FromDocNo: '',
        }
        $scope.SelectedTabUOM = 1;
        $scope.lstSelectedUOM = [];
        $scope.UOMModel = {
            id: null,
            ItemCode: objUOM.ItemCode,
            description: '',
            Location: objUOM.FromidLocations,
            BatchNo: objUOM.BatchNo,
            ProjNo: null,
            FromQty: objUOM.FromQty,
            ToQty: null,
            FromUOM: objUOM.FromUOM,
            ToUom: objUOM.ToUOM,
            IsEdit: true,
            LastBalQty: 0,
            LastBatchNo: null,
            LastLocation: null,
            LastItemCode: null,
            LastUOM: null,
            lstUOM: [],
            lstBatch: [],
        }
        $scope.GetAllItemBachNo($scope.UOMModel, true);
        $scope.UOMModel.ToQty = parseInt((parseFloat(objUOM.FromQty) * parseFloat(objUOM.FromRate)) / parseFloat(objUOM.ToRate));
        $scope.lstSelectedUOM.push($scope.UOMModel);
        $scope.WorkingUOM = $scope.UOMModel;
        // AssignClickEventBatch();
        // setTimeout(function () {
        //     $scope.SelectRaw($scope.lstSelectedUOM.length - 1);
        // })

        $scope.OpenUOMModal();
    }

    $scope.ChangeTabUOM = function (number) {
        $scope.SelectedTabUOM = number;
    }

    $scope.CalculateToQty = function (item, status, index) {
        if (item.FromUOM != null && item.ToUom != null && item.FromUOM == item.ToUom) {
            var alertPopup = $ionicPopup.alert({
                title: '',
                template: 'From UOM and To UOM must be different.',
                cssClass: 'custPop',
                okText: 'Ok',
                okType: 'btn btn-green',
            })
            alertPopup.then(function (res) {
                if (status == 'FromUOM') {
                    item.FromUOM = null;
                } else if (status == 'ToUom') {
                    item.ToUom = null;
                }
            })
        } else {
            var list = angular.copy($scope.lstSelectedUOM);
            list.splice(index, 1);

            if (item.FromUOM != null && item.FromUOM != undefined && item.FromUOM != '') {
                var obj = _.filter(list, function (o) {
                    if (o.ItemCode == item.ItemCode && o.FromUOM == item.FromUOM && o.Location == item.Location) {
                        return o;
                    }
                })[0]
                if (obj != null && obj != undefined && obj != '') {
                    item.FromUOM = null;
                    $ionicLoading.show({ template: "Please select another FromUOM ,this FromUOM already selected" });
                    setTimeout(function () {
                        $ionicLoading.hide()
                    }, 1000);
                }
            }
            if (item.ToUom != null && item.FromUOM != null && item.FromQty != null) {
                var obj = _.findWhere($scope.lstItems, { ItemCode: item.ItemCode });
                var FromPrice = _.findWhere(obj.itemuoms, { UOM: item.FromUOM }).Rate;
                var ToPrice = _.findWhere(obj.itemuoms, { UOM: item.ToUom }).Rate;
                item.ToQty = parseInt((parseFloat(item.FromQty) * parseFloat(FromPrice)) / parseFloat(ToPrice));
            }
            if (item.FromQty == null) {
                item.ToQty = null;
            }
        }
    }

    $scope.AddUOMItemInList = function () {
        if ($scope.lstSelectedUOM.length > 0 && $scope.lstSelectedUOM[$scope.lstSelectedUOM.length - 1].ItemCode == null) {
            $ionicLoading.show({ template: "Select Item Code" });
            setTimeout(function () {
                $ionicLoading.hide()
            }, 1000);
            return;
        }

        _.filter($scope.lstSelectedUOM, function (item) {
            item.IsEdit = false;
        });
        $scope.UOMModel = {
            id: null,
            ItemCode: null,
            description: null,
            Location: null,
            BatchNo: null,
            ProjNo: null,
            FromQty: null,
            ToQty: null,
            FromUOM: null,
            ToUom: null,
            IsEdit: true,
            LastBalQty: 0,
            LastBatchNo: null,
            LastLocation: null,
            LastItemCode: null,
            LastUOM: null,
            lstUOM: [],
            lstBatch: [],
        }

        $scope.lstSelectedUOM.push($scope.UOMModel);
        $scope.WorkingUOM = $scope.UOMModel;
        $scope.GetAllItemBachNo($scope.WorkingUOM, true);

        // AssignClickEventBatch();

        // setTimeout(function () {
        //     $scope.SelectRaw($scope.lstSelectedUOM.length - 1);
        // })
    }

    $scope.formUOMsubmit = false;
    $scope.SaveItem = function (form) {
        if (form.$invalid) {
            $scope.formUOMsubmit = true;
        } else {
            var NoValidData = _.filter($scope.lstSelectedUOM, function (item) {
                if (item.ItemCode == null || item.FromUOM == null || item.ToUom == null || item.Location == null || item.FromQty == null || item.ToQty == null || (item.FromQty).toString() == '' || (item.ToQty).toString() == '') {
                    return item;
                }
            });

            if (NoValidData != '') {
                var alertPopup = $ionicPopup.alert({
                    title: '',
                    template: 'Fill all compulsory filed in list.',
                    cssClass: 'custPop',
                    okText: 'Ok',
                    okType: 'btn btn-green',
                });
            } else {
                var obj = {
                    objconv: $scope.MainUOM,
                    objitem: $scope.lstSelectedUOM
                }
                if (new Date($scope.MainUOM.DocDate) == 'Invalid Date') {
                    obj.objconv.DocDate = moment().set({ 'date': $scope.MainUOM.DocDate.split('-')[0], 'month': $scope.MainUOM.DocDate.split('-')[1] - 1, 'year': $scope.MainUOM.DocDate.split('-')[2] }).format('YYYY-MM-DD');
                } else {
                    if (moment(obj.objconv.DocDate, "DD-MM-YYYY").format('YYYY-MM-DD') == 'Invalid date') {
                        obj.objconv.DocDate = moment(new Date($scope.MainUOM.DocDate)).format('YYYY-MM-DD');
                    } else {
                        obj.objconv.DocDate = moment($scope.MainUOM.DocDate, "DD-MM-YYYY").format('YYYY-MM-DD');
                    }
                }
                $http.post($rootScope.RoutePath + 'uomconv/SaveUomconv', obj).then(function (res) {
                    $scope.formUOMsubmit = false;
                    if (res.data.success) {
                        $scope.closeModal();
                    }
                    $scope.SaveSale();

                }).catch(function (err) {
                    $ionicLoading.show({ template: 'Unable to save record right now. Please try again later.' });
                    setTimeout(function () {
                        $ionicLoading.hide()
                    }, 1000);
                });
            }
        }
    }

    $scope.RemoveUOMItemInList = function (index) {
        // $scope.lstSelectedUOM = _.filter($scope.lstSelectedUOM, function (item) {
        //     return (item.ItemCode != o.ItemCode || item.FromUOM != o.FromUOM);
        // });
        $scope.lstSelectedUOM.splice(index, 1);
        if ($scope.lstSelectedUOM.length == 0) {
            $scope.AddUOMItemInList();
        }
        $scope.WorkingUOM = null;

        // AssignClickEventBatch();

        // setTimeout(function () {
        //     $scope.SelectRaw(0);
        // })
    }

    function AssignClickEventBatch() {

        setTimeout(function () {
            $("#tblUOMConv tr").unbind("click");

            $("#tblUOMConv tr").click(function () {

                if ($(this)[0].accessKey != "") {
                    for (var k = 0; k < $scope.lstSelectedUOM.length; k++) {
                        $scope.lstSelectedUOM[k].IsEdit = false;
                    }

                    $("#tblUOMConv tr").removeClass("highlight");
                    $(this).addClass("highlight");

                    $scope.WorkingUOM = $scope.lstSelectedUOM[$(this)[0].accessKey];
                    $scope.WorkingUOM.IsEdit = true;
                    // var BatchNo = $scope.WorkingUOM.BatchNo;
                    $scope.GetAllItemBachNo($scope.WorkingUOM, true);
                    // $scope.WorkingUOM.BatchNo = BatchNo;
                    $scope.UOMModel = $scope.WorkingUOM;
                    $scope.$apply();
                }
            });
        })
    }

    $scope.SelectRaw = function (index) {
        $("#tblUOMConv tr[accessKey='" + index + "']").trigger("click");
    }

    $scope.GetAllItemBachNo = function (o, flg) {
        if (!flg) {
            o.BatchNo = null;
            o.FromQty = null;
            o.ToQty = null;
            o.FromUOM = null;
            o.ToUom = null;
            o.lstUOM = [];
            o.lstBatch = [];
        }
        $scope.lstBatch = [];
        if (o.ItemCode != '' && o.ItemCode != null && o.ItemCode != undefined) {
            var obj = _.findWhere($scope.lstItems, { ItemCode: (o.ItemCode).toString() });
            $scope.lstBatch = obj.itembatches;
            $scope.lstUOM = obj.itemuoms;
            o.lstBatch = obj.itembatches;
            o.lstUOM = obj.itemuoms;
        }
    }

    //  *******************************************************End UOM Converstion********************************************************
    $scope.init();

});