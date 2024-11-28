app.controller('SupplierController', function ($scope, $compile, $rootScope, $http, $localstorage, $ionicPopup, $state, $ionicLoading, $ionicScrollDelegate) {
    var LastCustomerCode = '';
    $scope.init = function () {
        setTimeout(() => {
            $("#mytext").focus();
        }, 1000);
        ManageRole();
        GetLastCustomerCode().then(function () {
            $scope.ResetModel();
            $scope.GetAllActiveCustomerGroup();
            $scope.ReferenceBy = null;
            $scope.ReferenceLevel = null;
            $rootScope.BackButton = $scope.IsList = true;
            $scope.isValidMobile = false;
            $scope.isValidMobile2 = false;
            $scope.GetAllSetting();
            $scope.IsEdit = false;
            $scope.IsDebitCreditControll = false;
        });
    };

    function GetLastCustomerCode() {
        return new Promise(function (resolve, reject) {
            $http.get($rootScope.RoutePath + 'customer/LastCustomerCode').then(function (resCode) {
                if (resCode.data.success) {
                    LastCustomerCode = resCode.data.LastNumber;
                }
                resolve();
            }).catch(function (err) {
                resolve();
            })
        })
    }

    function ManageRole() {
        var AdminUser = _.filter(JSON.parse($localstorage.get('UserRoles')), function (Role) {
            return Role == "Admin";
        })
        $scope.IsAdmin = AdminUser.length && AdminUser.length > 0 ? true : false;
        var CustomerUser = _.filter(JSON.parse($localstorage.get('UserRoles')), function (Role) {
            return Role == "Customer";
        })
        $scope.IsCustomer = CustomerUser.length && CustomerUser.length > 0 ? true : false;
    }

    $scope.GetAllActiveCustomerGroup = function () {
        $http.get($rootScope.RoutePath + 'customer/GetAllActiveCustomergroup').then(function (res) {
            $scope.lstGroup = res.data.data;
            $scope.GetAllActiveCustomerbranch();
        });
    };

    $scope.GetAllActiveCustomerbranch = function () {
        $http.get($rootScope.RoutePath + 'customer/GetAllActiveCustomerbranch').then(function (res) {
            $scope.lstCustBranch = res.data.data;
            $scope.GetAllActivePricecategory();
        });
    };

    $scope.GetAllActivePricecategory = function () {
        $http.get($rootScope.RoutePath + 'customer/GetAllActivePricecategory').then(function (res) {
            $scope.lstPriceCat = res.data.data;
            $scope.GetAllActiveCurrency();
        });
    };

    $scope.GetAllActiveCurrency = function () {
        $http.get($rootScope.RoutePath + 'customer/GetAllActiveCurrency').then(function (res) {
            $scope.lstCurrency = res.data.data;
            $scope.GetAllCreditTerm();
        });
    };

    $scope.GetAllCreditTerm = function () {
        $http.get($rootScope.RoutePath + 'creditterm/GetAllActiveCreditTerm').then(function (res) {
            $scope.LstCreditTerm = res.data.data;
            $scope.GetAllActiveLocations();
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
                InitDataTable();
            })
        });
    };

    $scope.GetAllSetting = function () {
        $http.get($rootScope.RoutePath + "setting/GetAllSetting").success(function (response) {
            var objReferenceBy = _.findWhere(response, { Name: "ReferenceBy" });
            if (objReferenceBy != null && objReferenceBy != undefined && objReferenceBy != '') {
                $scope.ReferenceBy = parseInt(objReferenceBy.Value);
            }

            var objReferenceLevel = _.findWhere(response, { Name: "ReferenceLevel" });
            if (objReferenceLevel != null && objReferenceLevel != undefined && objReferenceLevel != '') {
                $scope.ReferenceLevel = parseInt(objReferenceLevel.Value);
            }

            var objMLM = _.findWhere(response, { Name: "IsMLM" });
            if (objMLM != null && objMLM != undefined && objMLM != '') {
                $scope.IsMLM = parseInt(objMLM.Value);
            }
        })
    }

    $scope.FilterData = function () {
        $('#SupplierTable').dataTable().api().ajax.reload();

    }

    function InitDataTable() {
        $('#SupplierTable').DataTable({
            "processing": true,
            "dom": 'rt<"bottom"<"left"<"length"l><"info"i>><"right"<"pagination"p>>>',
            "serverSide": true,
            "responsive": true,
            "aaSorting": [1, 'ASC'],
            "ajax": {
                url: $rootScope.RoutePath + 'customer/GetAllDynamicSupplier',
                data: function (d) {
                    if ($scope.Searchmodel.Search != undefined) {
                        d.search = $scope.Searchmodel.Search;
                    }
                    // d.RefCustUserId = $scope.IsCustomer ? $localstorage.get('UserId') : '';
                    d.idLocations = $scope.IsAdmin ? "" : '';
                    // d.idLocations = $scope.IsAdmin ? "" : $localstorage.get('idLocations') != '' && $localstorage.get('idLocations') != null && $localstorage.get('idLocations') != undefined ? $localstorage.get('idLocations') : '';
                    return d;
                },
                type: "get",
                dataSrc: function (json) {
                    if (json.success != false) {
                        $scope.lstdata = json.data;
                        console.log($scope.lstdata);

                        return json.data;
                    } else {
                        return [];
                    }
                },
            },
            "createdRow": function (row, data, dataIndex) {
                $compile(angular.element(row).contents())($scope);
            },
            "columns": [{
                "data": null,
                "sortable": false
            },
            {
                "data": "Name",
                "defaultContent": "N/A"
            },
            {
                "data": "AccountNumbder",
                "defaultContent": "N/A"
            },
            {
                "data": "RegistrationNo",
                "defaultContent": "N/A"
            },
            {
                "data": "BillingAddress1",
                "defaultContent": "N/A"
            },
            {
                "data": "PhoneNumber",
                "defaultContent": "N/A"
            },
            {
                "data": "EmailAddress",
                "defaultContent": "N/A"
            },
            {
                "data": "DeliveryAddress1",
                "defaultContent": "N/A"
            },
            {
                "data": "isActive",
                "defaultContent": "N/A"
            },
            {
                "data": "GroupName",
                "defaultContent": "N/A"
            },
            {
                "data": "Branch",
                "defaultContent": "N/A"
            },
            {
                "data": "PriceCategory",
                "defaultContent": "N/A"
            },
            {
                "data": "Location",
                "defaultContent": "N/A"
            },
            {
                "data": "orderstatus",
            },
            {
                "data": null,
                "sortable": false,
            },
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
                    Action += '<a ng-click="CopyToModel(' + row.id + ')" class="btnAction btnAction-edit" style="cursor:pointer"><i class="ion-edit" title="Edit"></i></a>';
                    Action += '<a ng-click="DeleteCustomer(' + row.id + ')" class="btnAction btnAction-error" style="cursor:pointer"><i class="ion-trash-a" title="Delete"></i></a>';
                    Action += '</div>';
                    return Action;
                },
                "targets": 14
            },
            {
                "render": function (data, type, row) {
                    if (row.BillingAddress1 == '' || row.BillingAddress1 == null || row.BillingAddress2 == '' || row.BillingAddress2 == null || row.BillingAddress3 == '' || row.BillingAddress3 == null) {
                        return "N/A";
                    }
                    var Action = '<div layout="row" >';

                    var BillingAddress1 = row.BillingAddress1;
                    if (row.BillingAddress1.length > 25) {
                        BillingAddress1 = row.BillingAddress1.substr(0, 25) + "…";
                    }
                    Action += '<span>' + BillingAddress1 + '</span><br>';
                    if (row.BillingAddress2 != '' && row.BillingAddress2 != null) {
                        var BillingAddress2 = row.BillingAddress1;
                        if (row.BillingAddress2.length > 25) {
                            BillingAddress2 = row.BillingAddress2.substr(0, 25) + "…";
                        }
                        Action += '<span>' + BillingAddress2 + '</span><br>';
                    }
                    if (row.BillingAddress3 != '' && row.BillingAddress3 != null) {
                        var BillingAddress3 = row.BillingAddress1;
                        if (row.BillingAddress3.length > 25) {
                            BillingAddress3 = row.BillingAddress3.substr(0, 25) + "…";
                        }
                        Action += '<span>' + BillingAddress3 + '</span><br>';
                    }
                    if (row.BiilingPostCode != '' && row.BiilingPostCode != null) {
                        Action += '<span><b>PostCode:</b>' + row.BiilingPostCode + '</span>';
                    }
                    Action += '</div>';
                    // Action = Action.substr(0, 50) + '…';
                    return Action;
                },
                "targets": 4,
            },
            {
                "render": function (data, type, row) {
                    if (row.DeliveryAddress1 == '' || row.DeliveryAddress1 == null || row.DeliveryAddress2 == '' || row.DeliveryAddress2 == null || row.DeliveryAddress3 == '' || row.DeliveryAddress3 == null) {
                        return "N/A";
                    }
                    var Action = '<div layout="row">';
                    var DeliveryAddress1 = row.DeliveryAddress1;
                    if (row.DeliveryAddress1.length > 25) {
                        DeliveryAddress1 = row.DeliveryAddress1.substr(0, 25) + "…";
                    }
                    Action += '<span>' + DeliveryAddress1 + '</span><br>';
                    if (row.DeliveryAddress2 != '' && row.DeliveryAddress2 != null) {
                        var DeliveryAddress2 = row.DeliveryAddress2;
                        if (row.DeliveryAddress2.length > 25) {
                            DeliveryAddress2 = DeliveryAddress2.substr(0, 25) + "…";
                        }
                        Action += '<span>' + DeliveryAddress2 + '</span><br>';
                    }
                    if (row.DeliveryAddress3 != '' && row.DeliveryAddress3 != null) {
                        var DeliveryAddress3 = row.DeliveryAddress3;
                        if (row.DeliveryAddress3.length > 25) {
                            DeliveryAddress3 = row.DeliveryAddress3.substr(0, 25) + "…";
                        }
                        Action += '<span>' + DeliveryAddress3 + '</span><br>';
                    }
                    if (row.DeliveryPostCode != '' && row.DeliveryPostCode != null) {
                        Action += '<span><b>PostCode:</b>' + row.DeliveryPostCode + '</span>';
                    }
                    Action += '</div>';
                    return Action;
                },
                "targets": 7
            },
            {
                "render": function (data, type, row) {
                    var Action = '<div layout="row" layout-align="center center">';
                    if (data) {
                        Action += '<span style="font-size: 20px;color: green">✔</span>';
                    } else {
                        Action += ' <span style="font-size: 20px;color: red">✖</span>';
                    }
                    Action += '</div>';
                    return Action;
                },
                "targets": 8
            },
            {
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

                "targets": 11
            },
            {
                "render": function (data, type, row) {
                    if (data != '' && data != null && data != undefined) {
                        return '<span style="padding: 5px 8px 5px 8px;background: #3d55b8;color: #fff;">' + data + '</span>';
                    }
                    return "";
                },
                "responsivePriority": 0,
                "targets": 13
            },
            ]
        });
    }

    $scope.ValidateMobileNumber = function () {
        if (!$("#PhoneNumber").intlTelInput("isValidNumber")) {
            $scope.isValidMobile = true
        } else {
            $scope.isValidMobile = false
        }
    }

    $scope.ValidateMobileNumber2 = function () {
        if (!$("#PhoneNumbder2").intlTelInput("isValidNumber")) {
            $scope.isValidMobile2 = true
            if ($scope.model.PhoneNumbder2.toString().length <= 2) {
                $scope.isValidMobile2 = false
            }
        } else {
            $scope.isValidMobile2 = false
        }
    }

    $scope.formsubmit = false
    $scope.SaveCustomer = function (form) {
        if (form.$invalid) {
            $scope.formsubmit = true;
        } else {
            if (!$scope.model.id && $scope.model.isAllowLogin == true && $scope.model.password != $scope.model.ConfirmPassword) {
                $ionicLoading.show({
                    template: "Password and Confrim Password Not Same."
                });
                setTimeout(function () {
                    $ionicLoading.hide()
                }, 1000);
                return;
            }
            $scope.formsubmit = false;
            if ($scope.model.PhoneNumber == $scope.model.PhoneNumbder2) {
                $ionicLoading.show({
                    template: "phone number and alternate phone number are same. "
                });
                setTimeout(function () {
                    $ionicLoading.hide()
                }, 1000);
                return;
            }
            if (!$scope.model.id) {
                $scope.model.id = 0;
            }
            if (!$scope.model.idBranch) {
                $scope.model.idBranch = null;
            }
            if (!$scope.model.idGroup) {
                $scope.model.idGroup = null;
            }
            if (!$scope.model.idPriceCategory) {
                $scope.model.idPriceCategory = null;
            }
            if (!$scope.model.idLocations) {
                $scope.model.idLocations = null;
            }

            $rootScope.ShowLoader();

            $http.post($rootScope.RoutePath + 'customer/SaveSupplier', $scope.model)
                .then(function (res) {
                    if (res.data.data == 'TOKEN') {
                        $rootScope.logout();
                    }
                    if (res.data.success) {
                        if ($scope.ReferenceBy == 1) {
                            if ($scope.model.id == '' && $scope.model.ReferenceByCode != '' && $scope.model.ReferenceByCode != null) {
                                var objSend = {
                                    id: '',
                                    CustomerCode: $scope.model.AccountNumbder,
                                    idCustomer: null,
                                    idReferenceBy: null,
                                    ReferenceByCode: $scope.model.ReferenceByCode,
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
                                            $scope.init();

                                            $ionicLoading.show({
                                                template: res.data.message
                                            });
                                            setTimeout(function () {
                                                $ionicLoading.hide()
                                            }, 1000);
                                        } else {
                                            $ionicScrollDelegate.scrollTop();
                                            $scope.init();

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
                                $scope.init();

                                $ionicLoading.show({
                                    template: res.data.message
                                });
                                setTimeout(function () {
                                    $ionicLoading.hide()
                                }, 1000);
                            }
                        } else {
                            $ionicScrollDelegate.scrollTop();
                            $scope.init();

                            $ionicLoading.show({
                                template: res.data.message
                            });
                            setTimeout(function () {
                                $ionicLoading.hide()
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

    // Use more distinguished and understandable naming
    $scope.CopyToModel = function (idCust) {
        $scope.IsEdit = true;
        var selectedItem = _.findWhere($scope.lstdata, {
            id: parseInt(idCust)
        });
        for (var prop in $scope.model) {
            $scope.model[prop] = selectedItem[prop];
        }
        $scope.model.isActive = $scope.model.isActive == 1 ? true : false;
        $scope.model.PhoneNumber = $scope.model.PhoneNumber;
        $scope.model.PhoneNumbder2 = $scope.model.PhoneNumbder2;
        $scope.model.BiilingPostCode = parseInt($scope.model.BiilingPostCode);
        $scope.model.DeliveryPostCode = parseInt($scope.model.DeliveryPostCode);
        $scope.model.idGroup = $scope.model.idGroup ? $scope.model.idGroup.toString() : '';
        $scope.model.idBranch = $scope.model.idBranch ? $scope.model.idBranch.toString() : '';
        $scope.model.idLocations = $scope.model.idLocations ? $scope.model.idLocations.toString() : '';
        $scope.model.idPriceCategory = $scope.model.idPriceCategory ? $scope.model.idPriceCategory.toString() : '';
        $scope.model.CreditTerm = DisplayCreditTerm($scope.model.idCreditTerm);
        if ($scope.model.ExceedLimitType != '' && $scope.model.ExceedLimitType != null && $scope.model.CreditLimit != '' && $scope.model.CreditLimit != null) {
            $scope.IsDebitCreditControll = true;
        }
        $rootScope.BackButton = $scope.IsList = false;


        setTimeout(function () {
            $("#PhoneNumber").intlTelInput({
                utilsScript: "lib/intl/js/utils.js"
            });
            $("#PhoneNumbder2").intlTelInput({
                utilsScript: "lib/intl/js/utils.js"
            });
        }, 500)
        $("#PhoneNumber").intlTelInput("setNumber", $scope.model.PhoneNumber);
        $("#PhoneNumbder2").intlTelInput("setNumber", $scope.model.PhoneNumbder2);
    };

    $scope.DeleteCustomer = function (id) {
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
                $rootScope.ShowLoader();
                return $http.get($rootScope.RoutePath + 'customer/DeleteCustomer', {
                    params: {
                        id: id
                    }
                }).then(function (res) {
                    if (res.data.data == 'TOKEN') {
                        $ionicScrollDelegate.scrollTop();
                        $rootScope.logout();
                    }
                    if (res.data.success) {
                        $scope.Cancel();
                    }
                    $ionicLoading.show({
                        template: res.data.message
                    });
                    setTimeout(function () {
                        $ionicLoading.hide()
                    }, 1000);
                })
                    .catch(function (err) {
                        $ionicLoading.show({
                            template: 'Unable to save record right now. Please try again later.'
                        });
                        setTimeout(function () {
                            $ionicLoading.hide()
                        }, 1000);
                    });
            } else {
                $scope.Cancel();
            }
        });
    }

    $scope.ResetModel = function () {
        $scope.model = {
            id: '',
            AccountNumbder: LastCustomerCode,
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
            IsDPCommission: 0,
            Type: 'Supplier',
            IsIGST: 0,
        };

        $scope.Searchmodel = {
            Search: '',
        }

    };

    $scope.Add = function () {
        $scope.formsubmit = false;
        $rootScope.BackButton = $scope.IsList = false;
        setTimeout(function () {
            $("#PhoneNumber").intlTelInput({
                utilsScript: "lib/intl/js/utils.js"
            });
            $("#PhoneNumbder2").intlTelInput({
                utilsScript: "lib/intl/js/utils.js"
            });
        }, 500)
    }

    // Alias
    $rootScope.ResetAll = $scope.init;

    $scope.Cancel = function () {
        $scope.ResetModel();
        $rootScope.BackButton = $scope.IsList = true;
        $scope.IsEdit = false;
        $scope.formsubmit = false;
        $('#SupplierTable').dataTable().fnClearTable();
        $('#SupplierTable').dataTable().fnDestroy();
        setTimeout(function () {
            InitDataTable();
        })
    }

    $scope.DisplayCreditTerm = function (o) {
        $scope.model.CreditTerm = DisplayCreditTerm(o.idCreditTerm);
    }

    function DisplayCreditTerm(idCreditTerm) {
        var obj = _.findWhere($scope.LstCreditTerm, { id: parseInt(idCreditTerm) });
        if (obj) {
            return obj.CreditTerm;
        } else {
            return "";
        }
    }

    $scope.ChangeStatus = function () {
        if ($scope.model.Status == 'Solved') {
            $scope.model.StatusRemark = "";
        }
    }
    $scope.init();

})