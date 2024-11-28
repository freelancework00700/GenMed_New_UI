app.controller('MediaManagementController', function ($scope, $rootScope, $http, $localstorage, $ionicPopup, $state, $ionicLoading, $ionicScrollDelegate, $ionicModal, $compile) {
    $scope.init = function () {
        setTimeout(() => {
            $("#mytext").focus();
        }, 1000);
        $scope.ResetModel();
        setTimeout(function () {
            InitDataTable();
        })
        $rootScope.BackButton = $scope.IsList = true;
    };



    $scope.FilterData = function () {
        $('#MediaTable').dataTable().api().ajax.reload();

    }

    function InitDataTable() {
        if ($.fn.DataTable.isDataTable('#MediaTable')) {
            $('#MediaTable').DataTable().destroy();
        }
        $('#MediaTable').DataTable({
            "processing": true,
            "dom": 'rt<"bottom"<"left"<"length"l><"info"i>><"right"<"pagination"p>>>',
            "serverSide": true,
            "responsive": true,
            "aaSorting": [1, 'ASC'],
            "ajax": {
                url: $rootScope.RoutePath + 'media/GetAllMediaDynamic',
                data: function (d) {
                    if ($scope.Searchmodel.Search != undefined) {
                        d.search = $scope.Searchmodel.Search;
                    }

                    return d;

                },
                type: "get",
                dataSrc: function (json) {
                    console.log(json);

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
                "data": "title",
                "defaultContent": "N/A"
            },
            {
                "data": "shortdescription",
                "defaultContent": "N/A"
            },
            {
                "data": "longdescription",
                "defaultContent": "N/A"
            },

            {
                "data": "videourl",
                "defaultContent": "N/A"
            },
            {
                "data": "IsActive",
                "defaultContent": "N/A"
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
                    Action += '<a ng-click="CopyToModel(' + row.id + ')" class="btnAction btnAction-edit" style="cursor:pointer;margin-right:3px;"><i class="ion-edit" title="Edit"></i></a>';
                    Action += '<a ng-click="DeleteMediafile(' + row.id + ')" class="btnAction btnAction-error" style="cursor:pointer;margin-right:3px;"><i class="ion-trash-a" title="Delete"></i></a>';
                    // Action += '<a ng-click="OpenModelLocation(' + row.id + ')" class="btnAction btnAction-edit" style="cursor:pointer"><i class="ion-plus" title="Assign Employee Location"></i></a>';
                    Action += '</div>';
                    return Action;
                },
                "targets": 6
            },
            {
                "render": function (data, type, row, meta) {
                    var extension = row.image ? row.image.split(".")[1] : null;
                    if (extension == 'mp4' || extension == '3gp' || extension == 'wmv' || extension == 'mkv' || extension == 'flv') {
                        var image = '<video width="50" height="50" autoplay controls src="' + $rootScope.RoutePath + 'MediaUploads/ImageUpload/' + row.image + '"></video>'
                        return image;
                    } else {
                        var image = '<img src="' + $rootScope.RoutePath + 'MediaUploads/ImageUpload/' + row.image + '"style = "height: 50px;width: 50px;" err-src="../img/no-image.png" > ';
                        return image;
                    }
                },
                "targets": 4


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
                "targets": 5
            },
            ]
        });
    }

    $scope.formsubmit = false

    $scope.SaveMedia = function (FormMedia) {

        // if (FormMedia.$invalid) {
        if (!$scope.model.id) {
            $scope.model.id = 0;

        }
        $scope.model.IsActive = $scope.model.IsActive == true ? 1 : 0;

        console.log($scope.model);
        $rootScope.ShowLoader();
        $http.post($rootScope.RoutePath + "media/SaveMedia", $scope.model)
            .then(function (res) {
                var SaveImage = _.filter($scope.Mediafiles, function (item) {
                    if (item[0].id == 0) {
                        return item;
                    }
                })
                if (SaveImage.length == 0) {
                    if (res.data.success) {
                        $scope.init();
                    }
                    $ionicLoading.show({ template: res.data.message });
                    setTimeout(function () {
                        $ionicLoading.hide()
                    }, 1000);
                    return
                }
                var id;
                if ($scope.model.id != 0) {
                    id = $scope.model.id;
                } else {
                    id = res.data.data[0].id;
                }
                console.log(res)
                console.log(SaveImage, id)
                var formData = new FormData();
                angular.forEach(SaveImage, function (obj) {
                    formData.append(id, obj[0]);
                });

                $http.post($rootScope.RoutePath + "media/UploadImage", formData, {
                    transformRequest: angular.identity,
                    headers: {
                        'Content-Type': undefined
                    },
                }).then(function (data) {
                    if (res.data.success) {
                        $scope.init();
                    }
                    $ionicLoading.show({ template: res.data.message });
                    setTimeout(function () {
                        $ionicLoading.hide()
                    }, 1000);

                }, function (err) {
                    $ionicLoading.show({ template: res.data.message });
                    setTimeout(function () {
                        $ionicLoading.hide()
                    }, 1000);
                });

            })
            .catch(function (err) {

                $ionicLoading.show({ template: 'Unable to save record right now. Please try again later.' });
                setTimeout(function () {
                    $ionicLoading.hide()
                }, 1000);

            });
        // } else {
        //     $scope.formsubmit = true;
        // }
    };

    // Use more distinguished and understandable naming
    // $scope.CopyToModel1 = function (selectedItem) {
    //     console.log(selectedItem);

    //     $rootScope.BackButton = $scope.IsList = false;
    //     for (var prop in $scope.model) {
    //         $scope.model[prop] = selectedItem[prop];

    //     }

    //     $scope.Mediafiles = [];
    //     $scope.TempRemoveArr = [];
    //     if (selectedItem.Image != '' || selectedItem.Image != null || selectedItem.Image != undefined) {
    //         var arr = [];
    //         arr.push({
    //             image: $rootScope.RoutePath + 'MediaUploads/ImageUpload/' + selectedItem.Image
    //         })
    //         $scope.Mediafiles.push(arr);
    //     }
    //     $scope.model.IsActive = data.data.IsActive == 0 ? true : false;

    // };

    $scope.CopyToModel = function (id) {
        console.log(id);

        var selectedItem = _.findWhere($scope.lstdata, { id: id });
        console.log(selectedItem);

        $rootScope.BackButton = $scope.IsList = false;
        for (var prop in $scope.model) {
            $scope.model[prop] = selectedItem[prop];
        }

        $scope.Mediafiles = [];
        $scope.TempRemoveArr = [];
        if (selectedItem.image != '' || selectedItem.image != null || selectedItem.image != undefined) {
            var arr = [];
            // arr.push({
            //     image: $rootScope.RoutePath + 'MediaUploads/ImageUpload/' + selectedItem.image
            // })
            // $scope.Mediafiles.push(arr);
            var blob = null;
            var xhr = new XMLHttpRequest();
            xhr.open("GET", $rootScope.RoutePath + 'MediaUploads/ImageUpload/' + selectedItem.image);
            xhr.responseType = "blob";//force the HTTP response, response-type header to be blob
            xhr.onload = function () {
                blob = xhr.response;//xhr.response is now a blob object
                console.log("111111111111111", blob)
                srcToFile($rootScope.RoutePath + 'MediaUploads/ImageUpload/' + selectedItem.image, selectedItem.image, blob.type).then(function (file) {
                    console.log("==========", file)
                    arr.push(file);
                    var reader = new FileReader();
                    reader.onloadend = function () {
                        file.image = reader.result;
                        file.id = 0;
                        setTimeout(function () {
                            $scope.$apply(function () {
                                $scope.Mediafiles.push(arr);
                            })
                        })
                    }
                    reader.readAsDataURL(blob);

                })
            }
            xhr.send();
            console.log("____________", xhr)

        }
        $scope.model.IsActive = $scope.model.IsActive == 1 ? true : false;
    };

    function srcToFile(src, fileName, mimeType) {
        return (fetch(src)
            .then(function (res) { return res.arrayBuffer(); })
            .then(function (buf) { return new File([buf], fileName, { type: mimeType }); })
        );
    }

    $scope.DeleteMediafile = function (id) {
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
                return $http.get($rootScope.RoutePath + 'media/DeleteMedia', {
                    params: {
                        id: id
                    }
                }).then(function (res) {
                    if (res.data.data == 'TOKEN') {
                        $rootScope.logout();
                    }
                    if (res.data.success) {
                        $ionicScrollDelegate.scrollTop();
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
            } else {
                $scope.init();
            }
        });
    }


    $scope.ResetModel = function () {
        $scope.model = {
            id: '',
            title: '',
            shortdescription: '',
            longdescription: '',
            image: '',
            videourl: '',
            CreatedDate: null,
            IsActive: true
        };

        $scope.Searchmodel = {
            Search: '',
            SearchLocation: ''
        }

    };

    $scope.Add = function () {
        $scope.Mediafiles = [];
        $scope.formsubmit = false;
        $rootScope.BackButton = $scope.IsList = false;
        setTimeout(function () {
            $("#PhoneNumber").intlTelInput({
                utilsScript: "lib/intl/js/utils.js"
            });
        }, 500)
    }

    // Alias
    $rootScope.ResetAll = $scope.init;


    //#region Image Upload 
    $scope.Mediafiles = [];
    $scope.readFile = function (input) {
        $scope.Mediafiles = [];
        if (input.files.length > 0) {
            //read file
            counter = input.files.length;
            for (x = 0; x < counter; x++) {
                if (input.files && input.files[x]) {
                    console.log(input.files)
                    var reader = new FileReader();
                    reader.onload = function (e) {
                        input.files[0].image = e.target.result;
                        input.files[0].id = 0;
                        setTimeout(function () {
                            $scope.$apply(function () {
                                $scope.Mediafiles.push(input.files);
                                console.log($scope.Mediafiles)
                            })
                        })
                    };
                    reader.readAsDataURL(input.files[x]);
                }
            }
        }
    }

    $scope.TempRemoveArr = [];
    $scope.RemoveImage = function (index, id) {
        $scope.Mediafiles.splice(index, 1);
        if (id != 0) {
            $scope.TempRemoveArr.push(id);
        }
    }
    //#endregion
    $scope.init();

}).filter('trusted', ['$sce', function ($sce) {
    return function (url) {
        return $sce.trustAsResourceUrl(url);
    };
}]);