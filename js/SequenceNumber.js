app.controller('SequenceNumberController', function ($scope, $rootScope, $http, $ionicPopup, $ionicLoading, $compile, $localstorage, $state) {
    $rootScope.BackButton = true;
    $scope.init = function () {
        $scope.initModel();
        $scope.GetAllSequenceSetting();
    }

    $scope.initModel = function () {
        $scope.model = {
            id: 0,
            UserCodeValue: null,
            PurchaseCodeValue: null,
            SalesCodeValue: null,
            CustomerRegNoValue: null,
            PurchaseReturnCodeValue: null,
            SalesReturnCodeValue: null,
            UOMCodeValue: null,
            QuotationCodeValue: null,
            InvoiceCodeValue: null,
        };
    }

    $scope.GetAllSequenceSetting = function () {
        $http.get($rootScope.RoutePath + "settings/GetAllSequenceSetting").success(function (data) {
            $scope.lstSequenceSetting = data.data
            if (data.success == true) {
                if (data.data.length > 0) {
                    var UserNo = _.findWhere($scope.lstSequenceSetting, {
                        Type: 'User Number'
                    });

                    if (UserNo != undefined) {
                        // $scope.model.ClaimNo = Claim.Type;
                        $scope.model.UserCodeValue = UserNo.value;
                    } else {
                        // $scope.model.ClaimNo = "Claim Number";
                        $scope.model.UserCodeValue = "";
                    }

                    var PurchaseNo = _.findWhere($scope.lstSequenceSetting, {
                        Type: 'Purchase Number'
                    });

                    if (PurchaseNo != undefined) {
                        $scope.model.PurchaseCodeValue = PurchaseNo.value;
                    } else {
                        // $scope.model.ClaimNo = "Claim Number";
                        $scope.model.PurchaseCodeValue = "";
                    }

                    var SalesNo = _.findWhere($scope.lstSequenceSetting, {
                        Type: 'Sales Number'
                    });

                    if (SalesNo != undefined) {
                        // $scope.model.ClaimNo = Claim.Type;
                        $scope.model.SalesCodeValue = SalesNo.value;
                    } else {
                        // $scope.model.ClaimNo = "Claim Number";
                        $scope.model.SalesCodeValue = "";
                    }

                    var CustomerRegNo = _.findWhere($scope.lstSequenceSetting, {
                        Type: 'Customer Reg Number'
                    });
                    if (CustomerRegNo != undefined) {
                        $scope.model.CustomerRegNoValue = CustomerRegNo.value;
                    } else {
                        $scope.model.CustomerRegNoValue = "";
                    }

                    var PurchaseReturnNo = _.findWhere($scope.lstSequenceSetting, {
                        Type: 'Purchase Return Number'
                    });

                    if (PurchaseReturnNo != undefined) {
                        $scope.model.PurchaseReturnCodeValue = PurchaseReturnNo.value;
                    } else {
                        $scope.model.PurchaseReturnCodeValue = "";
                    }

                    var SalesReturnNo = _.findWhere($scope.lstSequenceSetting, {
                        Type: 'Sales Return Number'
                    });

                    if (SalesReturnNo != undefined) {
                        $scope.model.SalesReturnCodeValue = SalesReturnNo.value;
                    } else {
                        $scope.model.SalesReturnCodeValue = "";
                    }

                    var UOMNo = _.findWhere($scope.lstSequenceSetting, {
                        Type: 'UOM Number'
                    });

                    if (UOMNo != undefined) {
                        $scope.model.UOMCodeValue = UOMNo.value;
                    } else {
                        $scope.model.UOMCodeValue = "";
                    }
                    var Quotation = _.findWhere($scope.lstSequenceSetting, {
                        Type: 'Quotation Number'
                    });

                    if (Quotation != undefined) {
                        $scope.model.QuotationCodeValue = Quotation.value;
                    } else {
                        $scope.model.QuotationCodeValue = "";
                    }

                    var InvoiceCode = _.findWhere($scope.lstSequenceSetting, {
                        Type: 'Invoice Number'
                    });

                    if (InvoiceCode != undefined) {
                        $scope.model.InvoiceCodeValue = InvoiceCode.value;
                    } else {
                        $scope.model.InvoiceCodeValue = "";
                    }

                } else {
                    $scope.initModel();
                }
            } else {
                $scope.initModel();
            }
        })
    }

    $scope.formsubmit = false;
    $scope.CreateSequencenumber = function (form, o) {
        if (form.$invalid) {
            $scope.formsubmit = true;
        } else {
            var list = [];
            if (o.UserCodeValue != undefined) {
                var obj = new Object();
                obj.Type = "User Number";
                obj.Value = o.UserCodeValue;
                list.push(obj);
            } else {
                var obj = new Object();
                obj.Type = 'User Number';
                obj.Value = '';
                list.push(obj);
            }

            if (o.PurchaseCodeValue != undefined) {
                var obj1 = new Object();
                obj1.Type = 'Purchase Number';
                obj1.Value = o.PurchaseCodeValue;
                list.push(obj1);
            } else {
                var obj = new Object();
                obj.Type = 'Purchase Number';
                obj.Value = '';
                list.push(obj);
            }

            if (o.SalesCodeValue != undefined) {
                var obj1 = new Object();
                obj1.Type = 'Sales Number';
                obj1.Value = o.SalesCodeValue;
                list.push(obj1);
            } else {
                var obj = new Object();
                obj.Type = 'Sales Number';
                obj.Value = '';
                list.push(obj);
            }

            if (o.CustomerRegNoValue != undefined) {
                var obj1 = new Object();
                obj1.Type = 'Customer Reg Number';
                obj1.Value = o.CustomerRegNoValue;
                list.push(obj1);
            } else {
                var obj = new Object();
                obj.Type = 'Customer Reg Number';
                obj.Value = '';
                list.push(obj);
            }

            if (o.PurchaseReturnCodeValue != undefined) {
                var obj1 = new Object();
                obj1.Type = 'Purchase Return Number';
                obj1.Value = o.PurchaseReturnCodeValue;
                list.push(obj1);
            } else {
                var obj = new Object();
                obj.Type = 'Purchase Return Number';
                obj.Value = '';
                list.push(obj);
            }

            if (o.SalesReturnCodeValue != undefined) {
                var obj1 = new Object();
                obj1.Type = 'Sales Return Number';
                obj1.Value = o.SalesReturnCodeValue;
                list.push(obj1);
            } else {
                var obj = new Object();
                obj.Type = 'Sales Return Number';
                obj.Value = '';
                list.push(obj);
            }

            if (o.UOMCodeValue != undefined) {
                var obj1 = new Object();
                obj1.Type = 'UOM Number';
                obj1.Value = o.UOMCodeValue;
                list.push(obj1);
            } else {
                var obj = new Object();
                obj.Type = 'UOM Number';
                obj.Value = '';
                list.push(obj);
            }

            if (o.QuotationCodeValue != undefined) {
                var obj1 = new Object();
                obj1.Type = 'Quotation Number';
                obj1.Value = o.QuotationCodeValue;
                list.push(obj1);
            } else {
                var obj = new Object();
                obj.Type = 'Quotation Number';
                obj.Value = '';
                list.push(obj);
            }

            if (o.InvoiceCodeValue != undefined) {
                var obj1 = new Object();
                obj1.Type = 'Invoice Number';
                obj1.Value = o.InvoiceCodeValue;
                list.push(obj1);
            } else {
                var obj = new Object();
                obj.Type = 'Invoice Number';
                obj.Value = '';
                list.push(obj);
            }

            $scope.create(list);
        }
    }

    $scope.ResetNumber = function (Type) {
        if (Type == "User Number") {
            lastsequenceNumber = 0;
        } else if (Type == "Purchase Number") {
            lastsequenceNumber = 0;
        } else if (Type == "Sales Number") {
            lastsequenceNumber = 0;
        } else if (Type == "Customer Reg Number") {
            lastsequenceNumber = 0;
        } else if (Type == "Purchase Return Number") {
            lastsequenceNumber = 0;
        } else if (Type == "Sales Return Number") {
            lastsequenceNumber = 0;
        } else if (Type == "UOM Number") {
            lastsequenceNumber = 0;
        } else if (Type == "Quotation Number") {
            lastsequenceNumber = 0;
        } else if (Type == "Invoice Number") {
            lastsequenceNumber = 0;
        }
        var params = {
            Type: Type,
            lastsequenceNumber: lastsequenceNumber
        }
        $http.get($rootScope.RoutePath + "settings/ResetSeqNumberSetting", { params: params }).success(function (data) {
            if (data.success == true) {
                $scope.GetAllSequenceSetting();
                $ionicLoading.show({ template: data.message });
                setTimeout(function () {
                    $ionicLoading.hide()
                }, 1000);
            } else {
                $ionicLoading.show({ template: data.message });
                setTimeout(function () {
                    $ionicLoading.hide()
                }, 1000);
            }
        })
    }

    $scope.create = function (list) {
        $rootScope.ShowLoader();
        $http.post($rootScope.RoutePath + "settings/SaveSequenceSetting", list).then(function (data) {
            $scope.formsubmit = false;
            if (data.data.success == true) {

                $ionicLoading.show({ template: data.data.message });
                setTimeout(function () {
                    $ionicLoading.hide()
                }, 1000);
                // $mdToast.show(
                //     $mdToast.simple()
                //         .textContent(data.data.message)
                //         .position('top right')
                //         .hideDelay(3000)
                // );
                $scope.GetAllSequenceSetting();
            } else {
                if (data.data.data == 'TOKEN') {
                    $rootScope.logout();
                } else {
                    $ionicLoading.show({ template: data.data.message });
                    setTimeout(function () {
                        $ionicLoading.hide()
                    }, 1000);
                    // $mdToast.show(
                    //     $mdToast.simple()
                    //         .textContent(data.data.message)
                    //         .position('top right')
                    //         .hideDelay(3000)
                    // );
                }
            }
        });
    }

    $scope.init();
})