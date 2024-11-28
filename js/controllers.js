angular.module('epos.controllers', [])
      .controller('AppCtrl', function ($scope, $ionicModal, $ionicPopover, $ionicHistory, $compile, $timeout, $window, $rootScope, $ionicLoading, $ionicPopup, $localstorage, $filter, $state, $http) {
            $scope.$on('$ionicView.enter', function (e) {
                  $rootScope.UserName = $localstorage.get('UserName');
                  $rootScope.currentmenu = $state.current.views.menuContent.data.MenuName;
                  $rootScope.UserId = $localstorage.get('UserId');
                  $rootScope.UserRoles = JSON.parse($localstorage.get('UserRoles'));
                  $scope.UserId = $localstorage.get('UserId');
                  // if ($scope.UserId != undefined && $scope.UserId != null && $scope.UserId != '' && $scope.UserId != 'undefined' && $scope.UserId != 'null') {
                  //     var result = document.getElementById("MainSideMenu")
                  //     var wrappedResult = angular.element(result);
                  //     if (wrappedResult.attr('expose-aside-when') != 'large') {
                  //         var child = wrappedResult.attr('expose-aside-when', 'large')
                  //         $compile(child)($scope);
                  //     }
                  // } else {
                  //     var result = document.getElementById("MainSideMenu");
                  //     var wrappedResult = angular.element(result);
                  //     if (wrappedResult.attr('expose-aside-when') != 'small') {
                  //         var child = wrappedResult.attr('expose-aside-when', 'small')
                  //         $compile(child)($scope);
                  //     }

                  // }
            });

            $(".userMenu").click(function () {
                  $(".userMenu_list").slideToggle();
            })

            $ionicPopover.fromTemplateUrl('SideSubMenu.html', {
                  scope: $scope,
            }).then(function (popover) {
                  $rootScope.SubMenupopover = popover;
            });
            $rootScope.IsHoverMenu = '';
            $rootScope.showSubMenu = function (MenuName) {
                  $rootScope.IsHoverMenu = MenuName;
                  $scope.SubMenupopover.show();
                  if (MenuName == 'Product') {

                        $rootScope.ListSubMenu = _.filter($rootScope.lstmenu, function (item) {
                              if (item.name == 'Product List' || item.name == 'Item Combo' || item.name == 'Stock Management' || item.name == 'UOM Conversion' || item.name == "Item Opening Balance" || item.name == "Product Category" || item.name == 'Promotions' || item.name == 'Supplier' || item.name == 'Drug Master' || item.name == 'Pending List' || item.name == 'ItemBatch' || item.name == 'Voucher Wise Product Search') {
                                    return item;
                              }
                        })
                  } else if (MenuName == 'Manage') {
                        $rootScope.ListSubMenu = _.filter($rootScope.lstmenu, function (item) {
                              if (item.name == 'Location' || item.name == 'Sub Location' || item.name == 'Department' || item.name == 'Customer Management' || item.name == 'Currency Management' || item.name == 'Employee Management' || item.name == "Expense") {
                                    return item;
                              }
                        })
                  } else if (MenuName == 'Purchase') {
                        $rootScope.ListSubMenu = _.filter($rootScope.lstmenu, function (item) {
                              if (item.name == 'Purchase' || item.name == 'Purchase Return' || item.name == 'Purchase Invoice' || item.name == 'AP Invoice' || item.name == 'AP Payment' || item.name == 'AP Cheque Listing' || item.name == 'Purchase Order' || item.name == 'Purchase Payment') {
                                    return item;
                              }
                        })
                  } else if (MenuName == 'Sales') {
                        $rootScope.ListSubMenu = _.filter($rootScope.lstmenu, function (item) {
                              if (item.name == 'Quotation' || item.name == 'Sales' || item.name == 'Sales Return' || item.name == 'Invoice' || item.name == 'Invoice Receive Payment' || item.name == 'AR Invoice' || item.name == 'Cheque Listing' || item.name == 'Sales Receive Payment') {
                                    return item;
                              }
                        })
                  } else if (MenuName == 'Settings') {
                        $rootScope.ListSubMenu = _.filter($rootScope.lstmenu, function (item) {
                              if (item.name == 'Users' || item.name == 'Sequence Number' || item.name == 'Calendar' || item.name == 'Setting' || item.name == 'Database BackUp And Restore' || item.name == "Credit Term" || item.name == 'Payment Method' || item.name == 'Task Type') {
                                    return item;
                              }
                        })
                  } else if (MenuName == 'Report') {
                        $rootScope.ListSubMenu = _.filter($rootScope.lstmenu, function (item) {
                              if (item.name == 'Sales Report' || item.name == 'Purchase Report' || item.name == "Sales Return Report" || item.name == "Purchase Return Report" || item.name == "Item Price Report" || item.name == "Customer Wise Price List Report" || item.name == "Item Stock Movement Report" || item.name == "Stock Balance Report" || item.name == "Shop Stock Report" || item.name == "Profit Progress Report" || item.name == "Stock Report" || item.name == "Customer Bill Search" || item.name == "Party Outstanding Report" || item.name == "Debtor Outstand Report" || item.name == "Creditor Outstand Report" || item.name == "Purchase Pending Report") {
                                    return item;
                              }
                        })

                  } else if (MenuName == "Site") {
                        $rootScope.ListSubMenu = _.filter($rootScope.lstmenu, function (item) {
                              if (item.name == 'Site' || item.name == 'Site Task') {
                                    return item;
                              }
                        })
                  } else if (MenuName == "Ecommerce") {
                        $rootScope.ListSubMenu = _.filter($rootScope.lstmenu, function (item) {
                              if (item.name == 'DynamicPage' || item.name == 'Banner' || item.name == 'MediaManagement') {
                                    return item;
                              }
                        })
                  } else {
                        $rootScope.ListSubMenu = [];
                  }
            }
            // Check whether control button is pressed

            $(document).keydown(function (event) {
                  if (event.which == "17")
                        cntrlIsPressed = true;

            });

            $(document).keyup(function () {
                  cntrlIsPressed = false;
            });

            var cntrlIsPressed = false;
            $rootScope.hideSubMenu = function (o, e) {
                  console.log(cntrlIsPressed)
                  $rootScope.IsHoverMenu = '';
                  $scope.SubMenupopover.hide();
                  if (o.state == "#/app/ProductList") {
                        if (cntrlIsPressed) {
                              window.open(
                                    o.state,
                                    '_blank' // <- This is what makes it open in a new window.
                              );
                        } else {
                              window.location.href = "#/app/ProductList/";
                        }
                        return
                  }
                  if (cntrlIsPressed) {
                        window.open(
                              o.state,
                              '_blank' // <- This is what makes it open in a new window.
                        );
                  } else {

                        window.location.href = o.state;
                  }
            }
            //Cleanup the popover when we're done with it!
            $scope.$on('popover.hidden', function () {
                  $rootScope.IsHoverMenu = '';
            });

            $rootScope.MenuSet = function () {
                  $rootScope.lstmenu = [];
                  $rootScope.lstPemission = [];
                  var token1 = $localstorage.get('token');
                  if (token1 != "" && token1 != undefined) {
                        $http.defaults.headers.common['Authorization'] = token1;
                        $http.get($rootScope.RoutePath + "account/GetAllPageRights").then(function (data) {
                              if (data.data.success == true) {
                                    var lstAllPages = data.data.data;
                                    $rootScope.lstPemission = lstAllPages;
                                    //User
                                    var lstUser = _.filter(lstAllPages, function (obj) {
                                          return obj.module.Name == 'User';
                                    });
                                    if (lstUser.length > 0) {

                                          CallDynamicMenu(lstUser, 'Users', '', 'customer_mgmt.png')
                                    }
                                    //Modules
                                    var lstModules = _.filter(lstAllPages, function (obj) {
                                          return obj.module.Name == 'Module';
                                    });
                                    if (lstModules.length > 0) {

                                          CallDynamicMenu(lstModules, 'Users', '', 'customer_mgmt.png')
                                    }

                                    //Roles
                                    var lstRoles = _.filter(lstAllPages, function (obj) {
                                          return obj.module.Name == 'Roles';
                                    });
                                    if (lstRoles.length > 0) {

                                          CallDynamicMenu(lstRoles, 'Users', '', 'customer_mgmt.png')
                                    }
                                    //Roles Permission
                                    var lstRolePemission = _.filter(lstAllPages, function (obj) {
                                          return obj.module.Name == 'Role Permission';
                                    });
                                    if (lstRolePemission.length > 0) {
                                          CallDynamicMenu(lstRolePemission, 'Users', '', 'customer_mgmt.png')
                                    }

                                    var lstUserLocation = _.filter(lstAllPages, function (obj) {
                                          return obj.module.Name == 'User Location';
                                    });
                                    if (lstUserLocation.length > 0) {

                                          CallDynamicMenu(lstUserLocation, 'Users', '', 'customer_mgmt.png')
                                    }

                                    //User
                                    var lstLocation = _.filter(lstAllPages, function (obj) {
                                          return obj.module.Name == 'Location';
                                    });
                                    if (lstLocation.length > 0) {

                                          CallDynamicMenu(lstLocation, '', 'Location', 'Location.png')
                                    }

                                    //Department
                                    var lstDepartment = _.filter(lstAllPages, function (obj) {
                                          return obj.module.Name == 'Department';
                                    });
                                    if (lstDepartment.length > 0) {

                                          CallDynamicMenu(lstDepartment, '', 'Department', 'Department.png')
                                    }



                                    // Customer Menu start
                                    var lstCustomer = _.filter(lstAllPages, function (obj) {
                                          return obj.module.Name == 'Customer';
                                    });
                                    if (lstCustomer.length > 0) {
                                          CallDynamicMenu(lstCustomer, 'Customer Management', '', 'customer_mgmt.png')
                                    }


                                    //Customer Group
                                    var lstCustomerGroup = _.filter(lstAllPages, function (obj) {
                                          return obj.module.Name == 'Customer Group';
                                    });
                                    if (lstCustomerGroup.length > 0) {

                                          CallDynamicMenu(lstCustomerGroup, 'Customer Management', '', 'customer_mgmt.png')
                                    }

                                    //Customer Branch
                                    var lstCustomerBranch = _.filter(lstAllPages, function (obj) {
                                          return obj.module.Name == 'Customer Branch';
                                    });
                                    if (lstCustomerBranch.length > 0) {

                                          CallDynamicMenu(lstCustomerBranch, 'Customer Management', '', 'customer_mgmt.png')
                                    }

                                    //PriceCategory
                                    var lstPriceCategory = _.filter(lstAllPages, function (obj) {
                                          return obj.module.Name == 'Price Category';
                                    });
                                    if (lstPriceCategory.length > 0) {

                                          CallDynamicMenu(lstPriceCategory, 'Customer Management', '', 'customer_mgmt.png')
                                    }
                                    // Customer Menu End

                                    // Currency Menu Start
                                    //Currency rate
                                    var lstCurrencyRate = _.filter(lstAllPages, function (obj) {
                                          return obj.module.Name == 'Currency Rate';
                                    });
                                    if (lstCurrencyRate.length > 0) {

                                          CallDynamicMenu(lstCurrencyRate, 'Currency Management', '', 'Currency_mgmt.png')
                                    }

                                    //Currency
                                    var lstCurrency = _.filter(lstAllPages, function (obj) {
                                          return obj.module.Name == 'Currency';
                                    });
                                    if (lstCurrency.length > 0) {

                                          CallDynamicMenu(lstCurrency, 'Currency Management', '', 'Currency_mgmt.png')
                                    }

                                    // Currency Menu End

                                    //Item
                                    var lstItems = _.filter(lstAllPages, function (obj) {
                                          return obj.module.Name == 'ProductList';
                                    });
                                    if (lstItems.length > 0) {
                                          CallDynamicMenu(lstItems, '', 'Product List', '')
                                    }

                                    //Voucher Wise Product Search
                                    var lstVoucherWiseProductSearch = _.filter(lstAllPages, function (obj) {
                                          return obj.module.Name == 'VoucherWiseProductSearch';
                                    });
                                    if (lstVoucherWiseProductSearch.length > 0) {
                                          CallDynamicMenu(lstVoucherWiseProductSearch, '', 'Voucher Wise Product Search', '')
                                    }

                                    //Drug Master
                                    var lstDrugMaster = _.filter(lstAllPages, function (obj) {
                                          return obj.module.Name == 'DrugMaster';
                                    });
                                    if (lstDrugMaster.length > 0) {
                                          CallDynamicMenu(lstDrugMaster, '', 'Drug Master', '')
                                    }

                                    //Pending List
                                    var lstPendingList = _.filter(lstAllPages, function (obj) {
                                          return obj.module.Name == 'PendingList';
                                    });
                                    if (lstPendingList.length > 0) {
                                          CallDynamicMenu(lstPendingList, '', 'Pending List', '')
                                    }

                                    //Item Opning Balance
                                    var lstItemsOpningBalance = _.filter(lstAllPages, function (obj) {
                                          return obj.module.Name == 'ItemOpeningBalance';
                                    });
                                    if (lstItemsOpningBalance.length > 0) {
                                          CallDynamicMenu(lstItemsOpningBalance, '', 'Item Opening Balance', '')
                                    }
                                    //Item Menu End

                                    //Item Type Menu Start
                                    //Itemtype
                                    var lstItemType = _.filter(lstAllPages, function (obj) {
                                          return obj.module.Name == 'Item type';
                                    });
                                    if (lstItemType.length > 0) {

                                          CallDynamicMenu(lstItemType, 'Stock Management', '', '')
                                    }

                                    //PopupNote
                                    var lstPopupNote = _.filter(lstAllPages, function (obj) {
                                          return obj.module.Name == 'Popup Note';
                                    });
                                    if (lstPopupNote.length > 0) {

                                          CallDynamicMenu(lstPopupNote, 'Stock Management', '', '')
                                    }

                                    var lstItemPrice = _.filter(lstAllPages, function (obj) {
                                          return obj.module.Name == 'Item Price';
                                    });
                                    if (lstItemPrice.length > 0) {

                                          CallDynamicMenu(lstItemPrice, 'Stock Management', '', '')
                                    }

                                    //UOM
                                    var lstUOM = _.filter(lstAllPages, function (obj) {
                                          return obj.module.Name == 'UOM';
                                    });
                                    if (lstUOM.length > 0) {
                                          CallDynamicMenu(lstUOM, 'Stock Management', '', '')
                                    }

                                    //Brand

                                    var lstBrand = _.filter(lstAllPages, function (obj) {
                                          return obj.module.Name == 'Brand';
                                    });
                                    if (lstBrand.length > 0) {
                                          CallDynamicMenu(lstBrand, 'Stock Management', '', '')
                                    }

                                    //SubBrand

                                    var lstSubBrand = _.filter(lstAllPages, function (obj) {
                                          return obj.module.Name == 'SubBrand';
                                    });
                                    if (lstSubBrand.length > 0) {
                                          CallDynamicMenu(lstSubBrand, 'Stock Management', '', '')
                                    }

                                    //Customer Promotion Email and SMS
                                    var lstCustomerPromotion = _.filter(lstAllPages, function (obj) {
                                          return obj.module.Name == 'Customer Promotion Email And SMS';
                                    });
                                    if (lstCustomerPromotion.length > 0) {

                                          CallDynamicMenu(lstCustomerPromotion, 'Customer Management', '')
                                    }

                                    //UOM
                                    var lstTaxCode = _.filter(lstAllPages, function (obj) {
                                          return obj.module.Name == 'Tax Code';
                                    });
                                    if (lstTaxCode.length > 0) {
                                          CallDynamicMenu(lstTaxCode, 'Stock Management', '', '')
                                    }

                                    //Item Type Menu End


                                    //Purchase
                                    var lstPurchase = _.filter(lstAllPages, function (obj) {
                                          return obj.module.Name == 'Purchase';
                                    });
                                    if (lstPurchase.length > 0) {
                                          CallDynamicMenu(lstPurchase, '', 'Purchase', '')
                                    }

                                    //Purchase Return
                                    var lstPurchaseReturn = _.filter(lstAllPages, function (obj) {
                                          return obj.module.Name == 'Purchase Return';
                                    });
                                    if (lstPurchaseReturn.length > 0) {
                                          CallDynamicMenu(lstPurchaseReturn, '', 'Purchase Return', '')
                                    }

                                    //Sales
                                    var lstSales = _.filter(lstAllPages, function (obj) {
                                          return obj.module.Name == 'Sales';
                                    });
                                    if (lstSales.length > 0) {
                                          CallDynamicMenu(lstSales, '', 'Sales', '')
                                    }

                                    //Sales Return
                                    var lstSalesReturn = _.filter(lstAllPages, function (obj) {
                                          return obj.module.Name == 'Sales Return';
                                    });
                                    if (lstSalesReturn.length > 0) {
                                          CallDynamicMenu(lstSalesReturn, '', 'Sales Return', '')
                                    }
                                    //UOM Conversion
                                    var lstUOMConv = _.filter(lstAllPages, function (obj) {
                                          return obj.module.Name == 'UOMConversion';
                                    });
                                    if (lstUOMConv.length > 0) {
                                          CallDynamicMenu(lstUOMConv, '', 'UOM Conversion', '')
                                    }

                                    //Settings
                                    var lstUOMConv = _.filter(lstAllPages, function (obj) {
                                          return obj.module.Name == 'Sequence Number';
                                    });
                                    if (lstUOMConv.length > 0) {
                                          CallDynamicMenu(lstUOMConv, '', 'Sequence Number', '')
                                    }

                                    //Stock Transfer

                                    var lstStockTransfer = _.filter(lstAllPages, function (obj) {
                                          return obj.module.Name == 'Stock Transfer';
                                    });
                                    if (lstStockTransfer.length > 0) {
                                          lstStockTransfer[0].module.Name = 'Stock Transfer'
                                          CallDynamicMenu(lstStockTransfer, 'Stock Management', '', '')

                                    }

                                    //Best Performance Employee
                                    var lstBPM = _.filter(lstAllPages, function (obj) {
                                          return obj.module.Name == 'Best Performance Employee';
                                    });
                                    if (lstBPM.length > 0) {
                                          CallDynamicMenu(lstBPM, '', 'Best Performance Employee', '')
                                    }

                                    //Calendar
                                    var lstCalendar = _.filter(lstAllPages, function (obj) {
                                          return obj.module.Name == 'Calendar';
                                    });
                                    if (lstCalendar.length > 0) {
                                          CallDynamicMenu(lstCalendar, '', 'Calendar', '')
                                    }

                                    //Quotation
                                    var lstQuotation = _.filter(lstAllPages, function (obj) {
                                          return obj.module.Name == 'Quotation';
                                    });
                                    if (lstQuotation.length > 0) {
                                          CallDynamicMenu(lstQuotation, '', 'Quotation', '')
                                    }

                                    //SubLocation
                                    var lstSubLocation = _.filter(lstAllPages, function (obj) {
                                          return obj.module.Name == 'SubLocation';
                                    });
                                    if (lstSubLocation.length > 0) {
                                          CallDynamicMenu(lstSubLocation, '', 'Sub Location', 'Location.png')
                                    }

                                    //Setting
                                    var lstSetting = _.filter(lstAllPages, function (obj) {
                                          return obj.module.Name == 'Setting';
                                    });
                                    if (lstSetting.length > 0) {
                                          CallDynamicMenu(lstSetting, '', 'Setting', '')
                                    }
                                    //DynamicPage
                                    var lstDynamicPage = _.filter(lstAllPages, function (obj) {
                                          return obj.module.Name == 'DynamicPage';
                                    });
                                    if (lstDynamicPage.length > 0) {
                                          CallDynamicMenu(lstDynamicPage, '', 'DynamicPage', '')
                                    }

                                    //Banner
                                    var lstBanner = _.filter(lstAllPages, function (obj) {
                                          return obj.module.Name == 'Banner';
                                    });
                                    if (lstBanner.length > 0) {
                                          CallDynamicMenu(lstBanner, '', 'Banner', '')
                                    }
                                    //MediaManagement
                                    var lstMediaManagement = _.filter(lstAllPages, function (obj) {
                                          return obj.module.Name == 'MediaManagement';
                                    });
                                    if (lstMediaManagement.length > 0) {
                                          CallDynamicMenu(lstMediaManagement, '', 'MediaManagement', '')
                                    }

                                    //Purchase Report
                                    var lstPurchaseReport = _.filter(lstAllPages, function (obj) {
                                          return obj.module.Name == 'Purchase Report';
                                    });
                                    if (lstPurchaseReport.length > 0) {
                                          CallDynamicMenu(lstPurchaseReport, '', 'Purchase Report', '')
                                    }

                                    //Purchase Return Report
                                    var lstPurchaseReturnReport = _.filter(lstAllPages, function (obj) {
                                          return obj.module.Name == 'Purchase Return Report';
                                    });
                                    if (lstPurchaseReturnReport.length > 0) {
                                          CallDynamicMenu(lstPurchaseReturnReport, '', 'Purchase Return Report', '')
                                    }

                                    var lstSalesReport = _.filter(lstAllPages, function (obj) {
                                          return obj.module.Name == 'SalesReport';
                                    })
                                    if (lstSalesReport.length > 0) {
                                          CallDynamicMenu(lstSalesReport, '', 'Sales Report', '')
                                    }

                                    var lstSalesReturnReport = _.filter(lstAllPages, function (obj) {
                                          return obj.module.Name == 'SalesReturnReport';
                                    })
                                    if (lstSalesReturnReport.length > 0) {
                                          CallDynamicMenu(lstSalesReturnReport, '', 'Sales Return Report', '')
                                    }
                                    var lstItemPriceReport = _.filter(lstAllPages, function (obj) {
                                          return obj.module.Name == 'ItemPriceReport';
                                    })
                                    if (lstItemPriceReport.length > 0) {
                                          CallDynamicMenu(lstItemPriceReport, '', 'Item Price Report', '')
                                    }

                                    var lstCustomerWisePriceListReport = _.filter(lstAllPages, function (obj) {
                                          return obj.module.Name == 'Customer Wise Price List Report';
                                    })
                                    if (lstCustomerWisePriceListReport.length > 0) {
                                          CallDynamicMenu(lstCustomerWisePriceListReport, '', 'Customer Wise Price List Report', '')
                                    }

                                    var lstStockMovementReport = _.filter(lstAllPages, function (obj) {
                                          return obj.module.Name == 'ItemStockMovementReport';
                                    })
                                    if (lstStockMovementReport.length > 0) {
                                          CallDynamicMenu(lstStockMovementReport, '', 'Item Stock Movement Report', '')
                                    }

                                    var lstStockBalanceReport = _.filter(lstAllPages, function (obj) {
                                          return obj.module.Name == 'Stock Balance Report';
                                    })
                                    if (lstStockBalanceReport.length > 0) {
                                          CallDynamicMenu(lstStockBalanceReport, '', 'Stock Balance Report', '')
                                    }
                                    //Stcok report
                                    var lstStockReport = _.filter(lstAllPages, function (obj) {
                                          return obj.module.Name == 'Stock Report';
                                    });
                                    if (lstStockReport.length > 0) {
                                          CallDynamicMenu(lstStockReport, '', 'Stock Report', '')
                                    }
                                    //Profit Progress Report
                                    var lstStockReport = _.filter(lstAllPages, function (obj) {
                                          return obj.module.Name == 'Profit Progress Report';
                                    });
                                    if (lstStockReport.length > 0) {
                                          CallDynamicMenu(lstStockReport, '', 'Profit Progress Report', '')
                                    }
                                    //Customer Bill Search
                                    var lstStockReport = _.filter(lstAllPages, function (obj) {
                                          return obj.module.Name == 'Customer Bill Search';
                                    });
                                    if (lstStockReport.length > 0) {
                                          CallDynamicMenu(lstStockReport, '', 'Customer Bill Search', '')
                                    }



                                    var PartyOutstandingReport = _.filter(lstAllPages, function (obj) {
                                          return obj.module.Name == 'Party Outstanding Report';
                                    })
                                    if (PartyOutstandingReport.length > 0) {
                                          CallDynamicMenu(PartyOutstandingReport, '', 'Party Outstanding Report', '')
                                    }


                                    var lstEmployee = _.filter(lstAllPages, function (obj) {
                                          return obj.module.Name == 'Employee';
                                    })
                                    if (lstEmployee.length > 0) {
                                          CallDynamicMenu(lstEmployee, 'Employee Management', 'Employee', 'customer_mgmt.png');
                                    }

                                    var lstEmployeeAttendence = _.filter(lstAllPages, function (obj) {
                                          return obj.module.Name == 'Employee Attendance';
                                    })
                                    if (lstEmployeeAttendence.length > 0) {
                                          CallDynamicMenu(lstEmployeeAttendence, 'Employee Management', 'Employee Attendance', '');
                                    }

                                    var lstEmployeeSalary = _.filter(lstAllPages, function (obj) {
                                          return obj.module.Name == 'Employee Salary';
                                    })
                                    if (lstEmployeeSalary.length > 0) {
                                          CallDynamicMenu(lstEmployeeSalary, 'Employee Management', 'Employee Salary', '');
                                    }

                                    var lstDatabaseBackUpAndRestore = _.filter(lstAllPages, function (obj) {
                                          return obj.module.Name == 'DatabaseBackUpAndRestore';
                                    });
                                    if (lstDatabaseBackUpAndRestore.length > 0) {
                                          CallDynamicMenu(lstDatabaseBackUpAndRestore, '', 'Database BackUp And Restore', '')
                                    }

                                    var lstCreditTerm = _.filter(lstAllPages, function (obj) {
                                          return obj.module.Name == 'CreditTerm';
                                    });
                                    if (lstCreditTerm.length > 0) {
                                          CallDynamicMenu(lstCreditTerm, '', 'Credit Term', '')
                                    }

                                    //Reference Level
                                    var lstReferenceLevel = _.filter(lstAllPages, function (obj) {
                                          return obj.module.Name == 'Reference Level';
                                    });
                                    if (lstReferenceLevel.length > 0) {

                                          CallDynamicMenu(lstReferenceLevel, 'Customer Management', '', 'customer_mgmt.png')
                                    }

                                    //Payment Method
                                    var lstPaymentMethod = _.filter(lstAllPages, function (obj) {
                                          return obj.module.Name == 'PaymentMethod';
                                    });
                                    if (lstPaymentMethod.length > 0) {

                                          CallDynamicMenu(lstPaymentMethod, '', 'Payment Method', '')
                                    }

                                    //Invoice
                                    var lstInvoice = _.filter(lstAllPages, function (obj) {
                                          return obj.module.Name == 'Invoice';
                                    });
                                    if (lstInvoice.length > 0) {
                                          CallDynamicMenu(lstInvoice, '', 'Invoice', '')
                                    }
                                    //Invoice Receive Payment
                                    var lstInvoiceRecivePayment = _.filter(lstAllPages, function (obj) {
                                          return obj.module.Name == 'Invoice Receive Payment';
                                    });
                                    if (lstInvoiceRecivePayment.length > 0) {
                                          CallDynamicMenu(lstInvoiceRecivePayment, '', 'Invoice Receive Payment', '')
                                    }

                                    //Item Category
                                    var lstItemCategory = _.filter(lstAllPages, function (obj) {
                                          return obj.module.Name == 'ProductCategory';
                                    });
                                    if (lstItemCategory.length > 0) {
                                          CallDynamicMenu(lstItemCategory, '', 'Product Category', '')
                                    }

                                    //AR Invoice
                                    var lstARInvoice = _.filter(lstAllPages, function (obj) {
                                          return obj.module.Name == 'ARInvoice';
                                    });
                                    if (lstARInvoice.length > 0) {
                                          CallDynamicMenu(lstARInvoice, '', 'AR Invoice', '')
                                    }

                                    //Cheque Listing
                                    var lstChequeListing = _.filter(lstAllPages, function (obj) {
                                          return obj.module.Name == 'ChequeListing';
                                    });
                                    if (lstChequeListing.length > 0) {
                                          CallDynamicMenu(lstChequeListing, '', 'Cheque Listing', '')
                                    }

                                    //Invoice Receive Payment
                                    var lstSalesRecivePayment = _.filter(lstAllPages, function (obj) {
                                          return obj.module.Name == 'Sales Receive Payment';
                                    });
                                    if (lstSalesRecivePayment.length > 0) {
                                          CallDynamicMenu(lstSalesRecivePayment, '', 'Sales Receive Payment', '')
                                    }

                                    //Debtor Outstand Report
                                    var lstDebtorOutstandReport = _.filter(lstAllPages, function (obj) {
                                          return obj.module.Name == 'DebtorOutstandReport';
                                    });
                                    if (lstDebtorOutstandReport.length > 0) {
                                          CallDynamicMenu(lstDebtorOutstandReport, '', 'Debtor Outstand Report', '')
                                    }

                                    //Purchase Invoice
                                    var lstPurchaseInvoice = _.filter(lstAllPages, function (obj) {
                                          return obj.module.Name == 'PurchaseInvoice';
                                    });
                                    if (lstPurchaseInvoice.length > 0) {
                                          CallDynamicMenu(lstPurchaseInvoice, '', 'Purchase Invoice', '')
                                    }

                                    //AP Invoice
                                    var lstAPInvoice = _.filter(lstAllPages, function (obj) {
                                          return obj.module.Name == 'APInvoice';
                                    });
                                    if (lstAPInvoice.length > 0) {
                                          CallDynamicMenu(lstAPInvoice, '', 'AP Invoice', '')
                                    }

                                    //AP Payment
                                    var lstAPPayment = _.filter(lstAllPages, function (obj) {
                                          return obj.module.Name == 'APPayment';
                                    });
                                    if (lstAPPayment.length > 0) {
                                          CallDynamicMenu(lstAPPayment, '', 'AP Payment', '')
                                    }

                                    //AP Cheque Listing
                                    var lstAPChequeListing = _.filter(lstAllPages, function (obj) {
                                          return obj.module.Name == 'APChequeListing';
                                    });
                                    if (lstAPChequeListing.length > 0) {
                                          CallDynamicMenu(lstAPChequeListing, '', 'AP Cheque Listing', '')
                                    }

                                    //Creditor Outstand Report
                                    var lstCreditorOutstandReport = _.filter(lstAllPages, function (obj) {
                                          return obj.module.Name == 'CreditorOutstandReport';
                                    });
                                    if (lstCreditorOutstandReport.length > 0) {
                                          CallDynamicMenu(lstCreditorOutstandReport, '', 'Creditor Outstand Report', '')
                                    }

                                    //Task Type
                                    var lstTaskType = _.filter(lstAllPages, function (obj) {
                                          return obj.module.Name == 'TaskType';
                                    });
                                    if (lstTaskType.length > 0) {
                                          CallDynamicMenu(lstTaskType, '', 'Task Type', '')
                                    }

                                    //Task
                                    var lstTask = _.filter(lstAllPages, function (obj) {
                                          return obj.module.Name == 'Task';
                                    })
                                    if (lstTask.length > 0) {
                                          CallDynamicMenu(lstTask, 'Employee Management', 'Task', 'customer_mgmt.png');
                                    }

                                    //Item Combo
                                    var lstItemCombo = _.filter(lstAllPages, function (obj) {
                                          return obj.module.Name == 'ItemCombo';
                                    });
                                    if (lstItemCombo.length > 0) {
                                          CallDynamicMenu(lstItemCombo, '', 'Item Combo', '')
                                    }

                                    //Promotions
                                    var lstPromotions = _.filter(lstAllPages, function (obj) {
                                          return obj.module.Name == 'Promotions';
                                    });
                                    if (lstPromotions.length > 0) {
                                          CallDynamicMenu(lstPromotions, '', 'Promotions', '')
                                    }

                                    // Supplier Menu start
                                    var lstSupplier = _.filter(lstAllPages, function (obj) {
                                          return obj.module.Name == 'Supplier';
                                    });
                                    if (lstSupplier.length > 0) {
                                          CallDynamicMenu(lstSupplier, '', 'Supplier', '')
                                    }
                                    // ItemBatch Menu start
                                    var lstItemBatch = _.filter(lstAllPages, function (obj) {
                                          return obj.module.Name == 'ItemBatch';
                                    });
                                    if (lstItemBatch.length > 0) {
                                          CallDynamicMenu(lstItemBatch, '', 'ItemBatch', '')
                                    }

                                    //Expense Menu
                                    var lstExpenseCategory = _.filter(lstAllPages, function (obj) {
                                          return obj.module.Name == 'Expense Category';
                                    })
                                    if (lstExpenseCategory.length > 0) {
                                          CallDynamicMenu(lstExpenseCategory, 'Expense', 'Expense Category', 'budget.png');
                                    }

                                    var lstExpense = _.filter(lstAllPages, function (obj) {
                                          return obj.module.Name == 'Expense';
                                    })

                                    if (lstExpense.length > 0) {
                                          CallDynamicMenu(lstExpense, 'Expense', 'Expense', '');
                                    }

                                    var lstEnquiry = _.filter(lstAllPages, function (obj) {
                                          return obj.module.Name == 'Enquiry Mgmt';
                                    })

                                    if (lstEnquiry.length > 0) {
                                          CallDynamicMenu(lstEnquiry, 'Customer Management', 'Enquiry Mgmt', 'customer_mgmt.png');
                                    }


                                    var lstManageEnquiry = _.filter(lstAllPages, function (obj) {
                                          return obj.module.Name == 'Enquiry';
                                    })

                                    if (lstManageEnquiry.length > 0) {
                                          CallDynamicMenu(lstManageEnquiry, 'Customer Management', 'Enquiry', 'customer_mgmt.png');
                                    }
                                    var lstDocumentUpload = _.filter(lstAllPages, function (obj) {
                                          return obj.module.Name == 'Document Upload';
                                    })

                                    if (lstDocumentUpload.length > 0) {
                                          CallDynamicMenu(lstDocumentUpload, 'Users', 'Document Upload', '');
                                    }
                                    var lstPurchaseOrder = _.filter(lstAllPages, function (obj) {
                                          return obj.module.Name == 'PurchaseOrder';
                                    });
                                    if (lstPurchaseOrder.length > 0) {
                                          CallDynamicMenu(lstPurchaseOrder, '', 'Purchase Order', '')
                                    }
                                    var lstPurchasePayment = _.filter(lstAllPages, function (obj) {
                                          return obj.module.Name == 'Purchase Payment';
                                    });
                                    if (lstPurchasePayment.length > 0) {
                                          CallDynamicMenu(lstPurchasePayment, '', 'Purchase Payment', '')
                                    }

                                    //Purchase Pending Report
                                    var lstPurchasePendingReport = _.filter(lstAllPages, function (obj) {
                                          return obj.module.Name == 'PurchasePendingReport';
                                    });
                                    if (lstPurchasePendingReport.length > 0) {
                                          CallDynamicMenu(lstPurchasePendingReport, '', 'Purchase Pending Report', '')
                                    }

                                    //Site
                                    var lstSite = _.filter(lstAllPages, function (obj) {
                                          return obj.module.Name == 'Site';
                                    });
                                    if (lstSite.length > 0) {
                                          CallDynamicMenu(lstSite, '', 'Site', '')
                                    }

                                    //Site Task
                                    var lstSite = _.filter(lstAllPages, function (obj) {
                                          return obj.module.Name == 'SiteTask';
                                    });
                                    if (lstSite.length > 0) {
                                          CallDynamicMenu(lstSite, '', 'Site Task', '')
                                    }

                                    //Site Task
                                    var lstShopStockReport = _.filter(lstAllPages, function (obj) {
                                          return obj.module.Name == 'Shop Stock Report';
                                    });
                                    if (lstShopStockReport.length > 0) {
                                          CallDynamicMenu(lstShopStockReport, '', 'Shop Stock Report', '')
                                    }

                              }
                              $rootScope.MenuPermission();
                        });
                  }

            }
            $rootScope.MenuSet();

            function CallDynamicMenu(lstModules, MainMenu, menu, icon) {
                  if (MainMenu != '' && MainMenu != null && MainMenu != undefined) {
                        var findMenu = _.filter($rootScope.lstmenu, {
                              name: MainMenu
                        });
                        if (findMenu.length == 0) {
                              var obj = new Object();
                              obj.name = MainMenu;
                              obj.state = "";
                              obj.items = [];
                              obj.icon = icon;

                              $rootScope.lstmenu.push(obj);
                              var index = _.findIndex($rootScope.lstmenu, {
                                    name: MainMenu
                              });
                              var obj = new Object();
                              obj.title = lstModules[0].module.Name;
                              obj.state = "#/app/" + lstModules[0].module.Name;
                              $rootScope.lstmenu[index].items.push(obj);
                              if (lstModules[0].module.Name == $state.current.views.menuContent.data.MenuName) {
                                    $rootScope.toggleGroup($rootScope.lstmenu[index])
                              }

                        } else {
                              var index = _.findIndex($rootScope.lstmenu, {
                                    name: MainMenu
                              });
                              var obj = new Object();
                              obj.title = lstModules[0].module.Name;
                              obj.state = "#/app/" + lstModules[0].module.Name
                              $rootScope.lstmenu[index].items.push(obj);
                              if (lstModules[0].module.Name == $state.current.views.menuContent.data.MenuName) {
                                    $rootScope.toggleGroup($rootScope.lstmenu[index])
                              }
                        }
                  } else {
                        var obj = new Object();
                        obj.name = menu;
                        obj.state = "#/app/" + lstModules[0].module.Name;
                        obj.items = [];
                        obj.icon = icon;
                        $rootScope.lstmenu.push(obj);
                  }
            }

            $scope.GetPageTitle = function () {
                  if ($state.current.views && $state.current.views.menuContent.data != '' && $state.current.views.menuContent.data != undefined && $state.current.views.menuContent.data != null) {
                        return $state.current.views.menuContent.data.pageTitle;
                  } else {
                        return "";
                  }
            }

            $rootScope.toggleGroup = function (group) {
                  if ($rootScope.isGroupShown(group)) {
                        $rootScope.shownGroup = null;
                  } else {
                        $rootScope.shownGroup = group;
                  }
            };

            $rootScope.isGroupShown = function (group) {
                  return $rootScope.shownGroup === group;
            };

            $rootScope.Loading = 'Loading';
            $rootScope.$watch(
                  function () {
                        return 'Loading';
                  },
                  function (newval) {
                        $rootScope.Loading = newval;
                  }
            );

            $rootScope.ShowLoader = function () {
                  $ionicLoading.show({
                        template: '<i class="icon ion-refresh"></i> ' + $rootScope.Loading
                  });
            }

            $rootScope.logout = function () {
                  $state.go('app.LogOut');
            }
            $rootScope.Dynamicfraction = '';
            $rootScope.GetAllGlobalSetting = function () {
                  //Defualt 2(if setting not get)
                  var objNumber = {
                        ToFixed: 2,
                        IsAllowdot: true,
                  }
                  $http.get($rootScope.RoutePath + "account/GetAllSetting").success(function (resData) {

                        var FindNumberSetting = _.findWhere(resData, {
                              Name: "ToFixedNumber"
                        });
                        if (FindNumberSetting) {
                              objNumber.ToFixed = FindNumberSetting.Value != null && FindNumberSetting.Value != '' ? FindNumberSetting.Value : 2;
                        }
                        var FindCommaSetting = _.findWhere(resData, {
                              Name: "AllowComma"
                        });
                        if (FindCommaSetting) {
                              if (FindCommaSetting.Value == "1" || FindCommaSetting.Value == 1) {
                                    objNumber.IsAllowdot = false;
                              }
                        }
                        $rootScope.Dynamicfraction = JSON.stringify(objNumber);
                  })
            }
            $rootScope.GetAllGlobalSetting();

            //Pos Till Page
            $scope.$on('$ionicView.loaded', function (e) {
                  resizeHeight()
                  MangeHeaderbar();
            });


            $(window).on("resize", function () {
                  resizeHeight()
            }).resize();


            function resizeHeight() {
                  $timeout(function () {
                        // Main Container Height Set
                        var cHeight = $(window).height() - $('header').height();
                        // console.log(cHeight);
                        $('.contentHeight').css('height', cHeight);

                        // Part B Container Height Set
                        var orderItem_cont_height = cHeight - $('.orderFooter_cont').height();
                        $('.orderItem_cont').css('height', orderItem_cont_height);
                  }, 100)
            }

            $rootScope.IsHideMainHeader = false;

            function MangeHeaderbar() {
                  $rootScope.IsHideMainHeader = false;
                  var currentState = $state.current.name;
                  if (currentState.indexOf('Pos_Till_') != -1) {
                        $rootScope.IsHideMainHeader = true;
                  }
            }
            $rootScope.ObjPemission = {};
            $rootScope.ObjPemission['Dashboard'] = false;
            $rootScope.ObjPemission['Product'] = false;
            $rootScope.ObjPemission['Manage'] = false;
            $rootScope.ObjPemission['Purchase'] = false;
            $rootScope.ObjPemission['Sales'] = false;
            $rootScope.ObjPemission['Settings'] = false;
            $rootScope.ObjPemission['Report'] = false;
            $rootScope.ObjPemission['PosTill'] = false;
            $rootScope.ObjPemission['Message'] = false;
            $rootScope.ObjPemission['Site'] = false;
            $rootScope.ObjPemission['Ecommerce'] = false;

            $rootScope.MenuPermission = function () {

                  var ObjDashboard = _.filter($rootScope.lstPemission, function (item) {
                        if (item.module.Name == "Dashboard") {
                              return item;
                        }
                  })
                  if (ObjDashboard.length > 0) {
                        $rootScope.ObjPemission['Dashboard'] = true;
                  }
                  var ObjMessage = _.filter($rootScope.lstPemission, function (item) {
                        if (item.module.Name == "Message") {
                              return item;
                        }
                  })
                  if (ObjMessage.length > 0) {
                        $rootScope.ObjPemission['Message'] = true;
                  }

                  var ObjPosTill = _.filter($rootScope.lstPemission, function (item) {
                        if (item.module.Name == "PosTill") {
                              return item;
                        }
                  })
                  if (ObjPosTill.length > 0) {
                        $rootScope.ObjPemission['PosTill'] = true;
                  }
                  var ObjProduct = _.filter($rootScope.lstmenu, function (item) {
                        if (item.name == 'Item' || item.name == 'Item Combo' || item.name == 'Stock Management' || item.name == 'UOM Conversion' || item.name == "Item Opening Balance" || item.name == "Product Category" || item.name == "Promotions" || item.name == "Supplier" || item.name == "ItemBatch" || item.name == "Drug Master" || item.name == "Pending List" || item.name == "Voucher Wise Product Search") {
                              return item;
                        }
                  })
                  if (ObjProduct.length > 0) {
                        $rootScope.ObjPemission['Product'] = true;
                  }

                  var ObjManage = _.filter($rootScope.lstmenu, function (item) {
                        if (item.name == 'Location' || item.name == 'Sub Location' || item.name == 'Department' || item.name == 'Customer Management' || item.name == 'Currency Management' || item.name == 'Employee Management' || item.name == 'Expense') {
                              return item;
                        }
                  })
                  if (ObjManage.length > 0) {
                        $rootScope.ObjPemission['Manage'] = true;
                  }

                  var objPurchase = _.filter($rootScope.lstmenu, function (item) {
                        if (item.name == 'Purchase' || item.name == 'Purchase Return' || item.name == 'Purchase Invoice' || item.name == 'AP Invoice' || item.name == 'AP Payment' || item.name == 'AP Cheque Listing' || item.name == 'Purchase Order' || item.name == 'Purchase Payment') {
                              return item;
                        }
                  })
                  if (objPurchase.length > 0) {
                        $rootScope.ObjPemission['Purchase'] = true;
                  }

                  var objSales = _.filter($rootScope.lstmenu, function (item) {
                        if (item.name == 'Quotation' || item.name == 'Sales' || item.name == 'Sales Return' || item.name == 'Invoice' || item.name == 'Invoice Receive Payment' || item.name == 'AR Invoice' || item.name == 'Cheque Listing' || item.name == 'Sales Receive Payment') {
                              return item;
                        }
                  })
                  if (objSales.length > 0) {
                        $rootScope.ObjPemission['Sales'] = true;
                  }


                  var objSettings = _.filter($rootScope.lstmenu, function (item) {
                        if (item.name == 'Users' || item.name == 'Sequence Number' || item.name == 'Calendar' || item.name == 'Setting' || item.name == 'Database BackUp And Restore' || item.name == "Credit Term" || item.name == 'Payment Method' || item.name == 'Task Type' || item.name == "Site") {
                              return item;
                        }
                  })
                  if (objSettings.length > 0) {
                        $rootScope.ObjPemission['Settings'] = true;
                  }

                  var objEcomerce = _.filter($rootScope.lstmenu, function (item) {
                        if (item.name == 'DynamicPage' || item.name == 'MediaManagement') {
                              return item;
                        }
                  })
                  if (objEcomerce.length > 0) {
                        $rootScope.ObjPemission['Ecommerce'] = true;
                  }

                  var objReport = _.filter($rootScope.lstmenu, function (item) {
                        if (item.name == 'Sales Report' || item.name == 'Purchase Report' || item.name == "Sales Return Report" || item.name == "Purchase Return Report" || item.name == "Item Price Report" || item.name == "Customer Wise Price List Report" || item.name == "Item Stock Movement Report" || item.name == "Stock Balance Report" || item.name == "Shop Stock Report" || item.name == "Stock Report" || item.name == "Profit Progress Report" || item.name == "Customer Bill Search" || item.name == "Debtor Outstand Report" || item.name == "Creditor Outstand Report" || item.name == "Purchase Pending Report") {
                              return item;
                        }
                  })
                  if (objReport.length > 0) {
                        $rootScope.ObjPemission['Report'] = true;
                  }

                  var objSite = _.filter($rootScope.lstmenu, function (item) {
                        if (item.name == 'Site' || item.name == 'Site Task') {
                              return item;
                        }
                  })
                  if (objSite.length > 0) {
                        $rootScope.ObjPemission['Site'] = true;
                  }

            }
      })

      .controller('LogOutCtrl', function ($scope, $ionicLoading, $ionicHistory, $window, $state, $ionicViewService, $rootScope, $localstorage, $http) {
            if ($localstorage.get('IsRemember') == 'false') {
                  $localstorage.set('Password', '');
                  $localstorage.set('IsRemember', false);
                  $localstorage.set('UserName', '');
            }

            $http.defaults.headers.common['Authorization'] = null;
            $localstorage.set('IsLogin', false);

            $localstorage.set('UserId', null);
            $localstorage.set('UserName', null);
            $localstorage.set('EmailAddress', null);
            $localstorage.set('PhoneNumber', null);
            $localstorage.set('UserCode', null);
            $localstorage.set('DefaultLocation', null);
            $localstorage.set('DefaultDepartment', null);
            $localstorage.set('UserRoles', null);
            $localstorage.set('idLocations', null);
            $localstorage.set('token', null);
            $localstorage.set("IsPosUserLogin", "0");
            $localstorage.set("IsPosUserId", null);
            $localstorage.set('RefCustUserId', '');
            $localstorage.set('CustomerGroup', null);
            $localstorage.set('CustomerGroupId', null);
            $localstorage.set('CustomerGroupLocatio', null);
            $localstorage.set('CustomerBranch', null);
            $ionicHistory.nextViewOptions({
                  disableBack: true
            });
            $rootScope.lstmenu = [];
            $state.go('appLogin');
            setTimeout(function () {
                  $window.location.reload();
            }, 100)
      });