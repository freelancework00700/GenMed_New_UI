app.controller('ItemBatchController', function ($scope, $rootScope, $http, $ionicPopup, $ionicLoading, $compile, $localstorage, $state) {

      $scope.init = function () {
            setTimeout(() => {
                  $("#mytext").focus();
            }, 1000);
            $scope.modelAdvanceSearch = null;
            $scope.IsGenmed = $localstorage.get('CustomerGroup') == 'Genmed' ? true : false;
            ManageRole();
            $scope.tab = {
                  selectedIndex: 0
            };
            $scope.model = {
                  id: null,
                  ItemCode: '',
                  ItemName: '',
                  BatchNumber: '',
                  Barcode: null,
                  ManuDate: null,
                  ExpiryDate: null,
                  LastSaleDate: null,
                  PurchaseRate: null,
                  MRP: null,
                  SalesRate: null,
                  Descriptions: null,
            }
            $scope.Searchmodel = {
                  Search: '',
            }
            $scope.EditFlg = false;
            $rootScope.BackButton = $scope.IsList = true;
            $scope.lstItemsSearch = [];
            $scope.listUOM = []
            $scope.tab = {
                  selectedIndex: 0
            };
            setTimeout(function () {
                  InitDataTable()
            })


      }

      $scope.GetAllItemSearch = function (ItemName) {
            if (ItemName) {
                  var params = {
                        ItemName: ItemName,
                        CustGroupName: $scope.CurrentCustomerGroup == 'Genmed' ? null : $scope.CurrentCustomerGroup
                  }
                  $http.get($rootScope.RoutePath + 'itembatch/GetAllItemBySearchText', {
                        params: params
                  }).then(function (res) {
                        $scope.lstItemsSearch = res.data.data;
                  });
            } else {
                  $scope.lstItemsSearch = [];
            }
      };

      function ManageRole() {
            var AdminUser = _.filter(JSON.parse($localstorage.get('UserRoles')), function (Role) {
                  return Role == "Admin";
            })
            $scope.IsAdmin = AdminUser.length && AdminUser.length > 0 ? true : false;
      }


      $scope.AddItemCode = function (t) {
            console.log(t)
            if (t) {
                  $scope.model.ItemCode = t.ItemCode;
                  $scope.model.ItemName = t.ItemName;
            }
            if (t.itembatch) {
                  $scope.model.MRP = t.itembatch.MRP
                  $scope.model.PurchaseRate = t.itembatch.PurchaseRate
                  $scope.model.SalesRate = t.itembatch.SalesRate
            }
            $scope.lstItemsSearch = [];
      }

      $scope.formsubmit = false;
      $scope.SaveItemBatch = function (form) {
            if (form.$invalid) {
                  $scope.formsubmit = true;
            } else {
                  $scope.model.ExpiryDate = moment($scope.model.ExpiryDate).format('YYYY-MM-DD');
                  $rootScope.ShowLoader();
                  $http.post($rootScope.RoutePath + 'itembatch/SaveItembatch', $scope.model).then(function (res) {
                        if (res.data.success) {
                              $ionicLoading.show({
                                    template: res.data.message
                              });
                              setTimeout(function () {
                                    $ionicLoading.hide()
                              }, 1000);
                              $scope.init()
                        } else {
                              $ionicLoading.hide()
                              $ionicLoading.show({
                                    template: res.data.message
                              });
                              setTimeout(function () {
                                    $ionicLoading.hide()
                              }, 1000);
                        }
                  });
            }
      }


      //Table function End
      $scope.ResetModel = function () {
            $scope.model = {
                  id: null,
                  ItemCode: '',
                  ItemName: '',
                  BatchNumber: '',
                  Barcode: null,
                  ManuDate: null,
                  ExpiryDate: null,
                  LastSaleDate: null,
                  PurchaseRate: null,
                  MRP: null,
                  SalesRate: null,
                  Descriptions: null,
            }
            $scope.SelectedTab = 'Details';
            $scope.Searchmodel = {
                  Search: '',
            }
            $('#ItemBatchTable').dataTable().fnClearTable();
            $('#ItemBatchTable').dataTable().fnDestroy();
            setTimeout(function () {
                  InitDataTable();
            })
      };

      $rootScope.ResetAll = $scope.init;

      $scope.Add = function () {
            $scope.formsubmit = false;
            $rootScope.BackButton = $scope.IsList = false;
      }

      $scope.FilterData = function () {
            $('#ItemBatchTable').dataTable().api().ajax.reload();
      }

      $scope.EnableFilterOption = function () {
            $(function () {
                  $(".CustFilter").slideToggle();
            });
      };

      $scope.FilterAdvanceData = function (o) {
            if (o != null) {
                  $scope.modelAdvanceSearch = o;
            }
            $('#ItemBatchTable').dataTable().api().ajax.reload();
            // InitDataTable();
      }

      function InitDataTable() {
            $('#ItemBatchTable').DataTable({
                  "processing": true,
                  "dom": 'rt<"bottom"<"left"<"length"l><"info"i>><"right"<"pagination"p>>>',
                  "serverSide": true,
                  "responsive": true,
                  "aaSorting": [0, 'desc'],
                  "ajax": {
                        url: $rootScope.RoutePath + 'itembatch/GetAllItembatchDynamic',
                        data: function (d) {
                              if ($scope.Searchmodel.Search != undefined) {
                                    d.search = $scope.Searchmodel.Search;
                              }
                              // d.idLocations = $scope.IsAdmin ? "" : $localstorage.get('idLocations');
                              d.modelAdvanceSearch = $scope.modelAdvanceSearch;
                              console.log(d);
                              return d;
                        },
                        type: "get",
                        dataSrc: function (json) {
                              if (json.success != false) {
                                    $scope.lstdata = json.data;
                                    console.log(json.data);
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
                              "data": 'id',
                              "sortable": false
                        },
                        {
                              "data": "ItemCode",
                              "defaultContent": "N/A"
                        },
                        {
                              "data": null,
                              "defaultContent": "N/A"
                        },
                        {
                              "data": "BatchNumber",
                              "defaultContent": "N/A"
                        },
                        {
                              "data": "ExpiryDate",
                              "defaultContent": "N/A"
                        },
                        // { "data": "LastSaleDate", "defaultContent": "N/A" },
                        {
                              "data": "PurchaseRate",
                              "defaultContent": "N/A"
                        },
                        {
                              "data": "SalesRate",
                              "defaultContent": "N/A"
                        },
                        {
                              "data": "MRP",
                              "defaultContent": "N/A"
                        },
                        // { "data": null },
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
                              "render": function (data, type, row, meta) {
                                    if (data == '' || data == null) {
                                          return 'N/A';
                                    }
                                    return data;
                              },
                              "targets": [1, 3],
                        },
                        {
                              "render": function (data, type, row, meta) {
                                    if (row.item.ItemName == '' || row.item.ItemName == null) {
                                          return 'N/A';
                                    }
                                    return row.item.ItemName;
                              },
                              "targets": 2,
                        },
                        {
                              "render": function (data, type, row) {
                                    var date = '';
                                    if (data != null && data != '' && data != undefined) {
                                          date = moment.utc(new Date(data)).format('DD-MM-YYYY');
                                    } else {
                                          date = 'N/A';
                                    }

                                    return date;
                              },
                              "targets": [4],
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
                              "targets": [5, 6, 7],
                              className: "right-aligned-cell"
                        }, {
                              "render": function (data, type, row) {
                                    var Action = '';
                                    if ($localstorage.get('CustomerGroup') == 'Genmed') {
                                          Action += '<div layout="row" layout-align="center center">';
                                          Action += '<a ng-click="CopyToModel(' + row.id + ')" class="btnAction btnAction-edit" style="cursor:pointer"><i class="ion-edit" title="Edit"></i></a>&nbsp;';
                                          Action += '<a ng-click="DeleteItemBatch(' + row.id + ')" class="btnAction btnAction-error" style="cursor:pointer"><i class="ion-trash-a" title="Delete"></i></a>';
                                          Action += '</div>';
                                    }

                                    return Action;
                              },
                              "targets": 8
                        }
                  ]
            });
      }

      $scope.DeleteItemBatch = function (id) {
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
                        $http.get($rootScope.RoutePath + 'itembatch/DeleteItembatch', {
                              params: params
                        }).success(function (data) {
                              if (data.success == true) {
                                    $scope.ResetModel();
                              }
                              $ionicLoading.show({
                                    template: data.message
                              });
                              setTimeout(function () {
                                    $ionicLoading.hide()
                              }, 1000);
                        }).catch(function (err) {
                              $ionicLoading.show({
                                    template: 'Unable to delete record right now. Please try again later.'
                              });
                              setTimeout(function () {
                                    $ionicLoading.hide()
                              }, 1000);
                        });
                  }
            });
      }

      $scope.CopyToModel = function (selectedItem) {
            $rootScope.BackButton = $scope.IsList = false;
            var obj = _.findWhere($scope.lstdata, {
                  id: selectedItem
            });
            // Loop model, because selectedItem might have MORE properties than the defined model
            for (var prop in $scope.model) {
                  $scope.model[prop] = obj[prop];
            }
            var obj = {
                  ItemCode: $scope.model.ItemCode
            }
            $scope.EditFlg = true;
            $http.get($rootScope.RoutePath + 'itembatch/GetAllItemByItemCode', {
                  params: obj
            }).success(function (data) {
                  $scope.model.ItemName = data.data[0].ItemName
            })
      };
      $scope.init();
})