app.controller('PurchasePayment', function ($scope, $http, $rootScope, $ionicLoading, $ionicPopup, $localstorage, $compile, $ionicScrollDelegate) {

    $scope.init = function () {
        setTimeout(() => {
            $("#mytext").focus();
        }, 1000);
        $scope.modelAdvanceSearch = null;

        $scope.GetAllCurrency();
        $scope.GetAllPaymentMethod();
        $scope.ResetModel();
        $scope.SelectedTab = 1;
        $rootScope.BackButton = $scope.IsList = true;
        setTimeout(function () {
            InitDataTable();
        });
        $ionicScrollDelegate.scrollTop();
        $scope.CurrentCustomerGroup = $localstorage.get('CustomerGroup')
        if ($scope.CurrentCustomerGroup == "Genmed") {
            $scope.Type = "Supplier"
            $scope.FlagLocation = true
            $scope.FlagDisc = true
            $scope.FlagTax = true
        } else {
            $scope.Type = ''
        }
        $scope.GetAllCustomer();
    }

    // $scope.GetAllCustomer = function () {
    //     // var params = {
    //     //     CreatedBy: $scope.IsAdmin ? '' : parseInt($localstorage.get('UserId')),
    //     // }
    //     $http.get($rootScope.RoutePath + 'customer/GetAllSupplier?Type=' + $scope.Type).then(function (res) {
    //         $scope.lstCustomer = res.data.data;
    //     });
    // };
    $scope.GetAllCustomer = function () {
        var params = {
            CustomerGroup: $localstorage.get('CustomerGroup'),
            CreatedBy: $scope.IsAdmin ? '' : parseInt($localstorage.get('UserId')),
            LoginUserCode: $localstorage.get('UserCode'),
        }
        $http.get($rootScope.RoutePath + 'customer/GetAllCustomerAdvance', { params: params }).then(function (res) {
            $scope.lstCustomer = res.data.data;
        });
    }

    $scope.GetAllCurrency = function () {
        $http.get($rootScope.RoutePath + 'currency/GetAllCurrency').then(function (res) {
            $scope.lstCurrency = res.data.data;
            $scope.model.CurrencyCode = $scope.lstCurrency[0].CurrencyCode;
            $scope.TotalRecord = $scope.lstCurrency.length;
        })
    }

    $scope.GetAllPaymentMethod = function () {
        $http.get($rootScope.RoutePath + 'paymentmethod/GetAllPaymentMethod').then(function (res) {
            $scope.lstPaymentMethod = res.data.data;
        })
    }

    $scope.GetAllUnPayAPInvoiceByCustomerCode = function () {
        $scope.lstKnockOff = [];
        $http.get($rootScope.RoutePath + 'purchasepayment/GetAllUnPayAPInvoiceByCustomerCode?CustomerCode=' + $scope.model.CustomerCode).then(function (res) {
            $scope.lstPurchase = res.data.data;
            if ($scope.lstPurchase.length > 0) {
                for (var i = 0; i < $scope.lstPurchase.length; i++) {
                    var obj = new Object();
                    obj.id = 0;
                    obj.IdAPPayment = null;
                    obj.KnockOffDocType = 'PB';
                    obj.KnockOffDate = null;
                    obj.Amount = 0.00;
                    obj.DiscountAmount = 0.00;
                    obj.IsDiscount = false;
                    obj.idPurchase = $scope.lstPurchase[i].id;
                    obj.Total = $scope.lstPurchase[i].NetTotal;
                    obj.Outstanding = $scope.lstPurchase[i].Outstanding;
                    obj.DocNo = $scope.lstPurchase[i].DocNo;
                    obj.PurchaseDate = moment($scope.lstPurchase[i].PurchaseDate).format('DD-MM-YYYY');
                    obj.IsSelected = false;
                    obj.KnockOffDetail = [];

                    for (var j = 0; j < $scope.lstPurchase[i].purchasedetails.length; j++) {
                        var obj1 = {
                            id: 0,
                            IdAPPaymentKnockOff: null,
                            Amount: $scope.lstPurchase[i].purchasedetails[j].NetTotal,
                            LocalPaymentAmount: $scope.lstPurchase[i].purchasedetails[j].NetTotal,
                            LocalInvoiceAmount: $scope.lstPurchase[i].purchasedetails[j].NetTotal
                        };
                        obj.KnockOffDetail.push(obj1);
                    }
                    $scope.lstKnockOff.push(obj);
                }
            }
        })
    }

    $scope.SelectCustomer = function () {
        var obj = _.findWhere($scope.lstCustomer, { AccountNumbder: $scope.model.CustomerCode });
        $scope.model.CustomerCurrency = obj.Currency;
        // $scope.model.CurrencyCode = obj.CurrencyCode;
        $scope.model.PaidBy = obj.Name;
        $scope.GetAllUnPayAPInvoiceByCustomerCode();
    }

    $scope.ChangePaymentAmount = function (o) {

        var MainAmount = 0;
        _.filter($scope.lstSelectedPaymentMain, function (q) {
            if (q.PaymentAmount) {
                MainAmount = MainAmount + parseFloat(q.PaymentAmount);
            }
        });
        $scope.model.PaymentAmount = MainAmount;
        $scope.model.LocalPaymentAmount = MainAmount;
        $scope.model.KnockOffAmount = MainAmount;
        o.CustomerPaymentAmount = MainAmount;
        o.LocalPaymentAmount = MainAmount;
        AdjustAmount();
    }

    $scope.SelectKnockOff = function (o) {
        $scope.model.Description = null;
        _.filter($scope.lstKnockOff, function (p) {
            if (p.IsSelected == true) {
                if ($scope.model.Description == null) {
                    $scope.model.Description = p.DocNo;
                } else {
                    $scope.model.Description = $scope.model.Description + " & " + p.DocNo;
                }
            }
        });

        var IsRCHQReceive = _.findWhere($scope.lstSelectedPaymentMain, { IsRCHQ: true });

        if (o.IsSelected == true) {
            o.Amount = o.Total;
            o.KnockOffDate = moment().format('DD-MM-YYYY');
            if (IsRCHQReceive) {
                o.Outstanding = o.Total;
            } else {
                o.Outstanding = 0;
            }
        } else {
            o.Amount = 0.00;
            o.Outstanding = o.Total;
            o.KnockOffDate = null;
        }

        AdjustAmount();
    }

    $scope.SelectRCHQ = function (o) {
        if (o.IsRCHQ == true) {
            o.RCHQDate = moment().format('DD-MM-YYYY');
        } else {
            o.RCHQDate = null;
        }

        AdjustAmount();
    }

    function AdjustAmount() {
        var SUM = 0;
        _.filter($scope.lstKnockOff, function (p) {
            if (p.IsSelected == true) {
                SUM = SUM + parseFloat(p.Total);
            }
        });

        var obj = _.findWhere($scope.lstSelectedPaymentMain, { IsRCHQ: true });
        if (obj) {
            $scope.model.LocalUnappliedAmount = SUM;
            _.filter($scope.lstSelectedPaymentMain, function (q) {
                if (q.IsRCHQ == false) {
                    $scope.model.LocalUnappliedAmount = $scope.model.LocalUnappliedAmount - parseFloat(q.PaymentAmount);
                }
            })

            _.filter($scope.lstKnockOff, function (m) {
                if (m.IsSelected == true) {
                    m.Outstanding = m.Total;
                }
            });
        } else {
            $scope.model.LocalUnappliedAmount = parseFloat($scope.model.PaymentAmount) - SUM;
            _.filter($scope.lstKnockOff, function (m) {
                if (m.IsSelected == true) {
                    m.Outstanding = 0;
                }
            });
        }
    }

    $scope.ChangeTab = function (number) {
        $scope.SelectedTab = number;
    }

    $scope.Add = function () {
        $scope.formsubmit = false;
        $rootScope.BackButton = $scope.IsList = false;
    }

    $scope.FilterData = function () {
        $('#APPaymentTable').dataTable().api().ajax.reload();
    }

    $scope.EnableFilterOption = function () {
        $(function () {
            $(".CustFilter").slideToggle();
        });
    };

    $scope.FilterAdvanceData = function (o) {
        $scope.modelAdvanceSearch = o;
        $('#APPaymentTable').dataTable().api().ajax.reload();
    }

    // Use more distinguished and understandable naming
    $scope.CopyToModel = function (id) {
        var selectedItem = _.findWhere($scope.lstdata, { id: parseInt(id) });
        $rootScope.BackButton = $scope.IsList = false;

        for (var prop in $scope.model) {
            $scope.model[prop] = selectedItem[prop];

            if (prop == 'DocDate') {
                $scope.model['DocDate'] = moment(selectedItem[prop]).format('DD-MM-YYYY');
            }
            if (prop == 'ModifiedBy') {
                $scope.model['ModifiedBy'] = parseInt($localstorage.get('UserId'));
            }
        }

        var obj = _.findWhere($scope.lstCustomer, { AccountNumbder: $scope.model.CustomerCode });
        $scope.model.CustomerCurrency = obj.Currency;
        $scope.model.PaidBy = obj.Name;
        $scope.GetAllUnPayAPInvoiceByCustomerCode();

        $scope.lstSelectedPaymentMain = _.filter(selectedItem.ap_paymentdetails, function (q) {
            if (q.IsRCHQ) {
                q.IsRCHQ = true;
                q.RCHQDate = moment(q.RCHQDate).format('DD-MM-YYYY');
            }
            return q;
        });

        var List = selectedItem.ap_payment_knockoffs;

        $http.get($rootScope.RoutePath + 'purchasepayment/GetAllPurchaseByPatientId?id=' + $scope.model.id).then(function (res) {
            _.filter(List, function (n) {
                var obj = new Object();
                obj.id = n.id;
                obj.IdAPPayment = n.IdAPPayment;
                obj.KnockOffDocType = n.KnockOffDocType;
                obj.KnockOffDate = moment(n.KnockOffDate).format('DD-MM-YYYY');
                obj.Amount = n.Amount;
                obj.DiscountAmount = n.DiscountAmount;
                obj.IsDiscount = n.IsDiscount;
                obj.idPurchase = n.idPurchase;
                obj.IsSelected = true;
                obj.KnockOffDetail = n.ap_payment_knockoffdetails;
                var obj1 = _.findWhere(res.data, { id: parseInt(n.idPurchase) });
                obj.Total = obj1.NetTotal;
                obj.Outstanding = obj1.Outstanding;
                obj.DocNo = obj1.DocNo;
                obj.PurchaseDate = moment(obj1.PurchaseDate).format('DD-MM-YYYY');
                obj.APInvoiceDate = moment(obj1.APInvoiceDate).format('DD-MM-YYYY');

                $scope.lstKnockOff.push(obj);
            })
        })
    };

    //Set Table
    function InitDataTable() {
        if ($.fn.DataTable.isDataTable('#APPaymentTable')) {
            $('#APPaymentTable').DataTable().destroy();
        }
        $('#APPaymentTable').DataTable({
            "processing": true,
            "dom": 'rt<"bottom"<"left"<"length"l><"info"i>><"right"<"pagination"p>>>',
            "serverSide": true,
            "responsive": true,
            "aaSorting": [2, 'DESC'],
            "ajax": {
                url: $rootScope.RoutePath + 'purchaseinvoicepayment/GetAllAPPaymentDynamic',
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
                { "data": "DocDate", "defaultContent": "N/A" },
                { "data": "CustomerCode", "defaultContent": "N/A" },
                { "data": "Description", "defaultContent": "N/A" },
                { "data": "PaymentAmount", "defaultContent": "N/A" },
                { "data": "KnockOffAmount", "defaultContent": "N/A" },
                { "data": "Note", "defaultContent": "N/A" },
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
                "targets": [5, 6],
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

                "targets": 4
            }, {
                "render": function (data, type, row) {
                    var Action = '<div layout="row" layout-align="center center">';
                    Action += '<a ng-click="CopyToModel(' + row.id + ')" class="btnAction btnAction-edit" style="cursor:pointer"><i class="ion-edit" title="Edit"></i></a>&nbsp;';
                    Action += '<a ng-click="DeleteItem(' + row.id + ')" class="btnAction btnAction-error" style="cursor:pointer"><i class="ion-trash-a" title="Delete"></i></a>';
                    Action += '</div>';
                    return Action;
                },
                "targets": 8
            }
            ]
        });
    }

    $scope.formsubmit = false;
    $scope.SaveAPPayment = function (form) {
        var FixedPoint = JSON.parse($rootScope.Dynamicfraction);

        if (form.$invalid) {
            $scope.formsubmit = true;
        } else {
            var NoPaymentMethod = _.findWhere($scope.lstSelectedPaymentMain, { PaymentMethod: null });
            if (NoPaymentMethod) {
                var alertPopup = $ionicPopup.alert({
                    title: '',
                    template: 'Payment method missing.First select payment method for all items in list.',
                    cssClass: 'custPop',
                    okText: 'Ok',
                    okType: 'btn btn-green',
                });
            } else {
                var NoAmount = _.filter($scope.lstSelectedPaymentMain, function (p) {
                    if (p.PaymentAmount == null || p.PaymentAmount == '' || PaymentAmount == 0) {
                        return p;
                    }
                });

                if (NoAmount != '') {
                    var alertPopup = $ionicPopup.alert({
                        title: '',
                        template: 'Payment amount must be grater than zero for all items in list.',
                        cssClass: 'custPop',
                        okText: 'Ok',
                        okType: 'btn btn-green',
                    });
                } else {
                    //var IsListEmpty = _.findWhere($scope.lstKnockOff, { IsSelected: true });
                    // if (!IsListEmpty) {
                    //     var alertPopup = $ionicPopup.alert({
                    //         title: '',
                    //         template: 'Select at least one knockoff invoice.',
                    //         cssClass: 'custPop',
                    //         okText: 'Ok',
                    //         okType: 'btn btn-green',
                    //     });
                    // } else {
                    var SUM = 0;
                    _.filter($scope.lstKnockOff, function (p) {
                        if (p.IsSelected == true) {
                            SUM = SUM + parseFloat(p.Total);
                        }
                    });
                    // if (Number(($scope.model.LocalPaymentAmount).toFixed(parseInt(FixedPoint.ToFixed))) < Number((SUM).toFixed(parseInt(FixedPoint.ToFixed)))) {
                    //     var alertPopup = $ionicPopup.alert({
                    //         title: '',
                    //         template: 'Knockoff amount > Payment amount. Please change the payment amount.',
                    //         cssClass: 'custPop',
                    //         okText: 'Ok',
                    //         okType: 'btn btn-green',
                    //     });
                    //     return;
                    // }
                    // if (Number(($scope.model.LocalPaymentAmount).toFixed(parseInt(FixedPoint.ToFixed))) > Number((SUM).toFixed(parseInt(FixedPoint.ToFixed)))) {
                    //     var alertPopup = $ionicPopup.alert({
                    //         title: '',
                    //         template: 'Knockoff amount < Payment amount. Please change the payment amount.',
                    //         cssClass: 'custPop',
                    //         okText: 'Ok',
                    //         okType: 'btn btn-green',
                    //     });
                    //     return;
                    // } else {
                    SavePayment();
                    // }
                    // }
                }
            }

            function SavePayment() {

                if (!$scope.model.id) {
                    $scope.model.id = 0;
                }

                if (new Date($scope.model.DocDate) == 'Invalid Date') {
                    $scope.model.DocDate = moment().set({ 'date': $scope.model.DocDate.split('-')[0], 'month': $scope.model.DocDate.split('-')[1] - 1, 'year': $scope.model.DocDate.split('-')[2] }).format('YYYY-MM-DD');
                } else {
                    if (moment($scope.model.DocDate, "DD-MM-YYYY").format('YYYY-MM-DD') == 'Invalid date') {
                        $scope.model.DocDate = moment($scope.model.DocDate).format('YYYY-MM-DD');
                    } else {
                        $scope.model.DocDate = moment($scope.model.DocDate, "DD-MM-YYYY").format('YYYY-MM-DD');
                    }
                }

                _.filter($scope.lstKnockOff, function (item) {
                    if (item.IsSelected == true) {
                        if (new Date(item.KnockOffDate) == 'Invalid Date') {
                            item.KnockOffDate = moment().set({ 'date': item.KnockOffDate.split('-')[0], 'month': item.KnockOffDate.split('-')[1] - 1, 'year': item.KnockOffDate.split('-')[2] }).format('YYYY-MM-DD');
                        } else {
                            if (moment(item.KnockOffDate, "DD-MM-YYYY").format('YYYY-MM-DD') == 'Invalid date') {
                                item.KnockOffDate = moment(item.KnockOffDate).format('YYYY-MM-DD');
                            } else {
                                item.KnockOffDate = moment(item.KnockOffDate, "DD-MM-YYYY").format('YYYY-MM-DD');
                            }
                        }
                    }
                })

                _.filter($scope.lstSelectedPaymentMain, function (v) {
                    if (v.IsRCHQ) {
                        if (new Date(v.RCHQDate) == 'Invalid Date') {
                            v.RCHQDate = moment().set({ 'date': v.RCHQDate.split('-')[0], 'month': v.RCHQDate.split('-')[1] - 1, 'year': v.RCHQDate.split('-')[2] }).format('YYYY-MM-DD');
                        } else {
                            if (moment(v.RCHQDate, "DD-MM-YYYY").format('YYYY-MM-DD') == 'Invalid date') {
                                v.RCHQDate = moment(v.RCHQDate).format('YYYY-MM-DD');
                            } else {
                                v.RCHQDate = moment(v.RCHQDate, "DD-MM-YYYY").format('YYYY-MM-DD');
                            }
                        }
                    }
                })
                var List = _.where($scope.lstKnockOff, { IsSelected: true });

                var obj = {
                    PaymentObj: $scope.model,
                    PaymentDetailList: $scope.lstSelectedPaymentMain,
                    KnockoffList: List
                }
                $rootScope.ShowLoader();
                $http.post($rootScope.RoutePath + 'purchasepayment/SavePurchasePayment', obj).then(function (res) {
                    if (res.data.success) {
                        $ionicLoading.show({ template: res.data.message });
                        setTimeout(function () {
                            $ionicLoading.hide()
                        }, 1000);
                        $scope.init();
                    } else {
                        $ionicLoading.show({ template: res.data.message });
                        setTimeout(function () {
                            $ionicLoading.hide()
                        }, 1000);
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
                $http.get($rootScope.RoutePath + 'purchaseinvoicepayment/DeleteAPPayment', {
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

    //Add payment in list
    $scope.AddPaymentMainList = function () {
        if ($scope.lstSelectedPaymentMain.length > 0 && $scope.lstSelectedPaymentMain[$scope.lstSelectedPaymentMain.length - 1].PaymentMethod == null) {
            $ionicLoading.show({ template: "Select payment method and fill data" });
            setTimeout(function () {
                $ionicLoading.hide()
            }, 1000);
            return;
        } else {
            _.filter($scope.lstSelectedPaymentMain, function (item) {
                item.IsEdit = false;
            });

            $scope.PaymentMainModel = {
                id: 0,
                IdAPPayment: null,
                PaymentMethod: null,
                PaymentBy: null,
                ChequeNo: null,
                PaymentAmount: 0.00,
                CustomerPaymentAmount: 0.00,
                LocalPaymentAmount: 0.00,
                IsRCHQ: 0,
                RCHQDate: null,
                BankChargeTaxType: null,
                BankChargeTaxRate: 0.00,
                BankChargeTax: 0.00,
                BankChargeTaxRefNo: null,
                BankCharge: 0.00
            }

            $scope.lstSelectedPaymentMain.push($scope.PaymentMainModel);
            $scope.WorkingPaymentMain = $scope.PaymentMainModel;
        }
    }

    $scope.RemovePurchaseInvoiceMainItemInList = function (index) {
        $scope.lstSelectedPaymentMain.splice(index, 1);

        var MainAmount = 0;
        _.filter($scope.lstSelectedPaymentMain, function (q) {
            MainAmount = MainAmount + parseFloat(q.PaymentAmount);
        });

        $scope.model.PaymentAmount = MainAmount;
        $scope.model.LocalPaymentAmount = MainAmount;
        $scope.model.KnockOffAmount = MainAmount;

        if ($scope.lstSelectedPaymentMain.length == 0) {
            $scope.AddPaymentMainList();
        } else {
            $scope.WorkingPaymentMain = $scope.lstSelectedPaymentMain[$scope.lstSelectedPaymentMain.length - 1];
        }

        AdjustAmount();
    }

    $scope.ResetModel = function () {
        $scope.model = {
            id: 0,
            DocNo: '',
            DocDate: moment().format('DD-MM-YYYY'),
            CustomerCode: '',
            CustomerName: '',
            CurrencyCode: null,
            Description: null,
            BranchCode: null,
            PaymentAmount: 0.00,
            LocalPaymentAmount: 0.00,
            KnockOffAmount: 0.00,
            LocalUnappliedAmount: 0.00,
            RefundAmount: 0.00,
            Cancelled: 0,
            Note: null,
            SourceKey: null,
            SourceType: "Payment",
            CustomerCurrency: null,
            PaidBy: null,
            CreatedBy: parseInt($localstorage.get('UserId')),
            CreatedDate: null,
            ModifiedBy: null,
            ModifiedDate: null,
            LoginUserCode: $localstorage.get('UserCode')
        };
        $scope.Searchmodel = {
            Search: '',
        }

        $scope.lstSelectedPaymentMain = [];
        $scope.lstKnockOff = [];
        $scope.AddPaymentMainList();
        $scope.IsSave = false;
    };

    // Alias
    $rootScope.ResetAll = $scope.init;

    $scope.init();
})