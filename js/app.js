// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.controllers' is found in controllers.js

var app = angular.module('epos', ['ionic', 'ionic-modal-select', 'epos.controllers', 'ion-datetime-picker', 'ui.calendar', 'thatisuday.dropzone'])
      .run(function ($rootScope, $http, $localstorage, $window, $timeout) {
            $rootScope.RoutePath = "http://localhost:20031/";
            $rootScope.RoutePath = "http://138.197.15.44:20031/";
            // $rootScope.RoutePath = "http://192.168.1.123:20031/";

            $rootScope.RoutePathImport = "http://138.197.15.44:20047/";

            $rootScope.CommitVersion = function () {
                  $http.get($rootScope.RoutePath + "account/Version").then(function (data) {
                        $rootScope.ApiVersion = data.data.data.ApiVersion
                        $rootScope.AdminVersion = data.data.data.GenmedAdminVersion
                  })
            };
            $rootScope.CommitVersion();
            //jayesh bhanderi 
            $rootScope.$on('$stateChangeStart',
                  function (event, toState, toParams, fromState, fromParams) {
                        console.log(toState.url)
                        if (toState.url != '/appLogin') {
                              var UserId = $localstorage.get('UserId');
                              if (UserId == undefined || UserId == null || UserId == '' || UserId == 'null' || UserId == 'undefined') {
                                    $window.location.href = "/#/app/login";
                                    $timeout(function () {
                                          $window.location.reload();
                                    });
                              }
                        }
                        // check if user is navigating to anypage other than login, if so check for token, if token is not present redirect to login page        
                  }
            );
      })

      .config(function ($stateProvider, $urlRouterProvider) {
            $stateProvider
                  .state('appLogin', {
                        url: '/appLogin',
                        // abstract: true,
                        templateUrl: 'templates/login.html',
                        controller: 'LoginCtrl'
                  })

                  .state('app', {
                        url: '/app',
                        abstract: true,
                        templateUrl: 'templates/menu.html',
                        controller: 'AppCtrl'
                  })

                  .state('app.LogOut', {
                        url: '/LogOut',
                        views: {
                              'menuContent': {
                                    //templateUrl: 'templates/LandingPage.html',
                                    controller: 'LogOutCtrl'
                              }
                        },
                        cache: false
                  })
                  //   .state('app.Login', {
                  //     url: '/Login',
                  //     views: {
                  //       'menuContent': {
                  //         templateUrl: 'templates/login.html',
                  //         controller: 'LoginCtrl',
                  //         data: {
                  //           pageTitle: 'Login',
                  //           MenuName: 'Login'
                  //         }
                  //       }
                  //     },
                  //     cache: false
                  //   })
                  .state('app.DashBoard', {
                        url: '/DashBoard',
                        views: {
                              'menuContent': {
                                    templateUrl: 'templates/Dashboard.html',
                                    controller: 'DashBoardCtrl',
                                    data: {
                                          pageTitle: 'Dashboard',
                                          MenuName: 'Dashboard'
                                    }
                              }
                        },
                        cache: false
                  })
                  .state('app.Module', {
                        url: '/Module',
                        views: {
                              'menuContent': {
                                    templateUrl: 'templates/Modules.html',
                                    controller: 'ModulesController',
                                    data: {
                                          pageTitle: 'Module',
                                          MenuName: 'Module'
                                    }
                              }
                        },
                        cache: false
                  })
                  .state('app.Department', {
                        url: '/Department',
                        views: {
                              'menuContent': {
                                    templateUrl: 'templates/Department.html',
                                    controller: 'DepartmentController',
                                    data: {
                                          pageTitle: 'Department',
                                          MenuName: 'Department'
                                    }
                              }
                        },
                        cache: false
                  })
                  .state('app.Roles', {
                        url: '/Roles',
                        views: {
                              'menuContent': {
                                    templateUrl: 'templates/Roles.html',
                                    controller: 'RolesController',
                                    data: {
                                          pageTitle: 'Roles Management',
                                          MenuName: 'Roles'
                                    }
                              }
                        },
                        cache: false
                  })
                  .state('app.Users', {
                        url: '/User',
                        views: {
                              'menuContent': {
                                    templateUrl: 'templates/Users.html',
                                    controller: 'UsersController',
                                    data: {
                                          pageTitle: 'User',
                                          MenuName: 'User'
                                    }
                              }
                        },
                        cache: false
                  })
                  .state('app.Location', {
                        url: '/Location',
                        views: {
                              'menuContent': {
                                    templateUrl: 'templates/Location.html',
                                    controller: 'LocationController',
                                    data: {
                                          pageTitle: 'Manage Location',
                                          MenuName: 'Location'
                                    }
                              }
                        },
                        cache: false
                  })
                  .state('app.ProductList', {
                        url: '/ProductList/:itemcode',
                        views: {
                              'menuContent': {
                                    templateUrl: 'templates/Item.html',
                                    controller: 'ItemController',
                                    data: {
                                          pageTitle: 'Product List',
                                          MenuName: 'Product List'
                                    }
                              }
                        },
                        cache: false
                  })

                  .state('app.VoucherWiseProductSearch', {
                        url: '/VoucherWiseProductSearch',
                        views: {
                              'menuContent': {
                                    templateUrl: 'templates/VoucherWiseProductSearch.html',
                                    controller: 'VoucherWiseProductSearchController',
                                    data: {
                                          pageTitle: 'Voucher Wise Product Search',
                                          MenuName: 'Voucher Wise Product Search'
                                    }
                              }
                        },
                        cache: false
                  })

                  .state('app.DrugMaster', {
                        url: '/DrugMaster',
                        views: {
                              'menuContent': {
                                    templateUrl: 'templates/DrugMaster.html',
                                    controller: 'DrugMasterController',
                                    data: {
                                          pageTitle: 'Drug Master',
                                          MenuName: 'Drug Master'
                                    }
                              }
                        },
                        cache: false
                  })

                  .state('app.PendingList', {
                        url: '/PendingList',
                        views: {
                              'menuContent': {
                                    templateUrl: 'templates/PendingList.html',
                                    controller: 'PendingListController',
                                    data: {
                                          pageTitle: 'Pending List',
                                          MenuName: 'Pending List'
                                    }
                              }
                        },
                        cache: false
                  })

                  .state('app.SequenceNumber', {
                        url: '/Sequence Number',
                        views: {
                              'menuContent': {
                                    templateUrl: 'templates/SequenceNumber.html',
                                    controller: 'SequenceNumberController',
                                    data: {
                                          pageTitle: 'Sequence Number',
                                          MenuName: 'Sequence Number'
                                    }
                              }
                        },
                        cache: false
                  })

                  .state('app.Purchase', {
                        url: '/Purchase',
                        views: {
                              'menuContent': {
                                    templateUrl: 'templates/Purchase.html',
                                    controller: 'PurchaseController',
                                    data: {
                                          pageTitle: 'Purchase',
                                          MenuName: 'Purchase'
                                    }
                              }
                        },
                        cache: false
                  })

                  .state('app.Banner', {
                        url: '/Banner',
                        views: {
                              'menuContent': {
                                    templateUrl: 'templates/Banner.html',
                                    controller: 'BannerController',
                                    data: {
                                          pageTitle: 'Banner',
                                          MenuName: 'Banner'
                                    }
                              }
                        },
                        cache: false
                  })

                  .state('app.PurchaseReturn', {
                        url: '/Purchase Return',
                        views: {
                              'menuContent': {
                                    templateUrl: 'templates/PurchaseReturn.html',
                                    controller: 'PurchaseReturnController',
                                    data: {
                                          pageTitle: 'Purchase Return',
                                          MenuName: 'Purchase Return'
                                    }
                              }
                        },
                        cache: false
                  })

                  .state('app.Sales', {
                        url: '/Sales',
                        views: {
                              'menuContent': {
                                    templateUrl: 'templates/Sales.html',
                                    controller: 'SalesController',
                                    data: {
                                          pageTitle: 'Sales',
                                          MenuName: 'Sales'
                                    }
                              }
                        },
                        cache: false
                  })

                  .state('app.SalesReturn', {
                        url: '/Sales Return',
                        views: {
                              'menuContent': {
                                    templateUrl: 'templates/SalesReturn.html',
                                    controller: 'SalesReturnController',
                                    data: {
                                          pageTitle: 'Sales Return',
                                          MenuName: 'Sales Return'
                                    }
                              }
                        },
                        cache: false
                  })
                  .state('app.CustomerBranch', {
                        url: '/Customer Branch',
                        views: {
                              'menuContent': {
                                    templateUrl: 'templates/CustomerBranch.html',
                                    controller: 'CustomerBranchController',
                                    data: {
                                          pageTitle: 'Customer Branch',
                                          MenuName: 'Customer Branch'
                                    }
                              }
                        },
                        cache: false
                  })

                  .state('app.PriceCategory', {
                        url: '/Price Category',
                        views: {
                              'menuContent': {
                                    templateUrl: 'templates/PriceCategory.html',
                                    controller: 'PriceCategoryController',
                                    data: {
                                          pageTitle: 'Price Category',
                                          MenuName: 'Price Category'
                                    }
                              }
                        },
                        cache: false
                  })

                  .state('app.CustomerGroup', {
                        url: '/Customer Group',
                        views: {
                              'menuContent': {
                                    templateUrl: 'templates/CustomerGroup.html',
                                    controller: 'CustomerGroupController',
                                    data: {
                                          pageTitle: 'Customer Group',
                                          MenuName: 'Customer Group'
                                    }
                              }
                        },
                        cache: false
                  })

                  .state('app.Currency', {
                        url: '/Currency',
                        views: {
                              'menuContent': {
                                    templateUrl: 'templates/Currency.html',
                                    controller: 'CurrencyController',
                                    data: {
                                          pageTitle: 'Currency',
                                          MenuName: 'Currency'
                                    }
                              }
                        },
                        cache: false
                  })

                  .state('app.CurrencyRate', {
                        url: '/Currency Rate',
                        views: {
                              'menuContent': {
                                    templateUrl: 'templates/CurrencyRate.html',
                                    controller: 'CurrencyRateController',
                                    data: {
                                          pageTitle: 'Currency Rate',
                                          MenuName: 'Currency Rate'
                                    }
                              }
                        },
                        cache: false
                  })
                  .state('app.BestPerformanceEmployee', {
                        url: '/Best Performance Employee',
                        views: {
                              'menuContent': {
                                    templateUrl: 'templates/BestPerformanceEmp.html',
                                    controller: 'BestPerformanceEmp',
                                    data: {
                                          pageTitle: 'Best Performance Employee',
                                          MenuName: 'Best Performance Employee'
                                    }
                              }
                        },
                        cache: false
                  })
                  .state('app.Itemtype', {
                        url: '/Item type',
                        views: {
                              'menuContent': {
                                    templateUrl: 'templates/ItemType.html',
                                    controller: 'ItemTypeController',
                                    data: {
                                          pageTitle: 'Item Type',
                                          MenuName: 'Item type'
                                    }
                              }
                        },
                        cache: false
                  })
                  .state('app.PopupNote', {
                        url: '/Popup Note',
                        views: {
                              'menuContent': {
                                    templateUrl: 'templates/PopupNote.html',
                                    controller: 'PopupNoteController',
                                    data: {
                                          pageTitle: 'Popup Note',
                                          MenuName: 'Popup Note'
                                    }
                              }
                        },
                        cache: false
                  })
                  .state('app.ItemPrice', {
                        url: '/Item Price',
                        views: {
                              'menuContent': {
                                    templateUrl: 'templates/ItemPrice.html',
                                    controller: 'ItemPriceController',
                                    data: {
                                          pageTitle: 'Item Price',
                                          MenuName: 'Item Price'
                                    }
                              }
                        },
                        cache: false
                  })

                  .state('app.RolePermission', {
                        url: '/Role Permission',
                        views: {
                              'menuContent': {
                                    templateUrl: 'templates/RolePermission.html',
                                    controller: 'RolePermissionController',
                                    data: {
                                          pageTitle: 'Role Permission',
                                          MenuName: 'Role Permission'
                                    }
                              }
                        },
                        cache: false
                  })

                  .state('app.UOM', {
                        url: '/UOM',
                        views: {
                              'menuContent': {
                                    templateUrl: 'templates/UOM.html',
                                    controller: 'UOMController',
                                    data: {
                                          pageTitle: 'UOM',
                                          MenuName: 'UOM'
                                    }
                              }
                        },
                        cache: false
                  })

                  .state('app.Brand', {
                        url: '/Brand',
                        views: {
                              'menuContent': {
                                    templateUrl: 'templates/Brand.html',
                                    controller: 'BrandController',
                                    data: {
                                          pageTitle: 'Brand',
                                          MenuName: 'Brand'
                                    }
                              }
                        },
                        cache: false
                  })

                  .state('app.SubBrand', {
                        url: '/SubBrand',
                        views: {
                              'menuContent': {
                                    templateUrl: 'templates/SubBrand.html',
                                    controller: 'SubBrandController',
                                    data: {
                                          pageTitle: 'Sub Brand',
                                          MenuName: 'Sub Brand'
                                    }
                              }
                        },
                        cache: false
                  })

                  .state('app.UOMConversion', {
                        url: '/UOMConversion',
                        views: {
                              'menuContent': {
                                    templateUrl: 'templates/UOMConversion.html',
                                    controller: 'UOMConversionController',
                                    data: {
                                          pageTitle: 'UOM Conversion',
                                          MenuName: 'UOM Conversion'
                                    }
                              }
                        },
                        cache: false
                  })

                  .state('app.StockTransfer', {
                        url: '/Stock Transfer',
                        views: {
                              'menuContent': {
                                    templateUrl: 'templates/StockTransfer.html',
                                    controller: 'StockTransferController',
                                    data: {
                                          pageTitle: 'Stock Transfer',
                                          MenuName: 'Stock Transfer'
                                    }
                              }
                        },
                        cache: false
                  })

                  .state('app.TaxCode', {
                        url: '/Tax Code',
                        views: {
                              'menuContent': {
                                    templateUrl: 'templates/TaxCode.html',
                                    controller: 'TaxCodeController',
                                    data: {
                                          pageTitle: 'Tax Code',
                                          MenuName: 'Tax Code'
                                    }
                              }
                        },
                        cache: false
                  })

                  .state('app.UserLocation', {
                        url: '/User Location',
                        views: {
                              'menuContent': {
                                    templateUrl: 'templates/UserLocation.html',
                                    controller: 'UserLocationController',
                                    data: {
                                          pageTitle: 'User Location',
                                          MenuName: 'User Location'
                                    }
                              }
                        },
                        cache: false
                  })

                  .state('app.Customer', {
                        url: '/Customer',
                        views: {
                              'menuContent': {
                                    templateUrl: 'templates/Customer.html',
                                    controller: 'CustomerController',
                                    data: {
                                          pageTitle: 'Customer',
                                          MenuName: 'Customer'
                                    }
                              }
                        },
                        cache: false
                  })

                  .state('app.Supplier', {
                        url: '/Supplier',
                        views: {
                              'menuContent': {
                                    templateUrl: 'templates/Supplier.html',
                                    controller: 'SupplierController',
                                    data: {
                                          pageTitle: 'Supplier',
                                          MenuName: 'Supplier'
                                    }
                              }
                        },
                        cache: false
                  })

                  .state('app.Calendar', {
                        url: '/Calendar',
                        views: {
                              'menuContent': {
                                    templateUrl: 'templates/Calendar.html',
                                    controller: 'CalendarController',
                                    data: {
                                          pageTitle: 'Calendar',
                                          MenuName: 'Calendar'
                                    }
                              }
                        },
                        cache: false
                  })

                  .state('app.Quotation', {
                        url: '/Quotation',
                        views: {
                              'menuContent': {
                                    templateUrl: 'templates/Quotation.html',
                                    controller: 'QuotationController',
                                    data: {
                                          pageTitle: 'Quotation',
                                          MenuName: 'Quotation'
                                    }
                              }
                        },
                        cache: false
                  })

                  .state('app.SubLocation', {
                        url: '/SubLocation',
                        views: {
                              'menuContent': {
                                    templateUrl: 'templates/SubLocation.html',
                                    controller: 'SubLocationController',
                                    data: {
                                          pageTitle: 'Sub Location',
                                          MenuName: 'SubLocation'
                                    }
                              }
                        },
                        cache: false
                  })

                  .state('app.ItemOpeningBalance', {
                        url: '/ItemOpeningBalance',
                        views: {
                              'menuContent': {
                                    templateUrl: 'templates/ItemOpeningBalance.html',
                                    controller: 'ItemOpeningBalanceController',
                                    data: {
                                          pageTitle: 'Item Opening Balance',
                                          MenuName: 'Item Opening Balance'
                                    }
                              }
                        },
                        cache: false
                  })

                  .state('app.Setting', {
                        url: '/Setting',
                        views: {
                              'menuContent': {
                                    templateUrl: 'templates/Setting.html',
                                    controller: 'SettingController',
                                    data: {
                                          pageTitle: 'Setting',
                                          MenuName: 'Setting'
                                    }
                              }
                        },
                        cache: false
                  })

                  .state('app.PurchaseReport', {
                        url: '/Purchase Report',
                        views: {
                              'menuContent': {
                                    templateUrl: 'templates/PurchaseReport.html',
                                    controller: 'PurchaseReportController',
                                    data: {
                                          pageTitle: 'Purchase Report',
                                          MenuName: 'Purchase Report'
                                    }
                              }
                        },
                        cache: false
                  })

                  .state('app.PurchaseReturnReport', {
                        url: '/Purchase Return Report',
                        views: {
                              'menuContent': {
                                    templateUrl: 'templates/PurchaseReturnReport.html',
                                    controller: 'PurchaseReturnReportController',
                                    data: {
                                          pageTitle: 'Purchase Return Report',
                                          MenuName: 'Purchase Return Report'
                                    }
                              }
                        },
                        cache: false
                  })

                  .state('app.SalesReport', {
                        url: '/SalesReport',
                        views: {
                              'menuContent': {
                                    templateUrl: 'templates/SalesReport.html',
                                    controller: 'SalesReportController',
                                    data: {
                                          pageTitle: 'Sales Report',
                                          MenuName: 'Sales Report'
                                    }
                              }
                        },
                        cache: false
                  })

                  .state('app.SalesReturnReport', {
                        url: '/SalesReturnReport',
                        views: {
                              'menuContent': {
                                    templateUrl: 'templates/SalesReturnReport.html',
                                    controller: 'SalesReturnReportController',
                                    data: {
                                          pageTitle: 'Sales Return Report',
                                          MenuName: 'Sales Return Report'
                                    }
                              }
                        },
                        cache: false
                  })

                  .state('app.CustomerWisePriceListReport', {
                        url: '/Customer Wise Price List Report',
                        views: {
                              'menuContent': {
                                    templateUrl: 'templates/CustomerWisePriceListReport.html',
                                    controller: 'CustomerWisePriceListReportController',
                                    data: {
                                          pageTitle: 'Customer Wise Price List Report',
                                          MenuName: 'Customer Wise Price List Report'
                                    }
                              }
                        },
                        cache: false
                  })

                  .state('app.ItemPriceReport', {
                        url: '/ItemPriceReport',
                        views: {
                              'menuContent': {
                                    templateUrl: 'templates/ItemPriceReport.html',
                                    controller: 'ItemPriceReportController',
                                    data: {
                                          pageTitle: 'Item Price Report',
                                          MenuName: 'Item Price Report'
                                    }
                              }
                        },
                        cache: false
                  })

                  .state('app.ItemStockMovementReport', {
                        url: '/ItemStockMovementReport',
                        views: {
                              'menuContent': {
                                    templateUrl: 'templates/ItemStockMovementReport.html',
                                    controller: 'ItemStockMovementReportController',
                                    data: {
                                          pageTitle: 'Item Stock Movement Report',
                                          MenuName: 'Item Stock Movement Report'
                                    }
                              }
                        },
                        cache: false
                  })

                  .state('app.StockBalanceReport', {
                        url: '/Stock Balance Report',
                        views: {
                              'menuContent': {
                                    templateUrl: 'templates/StockBalanceReport.html',
                                    controller: 'StockBalanceReportController',
                                    data: {
                                          pageTitle: 'Stock Balance Report',
                                          MenuName: 'Stock Balance Report'
                                    }
                              }
                        },
                        cache: false
                  })


                  .state('app.PriceListReport', {
                        url: '/Price List Report',
                        views: {
                              'menuContent': {
                                    templateUrl: 'templates/PriceListReport.html',
                                    controller: 'PriceListReportController',
                                    data: {
                                          pageTitle: 'Price List Report',
                                          MenuName: 'Price List Report'
                                    }
                              }
                        },
                        cache: false
                  })

                  .state('app.PartyOutstandingReport', {
                        url: '/Party Outstanding Report',
                        views: {
                              'menuContent': {
                                    templateUrl: 'templates/PartyOutstandingReport.html',
                                    controller: 'PartyOutstandingReportController',
                                    data: {
                                          pageTitle: 'Party Outstanding Report',
                                          MenuName: 'Party Outstanding Report'
                                    }
                              }
                        },
                        cache: false
                  })


                  .state('app.Employee', {
                        url: '/Employee',
                        views: {
                              'menuContent': {
                                    templateUrl: 'templates/Employee.html',
                                    controller: 'EmployeeController',
                                    data: {
                                          pageTitle: 'Employee',
                                          MenuName: 'Employee'
                                    }
                              }
                        },
                        cache: false
                  }).state('app.CustomerPromotionEmailAndSMS', {
                        url: '/Customer Promotion Email And SMS',
                        views: {
                              'menuContent': {
                                    templateUrl: 'templates/CustomerPromotionEmailAndSMS.html',
                                    controller: 'CustomerPromotionEmailAndSMSController',
                                    data: {
                                          pageTitle: 'Customer Promotion Email And SMS',
                                          MenuName: 'Customer Promotion Email And SMS'
                                    }
                              }
                        },
                        cache: false
                  }).state('app.EmployeeAttendance', {
                        url: '/Employee Attendance',
                        views: {
                              'menuContent': {
                                    templateUrl: 'templates/EmployeeAttendance.html',
                                    controller: 'EmployeeAttendanceController',
                                    data: {
                                          pageTitle: 'Employee Attendance',
                                          MenuName: 'Employee Attendance'
                                    }
                              }
                        },
                        cache: false
                  })
                  .state('app.EmployeeSalary', {
                        url: '/Employee Salary',
                        views: {
                              'menuContent': {
                                    templateUrl: 'templates/EmployeeSalary.html',
                                    controller: 'EmployeeSalaryController',
                                    data: {
                                          pageTitle: 'Employee Salary',
                                          MenuName: 'Employee Salary'
                                    }
                              }
                        },
                        cache: false
                  })
                  .state('app.Database', {
                        url: '/DatabaseBackUpAndRestore',
                        views: {
                              'menuContent': {
                                    templateUrl: 'templates/Database.html',
                                    controller: 'DatabaseController',
                                    data: {
                                          pageTitle: 'Database Backup And  Restore',
                                          MenuName: 'Database Backup And  Restore'
                                    }
                              }
                        },
                        cache: false
                  })

                  .state('app.CreditTerm', {
                        url: '/CreditTerm',
                        views: {
                              'menuContent': {
                                    templateUrl: 'templates/CreditTerm.html',
                                    controller: 'CreditTermController',
                                    data: {
                                          pageTitle: 'Credit Term',
                                          MenuName: 'Credit Term'
                                    }
                              }
                        },
                        cache: false
                  })

                  .state('app.ReferenceLevel', {
                        url: '/Reference Level',
                        views: {
                              'menuContent': {
                                    templateUrl: 'templates/ReferenceLevel.html',
                                    controller: 'ReferenceLevelController',
                                    data: {
                                          pageTitle: 'Reference Level',
                                          MenuName: 'Reference Level'
                                    }
                              }
                        },
                        cache: false
                  })
                  .state('app.PaymentMethod', {
                        url: '/PaymentMethod',
                        views: {
                              'menuContent': {
                                    templateUrl: 'templates/Paymentmethod.html',
                                    controller: 'PaymentMethodController',
                                    data: {
                                          pageTitle: 'Payment Method Maintenance',
                                          MenuName: 'Payment Method Maintenance'
                                    }
                              }
                        },
                        cache: false
                  })
                  .state('app.Invoice', {
                        url: '/Invoice',
                        views: {
                              'menuContent': {
                                    templateUrl: 'templates/Invoice.html',
                                    controller: 'InvoiceController',
                                    data: {
                                          pageTitle: 'Invoice',
                                          MenuName: 'Invoice'
                                    }
                              }
                        },
                        cache: false
                  }).state('app.InvoiceReceivePayment', {
                        url: '/Invoice Receive Payment',
                        views: {
                              'menuContent': {
                                    templateUrl: 'templates/InvoiceReceivePayment.html',
                                    controller: 'InvoiceReceivePaymentCtrl',
                                    data: {
                                          pageTitle: 'Invoice Receive Payment',
                                          MenuName: 'Invoice Receive Payment'
                                    }
                              }
                        },
                        cache: false
                  })
                  .state('app.Pos_Till_Login', {
                        url: '/Pos_Till_Login',
                        views: {
                              'menuContent': {
                                    templateUrl: 'templates/Pos_Till_Login.html',
                                    controller: 'Pos_Till_LoginCtrl',
                                    data: {
                                          pageTitle: 'Pos_Till_Login',
                                          MenuName: 'Pos_Till_Login'
                                    }
                              }
                        },
                        cache: false
                  })
                  .state('app.Pos_Till_ItemCategory', {
                        url: '/Pos_Till_ItemCategory',
                        views: {
                              'menuContent': {
                                    templateUrl: 'templates/Pos_Till_ItemCategory.html',
                                    controller: 'Pos_Till_ItemCategoryCtrl',
                                    data: {
                                          pageTitle: 'Pos_Till_ItemCategory',
                                          MenuName: 'Pos_Till_ItemCategory'
                                    }
                              }
                        },
                        cache: false
                  })
                  .state('app.DynamicPage', {
                        url: '/DynamicPage',
                        views: {
                              'menuContent': {
                                    templateUrl: 'templates/DynamicPage.html',
                                    controller: 'DynamicPageController',
                                    data: {
                                          pageTitle: 'Dynamic Page',
                                          MenuName: 'Dynamic Page'
                                    }
                              }
                        },
                        cache: false
                  })
                  .state('app.ProductCategory', {
                        url: '/ProductCategory',
                        views: {
                              'menuContent': {
                                    templateUrl: 'templates/ItemCategory.html',
                                    controller: 'ItemCategoryCtrl',
                                    data: {
                                          pageTitle: 'Product Category',
                                          MenuName: 'Product Category'
                                    }
                              }
                        },
                        cache: false
                  })

                  .state('app.ARInvoice', {
                        url: '/ARInvoice',
                        views: {
                              'menuContent': {
                                    templateUrl: 'templates/ARInvoice.html',
                                    controller: 'ARInvoiceController',
                                    data: {
                                          pageTitle: 'AR Invoice',
                                          MenuName: 'AR Invoice'
                                    }
                              }
                        },
                        cache: false
                  })

                  .state('app.ChequeListing', {
                        url: '/ChequeListing',
                        views: {
                              'menuContent': {
                                    templateUrl: 'templates/ChequeListing.html',
                                    controller: 'ChequeListingController',
                                    data: {
                                          pageTitle: 'Cheque Listing',
                                          MenuName: 'Cheque Listing'
                                    }
                              }
                        },
                        cache: false
                  })

                  .state('app.DebtorOutstandReport', {
                        url: '/DebtorOutstandReport',
                        views: {
                              'menuContent': {
                                    templateUrl: 'templates/DebtorOutstandReport.html',
                                    controller: 'DebtorOutstandReportController',
                                    data: {
                                          pageTitle: 'Debtor Outstand Report',
                                          MenuName: 'Debtor Outstand Report'
                                    }
                              }
                        },
                        cache: false
                  })

                  .state('app.PurchaseInvoice', {
                        url: '/PurchaseInvoice',
                        views: {
                              'menuContent': {
                                    templateUrl: 'templates/PurchaseInvoice.html',
                                    controller: 'PurchaseInvoiceController',
                                    data: {
                                          pageTitle: 'Purchase Invoice',
                                          MenuName: 'Purchase Invoice'
                                    }
                              }
                        },
                        cache: false
                  })
                  .state('app.PurchaseOrder', {
                        url: '/PurchaseOrder',
                        views: {
                              'menuContent': {
                                    templateUrl: 'templates/PurchaseOrder.html',
                                    controller: 'PurchaseOrderController',
                                    data: {
                                          pageTitle: 'Purchase Order',
                                          MenuName: 'Purchase Order'
                                    }
                              }
                        },
                        cache: false
                  })

                  .state('app.APInvoice', {
                        url: '/APInvoice',
                        views: {
                              'menuContent': {
                                    templateUrl: 'templates/APInvoice.html',
                                    controller: 'APInvoiceController',
                                    data: {
                                          pageTitle: 'AP Invoice',
                                          MenuName: 'AP Invoice'
                                    }
                              }
                        },
                        cache: false
                  })

                  .state('app.APPayment', {
                        url: '/APPayment',
                        views: {
                              'menuContent': {
                                    templateUrl: 'templates/APPayment.html',
                                    controller: 'APPaymentCtrl',
                                    data: {
                                          pageTitle: 'AP Payment',
                                          MenuName: 'AP Payment'
                                    }
                              }
                        },
                        cache: false
                  })

                  .state('app.APChequeListing', {
                        url: '/APChequeListing',
                        views: {
                              'menuContent': {
                                    templateUrl: 'templates/APChequeListing.html',
                                    controller: 'APChequeListingController',
                                    data: {
                                          pageTitle: 'AP Cheque Listing',
                                          MenuName: 'AP Cheque Listing'
                                    }
                              }
                        },
                        cache: false
                  })

                  .state('app.CreditorOutstandReport', {
                        url: '/CreditorOutstandReport',
                        views: {
                              'menuContent': {
                                    templateUrl: 'templates/CreditorOutstandReport.html',
                                    controller: 'CreditorOutstandReportController',
                                    data: {
                                          pageTitle: 'Creditor Outstand Report',
                                          MenuName: 'Creditor Outstand Report'
                                    }
                              }
                        },
                        cache: false
                  })

                  .state('app.Message', {
                        url: '/Message',
                        views: {
                              'menuContent': {
                                    templateUrl: 'templates/Message.html',
                                    controller: 'MessageController',
                                    data: {
                                          pageTitle: 'Message',
                                          MenuName: 'Message'
                                    }
                              }
                        },
                        cache: false
                  })

                  .state('app.TaskType', {
                        url: '/TaskType',
                        views: {
                              'menuContent': {
                                    templateUrl: 'templates/TaskType.html',
                                    controller: 'TaskTypeController',
                                    data: {
                                          pageTitle: 'Task Type',
                                          MenuName: 'Task Type'
                                    }
                              }
                        },
                        cache: false
                  })

                  .state('app.Task', {
                        url: '/Task',
                        views: {
                              'menuContent': {
                                    templateUrl: 'templates/Task.html',
                                    controller: 'TaskController',
                                    data: {
                                          pageTitle: 'Task',
                                          MenuName: 'Task'
                                    }
                              }
                        },
                        cache: false
                  })

                  .state('app.ItemCombo', {
                        url: '/ItemCombo',
                        views: {
                              'menuContent': {
                                    templateUrl: 'templates/ItemCombo.html',
                                    controller: 'ItemComboController',
                                    data: {
                                          pageTitle: 'Item Combo',
                                          MenuName: 'Item Combo'
                                    }
                              }
                        },
                        cache: false
                  })

                  .state('app.Promotions', {
                        url: '/Promotions',
                        views: {
                              'menuContent': {
                                    templateUrl: 'templates/Discount.html',
                                    controller: 'DiscountController',
                                    data: {
                                          pageTitle: 'Promotions',
                                          MenuName: 'Promotions'
                                    }
                              }
                        },
                        cache: false
                  })
                  .state('app.ExpenseCategory', {
                        url: '/Expense Category',
                        views: {
                              'menuContent': {
                                    templateUrl: 'templates/ExpenseCategory.html',
                                    controller: 'ExpenseCategoryController',
                                    data: {
                                          pageTitle: 'Expense Category',
                                          MenuName: 'Expense Category'
                                    }
                              }
                        },
                        cache: false
                  })
                  .state('app.Expense', {
                        url: '/Expense',
                        views: {
                              'menuContent': {
                                    templateUrl: 'templates/Expense.html',
                                    controller: 'ExpenseController',
                                    data: {
                                          pageTitle: 'Expense',
                                          MenuName: 'Expense'
                                    }
                              }
                        },
                        cache: false
                  })
                  .state('app.Enquiry', {
                        url: '/Enquiry Mgmt',
                        views: {
                              'menuContent': {
                                    templateUrl: 'templates/Enquiry.html',
                                    controller: 'EnquiryController',
                                    data: {
                                          pageTitle: 'Enquiry Mgmt',
                                          MenuName: 'Enquiry Mgmt'
                                    }
                              }
                        },
                        cache: false
                  })
                  .state('app.ManageEnquiry', {
                        url: '/Enquiry',
                        views: {
                              'menuContent': {
                                    templateUrl: 'templates/ManageEnquiry.html',
                                    controller: 'ManageEnquiryController',
                                    data: {
                                          pageTitle: 'Enquiry',
                                          MenuName: 'Enquiry'
                                    }
                              }
                        },
                        cache: false
                  })
                  .state('app.UserFileUpload', {
                        url: '/Document Upload',
                        views: {
                              'menuContent': {
                                    templateUrl: 'templates/UserFileUpload.html',
                                    controller: 'UserFileUploadController',
                                    data: {
                                          pageTitle: 'Document Upload',
                                          MenuName: 'Document Upload'
                                    }
                              }
                        },
                        cache: false
                  })
                  .state('app.PurchasePendingReport', {
                        url: '/PurchasePendingReport',
                        views: {
                              'menuContent': {
                                    templateUrl: 'templates/PurchasePendingReport.html',
                                    controller: 'PurchasePendingReportController',
                                    data: {
                                          pageTitle: 'Purchase Pending Report',
                                          MenuName: 'Purchase Pending Report'
                                    }
                              }
                        },
                        cache: false
                  })
                  .state('app.Site', {
                        url: '/Site',
                        views: {
                              'menuContent': {
                                    templateUrl: 'templates/Site.html',
                                    controller: 'SiteController',
                                    data: {
                                          pageTitle: 'Site',
                                          MenuName: 'Site'
                                    }
                              }
                        },
                        cache: false
                  })

                  .state('app.SiteTask', {
                        url: '/SiteTask',
                        views: {
                              'menuContent': {
                                    templateUrl: 'templates/SiteTask.html',
                                    controller: 'SiteTaskController',
                                    data: {
                                          pageTitle: 'Site Task',
                                          MenuName: 'Site Task'
                                    }
                              }
                        },
                        cache: false
                  })

                  .state('app.MediaManagement', {
                        url: '/MediaManagement',
                        views: {
                              'menuContent': {
                                    templateUrl: 'templates/MediaManagement.html',
                                    controller: 'MediaManagementController',
                                    data: {
                                          pageTitle: 'Media Management',
                                          MenuName: 'Media Management'
                                    }
                              }
                        },
                        cache: false
                  })
                  .state('app.ItemBatch', {
                        url: '/ItemBatch',
                        views: {
                              'menuContent': {
                                    templateUrl: 'templates/ItemBatch.html',
                                    controller: 'ItemBatchController',
                                    data: {
                                          pageTitle: 'Item Batch',
                                          MenuName: 'Item Batch'
                                    }
                              }
                        },
                        cache: false
                  })
                  .state('app.Purchase Payment', {
                        url: '/Purchase Payment',
                        views: {
                              'menuContent': {
                                    templateUrl: 'templates/PurchasePayment.html',
                                    controller: 'PurchasePayment',
                                    data: {
                                          pageTitle: 'Purchase Payment',
                                          MenuName: 'Purchase Payment'
                                    }
                              }
                        },
                        cache: false
                  })
                  .state('app.Sales Receive Payment', {
                        url: '/Sales Receive Payment',
                        views: {
                              'menuContent': {
                                    templateUrl: 'templates/SalesReceivePayment.html',
                                    controller: 'SalesReceivePayment',
                                    data: {
                                          pageTitle: 'Sales Receive Payment',
                                          MenuName: 'Sales Receive Payment'
                                    }
                              }
                        },
                        cache: false
                  })
                  .state('app.Shop Stock Report', {
                        url: '/Shop Stock Report',
                        views: {
                              'menuContent': {
                                    templateUrl: 'templates/ShopStockReport.html',
                                    controller: 'ShopStockReportController',
                                    data: {
                                          pageTitle: 'Shop Stock Report',
                                          MenuName: 'Shop Stock Report'
                                    }
                              }
                        },
                        cache: false
                  })
                  .state('app.Appointment', {
                        url: '/Appointment',
                        views: {
                              'menuContent': {
                                    templateUrl: 'templates/Appointment.html',
                                    controller: 'AppointmentController',
                                    data: {
                                          pageTitle: 'Appointment',
                                          MenuName: 'Appointment'
                                    }
                              }
                        },
                        cache: false
                  })
                  .state('app.Stock Report', {
                        url: '/Stock Report',
                        views: {
                              'menuContent': {
                                    templateUrl: 'templates/StockReport.html',
                                    controller: 'StockReportController',
                                    data: {
                                          pageTitle: 'Stock Report',
                                          MenuName: 'Stock Report'
                                    }
                              }
                        },
                        cache: false
                  })
                  .state('app.Profit Progress Report', {
                        url: '/Profit Progress Report',
                        views: {
                              'menuContent': {
                                    templateUrl: 'templates/ProfitProgressReport.html',
                                    controller: 'ProfitProgressReportController',
                                    data: {
                                          pageTitle: 'Profit Progress Report',
                                          MenuName: 'Profit Progress Report'
                                    }
                              }
                        },
                        cache: false
                  })
                  .state('app.Customer Bill Search', {
                        url: '/Customer Bill Search',
                        views: {
                              'menuContent': {
                                    templateUrl: 'templates/CustomerBillSearch.html',
                                    controller: 'CustomerBillSearchController',
                                    data: {
                                          pageTitle: 'Customer Bill Search',
                                          MenuName: 'Customer Bill Search'
                                    }
                              }
                        },
                        cache: false
                  })



            // if none of the above states are matched, use this as the fallback
            $urlRouterProvider.otherwise(function ($injector, $location) {
                  var state = $injector.get('$state');
                  var localstorage = $injector.get('$localstorage');
                  if (localstorage.get('IsRemember') == 'true' || localstorage.get('IsRemember') == true) {
                        var Login = {
                              UserName: localstorage.get('RememberUserName'),
                              Password: localstorage.get('Password'),
                              IsRemember: localstorage.get('IsRemember'),
                        }
                        if (localstorage.get('IsLogin') == 'true' || localstorage.get('IsLogin') == true) {
                              if (Login != null) {
                                    state.go('app.DashBoard')
                              } else {
                                    emptylocalstorage();
                                    state.go('appLogin')
                              }
                        } else {
                              emptylocalstorage();
                              state.go('appLogin')
                        }
                  } else {
                        emptylocalstorage();
                        state.go('appLogin')
                  }

                  function emptylocalstorage() {
                        localstorage.set('IsLogin', false);
                        localstorage.set('UserId', null);
                        localstorage.set('UserName', null);
                        localstorage.set('EmailAddress', null);
                        localstorage.set('PhoneNumber', null);
                        localstorage.set('UserCode', null);
                        localstorage.set('DefaultLocation', null);
                        localstorage.set('DefaultDepartment', null);
                        localstorage.set('UserRoles', null);
                        localstorage.set('token', null);
                        localstorage.set("IsPosUserLogin", "0");
                        localstorage.set("IsPosUserId", null);
                        localstorage.set("RefCustUserId", '');
                  }
                  return $location.path();
            })
      }).factory('$localstorage', ['$window', function ($window) {
            return {
                  set: function (key, value) {
                        $window.localStorage[key] = value;
                  },
                  get: function (key, defaultValue) {
                        return $window.localStorage[key] || defaultValue;
                  },
                  setObject: function (key, value) {
                        $window.localStorage[key] = JSON.stringify(value);
                  },
                  getObject: function (key) {
                        return JSON.parse($window.localStorage[key] || '{}');
                  }
            }
      }])
      .directive('errSrc', function () {
            return {
                  link: function (scope, element, attrs) {
                        element.bind('error', function () {
                              if (attrs.src != attrs.errSrc) {
                                    attrs.$set('src', attrs.errSrc);
                              }
                        });
                  }
            }
      })
      .directive("limitTo", [function () {
            return {
                  restrict: "A",
                  link: function (scope, elem, attrs) {
                        var limit = parseInt(attrs.limitTo);
                        angular.element(elem).on("keypress", function (e) {
                              if (this.value.length == limit) e.preventDefault();
                        });
                  }
            }
      }])
      .directive('validNumber', function () {
            return {
                  require: 'ngModel',
                  link: function (scope, elm, attrs, ctrl) {
                        ctrl.$parsers.unshift(function (viewValue) {
                              if (viewValue) {
                                    if (elm.intlTelInput("isValidNumber")) {
                                          ctrl.$setValidity('validNumber', true);
                                          return viewValue;
                                    } else {
                                          ctrl.$setValidity('validNumber', false);
                                          return viewValue;
                                    }
                              } else {
                                    ctrl.$setValidity('validNumber', true);
                                    return viewValue;
                              }
                        });
                  }
            };
      }).filter('ellipsis', function () {
            return function (text, length) {
                  if (text.length > length) {
                        return text.substr(0, length) + "...";
                  }
                  return text;
            }
      })
      .filter('secondsToDateTime', [function () {
            return function (seconds) {
                  return new Date(1970, 0, 1).setSeconds(seconds);
            };
      }]).directive('numbersOnly', function () {
            return {
                  require: 'ngModel',
                  link: function (scope, element, attr, ngModelCtrl) {
                        function fromUser(text) {
                              if (text) {
                                    var transformedInput = text.replace(/[^0-9]/g, '');
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
      }).directive('manageDynamicfraction', function () {
            return {
                  restrict: 'A',
                  require: '?ngModel',
                  link: function (scope, element, attrs, ngModel) {
                        ngModel.$formatters.push(function (value) {
                              if (attrs['manageDynamicfraction'] != '' && value != '' && value != null && value != undefined) {
                                    var objfre = JSON.parse(attrs['manageDynamicfraction']);
                                    if (typeof value == 'number' && !isNaN(value) && isFinite(value)) {
                                          if (!objfre.IsAllowdot) {
                                                return parseFloat(Math.round(value * 100) / 100).toFixed(parseInt(objfre.ToFixed)).replace(/\./g, ',');
                                          } else {
                                                return parseFloat(Math.round(value * 100) / 100).toFixed(parseInt(objfre.ToFixed));
                                          }
                                    } else {
                                          if (!objfre.IsAllowdot) {
                                                return parseFloat(0).toFixed(parseInt(objfre.ToFixed)).replace(/\./g, ',');
                                          } else {
                                                return parseFloat(0).toFixed(parseInt(objfre.ToFixed));
                                          }
                                    }
                              }
                        });
                  }
            }
      }).directive("myWidget", function () {
            return {

                  restrict: "E",
                  scope: {
                        startdate: '@',
                        enddate: '@',
                        customercode: '@',
                        branchcode: '@',
                        idlocations: '@',
                        status: '@',
                  },

                  templateUrl: "../templates/search.html",
                  controller: function ($scope, $element, $http, $rootScope, $localstorage) {
                        $scope.init = function () {
                              $scope.Resetinit();
                              $scope.AdvanceGetAllCustomer();

                        }

                        $scope.Resetinit = function () {
                              $scope.modelSearch = {
                                    StartDate: moment().subtract('1', 'd').format(),
                                    EndDate: moment().format(),
                                    CustomerCode: '',
                                    BranchCode: $localstorage.get('CustomerBranch') != 'null' && $localstorage.get('CustomerBranch') != undefined && $localstorage.get('CustomerBranch') != null ? $localstorage.get('CustomerBranch') : '',
                                    idLocations: window.location.hash != '#/app/Quotation' ? $localstorage.get('DefaultLocation') : '',
                                    // idLocations: $localstorage.get('CustomerGroupLocatio') != 'null' && $localstorage.get('CustomerGroupLocatio') != undefined && $localstorage.get('CustomerGroupLocatio') != null ? $localstorage.get('CustomerGroupLocatio') : '',
                                    idStatus: '',
                              }
                              console.log($localstorage.get('CustomerBranch'))

                              if (window.location.hash == '#/app/Quotation' || window.location.hash == '#/app/Sales' || window.location.hash == '#/app/PendingList') {
                                    if (($localstorage.get('CustomerGroup') == "Shop")) {
                                          $scope.flgBranchCode = true;
                                    }

                                    if (window.location.hash == '#/app/Quotation') {

                                    } else {
                                          $scope.flgLocation = true
                                    }
                              }
                        }

                        $scope.AdvanceGetAllCustomer = function () {
                              var params = {
                                    CreatedBy: $scope.IsAdmin ? '' : $localstorage.get('CustomerGroup') == "Genmed" ? 0 : parseInt($localstorage.get('UserId')),
                              }
                              $http.get($rootScope.RoutePath + 'customer/GetAllCustomer', {
                                    params: params
                              }).then(function (res) {
                                    $scope.AdvanceListCustomer = res.data.data;
                                    $scope.AdvanceGetAllBranch();
                              });
                        };

                        $scope.AdvanceGetAllBranch = function () {
                              $http.get($rootScope.RoutePath + 'customerBranch/GetAllCustomerbranch').then(function (res) {
                                    $scope.AdvanceListBranch = res.data.data;
                                    $scope.AdvanceGetAllLocation();
                              });
                        };

                        $scope.AdvanceGetAllLocation = function () {
                              var params = {
                                    idLocations: $scope.IsAdmin ? "" : $localstorage.get('idLocations')
                              }
                              $http.get($rootScope.RoutePath + 'customer/GetAllActiveLocations', {
                                    params: params
                              }).then(function (res) {
                                    $scope.AdvanceListLocations = res.data.data;
                                    $scope.GetAllInvoiceStatus(function () {});
                              });
                        };

                        $scope.GetAllInvoiceStatus = function (callback) {
                              $http.get($rootScope.RoutePath + 'invoice/GetAllInvoiceStatus').then(function (res) {
                                    $scope.AdvanceListStatus = res.data.data;
                                    $scope.MainFilterAdvanceData($scope.modelSearch);
                                    return callback();
                              });
                        };


                        $scope.ResetFilterData = function () {
                              $scope.Resetinit();
                              $scope.$parent.FilterAdvanceData(null);
                        }

                        $scope.MainFilterAdvanceData = function (o) {
                              o.StartDate = o.StartDate != '' && o.StartDate != undefined ? moment(o.StartDate).set({
                                    hour: 0,
                                    minute: 0,
                                    second: 0
                              }).format('YYYY-MM-DD') : '';
                              o.EndDate = o.EndDate != '' && o.EndDate != undefined ? moment(o.EndDate).set({
                                    hour: 0,
                                    minute: 0,
                                    second: 0
                              }).format('YYYY-MM-DD') : ''
                              $scope.$parent.FilterAdvanceData(o);
                        }

                        $scope.init();
                  },

                  link: function (scope, element, attrs, ctrls) {

                  },
            };
      }).directive("scannerWidget", function () {
            return {

                  restrict: "E",
                  scope: {
                        status: '@',
                        obj: '=',
                  },
                  templateUrl: "../templates/Scanner.html",
                  controller: function ($scope, $http) {
                        $scope.ScanBarcode = function (obj, status) {
                              setTimeout(() => {
                                    $("#Qty").focus();
                              });
                              cordova.plugins.barcodeScanner
                                    .scan(function (result) {
                                          if (result.cancelled == false) {
                                                $scope.$apply(function () {
                                                      if (status == 'ItemCode') {
                                                            obj.ItemCode = result.text.toString();
                                                            $scope.$parent.AddItemCode(obj);
                                                      } else {
                                                            obj.BatchNo = result.text.toString();
                                                      }
                                                })
                                          }
                                    }, function (error) {
                                          alert("error =" + JSON.stringify(error))
                                    })
                        }
                  },
                  link: function (scope, element, attrs, ctrls) {

                  },
            };
      }).directive("ckeditor", function ($rootScope) {
            return {
                  require: 'ngModel',
                  link: function (scope, element, attr, ngModel) {
                        var editorOptions;
                        editorOptions = {
                              removeButtons: 'About,Form,Checkbox,Radio,TextField,Textarea,Select,Button,ImageButton,HiddenField,Save,CreateDiv,Language,BidiLtr,BidiRtl,Flash,Iframe,addFile,Styles',
                        };
                        // enable ckeditor
                        var ckeditor = element.ckeditor(editorOptions);

                        // update ngModel on change
                        ckeditor.editor.on('change', function () {
                              ngModel.$setViewValue(this.getData());
                        });
                  }
            };
      }).directive("limitToMax", function () {
            return {
                  link: function (scope, element, attributes) {
                        element.on("keydown keyup", function (e) {
                              if (Number(element.val()) > Number(attributes.max) &&
                                    e.keyCode != 46 // delete
                                    &&
                                    e.keyCode != 8 // backspace
                              ) {
                                    e.preventDefault();
                                    element.val(attributes.max);
                              }
                        });
                  }
            };
      }).directive('dateparseOnly', function ($compile) {
            return {
                  link: function (scope, element, attrs) {
                        // console.log(attrs.dateparseOnly)
                        try {
                              if (attrs.dateparseOnly) {
                                    element.attr("data-order", Date.parse(attrs.dateparseOnly));
                              }
                        } catch (e) {}
                  }
            }
      })
      .directive('convertToNumber', function () {
            return {
                  require: 'ngModel',
                  link: function (scope, element, attrs, ngModel) {
                        ngModel.$parsers.push(function (val) {
                              return parseInt(val, 10);
                        });
                        ngModel.$formatters.push(function (val) {
                              return '' + val;
                        });
                  }
            };
      }).directive('ngEnter', function () {
            return function (scope, element, attrs) {
                  element.bind("keydown keypress", function (event) {
                        if (event.which === 13) {
                              scope.$apply(function () {
                                    scope.$eval(attrs.ngEnter);
                              });

                              event.preventDefault();
                        }
                  });
            };
      }).directive('errSrc', function () {
            return {
                  link: function (scope, element, attrs) {
                        var defaultSrc = attrs.src;
                        element.bind('error', function () {
                              if (attrs.errSrc) {
                                    element.attr('src', attrs.errSrc);
                              } else if (attrs.src) {
                                    element.attr('src', defaultSrc);
                              }
                        });
                  }
            }
      });