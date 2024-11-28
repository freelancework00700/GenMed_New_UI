app.controller('SalesReturnController', function ($scope, $rootScope, $http, $ionicPopup, $ionicModal, $ionicLoading, $localstorage, $state, $compile) {

    $scope.init = function () {
        setTimeout(() => {
            $("#mytext").focus();
        }, 1000);
        $scope.modelAdvanceSearch = null;
        ManageRole();
        $scope.isshopCustomer = false;
        $scope.ResetModel();
        $scope.GetAllCustomer();
        $scope.GetAllBranch();
        // $scope.GetAllItem();
        $scope.GetAllLocation();
        $scope.GetAllUOM();
        $scope.GetAllTaxCode();
        $scope.GetAllCurrency();
        $scope.GetAllCurrencyRate();
        $scope.GetAllDiscount();
        $scope.GetAllUserWithoutLoginOne();
        $scope.GetAllActiveCustomerGroup();
        $scope.tab = { selectedIndex: 0 };
        $scope.SelectedCustomerBranch = $localstorage.get('CustomerBranch')
        $scope.CustomerGroupName = $localstorage.get('CustomerGroup')
        console.log($scope.SelectedCustomerBranch);

        if ($scope.SelectedCustomerBranch && $scope.SelectedCustomerBranch != "null" && $scope.SelectedCustomerBranch != undefined) {
            $scope.FlagCustomerBranch = true
        } else {
            $scope.FlagCustomerBranch = false
        }
        $rootScope.BackButton = $scope.IsList = true;
        $scope.SelectedTab = 1;
        setTimeout(function () {
            InitDataTable();
        })
        $scope.isValidMobile = false
    };

    function ManageRole() {
        var AdminUser = _.filter(JSON.parse($localstorage.get('UserRoles')), function (Role) {
            return Role == "Admin";
        })
        $scope.IsAdmin = AdminUser.length && AdminUser.length > 0 ? true : false;
    }
    $scope.ChangeTab = function (number) {
        $scope.SelectedTab = number;
        if ($scope.SelectedTab == 1) {
            // $scope.WorkingSalesReturnMain = null;

            // AssignSalesReturnMainClickEvent();

            // setTimeout(function () {
            //     $scope.SelectSalesReturnMainRaw(0);
            // })
        } else if ($scope.SelectedTab == 2) {
            setTimeout(function () {
                $("#PhoneNumber").intlTelInput({
                    utilsScript: "lib/intl/js/utils.js"
                });
            }, 500)
        }
    }

    function customers() {
        if ($localstorage.get('CustomerGroup') == "Shop") {
            $scope.isshopCustomer = true;
        } else {
            $scope.isshopCustomer = false;
        }
    }

    $scope.GetAllCustomer = function () {
        var params = {
            CustomerGroup: $localstorage.get('CustomerGroup'),
            CreatedBy: $scope.IsAdmin ? '' : parseInt($localstorage.get('UserId')),
        }

        $http.get($rootScope.RoutePath + 'customer/GetAllCustomer', { params: params }).then(function (res) {
            $scope.lstCustomer = res.data.data;
            customers()
        });
    };

    $scope.GetAllBranch = function () {
        $http.get($rootScope.RoutePath + 'customerBranch/GetAllCustomerbranch').then(function (res) {
            $scope.lstBranch = res.data.data;
            console.log($scope.lstBranch);

        });
    };

    $scope.GetAllItem = function () {
        $http.get($rootScope.RoutePath + 'item/GetAllItem').then(function (res) {
            $scope.lstItems = res.data.data;
        });
    };

    $scope.GetAllItemSearch = function (o) {
        _.filter($scope.lstSelectedSalesReturnMain, function (item) {
            item.IsEdit = false;
        });
        o.IsEdit = true;
        if (o.ItemName) {
            var params = {
                ItemName: o.ItemName,
                CustGroupName: $scope.CustomerGroupName == 'Genmed' ? null : $scope.CustomerGroupName
            }
            console.log(params);
            $http.get($rootScope.RoutePath + 'item/GetAllItemBySearchText', { params: params }).then(function (res) {
                $scope.lstItemsSearch = res.data.data;
            });
        } else {
            $scope.lstItemsSearch = [];
        }

    };

    $scope.GetAllLocation = function () {
        var params = {
            idLocations: $scope.IsAdmin ? "" : ""
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
            console.log($scope.lstCurrency)
            $scope.model.CurrencyCode = _.findWhere($scope.lstCurrency, { isDefault: 1 }).CurrencyCode;
            $scope.model.CurrencyRate = _.findWhere($scope.lstCurrency, { CurrencyCode: $scope.model.CurrencyCode }).SellRate;
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

    $scope.GetAllDiscount = function () {
        $http.get($rootScope.RoutePath + 'discount/GetAllDiscount').then(function (res) {
            $scope.lstDiscount = res.data.data;
        });
    };

    $scope.GetAllUserWithoutLoginOne = function (id) {
        $http.get($rootScope.RoutePath + 'user/GetAllUserWithoutLoginOne?id=' + $localstorage.get('UserId')).then(function (res) {
            $scope.ListUser = res.data.data;
        });
    }

    $scope.GetAllActiveCustomerGroup = function () {
        $http.get($rootScope.RoutePath + 'customer/GetAllActiveCustomergroup').then(function (res) {
            $scope.LstCustGroup = res.data.data;
        });
    };

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
                    obj.DiscountPercentage = null;
                } else {
                    var objUOM = _.findWhere(obj.listUOM, { UOM: obj.UOM })
                    if (objUOM) {
                        obj.Price = objUOM.Price;
                    }
                    obj.DiscountAmount = $scope.lstItemPrice.FixedDetailsDiscount;
                    obj.DiscountPercentage = (obj.DiscountAmount / (obj.Qty * obj.Price)) * 100
                }

                $scope.AddTaxCode(obj, 1);
                // $scope.AddDiscountAmount(obj);
            } else {
                var objUOM = _.findWhere(obj.listUOM, { UOM: obj.UOM })
                if (objUOM) {
                    obj.Price = objUOM.Price;
                    obj.DiscountAmount = null;
                    obj.DiscountPercentage = null;
                } else {
                    obj.Price = 0.00;
                    obj.DiscountAmount = null;
                    obj.DiscountPercentage = null;
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

            if (obj.idGroup) {
                $scope.CustomerGroup = obj.customergroup;
            } else {
                $scope.CustomerGroup = null;
            }
        } else {
            $scope.model.CustomerName = "";
            $scope.model.PhoneNumber = "";
            $scope.model.Address1 = "";
            $scope.model.Address2 = "";
            $scope.model.Address3 = "";
            $scope.model.BranchCode = $localstorage.get('CustomerBranch') ? $localstorage.get('CustomerBranch') : null;
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
        if ($scope.lstSelectedSalesReturnMain.length > 0) {
            var confirmPopup = $ionicPopup.confirm({
                title: "",
                template: 'Are you sure you want to change locations of all sales return?',
                cssClass: 'custPop',
                cancelText: 'Cancel',
                okText: 'Ok',
                okType: 'btn btn-green',
                cancelType: 'btn btn-red',
            })
            confirmPopup.then(function (res) {
                if (res) {
                    if ($scope.lstSelectedSalesReturnMain.length > 0) {
                        for (var i = 0; i < $scope.lstSelectedSalesReturnMain.length; i++) {
                            $scope.lstSelectedSalesReturnMain[i].idLocations = parseInt($scope.model.idLocations);
                            $scope.lstSelectedSalesReturnMain[i].DisplayLocation = _.findWhere($scope.lstLocations, { id: parseInt($scope.model.idLocations) }).Name;
                        }
                    }
                    $scope.SalesReturnMainModel.idLocations = $scope.model.idLocations;
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

    //Start Main Sales Return Tab

    //add Sales Return main item in list
    $scope.AddSalesReturnMainItemInList = function () {
        // if ($scope.WorkingSalesReturnMain != undefined && $scope.WorkingSalesReturnMain.ItemCode == '') {
        if ($scope.lstSelectedSalesReturnMain.length > 0 && $scope.lstSelectedSalesReturnMain[$scope.lstSelectedSalesReturnMain.length - 1].ItemCode == '') {
            $ionicLoading.show({ template: "Fill Data" });
            setTimeout(function () {
                $ionicLoading.hide()
            }, 1000);
            return;
        } else {
            _.filter($scope.lstSelectedSalesReturnMain, function (item) {
                item.IsEdit = false;
            });

            $scope.SalesReturnMainModel = {
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
                idInvoiceReturns: null,
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
                DiscountPercentage: 0,
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
                isBatch: false,
                ItemId: null,
                Barcode: null,
                SaleUOM: null,
                ItemName: null,
                sequence: $scope.lstSelectedSalesReturnMain.length + 1
            }
            // $scope.BatchList = [];

            $scope.lstSelectedSalesReturnMain.push($scope.SalesReturnMainModel);
            $scope.WorkingSalesReturnMain = $scope.SalesReturnMainModel;
            // AssignSalesReturnMainClickEvent();
            // setTimeout(function() {
            //     $scope.SelectSalesReturnMainRaw($scope.lstSelectedSalesReturnMain.length - 1);
            // })
        }
    }

    $scope.AddSalesReturnMainItemInListNew = function () {
        $scope.SalesReturnMainModel = {
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
            DiscountPercentage: 0,
            isDiscount: 0,
            TaxCode: null,
            TaxRate: 0,
            IsEdit: false,
            LastBalQty: 0,
            LastBatchNo: null,
            LastLocation: null,
            LastItemCode: null,
            LastUOM: null,
            listUOM: [],
            BatchList: [],
            isBatch: false,
            IsCombo: 0,
            ItemId: null,
            Barcode: null,
            SaleUOM: null,
            ItemName: null,
            sequence: $scope.lstSelectedSalesReturnMain.length + 1
        }
        $scope.lstSelectedSalesReturnMain.push($scope.SalesReturnMainModel);
    }

    function AssignSalesReturnMainClickEvent() {
        setTimeout(function () {
            $("#tblSalesReturnMainTable tr").unbind("click");

            $("#tblSalesReturnMainTable tr").click(function () {
                if ($(this)[0].accessKey != "") {
                    for (var k = 0; k < $scope.lstSelectedSalesReturnMain.length; k++) {
                        $scope.lstSelectedSalesReturnMain[k].IsEdit = false;
                    }

                    $("#tblSalesReturnMainTable tr").removeClass("highlight");
                    $(this).addClass("highlight");

                    $scope.WorkingSalesReturnMain = $scope.lstSelectedSalesReturnMain[$(this)[0].accessKey];
                    $scope.WorkingSalesReturnMain.IsEdit = true;
                    var obj = _.findWhere($scope.lstItems, { ItemCode: $scope.WorkingSalesReturnMain.ItemCode });
                    if (obj) {
                        if (obj.isBatch == 1) {
                            $scope.BatchList = obj.itembatches;
                            $scope.WorkingSalesReturnMain.isBatch = true;
                        } else {
                            $scope.BatchList = [];
                            $scope.WorkingSalesReturnMain.isBatch = false;
                        }
                    }
                    $scope.$apply();
                }
            });
        })
    }

    $scope.RemoveSalesReturnMainItemInList = function (index) {
        // $scope.lstSelectedSalesReturnMain = _.filter($scope.lstSelectedSalesReturnMain, function(item) {
        //     return item.UOM != $scope.WorkingSalesReturnMain.UOM || item.ItemCode != $scope.WorkingSalesReturnMain.ItemCode;
        // });
        var SelectedSeq = $scope.lstSelectedSalesReturnMain[index].sequence
        $scope.lstSelectedSalesReturnMain.splice(index, 1);
        _.filter($scope.lstSelectedSalesReturnMain, function (item) {
            if (item.sequence > SelectedSeq) {
                item.sequence = item.sequence - 1
            }
        });
        if ($scope.lstSelectedSalesReturnMain.length == 0) {
            $scope.model.Total = 0.00;
            $scope.model.NetTotal = 0.00;
            $scope.model.LocalNetTotal = 0.00;
            $scope.model.FinalTotal = 0.00;
            $scope.model.Tax = 0.00;
            $scope.model.LocalTax = 0.00;
            $scope.AddSalesReturnMainItemInList();
        } else {
            AdjustFinalSalesReturnTotal();
            $scope.WorkingSalesReturnMain = $scope.lstSelectedSalesReturnMain[$scope.lstSelectedSalesReturnMain.length - 1];
        }

        // AssignSalesReturnMainClickEvent();
        // setTimeout(function() {
        //     $scope.SelectSalesReturnMainRaw(0);
        // })
    }

    $scope.SelectSalesReturnMainRaw = function (index) {
        $("#tblSalesReturnMainTable tr[accessKey='" + index + "']").trigger("click");
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

            AdjustFinalSalesReturnTotal();
        });
    };

    $scope.AddPrice = function (o) {
        $http.get($rootScope.RoutePath + 'item/GetAllItemByItemCode?ItemCode=' + o.ItemCode).then(function (res) {
            $scope.lstItems = res.data.data;
            var obj = _.findWhere($scope.lstItems, { ItemCode: o.ItemCode });
            // if (obj) {
            //     if (obj.itemqtyprices.length && obj.itemqtyprices.length > 0) {
            //         var objQtyPrice = _.filter(obj.itemqtyprices, function (i) {
            //             if (o.Qty >= i.MinQty && o.Qty <= i.MaxQty) {
            //                 return i;
            //             }
            //         })
            //         if (objQtyPrice.length > 0) {
            //             o.Price = objQtyPrice[0].SalePrice;
            //         }
            //     }
            // }
            if (o.Qty != 0 && o.Qty != "") {
                o.Total = (o.Qty * parseFloat(o.Price)) - o.DiscountAmount;
                o.Tax = o.LocalTax = (o.Total * o.TaxRate) / 100;
                o.FinalTotal = o.NetTotal = o.LocalNetTotal = o.Total + o.Tax;

            } else {
                o.Total = 0.00;
                o.FinalTotal = o.NetTotal = o.LocalNetTotal = 0.00;
            }

            AdjustFinalSalesReturnTotal();
        })
    }

    $scope.AddItemCode = function (o, t) {
        console.log();

        if (t) {
            o.ItemCode = t.ItemCode;
            o.ItemName = t.ItemName;
        }
        $scope.lstItemsSearch = [];
        $http.get($rootScope.RoutePath + 'item/GetAllItemByItemCode?ItemCode=' + o.ItemCode).then(function (res) {
            $scope.lstItems = res.data.data;
            var obj = _.findWhere($scope.lstItems, { ItemCode: o.ItemCode });
            o.Descriptions = obj.Descriptions;
            o.ItemName = obj.ItemName;
            o.UOM = (obj.SalesUOM).toString();
            o.TaxCode = obj.SupplyTaxCode;
            o.listUOM = obj.itemuoms;
            o.ItemId = obj.id;
            o.itemmargins = obj.itemmargins;
            o.SaleUOM = obj.SalesUOM;
            if (obj.isBatch == 1) {
                o.BatchList = obj.itembatches;
                o.isBatch = true;
            } else {
                o.BatchList = [];
                o.isBatch = false;
            }
            $scope.FillItemUnitPrice(o);
            $scope.AddSalesReturnMainItemInListNew();
        })
    }

    $scope.FillItemUnitPrice = function (o) {
        if ($scope.model.CustomerCode != null && $scope.model.CustomerCode != undefined && $scope.model.CustomerCode != '') {
            var CustomerObj = _.findWhere($scope.lstCustomer, { AccountNumbder: $scope.model.CustomerCode });
            if (CustomerObj && CustomerObj.idPriceCategory) {
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

    $scope.FillItemMargin = function (obj) {
        if ($scope.model.CustomerCode != null && $scope.model.CustomerCode != undefined && $scope.model.CustomerCode != '') {
            var CustomerObj = _.findWhere($scope.lstCustomer, { AccountNumbder: $scope.model.CustomerCode });
            if (CustomerObj && CustomerObj.idPriceCategory) {
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
        if (obj) {
            o.DisplayLocation = obj.Name;
        }
    }

    $scope.AddDiscountAmount = function (o, value) {
        if (value == 'Amount') {
            if (o.DiscountAmount != null && o.DiscountAmount != '' && o.DiscountAmount != undefined) {
                o.DiscountPercentage = (o.DiscountAmount / (o.Qty * o.Price)) * 100
                o.Total = (o.Qty * parseFloat(o.Price)) - parseFloat(o.DiscountAmount);
                o.FinalTotal = o.NetTotal = o.LocalNetTotal = o.Total + o.Tax;
                o.isDiscount = 1;
            }
            else {
                o.DiscountPercentage = 0;
                o.Total = (o.Qty * o.Price) - 0;
                o.FinalTotal = o.NetTotal = o.LocalNetTotal = o.Total + o.Tax;
                o.isDiscount = 0;

            }
        } else if (value == 'Percentage') {
            if (o.DiscountPercentage != null && o.DiscountPercentage != '' && o.DiscountPercentage != undefined) {
                o.DiscountAmount = ((o.Qty * o.Price) * o.DiscountPercentage) / 100
                o.Total = (o.Qty * parseFloat(o.Price)) - parseFloat(o.DiscountAmount);
                o.FinalTotal = o.NetTotal = o.LocalNetTotal = o.Total + o.Tax;
                o.isDiscount = 1;
            }
            else {
                o.DiscountAmount = 0;
                o.Total = (o.Qty * o.Price) - 0;
                o.FinalTotal = o.NetTotal = o.LocalNetTotal = o.Total + o.Tax;
                o.isDiscount = 0;

            }
        }

        AdjustFinalSalesReturnTotal();
    }

    $scope.AddTaxCode = function (o, status) {
        if (o.TaxCode) {
            var obj = _.findWhere($scope.lstTaxCode, { TaxType: o.TaxCode });
            if (obj) {
                o.TaxRate = obj.TaxRate;
                o.Tax = o.LocalTax = (o.Total * obj.TaxRate) / 100;
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

        if (status != 2) {
            $scope.MangeMargin(o);
        } else {
            $scope.AddPrice(o);
        }
    }

    $scope.MangeMargin = function (o) {
        if (o.itemmargins && o.itemmargins.length > 0) {
            var List = getSalesPurchaseRate(o);
            if ($scope.CustomerGroup) {
                if ($scope.CustomerGroup.Name == 'Shop') {
                    o.Price = List.ShopSalesRate;
                    o.DiscountAmount = List.ShopPercentage;
                    o.DiscountPercentage = (o.DiscountAmount / (o.Qty * o.Price)) * 100
                } else if ($scope.CustomerGroup.Name == 'Stock Holder') {
                    o.Price = List.StockHolderSalesRate;
                    o.DiscountAmount = List.StockHolderPercentage;
                    o.DiscountPercentage = (o.DiscountAmount / (o.Qty * o.Price)) * 100
                } else if ($scope.CustomerGroup.Name == 'Genmed') {
                    o.Price = List.GenmedSalesRate;
                } else if ($scope.CustomerGroup.Name == 'Customer') {
                    o.Price = List.CustomerSalePrice;
                    $scope.model.IsInclusive = true;
                }
            } else {
                o.Price = List.CustomerSalePrice;
                $scope.model.IsInclusive = true;
            }
        }
        $scope.AddPrice(o);
    }

    function AdjustFinalSalesReturnTotal() {
        if ($scope.lstSelectedSalesReturnMain.length > 0) {
            $scope.model.Total = 0.00;
            $scope.model.NetTotal = 0.00;
            $scope.model.LocalNetTotal = 0.00;
            $scope.model.FinalTotal = 0.00;
            $scope.model.Tax = 0.00;
            $scope.model.LocalTax = 0.00;

            for (var i = 0; i < $scope.lstSelectedSalesReturnMain.length; i++) {
                $scope.model.Total = $scope.model.Total + $scope.lstSelectedSalesReturnMain[i].Total;
                $scope.model.LocalNetTotal = $scope.model.LocalNetTotal + $scope.lstSelectedSalesReturnMain[i].Total
                $scope.model.NetTotal = $scope.model.FinalTotal = $scope.model.NetTotal + $scope.lstSelectedSalesReturnMain[i].NetTotal;
                $scope.model.Tax = $scope.model.LocalTax = $scope.model.Tax + $scope.lstSelectedSalesReturnMain[i].Tax;
            }
            if ($scope.model.DiscountRate != null && $scope.model.DiscountRate != '' && $scope.model.DiscountRate != undefined) {
                $scope.model.Total = ($scope.model.Total - ($scope.model.Total * $scope.model.DiscountRate) / 100);
                $scope.model.NetTotal = $scope.model.FinalTotal = $scope.model.Total + $scope.model.Tax;
            }
        }
    }

    $scope.ManageDiscount = function () {
        AdjustFinalSalesReturnTotal();
    }

    //End Main Sales Return Tab
    $scope.formsubmit = false;
    $scope.SaveSalesReturn = function (form) {
        var NoItemCode = _.findWhere($scope.lstSelectedSalesReturnMain, { ItemCode: '' });
        if (NoItemCode) {
            var alertPopup = $ionicPopup.alert({
                title: '',
                template: 'Item code missing.First select Item code for all items in list.',
                cssClass: 'custPop',
                okText: 'Ok',
                okType: 'btn btn-green',
            });
        } else {
            var NoQty = _.filter($scope.lstSelectedSalesReturnMain, function (item) {
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
                var BatchList = _.where($scope.lstSelectedSalesReturnMain, { isBatch: true });

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
                            }
                        })
                    } else {
                        Save();
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
            // $scope.isValidMobile = false
            if (!$scope.model.id) {
                $scope.model.id = 0;
            }
            $scope.model.lstSalesReturnDetail = $scope.lstSelectedSalesReturnMain;
            if (new Date($scope.model.InvoiceDate) == 'Invalid Date') {
                $scope.model.InvoiceDate = moment().set({ 'date': $scope.model.InvoiceDate.split('-')[0], 'month': $scope.model.InvoiceDate.split('-')[1] - 1, 'year': $scope.model.InvoiceDate.split('-')[2] }).format('YYYY-MM-DD');
            } else {
                if (moment($scope.model.InvoiceDate, "DD-MM-YYYY").format('YYYY-MM-DD') == 'Invalid date') {
                    $scope.model.InvoiceDate = moment($scope.model.InvoiceDate).format('YYYY-MM-DD');
                } else {
                    $scope.model.InvoiceDate = moment($scope.model.InvoiceDate).format('YYYY-MM-DD');
                }
            }

            $http.post($rootScope.RoutePath + 'invoicereturn/SaveInvoiceReturn', $scope.model)
                .then(function (res) {
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
                $scope.model['InvoiceDate'] = moment(selectedItem[prop]).format('YYYY-MM-DD');
            }
            if (prop == 'ModifiedBy') {
                $scope.model['ModifiedBy'] = parseInt($localstorage.get('UserId'));
            }
            if (prop == "LoginUserCode") {
                $scope.model['LoginUserCode'] = $localstorage.get('UserCode')
            }

            if (prop == 'CustomerCode') {
                var obj = _.findWhere($scope.lstCustomer, { AccountNumbder: $scope.model[prop] });
                if (obj) {
                    if (obj.idGroup) {
                        $scope.CustomerGroup = obj.customergroup;
                    } else {
                        $scope.CustomerGroup = null;
                    }
                }
            }
        }

        $scope.lstSelectedSalesReturnMain = selectedItem.invoicereturndetails;
        $scope.lstSelectedSalesReturnMain = _.sortBy($scope.lstSelectedSalesReturnMain, 'sequence');

        if ($scope.lstSelectedSalesReturnMain.length > 0) {
            for (var i = 0; i < $scope.lstSelectedSalesReturnMain.length; i++) {
                $http.get($rootScope.RoutePath + 'item/GetAllItemByItemCode?ItemCode=' + $scope.lstSelectedSalesReturnMain[i].ItemCode).then(function (res) {
                    $scope.lstItems = res.data.data;
                    $scope.lstSelectedSalesReturnMain[i].IsEdit = false;

                    $scope.lstSelectedSalesReturnMain[i].idLocations = ($scope.lstSelectedSalesReturnMain[i].idLocations).toString();
                    $scope.lstSelectedSalesReturnMain[i].ItemName = $scope.lstItems[0].ItemName;

                    if ($scope.lstSelectedSalesReturnMain[i].sequence == null) {
                        $scope.lstSelectedSalesReturnMain[i].sequence = i + 1
                    }

                    if ($scope.lstSelectedSalesReturnMain[i].TaxCode) {
                        var obj = _.findWhere($scope.lstTaxCode, { TaxType: $scope.lstSelectedSalesReturnMain[i].TaxCode });
                        if (obj) {
                            $scope.lstSelectedSalesReturnMain[i].TaxRate = obj.TaxRate;
                        }
                    }

                    if ($scope.lstSelectedSalesReturnMain[i].idLocations) {
                        var obj1 = _.findWhere($scope.lstLocations, { id: parseInt($scope.lstSelectedSalesReturnMain[i].idLocations) });
                        // $scope.lstSelectedSalesReturnMain[i].idLocations = ($scope.lstSelectedSalesReturnMain[i].idLocations).toString();
                        if (obj1) {
                            $scope.lstSelectedSalesReturnMain[i].DisplayLocation = obj1.Name;
                        }
                    }

                    var objItem1 = _.findWhere($scope.lstItems, { ItemCode: $scope.lstSelectedSalesReturnMain[i].ItemCode });
                    if (objItem1) {
                        $scope.lstSelectedSalesReturnMain[i].listUOM = objItem1.itemuoms;
                        $scope.lstSelectedSalesReturnMain[i].SaleUOM = objItem1.SalesUOM;
                        $scope.lstSelectedSalesReturnMain[i].ItemId = objItem1.id;
                        $scope.lstSelectedSalesReturnMain[i].listUOM = objItem1.itemuoms;
                        if (objItem1.isBatch == 1) {
                            $scope.lstSelectedSalesReturnMain[i].BatchList = objItem1.itembatches;
                            $scope.lstSelectedSalesReturnMain[i].isBatch = true;
                        } else {
                            $scope.lstSelectedSalesReturnMain[i].isBatch = false;
                            $scope.lstSelectedSalesReturnMain[i].BatchList = objItem1.itembatches;
                        }
                    } else {
                        $scope.lstSelectedSalesReturnMain[i].listUOM = [];
                        $scope.lstSelectedSalesReturnMain[i].ItemId = null;
                    }

                    $scope.lstSelectedSalesReturnMain[i].LastBalQty = $scope.lstSelectedSalesReturnMain[i].Qty * -1;
                    $scope.lstSelectedSalesReturnMain[i].LastBatchNo = $scope.lstSelectedSalesReturnMain[i].BatchNo;
                    $scope.lstSelectedSalesReturnMain[i].LastLocation = $scope.lstSelectedSalesReturnMain[i].idLocations;
                    $scope.lstSelectedSalesReturnMain[i].LastItemCode = $scope.lstSelectedSalesReturnMain[i].ItemCode;
                    $scope.lstSelectedSalesReturnMain[i].LastUOM = $scope.lstSelectedSalesReturnMain[i].UOM;

                    if ($scope.lstSelectedSalesReturnMain[i].DiscountAmount) {
                        $scope.lstSelectedSalesReturnMain[i].DiscountPercentage = ($scope.lstSelectedSalesReturnMain[i].DiscountAmount / ($scope.lstSelectedSalesReturnMain[i].Qty * $scope.lstSelectedSalesReturnMain[i].Price)) * 100;
                    }
                })
            }

            // var objItem = _.findWhere($scope.lstItems, { ItemCode: $scope.lstSelectedSalesReturnMain[0].ItemCode });
            // if (objItem) {
            //     if (objItem.isBatch == 1) {
            //         $scope.BatchList = objItem.itembatches;
            //     } else {
            //         $scope.BatchList = [];
            //     }
            // }

            $scope.WorkingSalesReturnMain = $scope.lstSelectedSalesReturnMain[$scope.lstSelectedSalesReturnMain.length - 1];

            // AssignSalesReturnMainClickEvent();

            // setTimeout(function() {
            //     $scope.SelectSalesReturnMainRaw(0);
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
                $http.get($rootScope.RoutePath + 'invoicereturn/DeleteInvoiceReturn', {
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
            InvoiceDate: moment().format('YYYY-MM-DD'),
            CustomerCode: '',
            CustomerName: '',
            Ref: null,
            Description: null,
            UserCode: $localstorage.get('CustomerGroupId'),
            Address1: null,
            Address2: null,
            Address3: null,
            PhoneNumber: null,
            Fax: null,
            Attentions: null,
            BranchCode: $localstorage.get('CustomerBranch') ? $localstorage.get('CustomerBranch') : null,
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
            Reason: null,
            IsInclusive: 0,
            DiscountRate: null,
            CreatedBy: parseInt($localstorage.get('UserId')),
            CreatedDate: null,
            ModifiedBy: null,
            ModifiedDate: null,
            LoginUserCode: $localstorage.get('UserCode')
        };
        $scope.Searchmodel1 = {
            Search: '',
        }
        $scope.Searchmodel = {
            Search: '',
        }
        $scope.lstSelectedSalesReturnMain = [];
        $scope.AddSalesReturnMainItemInList();
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
        $('#SalesReturnTable').dataTable().api().ajax.reload();
    }

    $scope.EnableFilterOption = function () {
        $(function () {
            $(".CustFilter").slideToggle();
        });
    };

    $scope.FilterAdvanceData = function (o) {
        $scope.modelAdvanceSearch = o;
        $('#SalesReturnTable').dataTable().api().ajax.reload();
    }

    //Set Table
    function InitDataTable() {
        if ($.fn.DataTable.isDataTable('#SalesReturnTable')) {
            $('#SalesReturnTable').DataTable().destroy();
        }
        $('#SalesReturnTable').DataTable({
            "processing": true,
            "dom": 'rt<"bottom"<"left"<"length"l><"info"i>><"right"<"pagination"p>>>',
            "serverSide": true,
            "responsive": true,
            "aaSorting": [2, 'DESC'],
            "ajax": {
                url: $rootScope.RoutePath + 'invoicereturn/GetAllSalesReturnDynamic',
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
                { "data": "Total", "defaultContent": "N/A" },
                { "data": "Tax", "defaultContent": "N/A" },
                { "data": "FinalTotal", "defaultContent": "N/A" },
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

                "targets": [7, 8, 9],
                className: "right-aligned-cell"
            }, {
                "render": function (data, type, row) {
                    var Action = '<div layout="row" layout-align="center center">';
                    Action += '<a ng-click="CopyToModel(' + row.id + ')" class="btnAction btnAction-edit" style="cursor:pointer"><i class="ion-edit" title="Edit"></i></a>&nbsp;';
                    Action += '<a ng-click="DeleteItem(' + row.id + ')" class="btnAction btnAction-error" style="cursor:pointer"><i class="ion-trash-a" title="Remove"></i></a>';
                    Action += '<a ng-click="GenerateReport(' + row.id + ')" class="btnAction btnAction-info" style="cursor:pointer"><i class="ion-document-text" title="Document"></i></a>&nbsp;';
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

    $scope.Add = function () {
        $scope.GetInvoiceDocNo();
        $scope.formsubmit = false;
        $rootScope.BackButton = $scope.IsList = false;
        setTimeout(function () {
            $("#PhoneNumber").intlTelInput({
                utilsScript: "lib/intl/js/utils.js"
            });
        }, 500)
    }

    $scope.GetInvoiceDocNo = function () {
        $http.get($rootScope.RoutePath + 'invoicereturn/GetSaleReturnDocNo?LoginUserCode=' + $localstorage.get('UserCode')).then(function (res) {
            $scope.model.DocNo = res.data;
        });
    }

    // $scope.PreventMobileNumber1 = function() {
    //     if ($scope.model.PhoneNumber != null && $scope.model.PhoneNumber != '' && $scope.model.PhoneNumber.toString().length > 15) {
    //         $scope.model.PhoneNumber = parseInt($scope.model.PhoneNumber.toString().substring(0, 15));
    //     }
    // }

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

    $scope.ChangeInclusivePrice = function () {
        if ($scope.lstSelectedSalesReturnMain.length > 0) {
            if ($scope.model.IsInclusive) {
                for (var i = 0; i < $scope.lstSelectedSalesReturnMain.length; i++) {
                    if ($scope.lstSelectedSalesReturnMain[i].TaxRate != 0) {
                        $scope.lstSelectedSalesReturnMain[i].Price = parseFloat($scope.lstSelectedSalesReturnMain[i].Price) / (($scope.lstSelectedSalesReturnMain[i].TaxRate / 100) + 1);
                        if ($scope.lstSelectedSalesReturnMain[i].Qty != null) {
                            $scope.lstSelectedSalesReturnMain[i].Total = ($scope.lstSelectedSalesReturnMain[i].Qty * parseFloat($scope.lstSelectedSalesReturnMain[i].Price)) - $scope.lstSelectedSalesReturnMain[i].DiscountAmount;
                            $scope.lstSelectedSalesReturnMain[i].Tax = $scope.lstSelectedSalesReturnMain[i].LocalTax = ($scope.lstSelectedSalesReturnMain[i].Total * $scope.lstSelectedSalesReturnMain[i].TaxRate) / 100;
                            $scope.lstSelectedSalesReturnMain[i].FinalTotal = $scope.lstSelectedSalesReturnMain[i].NetTotal = $scope.lstSelectedSalesReturnMain[i].LocalNetTotal = $scope.lstSelectedSalesReturnMain[i].Total + $scope.lstSelectedSalesReturnMain[i].Tax;
                        } else {
                            $scope.lstSelectedSalesReturnMain[i].Price = 0.00;
                            $scope.lstSelectedSalesReturnMain[i].Total = 0.00;
                            $scope.lstSelectedSalesReturnMain[i].FinalTotal = $scope.lstSelectedSalesReturnMain[i].NetTotal = $scope.lstSelectedSalesReturnMain[i].LocalNetTotal = 0.00;
                        }
                        AdjustFinalSalesReturnTotal();
                    }
                }
            } else {
                for (var i = 0; i < $scope.lstSelectedSalesReturnMain.length; i++) {
                    if ($scope.lstSelectedSalesReturnMain[i].TaxRate != 0) {
                        $scope.lstSelectedSalesReturnMain[i].Price = parseFloat($scope.lstSelectedSalesReturnMain[i].Price) * (($scope.lstSelectedSalesReturnMain[i].TaxRate / 100) + 1);
                        if ($scope.lstSelectedSalesReturnMain[i].Qty != null) {
                            $scope.lstSelectedSalesReturnMain[i].Total = ($scope.lstSelectedSalesReturnMain[i].Qty * parseFloat($scope.lstSelectedSalesReturnMain[i].Price)) - $scope.lstSelectedSalesReturnMain[i].DiscountAmount;
                            $scope.lstSelectedSalesReturnMain[i].Tax = $scope.lstSelectedSalesReturnMain[i].LocalTax = ($scope.lstSelectedSalesReturnMain[i].Total * $scope.lstSelectedSalesReturnMain[i].TaxRate) / 100;
                            $scope.lstSelectedSalesReturnMain[i].FinalTotal = $scope.lstSelectedSalesReturnMain[i].NetTotal = $scope.lstSelectedSalesReturnMain[i].LocalNetTotal = $scope.lstSelectedSalesReturnMain[i].Total + $scope.lstSelectedSalesReturnMain[i].Tax;
                        } else {
                            $scope.lstSelectedSalesReturnMain[i].Price = 0.00;
                            $scope.lstSelectedSalesReturnMain[i].Total = 0.00;
                            $scope.lstSelectedSalesReturnMain[i].FinalTotal = $scope.lstSelectedSalesReturnMain[i].NetTotal = $scope.lstSelectedSalesReturnMain[i].LocalNetTotal = 0.00;
                        }
                        AdjustFinalSalesReturnTotal();
                    }
                }
            }
        }
    }

    $scope.GenerateReport = function (Id) {
        window.open($rootScope.RoutePath + "invoicereturn/GenerateInvoiceSalesReturn?Id=" + Id, '_blank');
    }

    function getSalesPurchaseRate(o) {
        var SaleUOM = _.findWhere(o.listUOM, { UOM: o.SaleUOM });
        var uomqun = SaleUOM.UOM == o.UOM ? 1 : SaleUOM.Rate
        var purchaseprice = 0;
        var batch = null;
        if (o.BatchNo) {
            batch = _.findWhere(o.BatchList, { BatchNumber: o.BatchNo });
            purchaseprice = batch.SalesRate / ((o.TaxRate / 100) + 1);
        } else {
            purchaseprice = parseFloat(o.Price) / ((o.TaxRate / 100) + 1);
        }

        var ShopId = _.findWhere($scope.LstCustGroup, { Name: 'Shop' });
        var StockHolderId = _.findWhere($scope.LstCustGroup, { Name: 'Stock Holder' });

        var Shop = _.findWhere(o.itemmargins, { idCustGroup: ShopId.id });
        var StockHolder = _.findWhere(o.itemmargins, { idCustGroup: StockHolderId.id });

        var ShopSalesRate = purchaseprice;
        var ShopPurchaseRate = purchaseprice - ((purchaseprice * Shop.Percentage) / 100);
        var ShopPercentage = ((o.Qty * purchaseprice) * Shop.Percentage) / 100;

        var StockHolderSalesRate = ShopPurchaseRate;
        var StockHolderPurchaseRate = parseFloat(ShopPurchaseRate) - ((parseFloat(ShopPurchaseRate) * StockHolder.Percentage) / 100);
        var StockHolderPercentage = ((o.Qty * parseFloat(ShopPurchaseRate)) * StockHolder.Percentage) / 100;

        var GenmedSalesRate = StockHolderPurchaseRate;
        var GenmedPurchaseRate = o.BatchNo ? batch.SalesRate : parseFloat(o.Price);

        var CustomerSalePrice = o.BatchNo ? (batch.SalesRate / uomqun) / ((o.TaxRate / 100) + 1) : purchaseprice;
        var CustomerPercentage = o.BatchNo ? ((batch.MRP - batch.SalesRate) * 100) / batch.MRP : ((SaleUOM.MRP - o.Price) * 100) / SaleUOM.MRP;
        var CustomerDiscountAmount = o.BatchNo ? (batch.MRP - batch.SalesRate) : (SaleUOM.MRP - o.Price);

        var obj = {
            ShopSalesRate: ShopSalesRate,
            ShopPurchaseRate: ShopPurchaseRate,
            ShopPercentage: o.BatchNo ? ShopPercentage : 0,
            StockHolderSalesRate: StockHolderSalesRate,
            StockHolderPurchaseRate: StockHolderPurchaseRate,
            StockHolderPercentage: o.BatchNo ? StockHolderPercentage : 0,
            GenmedSalesRate: GenmedSalesRate,
            GenmedPurchaseRate: GenmedPurchaseRate,
            CustomerSalePrice: CustomerSalePrice,
            CustomerPercentage: CustomerPercentage,
            CustomerDiscountAmount: CustomerDiscountAmount
        }
        return obj;

    }

    // Anil Start
    $ionicModal.fromTemplateUrl('ItemCode.html', {
        scope: $scope,
        animation: 'slide-in-up'
    }).then(function (modal) {

        $scope.modal = modal;
    });

    $scope.OpenModelItemCode = function (ItemIndex) {
        $localstorage.set('ItemIndex', ItemIndex)
        $scope.modal.show();
        setTimeout(function () {
            InitDataTable1();
        })
    };

    $scope.closeModal = function () {
        $scope.modal.hide();
    };

    $scope.FilterData1 = function () {
        $('#ItemTable').dataTable().api().ajax.reload();

    }

    $scope.SelectItemCode = function (id) {

        $scope.modal.hide();
        var SelectedItemCode = $scope.lstdata.find(function (item) {
            return item.id == id;
        });
        $scope.lstSelectedSalesReturnMain[$localstorage.get('ItemIndex')].ItemCode = SelectedItemCode.ItemCode;
        $scope.AddItemCode($scope.lstSelectedSalesReturnMain[$localstorage.get('ItemIndex')])
    }

    function InitDataTable1() {
        if ($.fn.DataTable.isDataTable('#ItemTable')) {
            $('#ItemTable').DataTable().destroy();
        }
        $('#ItemTable').DataTable({
            "processing": true,
            "dom": 'rt<"bottom"<"left"<"length"l><"info"i>><"right"<"pagination"p>>>',
            "serverSide": true,
            "responsive": true,
            "aaSorting": [
                [1, 'DESC'],
            ],
            "ajax": {
                // url: $rootScope.RoutePath + 'item/GetAllItemDynamic',
                url: $rootScope.RoutePath + 'item/GetAllItemDynamicFilter',
                data: function (d) {
                    if ($scope.Searchmodel1.Search != undefined) {
                        d.search = $scope.Searchmodel1.Search;
                    }
                    $scope.order = d.order;
                    $scope.columns = d.columns;
                    d.CustGroupName = $scope.CustomerGroupName == 'Genmed' ? null : $scope.CustomerGroupName
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
                { "data": "ItemName", "defaultContent": "N/A" },
                { "data": "ItemCode", "defaultContent": "N/A" },
                { "data": "Descriptions", "defaultContent": "N/A" },
                { "data": "subbrand.SubBrandName", "defaultContent": "N/A" },
            ],
            "columnDefs": [{
                "render": function (data, type, row, meta) {
                    return meta.row + meta.settings._iDisplayStart + 1;
                },
                "targets": 0,
            },
            {
                "render": function (data, type, row) {
                    if (data != null && data != undefined && data != '') {
                        Action = (data).toString();
                        if (Action.length > 50) {
                            Action = '<span title="' + Action + '">' + data.substr(0, 50) + '...</span>';
                        }
                        return Action;
                    } else {
                        return "N/A";
                    }

                },
                "targets": 1,
                "targets": 3,
                "targets": 4,
            }, {
                "render": function (data, type, row) {
                    var Action = '<div layout="row" layout-align="center center">';
                    Action += '<a ng-click="SelectItemCode(' + row.id + ')" class="btnAction btnAction-edit" style="cursor:pointer"><i class="ion-edit" title="Edit"></i></a>&nbsp;';
                    Action += '</div>';
                    return Action;
                },
                "targets": 5,
            },
            ]
        });
    }

    // Anil end


    $scope.GetItem = function (o) {
        $http.get($rootScope.RoutePath + 'item/GetItemByBatch?Barcode=' + o.Barcode).then(function (res) {
            let BatchGet = res.data;
            if (BatchGet) {
                o.BatchNo = BatchGet.BatchNumber;
                o.isBatch = true;
                o.ItemCode = BatchGet.ItemCode;
                o.Qty = 1;
                $scope.AddItemCode(o);
            }
        });
    }


    $scope.init();

})