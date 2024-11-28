app.controller('PurchaseReturnController', function ($scope, $rootScope, $http, $ionicPopup, $ionicLoading, $localstorage, $state, $compile) {

    $scope.init = function () {
        setTimeout(() => {
            $("#mytext").focus();
        }, 1000);
        $scope.modelAdvanceSearch = null;
        ManageRole();
        console.log("%%%%%%%%");

        $scope.ResetModel();
        $scope.GetAllBranch();
        $scope.GetAllItem();
        $scope.GetAllLocation();
        $scope.GetAllTaxCode();
        $scope.GetAllCurrency();
        $scope.GetAllCurrencyRate();
        $scope.GetAllCustomer();
        $scope.tab = { selectedIndex: 0 };
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
        // if ($scope.SelectedTab == 1) {
        //     $scope.WorkingPurchaseReturnMain = null;

        //     AssignPurchaseMainClickEvent();

        //     setTimeout(function () {
        //         $scope.SelectPurchaseReturnMainRaw(0);
        //     })
        // } else 
        if ($scope.SelectedTab == 2) {
            setTimeout(function () {
                $("#PhoneNumber").intlTelInput({
                    utilsScript: "lib/intl/js/utils.js"
                });
            }, 500)
        }
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
            $scope.model.BranchCode = obj.customerbranch ? obj.customerbranch.Name : '';
            console.log($scope.lstItems);

            if (_.findWhere($scope.lstItems, { IdCustomer: obj.id })) {
                $scope.lstItems = $scope.lstItems.length > 0 ? move($scope.lstItems, $scope.lstItems.findIndex(x => x.IdCustomer == obj.id), 0) : [];
            }
            if (obj.Currency != undefined && obj.Currency != null && obj.Currency != '') {
                $scope.checkCurrencyRate(obj.Currency);
            } else {
                //for default currency
                $scope.model.CurrencyCode = _.findWhere($scope.lstCurrency, { isDefault: 1 }).CurrencyCode;
                $scope.model.CurrencyRate = _.findWhere($scope.lstCurrency, { CurrencyCode: $scope.model.CurrencyCode }).SellRate;
            }
        }
        else {
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
        if ($scope.lstSelectedPurchaseReturnMain.length > 0) {
            var confirmPopup = $ionicPopup.confirm({
                title: "",
                template: 'Are you sure you want to change locations of all purchase return?',
                cssClass: 'custPop',
                cancelText: 'Cancel',
                okText: 'Ok',
                okType: 'btn btn-green',
                cancelType: 'btn btn-red',
            })
            confirmPopup.then(function (res) {
                if (res) {
                    if ($scope.lstSelectedPurchaseReturnMain.length > 0) {
                        for (var i = 0; i < $scope.lstSelectedPurchaseReturnMain.length; i++) {
                            $scope.lstSelectedPurchaseReturnMain[i].idLocations = parseInt($scope.model.idLocations);
                            $scope.lstSelectedPurchaseReturnMain[i].DisplayLocation = _.findWhere($scope.lstLocations, { id: parseInt($scope.model.idLocations) }).Name;
                        }
                    }
                    $scope.PurchaseReturnMainModel.idLocations = $scope.model.idLocations;
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

    //Start Main Purchase Return Tab

    //add Purchase Return main item in list
    $scope.AddPurchaseReturnMainItemInList = function () {
        // if ($scope.WorkingPurchaseReturnMain != undefined && $scope.WorkingPurchaseReturnMain.ItemCode == '') {
        //     $ionicLoading.show({ template: "Fill Data" });
        //     setTimeout(function () {
        //         $ionicLoading.hide()
        //     }, 1000);
        //     return;
        // } 
        if ($scope.lstSelectedPurchaseReturnMain.length > 0 && $scope.lstSelectedPurchaseReturnMain[$scope.lstSelectedPurchaseReturnMain.length - 1].ItemCode == '') {
            $ionicLoading.show({ template: "Fill Data" });
            setTimeout(function () {
                $ionicLoading.hide()
            }, 1000);
            return;
        } else {
            _.filter($scope.lstSelectedPurchaseReturnMain, function (item) {
                item.IsEdit = false;
            });

            $scope.PurchaseReturnMainModel = {
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
                idPurchaseReturn: null,
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
                isBatch: false,
                sequence: $scope.lstSelectedPurchaseReturnMain.length + 1
            }
            // $scope.BatchList = [];

            $scope.lstSelectedPurchaseReturnMain.push($scope.PurchaseReturnMainModel);
            $scope.WorkingPurchaseReturnMain = $scope.PurchaseReturnMainModel;

            // AssignPurchaseMainClickEvent();

            // setTimeout(function () {
            //     $scope.SelectPurchaseReturnMainRaw($scope.lstSelectedPurchaseReturnMain.length - 1);
            // })
        }
    }

    function AssignPurchaseMainClickEvent() {
        setTimeout(function () {
            $("#tblPurchaseReturnMainTable tr").unbind("click");

            $("#tblPurchaseReturnMainTable tr").click(function () {
                if ($(this)[0].accessKey != "") {
                    for (var k = 0; k < $scope.lstSelectedPurchaseReturnMain.length; k++) {
                        $scope.lstSelectedPurchaseReturnMain[k].IsEdit = false;
                    }

                    $("#tblPurchaseReturnMainTable tr").removeClass("highlight");
                    $(this).addClass("highlight");

                    $scope.WorkingPurchaseReturnMain = $scope.lstSelectedPurchaseReturnMain[$(this)[0].accessKey];
                    $scope.WorkingPurchaseReturnMain.IsEdit = true;
                    var obj = _.findWhere($scope.lstItems, { ItemCode: $scope.WorkingPurchaseReturnMain.ItemCode });
                    if (obj) {
                        if (obj.isBatch == 1) {
                            $scope.BatchList = obj.itembatches;
                            $scope.WorkingPurchaseReturnMain.isBatch = true;
                        } else {
                            $scope.BatchList = [];
                            $scope.WorkingPurchaseReturnMain.isBatch = false;
                        }
                    }
                    $scope.$apply();
                }
            });
        })
    }

    $scope.RemovePurchaseReturnMainItemInList = function (index) {
        // $scope.lstSelectedPurchaseReturnMain = _.filter($scope.lstSelectedPurchaseReturnMain, function (item) {
        //     return item.UOM != $scope.WorkingPurchaseReturnMain.UOM || item.ItemCode != $scope.WorkingPurchaseReturnMain.ItemCode;
        // });
        var SelectedSeq = $scope.lstSelectedPurchaseReturnMain[index].sequence
        $scope.lstSelectedPurchaseReturnMain.splice(index, 1);
        _.filter($scope.lstSelectedPurchaseReturnMain, function (item) {
            if (item.sequence > SelectedSeq) {
                item.sequence = item.sequence - 1
            }
        });
        if ($scope.lstSelectedPurchaseReturnMain.length == 0) {
            $scope.model.Total = 0.00;
            $scope.model.NetTotal = 0.00;
            $scope.model.LocalNetTotal = 0.00;
            $scope.model.FinalTotal = 0.00;
            $scope.model.Tax = 0.00;
            $scope.model.LocalTax = 0.00;
            $scope.AddPurchaseReturnMainItemInList();
        } else {
            AdjustFinalPurchaseReturnTotal();
            $scope.WorkingPurchaseReturnMain = $scope.lstSelectedPurchaseReturnMain[$scope.lstSelectedPurchaseReturnMain.length - 1];
        }

        // AssignPurchaseMainClickEvent();

        // setTimeout(function () {
        //     $scope.SelectPurchaseReturnMainRaw(0);
        // })
    }

    $scope.SelectPurchaseReturnMainRaw = function (index) {
        $("#tblPurchaseReturnMainTable tr[accessKey='" + index + "']").trigger("click");
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

            AdjustFinalPurchaseReturnTotal();
        });
    };

    $scope.AddPrice = function (o) {
        if (o.Qty != 0 && o.Qty != "") {
            o.Total = (o.Qty * parseFloat(o.Price)) - o.DiscountAmount;
            o.Tax = o.LocalTax = (o.Total * o.TaxRate) / 100;
            o.FinalTotal = o.NetTotal = o.LocalNetTotal = o.Total + o.Tax;
        } else {
            o.Total = 0.00;
            o.FinalTotal = o.NetTotal = o.LocalNetTotal = 0.00;
        }
        AdjustFinalPurchaseReturnTotal();
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
            o.BatchList = obj.itembatches;
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
        var obj = _.findWhere($scope.lstLocations, { id: parseInt(o.idLocations) });
        o.DisplayLocation = obj.Name;
    }

    $scope.AddDiscountAmount = function (o) {
        o.Total = (o.Qty * parseFloat(o.Price)) - parseFloat(o.DiscountAmount);
        o.FinalTotal = o.NetTotal = o.LocalNetTotal = o.Total + o.Tax;
        if (o.DiscountAmount != null && o.DiscountAmount != 0 && o.DiscountAmount != '' && o.DiscountAmount != undefined) {
            o.isDiscount = 1;
        } else {
            o.isDiscount = 0;
        }

        AdjustFinalPurchaseReturnTotal();
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

        $scope.AddPrice(o);
    }

    function AdjustFinalPurchaseReturnTotal() {
        if ($scope.lstSelectedPurchaseReturnMain.length > 0) {
            $scope.model.Total = 0.00;
            $scope.model.NetTotal = 0.00;
            $scope.model.LocalNetTotal = 0.00;
            $scope.model.FinalTotal = 0.00;
            $scope.model.Tax = 0.00;
            $scope.model.LocalTax = 0.00;

            for (var i = 0; i < $scope.lstSelectedPurchaseReturnMain.length; i++) {
                $scope.model.Total = $scope.model.Total + $scope.lstSelectedPurchaseReturnMain[i].Total;
                $scope.model.LocalNetTotal = $scope.model.LocalNetTotal + $scope.lstSelectedPurchaseReturnMain[i].Total;
                $scope.model.NetTotal = $scope.model.FinalTotal = $scope.model.NetTotal + $scope.lstSelectedPurchaseReturnMain[i].NetTotal;
                $scope.model.Tax = $scope.model.LocalTax = $scope.model.Tax + $scope.lstSelectedPurchaseReturnMain[i].Tax;
            }
            if ($scope.model.DiscountRate != null && $scope.model.DiscountRate != '' && $scope.model.DiscountRate != undefined) {
                $scope.model.Total = ($scope.model.Total - ($scope.model.Total * $scope.model.DiscountRate) / 100);
                $scope.model.NetTotal = $scope.model.FinalTotal = $scope.model.Total + $scope.model.Tax;
            }
        }
    }

    $scope.ManageDiscount = function () {
        AdjustFinalPurchaseReturnTotal();
    }

    //End Main Purchase Return Tab
    $scope.formsubmit = false;
    $scope.SavePurchaseReturn = function (form) {

        if (form.$invalid) {
            $scope.formsubmit = true;
        } else {
            var NoItemCode = _.findWhere($scope.lstSelectedPurchaseReturnMain, { ItemCode: '' });
            if (NoItemCode) {
                var alertPopup = $ionicPopup.alert({
                    title: '',
                    template: 'Item code missing.First select Item code for all items in list.',
                    cssClass: 'custPop',
                    okText: 'Ok',
                    okType: 'btn btn-green',
                });
            } else {
                var NoQty = _.filter($scope.lstSelectedPurchaseReturnMain, function (item) {
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
                    var BatchList = _.where($scope.lstSelectedPurchaseReturnMain, { isBatch: true });

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
            if (!$("#PhoneNumber").intlTelInput("isValidNumber")) {
                $scope.isValidMobile = true
                if ($scope.model.PhoneNumber.toString().length <= 2) {
                    $scope.isValidMobile = false
                    $scope.model.PhoneNumber = '';
                } else {
                    return;
                }

            }
            $scope.isValidMobile = false
            if (!$scope.model.id) {
                $scope.model.id = 0;
            }
            $scope.model.lstPurchaseReturnDetail = $scope.lstSelectedPurchaseReturnMain;
            if (new Date($scope.model.PurchaseDate) == 'Invalid Date') {
                $scope.model.PurchaseDate = moment().set({ 'date': $scope.model.PurchaseDate.split('-')[0], 'month': $scope.model.PurchaseDate.split('-')[1] - 1, 'year': $scope.model.PurchaseDate.split('-')[2] }).format('YYYY-MM-DD');
            } else {
                if (moment($scope.model.PurchaseDate, "DD-MM-YYYY").format('YYYY-MM-DD') == 'Invalid date') {
                    $scope.model.PurchaseDate = moment($scope.model.PurchaseDate).format('YYYY-MM-DD');
                } else {
                    $scope.model.PurchaseDate = moment($scope.model.PurchaseDate).format('YYYY-MM-DD');
                }
            }
            $rootScope.ShowLoader();
            $http.post($rootScope.RoutePath + 'purchasereturn/SavePurchaseReturn', $scope.model)
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
            if (prop == 'PurchaseDate') {
                $scope.model['PurchaseDate'] = moment(selectedItem[prop]).format('YYYY-MM-DD');
            }
            if (prop == 'ModifiedBy') {
                $scope.model['ModifiedBy'] = parseInt($localstorage.get('UserId'));
            }
        }

        $scope.lstSelectedPurchaseReturnMain = selectedItem.purchasereturndetails;

        $scope.lstSelectedPurchaseReturnMain = _.sortBy($scope.lstSelectedPurchaseReturnMain, 'sequence');

        if ($scope.lstSelectedPurchaseReturnMain.length > 0) {
            for (var i = 0; i < $scope.lstSelectedPurchaseReturnMain.length; i++) {
                $scope.lstSelectedPurchaseReturnMain[i].IsEdit = false;
                if ($scope.lstSelectedPurchaseReturnMain[i].TaxCode) {
                    var obj = _.findWhere($scope.lstTaxCode, { TaxType: $scope.lstSelectedPurchaseReturnMain[i].TaxCode });
                    if (obj) {
                        $scope.lstSelectedPurchaseReturnMain[i].TaxRate = obj.TaxRate;
                    }
                }

                if ($scope.lstSelectedPurchaseReturnMain[i].sequence == null) {
                    $scope.lstSelectedPurchaseReturnMain[i].sequence = i + 1
                }

                if ($scope.lstSelectedPurchaseReturnMain[i].idLocations) {
                    var obj1 = _.findWhere($scope.lstLocations, { id: parseInt($scope.lstSelectedPurchaseReturnMain[i].idLocations) });
                    $scope.lstSelectedPurchaseReturnMain[i].idLocations = ($scope.lstSelectedPurchaseReturnMain[i].idLocations).toString();
                    if (obj1) {
                        $scope.lstSelectedPurchaseReturnMain[i].DisplayLocation = obj1.Name;
                    }
                }

                var objItem1 = _.findWhere($scope.lstItems, { ItemCode: $scope.lstSelectedPurchaseReturnMain[i].ItemCode });
                if (objItem1) {
                    $scope.lstSelectedPurchaseReturnMain[i].listUOM = objItem1.itemuoms;
                    if (objItem1.isBatch == 1) {
                        $scope.lstSelectedPurchaseReturnMain[i].isBatch = true;
                        $scope.lstSelectedPurchaseReturnMain[i].BatchList = objItem1.itembatches;
                    } else {
                        $scope.lstSelectedPurchaseReturnMain[i].isBatch = false;
                        $scope.lstSelectedPurchaseReturnMain[i].BatchList = objItem1.itembatches;
                    }
                } else {
                    $scope.lstSelectedPurchaseReturnMain[i].listUOM = [];
                }

                $scope.lstSelectedPurchaseReturnMain[i].LastBalQty = $scope.lstSelectedPurchaseReturnMain[i].Qty;
                $scope.lstSelectedPurchaseReturnMain[i].LastBatchNo = $scope.lstSelectedPurchaseReturnMain[i].BatchNo;
                $scope.lstSelectedPurchaseReturnMain[i].LastLocation = $scope.lstSelectedPurchaseReturnMain[i].idLocations;
                $scope.lstSelectedPurchaseReturnMain[i].LastItemCode = $scope.lstSelectedPurchaseReturnMain[i].ItemCode;
                $scope.lstSelectedPurchaseReturnMain[i].LastUOM = $scope.lstSelectedPurchaseReturnMain[i].UOM;
            }

            // var objItem = _.findWhere($scope.lstItems, { ItemCode: $scope.lstSelectedPurchaseReturnMain[0].ItemCode });
            // if (objItem) {
            //     if (objItem.isBatch == 1) {
            //         $scope.BatchList = objItem.itembatches;
            //     } else {
            //         $scope.BatchList = [];
            //     }
            // }

            $scope.WorkingPurchaseReturnMain = $scope.lstSelectedPurchaseReturnMain[$scope.lstSelectedPurchaseReturnMain.length - 1];

            // AssignPurchaseMainClickEvent();

            // setTimeout(function () {
            //     $scope.SelectPurchaseReturnMainRaw(0);
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
                $http.get($rootScope.RoutePath + 'purchasereturn/DeletePurchaseReturn', {
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
            PurchaseDate: moment().format('YYYY-MM-DD'),
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
            Reason: null,
            IsInclusive: 0,
            DiscountRate: null,
            CreatedBy: parseInt($localstorage.get('UserId')),
            CreatedDate: null,
            ModifiedBy: null,
            ModifiedDate: null,
            LoginUserCode: $localstorage.get('UserCode')
        };
        $scope.Searchmodel = {
            Search: '',
        }

        $scope.lstSelectedPurchaseReturnMain = [];
        $scope.AddPurchaseReturnMainItemInList();
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
        $('#PurchaseReturnTable').dataTable().api().ajax.reload();
    }

    $scope.EnableFilterOption = function () {
        $(function () {
            $(".CustFilter").slideToggle();
        });
    };

    $scope.FilterAdvanceData = function (o) {
        $scope.modelAdvanceSearch = o;
        $('#PurchaseReturnTable').dataTable().api().ajax.reload();
    }

    //Set Table
    function InitDataTable() {
        if ($.fn.DataTable.isDataTable('#PurchaseReturnTable')) {
            $('#PurchaseReturnTable').DataTable().destroy();
        }
        $('#PurchaseReturnTable').DataTable({
            "dom": 'rt<"bottom"<"left"<"length"l><"info"i>><"right"<"pagination"p>>>',
            "processing": true,
            "serverSide": true,
            "responsive": true,
            "aaSorting": [2, 'DESC'],
            "ajax": {
                url: $rootScope.RoutePath + 'purchasereturn/GetAllPurchaseReturnDynamic',
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
            },
            {
                "render": function (data, type, row) {
                    return moment(data).format('DD-MM-YYYY');
                },
                "targets": 2
            }, {
                "render": function (data, type, row) {
                    var Action = '<div layout="row" layout-align="center center">';
                    Action += '<a ng-click="CopyToModel(' + row.id + ')" class="btnAction btnAction-edit" style="cursor:pointer"><i class="ion-edit" title="Edit"></i></a>&nbsp;';
                    Action += '<a ng-click="DeleteItem(' + row.id + ')" class="btnAction btnAction-error" style="cursor:pointer"><i class="ion-trash-a" title=""Delete></i></a>';
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

    // $scope.PreventMobileNumber1 = function() {
    //     if ($scope.model.PhoneNumber != null && $scope.model.PhoneNumber != '' && $scope.model.PhoneNumber.toString().length > 15) {
    //         $scope.model.PhoneNumber = parseInt($scope.model.PhoneNumber.toString().substring(0, 15));
    //     }
    // }

    $scope.GenerateReport = function (Id) {
        window.open($rootScope.RoutePath + "purchasereturn/GenerateInvoice?Id=" + Id, '_blank');
    }

    $scope.ChangeInclusivePrice = function () {
        if ($scope.lstSelectedPurchaseReturnMain.length > 0) {
            if ($scope.model.IsInclusive) {
                for (var i = 0; i < $scope.lstSelectedPurchaseReturnMain.length; i++) {
                    if ($scope.lstSelectedPurchaseReturnMain[i].TaxRate != 0) {
                        $scope.lstSelectedPurchaseReturnMain[i].Price = parseFloat($scope.lstSelectedPurchaseReturnMain[i].Price) / (($scope.lstSelectedPurchaseReturnMain[i].TaxRate / 100) + 1);
                        if ($scope.lstSelectedPurchaseReturnMain[i].Qty != null) {
                            $scope.lstSelectedPurchaseReturnMain[i].Total = ($scope.lstSelectedPurchaseReturnMain[i].Qty * parseFloat($scope.lstSelectedPurchaseReturnMain[i].Price)) - $scope.lstSelectedPurchaseReturnMain[i].DiscountAmount;
                            $scope.lstSelectedPurchaseReturnMain[i].Tax = $scope.lstSelectedPurchaseReturnMain[i].LocalTax = ($scope.lstSelectedPurchaseReturnMain[i].Total * $scope.lstSelectedPurchaseReturnMain[i].TaxRate) / 100;
                            $scope.lstSelectedPurchaseReturnMain[i].FinalTotal = $scope.lstSelectedPurchaseReturnMain[i].NetTotal = $scope.lstSelectedPurchaseReturnMain[i].LocalNetTotal = $scope.lstSelectedPurchaseReturnMain[i].Total + $scope.lstSelectedPurchaseReturnMain[i].Tax;
                        } else {
                            $scope.lstSelectedPurchaseReturnMain[i].Price = 0.00;
                            $scope.lstSelectedPurchaseReturnMain[i].Total = 0.00;
                            $scope.lstSelectedPurchaseReturnMain[i].FinalTotal = $scope.lstSelectedPurchaseReturnMain[i].NetTotal = $scope.lstSelectedPurchaseReturnMain[i].LocalNetTotal = 0.00;
                        }
                        AdjustFinalPurchaseReturnTotal();
                    }
                }
            } else {
                for (var i = 0; i < $scope.lstSelectedPurchaseReturnMain.length; i++) {
                    if ($scope.lstSelectedPurchaseReturnMain[i].TaxRate != 0) {
                        $scope.lstSelectedPurchaseReturnMain[i].Price = parseFloat($scope.lstSelectedPurchaseReturnMain[i].Price) * (($scope.lstSelectedPurchaseReturnMain[i].TaxRate / 100) + 1);
                        if ($scope.lstSelectedPurchaseReturnMain[i].Qty != null) {
                            $scope.lstSelectedPurchaseReturnMain[i].Total = ($scope.lstSelectedPurchaseReturnMain[i].Qty * parseFloat($scope.lstSelectedPurchaseReturnMain[i].Price)) - $scope.lstSelectedPurchaseReturnMain[i].DiscountAmount;
                            $scope.lstSelectedPurchaseReturnMain[i].Tax = $scope.lstSelectedPurchaseReturnMain[i].LocalTax = ($scope.lstSelectedPurchaseReturnMain[i].Total * $scope.lstSelectedPurchaseReturnMain[i].TaxRate) / 100;
                            $scope.lstSelectedPurchaseReturnMain[i].FinalTotal = $scope.lstSelectedPurchaseReturnMain[i].NetTotal = $scope.lstSelectedPurchaseReturnMain[i].LocalNetTotal = $scope.lstSelectedPurchaseReturnMain[i].Total + $scope.lstSelectedPurchaseReturnMain[i].Tax;
                        } else {
                            $scope.lstSelectedPurchaseReturnMain[i].Price = 0.00;
                            $scope.lstSelectedPurchaseReturnMain[i].Total = 0.00;
                            $scope.lstSelectedPurchaseReturnMain[i].FinalTotal = $scope.lstSelectedPurchaseReturnMain[i].NetTotal = $scope.lstSelectedPurchaseReturnMain[i].LocalNetTotal = 0.00;
                        }
                        AdjustFinalPurchaseReturnTotal();
                    }
                }
            }
        }
    }

    $scope.init();

});