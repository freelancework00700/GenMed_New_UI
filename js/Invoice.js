app.controller('InvoiceController', function ($scope, $rootScope, $ionicModal, $http, $ionicPopup, $ionicLoading, $localstorage, $state, $compile) {

    var Initstatus = 1;
    $scope.init = function () {
        setTimeout(() => {
            $("#mytext").focus();
        }, 1000);
        $scope.modelAdvanceSearch = null;
        ManageRole();
        $scope.getAllUserLoaction();
        $scope.GetAllInvoiceStatus(function () {
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
            $rootScope.BackButton = $scope.IsList = true;
            $scope.SelectedTab = 1;
            $scope.IsSave = false;
            setTimeout(function () {
                InitDataTable();
            })
            $scope.isValidMobile = false;
            $scope.isValidMobile2 = false;
            $scope.FormSales = {};

        });
    };

    function ManageRole() {
        var AdminUser = _.filter(JSON.parse($localstorage.get('UserRoles')), function (Role) {
            return Role == "Admin";
        })
        $scope.IsAdmin = AdminUser.length && AdminUser.length > 0 ? true : false;
    }
    $scope.ChangeTab = function (number) {
        $scope.SelectedTab = number;
        if ($scope.SelectedTab == 2) {
            setTimeout(function () {
                $("#PhoneNumber").intlTelInput({
                    utilsScript: "lib/intl/js/utils.js"
                });
                $("#DeliverPhoneNumber").intlTelInput({
                    utilsScript: "lib/intl/js/utils.js"
                });
            }, 500)
        }
        //  else {
        //     AssignSaleMainClickEvent();

        //     setTimeout(function () {
        //         $scope.SelectSaleMainRaw(0);
        //     })
        // }
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

    $scope.GetItemPrice = function (obj) {
        // var obj = $scope.lstSelectedSaleMain[accessKey];
        // case 1 - apply unit price and discount amt from item price if match item code,uom and price category of customer
        var CustomerObj = _.findWhere($scope.lstCustomer, { AccountNumbder: $scope.model.CustomerCode });

        var params = {
            ItemCode: obj.ItemCode,
            UOM: obj.UOM,
            idPriceCategory: CustomerObj.idPriceCategory
        }

        $http.get($rootScope.RoutePath + 'itemprice/GetItemPriceBasedONItemcodeUOMPriceCategory', { params: params }).then(function (res) {
            if (res.data.success) {
                $scope.lstItemPrice = res.data.data;
                if ($scope.lstItemPrice.isPrice) {
                    obj.Price = $scope.lstItemPrice.FixedPrice;
                    obj.DiscountAmount = null;
                } else {
                    var objUOM = _.findWhere(obj.listUOM, { UOM: obj.UOM })
                    if (objUOM) {
                        obj.Price = objUOM.Price;
                    }
                    obj.DiscountAmount = $scope.lstItemPrice.FixedDetailsDiscount;
                }

                $scope.AddTaxCode(obj, 1);
                // $scope.AddDiscountAmount(obj);
            } else {
                var objUOM = _.findWhere(obj.listUOM, { UOM: obj.UOM })
                if (objUOM) {
                    obj.Price = objUOM.Price;
                    obj.DiscountAmount = null;
                } else {
                    obj.Price = 0.00;
                    obj.DiscountAmount = null;
                }
                $scope.AddTaxCode(obj, 1);
            }
        });
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

            if (obj.Currency != undefined && obj.Currency != null && obj.Currency != '') {
                $scope.checkCurrencyRate(obj.Currency);
            } else {
                //for default currency
                $scope.model.CurrencyCode = _.findWhere($scope.lstCurrency, { isDefault: 1 }).CurrencyCode;
                $scope.model.CurrencyRate = _.findWhere($scope.lstCurrency, { CurrencyCode: $scope.model.CurrencyCode }).SellRate;
            }

            if ($scope.lstSelectedSaleMain.length > 0) {
                for (var i = 0; i < $scope.lstSelectedSaleMain.length; i++) {
                    $scope.FillItemUnitPrice($scope.lstSelectedSaleMain[i]);
                }
            }
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

    $scope.ChangeLocation = function () {
        if ($scope.lstSelectedSaleMain.length > 0) {
            var confirmPopup = $ionicPopup.confirm({
                title: "",
                template: 'Are you sure you want to change locations of all Sales?',
                cssClass: 'custPop',
                cancelText: 'Cancel',
                okText: 'Ok',
                okType: 'btn btn-green',
                cancelType: 'btn btn-red',
            })
            confirmPopup.then(function (res) {
                if (res) {
                    if ($scope.lstSelectedSaleMain.length > 0) {
                        for (var i = 0; i < $scope.lstSelectedSaleMain.length; i++) {
                            $scope.lstSelectedSaleMain[i].idLocations = parseInt($scope.model.idLocations);
                            $scope.lstSelectedSaleMain[i].DisplayLocation = _.findWhere($scope.lstLocations, { id: parseInt($scope.model.idLocations) }).Name;
                        }
                    }
                    $scope.SaleMainModel.idLocations = $scope.model.idLocations;
                    var obj = _.findWhere($scope.lstLocations, { id: parseInt($scope.model.idLocations) });
                    if (obj) {
                        $scope.model.DefaultLocation = obj.Name;
                    }
                } else {
                    $scope.model.idLocations = $localstorage.get('DefaultLocation');
                    var obj = _.findWhere($scope.lstLocations, { id: parseInt($scope.model.idLocations) });
                    if (obj) {
                        $scope.model.DefaultLocation = obj.Name;
                    }
                }
            })
        } else {
            var obj = _.findWhere($scope.lstLocations, { id: parseInt($scope.model.idLocations) });
            if (obj) {
                $scope.model.DefaultLocation = obj.Name;
            }
        }
    }

    //Start Main Sale Tab

    //add Sale main item in list
    $scope.AddSaleMainItemInList = function () {
        // if ($scope.WorkingSaleMain != undefined && $scope.WorkingSaleMain.ItemCode == '') {
        if ($scope.lstSelectedSaleMain.length > 0 && $scope.lstSelectedSaleMain[$scope.lstSelectedSaleMain.length - 1].ItemCode == '') {
            $ionicLoading.show({ template: "Fill data" });
            setTimeout(function () {
                $ionicLoading.hide()
            }, 1000);
            return;
        } else {
            _.filter($scope.lstSelectedSaleMain, function (item) {
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
                ItemCode: '',
                idLocations: $scope.model.idLocations != '' && $scope.model.idLocations != null ? $scope.model.idLocations : "",
                DisplayLocation: $scope.model.DefaultLocation,
                BatchNo: null,
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
                LastBalQty: 0,
                LastBatchNo: null,
                LastLocation: null,
                LastItemCode: null,
                LastUOM: null,
                listUOM: [],
                BatchList: [],
                isBatch: false
            }
            // $scope.BatchList = [];

            $scope.lstSelectedSaleMain.push($scope.SaleMainModel);
            $scope.WorkingSaleMain = $scope.SaleMainModel;
            // AssignSaleMainClickEvent();

            // setTimeout(function() {
            //     $scope.SelectSaleMainRaw($scope.lstSelectedSaleMain.length - 1);
            // })
        }
    }

    function AssignSaleMainClickEvent() {
        setTimeout(function () {
            $("#tblSaleMainTable tr").unbind("click");

            $("#tblSaleMainTable tr").click(function () {
                if ($(this)[0].accessKey != "") {
                    for (var k = 0; k < $scope.lstSelectedSaleMain.length; k++) {
                        $scope.lstSelectedSaleMain[k].IsEdit = false;
                    }

                    $("#tblSaleMainTable tr").removeClass("highlight");
                    $(this).addClass("highlight");

                    $scope.WorkingSaleMain = $scope.lstSelectedSaleMain[$(this)[0].accessKey];
                    $scope.WorkingSaleMain.IsEdit = true;
                    var obj = _.findWhere($scope.lstItems, { ItemCode: $scope.WorkingSaleMain.ItemCode });
                    if (obj) {
                        if (obj.isBatch == 1) {
                            $scope.BatchList = obj.itembatches;
                            $scope.WorkingSaleMain.isBatch = true;
                        } else {
                            $scope.BatchList = [];
                            $scope.WorkingSaleMain.isBatch = false;
                        }
                    }
                    $scope.$apply();
                }
            });
        })
    }

    $scope.RemoveSaleMainItemInList = function (index) {
        // $scope.lstSelectedSaleMain = _.filter($scope.lstSelectedSaleMain, function(item) {
        //     return item.UOM != $scope.WorkingSaleMain.UOM || item.ItemCode != $scope.WorkingSaleMain.ItemCode;
        // });
        $scope.lstSelectedSaleMain.splice(index, 1);
        if ($scope.lstSelectedSaleMain.length == 0) {
            $scope.model.Total = 0.00;
            $scope.model.NetTotal = 0.00;
            $scope.model.LocalNetTotal = 0.00;
            $scope.model.FinalTotal = 0.00;
            $scope.model.Tax = 0.00;
            $scope.model.LocalTax = 0.00;
            $scope.model.Weight = 0.00;
            $scope.model.WeightAmount = 0.00;
            $scope.model.Freight = 0.00;
            $scope.model.FreightAmount = 0.00;
            $scope.AddSaleMainItemInList();
        } else {
            AdjustFinalSaleTotal();
            $scope.WorkingSaleMain = $scope.lstSelectedSaleMain[$scope.lstSelectedSaleMain.length - 1];
        }

        // AssignSaleMainClickEvent();

        // setTimeout(function() {
        //     $scope.SelectSaleMainRaw(0);
        // })
    }

    $scope.SelectSaleMainRaw = function (index) {
        $("#tblSaleMainTable tr[accessKey='" + index + "']").trigger("click");
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
        if (o.Qty != 0 && o.Qty != "") {
            o.Total = (o.Qty * parseFloat(o.Price)) - parseFloat(o.DiscountAmount);
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
        if ($scope.model.CustomerCode != null && $scope.model.CustomerCode != undefined && $scope.model.CustomerCode != '') {
            var CustomerObj = _.findWhere($scope.lstCustomer, { AccountNumbder: $scope.model.CustomerCode });
            if (CustomerObj.idPriceCategory) {
                $scope.GetItemPrice(o);
            } else {
                var objUOM = _.findWhere(o.listUOM, { UOM: o.UOM })
                if (objUOM) {
                    o.Price = objUOM.Price;
                    $scope.AddTaxCode(o, 1);
                }
            }
        } else {
            var objUOM = _.findWhere(o.listUOM, { UOM: o.UOM })
            if (objUOM) {
                o.Price = objUOM.Price;
                $scope.AddTaxCode(o, 1);
            }
        }
    }

    $scope.AddLocation = function (o) {
        var obj = _.findWhere($scope.lstLocations, { id: parseInt(o.idLocations) });
        o.DisplayLocation = obj.Name;
    }

    $scope.AddDiscountAmount = function (o) {
        if (o.DiscountAmount != null && o.DiscountAmount != 0 && o.DiscountAmount != '' && o.DiscountAmount != undefined) {
            o.Total = (o.Qty * parseFloat(o.Price)) - parseFloat(o.DiscountAmount);
            o.FinalTotal = o.NetTotal = o.LocalNetTotal = o.Total + o.Tax;
            o.isDiscount = 1;
        } else {
            o.isDiscount = 0;
        }

        AdjustFinalSaleTotal();
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
        if ($scope.lstSelectedSaleMain.length > 0) {
            $scope.model.Total = 0.00;
            $scope.model.NetTotal = 0.00;
            $scope.model.LocalNetTotal = 0.00;
            $scope.model.FinalTotal = 0.00;
            $scope.model.Tax = 0.00;
            $scope.model.LocalTax = 0.00;
            $scope.model.Weight = 0.00;
            $scope.model.WeightAmount = 0.00;
            $scope.model.Freight = 0.00;
            $scope.model.FreightAmount = 0.00;

            for (var i = 0; i < $scope.lstSelectedSaleMain.length; i++) {
                $scope.model.Total = $scope.model.Total + $scope.lstSelectedSaleMain[i].Total;
                $scope.model.LocalNetTotal = $scope.model.LocalNetTotal + $scope.lstSelectedSaleMain[i].Total;
                $scope.model.NetTotal = $scope.model.FinalTotal = $scope.model.NetTotal + $scope.lstSelectedSaleMain[i].NetTotal;
                $scope.model.Tax = $scope.model.LocalTax = $scope.model.Tax + $scope.lstSelectedSaleMain[i].Tax;

                var objItem = _.findWhere($scope.lstItems, { ItemCode: $scope.lstSelectedSaleMain[i].ItemCode });
                if (objItem) {
                    if (objItem.Weight && objItem.WeightAmount) {
                        if (objItem.BaseUOM == $scope.lstSelectedSaleMain[i].UOM) {
                            $scope.model.Weight = $scope.model.Weight + (parseFloat(objItem.Weight) * $scope.lstSelectedSaleMain[i].Qty)
                        } else {
                            var objUOM = _.findWhere(objItem.itemuoms, { UOM: $scope.lstSelectedSaleMain[i].UOM });
                            if (objUOM) {
                                $scope.model.Weight = $scope.model.Weight + (parseFloat(objItem.Weight) * ($scope.lstSelectedSaleMain[i].Qty * objUOM.Rate));
                            }
                        }
                        $scope.model.WeightAmount = ($scope.model.Weight * parseFloat(objItem.WeightAmount)) / parseFloat(objItem.Weight);
                    }

                    if (objItem.Freight && objItem.FreightAmount) {
                        if (objItem.BaseUOM == $scope.lstSelectedSaleMain[i].UOM) {
                            $scope.model.Freight = $scope.model.Freight + (parseFloat(objItem.Freight) * $scope.lstSelectedSaleMain[i].Qty)
                        } else {
                            var objUOM = _.findWhere(objItem.itemuoms, { UOM: $scope.lstSelectedSaleMain[i].UOM });
                            if (objUOM) {
                                $scope.model.Freight = $scope.model.Freight + (parseFloat(objItem.Freight) * ($scope.lstSelectedSaleMain[i].Qty * objUOM.Rate));
                            }
                        }
                        $scope.model.FreightAmount = ($scope.model.Freight * parseFloat(objItem.FreightAmount)) / parseFloat(objItem.Freight);
                    }
                }
            }
            if ($scope.model.DiscountRate != null && $scope.model.DiscountRate != '' && $scope.model.DiscountRate != undefined) {
                $scope.model.Total = ($scope.model.Total - ($scope.model.Total * $scope.model.DiscountRate) / 100);
                $scope.model.NetTotal = $scope.model.FinalTotal = $scope.model.Total + $scope.model.Tax;
            }

        }
    }

    $scope.ManageDiscount = function () {
        AdjustFinalSaleTotal();
    }


    //End Main Sale Tab
    $scope.formsubmit = false;
    $scope.SaveSale = function (form) {

        var NoItemCode = _.findWhere($scope.lstSelectedSaleMain, { ItemCode: '' });
        if (NoItemCode) {
            var alertPopup = $ionicPopup.alert({
                title: '',
                template: 'Item code missing.First select Item code for all items in list.',
                cssClass: 'custPop',
                okText: 'Ok',
                okType: 'btn btn-green',
            });
        } else {

            var NoQty = _.filter($scope.lstSelectedSaleMain, function (item) {
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
                if (form.$invalid) {
                    $scope.formsubmit = true;
                    return
                }
                var BatchList = _.where($scope.lstSelectedSaleMain, { isBatch: true });

                if ($scope.IsSave == false) {
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


        function Save() {
            // if (!$("#PhoneNumber").intlTelInput("isValidNumber")) {
            //     $scope.isValidMobile = true
            //     if ($scope.model.PhoneNumber.toString().length <= 2) {
            //         $scope.isValidMobile = false
            //         $scope.model.PhoneNumber = '';
            //     } else {
            //         return;
            //     }

            // }
            // if (!$("#DeliverPhoneNumber").intlTelInput("isValidNumber")) {
            //     $scope.isValidMobile2 = true
            //     if ($scope.model.DeliverPhoneNumber.toString().length <= 2) {
            //         $scope.isValidMobile2 = false
            //         $scope.model.DeliverPhoneNumber = '';
            //     } else {
            //         return;
            //     }

            // }
            $scope.isValidMobile = false
            $scope.isValidMobile2 = false
            if (!$scope.model.id) {
                $scope.model.id = 0;
            }
            $scope.model.lstInvoiceDetail = $scope.lstSelectedSaleMain;
            if (new Date($scope.model.InvoiceDate) == 'Invalid Date') {
                $scope.model.InvoiceDate = moment().set({ 'date': $scope.model.InvoiceDate.split('-')[0], 'month': $scope.model.InvoiceDate.split('-')[1] - 1, 'year': $scope.model.InvoiceDate.split('-')[2] }).format('YYYY-MM-DD');
            } else {
                if (moment($scope.model.InvoiceDate, "DD-MM-YYYY").format('YYYY-MM-DD') == 'Invalid date') {
                    $scope.model.InvoiceDate = moment($scope.model.InvoiceDate).format('YYYY-MM-DD');
                } else {
                    $scope.model.InvoiceDate = moment($scope.model.InvoiceDate, "DD-MM-YYYY").format('YYYY-MM-DD');
                }
            }

            $scope.ListMaxSellingPrice = [];
            $scope.ListMinSellingPrice = [];
            _.filter($scope.lstSelectedSaleMain, function (p) {
                var obj = _.findWhere(p.listUOM, { UOM: p.UOM });
                if (obj) {
                    if (p.Price > obj.MaxSalePrice) {
                        $scope.ListMaxSellingPrice.push(p);
                    }
                    if (p.Price < obj.MinSalePrice) {
                        $scope.ListMinSellingPrice.push(p);
                    }
                }
            })
            if ($scope.ListMaxSellingPrice.length > 0 || $scope.ListMinSellingPrice.length > 0) {
                var confirmPopup = $ionicPopup.confirm({
                    title: "",
                    template: '<p ng-if="ListMaxSellingPrice.length > 0"><b>Selling Price for ' + _.pluck($scope.ListMaxSellingPrice, 'ItemCode').toString() + ' is too high base on maximum selling price.</b></p>' +
                        '<p ng-if="ListMinSellingPrice.length > 0"><b>And</b></p>' +
                        '<p ng-if="ListMinSellingPrice.length > 0"><b>Selling Price for ' + _.pluck($scope.ListMinSellingPrice, 'ItemCode').toString() + ' is too low base on minimum selling price.</b></p>' +
                        '<p>Are you sure you want to continue ?</p>',
                    cssClass: 'custPop',
                    cancelText: 'Cancel',
                    okText: 'Ok',
                    okType: 'btn btn-green',
                    cancelType: 'btn btn-red',
                    scope: $scope,
                })
                confirmPopup.then(function (res) {
                    if (res) {
                        $rootScope.ShowLoader();
                        $http.post($rootScope.RoutePath + 'invoice_new/SaveInvoice', $scope.model)
                            .then(function (res) {
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
                                            template: 'Some of the item(s) in back order leval,do you want to do UOM conversion for thoes item(s)?',
                                            cssClass: 'custPop',
                                            cancelText: 'Cancel',
                                            okText: 'Ok',
                                            okType: 'btn btn-green',
                                            cancelType: 'btn btn-red',
                                        })
                                        confirmPopup.then(function (resmodal) {
                                            if (resmodal) {
                                                var objUOM = _.findWhere($scope.lstSelectedSaleMain, { ItemCode: ResponseSales.data.ItemCode });
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
                        $scope.IsSave = true;
                    }
                })
            } else {
                $http.post($rootScope.RoutePath + 'invoice_new/SaveInvoice', $scope.model)
                    .then(function (res) {
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
                                    title: 'Confirm',
                                    template: 'Some of the item(s) in back order leval,do you want to do UOM conversion for thoes item(s)?',
                                    cssClass: 'customPopup',
                                    scope: $scope,
                                });
                                confirmPopup.then(function (resmodal) {
                                    if (resmodal) {
                                        var objUOM = _.findWhere($scope.lstSelectedSaleMain, { ItemCode: ResponseSales.data.ItemCode });
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
        }
    };

    // Use more distinguished and understandable naming
    $scope.CopyToModel = function (id) {
        var selectedItem = _.findWhere($scope.lstdata, { id: parseInt(id) });
        $scope.tab.selectedIndex = 1;
        $rootScope.BackButton = $scope.IsList = false;

        for (var prop in $scope.model) {
            $scope.model[prop] = selectedItem[prop];
            if (prop == 'idLocations') {
                $scope.model['idLocations'] = $localstorage.get('DefaultLocation');
            }
            if (prop == 'InvoiceDate') {
                $scope.model['InvoiceDate'] = moment(selectedItem[prop]).format('DD-MM-YYYY');
            }
            if (prop == 'ModifiedBy') {
                $scope.model['ModifiedBy'] = parseInt($localstorage.get('UserId'));
            }

            if ((prop == 'Weight' || prop == 'WeightAmount' || prop == 'Freight' || prop == 'FreightAmount') && selectedItem.invoiceadvancedetail_new) {
                $scope.model[prop] = selectedItem.invoiceadvancedetail_new[prop];
            }
        }
        $scope.lstSelectedSaleMain = selectedItem.invoicedetails_news;


        if ($scope.lstSelectedSaleMain.length > 0) {
            for (var i = 0; i < $scope.lstSelectedSaleMain.length; i++) {
                $scope.lstSelectedSaleMain[i].IsEdit = false;
                if ($scope.lstSelectedSaleMain[i].TaxCode) {
                    var obj = _.findWhere($scope.lstTaxCode, { TaxType: $scope.lstSelectedSaleMain[i].TaxCode });
                    if (obj) {
                        $scope.lstSelectedSaleMain[i].TaxRate = obj.TaxRate;
                    }
                }

                if ($scope.lstSelectedSaleMain[i].idLocations) {
                    var obj1 = _.findWhere($scope.lstLocations, { id: parseInt($scope.lstSelectedSaleMain[i].idLocations) });
                    $scope.lstSelectedSaleMain[i].idLocations = ($scope.lstSelectedSaleMain[i].idLocations).toString();
                    if (obj1) {
                        $scope.lstSelectedSaleMain[i].DisplayLocation = obj1.Name;
                    }
                }

                var objItem1 = _.findWhere($scope.lstItems, { ItemCode: $scope.lstSelectedSaleMain[i].ItemCode });
                if (objItem1) {
                    $scope.lstSelectedSaleMain[i].listUOM = objItem1.itemuoms;
                    if (objItem1.isBatch == 1) {
                        $scope.lstSelectedSaleMain[i].isBatch = true;
                        $scope.lstSelectedSaleMain[i].BatchList = objItem1.itembatches;
                    } else {
                        $scope.lstSelectedSaleMain[i].isBatch = false;
                        $scope.lstSelectedSaleMain[i].BatchList = objItem1.itembatches;
                    }
                } else {
                    $scope.lstSelectedSaleMain[i].listUOM = [];
                }

                $scope.lstSelectedSaleMain[i].LastBalQty = $scope.lstSelectedSaleMain[i].Qty;
                $scope.lstSelectedSaleMain[i].LastBatchNo = $scope.lstSelectedSaleMain[i].BatchNo;
                $scope.lstSelectedSaleMain[i].LastLocation = $scope.lstSelectedSaleMain[i].idLocations;
                $scope.lstSelectedSaleMain[i].LastItemCode = $scope.lstSelectedSaleMain[i].ItemCode;
                $scope.lstSelectedSaleMain[i].LastUOM = $scope.lstSelectedSaleMain[i].UOM;
            }

            // var objItem = _.findWhere($scope.lstItems, { ItemCode: $scope.lstSelectedSaleMain[0].ItemCode });
            // if (objItem) {
            //     if (objItem.isBatch == 1) {
            //         $scope.BatchList = objItem.itembatches;
            //     } else {
            //         $scope.BatchList = [];
            //     }
            // }
            $scope.WorkingSaleMain = $scope.lstSelectedSaleMain[$scope.lstSelectedSaleMain.length - 1];

            // AssignSaleMainClickEvent();

            // setTimeout(function() {
            //     $scope.SelectSaleMainRaw(0);
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
                $http.get($rootScope.RoutePath + 'invoice_new/DeleteInvoice', {
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
            flgUOMConversation: false,
            UOMConversationId: null,
            idStatus: Initstatus,
            IsInclusive: 0,
            DiscountRate: null,
            IsFavorite: 0,
            CreatedBy: parseInt($localstorage.get('UserId')),
            CreatedDate: null,
            ModifiedBy: null,
            ModifiedDate: null,
            Weight: 0,
            WeightAmount: 0,
            Freight: 0,
            FreightAmount: 0,
            LoginUserCode: $localstorage.get('UserCode')
        };
        $scope.Searchmodel = {
            Search: '',
        }

        $scope.lstSelectedSaleMain = [];
        $scope.AddSaleMainItemInList();
        $scope.IsSave = false;
    };

    $scope.DisplayCustomerCode = function (o) {
        $scope.model.CustomerCode = DisplayCustomerCode(o.CustomerCode);
        $scope.SelectCustomer($scope.model.CustomerCode)
    }

    function DisplayCustomerCode(CustomerCode) {
        var obj = _.findWhere($scope.lstCustomer, { id: parseInt(CustomerCode) });
        if (obj) {
            return obj.AccountNumbder;
        } else {
            return "";
        }
    }

    $scope.FilterData = function () {
        $('#InvoiceTable').dataTable().api().ajax.reload();
    }

    $scope.EnableFilterOption = function () {
        $(function () {
            $(".CustFilter").slideToggle();
        });
    };

    $scope.FilterAdvanceData = function (o) {
        $scope.modelAdvanceSearch = o;
        $('#InvoiceTable').dataTable().api().ajax.reload();
    }

    //Set Table
    function InitDataTable() {
        if ($.fn.DataTable.isDataTable('#InvoiceTable')) {
            $('#InvoiceTable').DataTable().destroy();
        }
        $('#InvoiceTable').DataTable({
            "processing": true,
            "dom": 'rt<"bottom"<"left"<"length"l><"info"i>><"right"<"pagination"p>>>',
            "serverSide": true,
            "responsive": true,
            "aaSorting": [2, 'DESC'],
            "ajax": {
                url: $rootScope.RoutePath + 'invoice_new/GetAllInvoiceDynamic',
                data: function (d) {
                    if ($scope.Searchmodel.Search != undefined) {
                        d.search = $scope.Searchmodel.Search;
                    }
                    d.idLocations = $scope.IsAdmin ? "" : $localstorage.get('idLocations');
                    d.modelAdvanceSearch = $scope.modelAdvanceSearch;
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
                { "data": "DocNo", "defaultContent": "N/A" },
                { "data": "InvoiceDate", "defaultContent": "N/A" },
                { "data": "CustomerCode", "defaultContent": "N/A" },
                { "data": "CustomerName", "defaultContent": "N/A" },
                { "data": "Description", "defaultContent": "N/A" },
                { "data": "BranchCode", "defaultContent": "N/A" },
                { "data": "idStatus", "defaultContent": "N/A" },
                { "data": "Total", "defaultContent": "N/A" },
                { "data": "Tax", "defaultContent": "N/A" },
                { "data": "FinalTotal", "defaultContent": "N/A" },
                { "data": "IsFavorite", "sortable": false, },
                { "data": null, "sortable": false, },
            ],
            "columnDefs": [{
                "render": function (data, type, row, meta) {
                    return meta.row + meta.settings._iDisplayStart + 1;
                },
                "targets": 0,
            },
            {
                "render": function (data, type, row) {
                    return moment(data).format('DD-MM-YYYY');
                },
                "targets": 2
            }, {
                "render": function (data, type, row) {
                    if (data != null && data != undefined && data != '') {
                        var val = parseFloat(data);
                        return val.toFixed(2);
                    } else {
                        return 0;
                    }
                },
                "targets": [8, 9, 10],
                className: "right-aligned-cell"
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
                    var Action = "";
                    var findStatus = _.findWhere($scope.lstStatus, { id: row.idStatus });
                    if (findStatus) {
                        var FindNextStatus = _.findWhere($scope.lstStatus, { Order: findStatus.Order });
                        if (FindNextStatus) {
                            Action = FindNextStatus.Status;
                        }
                    } else {
                        return "N/A";
                    }
                    return Action;
                },
                "targets": 7
            },
            {
                "render": function (data, type, row) {
                    var Action = '<div layout="row" layout-align="center center">';
                    if (row.IsFavorite == 1) {
                        Action += '<a class="btnAction btnAction-edit"><i class="ion-checkmark"></i></a>';
                    } else {
                        Action += '<a class="btnAction btnAction-error"><i class="ion-close"></i></a>';
                    }
                    Action += '</div>';
                    return Action;
                },
                "targets": 11,
            },
            {
                "render": function (data, type, row) {
                    var Action = '<div layout="row" layout-align="center center">';
                    Action += '<a ng-click="CopyToModel(' + row.id + ')" class="btnAction btnAction-edit" style="cursor:pointer"><i class="ion-edit" title="Edit"></i></a>&nbsp;';
                    Action += '<a ng-click="DeleteItem(' + row.id + ')" class="btnAction btnAction-error" style="cursor:pointer"><i class="ion-trash-a" title="Delete"></i></a>&nbsp;';
                    Action += '<a ng-click="GenerateReport(' + row.id + ')" class="btnAction btnAction-info" style="cursor:pointer"><i class="ion-document-text" title="Document"></i></a>&nbsp;';
                    Action += '<a ng-click="StockTransfer(' + row.id + ')" class="btnAction btnAction-alert" style="cursor:pointer"><i class="ion-arrow-swap" title="Stock Transfer"></i></a>&nbsp;';
                    Action += '<a ng-click="CopyInvoice(' + row.id + ')" class="btnAction btnAction-info" style="cursor:pointer"><i class="ion-ios-copy" title="Copy Invoice"></i></a>&nbsp;';
                    Action += '<a ng-click="OpenDeliveryPackingSlip(' + row.id + ')" class="btnAction btnAction-alert" style="cursor:pointer"><i class="ion-ios-list" title="Generate Delivery Slip"></i></a>&nbsp;';
                    var findStatus = _.findWhere($scope.lstStatus, { id: row.idStatus });
                    if (findStatus && findStatus.Order != '' && findStatus.Order != null) {
                        var FindNextStatus = _.findWhere($scope.lstStatus, { Order: findStatus.Order + 1 });
                        if (FindNextStatus) {
                            Action += ' <button type="button" class="btn btn-success" ng-click="UpdateSalesStatus(' + row.id + ',' + FindNextStatus.id + ')">' + FindNextStatus.Status + '</button>';
                        }
                        Action += '</div>';
                    }
                    return Action;
                },
                "targets": 12
            }
            ]
        });
    }

    // Alias
    $rootScope.ResetAll = $scope.init;
    $scope.ValidateMobileNumber = function () {
        if (!$("#PhoneNumber").intlTelInput("isValidNumber")) {
            $scope.isValidMobile = true
            if ($scope.model.PhoneNumber.toString().length <= 2) {
                $scope.isValidMobile = false
            }
        } else {
            $scope.isValidMobile = false
        }
    }

    $scope.ValidateMobileNumber2 = function () {
        if (!$("#DeliverPhoneNumber").intlTelInput("isValidNumber")) {
            $scope.isValidMobile2 = true
            if ($scope.model.DeliverPhoneNumber.toString().length <= 2) {
                $scope.isValidMobile2 = false
            }
        } else {
            $scope.isValidMobile2 = false
        }
    }

    $scope.Add = function () {
        $scope.formsubmit = false;
        $rootScope.BackButton = $scope.IsList = false;
    }

    $scope.GenerateReport = function (Id) {
        window.open($rootScope.RoutePath + "invoice_new/GenerateInvoice?Id=" + Id, '_blank');
    }

    $scope.ChangeInclusivePrice = function () {
        if ($scope.lstSelectedSaleMain.length > 0) {
            if ($scope.model.IsInclusive) {
                for (var i = 0; i < $scope.lstSelectedSaleMain.length; i++) {
                    if ($scope.lstSelectedSaleMain[i].TaxRate != 0) {
                        $scope.lstSelectedSaleMain[i].Price = parseFloat($scope.lstSelectedSaleMain[i].Price) / (($scope.lstSelectedSaleMain[i].TaxRate / 100) + 1);
                        if ($scope.lstSelectedSaleMain[i].Qty != null) {
                            $scope.lstSelectedSaleMain[i].Total = ($scope.lstSelectedSaleMain[i].Qty * parseFloat($scope.lstSelectedSaleMain[i].Price)) - $scope.lstSelectedSaleMain[i].DiscountAmount;
                            $scope.lstSelectedSaleMain[i].Tax = $scope.lstSelectedSaleMain[i].LocalTax = ($scope.lstSelectedSaleMain[i].Total * $scope.lstSelectedSaleMain[i].TaxRate) / 100;
                            $scope.lstSelectedSaleMain[i].FinalTotal = $scope.lstSelectedSaleMain[i].NetTotal = $scope.lstSelectedSaleMain[i].LocalNetTotal = $scope.lstSelectedSaleMain[i].Total + $scope.lstSelectedSaleMain[i].Tax;
                        } else {
                            $scope.lstSelectedSaleMain[i].Price = 0.00;
                            $scope.lstSelectedSaleMain[i].Total = 0.00;
                            $scope.lstSelectedSaleMain[i].FinalTotal = $scope.lstSelectedSaleMain[i].NetTotal = $scope.lstSelectedSaleMain[i].LocalNetTotal = 0.00;
                        }
                        AdjustFinalSaleTotal();
                    }
                }
            } else {
                for (var i = 0; i < $scope.lstSelectedSaleMain.length; i++) {
                    if ($scope.lstSelectedSaleMain[i].TaxRate != 0) {
                        $scope.lstSelectedSaleMain[i].Price = parseFloat($scope.lstSelectedSaleMain[i].Price) * (($scope.lstSelectedSaleMain[i].TaxRate / 100) + 1);
                        if ($scope.lstSelectedSaleMain[i].Qty != null) {
                            $scope.lstSelectedSaleMain[i].Total = ($scope.lstSelectedSaleMain[i].Qty * parseFloat($scope.lstSelectedSaleMain[i].Price)) - $scope.lstSelectedSaleMain[i].DiscountAmount;
                            $scope.lstSelectedSaleMain[i].Tax = $scope.lstSelectedSaleMain[i].LocalTax = ($scope.lstSelectedSaleMain[i].Total * $scope.lstSelectedSaleMain[i].TaxRate) / 100;
                            $scope.lstSelectedSaleMain[i].FinalTotal = $scope.lstSelectedSaleMain[i].NetTotal = $scope.lstSelectedSaleMain[i].LocalNetTotal = $scope.lstSelectedSaleMain[i].Total + $scope.lstSelectedSaleMain[i].Tax;
                        } else {
                            $scope.lstSelectedSaleMain[i].Price = 0.00;
                            $scope.lstSelectedSaleMain[i].Total = 0.00;
                            $scope.lstSelectedSaleMain[i].FinalTotal = $scope.lstSelectedSaleMain[i].NetTotal = $scope.lstSelectedSaleMain[i].LocalNetTotal = 0.00;
                        }
                        AdjustFinalSaleTotal();
                    }
                }
            }
        }
    }

    $scope.CopyInvoice = function (o) {
        $scope.Copy = false;
        var obj1 = _.findWhere($scope.lstdata, { id: parseInt(o) });
        var obj = angular.copy(obj1);
        $scope.lstSelectedSaleMain = [];

        obj.id = 0;
        obj.DocNo = null;
        obj.InvoiceDate = moment().format('YYYY-MM-DD');
        obj.idStatus = 1;
        obj.LoginUserCode = $localstorage.get('UserCode')

        _.filter(obj.invoicedetails_news, function (p) {
            p.id = 0;
            p.idInvoice = null;
            p.LastBalQty = p.Qty;
            p.LastBatchNo = p.BatchNo;
            p.LastLocation = p.idLocations;
            p.LastItemCode = p.ItemCode;
            p.LastUOM = p.UOM;
            $scope.lstSelectedSaleMain.push(p);
        })

        for (var prop in $scope.model) {
            $scope.model[prop] = obj[prop];
        }

        if ($scope.IsSave == false) {
            var confirmPopup = $ionicPopup.confirm({
                title: "",
                template: '<p>Are you sure, you want to copy this invoice?</p>',
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
                }
            })
        } else {
            Save();
        }


        function Save() {
            $scope.model.lstInvoiceDetail = $scope.lstSelectedSaleMain;

            $http.post($rootScope.RoutePath + 'invoice_new/SaveInvoice', $scope.model)
                .then(function (res) {
                    var ResponseSales = res.data;
                    if (ResponseSales.success) {
                        $ionicLoading.show({ template: ResponseSales.message });
                        setTimeout(function () {
                            $ionicLoading.hide()
                        }, 1000);
                        $scope.init();
                        $scope.IsSave = false;
                        $scope.Copy = false;
                    } else {
                        if (ResponseSales.CanConvert) {
                            var confirmPopup = $ionicPopup.confirm({
                                title: 'Confirm',
                                template: 'Some of the item(s) in back order leval,do you want to do UOM conversion for thoes item(s)?',
                                cssClass: 'customPopup',
                                scope: $scope,
                            });
                            confirmPopup.then(function (resmodal) {
                                if (resmodal) {
                                    $scope.Copy = true;
                                    $scope.CopyId = o;
                                    var objUOM = _.findWhere($scope.lstSelectedSaleMain, { ItemCode: ResponseSales.data.ItemCode });
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
    }; // Cleanup the modal when we're done with it!

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
            FromDocType: 'SI',
            FromDocKey: null,
            FromDocNo: '',
        }
        $scope.SelectedTabUOM = 1;
        $scope.lstSelectedUOM = [];

        $scope.UOMModel = {
            id: null,
            ItemCode: objUOM.ItemCode,
            description: '',
            Location: objUOM.idLocations,
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
                })[0];
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
        $scope.WorkingUOM.IsEdit = true;
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
                    $scope.model.flgUOMConversation = true;
                    $scope.model.UOMConversationId = res.data.data;
                    if ($scope.Copy == true) {
                        $scope.CopyInvoice($scope.CopyId);
                    } else {
                        $scope.SaveSale($scope.FormSales);
                    }

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
            // $scope.lstBatch = obj.itembatches;
            // $scope.lstUOM = obj.itemuoms;

            o.lstBatch = obj.itembatches;
            o.lstUOM = obj.itemuoms;
        }
    }

    //  *******************************************************End UOM Converstion********************************************************

    //********************************************************Update Sales Status ******************************************************/

    $scope.GetAllInvoiceStatus = function (call) {
        $http.get($rootScope.RoutePath + 'invoice/GetAllInvoiceStatus').then(function (res) {
            $scope.lstStatus = res.data.data;
            var objStatus = _.filter($scope.lstStatus, function (status) {
                if (status.Order != '' && status.Order != null) {
                    return status;
                }
            })
            Initstatus = objStatus && objStatus.length > 0 ? objStatus[0].id : 1;
            return call();
        });
    }

    $scope.UpdateSalesStatus = function (idSales, idStatus) {
        var objStatus = _.findWhere($scope.lstStatus, { id: idStatus });
        var confirmPopup = $ionicPopup.confirm({
            title: "",
            template: 'Are you sure to ' + objStatus.Status + ' this Sales ?',
            cssClass: 'custPop',
            cancelText: 'Cancel',
            okText: 'Ok',
            okType: 'btn btn-green',
            cancelType: 'btn btn-red',
        })
        confirmPopup.then(function (res) {
            if (res) {
                return $http.get($rootScope.RoutePath + 'invoice_new/UpdateSalesStatus', {
                    params: { idSales: idSales, idStatus: objStatus.id, Status: objStatus.Status }
                }).then(function (res) {
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
            }
        });
    }

    //********************************************************Update Sales Status End *************************************************/

    //*********************************************************Stock Transfer Start*****************************************************/

    $scope.StockTransfer = function (id) {
        var obj = _.findWhere($scope.lstdata, { id: id });
        $scope.objPurchse = {};
        obj['LoginUserCode'] = $localstorage.get('UserCode')
        for (var prop in obj) {
            if (prop == 'id') {
                $scope.objPurchse[prop] = 0;
            } else if (prop == 'DocNo') {
                $scope.objPurchse[prop] = '';
            } else if (prop == 'InvoiceDate') {
                $scope.objPurchse['PurchaseDate'] = moment(obj[prop]).format('YYYY-MM-DD');
            } else if (prop == 'idLocations') {
                $scope.objPurchse[prop] = $localstorage.get('DefaultLocation');
            } else if (prop == 'invoicedetails_news') {
                $scope.objPurchse['lstPurchaseDetail'] = [];
                for (var i = 0; i < obj[prop].length; i++) {
                    var DetailObject = {};
                    for (var prop1 in obj[prop][i]) {
                        if (prop1 == 'id' || prop1 == 'idLocations') {
                            DetailObject[prop1] = null;
                        } else if (prop1 == 'idInvoice') {
                            DetailObject['idPurchase'] = null;
                        } else {
                            DetailObject[prop1] = obj[prop][i][prop1]
                        }
                    }
                    $scope.objPurchse['lstPurchaseDetail'].push(DetailObject);
                }
            } else {
                $scope.objPurchse[prop] = obj[prop];
            }
        }

        var myPopup = $ionicPopup.show({
            template:
                // 'Name <select class="formControl" name="CustomerCode" ng-model="objPurchse.CustomerCode">' +
                // '<option value="">Select Customer</option>' +
                // '<option value="{{o.AccountNumbder}}" ng-repeat="o in lstCustomer">{{o.AccountNumbder}}-{{o.Name}}</option>' +
                // '</select>' +
                'Select Location <select class="formControl" name="idLocations" ng-model="objPurchse.idLocations">' +
                '<option value="{{o.id}}" ng-repeat="o in lstLocations">{{o.Name}}</option>' +
                '</select>',

            scope: $scope,
            cssClass: "custPop",
            buttons: [{
                text: 'Save',
                type: 'btn btn-green',
                onTap: function (e) {
                    if (!$scope.objPurchse.idLocations) {
                        e.preventDefault();
                    } else {
                        // var customer = _.findWhere($scope.lstCustomer, { AccountNumbder: $scope.objPurchse.CustomerCode });
                        // if (customer) {
                        //     $scope.objPurchse.CustomerName = customer.Name;
                        //     $scope.objPurchse.Address1 = customer.BillingAddress1;
                        //     $scope.objPurchse.Address2 = customer.BillingAddress2;
                        //     $scope.objPurchse.Address3 = customer.BillingAddress3;
                        //     $scope.objPurchse.BranchCode = customer.customerbranch.Name;
                        // } else {
                        //     $scope.objPurchse.Address1 = "";
                        //     $scope.objPurchse.Address2 = "";
                        //     $scope.objPurchse.Address3 = "";
                        // }

                        _.filter($scope.objPurchse.lstPurchaseDetail, function (item) {
                            item.idLocations = $scope.objPurchse.idLocations;
                        });

                        $http.post($rootScope.RoutePath + 'purchase/SavePurchase', $scope.objPurchse).then(function (res) {
                            if (res.data.success) {
                                $scope.objPurchse = {};
                            }
                            $ionicLoading.show({ template: res.data.message });
                            setTimeout(function () {
                                $ionicLoading.hide()
                            }, 1000);
                        }).catch(function (err) {
                            $ionicLoading.show({ template: 'Unable to save record right now. Please try again later.' });
                            setTimeout(function () {
                                $ionicLoading.hide()
                            }, 1000);

                        });
                    }
                }
            }, {
                text: 'Cancel',
                type: 'btn btn-red',
            }]
        });
    }

    //*********************************************************Stock Transfer End ******************************************************/

    //*********************************************************Generate Delivery Packing Slip Start ******************************************************/

    $ionicModal.fromTemplateUrl('DeliveryPackingSlipModel.html', {
        scope: $scope,
        animation: 'slide-in-up'
    }).then(function (modal) {
        $scope.DeliveryModal = modal;
    });

    $scope.OpenDeliveryPackingSlip = function (o) {
        var objDoc = _.findWhere($scope.lstdata, { id: parseInt(o) });
        $http.get($rootScope.RoutePath + 'invoice/GetDeliverySlipBySourceDocNo?SourceNo=' + objDoc.DocNo).then(function (resCode) {
            if (resCode.data.success) {
                $scope.InitDeliveryPackingSlip(resCode.data.data, 'update');
                $scope.DeliveryModal.show();
            } else {
                $scope.InitDeliveryPackingSlip(objDoc, 'insert');
                $scope.DeliveryModal.show();
            }
        });
    };

    $scope.closeDeliveryPackingSlipModal = function () {
        $scope.DeliveryModal.hide();
    };

    $scope.InitDeliveryPackingSlip = function (o, status) {
        $scope.DeliverySlipModel = {
            id: 0,
            DocNo: null,
            DocDate: moment().format('DD-MM-YYYY'),
            SourceNo: o.DocNo,
            SourceType: 'IV'
        };
        $scope.DeliveryList = [];
        $scope.DeliveryItemList = [];
        $scope.PostFix = 1;



        if (status == 'insert') {
            $scope.GetLastDeliveryDocNo();
            _.filter(o.invoicedetails_news, function (q) {
                _.filter($scope.lstItems, function (p) {
                    if (p.ItemCode == q.ItemCode) {
                        $scope.DeliveryItemList.push(q);
                    }
                })
            })
        } else {
            $scope.CopyToDeliverySlipModel(o);
        }
    }

    $scope.GetLastDeliveryDocNo = function () {
        $http.get($rootScope.RoutePath + 'invoice/GetLastDeliveryDocNo').then(function (resCode) {
            if (resCode.data.success) {
                $scope.DeliverySlipModel.DocNo = resCode.data.LastNumber;

                var obj = {
                    id: 0,
                    IdDeliveryPackingSlip: null,
                    BoxNo: $scope.DeliverySlipModel.DocNo + '_' + $scope.PostFix,
                    ListItem: [{
                        ItemCode: null,
                        Qty: 0,
                        Price: null
                    }],
                }
                $scope.DeliveryList.push(obj);
                $scope.PostFix = $scope.PostFix + 1;
            }
        })
    }

    $scope.AddItem = function (obj) {
        if (obj.ListItem.length > 0 && obj.ListItem[obj.ListItem.length - 1].ItemCode == null) {
            $ionicLoading.show({ template: "Fill data" });
            setTimeout(function () {
                $ionicLoading.hide()
            }, 1000);
            return;
        } else {
            var data = {
                ItemCode: null,
                Qty: 0,
                Price: null
            }
            obj.ListItem.push(data);
        }
    }

    $scope.RemoveItem = function (obj, index) {
        obj.ListItem.splice(index, 1);
        if (obj.ListItem.length == 0) {
            $scope.AddItem(obj);
        }
    }

    $scope.SetPrice = function (item) {
        _.filter($scope.lstdata, function (p) {
            if (p.DocNo == $scope.DeliverySlipModel.SourceNo) {
                _.filter(p.invoicedetails_news, function (q) {
                    if (q.ItemCode == item.ItemCode) {
                        if (q.Tax > 0) {
                            var obj = _.findWhere($scope.lstTaxCode, { TaxType: q.TaxCode });
                            if (obj) {
                                var TaxRate = obj.TaxRate;
                                item.Price = (item.Qty * q.Price);
                                var Tax = (item.Price * TaxRate) / 100;
                                item.Price = item.Price + Tax;
                            } else {
                                item.Price = (item.Qty * q.Price);
                            }
                        } else {
                            item.Price = (item.Qty * q.Price);
                        }
                    }
                })
            }
        })
    }

    $scope.AddMainDeliveryItem = function () {
        if ($scope.DeliveryList.length > 0 && $scope.DeliveryList[$scope.DeliveryList.length - 1].ListItem[$scope.DeliveryList[$scope.DeliveryList.length - 1].ListItem.length - 1].ItemCode == null) {
            $ionicLoading.show({ template: "Fill data" });
            setTimeout(function () {
                $ionicLoading.hide()
            }, 1000);
            return;
        } else {
            var data = {
                id: 0,
                IdDeliveryPackingSlip: null,
                BoxNo: $scope.DeliverySlipModel.DocNo + '_' + $scope.PostFix,
                ListItem: [{
                    ItemCode: null,
                    Qty: null,
                    Price: null
                }],
            }
            $scope.DeliveryList.push(data);
            $scope.PostFix = $scope.PostFix + 1;
        }
    }

    $scope.RemoveMainDeliveryItem = function (index) {
        $scope.DeliveryList.splice(index, 1);
        if ($scope.DeliveryList.length == 0) {
            $scope.PostFix = 1;
            $scope.AddMainDeliveryItem();
        } else {
            $scope.PostFix = $scope.PostFix - 1;
            for (var i = 1; i <= $scope.DeliveryList.length; i++) {
                $scope.DeliveryList[i - 1].BoxNo = $scope.DeliverySlipModel.DocNo + '_' + i;
            }
        }
    }

    //End Main Sale Tab
    $scope.formsubmit = false;
    $scope.SaveDeliveryPackingSlipItem = function (form) {
        var List = [];
        if (form.$invalid) {
            $scope.formsubmit = true;
        } else {
            for (var i = 0; i < $scope.DeliveryList.length; i++) {
                for (var j = 0; j < $scope.DeliveryList[i].ListItem.length; j++) {
                    var obj = {
                        id: $scope.DeliveryList[i].id,
                        IdDeliveryPackingSlip: $scope.DeliveryList[i].IdDeliveryPackingSlip,
                        BoxNo: $scope.DeliveryList[i].BoxNo,
                        ItemCode: $scope.DeliveryList[i].ListItem[j].ItemCode,
                        Qty: $scope.DeliveryList[i].ListItem[j].Qty,
                        Price: $scope.DeliveryList[i].ListItem[j].Price
                    }

                    List.push(obj);
                }
            }

            var NoItemCode = _.findWhere(List, { ItemCode: null });
            if (NoItemCode) {
                var alertPopup = $ionicPopup.alert({
                    title: '',
                    template: 'Item code missing.First select Item code for all items in list.',
                    cssClass: 'custPop',
                    okText: 'Ok',
                    okType: 'btn btn-green',
                });
            } else {
                var NoQty = _.filter(List, function (item) {
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
                    var obj1 = _.findWhere($scope.lstdata, { DocNo: $scope.DeliverySlipModel.SourceNo });
                    var ItemDataErrorList = [];
                    for (var i = 0; i < obj1.invoicedetails_news.length; i++) {
                        var MissingItemData = _.findWhere(List, { ItemCode: obj1.invoicedetails_news[i].ItemCode });
                        if (!MissingItemData) {
                            ItemDataErrorList.push(obj1.invoicedetails_news[i].ItemCode);
                        }
                    }

                    if (ItemDataErrorList.length > 0) {
                        var alertPopup = $ionicPopup.alert({
                            title: '',
                            template: 'Data missing for ItemCode ' + ItemDataErrorList.toString() + '.',
                            cssClass: 'custPop',
                            okText: 'Ok',
                            okType: 'btn btn-green',
                        });
                    } else {
                        var QtyErrorList = [];
                        for (var i = 0; i < obj1.invoicedetails_news.length; i++) {
                            var QtySum = 0;
                            _.filter(List, function (p) {
                                if (p.ItemCode == obj1.invoicedetails_news[i].ItemCode) {
                                    QtySum = QtySum + parseInt(p.Qty);
                                }
                            })

                            if (QtySum != obj1.invoicedetails_news[i].Qty) {
                                QtyErrorList.push(obj1.invoicedetails_news[i].ItemCode);
                            }
                        }

                        if (QtyErrorList.length > 0) {
                            var alertPopup = $ionicPopup.alert({
                                title: '',
                                template: 'Quantity is not same for ItemCodes ' + QtyErrorList.toString() + '.',
                                cssClass: 'custPop',
                                okText: 'Ok',
                                okType: 'btn btn-green',
                            });
                        } else {
                            Save();
                        }
                    }

                }
            }
        }

        function Save() {
            $scope.DeliverySlipModel.lstDetail = List;
            if (new Date($scope.DeliverySlipModel.DocDate) == 'Invalid Date') {
                $scope.DeliverySlipModel.DocDate = moment().set({ 'date': $scope.DeliverySlipModel.DocDate.split('-')[0], 'month': $scope.DeliverySlipModel.DocDate.split('-')[1] - 1, 'year': $scope.DeliverySlipModel.DocDate.split('-')[2] }).format('YYYY-MM-DD');
            } else {
                if (moment($scope.DeliverySlipModel.DocDate, "DD-MM-YYYY").format('YYYY-MM-DD') == 'Invalid date') {
                    $scope.DeliverySlipModel.DocDate = moment($scope.DeliverySlipModel.DocDate).format('YYYY-MM-DD');
                } else {
                    $scope.DeliverySlipModel.DocDate = moment($scope.DeliverySlipModel.DocDate, "DD-MM-YYYY").format('YYYY-MM-DD');
                }
            }

            $http.post($rootScope.RoutePath + 'invoice/SaveDeliveryPackingSlip', $scope.DeliverySlipModel)
                .then(function (res) {
                    if (res.data.success) {
                        $ionicLoading.show({ template: res.data.message });
                        setTimeout(function () {
                            $ionicLoading.hide()
                        }, 1000);

                        $scope.closeDeliveryPackingSlipModal();
                        $scope.init();
                    } else {
                        $ionicLoading.show({ template: res.data.message });
                        setTimeout(function () {
                            $ionicLoading.hide()
                        }, 1000);
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

    $scope.CopyToDeliverySlipModel = function (obj) {
        $scope.PostFix = 1;
        for (var prop in $scope.DeliverySlipModel) {
            $scope.DeliverySlipModel[prop] = obj[prop];
            if (prop == 'DocDate') {
                $scope.DeliverySlipModel['DocDate'] = moment(obj[prop]).format('DD-MM-YYYY');
            }
        }

        var objDoc = _.findWhere($scope.lstdata, { DocNo: $scope.DeliverySlipModel.SourceNo });
        _.filter(objDoc.invoicedetails_news, function (q) {
            _.filter($scope.lstItems, function (p) {
                if (p.ItemCode == q.ItemCode) {
                    $scope.DeliveryItemList.push(q);
                }
            })
        })

        $scope.DeliveryList = [];
        var BoxNoList = _.pluck(obj.deliverypackingslipdetails, 'BoxNo');
        BoxNoList = _.uniq(BoxNoList);

        for (var i = 0; i < BoxNoList.length; i++) {
            var obj1 = {
                id: 0,
                IdDeliveryPackingSlip: obj.id,
                BoxNo: BoxNoList[i],
                ListItem: [],
            }

            _.filter(obj.deliverypackingslipdetails, function (p) {
                if (p.BoxNo == BoxNoList[i]) {
                    var obj2 = {
                        ItemCode: p.ItemCode,
                        Qty: p.Qty,
                        Price: p.Price
                    }
                    obj1.ListItem.push(obj2);
                }
            });
            $scope.DeliveryList.push(obj1);
            $scope.PostFix = $scope.PostFix + 1;
        }
    };

    //*********************************************************Generate Delivery Packing Slip End ******************************************************/

    $scope.init();

});