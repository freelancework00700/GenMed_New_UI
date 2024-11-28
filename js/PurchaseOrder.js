app.controller('PurchaseOrderController', function ($scope, $rootScope, $http, $ionicPopup, $ionicLoading, $localstorage, $state, $compile, $ionicScrollDelegate) {

    $scope.init = function () {
        $scope.modelAdvanceSearch = null;
        ManageRole();
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
        setTimeout(function () {
            InitDataTable();
        })
        $scope.isValidMobile = false;
        $scope.isValidMobile2 = false;
        $ionicScrollDelegate.scrollTop();
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
        // else {
        //     AssignPurchaseMainClickEvent();

        //     setTimeout(function () {
        //         $scope.SelectPurchaseMainRaw(0);
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
        $http.get($rootScope.RoutePath + 'customerBranch/GetAllCustomerbranch').then(function (res) {
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

    // $scope.PreventMobileNumber = function() {
    //     if ($scope.model.PhoneNumber.toString().length > 15) {
    //         $scope.model.PhoneNumber = parseInt($scope.model.PhoneNumber.toString().substring(0, 15));
    //     }
    // }

    $scope.PreventMobileNumber2 = function () {
        if ($scope.model.DeliverPhoneNumber.toString().length > 15) {
            $scope.model.DeliverPhoneNumber = parseInt($scope.model.DeliverPhoneNumber.toString().substring(0, 15));
        }
    }

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
            if (_.findWhere($scope.lstItems, { IdCustomer: obj.id })) {
                $scope.lstItems = $scope.lstItems.length > 0 ? move($scope.lstItems, $scope.lstItems.findIndex(x => x.IdCustomer == obj.id), 0) : [];
            }
            if (obj.Currency != undefined && obj.Currency != null && obj.Currency != '') {
                $scope.checkCurrencyRate(obj.Currency);
            } else {
                //for default currency
                $scope.model.CurrencyCode = _.findWhere($scope.lstCurrency, { isDefault: 1 }).CurrencyCode;
                $scope.model.CurrencyRate = _.findWhere($scope.lstCurrency, { CurrencyCode: $scope.model.CurrencyCode }).BuyRate;
            }
        } else {
            $scope.model.CurrencyCode = "";
            $scope.model.CurrencyRate = "";
        }
    }


    function move(arr, old_index, new_index) {
        while (old_index < 0) {
            old_index += arr.length;
        }
        while (new_index < 0) {
            new_index += arr.length;
        }
        if (new_index >= arr.length) {
            var k = new_index - arr.length;
            while ((k--) + 1) {
                arr.push(undefined);
            }
        }
        arr.splice(new_index, 0, arr.splice(old_index, 1)[0]);
        return arr;
    }
    $scope.checkCurrencyRate = function (CurrencyCode) {
        var obj = _.findWhere($scope.lstCurrencyRate, { CurrencyCode: CurrencyCode });
        if (obj != null && obj != '' && obj != undefined) {
            var FromDate = new Date(obj.FromDate);
            var ToDate = new Date(obj.ToDate);
            var CurrentDate = new Date();
            if (CurrentDate >= FromDate && CurrentDate <= ToDate) {
                $scope.model.CurrencyCode = obj.CurrencyCode;
                $scope.model.CurrencyRate = obj.BuyRate;
            } else {
                var obj = _.findWhere($scope.lstCurrency, { CurrencyCode: CurrencyCode });
                if (obj != null && obj != '' && obj != undefined) {
                    $scope.model.CurrencyCode = obj.CurrencyCode;
                    $scope.model.CurrencyRate = obj.BuyRate;
                } else {
                    //for default currency
                    $scope.model.CurrencyCode = _.findWhere($scope.lstCurrency, { isDefault: 1 }).CurrencyCode;
                    $scope.model.CurrencyRate = _.findWhere($scope.lstCurrency, { CurrencyCode: $scope.model.CurrencyCode }).BuyRate;
                }
            }
        } else {
            var obj = _.findWhere($scope.lstCurrency, { CurrencyCode: CurrencyCode });
            if (obj != null && obj != '' && obj != undefined) {
                $scope.model.CurrencyCode = obj.CurrencyCode;
                $scope.model.CurrencyRate = obj.BuyRate;
            } else {
                //for default currency
                $scope.model.CurrencyCode = _.findWhere($scope.lstCurrency, { isDefault: 1 }).CurrencyCode;
                $scope.model.CurrencyRate = _.findWhere($scope.lstCurrency, { CurrencyCode: $scope.model.CurrencyCode }).BuyRate;
            }
        }
    }


    $scope.ChangeLocation = function () {
        if ($scope.lstSelectedPurchaseMain.length > 0) {
            var confirmPopup = $ionicPopup.confirm({
                title: "",
                template: 'Are you sure you want to change locations of all purchase?',
                cssClass: 'custPop',
                cancelText: 'Cancel',
                okText: 'Ok',
                okType: 'btn btn-green',
                cancelType: 'btn btn-red',
            })
            confirmPopup.then(function (res) {
                if (res) {
                    if ($scope.lstSelectedPurchaseMain.length > 0) {
                        for (var i = 0; i < $scope.lstSelectedPurchaseMain.length; i++) {
                            $scope.lstSelectedPurchaseMain[i].idLocations = parseInt($scope.model.idLocations);
                            $scope.lstSelectedPurchaseMain[i].DisplayLocation = _.findWhere($scope.lstLocations, { id: parseInt($scope.model.idLocations) }).Name;
                        }
                    }
                    $scope.PurchaseMainModel.idLocations = $scope.model.idLocations;
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

    //Start Main Purchase Tab

    //add Purchase main item in list
    $scope.AddPurchaseMainItemInList = function () {
        // if ($scope.WorkingPurchaseMain != undefined && $scope.WorkingPurchaseMain.ItemCode == '') {
        //     $ionicLoading.show({ template: "Fill Data" });
        //     setTimeout(function () {
        //         $ionicLoading.hide()
        //     }, 1000);
        //     return;
        // }
        if ($scope.lstSelectedPurchaseMain.length > 0 && $scope.lstSelectedPurchaseMain[$scope.lstSelectedPurchaseMain.length - 1].ItemCode == '') {
            $ionicLoading.show({ template: "Fill Data" });
            setTimeout(function () {
                $ionicLoading.hide()
            }, 1000);
            return;
        } else {
            _.filter($scope.lstSelectedPurchaseMain, function (item) {
                item.IsEdit = false;
            });

            $scope.PurchaseMainModel = {
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
                idPurchase: null,
                ItemCode: '',
                idLocations: $scope.model.idLocations,
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

            $scope.lstSelectedPurchaseMain.push($scope.PurchaseMainModel);
            $scope.WorkingPurchaseMain = $scope.PurchaseMainModel;

            // AssignPurchaseMainClickEvent();

            // setTimeout(function () {
            //     $scope.SelectPurchaseMainRaw($scope.lstSelectedPurchaseMain.length - 1);
            // })
        }
    }

    function AssignPurchaseMainClickEvent() {
        setTimeout(function () {
            $("#tblPurchaseMainTable tr").unbind("click");

            $("#tblPurchaseMainTable tr").click(function () {
                if ($(this)[0].accessKey != "") {
                    for (var k = 0; k < $scope.lstSelectedPurchaseMain.length; k++) {
                        $scope.lstSelectedPurchaseMain[k].IsEdit = false;
                    }

                    $("#tblPurchaseMainTable tr").removeClass("highlight");
                    $(this).addClass("highlight");

                    $scope.WorkingPurchaseMain = $scope.lstSelectedPurchaseMain[$(this)[0].accessKey];
                    $scope.WorkingPurchaseMain.IsEdit = true;
                    var obj = _.findWhere($scope.lstItems, { ItemCode: $scope.WorkingPurchaseMain.ItemCode });
                    if (obj) {
                        if (obj.isBatch == 1) {
                            $scope.BatchList = obj.itembatches;
                            $scope.WorkingPurchaseMain.isBatch = true;
                        } else {
                            $scope.BatchList = [];
                            $scope.WorkingPurchaseMain.isBatch = false;
                        }
                    }
                    $scope.$apply();
                }
            });
        })
    }

    $scope.RemovePurchaseMainItemInList = function (index) {
        // $scope.lstSelectedPurchaseMain = _.filter($scope.lstSelectedPurchaseMain, function (item) {
        //     return item.UOM != $scope.WorkingPurchaseMain.UOM || item.ItemCode != $scope.WorkingPurchaseMain.ItemCode;
        // });
        $scope.lstSelectedPurchaseMain.splice(index, 1);

        if ($scope.lstSelectedPurchaseMain.length == 0) {
            $scope.model.Total = 0.00;
            $scope.model.NetTotal = 0.00;
            $scope.model.LocalNetTotal = 0.00;
            $scope.model.FinalTotal = 0.00;
            $scope.model.Tax = 0.00;
            $scope.model.LocalTax = 0.00;
            $scope.AddPurchaseMainItemInList();
        } else {
            AdjustFinalPurchaseTotal();
            $scope.WorkingPurchaseMain = $scope.lstSelectedPurchaseMain[$scope.lstSelectedPurchaseMain.length - 1];
        }

        // $scope.WorkingPurchaseMain = null;

        // AssignPurchaseMainClickEvent();

        // setTimeout(function () {
        //     $scope.SelectPurchaseMainRaw(0);
        // })
    }

    $scope.SelectPurchaseMainRaw = function (index) {
        $("#tblPurchaseMainTable tr[accessKey='" + index + "']").trigger("click");
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

            AdjustFinalPurchaseTotal();
        });
    };

    $scope.AddPrice = function (o) {
        if (o.Qty != 0 && o.Qty != "") {
            o.Total = (o.Qty * o.Price) - o.DiscountAmount;
            o.Tax = o.LocalTax = (o.Total * o.TaxRate) / 100;
            o.FinalTotal = o.NetTotal = o.LocalNetTotal = o.Total + o.Tax;
        } else {
            o.Total = 0.00;
            o.FinalTotal = o.NetTotal = o.LocalNetTotal = 0.00;
        }
        AdjustFinalPurchaseTotal();
    }

    $scope.AddItemCode = function (o) {
        var obj = _.findWhere($scope.lstItems, { ItemCode: o.ItemCode });
        o.Descriptions = obj.Descriptions;
        o.UOM = (obj.PurchaseUOM).toString();
        o.TaxCode = obj.PurchaseTaxCode;
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
        var objUOM = _.findWhere(o.listUOM, { UOM: o.UOM });
        if (objUOM) {
            o.Price = objUOM.Price;
            $scope.AddTaxCode(o, 1);
        }
    }

    $scope.AddLocation = function (o) {
        var obj = _.findWhere($scope.lstLocations, { id: parseInt(o.idLocations) });
        o.DisplayLocation = obj.Name;
    }

    $scope.AddDiscountAmount = function (o) {
        o.Total = (o.Qty * o.Price) - o.DiscountAmount;
        o.FinalTotal = o.NetTotal = o.LocalNetTotal = o.Total + o.Tax;
        if (o.DiscountAmount != null && o.DiscountAmount != 0 && o.DiscountAmount != '' && o.DiscountAmount != undefined) {
            o.isDiscount = 1;
        } else {
            o.isDiscount = 0;
        }

        AdjustFinalPurchaseTotal();
    }

    $scope.AddTaxCode = function (o, status) {
        if (o.TaxCode) {
            var obj = _.findWhere($scope.lstTaxCode, { TaxType: o.TaxCode });
            if (obj) {
                o.TaxRate = obj.TaxRate;
                o.Tax = o.LocalTax = (o.Total * obj.TaxRate) / 100;
                if (status == 1) {
                    if ($scope.model.IsInclusive) {
                        o.Price = o.Price / ((o.TaxRate / 100) + 1);
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

    function AdjustFinalPurchaseTotal() {
        if ($scope.lstSelectedPurchaseMain.length > 0) {
            $scope.model.Total = 0.00;
            $scope.model.NetTotal = 0.00;
            $scope.model.LocalNetTotal = 0.00;
            $scope.model.FinalTotal = 0.00;
            $scope.model.Tax = 0.00;
            $scope.model.LocalTax = 0.00;
            for (var i = 0; i < $scope.lstSelectedPurchaseMain.length; i++) {
                $scope.model.Total = $scope.model.Total + $scope.lstSelectedPurchaseMain[i].Total;
                $scope.model.LocalNetTotal = $scope.model.LocalNetTotal + $scope.lstSelectedPurchaseMain[i].Total;
                $scope.model.NetTotal = $scope.model.FinalTotal = $scope.model.NetTotal + $scope.lstSelectedPurchaseMain[i].NetTotal;
                $scope.model.Tax = $scope.model.LocalTax = $scope.model.Tax + $scope.lstSelectedPurchaseMain[i].Tax;
            }
            if ($scope.model.DiscountRate != null && $scope.model.DiscountRate != '' && $scope.model.DiscountRate != undefined) {
                $scope.model.Total = ($scope.model.Total - ($scope.model.Total * $scope.model.DiscountRate) / 100);
                $scope.model.NetTotal = $scope.model.FinalTotal = $scope.model.Total + $scope.model.Tax;
            }
        }
    }

    $scope.ManageDiscount = function () {
        AdjustFinalPurchaseTotal();
    }


    //End Main Purchase Tab

    $scope.formsubmit = false;
    $scope.SavePurchaseOrder = function (form) {
        if (form.$invalid) {
            $scope.formsubmit = true;
        } else {
            var NoItemCode = _.findWhere($scope.lstSelectedPurchaseMain, { ItemCode: '' });
            if (NoItemCode) {
                var alertPopup = $ionicPopup.alert({
                    title: '',
                    template: 'Item code missing.First select Item code for all items in list.',
                    cssClass: 'custPop',
                    okText: 'Ok',
                    okType: 'btn btn-green',
                });
            } else {
                var NoQty = _.filter($scope.lstSelectedPurchaseMain, function (item) {
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
                    var BatchList = _.where($scope.lstSelectedPurchaseMain, { isBatch: true });

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
        }

        function Save() {
            if (!$scope.model.id) {
                $scope.model.id = 0;
            }
            $scope.model.lstPurchaseDetail = $scope.lstSelectedPurchaseMain;
            if (new Date($scope.model.PurchaseDate) == 'Invalid Date') {
                $scope.model.PurchaseDate = moment().set({ 'date': $scope.model.PurchaseDate.split('-')[0], 'month': $scope.model.PurchaseDate.split('-')[1] - 1, 'year': $scope.model.PurchaseDate.split('-')[2] }).format('YYYY-MM-DD');
            } else {
                if (moment($scope.model.PurchaseDate, "DD-MM-YYYY").format('YYYY-MM-DD') == 'Invalid date') {
                    $scope.model.PurchaseDate = moment($scope.model.PurchaseDate).format('YYYY-MM-DD');
                } else {
                    $scope.model.PurchaseDate = moment($scope.model.PurchaseDate, "DD-MM-YYYY").format('YYYY-MM-DD');
                }
            }

            $scope.ListMaxPurchasePrice = [];
            $scope.ListMinPurchasePrice = [];

            $scope.ListMaxPurchaseQty = [];
            $scope.ListMinPurchaseQty = [];
            _.filter($scope.lstSelectedPurchaseMain, function (p) {
                var obj = _.findWhere(p.listUOM, { UOM: p.UOM });
                if (obj) {
                    if (p.Price > obj.MaxPurchasePrice) {
                        $scope.ListMaxPurchasePrice.push(p);
                    }
                    if (p.Price < obj.MinPurchasePrice) {
                        $scope.ListMinPurchasePrice.push(p);
                    }

                    if ((parseInt(p.Qty) + parseInt(obj.BalQty)) > obj.MaxQty) {
                        $scope.ListMaxPurchaseQty.push(p);
                    }
                    if ((parseInt(p.Qty) + parseInt(obj.BalQty)) < obj.MinQty) {
                        $scope.ListMinPurchaseQty.push(p);
                    }
                }
            })

            //return
            if ($scope.ListMaxPurchasePrice.length > 0 || $scope.ListMinPurchasePrice.length > 0) {
                var confirmPopup = $ionicPopup.confirm({
                    title: "",
                    template: '<p ng-if="ListMaxPurchasePrice.length > 0"><b>Purchase Price for ' + _.pluck($scope.ListMaxPurchasePrice, 'ItemCode').toString() + ' is too high base on maximum Purchase price.</b></p>' +
                        '<p ng-if="ListMinPurchasePrice.length > 0"><b>And</b></p>' +
                        '<p ng-if="ListMinPurchasePrice.length > 0"><b>Purchase Price for ' + _.pluck($scope.ListMinPurchasePrice, 'ItemCode').toString() + ' is too low base on minimum Purchase price.</b></p>' +
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
                        checkminmaxqty();
                    }
                })
            } else {
                checkminmaxqty();
            }

            function checkminmaxqty() {
                if ($scope.ListMaxPurchaseQty.length > 0 || $scope.ListMinPurchaseQty.length > 0) {
                    var confirmPopup = $ionicPopup.confirm({
                        title: "",
                        template: '<p ng-if="ListMaxPurchaseQty.length > 0"><b>Purchase Qty for ' + _.pluck($scope.ListMaxPurchaseQty, 'ItemCode').toString() + ' is too high base on maximum Purchase Qty.</b></p>' +
                            '<p ng-if="ListMinPurchaseQty.length > 0"><b>And</b></p>' +
                            '<p ng-if="ListMinPurchaseQty.length > 0"><b>Purchase Qty for ' + _.pluck($scope.ListMinPurchaseQty, 'ItemCode').toString() + ' is too low base on minimum Purchase Qty.</b></p>' +
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
                            $http.post($rootScope.RoutePath + 'purchaseorder/SavePurchaseOrder', $scope.model).then(function (res) {
                                if (res.data.success) {
                                    $scope.init();
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
                    })
                } else {
                    $http.post($rootScope.RoutePath + 'purchaseorder/SavePurchaseOrder', $scope.model).then(function (res) {
                        if (res.data.success) {
                            $scope.init();
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
            if (prop == 'PurchaseDate') {
                $scope.model['PurchaseDate'] = moment(selectedItem[prop]).format('DD-MM-YYYY');
            }
            if (prop == 'ModifiedBy') {
                $scope.model['ModifiedBy'] = parseInt($localstorage.get('UserId'));
            }
        }

        $scope.lstSelectedPurchaseMain = selectedItem.purchaseorderdetails;

        if ($scope.lstSelectedPurchaseMain.length > 0) {
            for (var i = 0; i < $scope.lstSelectedPurchaseMain.length; i++) {
                $scope.lstSelectedPurchaseMain[i].IsEdit = false;
                if ($scope.lstSelectedPurchaseMain[i].TaxCode) {
                    var obj = _.findWhere($scope.lstTaxCode, { TaxType: $scope.lstSelectedPurchaseMain[i].TaxCode });
                    if (obj) {
                        $scope.lstSelectedPurchaseMain[i].TaxRate = obj.TaxRate;
                    }
                }

                if ($scope.lstSelectedPurchaseMain[i].idLocations) {
                    var obj1 = _.findWhere($scope.lstLocations, { id: parseInt($scope.lstSelectedPurchaseMain[i].idLocations) });
                    $scope.lstSelectedPurchaseMain[i].idLocations = ($scope.lstSelectedPurchaseMain[i].idLocations).toString();
                    if (obj1) {
                        $scope.lstSelectedPurchaseMain[i].DisplayLocation = obj1.Name;
                    }
                }

                var objItem1 = _.findWhere($scope.lstItems, { ItemCode: $scope.lstSelectedPurchaseMain[i].ItemCode });
                if (objItem1) {
                    $scope.lstSelectedPurchaseMain[i].listUOM = objItem1.itemuoms;
                    if (objItem1.isBatch == 1) {
                        $scope.lstSelectedPurchaseMain[i].isBatch = true;
                        $scope.lstSelectedPurchaseMain[i].BatchList = objItem1.itembatches;
                    } else {
                        $scope.lstSelectedPurchaseMain[i].isBatch = false;
                        $scope.lstSelectedPurchaseMain[i].BatchList = objItem1.itembatches;
                    }
                } else {
                    $scope.lstSelectedPurchaseMain[i].listUOM = [];
                }

                $scope.lstSelectedPurchaseMain[i].LastBalQty = $scope.lstSelectedPurchaseMain[i].Qty * -1;
                $scope.lstSelectedPurchaseMain[i].LastBatchNo = $scope.lstSelectedPurchaseMain[i].BatchNo;
                $scope.lstSelectedPurchaseMain[i].LastLocation = $scope.lstSelectedPurchaseMain[i].idLocations;
                $scope.lstSelectedPurchaseMain[i].LastItemCode = $scope.lstSelectedPurchaseMain[i].ItemCode;
                $scope.lstSelectedPurchaseMain[i].LastUOM = $scope.lstSelectedPurchaseMain[i].UOM;
            }

            // var objItem = _.findWhere($scope.lstItems, { ItemCode: $scope.lstSelectedPurchaseMain[0].ItemCode });
            // if (objItem) {
            //     if (objItem.isBatch == 1) {
            //         $scope.BatchList = objItem.itembatches;
            //     } else {
            //         $scope.BatchList = [];
            //     }
            // }

            $scope.WorkingPurchaseMain = $scope.lstSelectedPurchaseMain[$scope.lstSelectedPurchaseMain.length - 1];

            // AssignPurchaseMainClickEvent();

            // setTimeout(function () {
            //     $scope.SelectPurchaseMainRaw(0);
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
                $http.get($rootScope.RoutePath + 'purchaseorder/DeletePurchaseOrder', {
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
            DiscountRate: null,
            CreatedBy: parseInt($localstorage.get('UserId')),
            CreatedDate: null,
            ModifiedBy: null,
            ModifiedDate: null,
            Status: 'Pending',
            LoginUserCode: $localstorage.get('UserCode')
        };
        $scope.Searchmodel = {
            Search: '',
        }

        $scope.lstSelectedPurchaseMain = [];
        $scope.AddPurchaseMainItemInList();
    };

    $scope.FilterData = function () {
        $('#PurchaseOrderTable').dataTable().api().ajax.reload();
    }

    $scope.EnableFilterOption = function () {
        $(function () {
            $(".CustFilter").slideToggle();
        });
    };

    $scope.FilterAdvanceData = function (o) {
        $scope.modelAdvanceSearch = o;
        $('#PurchaseOrderTable').dataTable().api().ajax.reload();
    }

    //Set Table
    function InitDataTable() {
        if ($.fn.DataTable.isDataTable('#PurchaseOrderTable')) {
            $('#PurchaseOrderTable').DataTable().destroy();
        }
        $('#PurchaseOrderTable').DataTable({
            "processing": true,
            "dom": 'rt<"bottom"<"left"<"length"l><"info"i>><"right"<"pagination"p>>>',
            "serverSide": true,
            "responsive": true,
            "aaSorting": [2, 'DESC'],
            "ajax": {
                url: $rootScope.RoutePath + 'purchaseorder/GetAllPurchaseOrderDynamic',
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
                { "data": "PurchaseDate", "defaultContent": "N/A" },
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
                    Action += '<a ng-click="DeleteItem(' + row.id + ')" class="btnAction btnAction-error" style="cursor:pointer"><i class="ion-trash-a" title="Delete"></i></a>';
                    Action += '<a ng-click="GenerateReport(' + row.id + ')" class="btnAction btnAction-info" style="cursor:pointer"><i class="ion-document-text" title="Document"></i></a>&nbsp;';
                    Action += '</div>';
                    return Action;
                },
                "targets": 10
            }
            ]
        });

    }

    $scope.GenerateReport = function (Id) {
        window.open($rootScope.RoutePath + "purchaseorder/GenerateInvoice?Id=" + Id, '_blank');
    }

    // Alias
    $rootScope.ResetAll = $scope.init;

    $scope.Add = function () {
        $scope.formsubmit = false;
        $rootScope.BackButton = $scope.IsList = false;
    }

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

    $scope.ChangeInclusivePrice = function () {
        if ($scope.lstSelectedPurchaseMain.length > 0) {
            if ($scope.model.IsInclusive) {
                for (var i = 0; i < $scope.lstSelectedPurchaseMain.length; i++) {
                    if ($scope.lstSelectedPurchaseMain[i].TaxRate != 0) {
                        $scope.lstSelectedPurchaseMain[i].Price = $scope.lstSelectedPurchaseMain[i].Price / (($scope.lstSelectedPurchaseMain[i].TaxRate / 100) + 1);
                        if ($scope.lstSelectedPurchaseMain[i].Qty != null) {
                            $scope.lstSelectedPurchaseMain[i].Total = ($scope.lstSelectedPurchaseMain[i].Qty * $scope.lstSelectedPurchaseMain[i].Price) - $scope.lstSelectedPurchaseMain[i].DiscountAmount;
                            $scope.lstSelectedPurchaseMain[i].Tax = $scope.lstSelectedPurchaseMain[i].LocalTax = ($scope.lstSelectedPurchaseMain[i].Total * $scope.lstSelectedPurchaseMain[i].TaxRate) / 100;
                            $scope.lstSelectedPurchaseMain[i].FinalTotal = $scope.lstSelectedPurchaseMain[i].NetTotal = $scope.lstSelectedPurchaseMain[i].LocalNetTotal = $scope.lstSelectedPurchaseMain[i].Total + $scope.lstSelectedPurchaseMain[i].Tax;
                        } else {
                            $scope.lstSelectedPurchaseMain[i].Price = 0.00;
                            $scope.lstSelectedPurchaseMain[i].Total = 0.00;
                            $scope.lstSelectedPurchaseMain[i].FinalTotal = $scope.lstSelectedPurchaseMain[i].NetTotal = $scope.lstSelectedPurchaseMain[i].LocalNetTotal = 0.00;
                        }
                        AdjustFinalPurchaseTotal();
                    }
                }
            } else {
                for (var i = 0; i < $scope.lstSelectedPurchaseMain.length; i++) {
                    if ($scope.lstSelectedPurchaseMain[i].TaxRate != 0) {
                        $scope.lstSelectedPurchaseMain[i].Price = $scope.lstSelectedPurchaseMain[i].Price * (($scope.lstSelectedPurchaseMain[i].TaxRate / 100) + 1);
                        if ($scope.lstSelectedPurchaseMain[i].Qty != null) {
                            $scope.lstSelectedPurchaseMain[i].Total = ($scope.lstSelectedPurchaseMain[i].Qty * $scope.lstSelectedPurchaseMain[i].Price) - $scope.lstSelectedPurchaseMain[i].DiscountAmount;
                            $scope.lstSelectedPurchaseMain[i].Tax = $scope.lstSelectedPurchaseMain[i].LocalTax = ($scope.lstSelectedPurchaseMain[i].Total * $scope.lstSelectedPurchaseMain[i].TaxRate) / 100;
                            $scope.lstSelectedPurchaseMain[i].FinalTotal = $scope.lstSelectedPurchaseMain[i].NetTotal = $scope.lstSelectedPurchaseMain[i].LocalNetTotal = $scope.lstSelectedPurchaseMain[i].Total + $scope.lstSelectedPurchaseMain[i].Tax;
                        } else {
                            $scope.lstSelectedPurchaseMain[i].Price = 0.00;
                            $scope.lstSelectedPurchaseMain[i].Total = 0.00;
                            $scope.lstSelectedPurchaseMain[i].FinalTotal = $scope.lstSelectedPurchaseMain[i].NetTotal = $scope.lstSelectedPurchaseMain[i].LocalNetTotal = 0.00;
                        }
                        AdjustFinalPurchaseTotal();
                    }
                }
            }
        }
    }

    $scope.init();

});