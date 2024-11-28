app.controller('SalesController', function ($scope, $rootScope, $ionicModal, $http, $ionicPopup, $ionicLoading, $localstorage, $state, $compile) {
      var Initstatus = 1;

      $scope.init = function () {
            setTimeout(() => {
                  $("#mytext").focus();
            }, 1000);
            $scope.modelAdvanceSearch = null;
            $scope.IsShopLogin = $localstorage.get('CustomerGroup') == 'Shop' ? true : false;
            ManageRole();
            $scope.isshopCustomer = false;
            $scope.SaleEdit = false;
            $scope.shopCustomerIdLocation = 0;
            // $scope.getAllUserLoaction();
            $scope.GetAllInvoiceStatus(function () {
                  $scope.ResetModel();
                  $scope.GetAllCustomer();
                  $scope.GetAllBranch();
                  // $scope.GetAllItem();
                  $scope.GetAllLocation();
                  // $scope.GetAllUOM();
                  $scope.GetAllTaxCode();
                  $scope.GetAllCurrency();
                  $scope.GetAllCurrencyRate();
                  $scope.GetAllDiscount();
                  // $scope.GetAllUserWithoutLoginOne();
                  $scope.GetAllActiveCustomerGroup();
                  $scope.tab = {
                        selectedIndex: 0
                  };
                  $rootScope.BackButton = $scope.IsList = true;
                  $scope.SelectedTab = 1;
                  $scope.IsSave = false;
                  // setTimeout(function () {
                  //     InitDataTable();
                  // })
                  $scope.GenmedFlag = false;
                  $scope.isValidMobile = false;
                  $scope.isValidMobile2 = false;
                  $scope.FormSales = {};
                  setTimeout(function () {
                        $scope.GetQuotationByQuotationId();
                  }, 100);
                  // setTimeout(function () {
                  //     $scope.GetPendingListByBranchnLocation();
                  // }, 1000);
                  setTimeout(function () {
                        $scope.GetPurchaseByPurchaseId();
                  }, 1000)
                  $scope.SelectedCustomerBranch = $localstorage.get('CustomerBranch')
                  if ($scope.SelectedCustomerBranch && $scope.SelectedCustomerBranch != "null" && $scope.SelectedCustomerBranch != undefined) {
                        $scope.FlagCustomerBranch = true
                  } else {
                        $scope.FlagCustomerBranch = false
                  }
                  $scope.CurrentCustomerGroup = $localstorage.get('CustomerGroup')

                  if ($scope.CurrentCustomerGroup == "Genmed") {
                        $scope.FlagHSNCode = false
                        $scope.FlagPurchaseRate = false
                        $scope.GenmedFlag = true;
                  } else if ($scope.CurrentCustomerGroup == "Stock Holder") {
                        $scope.FlagHSNCode = true
                        $scope.FlagPurchaseRate = true
                  } else {
                        $scope.FlagPurchaseRate = true
                  }
                  $scope.lstFilteredCustomerbyMob = []
                  $scope.lstFilteredCustomerbyName = []
            });
            // customers();

      };

      function ManageRole() {
            var AdminUser = _.filter(JSON.parse($localstorage.get('UserRoles')), function (Role) {
                  return Role == "Admin";
            })
            $scope.IsAdmin = AdminUser.length && AdminUser.length > 0 ? true : false;

            var CustomerUser = _.filter(JSON.parse($localstorage.get('UserRoles')), function (Role) {
                  return Role == "Customer";
            })
            $scope.IsCustomer = CustomerUser.length && CustomerUser.length > 0 ? true : false;

            if ($scope.IsCustomer) {
                  $scope.GetCustomerId();
                  $scope.GetAllSetting();
            }
      }

      $scope.GetAllSetting = function () {
            $http.get($rootScope.RoutePath + "setting/GetAllSetting").success(function (response) {
                  var objMLM = _.findWhere(response, {
                        Name: "IsMLM"
                  });
                  if (objMLM != null && objMLM != undefined && objMLM != '') {
                        $scope.IsMLM = parseInt(objMLM.Value);
                  }

                  var objParentPoint = _.findWhere(response, {
                        Name: "LevelCommission"
                  });
                  if (objParentPoint != null && objParentPoint != undefined && objParentPoint != '') {
                        $scope.LevelCommission = parseInt(objParentPoint.Value);
                  }

                  var objReward = _.findWhere(response, {
                        Name: "IsReward"
                  });
                  if (objReward != null && objReward != undefined && objReward != '') {
                        $scope.IsReward = parseInt(objReward.Value);
                  }

                  var objDPCommission = _.findWhere(response, {
                        Name: "DPCommission"
                  });
                  if (objDPCommission != null && objDPCommission != undefined && objDPCommission != '') {
                        $scope.DPCommission = parseInt(objDPCommission.Value);
                  }

                  var objSponsorCommission = _.findWhere(response, {
                        Name: "SponsorCommission"
                  });
                  if (objSponsorCommission != null && objSponsorCommission != undefined && objSponsorCommission != '') {
                        $scope.SponsorCommission = parseInt(objSponsorCommission.Value);
                  }

                  var objSponsorCommissionLevel = _.findWhere(response, {
                        Name: "SponsorCommissionLevel"
                  });
                  if (objSponsorCommissionLevel != null && objSponsorCommissionLevel != undefined && objSponsorCommissionLevel != '') {
                        $scope.SponsorCommissionLevel = parseInt(objSponsorCommissionLevel.Value);
                  }
            });
      }

      $scope.GetCustomerId = function () {
            $http.get($rootScope.RoutePath + 'customer/GetCustomerByEmailAddress?EmailAddress=' + $localstorage.get('EmailAddress')).then(function (res) {
                  $scope.Customer = res.data.data;
                  if ($scope.Customer) {
                        $scope.GetAllCustomerWithoutLogin($scope.Customer.id);
                        $scope.GetAllParentFromRefrenceTreeByCustomerId();
                  }

            });
      }

      $scope.GetAllParentFromRefrenceTreeByCustomerId = function () {
            $http.get($rootScope.RoutePath + 'customer/GetAllParentFromRefrenceTreeByCustomerId?id=' + $scope.Customer.id).then(function (res) {
                  if (res.data.success) {
                        $scope.ReferenceLevelList = res.data.data;
                        $scope.SponsorList = [];
                        var CurrentLevel = _.findWhere($scope.ReferenceLevelList, {
                              idCustomer: $scope.Customer.id
                        });
                        if (CurrentLevel) {
                              for (var i = 1; i <= $scope.SponsorCommissionLevel; i++) {
                                    var obj = _.findWhere($scope.ReferenceLevelList, {
                                          level: (CurrentLevel.level - i)
                                    });
                                    if (obj) {
                                          $scope.SponsorList.push(obj);
                                    }
                              }
                        }

                  } else {
                        $scope.ReferenceLevelList = [];
                        $scope.SponsorList = [];
                  }
            });
      }

      $scope.GetAllCustomerWithoutLogin = function (id) {
            $http.get($rootScope.RoutePath + 'customer/GetAllCustomerWithoutLogin?id=' + id).then(function (res) {
                  $scope.ListCustomer = res.data.data;
            });
      }

      $scope.GetAllUserWithoutLoginOne = function (id) {
            $http.get($rootScope.RoutePath + 'user/GetAllUserWithoutLoginOne?id=' + $localstorage.get('UserId')).then(function (res) {
                  $scope.ListUser = res.data.data;
            });
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

      function customers() {

            if ($localstorage.get('CustomerGroup') == "Shop") {
                  $scope.isshopCustomer = true;
                  // $scope.shopCustomerIdLocation = $localstorage.get('CustomerGroupLocatio');
                  // $scope.lstTempcustomer = $scope.lstCustomer
                  // $scope.lstCustomer = []

                  // for (var i = 0; i < $scope.lstTempcustomer.length; i++) {
                  //     if ($scope.lstTempcustomer[i].idLocations == $scope.shopCustomerIdLocation) {
                  //         $scope.lstCustomer.push($scope.lstTempcustomer[i])
                  //     }
                  // }
            } else {
                  $scope.isshopCustomer = false;
            }
      }

      $scope.GetAllCustomer = function () {
            var params = {
                  CustomerGroup: $localstorage.get('CustomerGroup'),
                  CreatedBy: $scope.IsAdmin ? '' : $localstorage.get('CustomerGroup') == 'Genmed' ? '' : parseInt($localstorage.get('UserId')),
                  RefCustUserId: $localstorage.get('RefCustUserId') != null && $localstorage.get('RefCustUserId') != undefined && $localstorage.get('RefCustUserId') != '' ? $localstorage.get('RefCustUserId') : '',
            }

            $http.get($rootScope.RoutePath + 'customer/GetAllCustomer', {
                  params: params
            }).then(function (res) {
                  $scope.lstCustomer = res.data.data;
                  $scope.GetPendingListByBranchnLocation();
                  customers()
            });
      };

      $scope.FilteredCustomerbyMob = function () {
            $scope.lstFilteredCustomerbyMob = _.filter($scope.lstCustomer, function (item) {
                  if (item.PhoneNumber.indexOf($scope.model.PhoneNumber) !== -1) {
                        return item
                  }
            })
      }

      $scope.FilteredCustomerbyName = function () {
            if ($scope.model.CustomerName != '' && $scope.model.CustomerName != null && $scope.model.CustomerName != undefined) {
                  $scope.lstFilteredCustomerbyName = _.filter($scope.lstCustomer, function (item) {
                        if (item.Name.toLowerCase().indexOf($scope.model.CustomerName.toLowerCase()) !== -1) {
                              return item
                        }
                  })
            } else {
                  $scope.lstFilteredCustomerbyName = []
            }
      }

      $scope.GetAllBranch = function () {
            $http.get($rootScope.RoutePath + 'customer/GetAllActiveCustomerbranch').then(function (res) {
                  $scope.lstBranch = res.data.data;
            });
      };

      $scope.GetAllItem = function () {
            $http.get($rootScope.RoutePath + 'item/GetAllItemSale').then(function (res) {
                  $scope.lstItems = res.data.data;
            });
      };

      $scope.GetAllItemSearch = function (o) {
            _.filter($scope.lstSelectedSaleMain, function (item) {
                  item.IsEdit = false;
            });
            o.IsEdit = true;
            if (o.ItemName) {
                  var params = {
                        ItemName: o.ItemName,
                        CustGroupName: $scope.CurrentCustomerGroup == 'Genmed' ? null : $scope.CurrentCustomerGroup
                  }
                  console.log(params)
                  $http.get($rootScope.RoutePath + 'item/GetAllItemBySearchText', {
                        params: params
                  }).then(function (res) {
                        $scope.lstItemsSearch = res.data.data;

                        setTimeout(function () {
                              var li = $('.autosearch');
                              var liSelected;
                              var $container = $('.productul');
                              $(window).keydown(function (e) {
                                    if (e.which === 40) {
                                          if (liSelected) {
                                                liSelected.removeClass('selected');
                                                next = liSelected.next();
                                                if (next.length > 0) {
                                                      liSelected = next.addClass('selected');
                                                } else {
                                                      liSelected = li.eq(0).addClass('selected');
                                                }
                                          } else {
                                                console.log(li.eq(0))
                                                liSelected = li.eq(0).addClass('selected');
                                          }
                                          $container.scrollTop(
                                                liSelected.offset().top - $container.offset().top + $container.scrollTop()
                                          );
                                    } else if (e.which === 38) {
                                          if (liSelected) {
                                                liSelected.removeClass('selected');
                                                next = liSelected.prev();
                                                if (next.length > 0) {
                                                      liSelected = next.addClass('selected');
                                                } else {
                                                      liSelected = li.last().addClass('selected');
                                                }
                                          } else {
                                                liSelected = li.last().addClass('selected');
                                          }
                                          $container.scrollTop(
                                                liSelected.offset().top - $container.offset().top + $container.scrollTop()
                                          );
                                    } else if (e.which === 13) {
                                          var find = _.findWhere($scope.lstItemsSearch, {
                                                id: parseInt($('.autosearch.selected').attr('id'))
                                          });
                                          //console.log($scope.lstSelectedSaleMain.indexOf(find.ItemCode), $scope.lstSelectedSaleMain);
                                          if (find) {
                                                $scope.AddItemCode($scope.lstSelectedSaleMain[$scope.lstSelectedSaleMain.length - 1], find);
                                          }
                                    }
                              });
                        }, 10)
                  });
            } else {
                  $scope.lstItemsSearch = [];
            }

      };

      $scope.GetAllLocation = function () {
            var params = {
                  idLocations: $scope.IsAdmin ? "" : ""
            }
            $http.get($rootScope.RoutePath + 'customer/GetAllActiveLocations', {
                  params: params
            }).then(function (res) {
                  $scope.lstLocations = res.data.data;

                  var obj = _.findWhere($scope.lstLocations, {
                        id: parseInt($localstorage.get('DefaultLocation'))
                  });
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
                  $scope.model.CurrencyCode = $scope.lstCurrency[0].CurrencyCode
                  $scope.TotalRecord = $scope.lstCurrency.length;
            })
      }

      $scope.GetAllCurrencyRate = function () {
            $http.get($rootScope.RoutePath + 'currency/GetAllCurrencyRate').then(function (res) {
                  $scope.lstCurrencyRate = res.data.data;
                  $scope.TotalRecord1 = $scope.lstCurrencyRate.length;
            })
      }

      $scope.GetAllDiscount = function () {
            $http.get($rootScope.RoutePath + 'discount/GetAllDiscount').then(function (res) {
                  $scope.lstDiscount = res.data.data;
            });
      };

      $scope.GetAllActiveCustomerGroup = function () {
            $http.get($rootScope.RoutePath + 'customer/GetAllActiveCustomergroup').then(function (res) {
                  $scope.LstCustGroup = res.data.data;
            });
      };

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
            var CustomerObj = _.findWhere($scope.lstCustomer, {
                  AccountNumbder: $scope.model.CustomerCode
            });

            var params = {
                  ItemCode: obj.ItemCode,
                  UOM: obj.UOM,
                  idPriceCategory: CustomerObj.idPriceCategory
            }

            $http.get($rootScope.RoutePath + 'itemprice/GetItemPriceBasedONItemcodeUOMPriceCategory', {
                  params: params
            }).then(function (res) {

                  if (res.data.success) {
                        $scope.lstItemPrice = res.data.data;

                        if ($scope.lstItemPrice.isPrice) {
                              obj.Price = $scope.lstItemPrice.FixedPrice;
                              obj.DiscountAmount = null;
                              obj.DiscountPercentage = null;
                        } else {
                              var objUOM = _.findWhere(obj.listUOM, {
                                    UOM: obj.UOM
                              })
                              if (objUOM) {
                                    obj.Price = objUOM.Price;
                                    obj.MRP = objUOM.MRP
                              }
                              obj.DiscountAmount = $scope.lstItemPrice.FixedDetailsDiscount;
                              obj.DiscountPercentage = (obj.DiscountAmount / (obj.Qty * obj.Price)) * 100
                        }

                        $scope.AddTaxCode(obj, 1);
                        // $scope.AddDiscountAmount(obj);
                  } else {
                        var objUOM = _.findWhere(obj.listUOM, {
                              UOM: obj.UOM
                        })
                        if (objUOM) {
                              obj.Price = objUOM.Price;
                              obj.MRP = objUOM.MRP
                              obj.DiscountAmount = null;
                              obj.DiscountPercentage = null;
                        } else {
                              obj.Price = 0.00;
                              obj.MRP = 0.00
                              obj.DiscountAmount = null;
                              obj.DiscountPercentage = null;
                        }
                        $scope.AddTaxCode(obj, 1);
                  }
            });
      }

      $scope.SelectCustomer = function (o, type) {
            var obj = ''
            if (type == "phone") {
                  obj = _.findWhere($scope.lstCustomer, {
                        PhoneNumber: o.PhoneNumber
                  });
                  $scope.lstFilteredCustomerbyMob = []
                  if (obj) {
                        $scope.model.CustomerCode = obj.AccountNumbder
                  }
            } else if (type == "name") {
                  obj = _.findWhere($scope.lstCustomer, {
                        Name: o.Name
                  });
                  $scope.lstFilteredCustomerbyName = []
                  if (obj) {
                        $scope.model.CustomerCode = obj.AccountNumbder
                  }
            } else {
                  obj = _.findWhere($scope.lstCustomer, {
                        AccountNumbder: o
                  });
            }
            if (obj) {
                  $scope.model.CustomerName = obj.Name;
                  $scope.model.PhoneNumber = obj.PhoneNumber
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
                        $scope.model.CurrencyCode = _.findWhere($scope.lstCurrency, {
                              isDefault: 1
                        }).CurrencyCode;
                        $scope.model.CurrencyRate = _.findWhere($scope.lstCurrency, {
                              CurrencyCode: $scope.model.CurrencyCode
                        }).SellRate;
                  }
                  if (obj.idGroup) {
                        $scope.CustomerGroup = obj.customergroup;
                  } else {
                        $scope.CustomerGroup = null;
                  }


                  if ($scope.lstSelectedSaleMain.length > 0) {
                        for (var i = 0; i < $scope.lstSelectedSaleMain.length; i++) {
                              $scope.GetItemMargin($scope.lstSelectedSaleMain[i]);
                        }
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
            var obj = _.findWhere($scope.lstCurrencyRate, {
                  CurrencyCode: CurrencyCode
            });
            if (obj != null && obj != '' && obj != undefined) {
                  var FromDate = new Date(obj.FromDate);
                  var ToDate = new Date(obj.ToDate);
                  var CurrentDate = new Date();
                  if (CurrentDate >= FromDate && CurrentDate <= ToDate) {
                        $scope.model.CurrencyCode = obj.CurrencyCode;
                        $scope.model.CurrencyRate = obj.SellRate;
                  } else {
                        var obj = _.findWhere($scope.lstCurrency, {
                              CurrencyCode: CurrencyCode
                        });
                        if (obj != null && obj != '' && obj != undefined) {
                              $scope.model.CurrencyCode = obj.CurrencyCode;
                              $scope.model.CurrencyRate = obj.SellRate;
                        } else {
                              //for default currency
                              $scope.model.CurrencyCode = _.findWhere($scope.lstCurrency, {
                                    isDefault: 1
                              }).CurrencyCode;
                              $scope.model.CurrencyRate = _.findWhere($scope.lstCurrency, {
                                    CurrencyCode: $scope.model.CurrencyCode
                              }).SellRate;
                        }
                  }
            } else {
                  var obj = _.findWhere($scope.lstCurrency, {
                        CurrencyCode: CurrencyCode
                  });
                  if (obj != null && obj != '' && obj != undefined) {
                        $scope.model.CurrencyCode = obj.CurrencyCode;
                        $scope.model.CurrencyRate = obj.SellRate;
                  } else {
                        //for default currency
                        $scope.model.CurrencyCode = _.findWhere($scope.lstCurrency, {
                              isDefault: 1
                        }).CurrencyCode;
                        $scope.model.CurrencyRate = _.findWhere($scope.lstCurrency, {
                              CurrencyCode: $scope.model.CurrencyCode
                        }).SellRate;
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
                                          $scope.lstSelectedSaleMain[i].DisplayLocation = _.findWhere($scope.lstLocations, {
                                                id: parseInt($scope.model.idLocations)
                                          }).Name;
                                    }
                              }
                              $scope.SaleMainModel.idLocations = $scope.model.idLocations;
                              var obj = _.findWhere($scope.lstLocations, {
                                    id: parseInt($scope.model.idLocations)
                              });
                              if (obj) {
                                    $scope.model.DefaultLocation = obj.Name;
                              }
                        } else {
                              $scope.model.idLocations = $localstorage.get('DefaultLocation');
                              var obj = _.findWhere($scope.lstLocations, {
                                    id: parseInt($scope.model.idLocations)
                              });
                              if (obj) {
                                    $scope.model.DefaultLocation = obj.Name;
                              }
                        }
                  })
            } else {
                  var obj = _.findWhere($scope.lstLocations, {
                        id: parseInt($scope.model.idLocations)
                  });
                  if (obj) {
                        $scope.model.DefaultLocation = obj.Name;
                  }
            }
      }

      $scope.checkDPCode = function () {
            var List = _.pluck($scope.ListCustomer, 'AccountNumbder');
            if ($scope.model.DPCustomerCode) {
                  if (List.includes($scope.model.DPCustomerCode)) {
                        $scope.showError = false;
                  } else {
                        $scope.showError = true;
                  }
            } else {
                  $scope.showError = false;
            }
      }


      //Start Main Sale Tab

      //add Sale main item in list
      $scope.AddSaleMainItemInList = function () {
            // if ($scope.WorkingSaleMain != undefined && $scope.WorkingSaleMain.ItemCode == '') {
            if ($scope.lstSelectedSaleMain.length > 0 && $scope.lstSelectedSaleMain[$scope.lstSelectedSaleMain.length - 1].ItemCode == '') {
                  $ionicLoading.show({
                        template: "Fill data"
                  });
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
                        FreeQty: 0,
                        Price: 0.00,
                        MRP: 0.0,
                        PurchaseRate: 0.0,
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
                        ExpiryDate: null,
                        isBatch: false,
                        IsCombo: 0,
                        ItemId: null,
                        Barcode: null,
                        SaleUOM: null,
                        ItemName: null,
                        Descriptions2: null, //Main Company Name
                        HSNCode: null,
                        sequence: $scope.lstSelectedSaleMain.length + 1
                  }
                  // $scope.BatchList = [];

                  $scope.lstSelectedSaleMain.push($scope.SaleMainModel);
                  $scope.WorkingSaleMain = $scope.SaleMainModel;
                  if ($scope.GenmedFlag) {
                        setTimeout(() => {
                              $("#ItemName").focus();
                        });
                  } else {
                        setTimeout(() => {
                              $("#Barcode").focus();
                        });
                  }
                  // AssignSaleMainClickEvent();

                  // setTimeout(function() {
                  //     $scope.SelectSaleMainRaw($scope.lstSelectedSaleMain.length - 1);
                  // })
            }
      }
      $scope.AddSaleMainItemInListNew = function () {
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
                  FreeQty: 0,
                  Price: 0.00,
                  PurchaseRate: 0.0,
                  MRP: 0.0,
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
                  ExpiryDate: null,
                  isBatch: false,
                  IsCombo: 0,
                  ItemId: null,
                  Barcode: null,
                  SaleUOM: null,
                  ItemName: null,
                  Descriptions2: null, //Main Company Name
                  HSNCode: null,
                  sequence: $scope.lstSelectedSaleMain.length + 1
            }
            $scope.lstSelectedSaleMain.push($scope.SaleMainModel);
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
                              var obj = _.findWhere($scope.lstItems, {
                                    ItemCode: $scope.WorkingSaleMain.ItemCode
                              });
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
            // });]

            var SelectedSeq = $scope.lstSelectedSaleMain[index].sequence
            $scope.lstSelectedSaleMain.splice(index, 1);
            _.filter($scope.lstSelectedSaleMain, function (item) {
                  if (item.sequence > SelectedSeq) {
                        item.sequence = item.sequence - 1
                  }
            });

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

      $scope.AddtoPendingList = function (index, o) {

            var ObjPending = {
                  ItemCode: o.ItemCode,
                  BranchCode: $scope.model.BranchCode,
                  Qty: o.Qty,
                  UOM: o.UOM,
                  idLocations: o.idLocations,
                  Date: $scope.model.InvoiceDate
            }


            $http.post($rootScope.RoutePath + 'pendinglist/SavePendingList', ObjPending).then(function (res) {
                  if (res.data.success) {
                        $ionicLoading.show({
                              template: 'Item added in pending list successfully'
                        });
                        setTimeout(function () {
                              $ionicLoading.hide()
                        }, 1000);
                  }
            });

      }


      $scope.SelectSaleMainRaw = function (index) {
            $("#tblSaleMainTable tr[accessKey='" + index + "']").trigger("click");
      }

      $scope.GetAllItemUOM = function (o) {
            var params = {
                  ItemCode: o.ItemCode,
                  UOM: o.UOM
            }
            $http.get($rootScope.RoutePath + 'itemuom/GetItemUOMByItemCodeAndUOM', {
                  params: params
            }).then(function (res) {
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
            $http.get($rootScope.RoutePath + 'item/GetAllItemByItemCode?ItemCode=' + o.ItemCode).then(function (res) {
                  $scope.lstItems = res.data.data;
                  // var obj = _.findWhere($scope.lstItems, { ItemCode: o.ItemCode });
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

                  AdjustFinalSaleTotal();
            })
      }

      $scope.AddItemCode = function (o, t) {
            if (t) {
                  o.ItemCode = t.ItemCode;
                  o.ItemName = t.ItemName;
            }
            $scope.lstItemsSearch = [];

            $http.get($rootScope.RoutePath + 'item/GetAllItemByItemCode?ItemCode=' + o.ItemCode).then(function (res) {
                  $scope.lstItems = res.data.data;
                  var obj = _.findWhere($scope.lstItems, {
                        ItemCode: o.ItemCode
                  });
                  o.Descriptions2 = obj.Descriptions2 //Main Company
                  o.HSNCode = obj.HSNCode
                  o.Descriptions = obj.Descriptions; //contain
                  o.ItemName = obj.ItemName;
                  // o.UOM = $scope.IsShopLogin == false ? (obj.SalesUOM).toString() : (obj.BaseUOM).toString();
                  o.UOM = (obj.SalesUOM).toString();
                  o.NewBatchLst = []
                  o.TaxCode = obj.SupplyTaxCode;
                  o.listUOM = obj.itemuoms;
                  o.IsCombo = obj.IsCombo;
                  o.ItemId = obj.id;
                  o.itemmargins = obj.itemmargins;
                  o.SaleUOM = obj.SalesUOM;
                  if (obj.isBatch == 1 && o.IsCombo != 1) {
                        o.BatchList = obj.itembatches;
                        o.isBatch = true;
                        if (o.BatchList.length > 0) {
                              _.filter(o.BatchList, function (z) {
                                    var objStock = {
                                          ItemCode: o.ItemCode,
                                          BatchNo: z.BatchNumber,
                                          UOM: o.UOM,
                                          Location: o.idLocations
                                    }
                                    $http.get($rootScope.RoutePath + 'item/GetAllItemBatchBalQtyByItemCode', {
                                          params: objStock
                                    }).then(function (res) {
                                          var objz = res.data.data;
                                          console.log(objz)
                                          z['Stock'] = objz ? objz.BalQty : 0;
                                          if (objz != null && objz != undefined) {
                                                o.NewBatchLst.push({
                                                      BatchNumber: z.BatchNumber,
                                                      ExpiryDate: z.ExpiryDate,
                                                      Stock: z.Stock,
                                                      SalesRate: z.SalesRate,
                                                      MRP: z.MRP,
                                                })
                                          }
                                          if (z.Stock > 0) {
                                                o.BatchNo = z.BatchNumber
                                                $scope.MangeMargin(o)
                                          }
                                    });

                                    // var objz = _.findWhere(obj.itembatchbalqties, { BatchNo: z.BatchNumber, UOM: o.UOM, Location: o.idLocations });
                                    // z['Stock'] = objz ? objz.BalQty : 0;
                              })
                        }
                  } else {
                        o.BatchList = [];
                        o.isBatch = false;
                  }
                  setTimeout(function () {
                        console.log(o.NewBatchLst, o.BatchList)
                        o.NewBatchLst = _.sortBy(o.NewBatchLst, function (i) {
                              return [-i.Stock, -i.ExpiryDate]
                        })
                        o.BatchList = _.sortBy(o.BatchList, function (i) {
                              return [-i.Stock, -i.ExpiryDate]
                        })
                  }, 1000)
                  $scope.FillItemUnitPrice(o);
                  var NullObj = _.find($scope.lstSelectedSaleMain, function (itm) {
                        return itm.ItemCode == '';
                  })

                  // if (NullObj == undefined) {
                  //     $scope.AddSaleMainItemInListNew();
                  // }
                  // $scope.AddSaleMainItemInListNew();
                  // $scope.FillItemMargin(o);
            })
            setTimeout(() => {
                  $("#Qty" + o.ItemCode).focus();
            });
            // $scope.AddSaleMainItemInList();

            // setTimeout(() => {
            //       console.log($("#Item_" + $scope.lstSelectedSaleMain.length))
            //       $("#Item_" + $scope.lstSelectedSaleMain.length).focus();
            // }, 1000);
      }

      $scope.FillItemMargin = function (obj) {
            if ($scope.model.CustomerCode != null && $scope.model.CustomerCode != undefined && $scope.model.CustomerCode != '') {
                  var CustomerObj = _.findWhere($scope.lstCustomer, {
                        AccountNumbder: $scope.model.CustomerCode
                  });
                  if (CustomerObj && CustomerObj.idGroup) {
                        $scope.GetItemMargin(obj);
                  } else {
                        $scope.FillItemUnitPrice(obj);
                  }
            } else {
                  $scope.FillItemUnitPrice(obj);
            }
      }

      $scope.GetItemMargin = function (obj) {
            if ($scope.model.CustomerCode != null && $scope.model.CustomerCode != undefined && $scope.model.CustomerCode != '') {
                  var CustomerObj = _.findWhere($scope.lstCustomer, {
                        AccountNumbder: $scope.model.CustomerCode
                  });
                  if (CustomerObj) {
                        var params = {
                              ItemCode: obj.ItemCode,
                              idCustGroup: CustomerObj.idGroup
                        }
                        $http.get($rootScope.RoutePath + "item/GetItemMargin", {
                              params: params
                        }).then(function (resGetMArgin) {
                              if (resGetMArgin.data) {
                                    obj.Price = resGetMArgin.data.Amount;
                                    $scope.AddTaxCode(obj, 1);
                              } else {
                                    $scope.FillItemUnitPrice(obj);
                              }
                        })
                  } else {
                        $scope.FillItemUnitPrice(obj);
                  }
            } else {
                  $scope.FillItemUnitPrice(obj);
            }
      }

      $scope.FillItemUnitPrice = function (o) {

            if ($scope.model.CustomerCode != null && $scope.model.CustomerCode != undefined && $scope.model.CustomerCode != '') {
                  var CustomerObj = _.findWhere($scope.lstCustomer, {
                        AccountNumbder: $scope.model.CustomerCode
                  });
                  if (CustomerObj && CustomerObj.idPriceCategory) {
                        $scope.GetItemPrice(o);
                  } else {
                        var objUOM = _.findWhere(o.listUOM, {
                              UOM: o.UOM
                        })

                        if (objUOM) {
                              o.Price = objUOM.Price;
                              o.MRP = objUOM.MRP
                              $scope.AddTaxCode(o, 1);
                        }
                  }
            } else {
                  var objUOM = _.findWhere(o.listUOM, {
                        UOM: o.UOM
                  })
                  if (objUOM) {
                        o.Price = objUOM.Price;
                        o.MRP = objUOM.MRP
                        $scope.AddTaxCode(o, 1);
                  }
            }
      }

      $scope.AddLocation = function (o) {
            var obj = _.findWhere($scope.lstLocations, {
                  id: parseInt(o.idLocations)
            });
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
                  } else {
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
                  } else {
                        o.DiscountAmount = 0;
                        o.Total = (o.Qty * o.Price) - 0;
                        o.FinalTotal = o.NetTotal = o.LocalNetTotal = o.Total + o.Tax;
                        o.isDiscount = 0;

                  }
            }
            // AdjustFinalSaleTotal();
            $scope.AddTaxCode(o, 2);
      }

      $scope.AddTaxCode = function (o, status) {
            if (o.TaxCode) {
                  var obj = _.findWhere($scope.lstTaxCode, {
                        TaxType: o.TaxCode
                  });
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

            if (status != 2) {
                  $scope.MangeMargin(o);
            } else {
                  $scope.AddPrice(o);
            }
      }

      $scope.SetNewMRP = function (o) {
            o.MRP = parseInt(o.MRP)
            // $scope.MRPmodel = {
            //     id: '',
            //     BatchNumber: o.BatchNo,
            //     ItemCode: o.ItemCode,
            //     MRP: o.MRP
            // }
            $scope.MRPmodel = _.filter(o.BatchList, function (item) {
                  if (item.BatchNumber == o.BatchNo) {
                        item.MRP = parseInt(o.MRP)
                        item.ExpiryDate = item.ExpiryDate ? moment(item.ExpiryDate).format('YYYY-MM-DD') : item.ExpiryDate
                        item.ManuDate = item.ManuDate ? moment(item.ManuDate).format('YYYY-MM-DD') : item.ManuDate
                        item.LastSaleDate = item.LastSaleDate ? moment(item.LastSaleDate).format('YYYY-MM-DD') : item.LastSaleDate
                        // $scope.MRPmodel.id = item.id
                        return item
                  }
            })

            var ExistingRecord = null
            if ($scope.NewMRPlist.length > 0) {
                  ExistingRecord = _.findWhere($scope.NewMRPlist, {
                        BatchNumber: o.BatchNo,
                        ItemCode: o.ItemCode
                  });
                  if (ExistingRecord != null) {
                        ExistingRecord.MRP = o.MRP
                  } else {
                        $scope.NewMRPlist.push($scope.MRPmodel[0])
                  }
            } else {
                  $scope.NewMRPlist.push($scope.MRPmodel[0]);
            }

            // $scope.AddTaxCode(o)
      }

      $scope.SaveNewMRP = function () {
            $http.post($rootScope.RoutePath + 'invoice/UpdateBatchMRP', $scope.NewMRPlist)
                  .then(function (res) {

                        // if (res.data.success) {
                        //     $ionicLoading.show({ template: ResponseSales.message });
                        //     setTimeout(function () {
                        //         $ionicLoading.hide()
                        //     }, 1000);
                        //     // $scope.init();
                        // }
                  })
      }

      $scope.MangeMargin = function (o) {
            console.log('SHiavm MArgin')
            var lstexpirydate = _.findWhere(o.BatchList, {
                  BatchNumber: o.BatchNo
            });
            if (lstexpirydate != null) {
                  o.ExpiryDate = lstexpirydate.ExpiryDate
            }
            var selectedBatch = _.findWhere(o.BatchList, {
                  BatchNumber: o.BatchNo
            })

            if (selectedBatch) {
                  o.ExpiryDate = selectedBatch.ExpiryDate
                  o.PurchaseRate = selectedBatch.PurchaseRate
            }
            if (o.itemmargins && o.itemmargins.length > 0) {

                  var List = getSalesPurchaseRate(o);
                  o.MRP = List.MRP
                  if ($scope.CustomerGroup) {
                        if ($scope.CustomerGroup.Name == 'Shop') {
                              o.Price = List.ShopSalesRate;
                              o.DiscountAmount = List.ShopPercentage;
                              o.DiscountPercentage = (o.DiscountAmount / (o.Qty * o.Price)) * 100
                        } else if ($scope.CustomerGroup.Name == 'Stock Holder') {
                              o.Price = List.StockHolderSalesRate;
                              o.DiscountAmount = List.StockHolderPercentage;
                              o.DiscountPercentage = (o.DiscountAmount / (o.Qty * o.Price)) * 100
                              o.PurchaseRate = List.GenmedPurchaseRate
                        } else if ($scope.CustomerGroup.Name == 'Genmed') {
                              o.Price = List.GenmedSalesRate;
                              // o.PurchaseRate = List.GenmedPurchaseRate
                        } else if ($scope.CustomerGroup.Name == 'Customer') {
                              o.Price = List.CustomerSalePrice;
                              // o.DiscountAmount = List.CustomerDiscountAmount;
                              // o.DiscountPercentage = List.CustomerPercentage
                              $scope.model.IsInclusive = true;
                        }
                  } else {
                        o.Price = List.CustomerSalePrice;
                        // o.DiscountAmount = List.CustomerDiscountAmount;
                        // o.DiscountPercentage = List.CustomerPercentage
                        $scope.model.IsInclusive = true;
                  }
            }
            setTimeout(() => {
                  $("#Qty" + o.ItemCode).focus();
            });
            $scope.AddPrice(o);
      }

      $scope.NoStockPopup = function (o) {
            setTimeout(() => {
                  $("#Qty" + o.ItemCode).focus();
            });
            if ($localstorage.get('CustomerGroup') != 'Genmed') {
                  var lstexpirydate = _.findWhere(o.BatchList, {
                        BatchNumber: o.BatchNo
                  });
                  if (lstexpirydate.Stock <= 0) {
                        var alertPopup = $ionicPopup.alert({
                              title: '',
                              template: 'You have no stock in this batch.',
                              cssClass: 'custPop',
                              okText: 'Ok',
                              okType: 'btn btn-green',
                        });
                        o.BatchNo = null
                  }
            }
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
                  $scope.model.TotalSaving = 0.00;
                  for (var i = 0; i < $scope.lstSelectedSaleMain.length; i++) {
                        $scope.model.Total = $scope.model.Total + $scope.lstSelectedSaleMain[i].Total;
                        $scope.model.LocalNetTotal = $scope.model.LocalNetTotal + $scope.lstSelectedSaleMain[i].Total;
                        $scope.model.NetTotal = $scope.model.FinalTotal = Math.round($scope.model.NetTotal + $scope.lstSelectedSaleMain[i].NetTotal);
                        $scope.model.Tax = $scope.model.LocalTax = $scope.model.Tax + $scope.lstSelectedSaleMain[i].Tax;
                        $scope.model.TotalSaving = $scope.model.TotalSaving + parseFloat($scope.lstSelectedSaleMain[i].Qty * (($scope.lstSelectedSaleMain[i].MRP)) - $scope.lstSelectedSaleMain[i].NetTotal);

                        // var objItem = _.findWhere($scope.lstItems, { ItemCode: $scope.lstSelectedSaleMain[i].ItemCode });
                        // if (objItem) {
                        //     if (objItem.Weight && objItem.WeightAmount) {
                        //         if (objItem.BaseUOM == $scope.lstSelectedSaleMain[i].UOM) {
                        //             $scope.model.Weight = $scope.model.Weight + (parseFloat(objItem.Weight) * $scope.lstSelectedSaleMain[i].Qty)
                        //         } else {
                        //             var objUOM = _.findWhere(objItem.itemuoms, { UOM: $scope.lstSelectedSaleMain[i].UOM });
                        //             if (objUOM) {
                        //                 $scope.model.Weight = $scope.model.Weight + (parseFloat(objItem.Weight) * ($scope.lstSelectedSaleMain[i].Qty * objUOM.Rate));
                        //             }
                        //         }
                        //         $scope.model.WeightAmount = ($scope.model.Weight * parseFloat(objItem.WeightAmount)) / parseFloat(objItem.Weight);
                        //     }

                        //     if (objItem.Freight && objItem.FreightAmount) {
                        //         if (objItem.BaseUOM == $scope.lstSelectedSaleMain[i].UOM) {
                        //             $scope.model.Freight = $scope.model.Freight + (parseFloat(objItem.Freight) * $scope.lstSelectedSaleMain[i].Qty)
                        //         } else {
                        //             var objUOM = _.findWhere(objItem.itemuoms, { UOM: $scope.lstSelectedSaleMain[i].UOM });
                        //             if (objUOM) {
                        //                 $scope.model.Freight = $scope.model.Freight + (parseFloat(objItem.Freight) * ($scope.lstSelectedSaleMain[i].Qty * objUOM.Rate));
                        //             }
                        //         }
                        //         $scope.model.FreightAmount = ($scope.model.Freight * parseFloat(objItem.FreightAmount)) / parseFloat(objItem.Freight);
                        //     }
                        // }
                  }

                  if ($scope.model.DiscountRate != null && $scope.model.DiscountRate != '' && $scope.model.DiscountRate != undefined) {
                        $scope.model.Total = ($scope.model.Total - ($scope.model.Total * $scope.model.DiscountRate) / 100);
                        $scope.model.NetTotal = $scope.model.FinalTotal = Math.round($scope.model.Total + $scope.model.Tax);

                  }

                  if ($scope.model.idDiscount != null && $scope.model.idDiscount != '' && $scope.model.idDiscount != undefined) {
                        var obj = _.findWhere($scope.lstDiscount, {
                              Id: $scope.model.idDiscount
                        });
                        if (obj.UsePercentage == 1) {
                              $scope.model.CouponDiscount = ($scope.model.Total * obj.DiscountPercentage) / 100;
                              $scope.model.Total = ($scope.model.Total - ($scope.model.Total * obj.DiscountPercentage) / 100);
                              $scope.model.NetTotal = $scope.model.FinalTotal = Math.round($scope.model.Total + $scope.model.Tax);
                        } else {
                              $scope.model.CouponDiscount = obj.DiscountAmount;
                              $scope.model.Total = ($scope.model.Total - obj.DiscountAmount);
                              $scope.model.NetTotal = $scope.model.FinalTotal = Math.round($scope.model.Total + $scope.model.Tax);

                        }
                  } else {
                        $scope.model.CouponDiscount = 0;
                  }
            }
      }

      $scope.ManageDiscount = function () {
            AdjustFinalSaleTotal();
      }

      $scope.ManageCouponDiscount = function () {
            if ($scope.model.idDiscount != '' && $scope.model.idDiscount != null && $scope.model.idDiscount != undefined) {
                  var obj = _.findWhere($scope.lstDiscount, {
                        Id: $scope.model.idDiscount
                  });
                  if (obj.StartDateUtc && obj.EndDateUtc) {
                        var CurrentDate = moment.utc().format();
                        var StartDate = moment.utc(obj.StartDateUtc).set({
                              hour: 0,
                              minute: 0,
                              second: 0,
                              millisecond: 0
                        }).format();
                        var EndDate = moment.utc(obj.EndDateUtc).set({
                              hour: 0,
                              minute: 0,
                              second: 0,
                              millisecond: 0
                        }).format();
                        if (moment(CurrentDate).isBetween(StartDate, EndDate, null, '[]')) {
                              if (obj.DiscountLimitationId == 1) {
                                    AdjustFinalSaleTotal();
                              } else {
                                    var params = {
                                          idDiscount: $scope.model.idDiscount,
                                          id: $scope.model.id
                                    }
                                    $http.get($rootScope.RoutePath + 'invoice/GetDiscountCouponCount', {
                                          params: params
                                    }).then(function (res) {
                                          if (obj.LimitationTimes <= res.data.data) {
                                                var alertPopup = $ionicPopup.alert({
                                                      title: '',
                                                      template: 'This coupon already reached its usage limit.',
                                                      cssClass: 'custPop',
                                                      okText: 'Ok',
                                                      okType: 'btn btn-green',
                                                });
                                                $scope.model.idDiscount = null;
                                                AdjustFinalSaleTotal();
                                          } else {
                                                AdjustFinalSaleTotal();
                                          }
                                    });
                              }
                        } else {
                              if (moment(CurrentDate).isBefore(StartDate)) {
                                    var alertPopup = $ionicPopup.alert({
                                          title: '',
                                          template: 'This coupon start from ' + moment(obj.StartDateUtc).format('DD-MM-YYYY') + '.',
                                          cssClass: 'custPop',
                                          okText: 'Ok',
                                          okType: 'btn btn-green',
                                    });
                              } else {
                                    var alertPopup = $ionicPopup.alert({
                                          title: '',
                                          template: 'This coupon expired.',
                                          cssClass: 'custPop',
                                          okText: 'Ok',
                                          okType: 'btn btn-green',
                                    });
                              }
                              $scope.model.idDiscount = null;
                              AdjustFinalSaleTotal();
                        }
                  } else {
                        if (obj.DiscountLimitationId == 1) {
                              AdjustFinalSaleTotal();
                        } else {
                              var params = {
                                    idDiscount: $scope.model.idDiscount,
                                    id: $scope.model.id
                              }
                              $http.get($rootScope.RoutePath + 'invoice/GetDiscountCouponCount', {
                                    params: params
                              }).then(function (res) {
                                    if (obj.LimitationTimes <= res.data.data) {
                                          var alertPopup = $ionicPopup.alert({
                                                title: '',
                                                template: 'This coupon already reached its usage limit.',
                                                cssClass: 'custPop',
                                                okText: 'Ok',
                                                okType: 'btn btn-green',
                                          });
                                          $scope.model.idDiscount = null;
                                          AdjustFinalSaleTotal();
                                    } else {
                                          AdjustFinalSaleTotal();
                                    }
                              });
                        }
                  }
            } else {
                  AdjustFinalSaleTotal();
            }
      }


      //End Main Sale Tab
      $scope.formsubmit = false;
      $scope.SaveSale = function (form) {
            if ($scope.showError) {
                  return;
            }
            var NoItemCode = _.findWhere($scope.lstSelectedSaleMain, {
                  ItemCode: ''
            });
            if (NoItemCode) {
                  $scope.lstSelectedSaleMain.pop()
                  // var alertPopup = $ionicPopup.alert({
                  //     title: '',
                  //     template: 'Item code missing.First select Item code for all items in list.',
                  //     cssClass: 'custPop',
                  //     okText: 'Ok',
                  //     okType: 'btn btn-green',
                  // });
            }
            // else {

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
                  $scope.OpeningList = [];
                  if ($scope.SaleEdit == false || $scope.SaleEdit == 'false') {
                        for (var i = 0; i < $scope.lstSelectedSaleMain.length; i++) {
                              var data = $scope.lstSelectedSaleMain[i]
                              var qty = _.findWhere(data.NewBatchLst, {
                                    BatchNumber: data.BatchNo
                              })
                              console.log(qty)
                              if (qty.Stock == 0 || qty.Stock == '0') {
                                    $scope.OpeningList.push({
                                          ItemCode: data.ItemCode,
                                          UOM: data.UOM,
                                          idLocations: data.idLocations,
                                          BatchNumber: data.BatchNo,
                                          Qty: data.Qty,
                                          Cost: 0,
                                          DocDate: new Date()
                                    })
                              }
                        }
                  }
                  console.log($scope.OpeningList, $scope.SaleEdit)
                  console.log($scope.model, $scope.lstSelectedSaleMain)
                  if ($scope.OpeningList.length > 0 && $scope.SaleEdit == false) {
                        $http.post($rootScope.RoutePath + 'itemopeningbalance/SaveMultipleItemOpeningBalance', $scope.OpeningList)
                              .then(function (res) {
                                    if (form.$invalid) {
                                          $scope.formsubmit = true;
                                          return
                                    }
                                    var BatchList = _.where($scope.lstSelectedSaleMain, {
                                          isBatch: true
                                    });

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
                              })
                  } else {

                        if (form.$invalid) {
                              $scope.formsubmit = true;
                              return
                        }
                        var BatchList = _.where($scope.lstSelectedSaleMain, {
                              isBatch: true
                        });

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
            // }


            function Save() {
                  var ListReferralUser = [];
                  $scope.isValidMobile = false
                  $scope.isValidMobile2 = false
                  if (!$scope.model.id) {
                        $scope.model.id = 0;
                  }

                  $scope.model.lstInvoiceDetail = $scope.lstSelectedSaleMain;
                  if (new Date($scope.model.InvoiceDate) == 'Invalid Date') {
                        $scope.model.InvoiceDate = moment().set({
                              'date': $scope.model.InvoiceDate.split('-')[0],
                              'month': $scope.model.InvoiceDate.split('-')[1] - 1,
                              'year': $scope.model.InvoiceDate.split('-')[2]
                        }).format('YYYY-MM-DD');

                  } else {
                        if (moment($scope.model.InvoiceDate, "DD-MM-YYYY").format('YYYY-MM-DD') == 'Invalid date') {
                              $scope.model.InvoiceDate = moment($scope.model.InvoiceDate).format('YYYY-MM-DD');

                        } else {
                              $scope.model.InvoiceDate = moment($scope.model.InvoiceDate).format('YYYY-MM-DD');

                        }
                  }
                  if ($scope.model.ReferralUserDisplay.length > 0) {
                        _.filter($scope.model.ReferralUserDisplay, function (p) {
                              var obj = _.findWhere($scope.ListUser, {
                                    username: p
                              });
                              ListReferralUser.push(obj.id);
                        })
                        $scope.model.ReferralUser = (ListReferralUser).toString();
                  }

                  // $scope.ListMaxSellingPrice = [];
                  // $scope.ListMinSellingPrice = [];
                  // _.filter($scope.lstSelectedSaleMain, function (p) {
                  //     var obj = _.findWhere(p.listUOM, { UOM: p.UOM });
                  //     if (obj) {
                  //         if (p.Price > obj.MaxSalePrice) {
                  //             $scope.ListMaxSellingPrice.push(p);
                  //         }
                  //         if (p.Price < obj.MinSalePrice) {
                  //             $scope.ListMinSellingPrice.push(p);
                  //         }
                  //     }
                  // })

                  // if ($scope.ListMaxSellingPrice.length > 0 || $scope.ListMinSellingPrice.length > 0) {
                  //     var confirmPopup = $ionicPopup.confirm({
                  //         title: "",
                  //         template: '<p ng-if="ListMaxSellingPrice.length > 0"><b>Selling Price for ' + _.pluck($scope.ListMaxSellingPrice, 'ItemCode').toString() + ' is too high base on maximum selling price.</b></p>' +
                  //             '<p ng-if="ListMinSellingPrice.length > 0"><b>And</b></p>' +
                  //             '<p ng-if="ListMinSellingPrice.length > 0"><b>Selling Price for ' + _.pluck($scope.ListMinSellingPrice, 'ItemCode').toString() + ' is too low base on minimum selling price.</b></p>' +
                  //             '<p>Are you sure you want to continue ?</p>',
                  //         cssClass: 'custPop',
                  //         cancelText: 'Cancel',
                  //         okText: 'Ok',
                  //         okType: 'btn btn-green',
                  //         cancelType: 'btn btn-red',
                  //         scope: $scope,
                  //     })
                  //     confirmPopup.then(function (res) {
                  //         if (res) {
                  //             $http.post($rootScope.RoutePath + 'invoice/SaveInvoice', $scope.model)
                  //                 .then(function (res) {
                  //                     var ResponseSales = res.data;
                  //                     if (ResponseSales.success) {

                  //                         if ($scope.IsCustomer && $scope.IsMLM == 1) {
                  //                             var RewardList = [];
                  //                             for (var i = 0; i < $scope.lstSelectedSaleMain.length; i++) {
                  //                                 var objPoint = _.findWhere($scope.lstSelectedSaleMain[i].listUOM, { UOM: $scope.lstSelectedSaleMain[i].UOM });
                  //                                 var point = 0;
                  //                                 var amount = 0;
                  //                                 var amountParent = 0;
                  //                                 var amountSponsor = 0;
                  //                                 var amountReferral = 0;
                  //                                 if (objPoint && objPoint.RewardPoint != 0 && objPoint.RewardPoint != '' && objPoint.RewardPoint != null && objPoint.RewardPoint != undefined) {
                  //                                     point = parseInt(objPoint.RewardPoint);
                  //                                     amount = (parseFloat($scope.lstSelectedSaleMain[i].Price) / 100) * point;

                  //                                     var objReward = {
                  //                                         id: 0,
                  //                                         CustomerId: $scope.Customer.id,
                  //                                         ItemCode: $scope.lstSelectedSaleMain[i].ItemCode,
                  //                                         UOM: $scope.lstSelectedSaleMain[i].UOM,
                  //                                         Qty: $scope.lstSelectedSaleMain[i].Qty,
                  //                                         SourceNo: ResponseSales.data,
                  //                                         Point: point * $scope.lstSelectedSaleMain[i].Qty,
                  //                                         Amount: amount * $scope.lstSelectedSaleMain[i].Qty,
                  //                                         Type: 'Purchase reward point amount',
                  //                                     }

                  //                                     RewardList.push(objReward);

                  //                                     if ($scope.ReferenceLevelList.length > 0 && Math.floor(parseFloat($scope.LevelCommission) / $scope.ReferenceLevelList.length) > 0) {
                  //                                         amountParent = (parseFloat($scope.lstSelectedSaleMain[i].Price) / 100) * Math.floor(parseFloat($scope.LevelCommission) / $scope.ReferenceLevelList.length);
                  //                                         if (amountParent > 0) {
                  //                                             for (var j = 0; j < $scope.ReferenceLevelList.length; j++) {
                  //                                                 var objReward1 = {
                  //                                                     id: 0,
                  //                                                     CustomerId: $scope.ReferenceLevelList[j].idReferenceBy,
                  //                                                     ItemCode: $scope.lstSelectedSaleMain[i].ItemCode,
                  //                                                     UOM: $scope.lstSelectedSaleMain[i].UOM,
                  //                                                     Qty: $scope.lstSelectedSaleMain[i].Qty,
                  //                                                     SourceNo: ResponseSales.data,
                  //                                                     Point: Math.floor(parseFloat($scope.LevelCommission) / $scope.ReferenceLevelList.length) * $scope.lstSelectedSaleMain[i].Qty,
                  //                                                     Amount: amountParent * $scope.lstSelectedSaleMain[i].Qty,
                  //                                                     Type: 'Level commission amount',
                  //                                                 }

                  //                                                 RewardList.push(objReward1);
                  //                                             }
                  //                                         }
                  //                                     }

                  //                                     if ($scope.model.DPCustomerCode && $scope.DPCommission > 0) {
                  //                                         var obj = _.findWhere($scope.ListCustomer, { AccountNumbder: $scope.model.DPCustomerCode });
                  //                                         var objReward2 = {
                  //                                             id: 0,
                  //                                             CustomerId: obj.id,
                  //                                             ItemCode: $scope.lstSelectedSaleMain[i].ItemCode,
                  //                                             UOM: $scope.lstSelectedSaleMain[i].UOM,
                  //                                             Qty: $scope.lstSelectedSaleMain[i].Qty,
                  //                                             SourceNo: ResponseSales.data,
                  //                                             Point: parseInt($scope.DPCommission) * $scope.lstSelectedSaleMain[i].Qty,
                  //                                             Amount: ((parseFloat($scope.lstSelectedSaleMain[i].Price) / 100) * parseInt($scope.DPCommission)) * $scope.lstSelectedSaleMain[i].Qty,
                  //                                             Type: 'DP commission amount',
                  //                                         }
                  //                                         RewardList.push(objReward2);
                  //                                     }

                  //                                     if ($scope.SponsorList.length > 0 && Math.floor(parseFloat($scope.SponsorCommission) / $scope.SponsorList.length) > 0) {
                  //                                         amountSponsor = (parseFloat($scope.lstSelectedSaleMain[i].Price) / 100) * Math.floor(parseFloat($scope.SponsorCommission) / $scope.SponsorList.length);
                  //                                         if (amountSponsor > 0) {
                  //                                             for (var m = 0; m < $scope.SponsorList.length; m++) {
                  //                                                 var objReward3 = {
                  //                                                     id: 0,
                  //                                                     CustomerId: $scope.SponsorList[m].idCustomer,
                  //                                                     ItemCode: $scope.lstSelectedSaleMain[i].ItemCode,
                  //                                                     UOM: $scope.lstSelectedSaleMain[i].UOM,
                  //                                                     Qty: $scope.lstSelectedSaleMain[i].Qty,
                  //                                                     SourceNo: ResponseSales.data,
                  //                                                     Point: Math.floor(parseFloat($scope.SponsorCommission) / $scope.SponsorList.length) * $scope.lstSelectedSaleMain[i].Qty,
                  //                                                     Amount: amountSponsor * $scope.lstSelectedSaleMain[i].Qty,
                  //                                                     Type: 'Sponsor commission amount',
                  //                                                 }

                  //                                                 RewardList.push(objReward3);
                  //                                             }
                  //                                         }
                  //                                     }

                  //                                     if (ListReferralUser.length > 0 && objPoint.ReferralRewardPoint != 0 && objPoint.ReferralRewardPoint != null && Math.floor(parseFloat(objPoint.ReferralRewardPoint) / ListReferralUser.length) > 0) {
                  //                                         amountReferral = (parseFloat($scope.lstSelectedSaleMain[i].Price) / 100) * Math.floor(parseFloat(objPoint.ReferralRewardPoint) / ListReferralUser.length);
                  //                                         if (amountReferral > 0) {
                  //                                             for (var n = 0; n < ListReferralUser.length; n++) {
                  //                                                 var objReward4 = {
                  //                                                     id: 0,
                  //                                                     UserId: parseInt(ListReferralUser[n]),
                  //                                                     ItemCode: $scope.lstSelectedSaleMain[i].ItemCode,
                  //                                                     UOM: $scope.lstSelectedSaleMain[i].UOM,
                  //                                                     Qty: $scope.lstSelectedSaleMain[i].Qty,
                  //                                                     SourceNo: ResponseSales.data,
                  //                                                     Point: Math.floor(parseFloat(objPoint.ReferralRewardPoint) / ListReferralUser.length) * $scope.lstSelectedSaleMain[i].Qty,
                  //                                                     Amount: amountReferral * $scope.lstSelectedSaleMain[i].Qty,
                  //                                                     Type: 'Referral commission amount',
                  //                                                 }

                  //                                                 RewardList.push(objReward4);
                  //                                             }
                  //                                         }
                  //                                     }
                  //                                 }
                  //                             }

                  //                             if (RewardList.length > 0) {
                  //                                 $http.post($rootScope.RoutePath + 'customer/SaveRewardPoint', RewardList)
                  //                                     .then(function (res) {
                  //                                         if (res.data.success) {
                  //                                             $ionicLoading.show({ template: ResponseSales.message });
                  //                                             setTimeout(function () {
                  //                                                 $ionicLoading.hide()
                  //                                             }, 1000);

                  //                                             $scope.init();
                  //                                         } else {
                  //                                             $ionicLoading.show({ template: ResponseSales.message });
                  //                                             setTimeout(function () {
                  //                                                 $ionicLoading.hide()
                  //                                             }, 1000);
                  //                                         }
                  //                                     })
                  //                             } else {
                  //                                 setTimeout(function () {
                  //                                     $ionicLoading.hide()
                  //                                 }, 1000);

                  //                                 $scope.init();
                  //                             }
                  //                         } else if ($scope.IsCustomer && $scope.IsMLM == 0 && $scope.IsReward == 1) {
                  //                             var RewardList = [];
                  //                             for (var i = 0; i < $scope.lstSelectedSaleMain.length; i++) {
                  //                                 var objPoint = _.findWhere($scope.lstSelectedSaleMain[i].listUOM, { UOM: $scope.lstSelectedSaleMain[i].UOM });
                  //                                 var point = 0;
                  //                                 var amount = 0;
                  //                                 var amountReferral = 0;
                  //                                 if (objPoint && objPoint.RewardPoint != 0 && objPoint.RewardPoint != '' && objPoint.RewardPoint != null && objPoint.RewardPoint != undefined) {
                  //                                     point = parseInt(objPoint.RewardPoint);
                  //                                     amount = (parseFloat($scope.lstSelectedSaleMain[i].Price) / 100) * point;

                  //                                     var objReward = {
                  //                                         id: 0,
                  //                                         CustomerId: $scope.Customer.id,
                  //                                         ItemCode: $scope.lstSelectedSaleMain[i].ItemCode,
                  //                                         UOM: $scope.lstSelectedSaleMain[i].UOM,
                  //                                         Qty: $scope.lstSelectedSaleMain[i].Qty,
                  //                                         SourceNo: ResponseSales.data,
                  //                                         Point: point * $scope.lstSelectedSaleMain[i].Qty,
                  //                                         Amount: amount * $scope.lstSelectedSaleMain[i].Qty,
                  //                                         Type: 'Purchase reward point amount',
                  //                                     }

                  //                                     RewardList.push(objReward);
                  //                                 }

                  //                                 if (ListReferralUser.length > 0 && objPoint.ReferralRewardPoint != 0 && objPoint.ReferralRewardPoint != null && Math.floor(parseFloat(objPoint.ReferralRewardPoint) / ListReferralUser.length) > 0) {
                  //                                     amountReferral = (parseFloat($scope.lstSelectedSaleMain[i].Price) / 100) * Math.floor(parseFloat(objPoint.ReferralRewardPoint) / ListReferralUser.length);
                  //                                     if (amountReferral > 0) {
                  //                                         for (var n = 0; n < ListReferralUser.length; n++) {
                  //                                             var objReward4 = {
                  //                                                 id: 0,
                  //                                                 UserId: parseInt(ListReferralUser[n]),
                  //                                                 ItemCode: $scope.lstSelectedSaleMain[i].ItemCode,
                  //                                                 UOM: $scope.lstSelectedSaleMain[i].UOM,
                  //                                                 Qty: $scope.lstSelectedSaleMain[i].Qty,
                  //                                                 SourceNo: ResponseSales.data,
                  //                                                 Point: Math.floor(parseFloat(objPoint.ReferralRewardPoint) / ListReferralUser.length) * $scope.lstSelectedSaleMain[i].Qty,
                  //                                                 Amount: amountReferral * $scope.lstSelectedSaleMain[i].Qty,
                  //                                                 Type: 'Referral commission amount',
                  //                                             }

                  //                                             RewardList.push(objReward4);
                  //                                         }
                  //                                     }
                  //                                 }
                  //                             }

                  //                             if (RewardList.length > 0) {
                  //                                 $http.post($rootScope.RoutePath + 'customer/SaveRewardPoint', RewardList)
                  //                                     .then(function (res) {
                  //                                         if (res.data.success) {
                  //                                             $ionicLoading.show({ template: ResponseSales.message });
                  //                                             setTimeout(function () {
                  //                                                 $ionicLoading.hide()
                  //                                             }, 1000);

                  //                                             $scope.init();
                  //                                         } else {
                  //                                             $ionicLoading.show({ template: ResponseSales.message });
                  //                                             setTimeout(function () {
                  //                                                 $ionicLoading.hide()
                  //                                             }, 1000);
                  //                                         }
                  //                                     })
                  //                             } else {
                  //                                 setTimeout(function () {
                  //                                     $ionicLoading.hide()
                  //                                 }, 1000);

                  //                                 $scope.init();
                  //                             }
                  //                         } else {
                  //                             $ionicLoading.show({ template: ResponseSales.message });
                  //                             setTimeout(function () {
                  //                                 $ionicLoading.hide()
                  //                             }, 1000);

                  //                             $scope.init();
                  //                         }
                  //                     } else {
                  //                         if (ResponseSales.CanConvert) {
                  //                             var confirmPopup = $ionicPopup.confirm({
                  //                                 title: "",
                  //                                 template: 'Some of the item(s) in back order level,do you want to do UOM conversion for those item(s)?',
                  //                                 cssClass: 'custPop',
                  //                                 cancelText: 'Cancel',
                  //                                 okText: 'Ok',
                  //                                 okType: 'btn btn-green',
                  //                                 cancelType: 'btn btn-red',
                  //                             })
                  //                             confirmPopup.then(function (resmodal) {
                  //                                 if (resmodal) {
                  //                                     var objUOM = _.findWhere($scope.lstSelectedSaleMain, { ItemCode: ResponseSales.data.ItemCode });
                  //                                     objUOM.FromQty = ResponseSales.data.FromQty;
                  //                                     objUOM.FromRate = ResponseSales.data.FromRate;
                  //                                     objUOM.FromUOM = ResponseSales.data.FromUOM;
                  //                                     objUOM.ToUOM = ResponseSales.data.ToUOM;
                  //                                     objUOM.ToRate = ResponseSales.data.ToRate;
                  //                                     $scope.InitUOMFunction(objUOM);
                  //                                 }
                  //                             });
                  //                         } else {
                  //                             $ionicLoading.show({ template: ResponseSales.message });
                  //                             setTimeout(function () {
                  //                                 $ionicLoading.hide()
                  //                             }, 1000);
                  //                         }
                  //                     }

                  //                 })
                  //                 .catch(function (err) {
                  //                     $ionicLoading.show({ template: 'Unable to save record right now. Please try again later.' });
                  //                     setTimeout(function () {
                  //                         $ionicLoading.hide()
                  //                     }, 1000);
                  //                 });
                  //             $scope.IsSave = true;
                  //         }
                  //     })
                  // } else {
                  $rootScope.ShowLoader();
                  $http.post($rootScope.RoutePath + 'invoice/SaveInvoice', $scope.model)
                        .then(function (res) {
                              var ResponseSales = res.data;
                              // $scope.GenerateReport(res.data.data)
                              if (ResponseSales.success) {
                                    $scope.GenerateReport(ResponseSales.Invoiceid)
                                    $scope.SaveNewMRP();
                                    if ($scope.IsCustomer && $scope.IsMLM == 1) {
                                          var RewardList = [];
                                          for (var i = 0; i < $scope.lstSelectedSaleMain.length; i++) {
                                                var objPoint = _.findWhere($scope.lstSelectedSaleMain[i].listUOM, {
                                                      UOM: $scope.lstSelectedSaleMain[i].UOM
                                                });
                                                var point = 0;
                                                var amount = 0;
                                                var amountParent = 0;
                                                var amountSponsor = 0;
                                                var amountReferral = 0;
                                                if (objPoint && objPoint.RewardPoint != 0 && objPoint.RewardPoint != '' && objPoint.RewardPoint != null && objPoint.RewardPoint != undefined) {
                                                      point = parseInt(objPoint.RewardPoint);
                                                      amount = (parseFloat($scope.lstSelectedSaleMain[i].Price) / 100) * point;

                                                      var objReward = {
                                                            id: 0,
                                                            CustomerId: $scope.Customer.id,
                                                            ItemCode: $scope.lstSelectedSaleMain[i].ItemCode,
                                                            UOM: $scope.lstSelectedSaleMain[i].UOM,
                                                            Qty: $scope.lstSelectedSaleMain[i].Qty,
                                                            SourceNo: ResponseSales.data,
                                                            Point: point * $scope.lstSelectedSaleMain[i].Qty,
                                                            Amount: amount * $scope.lstSelectedSaleMain[i].Qty,
                                                            Type: 'Purchase reward point amount',
                                                      }

                                                      RewardList.push(objReward);

                                                      if ($scope.ReferenceLevelList.length > 0 && Math.floor(parseFloat($scope.LevelCommission) / $scope.ReferenceLevelList.length) > 0) {
                                                            amountParent = (parseFloat($scope.lstSelectedSaleMain[i].Price) / 100) * Math.floor(parseFloat($scope.LevelCommission) / $scope.ReferenceLevelList.length);
                                                            if (amountParent > 0) {
                                                                  for (var j = 0; j < $scope.ReferenceLevelList.length; j++) {
                                                                        var objReward1 = {
                                                                              id: 0,
                                                                              CustomerId: $scope.ReferenceLevelList[j].idReferenceBy,
                                                                              ItemCode: $scope.lstSelectedSaleMain[i].ItemCode,
                                                                              UOM: $scope.lstSelectedSaleMain[i].UOM,
                                                                              Qty: $scope.lstSelectedSaleMain[i].Qty,
                                                                              SourceNo: ResponseSales.data,
                                                                              Point: Math.floor(parseFloat($scope.LevelCommission) / $scope.ReferenceLevelList.length) * $scope.lstSelectedSaleMain[i].Qty,
                                                                              Amount: amountParent * $scope.lstSelectedSaleMain[i].Qty,
                                                                              Type: 'Level commission amount',
                                                                        }

                                                                        RewardList.push(objReward1);
                                                                  }
                                                            }
                                                      }

                                                      if ($scope.model.DPCustomerCode && $scope.DPCommission > 0) {
                                                            var obj = _.findWhere($scope.ListCustomer, {
                                                                  AccountNumbder: $scope.model.DPCustomerCode
                                                            });
                                                            var objReward2 = {
                                                                  id: 0,
                                                                  CustomerId: obj.id,
                                                                  ItemCode: $scope.lstSelectedSaleMain[i].ItemCode,
                                                                  UOM: $scope.lstSelectedSaleMain[i].UOM,
                                                                  Qty: $scope.lstSelectedSaleMain[i].Qty,
                                                                  SourceNo: ResponseSales.data,
                                                                  Point: parseInt($scope.DPCommission) * $scope.lstSelectedSaleMain[i].Qty,
                                                                  Amount: ((parseFloat($scope.lstSelectedSaleMain[i].Price) / 100) * parseInt($scope.DPCommission)) * $scope.lstSelectedSaleMain[i].Qty,
                                                                  Type: 'DP commission amount',
                                                            }
                                                            RewardList.push(objReward2);
                                                      }

                                                      if ($scope.SponsorList.length > 0 && Math.floor(parseFloat($scope.SponsorCommission) / $scope.SponsorList.length) > 0) {
                                                            amountSponsor = (parseFloat($scope.lstSelectedSaleMain[i].Price) / 100) * Math.floor(parseFloat($scope.SponsorCommission) / $scope.SponsorList.length);
                                                            if (amountSponsor > 0) {
                                                                  for (var m = 0; m < $scope.SponsorList.length; m++) {
                                                                        var objReward3 = {
                                                                              id: 0,
                                                                              CustomerId: $scope.SponsorList[m].idCustomer,
                                                                              ItemCode: $scope.lstSelectedSaleMain[i].ItemCode,
                                                                              UOM: $scope.lstSelectedSaleMain[i].UOM,
                                                                              Qty: $scope.lstSelectedSaleMain[i].Qty,
                                                                              SourceNo: ResponseSales.data,
                                                                              Point: Math.floor(parseFloat($scope.SponsorCommission) / $scope.SponsorList.length) * $scope.lstSelectedSaleMain[i].Qty,
                                                                              Amount: amountSponsor * $scope.lstSelectedSaleMain[i].Qty,
                                                                              Type: 'Sponsor commission amount',
                                                                        }

                                                                        RewardList.push(objReward3);
                                                                  }
                                                            }
                                                      }

                                                      if (ListReferralUser.length > 0 && objPoint.ReferralRewardPoint != 0 && objPoint.ReferralRewardPoint != null && Math.floor(parseFloat(objPoint.ReferralRewardPoint) / ListReferralUser.length) > 0) {
                                                            amountReferral = (parseFloat($scope.lstSelectedSaleMain[i].Price) / 100) * Math.floor(parseFloat(objPoint.ReferralRewardPoint) / ListReferralUser.length);
                                                            if (amountReferral > 0) {
                                                                  for (var n = 0; n < ListReferralUser.length; n++) {
                                                                        var objReward4 = {
                                                                              id: 0,
                                                                              UserId: parseInt(ListReferralUser[n]),
                                                                              ItemCode: $scope.lstSelectedSaleMain[i].ItemCode,
                                                                              UOM: $scope.lstSelectedSaleMain[i].UOM,
                                                                              Qty: $scope.lstSelectedSaleMain[i].Qty,
                                                                              SourceNo: ResponseSales.data,
                                                                              Point: Math.floor(parseFloat(objPoint.ReferralRewardPoint) / ListReferralUser.length) * $scope.lstSelectedSaleMain[i].Qty,
                                                                              Amount: amountReferral * $scope.lstSelectedSaleMain[i].Qty,
                                                                              Type: 'Referral commission amount',
                                                                        }

                                                                        RewardList.push(objReward4);
                                                                  }
                                                            }
                                                      }
                                                }
                                          }

                                          if (RewardList.length > 0) {
                                                $http.post($rootScope.RoutePath + 'customer/SaveRewardPoint', RewardList)
                                                      .then(function (res) {
                                                            if (res.data.success) {
                                                                  $ionicLoading.show({
                                                                        template: ResponseSales.message
                                                                  });
                                                                  setTimeout(function () {
                                                                        $ionicLoading.hide()
                                                                  }, 1000);

                                                                  $scope.init();
                                                            } else {
                                                                  $ionicLoading.show({
                                                                        template: ResponseSales.message
                                                                  });
                                                                  setTimeout(function () {
                                                                        $ionicLoading.hide()
                                                                  }, 1000);
                                                            }
                                                      })
                                          } else {
                                                $ionicLoading.show({
                                                      template: ResponseSales.message
                                                });
                                                setTimeout(function () {
                                                      $ionicLoading.hide()
                                                }, 1000);

                                                $scope.init();
                                          }
                                    } else if ($scope.IsCustomer && $scope.IsMLM == 0 && $scope.IsReward == 1) {
                                          var RewardList = [];
                                          for (var i = 0; i < $scope.lstSelectedSaleMain.length; i++) {
                                                var objPoint = _.findWhere($scope.lstSelectedSaleMain[i].listUOM, {
                                                      UOM: $scope.lstSelectedSaleMain[i].UOM
                                                });
                                                var point = 0;
                                                var amount = 0;
                                                var amountReferral = 0;
                                                if (objPoint && objPoint.RewardPoint != 0 && objPoint.RewardPoint != '' && objPoint.RewardPoint != null && objPoint.RewardPoint != undefined) {
                                                      point = parseInt(objPoint.RewardPoint);
                                                      amount = (parseFloat($scope.lstSelectedSaleMain[i].Price) / 100) * point;

                                                      var objReward = {
                                                            id: 0,
                                                            CustomerId: $scope.Customer.id,
                                                            ItemCode: $scope.lstSelectedSaleMain[i].ItemCode,
                                                            UOM: $scope.lstSelectedSaleMain[i].UOM,
                                                            Qty: $scope.lstSelectedSaleMain[i].Qty,
                                                            SourceNo: ResponseSales.data,
                                                            Point: point * $scope.lstSelectedSaleMain[i].Qty,
                                                            Amount: amount * $scope.lstSelectedSaleMain[i].Qty,
                                                            Type: 'Purchase reward point amount',
                                                      }

                                                      RewardList.push(objReward);
                                                }

                                                if (ListReferralUser.length > 0 && objPoint.ReferralRewardPoint != 0 && objPoint.ReferralRewardPoint != null && Math.floor(parseFloat(objPoint.ReferralRewardPoint) / ListReferralUser.length) > 0) {
                                                      amountReferral = (parseFloat($scope.lstSelectedSaleMain[i].Price) / 100) * Math.floor(parseFloat(objPoint.ReferralRewardPoint) / ListReferralUser.length);
                                                      if (amountReferral > 0) {
                                                            for (var n = 0; n < ListReferralUser.length; n++) {
                                                                  var objReward4 = {
                                                                        id: 0,
                                                                        UserId: parseInt(ListReferralUser[n]),
                                                                        ItemCode: $scope.lstSelectedSaleMain[i].ItemCode,
                                                                        UOM: $scope.lstSelectedSaleMain[i].UOM,
                                                                        Qty: $scope.lstSelectedSaleMain[i].Qty,
                                                                        SourceNo: ResponseSales.data,
                                                                        Point: Math.floor(parseFloat(objPoint.ReferralRewardPoint) / ListReferralUser.length) * $scope.lstSelectedSaleMain[i].Qty,
                                                                        Amount: amountReferral * $scope.lstSelectedSaleMain[i].Qty,
                                                                        Type: 'Referral commission amount',
                                                                  }

                                                                  RewardList.push(objReward4);
                                                            }
                                                      }
                                                }
                                          }

                                          if (RewardList.length > 0) {
                                                $http.post($rootScope.RoutePath + 'customer/SaveRewardPoint', RewardList)
                                                      .then(function (res) {
                                                            if (res.data.success) {
                                                                  $ionicLoading.show({
                                                                        template: ResponseSales.message
                                                                  });
                                                                  setTimeout(function () {
                                                                        $ionicLoading.hide()
                                                                  }, 1000);

                                                                  $scope.init();
                                                            } else {
                                                                  $ionicLoading.show({
                                                                        template: ResponseSales.message
                                                                  });
                                                                  setTimeout(function () {
                                                                        $ionicLoading.hide()
                                                                  }, 1000);
                                                            }
                                                      })
                                          } else {
                                                setTimeout(function () {
                                                      $ionicLoading.hide()
                                                }, 1000);

                                                $scope.init();
                                          }
                                    } else {
                                          $ionicLoading.show({
                                                template: ResponseSales.message
                                          });
                                          setTimeout(function () {
                                                $ionicLoading.hide()
                                          }, 1000);

                                          $scope.init();
                                    }
                              } else {
                                    if (ResponseSales.CanConvert) {
                                          // var confirmPopup = $ionicPopup.confirm({
                                          //     title: 'Confirm',
                                          //     template: 'Some of the item(s) in back order level,do you want to do UOM conversion for those item(s)?',
                                          //     cssClass: 'customPopup',
                                          //     scope: $scope,
                                          // });
                                          // confirmPopup.then(function (resmodal) {
                                          //     if (resmodal) {
                                          var objUOM = _.findWhere($scope.lstSelectedSaleMain, {
                                                ItemCode: ResponseSales.data.ItemCode
                                          });
                                          objUOM.FromQty = ResponseSales.data.FromQty;
                                          objUOM.FromRate = ResponseSales.data.FromRate;
                                          objUOM.FromUOM = ResponseSales.data.FromUOM;
                                          objUOM.ToUOM = ResponseSales.data.ToUOM;
                                          objUOM.ToRate = ResponseSales.data.ToRate;
                                          $scope.InitUOMFunction(objUOM);
                                          //     }
                                          // });
                                    } else {
                                          $ionicLoading.show({
                                                template: ResponseSales.message
                                          });
                                          setTimeout(function () {
                                                $ionicLoading.hide()
                                          }, 1000);
                                    }
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

            // }
      };


      // Use more distinguished and understandable naming
      $scope.CopyToModel = function (id) {
            var selectedItem = _.findWhere($scope.lstdata, {
                  id: parseInt(id)
            });
            $scope.SaleEdit = true;
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
                  if (prop == 'ReferralUserDisplay') {
                        $scope.model['ReferralUserDisplay'] = [];
                  }
                  if ((prop == 'Weight' || prop == 'WeightAmount' || prop == 'Freight' || prop == 'FreightAmount') && selectedItem.invoiceadvancedetail) {
                        $scope.model[prop] = selectedItem.invoiceadvancedetail[prop];
                  }
                  if (prop == "LoginUserCode") {
                        $scope.model['LoginUserCode'] = $localstorage.get('UserCode')
                  }
                  if (prop == 'TotalSaving') {
                        $scope.model['TotalSaving'] = 0;
                  }
                  if (prop == 'CustomerGroupName') {
                        $scope.model['CustomerGroupName'] = $localstorage.get('CustomerGroup')
                  }

                  if (prop == 'CustomerCode') {
                        var obj = _.findWhere($scope.lstCustomer, {
                              AccountNumbder: $scope.model[prop]
                        });
                        if (obj) {
                              if (obj.idGroup) {
                                    $scope.CustomerGroup = obj.customergroup;
                              } else {
                                    $scope.CustomerGroup = null;
                              }
                        }
                  }
            }


            if ($scope.model.idDiscount != null && $scope.model.idDiscount != undefined && $scope.model.idDiscount != '') {
                  var obj2 = _.findWhere($scope.lstDiscount, {
                        Id: $scope.model.idDiscount
                  });
                  if (obj2.UsePercentage == 1) {
                        $scope.model.CouponDiscount = ($scope.model.Total * obj2.DiscountPercentage) / 100;
                  } else {
                        $scope.model.CouponDiscount = obj2.DiscountAmount;
                  }
            }

            if ($scope.model.ReferralUser != null && $scope.model.ReferralUser != '' && $scope.model.ReferralUser != undefined) {
                  var List = $scope.model.ReferralUser.split(",").map(Number);
                  _.filter(List, function (p) {
                        var obj = _.findWhere($scope.ListUser, {
                              id: p
                        });
                        $scope.model.ReferralUserDisplay.push(obj.username);
                  })
            }

            $scope.lstSelectedSaleMain = selectedItem.invoicedetails;

            $scope.lstSelectedSaleMain = _.sortBy($scope.lstSelectedSaleMain, 'sequence');

            if ($scope.lstSelectedSaleMain.length > 0) {

                  for (let i = 0; i < $scope.lstSelectedSaleMain.length; i++) {

                        $http.get($rootScope.RoutePath + 'item/GetAllItemByItemCode?ItemCode=' + $scope.lstSelectedSaleMain[i].ItemCode).then(function (res) {
                              $scope.lstItems = res.data.data;
                              $scope.lstSelectedSaleMain[i].IsEdit = false;

                              $scope.lstSelectedSaleMain[i].idLocations = ($scope.lstSelectedSaleMain[i].idLocations).toString();
                              $scope.lstSelectedSaleMain[i].ItemName = $scope.lstItems[0].ItemName;
                              $scope.lstSelectedSaleMain[i].HSNCode = $scope.lstItems[0].HSNCode;
                              $scope.lstSelectedSaleMain[i].Descriptions2 = $scope.lstItems[0].Descriptions2;
                              $scope.lstSelectedSaleMain[i].itemmargins = $scope.lstItems[0].itemmargins;

                              if ($scope.lstSelectedSaleMain[i].sequence == null) {
                                    $scope.lstSelectedSaleMain[i].sequence = i + 1
                              }
                              if ($scope.lstSelectedSaleMain[i].TaxCode) {
                                    var obj = _.findWhere($scope.lstTaxCode, {
                                          TaxType: $scope.lstSelectedSaleMain[i].TaxCode
                                    });
                                    if (obj) {
                                          $scope.lstSelectedSaleMain[i].TaxRate = obj.TaxRate;
                                    }
                              }

                              if ($scope.lstSelectedSaleMain[i].idLocations) {
                                    var obj1 = _.findWhere($scope.lstLocations, {
                                          id: parseInt($scope.lstSelectedSaleMain[i].idLocations)
                                    });
                                    // $scope.lstSelectedSaleMain[i].idLocations = ($scope.lstSelectedSaleMain[i].idLocations).toString();
                                    if (obj1) {
                                          $scope.lstSelectedSaleMain[i].DisplayLocation = obj1.Name;
                                    }
                              }


                              var objItem1 = _.findWhere($scope.lstItems, {
                                    ItemCode: $scope.lstSelectedSaleMain[i].ItemCode
                              });

                              if (objItem1) {
                                    $scope.lstSelectedSaleMain[i].listUOM = objItem1.itemuoms;
                                    $scope.lstSelectedSaleMain[i].SaleUOM = objItem1.SalesUOM;
                                    $scope.lstSelectedSaleMain[i].ItemId = objItem1.id;
                                    if (objItem1.isBatch == 1) {
                                          $scope.lstSelectedSaleMain[i].isBatch = true;
                                          $scope.lstSelectedSaleMain[i].BatchList = objItem1.itembatches;
                                    } else {
                                          $scope.lstSelectedSaleMain[i].isBatch = false;
                                          $scope.lstSelectedSaleMain[i].BatchList = objItem1.itembatches;
                                    }

                                    if ($scope.lstSelectedSaleMain[i].BatchList.length > 0) {
                                          var selectedBatch = _.findWhere($scope.lstSelectedSaleMain[i].BatchList, {
                                                BatchNumber: $scope.lstSelectedSaleMain[i].BatchNo
                                          })

                                          if (selectedBatch) {
                                                $scope.lstSelectedSaleMain[i].ExpiryDate = selectedBatch.ExpiryDate
                                                $scope.lstSelectedSaleMain[i].PurchaseRate = selectedBatch.PurchaseRate
                                          }
                                          _.filter($scope.lstSelectedSaleMain[i].BatchList, function (z) {
                                                var objStock = {
                                                      ItemCode: $scope.lstSelectedSaleMain[i].ItemCode,
                                                      BatchNo: z.BatchNumber,
                                                      UOM: $scope.lstSelectedSaleMain[i].UOM,
                                                      Location: $scope.lstSelectedSaleMain[i].idLocations
                                                }
                                                $http.get($rootScope.RoutePath + 'item/GetAllItemBatchBalQtyByItemCode', {
                                                      params: objStock
                                                }).then(function (res) {
                                                      var objz = res.data.data;
                                                      z['Stock'] = objz ? objz.BalQty : 0;

                                                });
                                                // var objz = _.findWhere(objItem1.itembatchbalqties, { BatchNo: z.BatchNumber, UOM: $scope.lstSelectedSaleMain[i].UOM, Location: $scope.lstSelectedSaleMain[i].idLocations });
                                                // z['Stock'] = objz ? objz.BalQty : 0;
                                          })
                                    }

                                    if ($scope.lstSelectedSaleMain[i].BatchNo) {
                                          var Rate = 1;
                                          if (objItem1.SalesUOM != $scope.lstSelectedSaleMain[i].UOM) {
                                                Rate = 1 * _.findWhere(objItem1.itemuoms, {
                                                      UOM: objItem1.SalesUOM
                                                }).Rate;
                                          }
                                          $scope.lstSelectedSaleMain[i]['MRP'] = $scope.lstSelectedSaleMain[i].itembatch.MRP / Rate;
                                    } else {
                                          $scope.lstSelectedSaleMain[i]['MRP'] = _.findWhere(objItem1.itemuoms, {
                                                UOM: $scope.lstSelectedSaleMain[i].UOM
                                          }).MRP;
                                    }
                              } else {
                                    $scope.lstSelectedSaleMain[i].listUOM = [];
                                    $scope.lstSelectedSaleMain[i].ItemId = null;
                                    if ($scope.lstSelectedSaleMain[i].BatchNo) {
                                          var Rate = _.findWhere(objItem1.itemuoms, {
                                                UOM: $scope.lstSelectedSaleMain[i].UOM
                                          });

                                          if (objItem1.SalesUOM != $scope.lstSelectedSaleMain[i].UOM) {
                                                Rate = 1 * _.findWhere(objItem1.itemuoms, {
                                                      UOM: objItem1.SalesUOM
                                                });
                                          }
                                          if (Rate) {
                                                $scope.lstSelectedSaleMain[i]['MRP'] = $scope.lstSelectedSaleMain[i].itembatch.MRP / Rate.Rate;
                                          } else {
                                                $scope.lstSelectedSaleMain[i]['MRP'] = $scope.lstSelectedSaleMain[i].itembatch.MRP;
                                          }
                                    } else {
                                          $scope.lstSelectedSaleMain[i]['MRP'] = 0;
                                    }
                              }

                              $scope.lstSelectedSaleMain[i].LastBalQty = $scope.lstSelectedSaleMain[i].Qty;
                              $scope.lstSelectedSaleMain[i].LastBatchNo = $scope.lstSelectedSaleMain[i].BatchNo;
                              $scope.lstSelectedSaleMain[i].LastLocation = $scope.lstSelectedSaleMain[i].idLocations;
                              $scope.lstSelectedSaleMain[i].LastItemCode = $scope.lstSelectedSaleMain[i].ItemCode;
                              $scope.lstSelectedSaleMain[i].LastUOM = $scope.lstSelectedSaleMain[i].UOM;

                              if ($scope.lstSelectedSaleMain[i].DiscountAmount) {
                                    $scope.lstSelectedSaleMain[i].DiscountPercentage = ($scope.lstSelectedSaleMain[i].DiscountAmount / ($scope.lstSelectedSaleMain[i].Qty * $scope.lstSelectedSaleMain[i].Price)) * 100;
                              }
                              $scope.model.TotalSaving = $scope.model.TotalSaving + parseFloat($scope.lstSelectedSaleMain[i].Qty * (($scope.lstSelectedSaleMain[i].MRP)) - $scope.lstSelectedSaleMain[i].NetTotal);
                              // $scope.MangeMargin($scope.lstSelectedSaleMain[i])
                        })
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
            var obj = _.findWhere($scope.lstdata, {
                  id: parseInt(id)
            });
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
                              id: id,
                              DocNo: obj.DocNo
                        };
                        $rootScope.ShowLoader();
                        $http.get($rootScope.RoutePath + 'invoice/DeleteInvoice', {
                              params: params
                        }).success(function (data) {
                              $ionicLoading.show({
                                    template: data.message
                              });
                              setTimeout(function () {
                                    $ionicLoading.hide()
                                    InitDataTable()
                              }, 1000);
                        }).catch(function (err) {
                              $ionicLoading.show({
                                    template: 'Unable to delete record right now. Please try again later.'
                              });
                              setTimeout(function () {
                                    $ionicLoading.hide()
                                    $scope.init();
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
                  idDiscount: null,
                  CouponDiscount: 0,
                  Weight: 0,
                  WeightAmount: 0,
                  Freight: 0,
                  FreightAmount: 0,
                  DPCustomerCode: null,
                  ReferralUser: null,
                  ReferralUserDisplay: [],
                  LoginUserCode: $localstorage.get('UserCode'),
                  TotalSaving: 0,
                  CustomerGroupName: $localstorage.get('CustomerGroup'),
                  PurchaseId: null,
                  Remark: null,
            };
            $scope.Searchmodel = {
                  Search: '',
            }
            $scope.Searchmodel1 = {

                  Search: '',
            }
            $scope.lstSelectedSaleMain = [];
            $scope.NewMRPlist = [];
            $scope.AddSaleMainItemInList();
            $scope.IsSave = false;
      };

      $scope.DisplayCustomerCode = function (o) {
            $scope.model.CustomerCode = DisplayCustomerCode(o.CustomerCode);
            $scope.SelectCustomer($scope.model.CustomerCode)
      }

      function DisplayCustomerCode(CustomerCode) {
            var obj = _.findWhere($scope.lstCustomer, {
                  id: parseInt(CustomerCode)
            });
            if (obj) {
                  return obj.AccountNumbder;
            } else {
                  return "";
            }
      }

      $scope.FilterData = function () {
            $('#SalesTable').dataTable().api().ajax.reload();
      }

      $scope.EnableFilterOption = function () {
            $(function () {
                  $(".CustFilter").slideToggle();
            });
      };

      $scope.FilterAdvanceData = function (o) {
            $scope.modelAdvanceSearch = o;
            // $('#SalesTable').dataTable().api().ajax.reload();
            InitDataTable();
      }

      //Set Table
      function InitDataTable() {
            if ($.fn.DataTable.isDataTable('#SalesTable')) {
                  $('#SalesTable').DataTable().destroy();
            }
            $('#SalesTable').DataTable({
                  "processing": true,
                  "dom": 'rt<"bottom"<"left"<"length"l><"info"i>><"right"<"pagination"p>>>',
                  "serverSide": true,
                  "responsive": true,
                  "aaSorting": [0, 'DESC'],
                  "ajax": {
                        url: $rootScope.RoutePath + 'invoice/GetAllInvoiceDynamic',
                        data: function (d) {
                              if ($scope.Searchmodel.Search != undefined) {
                                    d.search = $scope.Searchmodel.Search;
                              }

                              d.idLocations = $scope.IsAdmin ? "" : $localstorage.get('idLocations');
                              // d.idLocations = $scope.IsAdmin ? "" : $localstorage.get('CustomerGroup') == 'Genmed' ? "" : $localstorage.get('idLocations');
                              // d.CustomerCode = $scope.IsAdmin ? "" : $scope.Customer ? $scope.Customer.AccountNumbder : "";
                              d.CustomerCode = $scope.IsAdmin ? "" : "";
                              d.modelAdvanceSearch = $scope.modelAdvanceSearch;

                              return d;
                        },
                        type: "get",
                        dataSrc: function (json) {
                              if (json.success != false) {
                                    $scope.lstdata = json.data;
                                    $scope.$apply(function () {
                                          $scope.TotalSalesAmount = json.TotalAmount
                                    })
                                    for (var i = 0; i < $scope.lstdata.length; i++) {
                                          $scope.lstdata[i].NetTotal = Math.round($scope.lstdata[i].NetTotal)
                                          $scope.lstdata[i].FinalTotal = Math.round($scope.lstdata[i].FinalTotal)

                                    }
                                    
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
                              "data": "id",
                              "sortable": false
                        },
                        {
                              "data": "DocNo",
                              "defaultContent": "N/A"
                        },
                        {
                              "data": "InvoiceDate",
                              "defaultContent": "N/A"
                        },
                        {
                              "data": "CustomerCode",
                              "defaultContent": "N/A"
                        },
                        {
                              "data": "CustomerName",
                              "defaultContent": "N/A"
                        },
                        // { "data": "Description", "defaultContent": "N/A" },
                        {
                              "data": "BranchCode",
                              "defaultContent": "N/A"
                        },
                        // { "data": "idStatus", "defaultContent": "N/A" },
                        {
                              "data": "Total",
                              "defaultContent": "N/A"
                        },
                        {
                              "data": "Tax",
                              "defaultContent": "N/A"
                        },
                        {
                              "data": "FinalTotal",
                              "defaultContent": "N/A"
                        },
                        {
                              "data": "IsFavorite",
                              "sortable": false,
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
                              "targets": [6, 7, 8],
                              className: "right-aligned-cell"
                        },
                        // , {
                        //     "render": function (data, type, row) {
                        //         var Action = data;
                        //         if (data != null && data != undefined && data != '') {
                        //             Action = (data).toString();
                        //             if (Action.length > 50) {
                        //                 Action = '<span title="' + Action + '">' + data.substr(0, 50) + '...</span>';
                        //             }
                        //         }
                        //         return Action;
                        //     },

                        //     "targets": 5
                        // },
                        // {
                        //     "render": function (data, type, row) {
                        //         var Action = "";
                        //         var findStatus = _.findWhere($scope.lstStatus, { id: row.idStatus });
                        //         if (findStatus) {
                        //             var FindNextStatus = _.findWhere($scope.lstStatus, { Order: findStatus.Order });
                        //             if (FindNextStatus) {
                        //                 Action = FindNextStatus.Status;
                        //             }
                        //         } else {
                        //             return "N/A";
                        //         }
                        //         return Action;
                        //     },
                        //     "targets": 7
                        // },
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
                              "targets": 9,
                        },
                        {
                              "render": function (data, type, row) {
                                    var Action = '<div layout="row" layout-align="center center">';
                                    Action += '<a ng-click="CopyToModel(' + row.id + ')" class="btnAction btnAction-edit" style="cursor:pointer"><i class="ion-edit" title="Edit"></i></a>&nbsp;';
                                    Action += '<a ng-click="DeleteItem(' + row.id + ')" class="btnAction btnAction-error" style="cursor:pointer"><i class="ion-trash-a" title="Delete"></i></a>&nbsp;';
                                    if ($scope.CurrentCustomerGroup != 'Shop') {
                                          Action += '<a ng-click="GenerateReport(' + row.id + ')" class="btnAction btnAction-info" style="cursor:pointer"><i class="ion-document-text" title="Document"></i></a>&nbsp;';
                                          Action += '<a ng-click="StockTransfer(' + row.id + ')" class="btnAction btnAction-alert" style="cursor:pointer"><i class="ion-arrow-swap" title="Stock Transfer"></i></a>&nbsp;';
                                          Action += '<a ng-click="CopySale(' + row.id + ')" class="btnAction btnAction-info" style="cursor:pointer"><i class="ion-ios-copy" title="Copy Sale"></i></a>&nbsp;';
                                          Action += '<a ng-click="OpenDeliveryPackingSlip(' + row.id + ')" class="btnAction btnAction-alert" style="cursor:pointer"><i class="ion-ios-list" title="Generate Delivery Slip"></i></a>&nbsp;';
                                          Action += '<a ng-click="Export(' + row.id + ')" class="btnAction btnAction-alert" style="cursor:pointer"><i class="ion-ios-list" title="Export"></i></a>&nbsp;';
                                          var findStatus = _.findWhere($scope.lstStatus, {
                                                id: row.idStatus
                                          });
                                          if (findStatus && findStatus.Order != '' && findStatus.Order != null) {
                                                var FindNextStatus = _.findWhere($scope.lstStatus, {
                                                      Order: findStatus.Order + 1
                                                });
                                                if (FindNextStatus) {
                                                      Action += ' <button type="button" class="btn btn-success" ng-click="UpdateSalesStatus(' + row.id + ',' + FindNextStatus.id + ')">' + FindNextStatus.Status + '</button>';
                                                }
                                                Action += '</div>';
                                          }
                                    }
                                    return Action;
                              },
                              "targets": 10
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
            // if ($scope.IsCustomer && $scope.Customer) {
            //     $scope.model.CustomerCode = $scope.Customer.AccountNumbder;
            //     $scope.SelectCustomer($scope.model.CustomerCode);
            // }
            $scope.GetInvoiceDocNo();
            $scope.formsubmit = false;
            $rootScope.BackButton = $scope.IsList = false;
      }

      $scope.GetInvoiceDocNo = function () {
            $http.get($rootScope.RoutePath + 'invoice/GetInvoiceDocNo?LoginUserCode=' + $localstorage.get('UserCode')).then(function (res) {
                  $scope.model.DocNo = res.data;
            });
      }

      $scope.GenerateReport = function (Id) {
            if ($localstorage.get('CustomerGroup') == 'Shop') {
                  window.open($rootScope.RoutePath + "invoice/GenerateInvoiceShop?Id=" + Id, '_blank');
            } else {
                  window.open($rootScope.RoutePath + "invoice/GenerateInvoice?Id=" + Id, '_blank');
            }
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

      $scope.CopySale = function (o) {
            $scope.Copy = false;
            var obj1 = _.findWhere($scope.lstdata, {
                  id: parseInt(o)
            });
            var obj = angular.copy(obj1);
            $scope.lstSelectedSaleMain = [];

            obj.id = 0;
            obj.DocNo = null;
            obj.InvoiceDate = moment().format('YYYY-MM-DD');
            obj.idStatus = 1;
            obj.CreatedBy = parseInt($localstorage.get('UserId'));
            obj.CreatedDate = null;
            obj.ModifiedBy = null;
            obj.ModifiedDate = null;
            obj.LoginUserCode = $localstorage.get('UserCode');

            _.filter(obj.invoicedetails, function (p) {
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
                        template: '<p>Are you sure, you want to copy this sale?</p>',
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
                  $rootScope.ShowLoader();
                  $http.post($rootScope.RoutePath + 'invoice/SaveInvoice', $scope.model)
                        .then(function (res) {
                              var ResponseSales = res.data;
                              if (ResponseSales.success) {
                                    $ionicLoading.show({
                                          template: ResponseSales.message
                                    });
                                    setTimeout(function () {
                                          $ionicLoading.hide()
                                    }, 1000);
                                    $scope.GenerateReport(res.data.data)
                                    $scope.init();
                                    $scope.Copy = false;
                              } else {
                                    if (ResponseSales.CanConvert) {
                                          // var confirmPopup = $ionicPopup.confirm({
                                          //     title: 'Confirm',
                                          //     template: 'Some of the item(s) in back order leval,do you want to do UOM conversion for thoes item(s)?',
                                          //     cssClass: 'customPopup',
                                          //     scope: $scope,
                                          // });
                                          // confirmPopup.then(function (resmodal) {
                                          //     if (resmodal) {
                                          $scope.Copy = true;
                                          $scope.CopyId = o;
                                          var objUOM = _.findWhere($scope.lstSelectedSaleMain, {
                                                ItemCode: ResponseSales.data.ItemCode
                                          });
                                          objUOM.FromQty = ResponseSales.data.FromQty;
                                          objUOM.FromRate = ResponseSales.data.FromRate;
                                          objUOM.FromUOM = ResponseSales.data.FromUOM;
                                          objUOM.ToUOM = ResponseSales.data.ToUOM;
                                          objUOM.ToRate = ResponseSales.data.ToRate;
                                          $scope.InitUOMFunction(objUOM);
                                          //     }
                                          // });
                                    } else {
                                          $ionicLoading.show({
                                                template: ResponseSales.message
                                          });
                                          setTimeout(function () {
                                                $ionicLoading.hide()
                                          }, 1000);
                                    }
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

      //  *******************************************************UOM Converstion********************************************************
      //UOM Converstion Model
      $ionicModal.fromTemplateUrl('UomConverstionModel.html', {
            scope: $scope,
            animation: 'slide-in-up'
      }).then(function (modal) {
            $scope.modal1 = modal;
      });

      $scope.OpenUOMModal = function () {
            $scope.modal1.show();
      };

      $scope.closeModal1 = function () {
            $scope.modal1.hide();
            $scope.Searchmodel1 = {
                  Search: '',
            }
      }; // Cleanup the modal when we're done with it!

      $scope.$on('$destroy', function () {
            $scope.modal1.remove();
      })

      $scope.getAllUserLoaction = function () {
            var params = {
                  idLocations: $scope.IsAdmin ? "" : $localstorage.get('idLocations')
            }
            $http.get($rootScope.RoutePath + 'customer/GetAllActiveLocations', {
                  params: params
            }).then(function (res) {
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

            // $scope.OpenUOMModal();
            $scope.SaveItem();
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
                              $ionicLoading.show({
                                    template: "Please select another FromUOM ,this FromUOM already selected"
                              });
                              setTimeout(function () {
                                    $ionicLoading.hide()
                              }, 1000);
                        }
                  }
                  if (item.ToUom != null && item.FromUOM != null && item.FromQty != null) {
                        $http.get($rootScope.RoutePath + 'item/GetAllItemByItemCode?ItemCode=' + item.ItemCode).then(function (res) {
                              $scope.lstItems = res.data.data;
                              var obj = _.findWhere($scope.lstItems, {
                                    ItemCode: item.ItemCode
                              });
                              var FromPrice = _.findWhere(obj.itemuoms, {
                                    UOM: item.FromUOM
                              }).Rate;
                              var ToPrice = _.findWhere(obj.itemuoms, {
                                    UOM: item.ToUom
                              }).Rate;
                              item.ToQty = parseInt((parseFloat(item.FromQty) * parseFloat(FromPrice)) / parseFloat(ToPrice));
                        })
                  }
                  if (item.FromQty == null) {
                        item.ToQty = null;
                  }
            }
      }

      $scope.AddUOMItemInList = function () {
            if ($scope.lstSelectedUOM.length > 0 && $scope.lstSelectedUOM[$scope.lstSelectedUOM.length - 1].ItemCode == null) {
                  $ionicLoading.show({
                        template: "Select Item Code"
                  });
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

            // var NoValidData = _.filter($scope.lstSelectedUOM, function (item) {
            //     if (item.ItemCode == null || item.FromUOM == null || item.ToUom == null || item.Location == null || item.FromQty == null || item.ToQty == null || (item.FromQty).toString() == '' || (item.ToQty).toString() == '') {
            //         return item;
            //     }
            // });
            // if (form.$invalid) {
            //     $scope.formUOMsubmit = true;
            //     return
            // }
            // if (NoValidData != '') {
            //     var alertPopup = $ionicPopup.alert({
            //         title: '',
            //         template: 'Fill all compulsory filed in list.',
            //         cssClass: 'custPop',
            //         okText: 'Ok',
            //         okType: 'btn btn-green',
            //     });
            // } else {
            var obj = {
                  objconv: $scope.MainUOM,
                  objitem: $scope.lstSelectedUOM
            }
            if (new Date($scope.MainUOM.DocDate) == 'Invalid Date') {
                  obj.objconv.DocDate = moment().set({
                        'date': $scope.MainUOM.DocDate.split('-')[0],
                        'month': $scope.MainUOM.DocDate.split('-')[1] - 1,
                        'year': $scope.MainUOM.DocDate.split('-')[2]
                  }).format('YYYY-MM-DD');
            } else {
                  if (moment(obj.objconv.DocDate, "DD-MM-YYYY").format('YYYY-MM-DD') == 'Invalid date') {
                        obj.objconv.DocDate = moment(new Date($scope.MainUOM.DocDate)).format('YYYY-MM-DD');
                  } else {
                        obj.objconv.DocDate = moment($scope.MainUOM.DocDate, "DD-MM-YYYY").format('YYYY-MM-DD');
                  }
            }
            $http.post($rootScope.RoutePath + 'uomconv/SaveUomconv', obj).then(function (res) {
                  $scope.formUOMsubmit = false;
                  // if (res.data.success) {
                  //     $scope.closeModal1();
                  // }
                  $scope.model.flgUOMConversation = true;
                  $scope.model.UOMConversationId = res.data.data;
                  if ($scope.Copy == true) {
                        $scope.CopySale($scope.CopyId);
                  } else {
                        $scope.SaveSale($scope.FormSales);
                  }

            }).catch(function (err) {
                  $ionicLoading.show({
                        template: 'Unable to save record right now. Please try again later.'
                  });
                  setTimeout(function () {
                        $ionicLoading.hide()
                  }, 1000);
            });
            // }

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
                  $http.get($rootScope.RoutePath + 'item/GetAllItemByItemCode?ItemCode=' + o.ItemCode).then(function (res) {
                        $scope.lstItems = res.data.data;
                        var obj = _.findWhere($scope.lstItems, {
                              ItemCode: (o.ItemCode).toString()
                        });
                        // $scope.lstBatch = obj.itembatches;
                        // $scope.lstUOM = obj.itemuoms;

                        o.lstBatch = obj.itembatches;
                        o.lstUOM = obj.itemuoms;
                  })
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
            var objStatus = _.findWhere($scope.lstStatus, {
                  id: idStatus
            });
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
                        return $http.get($rootScope.RoutePath + 'invoice/UpdateSalesStatus', {
                                    params: {
                                          idSales: idSales,
                                          idStatus: objStatus.id,
                                          Status: objStatus.Status
                                    }
                              }).then(function (res) {
                                    if (res.data.data == 'TOKEN') {
                                          $rootScope.logout();
                                    }
                                    if (res.data.success) {
                                          $scope.init();
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
                  }
            });
      }

      //********************************************************Update Sales Status End *************************************************/

      //*********************************************************Stock Transfer Start*****************************************************/

      $scope.StockTransfer = function (id) {
            var obj = _.findWhere($scope.lstdata, {
                  id: id
            });
            var cus = _.findWhere($scope.lstCustomer, {
                  AccountNumbder: obj.CustomerCode
            });
            $scope.objPurchse = {};
            obj['LoginUserCode'] = cus.tbluserinformation ? cus.tbluserinformation.UserCode : $localstorage.get('UserCode')
            for (var prop in obj) {
                  if (prop == 'id') {
                        $scope.objPurchse[prop] = 0;
                  } else if (prop == 'DocNo') {
                        $scope.objPurchse[prop] = '';
                  } else if (prop == 'InvoiceDate') {
                        $scope.objPurchse['PurchaseDate'] = moment(obj[prop]).format('YYYY-MM-DD');
                  } else if (prop == 'idLocations') {
                        $scope.objPurchse[prop] = $localstorage.get('DefaultLocation');
                  } else if (prop == 'invoicedetails') {
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
                  } else if (prop == 'CustomerCode') {
                        $scope.objPurchse[prop] = $scope.Customer ? $scope.Customer.AccountNumbder : obj[prop];
                  } else if (prop == 'CustomerName') {
                        $scope.objPurchse[prop] = $scope.Customer ? $scope.Customer.Name : obj[prop];
                  } else if (prop == 'Address1') {
                        $scope.objPurchse[prop] = $scope.Customer ? $scope.Customer.BillingAddress1 : obj[prop];
                  } else if (prop == 'Address2') {
                        $scope.objPurchse[prop] = $scope.Customer ? $scope.Customer.BillingAddress2 : obj[prop];
                  } else if (prop == 'Address3') {
                        $scope.objPurchse[prop] = $scope.Customer ? $scope.Customer.BillingAddress3 : obj[prop];
                  } else if (prop == 'PhoneNumber') {
                        $scope.objPurchse[prop] = $scope.Customer ? $scope.Customer.PhoneNumber : obj[prop];
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
                                    if (obj.PurchaseId) {
                                          var params = {
                                                id: obj.PurchaseId
                                          };
                                          $rootScope.ShowLoader();
                                          $http.get($rootScope.RoutePath + 'purchase/DeletePurchase', {
                                                params: params
                                          }).success(function (data) {
                                                $scope.objPurchse.DocNo = data.data;
                                                console.log("====>!!1", $scope.objPurchse)
                                                $http.post($rootScope.RoutePath + 'purchase/SavePurchase', $scope.objPurchse).then(function (res) {
                                                      if (res.data.success) {
                                                            var obj = {
                                                                  id: id,
                                                                  PurchaseId: res.data.data
                                                            }
                                                            $http.post($rootScope.RoutePath + 'invoice/UpdateProductId', obj).then(function (res1) {
                                                                  $scope.objPurchse = {};

                                                                  $ionicLoading.show({
                                                                        template: res.data.message
                                                                  });
                                                                  setTimeout(function () {
                                                                        InitDataTable()
                                                                        $ionicLoading.hide()
                                                                  }, 1000);
                                                            })
                                                      } else {
                                                            $ionicLoading.show({
                                                                  template: res.data.message
                                                            });
                                                            setTimeout(function () {
                                                                  InitDataTable()
                                                                  $ionicLoading.hide()
                                                            }, 1000);
                                                      }
                                                }).catch(function (err) {
                                                      $ionicLoading.show({
                                                            template: 'Unable to save record right now. Please try again later.'
                                                      });
                                                      setTimeout(function () {
                                                            InitDataTable()
                                                            $ionicLoading.hide()
                                                      }, 1000);

                                                });
                                          })
                                    } else {
                                          $rootScope.ShowLoader();
                                          console.log("====>!!2", $scope.objPurchse)
                                          $http.post($rootScope.RoutePath + 'purchase/SavePurchase', $scope.objPurchse).then(function (res) {
                                                if (res.data.success) {
                                                      var obj = {
                                                            id: id,
                                                            PurchaseId: res.data.data
                                                      }
                                                      $http.post($rootScope.RoutePath + 'invoice/UpdateProductId', obj).then(function (res1) {
                                                            $scope.objPurchse = {};

                                                            $ionicLoading.show({
                                                                  template: res.data.message
                                                            });
                                                            setTimeout(function () {
                                                                  InitDataTable()
                                                                  $ionicLoading.hide()
                                                            }, 1000);
                                                      })
                                                } else {
                                                      $ionicLoading.show({
                                                            template: res.data.message
                                                      });
                                                      setTimeout(function () {
                                                            InitDataTable()
                                                            $ionicLoading.hide()
                                                      }, 1000);
                                                }
                                          }).catch(function (err) {
                                                $ionicLoading.show({
                                                      template: 'Unable to save record right now. Please try again later.'
                                                });
                                                setTimeout(function () {
                                                      InitDataTable()
                                                      $ionicLoading.hide()
                                                }, 1000);

                                          });
                                    }
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
            var objDoc = _.findWhere($scope.lstdata, {
                  id: parseInt(o)
            });
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


      $scope.Export = function (o) {
            var objDoc = _.findWhere($scope.lstdata, {
                  id: parseInt(o)
            });
            var finalobj = []
            objDoc.invoicedetails = _.sortBy(objDoc.invoicedetails, 'sequence')
            for (var j = 0; j < objDoc.invoicedetails.length; j++) {
                  for (var i = 0; i < objDoc.invoicedetails[j].Qty; i++) {
                        var t = (objDoc.invoicedetails[j].itembatch.SalesRate.toFixed(2) + "," + objDoc.invoicedetails[j].itembatch.Barcode + "\r\n").toString()
                        finalobj.push(t)
                  }
            }
            var blob = new Blob(finalobj, {
                  type: "text/plain;charset=ASCII"
            });
            saveAs(blob, "testfile1.txt");

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
                  SourceType: 'SI'
            };
            $scope.DeliveryList = [];
            $scope.DeliveryItemList = [];
            $scope.PostFix = 1;



            if (status == 'insert') {
                  $scope.GetLastDeliveryDocNo();
                  _.filter(o.invoicedetails, function (q) {
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
                  $ionicLoading.show({
                        template: "Fill data"
                  });
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
                        _.filter(p.invoicedetails, function (q) {
                              if (q.ItemCode == item.ItemCode) {
                                    if (q.Tax > 0) {
                                          var obj = _.findWhere($scope.lstTaxCode, {
                                                TaxType: q.TaxCode
                                          });
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
                  $ionicLoading.show({
                        template: "Fill data"
                  });
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

                  var NoItemCode = _.findWhere(List, {
                        ItemCode: null
                  });
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
                              var obj1 = _.findWhere($scope.lstdata, {
                                    DocNo: $scope.DeliverySlipModel.SourceNo
                              });
                              var ItemDataErrorList = [];
                              for (var i = 0; i < obj1.invoicedetails.length; i++) {
                                    var MissingItemData = _.findWhere(List, {
                                          ItemCode: obj1.invoicedetails[i].ItemCode
                                    });
                                    if (!MissingItemData) {
                                          ItemDataErrorList.push(obj1.invoicedetails[i].ItemCode);
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
                                    for (var i = 0; i < obj1.invoicedetails.length; i++) {
                                          var QtySum = 0;
                                          _.filter(List, function (p) {
                                                if (p.ItemCode == obj1.invoicedetails[i].ItemCode) {
                                                      QtySum = QtySum + parseInt(p.Qty);
                                                }
                                          })

                                          if (QtySum != obj1.invoicedetails[i].Qty) {
                                                QtyErrorList.push(obj1.invoicedetails[i].ItemCode);
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
                        $scope.DeliverySlipModel.DocDate = moment().set({
                              'date': $scope.DeliverySlipModel.DocDate.split('-')[0],
                              'month': $scope.DeliverySlipModel.DocDate.split('-')[1] - 1,
                              'year': $scope.DeliverySlipModel.DocDate.split('-')[2]
                        }).format('YYYY-MM-DD');
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
                                    $ionicLoading.show({
                                          template: res.data.message
                                    });
                                    setTimeout(function () {
                                          $ionicLoading.hide()
                                    }, 1000);

                                    $scope.closeDeliveryPackingSlipModal();
                                    $scope.init();
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

      $scope.CopyToDeliverySlipModel = function (obj) {
            $scope.PostFix = 1;
            for (var prop in $scope.DeliverySlipModel) {
                  $scope.DeliverySlipModel[prop] = obj[prop];
                  if (prop == 'DocDate') {
                        $scope.DeliverySlipModel['DocDate'] = moment(obj[prop]).format('DD-MM-YYYY');
                  }
            }

            var objDoc = _.findWhere($scope.lstdata, {
                  DocNo: $scope.DeliverySlipModel.SourceNo
            });
            _.filter(objDoc.invoicedetails, function (q) {
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

      function getSalesPurchaseRate(o) {
            var SaleUOM = _.findWhere(o.listUOM, {
                  UOM: o.SaleUOM
            });
            var uomqun = SaleUOM.UOM == o.UOM ? 1 : SaleUOM.Rate
            var purchaseprice = 0;
            var batch = null;
            var MRP = 0.0
            if (o.BatchNo) {
                  batch = _.findWhere(o.BatchList, {
                        BatchNumber: o.BatchNo
                  });
                  purchaseprice = batch.SalesRate / ((o.TaxRate / 100) + 1);
                  MRP = batch.MRP / uomqun

            } else {
                  purchaseprice = parseFloat(o.Price) / ((o.TaxRate / 100) + 1);
                  MRP = SaleUOM.MRP / uomqun
            }
            var ShopId = _.findWhere($scope.LstCustGroup, {
                  Name: 'Shop'
            });
            var StockHolderId = _.findWhere($scope.LstCustGroup, {
                  Name: 'Stock Holder'
            });

            var Shop = _.findWhere(o.itemmargins, {
                  idCustGroup: ShopId.id
            });
            var StockHolder = _.findWhere(o.itemmargins, {
                  idCustGroup: StockHolderId.id
            });

            var ShopSalesRate = purchaseprice;
            var ShopPurchaseRate = purchaseprice - ((purchaseprice * Shop.Percentage) / 100);
            var ShopPercentage = ((o.Qty * purchaseprice) * Shop.Percentage) / 100;

            var StockHolderSalesRate = ShopPurchaseRate;
            var StockHolderPurchaseRate = parseFloat(ShopPurchaseRate) - ((parseFloat(ShopPurchaseRate) * StockHolder.Percentage) / 100);
            var StockHolderPercentage = ((o.Qty * parseFloat(ShopPurchaseRate)) * StockHolder.Percentage) / 100;

            var GenmedSalesRate = StockHolderPurchaseRate;
            var GenmedPurchaseRate = o.BatchNo ? batch.PurchaseRate : parseFloat(o.Price);

            var CustomerSalePrice = o.BatchNo ? (batch.SalesRate / uomqun) / ((o.TaxRate / 100) + 1) : purchaseprice;
            var CustomerPercentage = o.BatchNo ? ((batch.MRP - batch.SalesRate) * 100) / batch.MRP : ((SaleUOM.MRP - o.price) * 100) / SaleUOM.MRP;
            var CustomerDiscountAmount = o.BatchNo ? (batch.MRP - batch.SalesRate) : (SaleUOM.MRP - o.price);

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
                  CustomerDiscountAmount: CustomerDiscountAmount,
                  MRP: MRP
            }

            return obj;

      }

      function getSalesPurchaseRateList(o) {
            var ShopId = _.findWhere($scope.LstCustGroup, {
                  Name: 'Shop'
            });
            var StockHolderId = _.findWhere($scope.LstCustGroup, {
                  Name: 'Stock Holder'
            });
            var Shop = _.findWhere(o.itemmargins, {
                  idCustGroup: ShopId.id
            });
            var StockHolder = _.findWhere(o.itemmargins, {
                  idCustGroup: StockHolderId.id
            });

            var UOMPrice = _.findWhere(o.itemuoms, {
                  UOM: o.SalesUOM
            });

            var purchaseprice = 0;
            if (UOMPrice) {
                  purchaseprice = UOMPrice.MinSalePrice;
            }

            var TaxObj = _.findWhere($scope.lstTaxCode, {
                  TaxType: o.SupplyTaxCode
            });
            if (TaxObj) {
                  purchaseprice = purchaseprice / ((TaxObj.TaxRate / 100) + 1);
            }

            var purchaseprice1 = purchaseprice - ((purchaseprice * (Shop ? Shop.Percentage : 0)) / 100);
            var purchaseprice2 = parseFloat(purchaseprice1) - ((parseFloat(purchaseprice1) * (StockHolder ? StockHolder.Percentage : 0)) / 100);
            var Percentage = UOMPrice ? ((purchaseprice2 - UOMPrice.MinPurchasePrice) * 100) / purchaseprice2 : 0;
            o.SalePrice = UOMPrice ? UOMPrice.MinSalePrice : 0;
            o.MRP = UOMPrice ? UOMPrice.MRP : 0;
            o.GenmedMargin = (Percentage).toFixed(2);
            o.StockHolderMargin = StockHolder ? StockHolder.Percentage : 0;
            o.ShopMargin = Shop ? Shop.Percentage : 0;
            o.CustDiscount = UOMPrice ? UOMPrice.MRP - UOMPrice.MinSalePrice : 0;

            return o;
      }

      // Anil Start
      $ionicModal.fromTemplateUrl('ItemCode.html', {
            scope: $scope,
            animation: 'slide-in-up'
      }).then(function (modal) {

            $scope.modal = modal;
      });

      $scope.OpenModelItemCode = function (ItemIndex, o) {
            $localstorage.set('ItemIndex', ItemIndex)
            $scope.modal.show();
            setTimeout(() => {
                  $("#itemsearch").focus();
            });
            setTimeout(function () {
                  if (o != undefined && o != '' && o != null) {
                        InitDataTable1(o);
                  } else {
                        InitDataTable1();
                  }
            })
      };

      $scope.closeModal = function () {
            $scope.modal.hide();
            $scope.Searchmodel1 = {
                  Search: '',
            }
      };

      $ionicModal.fromTemplateUrl('RelatedItemCode.html', {
            scope: $scope,
            animation: 'slide-in-up'
      }).then(function (modal) {

            $scope.modalRelated = modal;
      });

      $scope.OpenModelRelatedItemCode = function (ItemIndex, o) {
            $localstorage.set('ItemIndex', ItemIndex)
            $scope.modalRelated.show();
            setTimeout(function () {
                  if (o != undefined && o != '' && o != null) {
                        InitDataTable2(o);
                  } else {
                        InitDataTable2();
                  }
            })
      };

      $scope.closeModalRelated = function () {
            $scope.modalRelated.hide();
            $scope.Searchmodel1 = {
                  Search: '',
            }
      };

      $scope.FilterData1 = function () {
            $('#ItemTable').dataTable().api().ajax.reload();

      }

      $scope.FilterData2 = function () {
            $('#RelatedItemTable').dataTable().api().ajax.reload();

      }

      $scope.SelectItemCode = function (id) {
            if (id != null && id != undefined && id != '') {
                  var SelectedItemCode = $scope.lstdata.find(function (item) {
                        return item.id == id;
                  });
            } else {
                  if ($scope.lstdata.length == 1) {
                        var SelectedItemCode = $scope.lstdata[0]
                  } else {
                        return
                  }
            }
            $scope.modal.hide();
            $scope.Searchmodel1 = {
                  Search: '',
            }
            $scope.lstSelectedSaleMain[$localstorage.get('ItemIndex')].ItemCode = SelectedItemCode.ItemCode;
            $scope.AddItemCode($scope.lstSelectedSaleMain[$localstorage.get('ItemIndex')])
      }

      function InitDataTable1(o) {
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
                              if (o != undefined && o != '' && o != null) {
                                    d.Descriptions = o.Descriptions
                                    d.ItemCode = o.ItemCode
                              }
                              $scope.order = d.order;
                              $scope.columns = d.columns;
                              d.CustGroupName = $scope.CurrentCustomerGroup == 'Genmed' ? null : $scope.CurrentCustomerGroup

                              return d;
                        },
                        type: "get",
                        dataSrc: function (json) {

                              if (json.success != false) {
                                    $scope.lstdata = json.data;
                                    var LocationUser = $localstorage.get('idLocations');

                                    // _.filter($scope.lstdata, function(item) {
                                    //     var objStock = _.findWhere(item.itembalqties, { UOM: item.SalesUOM, Location: LocationUser });
                                    //     item['Stock'] = objStock ? objStock.BalQty : 0;
                                    // })

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
                              "data": "ItemName",
                              "defaultContent": "N/A"
                        },
                        {
                              "data": "ItemCode",
                              "defaultContent": "N/A"
                        },
                        {
                              "data": "Descriptions",
                              "defaultContent": "N/A"
                        },
                        {
                              "data": "Stock",
                              "defaultContent": "N/A"
                        },
                        {
                              "data": "subbrand.SubBrandName",
                              "defaultContent": "N/A"
                        },
                        // { "data": null, "sortable": false, },
                        // { "data": "BaseUOM", "defaultContent": "N/A" },
                        // { "data": "SalesUOM", "defaultContent": "N/A" },
                        // { "data": "PurchaseUOM", "defaultContent": "N/A" },
                        // { "data": "ReportUOM", "defaultContent": "N/A" },
                        // { "data": "itemtype.Type", "defaultContent": "N/A", "sortable": false, },
                        // { "data": null, "sortable": false, },
                        // { "data": null, "sortable": false, },
                        // { "data": null, "sortable": false, },
                        // { "data": null, "sortable": false, },
                        // { "data": null, "sortable": false, },
                        // { "data": "CreatedDate" },
                        // { "data": "ModifiedDate" },
                        // { "data": null, "sortable": false, },
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
                              "targets": 5,
                        },
                        {
                              "render": function (data, type, row) {
                                    var LocationUser = $localstorage.get('idLocations');
                                    var AllStock = _.filter(row.itembalqties, function (i) {
                                          return i.Location.toString() == LocationUser.toString();
                                    });
                                    var Action = '';
                                    for (var index = 0; index < AllStock.length; index++) {
                                          Action += '<span style="margin-top:1px;"><b> ' + AllStock[index].UOM + ':- </b> ' + AllStock[index].BalQty + '</span></br>';

                                    }
                                    return Action;
                              },
                              "targets": 4,

                        },
                        // {
                        //     "render": function (data, type, row) {
                        //         if (data != null && data != undefined && data != '') {
                        //             if (data.itemuoms.length > 0) {
                        //                 Action = _.pluck(data.itemuoms, 'UOM').toString();
                        //                 return Action;
                        //             } else {
                        //                 return "N/A";
                        //             }

                        //         } else {
                        //             return "N/A"
                        //         }

                        //     },
                        //     "targets": 5,

                        // },
                        //  {
                        //     "render": function (data, type, row) {
                        //         var Action = '<div layout="row" layout-align="center center">';
                        //         if (data.isActive == 1) {
                        //             Action += '<span style="font-size: 20px;color: green" ng-click="isActiveItem(' + data.id + ',' + data.isActive + ')">✔</span>';
                        //         } else {
                        //             Action += ' <span style="font-size: 20px;color: red"  ng-click="isActiveItem(' + data.id + ',' + data.isActive + ')">✖</span>';
                        //         }
                        //         Action += '</div>';
                        //         return Action;
                        //     },
                        //     "targets": 11
                        // },

                        // {
                        //     "render": function (data, type, row) {
                        //         var Action = '<div layout="row" layout-align="center center">';
                        //         if (data.IsGenmedMedicine == 1) {
                        //             Action += '<span style="font-size: 20px;color: green">✔</span>';
                        //         } else {
                        //             Action += ' <span style="font-size: 20px;color: red">✖</span>';
                        //         }
                        //         Action += '</div>';
                        //         return Action;
                        //     },
                        //     "targets": 12
                        // },


                        // {
                        //     "render": function (data, type, row) {
                        //         var Action = '<div layout="row" layout-align="center center">';
                        //         if (data.IsGenmedWelness == 1) {
                        //             Action += '<span style="font-size: 20px;color: green">✔</span>';
                        //         } else {
                        //             Action += ' <span style="font-size: 20px;color: red">✖</span>';
                        //         }
                        //         Action += '</div>';
                        //         return Action;
                        //     },
                        //     "targets": 13
                        // },

                        // {
                        //     "render": function (data, type, row) {
                        //         var Action = '<div layout="row" layout-align="center center">';
                        //         if (data.IsGenmedOnline == 1) {
                        //             Action += '<span style="font-size: 20px;color: green">✔</span>';
                        //         } else {
                        //             Action += ' <span style="font-size: 20px;color: red">✖</span>';
                        //         }
                        //         Action += '</div>';
                        //         return Action;
                        //     },
                        //     "targets": 14
                        // },

                        // {
                        //     "render": function (data, type, row) {
                        //         if (data != null && data != undefined && data != '') {
                        //             if (data.itembatchbalqties.length > 0) {
                        //                 var countQty = 0;
                        //                 for (var i = 0; i < data.itembatchbalqties.length; i++) {
                        //                     var objRate = _.findWhere(data.itemuoms, { UOM: data.itembatchbalqties[i].UOM });
                        //                     if (objRate) {
                        //                         var uomRate = objRate.Rate;
                        //                         var qty = uomRate * data.itembatchbalqties[i].BalQty;
                        //                         countQty = countQty + qty;
                        //                     }
                        //                 }
                        //                 return countQty;
                        //             } else {
                        //                 return 0
                        //             }
                        //         } else {
                        //             return 0;
                        //         }

                        //     },
                        //     "targets": 15,

                        // },
                        // {
                        //     "render": function (data, type, row) {
                        //         if (row.CreatedDate != '' && row.CreatedDate != null) {
                        //             return moment(row.CreatedDate).format('DD-MM-YYYY');
                        //         } else {
                        //             return "";
                        //         }
                        //     },
                        //     "targets": 16,
                        // },
                        // {
                        //     "render": function (data, type, row) {
                        //         if (row.ModifiedDate != '' && row.ModifiedDate != null) {
                        //             return moment(row.ModifiedDate).format('DD-MM-YYYY');
                        //         } else {
                        //             return "";
                        //         }
                        //     },
                        //     "targets": 17,
                        // },



                        {
                              "render": function (data, type, row) {
                                    var Action = '<div layout="row" layout-align="center center">';
                                    Action += '<a ng-click="SelectItemCode(' + row.id + ')" class="btnAction btnAction-edit" style="cursor:pointer"><i class="ion-edit" title="Edit"></i></a>&nbsp;';
                                    Action += '</div>';
                                    return Action;
                              },
                              "targets": 6,
                        },


                  ]
            });
      }

      function InitDataTable2(o) {
            if ($.fn.DataTable.isDataTable('#RelatedItemTable')) {
                  $('#RelatedItemTable').DataTable().destroy();
            }
            $('#RelatedItemTable').DataTable({
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
                              if (o != undefined && o != '' && o != null) {
                                    d.Descriptions = o.Descriptions
                                    d.ItemCode = o.ItemCode
                              }
                              $scope.order = d.order;
                              $scope.columns = d.columns;
                              d.CustGroupName = $scope.CurrentCustomerGroup == 'Genmed' ? null : $scope.CurrentCustomerGroup
                              return d;
                        },
                        type: "get",
                        dataSrc: function (json) {

                              if (json.success != false) {
                                    $scope.lstdata = json.data;
                                    var LocationUser = $localstorage.get('idLocations')
                                    _.filter($scope.lstdata, function (item) {
                                          var objStock = _.findWhere(item.itembalqties, {
                                                UOM: item.SalesUOM,
                                                Location: LocationUser
                                          });
                                          item['Stock'] = objStock ? objStock.BalQty : 0;
                                    })
                                    return _.filter(json.data, function (l) {
                                          l = getSalesPurchaseRateList(l);
                                          return l;
                                    });

                                    // return json.data;
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
                              "data": "ItemName",
                              "defaultContent": "N/A"
                        },
                        {
                              "data": "ItemCode",
                              "defaultContent": "N/A"
                        },
                        {
                              "data": "Descriptions2",
                              "defaultContent": "N/A"
                        },
                        {
                              "data": "Stock",
                              "defaultContent": "N/A"
                        },
                        {
                              "data": "SalePrice",
                              "defaultContent": "N/A"
                        },
                        {
                              "data": "MRP",
                              "defaultContent": "N/A"
                        },
                        {
                              "data": null,
                              "defaultContent": "N/A",
                        },
                        {
                              "data": "subbrand.SubBrandName",
                              "defaultContent": "N/A"
                        },
                        // { "data": null, "sortable": false, },
                        // { "data": "BaseUOM", "defaultContent": "N/A" },
                        // { "data": "SalesUOM", "defaultContent": "N/A" },
                        // { "data": "PurchaseUOM", "defaultContent": "N/A" },
                        // { "data": "ReportUOM", "defaultContent": "N/A" },
                        // { "data": "itemtype.Type", "defaultContent": "N/A", "sortable": false, },
                        // { "data": null, "sortable": false, },
                        // { "data": null, "sortable": false, },
                        // { "data": null, "sortable": false, },
                        // { "data": null, "sortable": false, },
                        // { "data": null, "sortable": false, },
                        // { "data": "CreatedDate" },
                        // { "data": "ModifiedDate" },
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
                              "targets": 8,
                        },
                        {
                              "render": function (data, type, row) {
                                    if (data != null && data != undefined && data != '') {
                                          var val = parseFloat(data);
                                          return val.toFixed(2);
                                    } else {
                                          return 0;
                                    }
                              },
                              "targets": [4, 5, 6, ],
                              className: "right-aligned-cell"
                        },
                        {
                              "render": function (data, type, row) {
                                    if (data != null && data != undefined && data != '') {
                                          if ($scope.CurrentCustomerGroup == 'Genmed') {
                                                return data.GenmedMargin
                                          } else if ($scope.CurrentCustomerGroup == 'Stock Holder') {
                                                return data.StockHolderMargin
                                          } else if ($scope.CurrentCustomerGroup == 'Shop') {
                                                return data.ShopMargin
                                          }
                                          return Action;
                                    } else {
                                          return "N/A";
                                    }

                              },
                              "targets": 7,
                              className: "right-aligned-cell"
                        },
                        // {
                        //     "render": function (data, type, row) {
                        //         if (data != null && data != undefined && data != '') {
                        //             if (data.itemuoms.length > 0) {
                        //                 Action = _.pluck(data.itemuoms, 'UOM').toString();
                        //                 return Action;
                        //             } else {
                        //                 return "N/A";
                        //             }

                        //         } else {
                        //             return "N/A"
                        //         }

                        //     },
                        //     "targets": 5,

                        // },
                        //  {
                        //     "render": function (data, type, row) {
                        //         var Action = '<div layout="row" layout-align="center center">';
                        //         if (data.isActive == 1) {
                        //             Action += '<span style="font-size: 20px;color: green" ng-click="isActiveItem(' + data.id + ',' + data.isActive + ')">✔</span>';
                        //         } else {
                        //             Action += ' <span style="font-size: 20px;color: red"  ng-click="isActiveItem(' + data.id + ',' + data.isActive + ')">✖</span>';
                        //         }
                        //         Action += '</div>';
                        //         return Action;
                        //     },
                        //     "targets": 11
                        // },

                        // {
                        //     "render": function (data, type, row) {
                        //         var Action = '<div layout="row" layout-align="center center">';
                        //         if (data.IsGenmedMedicine == 1) {
                        //             Action += '<span style="font-size: 20px;color: green">✔</span>';
                        //         } else {
                        //             Action += ' <span style="font-size: 20px;color: red">✖</span>';
                        //         }
                        //         Action += '</div>';
                        //         return Action;
                        //     },
                        //     "targets": 12
                        // },


                        // {
                        //     "render": function (data, type, row) {
                        //         var Action = '<div layout="row" layout-align="center center">';
                        //         if (data.IsGenmedWelness == 1) {
                        //             Action += '<span style="font-size: 20px;color: green">✔</span>';
                        //         } else {
                        //             Action += ' <span style="font-size: 20px;color: red">✖</span>';
                        //         }
                        //         Action += '</div>';
                        //         return Action;
                        //     },
                        //     "targets": 13
                        // },

                        // {
                        //     "render": function (data, type, row) {
                        //         var Action = '<div layout="row" layout-align="center center">';
                        //         if (data.IsGenmedOnline == 1) {
                        //             Action += '<span style="font-size: 20px;color: green">✔</span>';
                        //         } else {
                        //             Action += ' <span style="font-size: 20px;color: red">✖</span>';
                        //         }
                        //         Action += '</div>';
                        //         return Action;
                        //     },
                        //     "targets": 14
                        // },

                        // {
                        //     "render": function (data, type, row) {
                        //         if (data != null && data != undefined && data != '') {
                        //             if (data.itembatchbalqties.length > 0) {
                        //                 var countQty = 0;
                        //                 for (var i = 0; i < data.itembatchbalqties.length; i++) {
                        //                     var objRate = _.findWhere(data.itemuoms, { UOM: data.itembatchbalqties[i].UOM });
                        //                     if (objRate) {
                        //                         var uomRate = objRate.Rate;
                        //                         var qty = uomRate * data.itembatchbalqties[i].BalQty;
                        //                         countQty = countQty + qty;
                        //                     }
                        //                 }
                        //                 return countQty;
                        //             } else {
                        //                 return 0
                        //             }
                        //         } else {
                        //             return 0;
                        //         }

                        //     },
                        //     "targets": 15,

                        // },
                        // {
                        //     "render": function (data, type, row) {
                        //         if (row.CreatedDate != '' && row.CreatedDate != null) {
                        //             return moment(row.CreatedDate).format('DD-MM-YYYY');
                        //         } else {
                        //             return "";
                        //         }
                        //     },
                        //     "targets": 16,
                        // },
                        // {
                        //     "render": function (data, type, row) {
                        //         if (row.ModifiedDate != '' && row.ModifiedDate != null) {
                        //             return moment(row.ModifiedDate).format('DD-MM-YYYY');
                        //         } else {
                        //             return "";
                        //         }
                        //     },
                        //     "targets": 17,
                        // },



                        {
                              "render": function (data, type, row) {
                                    var Action = '<div layout="row" layout-align="center center">';
                                    Action += '<a ng-click="SelectItemCode(' + row.id + ')" class="btnAction btnAction-edit" style="cursor:pointer"><i class="ion-edit" title="Edit"></i></a>&nbsp;';
                                    Action += '</div>';
                                    return Action;
                              },
                              "targets": 9,
                        },


                  ]
            });
      }

      // Anil end


      $scope.GetItem = function (o) {
            // setTimeout(() => {
            //     $("#Qty" + o.ItemCode).focus();
            // });
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

      $scope.GetQuotationByQuotationId = function () {
            if ($rootScope.QuationId) {
                  $http.get($rootScope.RoutePath + 'quotation/GetQuotationByQuotationId?Id=' + $rootScope.QuationId).then(function (res) {
                        let QuatationData = res.data.data;
                        $scope.SaleEdit = true;
                        $rootScope.QuationId = null;
                        $scope.tab.selectedIndex = 1;
                        $rootScope.BackButton = $scope.IsList = false;
                        for (var prop in $scope.model) {
                              $scope.model[prop] = QuatationData[prop];
                              if (prop == 'id') {
                                    $scope.model['id'] = null;
                              }
                              if (prop == 'DocNo') {
                                    $scope.model['DocNo'] = '';
                              }
                              if (prop == 'idLocations') {
                                    $scope.model['idLocations'] = $localstorage.get('DefaultLocation');
                              }
                              if (prop == 'InvoiceDate') {
                                    $scope.model['InvoiceDate'] = moment().format('YYYY-MM-DD');
                              }

                              if (prop == 'CreatedBy') {
                                    $scope.model['CreatedBy'] = parseInt($localstorage.get('UserId'));
                              }
                              if (prop == 'CreatedDate' || prop == 'ModifiedBy' || prop == 'ModifiedDate') {
                                    $scope.model[prop] = null;
                              }

                              if (prop == 'ReferralUserDisplay') {
                                    $scope.model['ReferralUserDisplay'] = [];
                              }

                              if ((prop == 'Weight' || prop == 'WeightAmount' || prop == 'Freight' || prop == 'FreightAmount') && QuatationData.invoiceadvancedetail) {
                                    $scope.model[prop] = QuatationData.invoiceadvancedetail[prop];
                              }

                              if (prop == "LoginUserCode") {
                                    $scope.model['LoginUserCode'] = $localstorage.get('UserCode')
                              }
                              if (prop == "UserCode") {
                                    $scope.model['UserCode'] = $localstorage.get('CustomerGroupId')
                              }
                        }
                        var obj = _.findWhere($scope.lstCustomer, {
                              AccountNumbder: QuatationData.CustomerCode
                        });
                        if (obj) {
                              if (obj.idGroup) {
                                    $scope.CustomerGroup = obj.customergroup;
                                    $scope.model.PhoneNumber = obj.PhoneNumber
                              } else {
                                    $scope.CustomerGroup = null;
                              }
                        }

                        if ($scope.model.idDiscount != null && $scope.model.idDiscount != undefined && $scope.model.idDiscount != '') {
                              var obj2 = _.findWhere($scope.lstDiscount, {
                                    Id: $scope.model.idDiscount
                              });
                              if (obj2.UsePercentage == 1) {
                                    $scope.model.CouponDiscount = ($scope.model.Total * obj2.DiscountPercentage) / 100;
                              } else {
                                    $scope.model.CouponDiscount = obj2.DiscountAmount;
                              }
                        }

                        if ($scope.model.ReferralUser != null && $scope.model.ReferralUser != '' && $scope.model.ReferralUser != undefined) {
                              var List = $scope.model.ReferralUser.split(",").map(Number);
                              _.filter(List, function (p) {
                                    var obj = _.findWhere($scope.ListUser, {
                                          id: p
                                    });
                                    $scope.model.ReferralUserDisplay.push(obj.username);
                              })
                        }

                        $scope.lstSelectedSaleMain = QuatationData.quotationdetails;
                        $scope.lstSelectedSaleMain = _.sortBy($scope.lstSelectedSaleMain, 'sequence');

                        if ($scope.lstSelectedSaleMain.length > 0) {
                              for (let i = 0; i < $scope.lstSelectedSaleMain.length; i++) {
                                    $http.get($rootScope.RoutePath + 'item/GetAllItemByItemCode?ItemCode=' + $scope.lstSelectedSaleMain[i].ItemCode).then(function (res) {
                                          $scope.lstItems = res.data.data;

                                          $scope.lstSelectedSaleMain[i].id = null;
                                          $scope.lstSelectedSaleMain[i].IsEdit = false;
                                          $scope.lstSelectedSaleMain[i].idInvoice = null;
                                          $scope.lstSelectedSaleMain[i].BatchNo = null;
                                          $scope.lstSelectedSaleMain[i].idLocations = ($scope.lstSelectedSaleMain[i].idLocations).toString();
                                          $scope.lstSelectedSaleMain[i].ItemName = $scope.lstItems[0].ItemName;
                                          $scope.lstSelectedSaleMain[i].HSNCode = $scope.lstItems[0].HSNCode;
                                          $scope.lstSelectedSaleMain[i].Descriptions2 = $scope.lstItems[0].Descriptions2;
                                          $scope.lstSelectedSaleMain[i].itemmargins = $scope.lstItems[0].itemmargins;

                                          if ($scope.lstSelectedSaleMain[i].TaxCode) {
                                                var obj = _.findWhere($scope.lstTaxCode, {
                                                      TaxType: $scope.lstSelectedSaleMain[i].TaxCode
                                                });
                                                if (obj) {
                                                      $scope.lstSelectedSaleMain[i].TaxRate = obj.TaxRate;
                                                }
                                          }

                                          if ($scope.lstSelectedSaleMain[i].sequence == null) {
                                                $scope.lstSelectedSaleMain[i].sequence = i + 1
                                          }

                                          if ($scope.lstSelectedSaleMain[i].idLocations) {
                                                var obj1 = _.findWhere($scope.lstLocations, {
                                                      id: parseInt($scope.lstSelectedSaleMain[i].idLocations)
                                                });
                                                if (obj1) {
                                                      $scope.lstSelectedSaleMain[i].DisplayLocation = obj1.Name;
                                                }
                                          }

                                          var objItem1 = _.findWhere($scope.lstItems, {
                                                ItemCode: $scope.lstSelectedSaleMain[i].ItemCode
                                          });
                                          if (objItem1) {
                                                // $scope.lstSelectedSaleMain[i].itemmargins = objItem1.itemmargins;
                                                $scope.lstSelectedSaleMain[i].listUOM = objItem1.itemuoms;
                                                $scope.lstSelectedSaleMain[i].SaleUOM = objItem1.SalesUOM;
                                                $scope.lstSelectedSaleMain[i].ItemId = objItem1.id;
                                                if (objItem1.isBatch == 1) {
                                                      $scope.lstSelectedSaleMain[i].isBatch = true;
                                                      $scope.lstSelectedSaleMain[i].BatchList = objItem1.itembatches;
                                                } else {
                                                      $scope.lstSelectedSaleMain[i].isBatch = false;
                                                      $scope.lstSelectedSaleMain[i].BatchList = objItem1.itembatches;
                                                }
                                                if ($scope.lstSelectedSaleMain[i].BatchList.length > 0) {
                                                      _.filter($scope.lstSelectedSaleMain[i].BatchList, function (z) {
                                                            var objStock = {
                                                                  ItemCode: $scope.lstSelectedSaleMain[i].ItemCode,
                                                                  BatchNo: z.BatchNumber,
                                                                  UOM: $scope.lstSelectedSaleMain[i].UOM,
                                                                  Location: $scope.lstSelectedSaleMain[i].idLocations
                                                            }
                                                            $http.get($rootScope.RoutePath + 'item/GetAllItemBatchBalQtyByItemCode', {
                                                                  params: objStock
                                                            }).then(function (res) {
                                                                  var objz = res.data.data;
                                                                  z['Stock'] = objz ? objz.BalQty : 0;
                                                            });
                                                            // var objz = _.findWhere(objItem1.itembatchbalqties, { BatchNo: z.BatchNumber, UOM: $scope.lstSelectedSaleMain[i].UOM, Location: $scope.lstSelectedSaleMain[i].idLocations });
                                                            // z['Stock'] = objz ? objz.BalQty : 0;
                                                      })
                                                }
                                                if ($scope.lstSelectedSaleMain[i].BatchNo) {
                                                      var Rate = 1;
                                                      if (objItem1.SalesUOM != $scope.lstSelectedSaleMain[i].UOM) {
                                                            Rate = 1 * _.findWhere(objItem1.itemuoms, {
                                                                  UOM: objItem1.SalesUOM
                                                            }).Rate;
                                                      }
                                                      $scope.lstSelectedSaleMain[i]['MRP'] = $scope.lstSelectedSaleMain[i].itembatch.MRP / Rate;
                                                } else {
                                                      $scope.lstSelectedSaleMain[i]['MRP'] = _.findWhere(objItem1.itemuoms, {
                                                            UOM: $scope.lstSelectedSaleMain[i].UOM
                                                      }).MRP;
                                                }

                                          } else {
                                                $scope.lstSelectedSaleMain[i].listUOM = [];
                                                $scope.lstSelectedSaleMain[i].ItemId = null;
                                                if ($scope.lstSelectedSaleMain[i].BatchNo) {
                                                      var Rate = _.findWhere(objItem1.itemuoms, {
                                                            UOM: $scope.lstSelectedSaleMain[i].UOM
                                                      });
                                                      if (objItem1.SalesUOM != $scope.lstSelectedSaleMain[i].UOM) {
                                                            Rate = 1 * _.findWhere(objItem1.itemuoms, {
                                                                  UOM: objItem1.SalesUOM
                                                            });
                                                      }
                                                      if (Rate) {
                                                            $scope.lstSelectedSaleMain[i]['MRP'] = $scope.lstSelectedSaleMain[i].itembatch.MRP / Rate.Rate;
                                                      } else {
                                                            $scope.lstSelectedSaleMain[i]['MRP'] = $scope.lstSelectedSaleMain[i].itembatch.MRP;
                                                      }
                                                } else {
                                                      $scope.lstSelectedSaleMain[i]['MRP'] = 0;
                                                }
                                          }

                                          $scope.lstSelectedSaleMain[i].LastBalQty = 0;
                                          $scope.lstSelectedSaleMain[i].LastBatchNo = null;
                                          $scope.lstSelectedSaleMain[i].LastLocation = null;
                                          $scope.lstSelectedSaleMain[i].LastItemCode = null;
                                          $scope.lstSelectedSaleMain[i].LastUOM = null;

                                          if ($scope.lstSelectedSaleMain[i].DiscountAmount) {
                                                $scope.lstSelectedSaleMain[i].DiscountPercentage = ($scope.lstSelectedSaleMain[i].DiscountAmount / ($scope.lstSelectedSaleMain[i].Qty * $scope.lstSelectedSaleMain[i].Price)) * 100;
                                          }
                                    })
                              }

                              $scope.WorkingSaleMain = $scope.lstSelectedSaleMain[$scope.lstSelectedSaleMain.length - 1];
                        }


                  });
            }
      }

      $scope.GetPurchaseByPurchaseId = function () {
            if ($rootScope.PurchaseId) {
                  $http.get($rootScope.RoutePath + 'purchase/GetPurchaseByPurchaseId?Id=' + $rootScope.PurchaseId).then(function (res) {
                        let PurchaseData = res.data.data;
                        console.log(PurchaseData)
                        $rootScope.PurchaseId = null;
                        $scope.SaleEdit = true;
                        $scope.tab.selectedIndex = 1;
                        $rootScope.BackButton = $scope.IsList = false;
                        for (var prop in $scope.model) {
                              $scope.model[prop] = PurchaseData[prop];
                              if (prop == 'id') {
                                    $scope.model['id'] = null;
                              }
                              if (prop == 'DocNo') {
                                    $scope.model['DocNo'] = '';
                              }
                              if (prop == 'idLocations') {
                                    $scope.model['idLocations'] = $localstorage.get('DefaultLocation');
                              }
                              if (prop == 'InvoiceDate') {
                                    $scope.model['InvoiceDate'] = moment().format('YYYY-MM-DD');
                              }

                              if (prop == 'CreatedBy') {
                                    $scope.model['CreatedBy'] = parseInt($localstorage.get('UserId'));
                              }
                              if (prop == 'CreatedDate' || prop == 'ModifiedBy' || prop == 'ModifiedDate') {
                                    $scope.model[prop] = null;
                              }

                              if (prop == 'ReferralUserDisplay') {
                                    $scope.model['ReferralUserDisplay'] = [];
                              }

                              if ((prop == 'Weight' || prop == 'WeightAmount' || prop == 'Freight' || prop == 'FreightAmount') && PurchaseData.invoiceadvancedetail) {
                                    $scope.model[prop] = PurchaseData.invoiceadvancedetail[prop];
                              }

                              if (prop == "LoginUserCode") {
                                    $scope.model['LoginUserCode'] = $localstorage.get('UserCode')
                              }
                              if (prop == "UserCode") {
                                    $scope.model['UserCode'] = $localstorage.get('CustomerGroupId')
                              }
                        }


                        var obj = _.findWhere($scope.lstCustomer, {
                              AccountNumbder: PurchaseData.CustomerCode
                        });
                        if (obj) {
                              if (obj.idGroup) {
                                    $scope.CustomerGroup = obj.customergroup;
                                    $scope.model.PhoneNumber = obj.PhoneNumber
                              } else {
                                    $scope.CustomerGroup = null;
                              }
                        }

                        if ($scope.model.idDiscount != null && $scope.model.idDiscount != undefined && $scope.model.idDiscount != '') {
                              var obj2 = _.findWhere($scope.lstDiscount, {
                                    Id: $scope.model.idDiscount
                              });
                              if (obj2.UsePercentage == 1) {
                                    $scope.model.CouponDiscount = ($scope.model.Total * obj2.DiscountPercentage) / 100;
                              } else {
                                    $scope.model.CouponDiscount = obj2.DiscountAmount;
                              }
                        }

                        if ($scope.model.ReferralUser != null && $scope.model.ReferralUser != '' && $scope.model.ReferralUser != undefined) {
                              var List = $scope.model.ReferralUser.split(",").map(Number);
                              _.filter(List, function (p) {
                                    var obj = _.findWhere($scope.ListUser, {
                                          id: p
                                    });
                                    $scope.model.ReferralUserDisplay.push(obj.username);
                              })
                        }

                        $scope.lstSelectedSaleMain = PurchaseData.purchasedetails;
                        $scope.lstSelectedSaleMain = _.sortBy($scope.lstSelectedSaleMain, 'sequence');


                        if ($scope.lstSelectedSaleMain.length > 0) {
                              for (let i = 0; i < $scope.lstSelectedSaleMain.length; i++) {
                                    $http.get($rootScope.RoutePath + 'item/GetAllItemByItemCode?ItemCode=' + $scope.lstSelectedSaleMain[i].ItemCode).then(function (res) {
                                          $scope.lstItems = res.data.data;
                                          $scope.lstSelectedSaleMain[i].id = null;
                                          $scope.lstSelectedSaleMain[i].IsEdit = false;
                                          $scope.lstSelectedSaleMain[i].idInvoice = null;
                                          $scope.lstSelectedSaleMain[i].idLocations = ($scope.lstSelectedSaleMain[i].idLocations).toString();
                                          $scope.lstSelectedSaleMain[i].ItemName = $scope.lstItems[0].ItemName;
                                          $scope.lstSelectedSaleMain[i].HSNCode = $scope.lstItems[0].HSNCode;
                                          $scope.lstSelectedSaleMain[i].Descriptions2 = $scope.lstItems[0].Descriptions2;
                                          $scope.lstSelectedSaleMain[i].itemmargins = $scope.lstItems[0].itemmargins;

                                          if ($scope.lstSelectedSaleMain[i].TaxCode) {
                                                var obj = _.findWhere($scope.lstTaxCode, {
                                                      TaxType: $scope.lstSelectedSaleMain[i].TaxCode
                                                });
                                                if (obj) {
                                                      $scope.lstSelectedSaleMain[i].TaxRate = obj.TaxRate;
                                                }
                                          }

                                          if ($scope.lstSelectedSaleMain[i].sequence == null) {
                                                $scope.lstSelectedSaleMain[i].sequence = i + 1
                                          }

                                          if ($scope.lstSelectedSaleMain[i].idLocations) {
                                                var obj1 = _.findWhere($scope.lstLocations, {
                                                      id: parseInt($scope.lstSelectedSaleMain[i].idLocations)
                                                });
                                                if (obj1) {
                                                      $scope.lstSelectedSaleMain[i].DisplayLocation = obj1.Name;
                                                }
                                          }

                                          var objItem1 = _.findWhere($scope.lstItems, {
                                                ItemCode: $scope.lstSelectedSaleMain[i].ItemCode
                                          });
                                          if (objItem1) {
                                                // $scope.lstSelectedSaleMain[i].itemmargins = objItem1.itemmargins;
                                                $scope.lstSelectedSaleMain[i].listUOM = objItem1.itemuoms;
                                                $scope.lstSelectedSaleMain[i].SaleUOM = objItem1.SalesUOM;
                                                $scope.lstSelectedSaleMain[i].ItemId = objItem1.id;
                                                if (objItem1.isBatch == 1) {
                                                      $scope.lstSelectedSaleMain[i].isBatch = true;
                                                      $scope.lstSelectedSaleMain[i].BatchList = objItem1.itembatches;
                                                } else {
                                                      $scope.lstSelectedSaleMain[i].isBatch = false;
                                                      $scope.lstSelectedSaleMain[i].BatchList = objItem1.itembatches;
                                                }
                                                if ($scope.lstSelectedSaleMain[i].BatchList.length > 0) {
                                                      var selectedBatch = _.findWhere($scope.lstSelectedSaleMain[i].BatchList, {
                                                            BatchNumber: $scope.lstSelectedSaleMain[i].BatchNo
                                                      })
                                                      if (selectedBatch) {
                                                            $scope.lstSelectedSaleMain[i].ExpiryDate = selectedBatch.ExpiryDate
                                                      }
                                                      _.filter($scope.lstSelectedSaleMain[i].BatchList, function (z) {
                                                            var objStock = {
                                                                  ItemCode: $scope.lstSelectedSaleMain[i].ItemCode,
                                                                  BatchNo: z.BatchNumber,
                                                                  UOM: $scope.lstSelectedSaleMain[i].UOM,
                                                                  Location: $scope.lstSelectedSaleMain[i].idLocations
                                                            }
                                                            $http.get($rootScope.RoutePath + 'item/GetAllItemBatchBalQtyByItemCode', {
                                                                  params: objStock
                                                            }).then(function (res) {
                                                                  var objz = res.data.data;
                                                                  z['Stock'] = objz ? objz.BalQty : 0;
                                                            });
                                                            // var objz = _.findWhere(objItem1.itembatchbalqties, { BatchNo: z.BatchNumber, UOM: $scope.lstSelectedSaleMain[i].UOM, Location: $scope.lstSelectedSaleMain[i].idLocations });
                                                            // z['Stock'] = objz ? objz.BalQty : 0;
                                                      })
                                                }

                                                if ($scope.lstSelectedSaleMain[i].BatchNo) {
                                                      var Rate = 1;
                                                      if (objItem1.SalesUOM != $scope.lstSelectedSaleMain[i].UOM) {
                                                            Rate = 1 * _.findWhere(objItem1.itemuoms, {
                                                                  UOM: objItem1.SalesUOM
                                                            }).Rate;
                                                      }
                                                      var Batch = _.findWhere(objItem1.itembatches, {
                                                            BatchNumber: $scope.lstSelectedSaleMain[i].BatchNo
                                                      }).MRP
                                                      $scope.lstSelectedSaleMain[i]['MRP'] = Batch / Rate;
                                                } else {
                                                      $scope.lstSelectedSaleMain[i]['MRP'] = _.findWhere(objItem1.itemuoms, {
                                                            UOM: $scope.lstSelectedSaleMain[i].UOM
                                                      }).MRP;
                                                }
                                          } else {
                                                $scope.lstSelectedSaleMain[i].listUOM = [];
                                                $scope.lstSelectedSaleMain[i].ItemId = null;
                                                if ($scope.lstSelectedSaleMain[i].BatchNo) {
                                                      var Rate = _.findWhere(objItem1.itemuoms, {
                                                            UOM: $scope.lstSelectedSaleMain[i].UOM
                                                      });
                                                      if (objItem1.SalesUOM != $scope.lstSelectedSaleMain[i].UOM) {
                                                            Rate = 1 * _.findWhere(objItem1.itemuoms, {
                                                                  UOM: objItem1.SalesUOM
                                                            });
                                                      }
                                                      var Batch = _.findWhere($scope.lstSelectedSaleMain[i].BatchList, {
                                                            BatchNumber: $scope.lstSelectedSaleMain[i].BatchNo
                                                      }).MRP
                                                      if (Rate) {
                                                            $scope.lstSelectedSaleMain[i]['MRP'] = Batch / Rate.Rate;
                                                      } else {
                                                            $scope.lstSelectedSaleMain[i]['MRP'] = Batch;
                                                      }
                                                } else {
                                                      $scope.lstSelectedSaleMain[i]['MRP'] = 0;
                                                }
                                          }

                                          $scope.lstSelectedSaleMain[i].LastBalQty = 0;
                                          $scope.lstSelectedSaleMain[i].LastBatchNo = null;
                                          $scope.lstSelectedSaleMain[i].LastLocation = null;
                                          $scope.lstSelectedSaleMain[i].LastItemCode = null;
                                          $scope.lstSelectedSaleMain[i].LastUOM = null;

                                          if ($scope.lstSelectedSaleMain[i].DiscountAmount) {
                                                $scope.lstSelectedSaleMain[i].DiscountPercentage = ($scope.lstSelectedSaleMain[i].DiscountAmount / ($scope.lstSelectedSaleMain[i].Qty * $scope.lstSelectedSaleMain[i].Price)) * 100;
                                          }

                                          $scope.MangeMargin($scope.lstSelectedSaleMain[i]);
                                    })
                              }

                              $scope.WorkingSaleMain = $scope.lstSelectedSaleMain[$scope.lstSelectedSaleMain.length - 1];
                        }


                  });
            }
            setTimeout(function () {
                  console.log($scope.lstSelectedSaleMain)
            }, 2000)
      }

      $scope.GetPendingListByBranchnLocation = function () {
            if ($rootScope.ObjGenerateBill) {
                  var objCustomer = _.findWhere($scope.lstCustomer, {
                        idBranch: $rootScope.ObjGenerateBill.BranchId
                  });
                  var BranchCodeData = $rootScope.ObjGenerateBill.BranchCode;

                  $http.get($rootScope.RoutePath + 'pendinglist/GetAllPendingListByBranch', {
                        params: $rootScope.ObjGenerateBill
                  }).then(function (res) {
                        let PendingItemData = res.data.data;

                        $rootScope.ObjGenerateBill = null;
                        $scope.tab.selectedIndex = 1;
                        $rootScope.BackButton = $scope.IsList = false;

                        for (var prop in $scope.model) {
                              $scope.model[prop] = PendingItemData[prop] ? PendingItemData[prop] : null;
                              if (prop == 'id') {
                                    $scope.model['id'] = null;
                              }
                              if (prop == 'DocNo') {
                                    $scope.model['DocNo'] = '';
                              }
                              if (prop == 'CustomerCode' || prop == 'CustomerName') {
                                    $scope.model['CustomerCode'] = objCustomer.AccountNumbder;
                                    $scope.model['CustomerName'] = objCustomer.Name;
                              }
                              if (prop == 'BranchCode') {
                                    $scope.model['BranchCode'] = BranchCodeData;
                              }
                              if (prop == 'idLocations') {
                                    $scope.model['idLocations'] = $localstorage.get('DefaultLocation');
                              }
                              if (prop == 'InvoiceDate') {
                                    $scope.model['InvoiceDate'] = moment().format('YYYY-MM-DD');
                              }

                              if (prop == 'CreatedBy') {
                                    $scope.model['CreatedBy'] = parseInt($localstorage.get('UserId'));
                              }

                              if (prop == 'CreatedDate' || prop == 'ModifiedBy' || prop == 'ModifiedDate') {
                                    $scope.model[prop] = null;
                              }

                              if (prop == 'ReferralUserDisplay') {
                                    $scope.model['ReferralUserDisplay'] = [];
                              }

                              if ((prop == 'Weight' || prop == 'WeightAmount' || prop == 'Freight' || prop == 'FreightAmount')) {
                                    $scope.model[prop] = 0;
                              }

                              if (prop == "LoginUserCode") {
                                    $scope.model['LoginUserCode'] = $localstorage.get('UserCode')
                              }
                              if (prop == "UserCode") {
                                    $scope.model['UserCode'] = $localstorage.get('CustomerGroupId')
                              }
                        }

                        $scope.SelectCustomer($scope.model.CustomerCode);

                        if ($scope.model.idDiscount != null && $scope.model.idDiscount != undefined && $scope.model.idDiscount != '') {
                              var obj2 = _.findWhere($scope.lstDiscount, {
                                    Id: $scope.model.idDiscount
                              });
                              if (obj2.UsePercentage == 1) {
                                    $scope.model.CouponDiscount = ($scope.model.Total * obj2.DiscountPercentage) / 100;
                              } else {
                                    $scope.model.CouponDiscount = obj2.DiscountAmount;
                              }
                        }

                        if ($scope.model.ReferralUser != null && $scope.model.ReferralUser != '' && $scope.model.ReferralUser != undefined) {
                              var List = $scope.model.ReferralUser.split(",").map(Number);
                              _.filter(List, function (p) {
                                    var obj = _.findWhere($scope.ListUser, {
                                          id: p
                                    });
                                    $scope.model.ReferralUserDisplay.push(obj.username);
                              })
                        }

                        $scope.lstSelectedSaleMain = PendingItemData;
                        // $scope.lstSelectedSaleMain = _.sortBy($scope.lstSelectedSaleMain, 'sequence');
                        if ($scope.lstSelectedSaleMain.length > 0) {
                              for (let i = 0; i < $scope.lstSelectedSaleMain.length; i++) {
                                    $http.get($rootScope.RoutePath + 'item/GetAllItemByItemCode?ItemCode=' + $scope.lstSelectedSaleMain[i].ItemCode).then(function (res) {
                                          $scope.lstItems = res.data.data;


                                          $scope.lstSelectedSaleMain[i].id = null;
                                          $scope.lstSelectedSaleMain[i].IsEdit = false;
                                          $scope.lstSelectedSaleMain[i].idInvoice = null;
                                          $scope.lstSelectedSaleMain[i].BatchNo = null;
                                          $scope.lstSelectedSaleMain[i].idLocations = $localstorage.get('DefaultLocation');
                                          $scope.lstSelectedSaleMain[i].ItemName = $scope.lstItems[0].ItemName;
                                          $scope.lstSelectedSaleMain[i].HSNCode = $scope.lstItems[0].HSNCode;
                                          $scope.lstSelectedSaleMain[i].Descriptions2 = $scope.lstItems[0].Descriptions2;
                                          $scope.lstSelectedSaleMain[i].itemmargins = $scope.lstItems[0].itemmargins;
                                          $scope.lstSelectedSaleMain[i].TaxCode = $scope.lstItems[0].SupplyTaxCode;
                                          $scope.lstSelectedSaleMain[i].isBatch = 0;
                                          $scope.lstSelectedSaleMain[i].IsCombo = 0;
                                          $scope.lstSelectedSaleMain[i].ExpiryDate = null;
                                          $scope.lstSelectedSaleMain[i].ItemId = $scope.lstItems[0].id;
                                          $scope.lstSelectedSaleMain[i].Barcode = null;
                                          $scope.lstSelectedSaleMain[i].SaleUOM = $scope.lstItems[0].SalesUOM;
                                          $scope.lstSelectedSaleMain[i].BatchList = [];
                                          $scope.lstSelectedSaleMain[i].listUOM = [];
                                          $scope.lstSelectedSaleMain[i].isDiscount = 0;
                                          $scope.lstSelectedSaleMain[i].DiscountPercentage = 0;
                                          $scope.lstSelectedSaleMain[i].DiscountAmount = 0;
                                          $scope.lstSelectedSaleMain[i].MRP = 0;
                                          $scope.lstSelectedSaleMain[i].PurchaseRate = 0;
                                          $scope.lstSelectedSaleMain[i].Price = 0;
                                          $scope.lstSelectedSaleMain[i].UserUOM = null;
                                          $scope.lstSelectedSaleMain[i].Descriptions = $scope.lstItems[0].Descriptions;
                                          $scope.lstSelectedSaleMain[i].idSale = null;
                                          $scope.lstSelectedSaleMain[i].RoundAdj = 0;
                                          $scope.lstSelectedSaleMain[i].LastBalQty = 0;
                                          $scope.lstSelectedSaleMain[i].LastBatchNo = null;
                                          $scope.lstSelectedSaleMain[i].LastLocation = null;
                                          $scope.lstSelectedSaleMain[i].LastItemCode = null;
                                          $scope.lstSelectedSaleMain[i].LastUOM = null;
                                          $scope.lstSelectedSaleMain[i].Total = 0;
                                          $scope.lstSelectedSaleMain[i].CurrencyCode = $scope.model.CurrencyCode;
                                          $scope.lstSelectedSaleMain[i].CurrencyRate = $scope.model.CurrencyRate;
                                          $scope.lstSelectedSaleMain[i].NetTotal = 0.00;
                                          $scope.lstSelectedSaleMain[i].LocalNetTotal = 0.00;
                                          $scope.lstSelectedSaleMain[i].Tax = 0.00;
                                          $scope.lstSelectedSaleMain[i].LocalTax = 0.00;
                                          $scope.lstSelectedSaleMain[i].FinalTotal = 0.00;


                                          if ($scope.lstSelectedSaleMain[i].TaxCode) {
                                                var obj = _.findWhere($scope.lstTaxCode, {
                                                      TaxType: $scope.lstSelectedSaleMain[i].TaxCode
                                                });
                                                if (obj) {
                                                      $scope.lstSelectedSaleMain[i].TaxRate = obj.TaxRate;
                                                }
                                          }

                                          if (!$scope.lstSelectedSaleMain[i].sequence) {
                                                $scope.lstSelectedSaleMain[i].sequence = i + 1
                                          }

                                          if ($scope.lstSelectedSaleMain[i].idLocations) {
                                                var obj1 = _.findWhere($scope.lstLocations, {
                                                      id: parseInt($scope.lstSelectedSaleMain[i].idLocations)
                                                });
                                                if (obj1) {
                                                      $scope.lstSelectedSaleMain[i].DisplayLocation = obj1.Name;
                                                }
                                          }

                                          var objItem1 = _.findWhere($scope.lstItems, {
                                                ItemCode: $scope.lstSelectedSaleMain[i].ItemCode
                                          });
                                          if (objItem1) {
                                                // $scope.lstSelectedSaleMain[i].itemmargins = objItem1.itemmargins;
                                                $scope.lstSelectedSaleMain[i].listUOM = objItem1.itemuoms;
                                                $scope.lstSelectedSaleMain[i].SaleUOM = objItem1.SalesUOM;
                                                $scope.lstSelectedSaleMain[i].ItemId = objItem1.id;
                                                if (objItem1.isBatch == 1) {
                                                      $scope.lstSelectedSaleMain[i].isBatch = true;
                                                      $scope.lstSelectedSaleMain[i].BatchList = objItem1.itembatches;
                                                } else {
                                                      $scope.lstSelectedSaleMain[i].isBatch = false;
                                                      $scope.lstSelectedSaleMain[i].BatchList = objItem1.itembatches;
                                                }
                                                if ($scope.lstSelectedSaleMain[i].BatchList.length > 0) {
                                                      _.filter($scope.lstSelectedSaleMain[i].BatchList, function (z) {
                                                            var objStock = {
                                                                  ItemCode: $scope.lstSelectedSaleMain[i].ItemCode,
                                                                  BatchNo: z.BatchNumber,
                                                                  UOM: $scope.lstSelectedSaleMain[i].UOM,
                                                                  Location: $scope.lstSelectedSaleMain[i].idLocations
                                                            }
                                                            $http.get($rootScope.RoutePath + 'item/GetAllItemBatchBalQtyByItemCode', {
                                                                  params: objStock
                                                            }).then(function (res) {
                                                                  var objz = res.data.data;
                                                                  z['Stock'] = objz ? objz.BalQty : 0;
                                                            });
                                                            // var objz = _.findWhere(objItem1.itembatchbalqties, { BatchNo: z.BatchNumber, UOM: $scope.lstSelectedSaleMain[i].UOM, Location: $scope.lstSelectedSaleMain[i].idLocations });
                                                            // z['Stock'] = objz ? objz.BalQty : 0;
                                                      })
                                                }
                                                if ($scope.lstSelectedSaleMain[i].BatchNo) {
                                                      var Rate = 1;
                                                      if (objItem1.SalesUOM != $scope.lstSelectedSaleMain[i].UOM) {
                                                            Rate = 1 * _.findWhere(objItem1.itemuoms, {
                                                                  UOM: objItem1.SalesUOM
                                                            }).Rate;
                                                      }
                                                      $scope.lstSelectedSaleMain[i]['MRP'] = $scope.lstSelectedSaleMain[i].itembatch.MRP / Rate;
                                                } else {
                                                      $scope.lstSelectedSaleMain[i]['MRP'] = _.findWhere(objItem1.itemuoms, {
                                                            UOM: $scope.lstSelectedSaleMain[i].UOM
                                                      }).MRP;
                                                }

                                          } else {
                                                $scope.lstSelectedSaleMain[i].listUOM = [];
                                                $scope.lstSelectedSaleMain[i].ItemId = null;
                                                if ($scope.lstSelectedSaleMain[i].BatchNo) {
                                                      var Rate = _.findWhere(objItem1.itemuoms, {
                                                            UOM: $scope.lstSelectedSaleMain[i].UOM
                                                      });
                                                      if (objItem1.SalesUOM != $scope.lstSelectedSaleMain[i].UOM) {
                                                            Rate = 1 * _.findWhere(objItem1.itemuoms, {
                                                                  UOM: objItem1.SalesUOM
                                                            });
                                                      }
                                                      if (Rate) {
                                                            $scope.lstSelectedSaleMain[i]['MRP'] = $scope.lstSelectedSaleMain[i].itembatch.MRP / Rate.Rate;
                                                      } else {
                                                            $scope.lstSelectedSaleMain[i]['MRP'] = $scope.lstSelectedSaleMain[i].itembatch.MRP;
                                                      }
                                                } else {
                                                      $scope.lstSelectedSaleMain[i]['MRP'] = 0;
                                                }
                                          }



                                          if ($scope.lstSelectedSaleMain[i].DiscountAmount) {
                                                $scope.lstSelectedSaleMain[i].DiscountPercentage = ($scope.lstSelectedSaleMain[i].DiscountAmount / ($scope.lstSelectedSaleMain[i].Qty * $scope.lstSelectedSaleMain[i].Price)) * 100;
                                          }
                                          $scope.FillItemUnitPrice($scope.lstSelectedSaleMain[i]);
                                          // $scope.MangeMargin($scope.lstSelectedSaleMain[i]);
                                    })
                              }

                              $scope.WorkingSaleMain = $scope.lstSelectedSaleMain[$scope.lstSelectedSaleMain.length - 1];
                        }


                  });
            }
      }

      $(document).keyup(function (e) {
            if (e.key === "Escape") { // escape key maps to keycode `27`
                  // <DO YOUR WORK HERE>
                  $scope.closeModal();
                  $scope.closeDeliveryPackingSlipModal();
                  $scope.closeModalRelated();
            }
      });

      $scope.init();

});