app.controller('DashBoardCtrl', function ($scope, $http, $rootScope, $localstorage, $ionicPopup, $ionicLoading, $ionicModal, $compile) {
      $rootScope.BackButton = true;

      $scope.init = function () {
            //   $scope.getAllSales();
            // $scope.getAllCustomer();
            // $scope.getAllItemStock();
            // $scope.getBestPerformingLocation();
            // $scope.getBestPerformingItem();
            // $scope.getMonthlySalesChartData();
            // $scope.getAllRecentSales();
            // $scope.GetAllUpComingEvent();
            // $scope.GetDashboardCount();
            // $scope.GetTop5SalesPacked();
            $scope.show = false;
            $scope.TotalSalesAmount = 0
            $scope.GetFinalDashboardCount();
            $scope.o = {
                  RCHQDate: '',
                  RCHQTime: '',
                  name: '',
                  appointmentType: 'consultation',
                  description: '',
            };
            $scope.Searchmodel = {
                  Search: '',
            }
            setTimeout(() => {
                  $("#mytext").focus();
            }, 1000);
            $scope.ResetModel();
            $scope.GetAllAppointment();
            $scope.modelAdvanceSearch = null;
            InitDataTable();

      };
      $scope.GetAllAppointment = async function () {
            try {
                  // Make the HTTP GET request
                  const response = await $http.get($rootScope.RoutePath + 'appointment/GetAllApplication');

                  // Set the data to $scope.lstAppointment
                  $scope.lstAppointment = response.data.data;

                  // Set the total record count
                  $scope.TotalRecord = $scope.lstAppointment.length;

                  // Initialize DataTable after a small delay
                  $(document).ready(function () {
                        $('#ApplicationTable123').dataTable().fnClearTable();
                        $('#ApplicationTable123').dataTable().fnDestroy();

                        setTimeout(() => {
                              $('#ApplicationTable123').DataTable({
                                    responsive: true,
                                    "dom": 'rt<"bottom"<"left"<"length"l><"info"i>><"right"<"pagination"p>>>',
                                    retrieve: true,
                                    "lengthMenu": [
                                          [10, 25, 50, -1],
                                          [10, 25, 50, "All"]
                                    ],
                                    "pageLength": 10,
                                    columnDefs: [{
                                          bSortable: false,
                                          aTargets: [-1]
                                    }]
                              });
                        });

                  }, 2000)
            } catch (error) {
                  console.error("Error fetching appointments:", error);
            }
      };


      // Function to handle form submission
      $scope.SaveAppointment = function (event) {
            event.preventDefault()
            if ($scope.o.RCHQDate == null || $scope.o.RCHQDate == '') {
                  return $ionicPopup.alert({
                        title: 'Error',
                        template: 'Please select an Appointment date!'
                  });
            } else if ($scope.o.RCHQTime == null || $scope.o.RCHQTime == "") {
                  return $ionicPopup.alert({
                        title: 'Error',
                        template: 'Please select an Appointment time!'
                  });
            } else if ($scope.o.name == null || $scope.o.name == "") {
                  return $ionicPopup.alert({
                        title: 'Error',
                        template: 'Please enter your name!'
                  });

            } else if ($scope.o.description == null || $scope.o.description == "") {
                  return $ionicPopup.alert({
                        title: 'Error',
                        template: 'Please enter description!'
                  });
            } else if ($scope.o.description != null && $scope.o.description.length < 50) {
                  return $ionicPopup.alert({
                        title: 'Error',
                        template: 'Make sure your description must be have at least 50 characters!'
                  });
            } else if ($scope.o.description != null && $scope.o.description.length > 1000) {
                  return $ionicPopup.alert({
                        title: 'Error',
                        template: `Make sure your description don't have more than 1000 characters!`
                  });
            }

            const time = new Date($scope.o.RCHQTime);
            const hours = time.getHours().toString().padStart(2, '0');
            const minutes = time.getMinutes().toString().padStart(2, '0');
            const seconds = time.getSeconds().toString().padStart(2, '0');

            // Format the time as HH:mm:ss
            const formattedTime = `${hours}:${minutes}:${seconds}`;
            // Gather form data
            const formData = {
                  date: $scope.o.RCHQDate,
                  time: formattedTime,
                  name: $scope.o.name,
                  appointmentType: $scope.o.appointmentType,
                  description: $scope.o.description
            };

            // Log the collected data to verify
            console.log("Form Data:", formData);

            // You can now send this data to an API or further processing
            // For example, sending data via HTTP POST:
            $http.post($rootScope.RoutePath + 'appointment/SaveAppointment', formData).then(function (response) {
                  // Handle the response here (success)
                  console.log('Appointment saved successfully:', response);
                  $scope.GetAllAppointment()
                  $scope.ResetModel();
                  // You can show a success message or redirect to another page
                  $ionicPopup.alert({
                        title: 'Success',
                        template: 'Appointment saved successfully!'
                  });
            }).catch(function (error) {
                  // Handle error
                  console.error('Error saving appointment:', error);
                  $ionicPopup.alert({
                        title: 'Error',
                        template: 'Failed to save appointment. Please try again.'
                  });
            });
      };

      $scope.ResetModel = function () {
            $scope.o = {
                  RCHQDate: '',
                  RCHQTime: '',
                  name: '',
                  appointmentType: 'consultation',
                  description: '',
            };
            $scope.Searchmodel = {
                  Search: '',
            }
      }

      $scope.FilterAdvanceData = function (o) {
            $scope.modelAdvanceSearch = o;
            // $('#SalesTable').dataTable().api().ajax.reload();
            InitDataTable();
      }
      
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
                              // d.search = $scope.Searchmodel.Search;
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
                                    console.log('$scope.lstStatus: ', $scope?.lstStatus);
                                    if($scope.findStatus)
                                    var findStatus = _.findWhere($scope?.lstStatus, {
                                          id: row?.idStatus
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
      $scope.GetFinalDashboardCount = function () {
            var params = {
                  idLocations: $localstorage.get('idLocations')
            };
            $http.get($rootScope.RoutePath + 'dashboard/FinalDashboardCount', {
                  params: params
            }).success(function (data) {
                  $scope.obj = data.data;
                  console.log(data.data)
            })
      };

      $scope.getAllSales

      $scope.ShowHideAppointment = function () {
            $scope.show = true
      }

      $scope.BackToList = function () {
            $scope.show = false
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
            $scope.MainCustomer = null;
            if ($scope.IsCustomer) {
                  $scope.MainCustomer = $localstorage.get('CustomerGroup');
                  GetAllSetting();
            }
      };

      ManageRole();

      function GetAllSetting() {
            $http.get($rootScope.RoutePath + "setting/GetAllSetting").success(function (response) {
                  var objMLM = _.findWhere(response, {
                        Name: "IsMLM"
                  });
                  if (objMLM != null && objMLM != undefined && objMLM != '') {
                        $scope.IsMLM = parseInt(objMLM.Value);
                  }

                  if ($scope.IsMLM == 1) {
                        $scope.GetCustomerId();
                  }
            });
      };

      $scope.GetCustomerId = function () {
            $http.get($rootScope.RoutePath + 'customer/GetCustomerByEmailAddress?EmailAddress=' + $localstorage.get('EmailAddress')).then(function (res) {
                  $scope.Customer = res.data.data;
                  $scope.GetAllChildByParentId();
                  $scope.GetAllCommissionCounts();
            });
      };

      $scope.GetAllChildByParentId = function () {
            $http.get($rootScope.RoutePath + "dashboard/GetAllChildByParentId?id=" + $scope.Customer.id).success(function (res) {
                  $scope.ChildCount = res.data;
            });
      };

      $scope.GetAllCommissionCounts = function () {
            $http.get($rootScope.RoutePath + "dashboard/GetAllCommissionCounts?id=" + $scope.Customer.id).success(function (res) {
                  $scope.CommissionCount = res.data;
            });
      };

      $scope.EmployeeAttendanceCount = function () {
            $http.get($rootScope.RoutePath + "dashboard/EmployeeAttendanceCount").success(function (res) {
                  $scope.TotalAbsentEmployee = res.data;
            });
      };

      $scope.getAllSales = function () {
            var params = {
                  idLocations: $scope.IsAdmin ? "" : $localstorage.get('CustomerGroup') == 'Genmed' ? "" : $localstorage.get('idLocations'),
                  CreatedBy: $scope.IsCustomer ? parseInt($localstorage.get('UserId')) : ''
            };

            $http.get($rootScope.RoutePath + 'dashboard/GetAllSalesnew', {
                  params: params
            }).success(function (data) {
                  console.log(data)
                  if (data.success == true && data.data.length && data.data.length > 0) {
                        $scope.lstSales = data.data;
                        $scope.TotalTransactions = $scope.lstSales[0].TotalRecord;
                        $scope.TotalSales = $scope.lstSales[0].Totalsales;


                        // for (var i = 0; i < $scope.lstSales.length; i++) {

                        //     $scope.TotalSales = $scope.TotalSales + parseFloat($scope.lstSales[i].FinalTotal);
                        //     // if (!$scope.IsCustomer) {
                        //     //     $scope.TotalSales = $scope.TotalSales + parseFloat($scope.lstSales[i].FinalTotal);
                        //     // } else {
                        //     //     if ($scope.lstSales[i].CreatedBy == parseInt($localstorage.get('UserId'))) {
                        //     //         $scope.TotalSales = $scope.TotalSales + parseFloat($scope.lstSales[i].FinalTotal);
                        //     //     }
                        //     // }
                        // }
                        $scope.TotalSales = parseInt($scope.TotalSales);
                  } else {
                        $scope.TotalTransactions = 0;
                        $scope.TotalSales = 0;
                  }
                  $scope.getAllCustomer();
            })
      };

      $scope.getAllRecentSales = function () {
            var params = {
                  idLocations: $scope.IsAdmin ? "" : $localstorage.get('CustomerGroup') == 'Genmed' ? "" : $localstorage.get('idLocations')
            };
            $http.get($rootScope.RoutePath + 'dashboard/GetAllRecentSales', {
                  params: params
            }).success(function (data) {
                  if (data.success == true) {
                        $scope.lstRecentSales = data.data;
                        for (var i = 0; i < $scope.lstRecentSales.length; i++) {
                              var SalesQty = 0;
                              var SalesAmt = 0;
                              for (var j = 0; j < $scope.lstRecentSales[i].invoicedetails.length; j++) {
                                    SalesQty = SalesQty + $scope.lstRecentSales[i].invoicedetails[j].Qty;
                                    SalesAmt = SalesAmt + $scope.lstRecentSales[i].invoicedetails[j].NetTotal;
                              }
                              $scope.lstRecentSales[i].SalesQty = SalesQty;
                              $scope.lstRecentSales[i].SalesAmt = parseInt(SalesAmt);
                              $scope.lstRecentSales[i].InvoiceDate = moment(new Date($scope.lstRecentSales[i].InvoiceDate)).format("DD-MM-YYYY")
                        }
                  }
                  $(document).ready(function () {
                        $('#RecentSales').dataTable().fnClearTable();
                        $('#RecentSales').dataTable().fnDestroy();
                        setTimeout(function () {
                              $('#RecentSales').DataTable({
                                    responsive: true,
                                    language: {
                                          "emptyTable": "No Data Found"
                                    },
                                    columnDefs: [{
                                          bSortable: false,
                                          aTargets: [-1]
                                    }]
                              });
                        })
                  })
                  $scope.GetAllUpComingEvent();
            })
      };

      $scope.getAllCustomer = function () {
            var params = {
                  idLocations: $scope.IsAdmin ? "" : $localstorage.get('CustomerGroup') == 'Genmed' ? "" : $localstorage.get('idLocations')
            };
            $http.get($rootScope.RoutePath + 'dashboard/GetAllCustomer', {
                  params: params
            }).success(function (data) {
                  if (data.success = true) {
                        $scope.lstCustomer = data.data;
                        $scope.TotalCustomer = ($scope.lstCustomer).length;
                  } else {
                        $scope.TotalCustomer = 0;
                  }
                  $scope.getAllItemStock();
            })
      };

      $scope.getAllItemStock = function () {
            var params = {
                  idLocations: $scope.IsAdmin ? "" : $localstorage.get('CustomerGroup') == 'Genmed' ? "" : $localstorage.get('idLocations')
            };
            $http.get($rootScope.RoutePath + 'dashboard/GetAllItemStocknew', {
                  params: params
            }).success(function (data) {
                  if (data.success = true && data.data.length && data.data.length > 0) {
                        // $scope.lstItemStock = data.data;
                        // $scope.TotalLowStockItem = 0;
                        // _.filter($scope.lstItemStock, function(o) {
                        //     if (o.BalQty < o.MinQty) {
                        //         $scope.TotalLowStockItem += 1;
                        //     }
                        // })
                        $scope.TotalLowStockItem = data.data[0].totalStock;
                  } else {
                        $scope.TotalLowStockItem = 0;
                  }
                  $scope.getAllRecentSales();
            })
      };

      $scope.getBestPerformingLocation = function () {
            var params = {
                  idLocations: $scope.IsAdmin ? "" : $localstorage.get('CustomerGroup') == 'Genmed' ? "" : $localstorage.get('idLocations')
            };
            $http.get($rootScope.RoutePath + 'dashboard/getBestPerformingLocation', {
                  params: params
            }).success(function (data) {
                  $scope.BestPerformingLocation = 'N/A';
                  $scope.LocationNetTotal = 'N/A';
                  if (data.success == true && data.data != '' && data.data != undefined && data.data != null) {
                        $scope.BestPerformingLocation = data.data.LocationName;
                        $scope.LocationNetTotal = parseInt(data.data.NetTotalByLocation);
                  }
            })
      };

      $scope.getBestPerformingItem = function () {
            var params = {
                  idLocations: $scope.IsAdmin ? "" : $localstorage.get('CustomerGroup') == 'Genmed' ? "" : $localstorage.get('idLocations')
            };
            $http.get($rootScope.RoutePath + 'dashboard/getBestPerformingItem', {
                  params: params
            }).success(function (data) {
                  $scope.BestPerformingItem = 'N/A';
                  $scope.ItemNetTotal = 'N/A';
                  if (data.success == true && data.data != '' && data.data != undefined && data.data != null) {
                        $scope.BestPerformingItem = data.data.ItemCode;
                        $scope.ItemNetTotal = parseInt(data.data.NetTotalByItem);
                  }
            })
      };

      $scope.getMonthlySalesChartData = function () {
            var params = {
                  idLocations: $scope.IsAdmin ? "" : $localstorage.get('CustomerGroup') == 'Genmed' ? "" : $localstorage.get('idLocations')
            };
            $http.get($rootScope.RoutePath + 'dashboard/GetMonthlySalesChartData', {
                  params: params
            }).success(function (data) {
                  $scope.lastChartData = [];
                  if (data.success = true) {
                        var groups = _.groupBy(data.data, function (o) {
                              return (moment(new Date(o.InvoiceDate)).year()) + "#" + (moment(new Date(o.InvoiceDate)).month() + 1);
                        })
                        $scope.lstGroupData = _.map(groups, function (item) {
                              var NetTotal = 0;
                              for (var i = 0; i < item.length; i++) {
                                    var itemDetail = item[i].invoicedetails;
                                    for (var j = 0; j < itemDetail.length; j++) {
                                          NetTotal = NetTotal + parseFloat(itemDetail[j].NetTotal);
                                    }
                              }
                              return {
                                    InvoiceDate: moment(new Date(item[0].InvoiceDate)).format("YYYY-MMM"),
                                    NetTotal: parseInt(NetTotal),
                              }
                        })
                        $scope.lastsalesData = [];
                        var StartDate = new Date();
                        StartDate = StartDate.setFullYear(StartDate.getFullYear() - 1);
                        var Month = 0;
                        for (var i = 0; i < 12; i++) {
                              if (i == 0) {
                                    Month = (new Date(StartDate)).getMonth() + 1;
                              } else {
                                    Month = parseInt(Month) + 1;
                              }
                              var CurrentDate = (new Date(StartDate)).setMonth(Month);
                              var newObj = {
                                    InvoiceDate: moment(new Date(CurrentDate)).format("YYYY-MMM"),
                                    NetTotal: 0
                              }

                              var obj = _.filter($scope.lstGroupData, {
                                    InvoiceDate: newObj.InvoiceDate
                              })[0];
                              if (obj != undefined && obj != null && obj != '') {
                                    newObj.NetTotal = obj.NetTotal;
                              }
                              $scope.lastsalesData.push(newObj);
                        }
                  }
                  var chart = AmCharts.makeChart("chartdiv", {
                        "type": "serial",
                        "addClassNames": true,
                        "theme": "light",
                        "autoMargins": false,
                        "marginLeft": 30,
                        "marginRight": 8,
                        "marginTop": 10,
                        "marginBottom": 26,
                        "balloon": {
                              "adjustBorderColor": false,
                              "horizontalPadding": 10,
                              "verticalPadding": 8,
                              "color": "#358acc"
                        },

                        "dataProvider": $scope.lastsalesData,
                        "valueAxes": [{
                              "axisAlpha": 0,
                              "position": "left"
                        }],
                        "startDuration": 1,
                        "graphs": [{
                              "id": "graph2",
                              "balloonText": "<span style='font-size:12px;'>[[title]] in [[category]]:<br><span style='font-size:20px;'>[[value]]</span> [[additional]]</span>",
                              "bullet": "round",
                              "lineThickness": 3,
                              "bulletSize": 0,
                              "bulletBorderAlpha": 1,
                              "bulletColor": "#FFFFFF",
                              "useLineColorForBulletBorder": true,
                              "bulletBorderThickness": 3,
                              "fillAlphas": 1,
                              "lineAlpha": 1,
                              "title": "NetTotal",
                              "valueField": "NetTotal",
                        }],
                        "chartCursor": {
                              "pan": true,
                              "valueLineEnabled": true,
                              "valueLineBalloonEnabled": true,
                              "cursorAlpha": 1,
                              "cursorColor": "#2990f1",
                              "limitToGraph": "g1",
                              "valueLineAlpha": 0.2,
                              "valueZoomable": false,
                              "categoryBalloonDateFormat": "JJ:NN  DD MMMM",
                              "selectWithoutZooming": true
                        },
                        "categoryField": "InvoiceDate",
                        "categoryAxis": {
                              "gridPosition": "start",
                              "axisAlpha": 0,
                              "tickLength": 0
                        },
                        "export": {
                              "enabled": true
                        }
                  });
            })
      };

      $scope.GetAllUpComingEvent = function () {
            var x = new Date();
            var offset = -x.getTimezoneOffset();
            var CurrentOffset = (('00' + offset).slice(-2) >= 0 ? "+" : "-") + ('00' + parseInt(offset / 60).toString()).slice(-2) + ":" + offset % 60;
            CurrentOffset = encodeURIComponent(CurrentOffset);
            var params = {
                  CurrentOffset: CurrentOffset
            }
            $http.get($rootScope.RoutePath + 'dashboard/GetAllUpComingEvents', {
                  params: params
            }).then(function (data) {
                  for (var index = 0; index < data.data.data.length; index++) {
                        data.data.data[index].datehtml = data.data.data[index].DisplayDate.replace(/th/g, '<sup>th</sup>').replace(/st/g, '<sup>st</sup>').replace(/nd/g, '<sup>nd</sup>').replace(/rd/g, '<sup>rd</sup>');

                  }
                  $scope.LstUpComingEvent = data.data.data;
            })
            $scope.GetDashboardCount();
      };

      $scope.EventIdList = [];

      $scope.ManageCheckboxList = function (id) {
            if ($scope.EventIdList.indexOf(id) == -1) {
                  $scope.EventIdList.push(id);
            } else {
                  $scope.EventIdList.splice($scope.EventIdList.indexOf(id), 1);
            }
      };

      $scope.UpdateMultiNotes = function () {

            if ($scope.EventIdList.length == 0) {
                  var alertPopup = $ionicPopup.alert({
                        title: '',
                        template: 'please Select at Least One Event.',
                        cssClass: 'custPop',
                        okText: 'Ok',
                        okType: 'btn btn-green',
                  });
                  return;
            }

            var confirmPopup = $ionicPopup.confirm({
                  title: "",
                  template: 'Are you sure you want to complete this event?',
                  cssClass: 'custPop',
                  cancelText: 'Cancel',
                  okText: 'Ok',
                  okType: 'btn btn-green',
                  cancelType: 'btn btn-red',
            })
            confirmPopup.then(function (res) {
                  if (res) {

                        var params = {
                              idCalendar: $scope.EventIdList.toString(),
                        }
                        $http.get($rootScope.RoutePath + 'dashboard/updateUpComingEvents', {
                              params: params
                        }).then(function (data) {
                              if (data.data.success) {
                                    $scope.GetAllUpComingEvent();
                              }
                              $ionicLoading.show({
                                    template: data.data.message
                              });
                              setTimeout(function () {
                                    $ionicLoading.hide()
                              }, 1000);
                        })

                  }
            })
      };

      $scope.UpdateNotes = function (objNotes) {

            var confirmPopup = $ionicPopup.confirm({
                  title: "",
                  template: 'Are you sure you want to complete this event?',
                  cssClass: 'custPop',
                  cancelText: 'Cancel',
                  okText: 'Ok',
                  okType: 'btn btn-green',
                  cancelType: 'btn btn-red',
            })
            confirmPopup.then(function (res) {
                  if (res) {
                        if (objNotes.Data.length > 0) {
                              var params = {
                                    idCalendar: _.pluck(objNotes.Data, 'id').toString(),
                              }

                              $http.get($rootScope.RoutePath + 'dashboard/updateUpComingEvents', {
                                    params: params
                              }).then(function (data) {
                                    if (data.data.success) {
                                          $scope.GetAllUpComingEvent();
                                    }
                                    $ionicLoading.show({
                                          template: data.data.message
                                    });
                                    setTimeout(function () {
                                          $ionicLoading.hide()
                                    }, 1000);
                              })
                        }
                  }
            })
      };

      $scope.GetDashboardCount = function () {
            var params = {
                  idLocations: $scope.IsAdmin ? "" : $localstorage.get('CustomerGroup') == 'Genmed' ? "" : $localstorage.get('idLocations')
            };
            $http.get($rootScope.RoutePath + 'dashboard/GetDashboardCount', {
                  params: params
            }).success(function (data) {
                  $scope.ObjQuatasion = data;
                  $scope.GetTop5SalesPacked();
            })
      };

      $scope.GetTop5SalesPacked = function () {
            var params = {
                  idLocations: $scope.IsAdmin ? "" : $localstorage.get('CustomerGroup') == 'Genmed' ? "" : $localstorage.get('idLocations')
            };
            $http.get($rootScope.RoutePath + 'dashboard/GetTop5SalesPacked', {
                  params: params
            }).success(function (data) {
                  $scope.LstPackedOrder = data;
                  $scope.EmployeeAttendanceCount();
            })
      }

      $ionicModal.fromTemplateUrl('OrderView.html', {
            scope: $scope,
            animation: 'slide-in-up'
      }).then(function (modal) {
            $scope.modal = modal;
      });

      $scope.OpenModelOrderView = function (id) {
            $scope.modal.show();
            $scope.OrderView = _.where($scope.lstRecentSales, {
                  id: id
            });
            $scope.RecentOrderView = $scope.OrderView[0]
      };

      $scope.closeModal = function () {
            $scope.modal.hide();
      };

      $scope.$on('$destroy', function () {
            $scope.modal.remove();
      });

      $scope.init();
})