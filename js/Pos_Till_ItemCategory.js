app.controller('Pos_Till_ItemCategoryCtrl', function ($http, $scope, $rootScope, $ionicSideMenuDelegate, $ionicModal, $ionicScrollDelegate, $ionicPopup, $localstorage, $state, $ionicLoading) {
    var IsPosUserLogin = $localstorage.get("IsPosUserLogin");
    if ($localstorage.get("IsFloatComplate") == "0") {
        $localstorage.set("IsPosUserLogin", "0");
        $localstorage.set("IsPosUserId", null);
        $localstorage.set("IsPosUserName", null);
        $state.go('app.Pos_Till_Login');
    }

    if (!IsPosUserLogin) {
        $state.go('app.Pos_Till_Login');

    } else if (IsPosUserLogin == 0 || IsPosUserLogin == '0') {
        $state.go('app.Pos_Till_Login');
    }
    $(".userMenu1").click(function () {
        $(".userMenu_list1").slideToggle();
    })

    $scope.PosUser = $localstorage.get("IsPosUserName");
    $scope.LogOutPosTill = function () {
        $http.post($rootScope.RoutePath + 'postill/ManagePosLogForLogout', { idUser: $localstorage.get("IsPosUserId") })
            .then(function (res) {
                if (res.data.data == 'TOKEN') {
                    $rootScope.logout();
                }
                $localstorage.set("IsPosUserLogin", "0");
                $localstorage.set("IsPosUserId", null);
                $localstorage.set("IsPosUserName", null);
                $state.go('app.Pos_Till_Login');
            })
            .catch(function (err) {
                $ionicLoading.show({ template: 'Unable to Login right now. Please try again later.' });
                setTimeout(function () {
                    $ionicLoading.hide()
                }, 1000);

            });

    }

    $scope.init = function () {
        $scope.OpenOrder = true;
        $scope.DisplayCategory = [];
        $scope.LstMainCategory = [];
        $scope.lstItems = [];
        $scope.PaymentBill = [];
        $scope.initModel();
        $scope.initCustomerModel();
        $scope.CurrentTime = moment().format('DD MMM HH:mm');
        $scope.GetAllParentCategory();
        $scope.GetAllTaxCode();
        $scope.GetAllStatus();
        $scope.SelectedTab = -1;
        $scope.displayOrderDetail = null;
        $scope.GetAllCustomer();
        setTimeout(function () {
            $("#Cphone").intlTelInput({
                utilsScript: "lib/intl/js/utils.js"
            });
        }, 100)
        $scope.DisplayTab = 1;
        $scope.DiscountTab = 1;
        $scope.DiscountSubTab = 1;
        $scope.lstRefund = [];
        $scope.LatestInvoiceID = 0;
    }

    $scope.initModel = function () {
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
            idLocations: $localstorage.get('DefaultLocationPOSTill'),
            DefaultLocation: '',
            flgUOMConversation: false,
            UOMConversationId: null,
            idStatus: '1',
            IsInclusive: 0,
            DiscountRate: null,
            DisplayDiscount: 0.00,
            CustomerPhoneNumber: '',
            CreatedBy: $localstorage.get("IsPosUserId"),
            RemainAmount: 0
        };

        $scope.DiscountModel = {
            Type: '1',
            Value: '',
            MinSalePrice: '',
            MaxSalePrice: '',
            displayType: '1',
            Descriptions: '',
        }

        $scope.ImageModel = {
            Name: '',
            ImageUrl: '',
            Price: '',
            UOM: "",
        }


        $scope.RefundModel = {
            id: '',
            idInvoice: '',
            idInvoiceDetail: '',
            idUser: '',
            Qty: '',
            Price: 0.00,
            Amount: 0.00,
            ItemCode: '',
            CreatedDate: new Date(),
            Tax: 0.00,
            DisplayDiscount: 0.00,
            DisplayTax: 0.00,
            reason: ''
        }

        $scope.SearchModel = {
            SearchText: '',
            SearchInput: '',
        }

        $scope.FloatModel = {
            amount: '',
            reason: ''
        }

        $scope.SearchFlg = false;
        $scope.SelectedSalesItem = [];
        $scope.LastCustomerCode = null;
    }

    //Get parent Category
    $scope.GetAllParentCategory = function () {
        $http.get($rootScope.RoutePath + "postill/GetAllParentCategory").then(function (res) {
            $scope.lstItems = [];
            if (res.data.length == 0) {
                $scope.LstMainCategory = [];
                $scope.GetAllItem(null);
            }
            $scope.LstMainCategory = res.data;
            var classindex = 1;
            for (var index = 0; index < $scope.LstMainCategory.length; index++) {
                if (classindex <= 3) {
                    $scope.LstMainCategory[index].classname = "userType0" + classindex;
                    classindex++;
                } else {
                    $scope.LstMainCategory[index].classname = "userType04";
                    classindex = 1;
                }
            }
        });
    }

    $scope.ParentCategoryId = null;
    //Get Chiled Category
    $scope.GotoChildCategory = function (objCategory) {
        var ParentCategory = objCategory.Name;
        var params = {
            Parent: objCategory.id
        }
        $scope.DisplayCategory.push({ lable: '<i class="ion-chevron-right"></i>', data: null });
        $scope.DisplayCategory.push({ lable: objCategory.Name, data: objCategory });
        $http.get($rootScope.RoutePath + "postill/GetAllChildCategory", { params: params }).then(function (res) {
            $scope.lstItems = [];
            $scope.ParentCategoryId = null;
            if (res.data.length == 0) {
                $scope.LstMainCategory = [];
                $scope.ParentCategoryId = objCategory.id;
                $scope.GetAllItem(objCategory.id);
            } else {
                $scope.LstMainCategory = res.data;
            }
        });
    }

    $scope.Filter = function () {
        if ($scope.SearchModel.SearchText.length > 0) {
            $scope.lstItems = _.filter($scope.lstItems, function (item) {
                item.ItemName = item.ItemName == null ? "" : item.ItemName;
                if (item.ItemName.toLowerCase().indexOf($scope.SearchModel.SearchText.toLowerCase()) != -1 || item.ItemCode.toLowerCase().indexOf($scope.SearchModel.SearchText.toLowerCase()) != -1) {
                    return item;
                }
            })
        } else {
            $scope.GetAllItem($scope.ParentCategoryId);
        }
    }

    $scope.ManageSearchFlg = function (SearchFlg) {
        if (!SearchFlg) {
            $scope.GetAllItem($scope.ParentCategoryId);
        }
        $scope.SearchFlg = SearchFlg;
    }

    $scope.GoToMainCategory = function () {
        $scope.DisplayCategory = [];
        $scope.GetAllParentCategory();
    }

    $scope.ChangeCategory = function (obj, index) {
        if (obj) {
            $scope.DisplayCategory.length = index - 1;
            $scope.GotoChildCategory(obj);
        }

    }

    $scope.GetAllItem = function (CategoryId) {
        var params = {
            CategoryId: CategoryId
        }
        $http.get($rootScope.RoutePath + 'postill/GetAllItemForPosUser', { params: params }).then(function (res) {
            $scope.lstItems = res.data.data;
            var classindex = 1;
            for (var index = 0; index < $scope.lstItems.length; index++) {
                if (classindex <= 3) {
                    $scope.lstItems[index].classname = "userType0" + classindex;
                    classindex++;
                } else {
                    $scope.lstItems[index].classname = "userType04";
                    classindex = 1;
                }
                var objUOM = _.findWhere($scope.lstItems[index].itemuoms, { UOM: $scope.lstItems[index].SalesUOM });
                if (objUOM) {
                    $scope.lstItems[index].DisplayPrice = parseFloat(objUOM.Price).toFixed(2);
                }

                var objCart = _.findWhere($scope.SelectedSalesItem, { ItemCode: $scope.lstItems[index].ItemCode });
                if (objCart) {
                    $scope.lstItems[index].active = true;
                } else {
                    $scope.lstItems[index].active = false;
                }
            }
        });
    };

    $scope.SelectCartItem = function (obj) {
        $('.discountPopup').removeClass('active');
        if (obj.ImageArr.length > 0) {
            $('.itemPopup').addClass('active');
            $scope.ImageModel.Name = obj.ItemName != null && obj.ItemName != '' ? obj.ItemName : obj.ItemCode;
            $scope.ImageModel.ImageUrl = $rootScope.RoutePath + "MediaUploads/ItemUpload/" + obj.ImageArr[0].fileName;
            $scope.ImageModel.Price = obj.Price;
            $scope.ImageModel.UOM = obj.UOM;
        }
        for (var index = 0; index < $scope.SelectedSalesItem.length; index++) {
            $scope.SelectedSalesItem[index].Select = false;
        }
        obj.Select = true;
    }

    $(document).ready(function () {
        setInterval(function () {
            $scope.$apply(function () {
                $scope.CurrentTime = moment().format('DD MMM hh:mm');
            })
        }, 60 * 1000);
    });

    $scope.GetAllTaxCode = function () {
        $http.get($rootScope.RoutePath + 'taxcode/GetAllActiveTaxcode').then(function (res) {
            $scope.lstTaxCode = res.data.data;
        });
    }

    $scope.SelectItem = function (objItem) {

        $('.discountPopup').removeClass('active');
        $('.itemPopup').removeClass('active');
        var findItemExist = _.findWhere($scope.SelectedSalesItem, { ItemCode: objItem.ItemCode });
        if (findItemExist) {
            var alertPopup = $ionicPopup.alert({
                title: '',
                template: 'Item Already Exist',
                cssClass: 'custPop',
                okText: 'Ok',
                okType: 'btn btn-green',
            });
            return
        }
        if (objItem.popupnote) {
            if (objItem.popupnote.showoncepertransaction) {
                var alertPopup = $ionicPopup.alert({
                    title: 'Message',
                    template: objItem.popupnote.message,
                    cssClass: 'custPop',
                    okText: 'Add Item',
                    okType: 'btn btn-green',
                }).then(function (res) {
                    Go();
                })
            }
            else {
                Go();
            }
        }
        else {
            Go();
        }
        function Go() {
            var obj = {
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
                ItemCode: objItem.ItemCode,
                idLocations: $scope.model.idLocations,
                BatchNo: null,
                Descriptions: "",
                UOM: (objItem.SalesUOM).toString(),
                UserUOM: null,
                Qty: 1,
                Price: 0.00,
                DiscountAmount: 0,
                isDiscount: 0,
                TaxCode: objItem.SupplyTaxCode,
                listUOM: objItem.itemuoms,
                Select: false,
                DiscountType: "1",
                MinSalePrice: "",
                MinSalePrice: "",
                LastBalQty: 0,
                LastBatchNo: null,
                LastLocation: null,
                LastItemCode: null,
                LastUOM: null,
                BatchList: [],
                isBatch: false,
                ImageArr: objItem.itemimages,
                LstQtyPrice: objItem.itemqtyprices,
            }
            $scope.ManagePrice(obj);
            $scope.SelectedSalesItem.push(obj);
            AdjustFinalSaleTotal();
            objItem.active = true;
        }
    }

    $scope.ManagePrice = function (o) {
        //Sales UOM Price
        if (o.LstQtyPrice.length && o.LstQtyPrice.length > 0) {
            var objQtyPrice = _.filter(o.LstQtyPrice, function (i) {
                if (o.Qty >= i.MinQty && o.Qty <= i.MaxQty) {
                    return i;
                }
            })
            if (objQtyPrice.length > 0) {
                o.Price = objQtyPrice[0].SalePrice;
            }
            else {
                var objUOM = _.findWhere(o.listUOM, { UOM: o.UOM })
                if (objUOM) {
                    o.Price = objUOM.Price;
                    o.MinSalePrice = objUOM.MinSalePrice;
                    o.MaxSalePrice = objUOM.MaxSalePrice;
                }
            }
        }
        else {
            var objUOM = _.findWhere(o.listUOM, { UOM: o.UOM })
            if (objUOM) {
                o.Price = objUOM.Price;
                o.MinSalePrice = objUOM.MinSalePrice;
                o.MaxSalePrice = objUOM.MaxSalePrice;
            }
        }
        //taxcode
        if (o.TaxCode) {
            var obj = _.findWhere($scope.lstTaxCode, { TaxType: o.TaxCode });
            if (obj) {
                o.TaxRate = obj.TaxRate;
                o.Tax = o.LocalTax = (o.Total * o.TaxRate) / 100;
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


        //price
        if (o.Qty != 0 && o.Qty != "") {
            o.Total = (o.Qty * o.Price) - o.DiscountAmount;
            o.Tax = o.LocalTax = (o.Total * o.TaxRate) / 100;
            o.FinalTotal = o.NetTotal = o.LocalNetTotal = o.Total + o.Tax;
        } else {
            o.Total = 0.00;
            o.FinalTotal = o.NetTotal = o.LocalNetTotal = 0.00;
            o.Tax = 0.00
        }



    }

    $scope.EditItem = function (o) {
        if (o.Qty < 1 && $scope.DisplayTab != 4) {
            o.Qty = 1;
        }
        $scope.ManagePrice(o);
        AdjustFinalSaleTotal();
    }

    function AdjustFinalSaleTotal() {
        if ($scope.SelectedSalesItem.length > 0) {
            $scope.model.Total = 0.00;
            $scope.model.NetTotal = 0.00;
            $scope.model.LocalNetTotal = 0.00;
            $scope.model.FinalTotal = 0.00;
            $scope.model.Tax = 0.00;
            $scope.model.LocalTax = 0.00;

            for (var i = 0; i < $scope.SelectedSalesItem.length; i++) {
                $scope.model.Total = $scope.model.Total + $scope.SelectedSalesItem[i].Total;
                $scope.model.LocalNetTotal = $scope.model.LocalNetTotal + $scope.SelectedSalesItem[i].Total;
                $scope.model.NetTotal = $scope.model.FinalTotal = $scope.model.NetTotal + $scope.SelectedSalesItem[i].NetTotal;
                $scope.model.Tax = $scope.model.LocalTax = $scope.model.Tax + $scope.SelectedSalesItem[i].Tax;
            }
            if ($scope.model.DiscountRate != null && $scope.model.DiscountRate != '' && $scope.model.DiscountRate != undefined) {
                $scope.model.Total = ($scope.model.Total - ($scope.model.Total * $scope.model.DiscountRate) / 100);
                $scope.model.NetTotal = $scope.model.FinalTotal = $scope.model.Total + $scope.model.Tax;
            }

        } else {
            $scope.model.Total = 0.00;
            $scope.model.NetTotal = 0.00;
            $scope.model.LocalNetTotal = 0.00;
            $scope.model.FinalTotal = 0.00;
            $scope.model.Tax = 0.00;
            $scope.model.LocalTax = 0.00;
        }
    }

    $scope.AddQty = function (obj) {


        if ($scope.DisplayTab == 4 && obj.Qty > 0) {
            // Refund Tab
            var isTrue = false;
            for (var i = 0; i < $scope.lstRefund.length; i++) {
                if ($scope.lstRefund[i].ItemCode == obj.ItemCode) {
                    isTrue = true;
                    $scope.lstRefund[i].Qty = $scope.lstRefund[i].Qty - 1;
                    if ($scope.lstRefund[i].Qty == 0) {
                        $scope.lstRefund.splice(i, 1);
                        break;
                    }
                    $scope.lstRefund[i].Amount = $scope.lstRefund[i].Qty * ($scope.lstRefund[i].Price - obj.DiscountPerQty + obj.Tax);
                    $scope.lstRefund[i].Discount = $scope.lstRefund[i].Qty * obj.DiscountPerQty;
                    $scope.lstRefund[i].Tax = $scope.lstRefund[i].Qty * obj.Tax;
                    break;
                }
            }
        }

        obj.Qty++;
        $scope.EditItem(obj);
        $scope.CountRefundAmount($scope.lstRefund);
    }

    $scope.RemoveQty = function (obj) {
        if ($scope.DisplayTab == 4 && obj.Qty > 0) {
            // Refund Tab
            var isTrue = false;
            for (var i = 0; i < $scope.lstRefund.length; i++) {
                if ($scope.lstRefund[i].ItemCode == obj.ItemCode) {
                    isTrue = true;
                    $scope.lstRefund[i].Qty = $scope.lstRefund[i].Qty + 1;
                    $scope.lstRefund[i].Amount = $scope.lstRefund[i].Qty * ($scope.lstRefund[i].Price - obj.DiscountPerQty + obj.Tax);
                    $scope.lstRefund[i].Discount = $scope.lstRefund[i].Qty * obj.DiscountPerQty;
                    $scope.lstRefund[i].Tax = $scope.lstRefund[i].Qty * obj.Tax;
                    break;
                }
            }

            if (!isTrue) {
                var obj1 = {
                    idInvoice: obj.idInvoice,
                    idInvoiceDetail: 0,
                    idUser: $localstorage.get("IsPosUserId") ? parseInt($localstorage.get("IsPosUserId")) : 0,
                    Qty: 1,
                    Price: obj.Price,
                    Amount: obj.Price - obj.DiscountPerQty + obj.Tax,
                    ItemCode: obj.ItemCode,
                    CreatedDate: new Date(),
                    Discount: obj.DiscountPerQty,
                    reason: $scope.RefundModel.reason,
                    Tax: obj.Tax
                }
                $scope.lstRefund.push(obj1);
            }
        }

        if (obj.Qty > 0) {
            obj.Qty = obj.Qty - 1;
            $scope.EditItem(obj);
        }

        $scope.CountRefundAmount($scope.lstRefund);
    }

    $scope.DeleteItem = function (index, o) {
        var confirmPopup = $ionicPopup.confirm({
            title: "",
            template: 'Are you sure you want to delete this item?',
            cssClass: 'custPop',
            cancelText: 'Cancel',
            okText: 'Ok',
            okType: 'btn btn-green',
            cancelType: 'btn btn-red',
        })
        confirmPopup.then(function (res) {
            if (res) {

                $scope.SelectedSalesItem.splice(index, 1);

                AdjustFinalSaleTotal();
                DisplayDiscount();
                setTimeout(function () {
                    $('.itemPopup').removeClass('active');
                    $('.discountPopup').removeClass('active');
                }, 100)
                var objItem = _.findWhere($scope.lstItems, { ItemCode: o.ItemCode });
                if (objItem) {
                    objItem.active = false;
                }
            }
        });
    }



    $scope.deleteWholeOrder = function () {
        var confirmPopup = $ionicPopup.confirm({
            title: "",
            template: 'Are you sure you want to delete this Order?',
            cssClass: 'custPop',
            cancelText: 'Cancel',
            okText: 'Ok',
            okType: 'btn btn-green',
            cancelType: 'btn btn-red',
        })
        confirmPopup.then(function (res) {
            if (res) {
                $scope.init();
            }
        });
    }

    $scope.AddDiscountAmount = function () {
        if (($scope.DiscountModel.Value != null && $scope.DiscountModel.Value != '' && $scope.DiscountModel.Value != 0) || $scope.DiscountModel.Type == 4) {

            if ($scope.DiscountModel.Type == 1) {
                $scope.Discountobj.DiscountAmount = parseFloat($scope.DiscountModel.Value);
                $scope.Discountobj.Total = ($scope.Discountobj.Qty * $scope.Discountobj.Price) - $scope.Discountobj.DiscountAmount;
                $scope.Discountobj.FinalTotal = $scope.Discountobj.NetTotal = $scope.Discountobj.LocalNetTotal = $scope.Discountobj.Total + $scope.Discountobj.Tax;
                $scope.Discountobj.isDiscount = 1;
            } else if ($scope.DiscountModel.Type == 2) {
                var ConvertToamount = (($scope.Discountobj.Qty * $scope.Discountobj.Price) * $scope.DiscountModel.Value) / 100;
                $scope.Discountobj.DiscountAmount = parseFloat(ConvertToamount);
                $scope.Discountobj.Total = ($scope.Discountobj.Qty * $scope.Discountobj.Price) - $scope.Discountobj.DiscountAmount;
                $scope.Discountobj.FinalTotal = $scope.Discountobj.NetTotal = $scope.Discountobj.LocalNetTotal = $scope.Discountobj.Total + $scope.Discountobj.Tax;
                $scope.Discountobj.isDiscount = 1;
            } else if ($scope.DiscountModel.Type == 4) {

                if ($scope.DiscountText == "Wastage") {
                    var ConvertToamount = (($scope.Discountobj.Qty * $scope.Discountobj.Price) * 100) / 100;
                    $scope.ShowDiscount = parseFloat(ConvertToamount);
                    console.log($scope.ShowDiscount)
                } else if ($scope.DiscountText == "Damaged Product") {
                    var ConvertToamount = (($scope.Discountobj.Qty * $scope.Discountobj.Price) * 40) / 100;
                    $scope.ShowDiscount = parseFloat(ConvertToamount);
                } else if ($scope.DiscountText == "Genereal") {

                    var ConvertToamount = (($scope.Discountobj.Qty * $scope.Discountobj.Price) * 10) / 100;
                    $scope.ShowDiscount = parseFloat(ConvertToamount);
                } else {
                    var ConvertToamount = (($scope.Discountobj.Qty * $scope.Discountobj.Price) * 0) / 100;
                    $scope.ShowDiscount = parseFloat(ConvertToamount);
                }
                // $scope.DiscountModel.Value = $scope.Discountobj.DiscountAmount;
                // $scope.Discountobj.Total = ($scope.Discountobj.Qty * $scope.Discountobj.Price) - $scope.Discountobj.DiscountAmount;
                // $scope.Discountobj.FinalTotal = $scope.Discountobj.NetTotal = $scope.Discountobj.LocalNetTotal = $scope.Discountobj.Total + $scope.Discountobj.Tax;
                // $scope.Discountobj.isDiscount = 1;
                // $scope.ShowDiscountAmount();
                return;
            }
            $scope.Discountobj.DiscountType = $scope.DiscountModel.Type;
        } else {
            $scope.Discountobj.DiscountAmount = 0;
            $scope.Discountobj.Total = ($scope.Discountobj.Qty * $scope.Discountobj.Price) - $scope.Discountobj.DiscountAmount;
            $scope.Discountobj.FinalTotal = $scope.Discountobj.NetTotal = $scope.Discountobj.LocalNetTotal = $scope.Discountobj.Total + $scope.Discountobj.Tax;
            $scope.Discountobj.isDiscount = 0;
        }
        DisplayDiscount();
        AdjustFinalSaleTotal();
        $scope.DiscountModel.Value = "";
    }

    $scope.OpenDiscountPopup = function (o, Type) {
        if (o.DiscountType == "2") {
            findAmount = (o.DiscountAmount / (o.Qty * o.Price)) * 100;
            $scope.DiscountModel.Value = findAmount == 0 ? "" : findAmount;
        } else {
            $scope.DiscountModel.Value = o.DiscountAmount == 0 ? "" : o.DiscountAmount;
        }
        $scope.DiscountModel.MinSalePrice = o.MinSalePrice;
        $scope.DiscountModel.MaxSalePrice = o.MaxSalePrice;
        $scope.DiscountModel.Descriptions = o.Descriptions;
        $scope.DiscountModel.Type = $scope.DiscountModel.Type;
        $scope.DiscountModel.displayType = Type;
        $scope.Discountobj = o;
        $scope.AddDiscountAmount();
        setTimeout(function () {
            $('.itemPopup').removeClass('active');
            $('.discountPopup').addClass('active');
        }, 100)
    }

    $scope.AddDisValue = function (value) {
        $scope.DiscountModel.Value = ($scope.DiscountModel.Value).toString() + value;
        // $scope.AddDiscountAmount($scope.DiscountModel.Value);

    }

    $scope.RemoveDisc = function () {
        if ($scope.DiscountModel.Value.toString().length != 0) {
            $scope.DiscountModel.Value = $scope.DiscountModel.Value.toString().substring(0, $scope.DiscountModel.Value.length - 1);
            // $scope.AddDiscountAmount($scope.DiscountModel.Value);
        }
    }

    function DisplayDiscount() {
        var dis = 0;
        for (var index = 0; index < $scope.SelectedSalesItem.length; index++) {
            dis = dis + $scope.SelectedSalesItem[index].DiscountAmount;
        }
        $scope.model.DisplayDiscount = dis;
    }

    $scope.ShowDiscountAmount = function () {
        var dis = 0;
        for (var index = 0; index < $scope.SelectedSalesItem.length; index++) {
            dis = dis + $scope.SelectedSalesItem[index].DiscountAmount;
        }
        $scope.ShowDiscount = dis;
    }

    $scope.DoneDiscount = function () {
        var obj = _.findWhere($scope.SelectedSalesItem, { Select: true });
        // DisplayDiscount();
        if (obj && obj.isDiscount == 0) {
            obj.isDiscount = 1;
            obj.DiscountAmount = $scope.ShowDiscount;
            $scope.model.DisplayDiscount = $scope.model.DisplayDiscount + $scope.ShowDiscount;
            obj.Total = (obj.Qty * obj.Price) - obj.DiscountAmount;
            obj.FinalTotal = obj.NetTotal = obj.LocalNetTotal = obj.Total + obj.Tax;
            AdjustFinalSaleTotal();
        }
    }

    $scope.RemoveDiscountAmount = function () {
        var obj = _.findWhere($scope.SelectedSalesItem, { Select: true });
        if (obj) {
            if (obj.isDiscount == 1 && $scope.model.DisplayDiscount > 0) {
                $scope.model.DisplayDiscount = $scope.model.DisplayDiscount - $scope.ShowDiscount;
            }

            obj.isDiscount = 0;
            obj.DiscountAmount = 0;
            obj.Total = (obj.Qty * obj.Price) - obj.DiscountAmount;
            obj.FinalTotal = obj.NetTotal = obj.LocalNetTotal = obj.Total + obj.Tax;
        }
        // DisplayDiscount();
        AdjustFinalSaleTotal();

    }

    $(".btnClose").click(function () {
        $scope.Discountobj = null;
        $('.discountPopup').removeClass('active');
        $('.itemPopup').removeClass('active');
    });

    //Save Sales

    $scope.OpenPayment = function () {
        if ($scope.SelectedSalesItem.length == 0) {
            var alertPopup = $ionicPopup.alert({
                title: '',
                template: 'You does not have select any item',
                cssClass: 'custPop',
                okText: 'Ok',
                okType: 'btn btn-green',
            });
            return
        }
        _.filter($scope.SelectedSalesItem, function (item) {
            item.Select = false;
        })
        $scope.DisplayTab = 2;
    }

    $scope.Save = function (Status) {
        if ($scope.model.id > 0) {
            $scope.UpdateSale(Status);
        } else {
            $scope.SaveSale(Status);
        }
    }

    $scope.SaveSale = function (Status) {
        if ($scope.SelectedSalesItem.length == 0) {
            var alertPopup = $ionicPopup.alert({
                title: '',
                template: 'You does not have select any item',
                cssClass: 'custPop',
                okText: 'Ok',
                okType: 'btn btn-green',
            });
            return
        }


        if ($scope.model.CustomerPhoneNumber == '' || $scope.model.CustomerPhoneNumber == null || $scope.model.CustomerPhoneNumber == undefined) {
            var alertPopup = $ionicPopup.alert({
                title: '',
                template: 'Please Select Customer',
                cssClass: 'custPop',
                okText: 'Ok',
                okType: 'btn btn-green',
            });
            $scope.OpenOrder = false;

            setTimeout(function () {
                document.querySelector("#Cphone").focus();
            }, 1500);

            return
        } else {
            $scope.model.PhoneNumber = $scope.model.CustomerPhoneNumber;
        }

        var objStatus = _.findWhere($scope.lstStatus, { Status: Status });
        if (objStatus) {
            $scope.model.idStatus = objStatus.id;
        }
        $scope.model.lstInvoiceDetail = $scope.SelectedSalesItem;
        $scope.model.InvoiceDate = moment().format('YYYY-MM-DD');
        $scope.ListMaxSellingPrice = [];
        $scope.ListMinSellingPrice = [];
        _.filter($scope.SelectedSalesItem, function (p) {
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
                    $http.post($rootScope.RoutePath + 'postill/SaveInvoice', $scope.model)
                        .then(function (res) {
                            var ResponseSales = res.data;
                            if (ResponseSales.success) {
                                if (Status != 'Hold') {
                                    var List = [];
                                    for (var l = 0; l < $scope.PaymentBill.length; l++) {
                                        _.filter($scope.PaymentBill[l].ListItem, function (p) {
                                            List.push(p);
                                        })
                                    }
                                    var objBill = {
                                        DocNo: ResponseSales.data,
                                        list: List
                                    }
                                    $http.post($rootScope.RoutePath + 'postill/SavePaymentBills', objBill).then(function (res1) {
                                        if ($scope.lstRefund && $scope.lstRefund.length > 0) {
                                            $http.post($rootScope.RoutePath + 'postill/SaveRefund', $scope.lstRefund).then(function (res2) {
                                                $ionicLoading.show({ template: ResponseSales.message });
                                                setTimeout(function () {
                                                    $ionicLoading.hide()
                                                }, 1000);
                                                $scope.selectCustomer = null
                                                $scope.init();
                                            })
                                        } else {
                                            $ionicLoading.show({ template: ResponseSales.message });
                                            setTimeout(function () {
                                                $ionicLoading.hide()
                                            }, 1000);
                                            $scope.selectCustomer = null
                                            $scope.init();
                                        }
                                    })
                                } else {
                                    $ionicLoading.show({ template: ResponseSales.message });
                                    setTimeout(function () {
                                        $ionicLoading.hide()
                                    }, 1000);
                                    $scope.selectCustomer = null
                                    $scope.init();
                                }
                            } else {
                                $ionicLoading.show({ template: ResponseSales.message });
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
            })
        } else {
            $http.post($rootScope.RoutePath + 'postill/SaveInvoice', $scope.model)
                .then(function (res) {
                    $scope.LatestInvoiceID = res.data.Invoiceid;
                    var ResponseSales = res.data;
                    if (ResponseSales.success) {
                        if (Status != 'Hold' && Status != "Quotation") {
                            var List = [];
                            for (var l = 0; l < $scope.PaymentBill.length; l++) {
                                _.filter($scope.PaymentBill[l].ListItem, function (p) {
                                    List.push(p);
                                })
                            }
                            var objBill = {
                                DocNo: ResponseSales.data,
                                list: List
                            }

                            $http.post($rootScope.RoutePath + 'postill/SavePaymentBills', objBill).then(function (res1) {
                                $scope.LatestInvoiceID = res1.data[0].idInvoice
                                if ($scope.lstRefund && $scope.lstRefund.length > 0) {
                                    $http.post($rootScope.RoutePath + 'postill/SaveRefund', $scope.lstRefund).then(function (res2) {
                                        // console.log(res2)
                                        $ionicLoading.show({ template: ResponseSales.message });
                                        setTimeout(function () {
                                            $ionicLoading.hide()
                                        }, 1000);
                                        $scope.init();
                                    })
                                } else {
                                    $ionicLoading.show({ template: ResponseSales.message });
                                    //popup for print and email
                                    setTimeout(function () {
                                        $ionicLoading.hide()
                                    }, 1000);
                                    $scope.OpenPrintnEmailModal()
                                }
                            })
                        } else {
                            $ionicLoading.show({ template: ResponseSales.message });
                            setTimeout(function () {
                                $ionicLoading.hide()
                            }, 1000);
                            $scope.selectCustomer = null
                            if (Status == "Quotation") {
                                $scope.OpenPrintnEmailModal()
                            } else {
                                $scope.init();
                            }
                        }
                    } else {

                        $ionicLoading.show({ template: ResponseSales.message });
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
        $(document).ready(function () {
            setInterval(function () {
                $scope.$apply(function () {
                    $scope.CurrentTime = moment().format('DD MMM HH:mm');
                })
            }, 60 * 1000);
        });
    };

    $scope.UpdateSale = function (Status) {
        if ($scope.SelectedSalesItem.length == 0) {
            var alertPopup = $ionicPopup.alert({
                title: '',
                template: 'You does not have select any item',
                cssClass: 'custPop',
                okText: 'Ok',
                okType: 'btn btn-green',
            });
            return
        }

        if ($scope.model.CustomerPhoneNumber == '' || $scope.model.CustomerPhoneNumber == null || $scope.model.CustomerPhoneNumber == undefined) {
            var alertPopup = $ionicPopup.alert({
                title: '',
                template: 'Please Select Customer',
                cssClass: 'custPop',
                okText: 'Ok',
                okType: 'btn btn-green',
            });
            $scope.OpenOrder = false;

            setTimeout(function () {
                document.querySelector("#Cphone").focus();
            }, 1500);

            return
        } else {
            $scope.model.PhoneNumber = $scope.model.CustomerPhoneNumber;
        }


        var objStatus = _.findWhere($scope.lstStatus, { Status: Status });
        if (objStatus) {
            $scope.model.idStatus = objStatus.id;
        }
        $scope.model.lstInvoiceDetail = $scope.SelectedSalesItem;
        $scope.model.InvoiceDate = moment().format('YYYY-MM-DD');
        $scope.ListMaxSellingPrice = [];
        $scope.ListMinSellingPrice = [];
        _.filter($scope.SelectedSalesItem, function (p) {
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
                    $http.post($rootScope.RoutePath + 'posetill/SaveInvoice', $scope.model)
                        .then(function (res) {
                            var ResponseSales = res.data;
                            if (ResponseSales.success) {
                                if (Status != 'Hold') {
                                    var List = [];
                                    for (var l = 0; l < $scope.PaymentBill.length; l++) {
                                        _.filter($scope.PaymentBill[l].ListItem, function (p) {
                                            List.push(p);
                                        })
                                    }
                                    var objBill = {
                                        DocNo: ResponseSales.data,
                                        list: List
                                    }
                                    $http.post($rootScope.RoutePath + 'postill/SavePaymentBills', objBill).then(function (res1) {
                                        if ($scope.lstRefund && $scope.lstRefund.length > 0) {
                                            $http.post($rootScope.RoutePath + 'postill/SaveRefund', $scope.lstRefund).then(function (res2) {
                                                $ionicLoading.show({ template: ResponseSales.message });
                                                setTimeout(function () {
                                                    $ionicLoading.hide()
                                                }, 1000);
                                                $scope.selectCustomer = null
                                                $scope.init();
                                            })
                                        } else {
                                            $ionicLoading.show({ template: ResponseSales.message });
                                            setTimeout(function () {
                                                $ionicLoading.hide()
                                            }, 1000);
                                            $scope.selectCustomer = null
                                            $scope.init();
                                        }
                                    })
                                } else {
                                    $ionicLoading.show({ template: ResponseSales.message });
                                    setTimeout(function () {
                                        $ionicLoading.hide()
                                    }, 1000);
                                    $scope.selectCustomer = null
                                    $scope.init();
                                }
                            } else {
                                $ionicLoading.show({ template: ResponseSales.message });
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
            })
        } else {
            $http.post($rootScope.RoutePath + 'invoice/SaveInvoice', $scope.model)
                .then(function (res) {
                    var ResponseSales = res.data;
                    if (ResponseSales.success) {
                        if (Status != 'Hold') {
                            var List = [];
                            for (var l = 0; l < $scope.PaymentBill.length; l++) {
                                _.filter($scope.PaymentBill[l].ListItem, function (p) {
                                    List.push(p);
                                })
                            }
                            var objBill = {
                                DocNo: ResponseSales.data,
                                list: List
                            }

                            $http.post($rootScope.RoutePath + 'postill/SavePaymentBills', objBill).then(function (res1) {
                                if ($scope.lstRefund && $scope.lstRefund.length > 0) {
                                    $http.post($rootScope.RoutePath + 'postill/SaveRefund', $scope.lstRefund).then(function (res2) {
                                        $ionicLoading.show({ template: ResponseSales.message });
                                        setTimeout(function () {
                                            $ionicLoading.hide()
                                        }, 1000);
                                        $scope.init();
                                    })
                                } else {
                                    $ionicLoading.show({ template: ResponseSales.message });
                                    setTimeout(function () {
                                        $ionicLoading.hide()
                                    }, 1000);
                                    $scope.init();
                                }
                            })
                        } else {
                            $ionicLoading.show({ template: ResponseSales.message });
                            setTimeout(function () {
                                $ionicLoading.hide()
                            }, 1000);
                            $scope.selectCustomer = null
                            $scope.init();
                        }
                    } else {

                        $ionicLoading.show({ template: ResponseSales.message });
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
        $(document).ready(function () {
            setInterval(function () {
                $scope.$apply(function () {
                    $scope.CurrentTime = moment().format('DD MMM HH:mm');
                })
            }, 60 * 1000);
        });
    };

    // AddSearchCustomerPopup Start

    $ionicModal.fromTemplateUrl('AddSearchCustomerModel.html', {
        scope: $scope,
        animation: 'slide-in-up'
    }).then(function (modal) {
        $scope.CustomerModal = modal;
    });

    $scope.initCustomerModel = function () {
        $scope.custModel = {
            id: '',
            AccountNumbder: $scope.LastCustomerCode,
            Name: '',
            RegistrationNo: '',
            BillingAddress1: '',
            BillingAddress2: '',
            BillingAddress3: '',
            EmailAddress: '',
            PhoneNumber: '',
            Website: '',
            BiilingPostCode: '',
            DeliveryAddress1: '',
            DeliveryAddress2: '',
            DeliveryAddress3: '',
            DeliveryPostCode: '',
            Attentions: null,
            Note: null,
            PhoneNumbder2: '',
            Currency: '',
            isActive: true,
            idGroup: null,
            idBranch: null,
            idPriceCategory: null,
            idLocations: null,
            CreditTerm: null,
            idCreditTerm: null,
            ReferenceByCode: null,
            idReferenceBy: null,
            idCustomer: null,
            CreditLimit: null,
            ExceedLimitType: "",
            AdminPassword: null,
            SuspendReason: null,
            Remark: null,
            Status: null,
            StatusRemark: null,
            FoundusOn: null,
            isAllowLogin: false,
            password: null,
            ConfirmPassword: null,
            IsDPCommission: 0
        }
    }

    $scope.closeAddSearchCustomerModel = function () {
        $scope.CustomerModal.hide();
    };

    $scope.OpenAddSearchCustomerModel = function () {
        $scope.CustomerModal.show();
        $scope.flgaddCustomer = false;
        $scope.SearchModel.SearchInput = '';
        $scope.GetLastCustomerCode();
        $scope.GetAllActiveCurrency();
        $scope.GetAllCreditTerm();
        $scope.GetAllActiveLocations();
        $scope.GetAllActiveCustomerGroup();
        $scope.GetAllActiveCustomerbranch();
        $scope.GetAllActivePricecategory();


        // $scope.OrderView = _.where($scope.lstRecentSales, { id: id });
        // $scope.RecentOrderView = $scope.OrderView[0]
    };

    $scope.fillTextbox = function (string) {
        $scope.SearchModel.SearchInput = string.Name;
        $scope.LstCustomerDetail = null;
        $scope.model.CustomerName = string.Name;
        $scope.model.CustomerCode = string.AccountNumbder;
        $scope.model.CustomerPhoneNumber = string.PhoneNumber;
        $scope.CustomerModal.hide();
    }

    // $scope.AddCustomerDetails = function (o) {
    //     var obj = _.findWhere($scope.LstCustomerDetail, { SearchInput: o.SearchInput });
    //     o.Name = obj.Name;
    //     o.AccountNumbder = obj.AccountNumbder;
    //     o.EmailAddress = obj.EmailAddress;
    //     o.PhoneNumber = obj.PhoneNumber;
    // }

    $scope.GetAllCustomerForPostill = function () {
        $http.get($rootScope.RoutePath + 'customer/GetAllCustomerForPostill?search=' + $scope.SearchModel.SearchInput).then(function (res) {
            $scope.LstCustomerDetail = res.data;
            if ($scope.SearchModel.SearchInput.length == 0) {
                $scope.LstCustomerDetail = [];
            }
        });
    }

    $scope.SaveCustomer = function (form) {
        if (form.$invalid) {
            $scope.formsubmit = true;
        } else {
            if (!$scope.custModel.id && $scope.custModel.isAllowLogin == true && $scope.custModel.password != $scope.custModel.ConfirmPassword) {
                $ionicLoading.show({
                    template: "Password and Confrim Password Not Same."
                });
                setTimeout(function () {
                    $ionicLoading.hide()
                }, 1000);
                return;
            }
            $scope.formsubmit = false;
            if ($scope.custModel.PhoneNumber == $scope.custModel.PhoneNumbder2) {
                $ionicLoading.show({
                    template: "phone number and alternate phone number are same. "
                });
                setTimeout(function () {
                    $ionicLoading.hide()
                }, 1000);
                return;
            }
            if (!$scope.custModel.id) {
                $scope.custModel.id = 0;
            }
            if (!$scope.custModel.idBranch) {
                $scope.custModel.idBranch = null;
            }
            if (!$scope.custModel.idGroup) {
                $scope.custModel.idGroup = null;
            }
            if (!$scope.custModel.idPriceCategory) {
                $scope.custModel.idPriceCategory = null;
            }
            if (!$scope.custModel.idLocations) {
                $scope.custModel.idLocations = null;
            }

            $http.post($rootScope.RoutePath + 'customer/SaveCustomer', $scope.custModel)
                .then(function (res) {
                    if (res.data.data == 'TOKEN') {
                        $rootScope.logout();
                    }
                    if (res.data.success) {
                        $scope.model.CustomerName = $scope.custModel.Name;
                        $scope.model.CustomerCode = $scope.custModel.AccountNumbder;
                        $scope.model.CustomerPhoneNumber = $scope.custModel.PhoneNumber;

                        if ($scope.ReferenceBy == 1) {
                            if ($scope.custModel.id == '' && $scope.custModel.ReferenceByCode != '' && $scope.custModel.ReferenceByCode != null) {
                                var objSend = {
                                    id: '',
                                    CustomerCode: $scope.custModel.AccountNumbder,
                                    idCustomer: null,
                                    idReferenceBy: null,
                                    ReferenceByCode: $scope.custModel.ReferenceByCode,
                                    ReferenceLevel: $scope.ReferenceLevel,
                                    level: null
                                }

                                $http.post($rootScope.RoutePath + 'customer/SaveReferenceLevel', objSend)
                                    .then(function (res1) {
                                        if (res1.data.data == 'TOKEN') {
                                            $rootScope.logout();
                                        }
                                        if (res1.data.success) {
                                            $ionicScrollDelegate.scrollTop();
                                            $scope.initCustomerModel();
                                            $scope.GetAllCustomer();

                                            $ionicLoading.show({
                                                template: res.data.message
                                            });
                                            setTimeout(function () {
                                                $ionicLoading.hide()
                                                $scope.CustomerModal.hide();
                                            }, 1000);
                                        } else {
                                            $ionicScrollDelegate.scrollTop();
                                            $scope.initCustomerModel();
                                            $scope.GetAllCustomer();

                                            $ionicLoading.show({
                                                template: res1.data.message
                                            });
                                            setTimeout(function () {
                                                $ionicLoading.hide()
                                            }, 1000);
                                        }
                                    })
                            } else {
                                $ionicScrollDelegate.scrollTop();
                                $scope.initCustomerModel();
                                $scope.GetAllCustomer();

                                $ionicLoading.show({
                                    template: res.data.message
                                });
                                setTimeout(function () {
                                    $ionicLoading.hide();
                                    $scope.CustomerModal.hide();
                                }, 1000);
                            }
                        } else {
                            $ionicScrollDelegate.scrollTop();
                            $scope.initCustomerModel();
                            $scope.GetAllCustomer();

                            $ionicLoading.show({
                                template: res.data.message
                            });
                            setTimeout(function () {
                                $ionicLoading.hide();
                                $scope.CustomerModal.hide();
                            }, 1000);
                        }
                    } else {
                        $ionicLoading.show({
                            template: res.data.message
                        });
                        setTimeout(function () {
                            $ionicLoading.hide()
                        }, 1000);
                    }
                })
                .catch(function (err) {
                    $ionicLoading.show({
                        template: 'Unable to save record right now. Please try again later.'
                    });
                    setTimeout(function () {
                        $ionicLoading.hide()
                    }, 1000);
                });
        }
    };

    $scope.GetLastCustomerCode = function () {
        return new Promise(function (resolve, reject) {
            $http.get($rootScope.RoutePath + 'customer/LastCustomerCode').then(function (resCode) {
                if (resCode.data.success) {
                    $scope.LastCustomerCode = resCode.data.LastNumber;
                    $scope.custModel.AccountNumbder = $scope.LastCustomerCode;
                }
                resolve();
            }).catch(function (err) {
                resolve();
            })
        })
    }

    $scope.GetAllActiveCurrency = function () {
        $http.get($rootScope.RoutePath + 'customer/GetAllActiveCurrency').then(function (res) {
            $scope.lstCurrency = res.data.data;
        });
    };

    $scope.GetAllCreditTerm = function () {
        $http.get($rootScope.RoutePath + 'creditterm/GetAllActiveCreditTerm').then(function (res) {
            $scope.LstCreditTerm = res.data.data;
        });
    }

    $scope.GetAllActiveLocations = function () {
        var params = {
            idLocations: $scope.IsAdmin ? "" : $localstorage.get('idLocations')
        }
        $http.get($rootScope.RoutePath + 'customer/GetAllActiveLocations', {
            params: params
        }).then(function (res) {
            $scope.lstLocation = res.data.data;
            setTimeout(function () {
            })
        });
    };

    $scope.GetAllActiveCustomerGroup = function () {
        $http.get($rootScope.RoutePath + 'customer/GetAllActiveCustomergroup').then(function (res) {
            $scope.lstGroup = res.data.data;
        });
    };

    $scope.GetAllActiveCustomerbranch = function () {
        $http.get($rootScope.RoutePath + 'customer/GetAllActiveCustomerbranch').then(function (res) {
            $scope.lstCustBranch = res.data.data;
        });
    };

    $scope.GetAllActivePricecategory = function () {
        $http.get($rootScope.RoutePath + 'customer/GetAllActivePricecategory').then(function (res) {
            $scope.lstPriceCat = res.data.data;
        });
    };

    $scope.ChangeStatus = function () {
        if ($scope.model.Status == 'Solved') {
            $scope.model.StatusRemark = "";
        }
    }

    // AddSearchCustomerPopup End


    //Order Popup Start

    $ionicModal.fromTemplateUrl('AddOrderModel.html', {
        scope: $scope,
        animation: 'slide-in-up'
    }).then(function (modal) {
        $scope.OrderModal = modal;
    });

    $scope.closeOrderrModel = function () {
        $scope.OrderModal.hide();
    };

    $scope.OpenOrderModel = function () {
        $scope.OrderModal.show();
        $scope.SelectedTab = 1;
        $scope.ChangeTab($scope.SelectedTab)
    };

    $scope.GetAllStatus = function () {
        $http.get($rootScope.RoutePath + 'settings/GetAllStatus').then(function (res) {
            $scope.lstStatus = res.data.data;
        });
    };

    $scope.ChangeDisplayTab = function (x) {
        $scope.DisplayTab = x;
        if (x == 3) {
            $scope.PaymentBill = [];
            var No = 0;
            for (var i = 0; i < $scope.SelectedSalesItem.length; i++) {
                No = No + 1;
                var obj = {
                    BillNo: No,
                    Total: 0,
                    ListItem: [],
                    Selected: false
                }
                $scope.PaymentBill.push(obj);
            }
            $scope.PaymentBill[0].Selected = true;
        }
    }

    $scope.ChangeTab = function (number) {
        $scope.SelectedTab = number;
        $scope.idStatusOfSelectedTab = 0;

        for (var i = 0; i < $scope.lstStatus.length; i++) {
            if (number == 1 && $scope.lstStatus[i].Status == "Hold") {
                $scope.idStatusOfSelectedTab = $scope.lstStatus[i].id;
            } else if (number == 3 && $scope.lstStatus[i].Status == "Pending") {
                $scope.idStatusOfSelectedTab = $scope.lstStatus[i].id;
            } else if (number == 4 && $scope.lstStatus[i].Status == "Complete") {
                $scope.idStatusOfSelectedTab = $scope.lstStatus[i].id;
            }
        }

        var params = {
            idStatus: $scope.idStatusOfSelectedTab,
            UserId: parseInt($localstorage.get('IsPosUserId')),
        }

        $http.get($rootScope.RoutePath + 'invoice/GetAllInvoiceByUserId', {
            params: params
        }).then(function (res) {
            $scope.lstStatusWiseorder = res.data.data;
            setTimeout(function () {
            })
        });
    }

    //View Item Detail Popup Start
    $ionicModal.fromTemplateUrl('InvoiceDetails.html', {
        scope: $scope,
        animation: 'slide-in-up',
        enableBackdropDismiss: true
    }).then(function (modal) {
        $scope.InvoiceDetailsModal = modal;
    });

    $scope.closeInvoiceDetailsModal = function () {
        $scope.displayOrderDetail = null
        $scope.InvoiceDetailsModal.hide();
    };

    $scope.OpenModelInvoiceDetails = function (o) {
        $scope.displayOrderDetail = o;
        $scope.InvoiceDetailsModal.show();
        $scope.GetInvoicedetailsByInvoiceId(o.id);
    };

    $scope.GetInvoicedetailsByInvoiceId = function (id) {
        $http.get($rootScope.RoutePath + 'invoicedetails/GetInvoicedetailsByInvoiceId?id=' + id).then(function (res) {
            $scope.LstInvoiceDetail = res.data.data;
            // console.log("Detail Invoice ", $scope.LstInvoiceDetail)
        });
    }

    $scope.$on('$destroy', function () {
        $scope.InvoiceDetailsModal.remove();
    });
    //View Item Detail Popup End

    //Delete Hold Item Start
    $scope.DeleteInvoice = function (id) {
        // console.log(id)
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
            // console.log(res)
            if (res) {
                var params = {
                    id: id
                };
                $http.get($rootScope.RoutePath + 'invoice/DeleteInvoice', {
                    params: params
                }).success(function (data) {
                    if (data.success == true) {
                        $scope.ChangeTab($scope.SelectedTab);
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
    //Delete Hold Item End

    //Refund Completed Item Start
    $scope.RefundInvoice = function (id) {

        $scope.OrderModal.hide();
        var selectedItem = _.findWhere($scope.lstStatusWiseorder, { id: parseInt(id) });

        for (var prop in $scope.model) {
            $scope.model[prop] = selectedItem[prop];
            if (prop == 'idLocations') {
                $scope.model['idLocations'] = $localstorage.get('DefaultLocationPOSTill');
            }
            if (prop == 'InvoiceDate') {
                $scope.model['InvoiceDate'] = moment(selectedItem[prop]).format('DD-MM-YYYY');
            }
            if (prop == 'ModifiedBy') {
                $scope.model['ModifiedBy'] = parseInt($localstorage.get("IsPosUserId"));
            }

            if ((prop == 'Weight' || prop == 'WeightAmount' || prop == 'Freight' || prop == 'FreightAmount') && selectedItem.invoiceadvancedetail_new) {
                $scope.model[prop] = selectedItem.invoiceadvancedetail_new[prop];
            }

            if (prop == 'CustomerPhoneNumber') {
                $scope.model[prop] = _.findWhere($scope.LstCustomer, { AccountNumbder: selectedItem.CustomerCode }).PhoneNumber;
            }
        }
        $scope.SelectedSalesItem = selectedItem.invoicedetails;

        if ($scope.SelectedSalesItem.length > 0) {
            for (var i = 0; i < $scope.SelectedSalesItem.length; i++) {
                $scope.SelectedSalesItem[i].Select = false;
                if ($scope.SelectedSalesItem[i].TaxCode) {
                    var obj = _.findWhere($scope.lstTaxCode, { TaxType: $scope.SelectedSalesItem[i].TaxCode });
                    if (obj) {
                        $scope.SelectedSalesItem[i].TaxRate = obj.TaxRate;
                    }
                }

                if ($scope.SelectedSalesItem[i].isDiscount) {
                    $scope.SelectedSalesItem[i].DiscountPerQty = $scope.SelectedSalesItem[i].DiscountAmount / $scope.SelectedSalesItem[i].Qty;
                    $scope.model.DisplayDiscount = ($scope.model.DisplayDiscount ? $scope.model.DisplayDiscount : 0) + $scope.SelectedSalesItem[i].DiscountAmount;
                } else {
                    $scope.SelectedSalesItem[i].DiscountPerQty = 0;
                }

                var objItem1 = _.findWhere($scope.lstItems, { ItemCode: $scope.SelectedSalesItem[i].ItemCode });
                if (objItem1) {
                    $scope.SelectedSalesItem[i].listUOM = objItem1.itemuoms;
                    $scope.SelectedSalesItem[i].ImageArr = objItem1.itemimages;
                    $scope.SelectedSalesItem[i].LstQtyPrice = objItem1.itemqtyprices;
                    if (objItem1.isBatch == 1) {
                        $scope.SelectedSalesItem[i].isBatch = true;
                        $scope.SelectedSalesItem[i].BatchList = objItem1.itembatches;
                    } else {
                        $scope.SelectedSalesItem[i].isBatch = false;
                        $scope.SelectedSalesItem[i].BatchList = objItem1.itembatches;
                    }
                } else {
                    $scope.SelectedSalesItem[i].listUOM = [];
                    $scope.SelectedSalesItem[i].ImageArr = [];
                    $scope.SelectedSalesItem[i].LstQtyPrice = [];
                }

                $scope.SelectedSalesItem[i].LastBalQty = $scope.SelectedSalesItem[i].Qty;
                $scope.SelectedSalesItem[i].LastBatchNo = $scope.SelectedSalesItem[i].BatchNo;
                $scope.SelectedSalesItem[i].LastLocation = $scope.SelectedSalesItem[i].idLocations;
                $scope.SelectedSalesItem[i].LastItemCode = $scope.SelectedSalesItem[i].ItemCode;
                $scope.SelectedSalesItem[i].LastUOM = $scope.SelectedSalesItem[i].UOM;
            }

            $scope.DisplayTab = 4;
            $scope.RefundInvoice.idInvoice = id;
        }

        // var confirmPopup = $ionicPopup.confirm({
        //     title: "",
        //     template: 'Are you sure you want to update this record?',
        //     cssClass: 'custPop',
        //     cancelText: 'Cancel',
        //     okText: 'Ok',
        //     okType: 'btn btn-green',
        //     cancelType: 'btn btn-red',
        // })
        // confirmPopup.then(function (res) {
        //     if (res) {
        //         var params = {
        //             id: id
        //         };
        //         $http.get($rootScope.RoutePath + 'invoice/DeleteInvoice', {
        //             params: params
        //         }).success(function (data) {
        //             if (data.success == true) {
        //                 $scope.ChangeTab($scope.SelectedTab);
        //             }
        //             $ionicLoading.show({ template: data.message });
        //             setTimeout(function () {
        //                 $ionicLoading.hide()
        //             }, 1000);
        //         }).catch(function (err) {
        //             $ionicLoading.show({ template: 'Unable to delete record right now. Please try again later.' });
        //             setTimeout(function () {
        //                 $ionicLoading.hide()
        //             }, 1000);
        //         });
        //     }
        // });
    }
    //Refund Completed Item Start

    $scope.UpdateSalesStatus = function (id, Status) {
        var confirmPopup = $ionicPopup.confirm({
            title: "",
            template: 'Are you sure you want to update this record?',
            cssClass: 'custPop',
            cancelText: 'Cancel',
            okText: 'Ok',
            okType: 'btn btn-green',
            cancelType: 'btn btn-red',
        })
        confirmPopup.then(function (res) {
            // console.log(res)
            if (res) {
                var objStatus = _.findWhere($scope.lstStatus, { Status: Status });
                if (objStatus) {
                    var params = {
                        idInvoice: id,
                        idStatus: objStatus.id,
                        Status: objStatus.Status,
                        CreatedBy: $localstorage.get('IsPosUserName')
                    };
                    $http.get($rootScope.RoutePath + 'postill/UpdateSalesStatus', {
                        params: params
                    }).success(function (data) {
                        if (data.success == true) {
                            $scope.ChangeTab($scope.SelectedTab);
                        }
                        $ionicLoading.show({ template: data.message });
                        setTimeout(function () {
                            $ionicLoading.hide()
                        }, 1000);
                    }).catch(function (err) {
                        $ionicLoading.show({ template: 'Unable to update record right now. Please try again later.' });
                        setTimeout(function () {
                            $ionicLoading.hide()
                        }, 1000);
                    });
                } else {
                    $ionicLoading.show({ template: 'No Status Found.' });
                    setTimeout(function () {
                        $ionicLoading.hide()
                    }, 1000);
                }
            }
        })
    }
    //Order Popup end


    //Copy Model Start
    $scope.CopyToModel = function (id) {
        // console.log($scope.lstStatusWiseorder)
        $scope.OrderModal.hide();
        var selectedItem = _.findWhere($scope.lstStatusWiseorder, { id: parseInt(id) });

        for (var prop in $scope.model) {
            $scope.model[prop] = selectedItem[prop];
            if (prop == 'idLocations') {
                $scope.model['idLocations'] = $localstorage.get('DefaultLocationPOSTill');
            }
            if (prop == 'InvoiceDate') {
                $scope.model['InvoiceDate'] = moment(selectedItem[prop]).format('DD-MM-YYYY');
            }
            if (prop == 'ModifiedBy') {
                $scope.model['ModifiedBy'] = parseInt($localstorage.get("IsPosUserId"));
            }

            if ((prop == 'Weight' || prop == 'WeightAmount' || prop == 'Freight' || prop == 'FreightAmount') && selectedItem.invoiceadvancedetail_new) {
                $scope.model[prop] = selectedItem.invoiceadvancedetail_new[prop];
            }

            // if (prop == 'CustomerPhoneNumber') {
            //     $scope.model[prop] = _.findWhere($scope.LstCustomer, { AccountNumbder: selectedItem.CustomerCode }).PhoneNumber;
            // }
        }
        $scope.SelectedSalesItem = selectedItem.invoicedetails;


        if ($scope.SelectedSalesItem.length > 0) {
            for (var i = 0; i < $scope.SelectedSalesItem.length; i++) {
                $scope.SelectedSalesItem[i].Select = false;
                if ($scope.SelectedSalesItem[i].TaxCode) {
                    var obj = _.findWhere($scope.lstTaxCode, { TaxType: $scope.SelectedSalesItem[i].TaxCode });
                    if (obj) {
                        $scope.SelectedSalesItem[i].TaxRate = obj.TaxRate;
                    }
                }

                // if ($scope.SelectedSalesItem[i].idLocations) {
                //     var obj1 = _.findWhere($scope.lstLocations, { id: parseInt($scope.SelectedSalesItem[i].idLocations) });
                //     $scope.SelectedSalesItem[i].idLocations = ($scope.SelectedSalesItem[i].idLocations).toString();
                //     if (obj1) {
                //         $scope.SelectedSalesItem[i].DisplayLocation = obj1.Name;
                //     }
                // }

                var objItem1 = _.findWhere($scope.lstItems, { ItemCode: $scope.SelectedSalesItem[i].ItemCode });
                if (objItem1) {
                    $scope.SelectedSalesItem[i].listUOM = objItem1.itemuoms;
                    $scope.SelectedSalesItem[i].ImageArr = objItem1.itemimages;
                    $scope.SelectedSalesItem[i].LstQtyPrice = objItem1.itemqtyprices;
                    if (objItem1.isBatch == 1) {
                        $scope.SelectedSalesItem[i].isBatch = true;
                        $scope.SelectedSalesItem[i].BatchList = objItem1.itembatches;
                    } else {
                        $scope.SelectedSalesItem[i].isBatch = false;
                        $scope.SelectedSalesItem[i].BatchList = objItem1.itembatches;
                    }
                } else {
                    $scope.SelectedSalesItem[i].listUOM = [];
                    $scope.SelectedSalesItem[i].ImageArr = [];
                    $scope.SelectedSalesItem[i].LstQtyPrice = [];
                }

                $scope.SelectedSalesItem[i].LastBalQty = $scope.SelectedSalesItem[i].Qty;
                $scope.SelectedSalesItem[i].LastBatchNo = $scope.SelectedSalesItem[i].BatchNo;
                $scope.SelectedSalesItem[i].LastLocation = $scope.SelectedSalesItem[i].idLocations;
                $scope.SelectedSalesItem[i].LastItemCode = $scope.SelectedSalesItem[i].ItemCode;
                $scope.SelectedSalesItem[i].LastUOM = $scope.SelectedSalesItem[i].UOM;
            }
        }

        // Get Remain Amount to pay By Anil
        var params = {
            idInvoice: parseInt(id)
        }
        // return
        $http.get($rootScope.RoutePath + 'invoice/GetInvoiceRemainAmountByInvoiceId', {
            params: params
        }).then(function (res) {
            $scope.lstRemainAmount = res.data.data;
            var RemainAmount = selectedItem.FinalTotal;

            for (var i = 0; i < $scope.lstRemainAmount.length; i++) {
                RemainAmount -= $scope.lstRemainAmount[i].Paid;
            }
            $scope.model.RemainAmount = RemainAmount;
        });

    };

    $scope.GetAllCustomer = function () {
        $http.get($rootScope.RoutePath + 'customer/GetAllCustomerForPostill').then(function (res) {
            $scope.LstCustomer = res.data;
        });
    }

    //Copy Model End

    //Payment Button Screen Start
    $scope.SetFloatValue = function (value) {
        $scope.FloatModel.amount = $scope.FloatModel.amount + "" + value;
        if ($scope.DisplayTab == 4) {
            $scope.RefundModel.Amount = $scope.FloatModel.amount;
        }
    }

    $scope.ClearFloatValue = function () {
        if ($scope.FloatModel.amount.length != 0) {
            $scope.FloatModel.amount = $scope.FloatModel.amount.substring(0, $scope.FloatModel.amount.length - 1);
        }
    }
    //Payment Button Screen End

    //PaymentBill Start
    $scope.AddBill = function () {
        var No = $scope.PaymentBill[$scope.PaymentBill.length - 1].No;
        _.filter($scope.PaymentBill, function (item) {
            item.Selected = false;
        })
        var obj = {
            BillNo: No,
            Total: 0,
            ListItem: [],
            Selected: true
        }
        $scope.PaymentBill.push(obj);
    }

    $scope.AddPaymentItem = function (o) {
        var obj = _.findWhere($scope.PaymentBill, { Selected: true });
        if (obj) {
            var Item = _.findWhere(obj.ListItem, { ItemCode: o.ItemCode });
            if (Item) {
                Item.Qty = Item.Qty + 1;
                Item.Unpaid = Item.Qty * Item.Price;
                obj.Total = Item.Qty * Item.Price;
            } else {
                var objPay = {
                    BillNo: obj.BillNo,
                    ItemCode: o.ItemCode,
                    idInvoice: o.idInvoice,
                    idInvoiceDetail: o.id,
                    Qty: 1,
                    Price: o.Price,
                    Unpaid: 1 * o.Price,
                    Paid: 0
                }
                obj.Total = 1 * o.Price;
                obj.ListItem.push(objPay);
            }
        }
    }

    $scope.SaveBill = function (status, o) {
        if (status == 'split') {
            var obj = _.findWhere($scope.PaymentBill, { BillNo: o });
            _.filter(obj.ListItem, function (item) {
                item.Paid = item.Qty * item.Price;
                item.Unpaid = 0;
            })
            $scope.Save('Pending');
        } else {
            var obj = {
                BillNo: 1,
                Total: 0,
                ListItem: [],
                Selected: true
            }
            $scope.PaymentBill.push(obj);
            for (var i = 0; i < $scope.SelectedSalesItem.length; i++) {
                var objPay = {
                    BillNo: 1,
                    ItemCode: $scope.SelectedSalesItem[i].ItemCode,
                    idInvoice: $scope.SelectedSalesItem[i].idInvoice,
                    idInvoiceDetail: $scope.SelectedSalesItem[i].id,
                    Qty: $scope.SelectedSalesItem[i].Qty,
                    Price: $scope.SelectedSalesItem[i].Price,
                    Unpaid: ($scope.SelectedSalesItem[i].Qty * $scope.SelectedSalesItem[i].Price) - parseFloat($scope.FloatModel.amount),
                    Paid: parseFloat($scope.FloatModel.amount)
                }
                $scope.PaymentBill[0].ListItem.push(objPay);
            }
            $scope.Save('Pending');
        }

    }

    $scope.RefundBill = function () {
        var confirmPopup = $ionicPopup.confirm({
            title: "",
            template: 'Are you sure you want to give refund?',
            cssClass: 'custPop',
            cancelText: 'Cancel',
            okText: 'Ok',
            okType: 'btn btn-green',
            cancelType: 'btn btn-red',
        })
        confirmPopup.then(function (res) {
            if (res) {
                _.filter($scope.lstRefund, function (item) {
                    item.reason = $scope.RefundModel.reason;
                })
                $scope.Save('Complete');
            }
        })
    }

    $scope.CountRefundAmount = function (lst) {
        var RefundAmount = 0;
        var RefundDiscount = 0;
        var RefundTax = 0;
        for (var i = 0; i < lst.length; i++) {
            RefundAmount += lst[i].Amount;
            RefundDiscount += lst[i].Discount;
            RefundTax += lst[i].Tax;
        }
        $scope.RefundModel.Amount = RefundAmount;
        $scope.RefundModel.DisplayDiscount = RefundDiscount;
        $scope.RefundModel.DisplayTax = RefundTax;
    }

    $scope.ChangeSelectBillCard = function (o) {
        _.filter($scope.PaymentBill, function (item) {
            item.Selected = false;
        });
        o.Selected = true;
    }
    //PaymentBill End

    //Print Order Start

    $scope.PrintOrder = function (Id) {
        // console.log(Id)
        window.open($rootScope.RoutePath + "invoice/GenerateInvoice?Id=" + Id, '_blank');
        $scope.init()
    }

    $scope.ManagePettyCash = function (type) {
        if ($scope.FloatModel.amount == null || $scope.FloatModel.amount == 0 || $scope.FloatModel.amount == "undefined") {
            $ionicLoading.show({ template: "Please Add some Amount." });
            setTimeout(function () {
                $ionicLoading.hide()
            }, 1000);
            return
        }
        var params = {
            id: 0,
            idUser: parseInt($localstorage.get("IsPosUserId")),
            amount: parseFloat($scope.FloatModel.amount),
            type: type,
            isCredit: type == "Credit" ? 1 : 0,
            reason: $scope.FloatModel.reason
        };
        $http.post($rootScope.RoutePath + 'floatcash/SaveFloatCash', params)
            .then(function (res) {
                $ionicLoading.show({ template: res.data.message });
                setTimeout(function () {
                    $ionicLoading.hide()
                }, 1000);

                if (res.data.success) {
                    $scope.FloatModel = {
                        amount: '',
                        reason: ''
                    }

                } else {
                    // else
                }
            }).catch(function (err) {
                $ionicLoading.show({ template: 'Unable to save record right now. Please try again later.' });
                setTimeout(function () {
                    $ionicLoading.hide()
                }, 1000);
            });

    };

    $scope.ManageFloatCash = function (type) {
        if ($scope.FloatModel.amount == null || $scope.FloatModel.amount == 0 || $scope.FloatModel.amount == "undefined") {
            $ionicLoading.show({ template: "Please Add some Amount." });
            setTimeout(function () {
                $ionicLoading.hide()
            }, 1000);
            return
        }
        var params = {
            id: 0,
            idUser: parseInt($localstorage.get("IsPosUserId")),
            amount: parseFloat($scope.FloatModel.amount),
            type: 'float',
            isCredit: type == "Credit" ? 1 : 0,
            reason: $scope.FloatModel.reason
        };
        $http.post($rootScope.RoutePath + 'floatcash/SaveFloatCash', params)
            .then(function (res) {
                $ionicLoading.show({ template: res.data.message });
                setTimeout(function () {
                    $ionicLoading.hide()
                }, 1000);

                if (res.data.success) {
                    $scope.FloatModel = {
                        amount: '',
                        reason: ''
                    }

                } else {
                    // else
                }
            }).catch(function (err) {
                $ionicLoading.show({ template: 'Unable to save record right now. Please try again later.' });
                setTimeout(function () {
                    $ionicLoading.hide()
                }, 1000);
            });

    };

    $scope.ChangeDiscountTab = function (x) {
        $scope.DiscountTab = x;
    }

    $scope.ManageDiscountType = function (x, type) {
        $scope.DiscountTab = x;
        $scope.DiscountText = type;
    }

    $scope.ChangeDiscountType = function (x) {
        $scope.DiscountModel.Type = x;
        $scope.AddDiscountAmount();
    }

    //Print Order End

    // popup for print and email Start
    $ionicModal.fromTemplateUrl('PrintnEmailModal.html', {
        scope: $scope,
        animation: 'slide-in-up',
        enableBackdropDismiss: true

    }).then(function (modal) {
        $scope.PrintnEmailModal = modal;
    });

    $scope.closePrintnEmailModal = function () {
        $scope.PrintnEmailModal.hide();
        $scope.init();

    };

    $scope.OpenPrintnEmailModal = function () {
        $scope.PrintnEmailModal.show();

    };



    // popup for print and email Start

    $scope.init();
}).directive('numbersOnly1', function () {
    return {
        require: 'ngModel',
        link: function (scope, element, attr, ngModelCtrl) {
            function fromUser(text) {
                if (text) {
                    // console.log(text)
                    var transformedInput = text.replace(/[^\+\^0-9]/g, '');
                    // console.log(transformedInput)
                    if (transformedInput !== text) {
                        ngModelCtrl.$setViewValue(transformedInput);
                        ngModelCtrl.$render();
                    }
                    return transformedInput;
                }
                return '';
            }
            ngModelCtrl.$parsers.push(fromUser);
        }
    };
})