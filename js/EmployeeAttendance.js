app.controller('EmployeeAttendanceController', function ($scope, $rootScope, $http, $localstorage, $ionicPopup, $state, $ionicLoading, $ionicScrollDelegate, $ionicModal, $compile, $filter) {

    var days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    $scope.vm = this;
    $scope.vm.isAllSelected = 0;
    $scope.vm.isAllHalfDay = 0;
    $scope.vm.Reset = Reset;

    $scope.init = function () {
        var now = new Date();
        $scope.lstyear = [{ id: 2017, Year: "2017" }, { id: 2018, Year: "2018" }, { id: 2019, Year: "2019" }, { id: 2020, Year: "2020" }, { id: 2021, Year: "2021" }, { id: 2022, Year: "2022" }, { id: 2023, Year: "2023" }, { id: 2024, Year: "2024" }, { id: 2025, Year: "2025" }];
        $scope.lstMonth = [
            { id: "0", Month: "January" }, { id: "1", Month: "February" }, { id: "2", Month: "March" }, { id: "3", Month: "April" },
            { id: "4", Month: "May" }, { id: "5", Month: "June" }, { id: "6", Month: "July" }, { id: "7", Month: "August" },
            { id: "8", Month: "September" }, { id: "9", Month: "October" }, { id: "10", Month: "November" }, { id: "11", Month: "December" }
        ];

        var exists = $filter('filter')($scope.lstyear, { Year: new Date().getFullYear() })
        if (exists == null) {
            $scope.lstyear.push({ id: new Date().getFullYear(), Year: (new Date().getFullYear()).toString() });
        }

        $scope.model = {
            id: 0,
            idUser: "",
            AttendenceMonth: new Date().getMonth(),
            AttendenceYear: new Date().getFullYear(),
        };

        $scope.flgEdit = false;
        $scope.TotalDays = 0;
        $scope.AbsentDays = 0;
        $scope.PresentDays = 0;
        $scope.HalfDays = 0;
        $scope.lstdate = [];
        $scope.Searchmodel = {
            Search: '',
        }
        $scope.flag = false;
        $scope.GetAllEmployee();
        $scope.GetAllEmployeeAttendence();
        $scope.minDate = new Date(1900, 1, 1)
        $scope.maxDate = new Date(2050, 12, 1);


        var firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
        var lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        for (var d = firstDay; d <= lastDay; d.setDate(d.getDate() + 1)) {
            $scope.lstdate.push({ id: 0, idUser: 0, AttendenceDate: new Date(d), AttendenceDay: days[d.getDay()], IsPresent: 0, IsHalfDay: 0 });
        }
        $scope.TotalDays = $scope.lstdate.length;
        $scope.AbsentDays = $filter('filter')($scope.lstdate, { IsPresent: 0 }).length;
        $scope.PresentDays = $filter('filter')($scope.lstdate, { IsPresent: 1 }).length;
        $scope.HalfDays = $filter('filter')($scope.lstdate, { IsHalfDay: 1 }).length;
        $rootScope.BackButton = true;
    }

    $scope.toggleAll = function () {
        var toggleStatus = $scope.vm.isAllSelected == 1 ? 1 : 0;
        angular.forEach($scope.lstdate, function (itm) { itm.IsPresent = toggleStatus; });
        $scope.TotalDays = $scope.lstdate.length;
        $scope.AbsentDays = $filter('filter')($scope.lstdate, { IsPresent: 0 }).length;
        $scope.PresentDays = $filter('filter')($scope.lstdate, { IsPresent: 1 }).length;

        if ($scope.vm.isAllSelected == 0) {
            $scope.vm.isAllHalfDay = 0;
            $scope.HalfDays = 0;
            angular.forEach($scope.lstdate, function (itm) { itm.IsHalfDay = $scope.vm.isAllHalfDay; });
        }
    }

    $scope.optionToggled = function (o) {
        setTimeout(function () {
            if (o.IsPresent == 0) {
                o.IsHalfDay = 0;
            }
            $scope.TotalDays = $scope.lstdate.length;

            $scope.$apply(function () {
                $scope.AbsentDays = $filter('filter')($scope.lstdate, { IsPresent: 0 }).length;
                $scope.PresentDays = $filter('filter')($scope.lstdate, { IsPresent: 1 }).length;

                $scope.vm.isAllSelected = $scope.lstdate.every(function (itm) {
                    return itm.IsPresent;
                }) == true ? 1 : 0;
            });
        }, 100);
    }

    $scope.toggleAllHalfDay = function () {
        var toggleStatus = $scope.vm.isAllHalfDay == 1 ? 1 : 0;
        if ($scope.vm.isAllSelected == 0 && $scope.vm.isAllHalfDay == 1) {
            var alertPopup = $ionicPopup.alert({
                title: '',
                template: "Employee must be Present For Half Day",
                cssClass: 'custPop',
                okText: 'Ok',
                okType: 'btn btn-green',
            });
            $scope.vm.isAllHalfDay = 0;
        } else {
            angular.forEach($scope.lstdate, function (itm) { itm.IsHalfDay = toggleStatus; });
            $scope.HalfDays = $filter('filter')($scope.lstdate, { IsHalfDay: 1 }).length;
        }
    }

    $scope.optionHalfDayToggled = function (o) {
        setTimeout(function () {
            $scope.$apply(function () {
                if (o.IsPresent == 0 && o.IsHalfDay == 1) {
                    var alertPopup = $ionicPopup.alert({
                        title: '',
                        template: "Employee must be Present For Half Day",
                        cssClass: 'custPop',
                        okText: 'Ok',
                        okType: 'btn btn-green',
                    });
                    o.IsHalfDay = 0;
                } else {
                    $scope.vm.isAllHalfDay = $scope.lstdate.every(function (itm) {
                        return itm.IsHalfDay;
                    }) == true ? 1 : 0;
                    $scope.HalfDays = $filter('filter')($scope.lstdate, { IsHalfDay: 1 }).length;
                }
            });
        }, 100);
    }

    $scope.AddAllRow = function () {
        if ($scope.model.idUser != "" && $scope.model.AttendenceMonth != undefined && $scope.model.AttendenceMonth != "" && $scope.model.AttendenceMonth != null && $scope.model.AttendenceYear != undefined && $scope.model.AttendenceYear != '' && $scope.model.AttendenceYear != null) {

            var startDate = $rootScope.convertdate(new Date(parseInt($scope.model.AttendenceYear), parseInt($scope.model.AttendenceMonth), 1), "sdt");
            var endDate = $rootScope.convertdate(new Date(parseInt($scope.model.AttendenceYear), parseInt($scope.model.AttendenceMonth) + 1, 0), "edt");
            var param = {
                idUser: $scope.model.idUser,
                Month: $scope.model.AttendenceMonth,
                Year: $scope.model.AttendenceYear,
                startdate: new Date(startDate),
                enddate: new Date(endDate)
            };

            $http.get($rootScope.RoutePath + "employee/GetEmployeeAttendenceByIdEmployee", { params: param }).then(function (data) {
                $scope.lstEmpAtten = data.data;
                var now = new Date();
                var fDay = null,
                    lDay = null;
                if ($scope.model.AttendenceMonth != undefined && $scope.model.AttendenceMonth != "" && $scope.model.AttendenceMonth != null && $scope.model.AttendenceYear != undefined && $scope.model.AttendenceYear != '' && $scope.model.AttendenceYear != null) {
                    $scope.lstdate = [];
                    fDay = new Date(parseInt($scope.model.AttendenceYear), parseInt($scope.model.AttendenceMonth), 1, now.getHours(), now.getMinutes(), now.getSeconds());

                    lDay = new Date(parseInt($scope.model.AttendenceYear), parseInt($scope.model.AttendenceMonth) + 1, 0, now.getHours(), now.getMinutes(), now.getSeconds());

                    for (var d = fDay; d <= lDay; d.setDate(d.getDate() + 1)) {
                        $scope.lstdate.push({ id: 0, idEmpAttendenceMst: 0, AttendenceDate: new Date(d), AttendenceDay: days[d.getDay()], IsPresent: 0, IsHalfDay: 0 });
                    }
                }

                if ($scope.lstEmpAtten.length > 0) {
                    if ($scope.flgEdit == true) {
                        for (var i = 0; i < $scope.lstEmpAtten.length; i++) {
                            for (var j = 0; j < $scope.lstdate.length; j++) {
                                if ($filter('date')(new Date($scope.lstEmpAtten[i].AttendenceDate), 'dd-MM-yyyy') == $filter('date')(new Date($scope.lstdate[j].AttendenceDate), 'dd-MM-yyyy')) {
                                    $scope.lstdate[j].id = $scope.lstEmpAtten[i].id;
                                    $scope.lstdate[j].idEmpAttendenceMst = $scope.lstEmpAtten[i].idEmpAttendenceMst;
                                    $scope.lstdate[j].IsPresent = $scope.lstEmpAtten[i].IsPresent;
                                    $scope.lstdate[j].IsHalfDay = $scope.lstEmpAtten[i].IsHalfDay;
                                    $scope.optionToggled($scope.lstdate[j]);
                                }
                            }
                        }
                        $scope.model.id = $scope.lstEmpAtten[0].idEmpAttendenceMst;
                        $scope.model.idUser = $scope.lstEmpAtten[0].idUser.toString();
                    } else {
                        var alertPopup = $ionicPopup.alert({
                            title: '',
                            template: "Attendance Already Exist",
                            cssClass: 'custPop',
                            okText: 'Ok',
                            okType: 'btn btn-green',
                        });
                        $scope.model.AttendenceMonth = "";
                        $scope.model.AttendenceYear = "";
                    }
                } else {
                    $scope.model.id = 0;
                }
                $scope.TotalDays = $scope.lstdate.length;
                $scope.AbsentDays = $filter('filter')($scope.lstdate, { IsPresent: 0 }).length;
                $scope.PresentDays = $filter('filter')($scope.lstdate, { IsPresent: 1 }).length;
                $scope.HalfDays = $filter('filter')($scope.lstdate, { IsHalfDay: 1 }).length;
            });
        }
    }

    $scope.EditAttendanceById = function (o) {
        $scope.model.idUser = o.idUser.toString();
        $scope.model.AttendenceMonth = (o.idMonth).toString();
        $scope.model.AttendenceYear = (o.idYear).toString();
        $scope.flgEdit = true;
        $scope.flag = true;
        $scope.AddAllRow();
        $rootScope.BackButton = false;

    }

    $scope.GetAllEmployee = function () {
        $http.get($rootScope.RoutePath + "employee/GetAllEmployee").then(function (data) {
            $scope.lstEmployee = data.data;
        })
    }

    $scope.GetAllEmployeeAttendence = function () {
        $http.post($rootScope.RoutePath + "employee/GetAllEmployeeAttendence", {}).then(function (data) {
            for (var i = 0; i < data.data.length; i++) {
                data.data[i].TotalPresentDays -= data.data[i].TotalHalfDays;
            }
            $scope.pendlist = data.data;
            setTimeout(function () {
                InitDataTable();
            }, 10)
        })
    }

    $scope.CreateEmpAttenDetails = function (form) {

        if (form.$invalid) {
            $scope.FormEMPSubmit = true;
            return;
        }
        $scope.FormEMPSubmit = false;
        var params = {
            Mstdetail: $scope.model,
            Attendetail: $scope.lstdate
        };
        $rootScope.ShowLoader();
        $http.post($rootScope.RoutePath + "employee/SaveEmployeeAttendence", params).then(function (res) {
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
        }).catch(function (err) {
            setTimeout(function () {
                $ionicLoading.hide()
            }, 1000);
        });
    };

    $scope.FilterData = function () {
        if ($scope.Searchmodel.Search != '' && $scope.Searchmodel.Search != null && $scope.Searchmodel.Search != undefined) {
            $('#EMPAttendenceTable').dataTable().fnFilter($scope.Searchmodel.Search);
        } else {
            $('#EMPAttendenceTable').dataTable().fnFilter("");
        }
    }

    //Reload DataTable
    function InitDataTable() {
        $(document).ready(function () {
            setTimeout(function () {
                $('#EMPAttendenceTable').DataTable({
                    "responsive": true,
                    "dom": 'rt<"bottom"<"left"<"length"l><"info"i>><"right"<"pagination"p>>>',
                    "lengthMenu": [
                        [10, 25, 50, -1],
                        [10, 25, 50, "All"]
                    ],
                    "pageLength": 10,
                    language: {
                        "emptyTable": "No Data Found"
                    },
                    columnDefs: [{
                        bSortable: false,
                        aTargets: [-1]
                    }]
                });
            });
        })
    }

    $scope.resetForm = function () {
        $scope.FormEMPSubmit = false;
    }

    $scope.gotoList = function () {
        $scope.model = {
            id: 0,
            idUser: "",
            AttendenceMonth: "",
            AttendenceYear: "",
        };

        $scope.vm.isAllSelected = 0;
        $scope.vm.isAllHalfDay = 0;
        $scope.lstdate = [];
        $scope.Searchmodel = {
            Search: '',
        }
        $scope.flgEdit = false;
        $scope.flag = false;

        $scope.GetAllEmployee();
        $scope.GetAllEmployeeAttendence();

        var now = new Date();
        var firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
        var lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        for (var d = firstDay; d <= lastDay; d.setDate(d.getDate() + 1)) {
            $scope.lstdate.push({ id: 0, idUser: 0, AttendenceDate: new Date(d), IsPresent: 0, IsHalfDay: 0 });
        }
        $scope.TotalDays = $scope.lstdate.length;
        $scope.AbsentDays = $filter('filter')($scope.lstdate, { IsPresent: 0 }).length;
        $scope.PresentDays = $filter('filter')($scope.lstdate, { IsPresent: 1 }).length;
        $scope.HalfDays = $filter('filter')($scope.lstdate, { IsHalfDay: 1 }).length;
        $rootScope.BackButton = true;
    }

    function Reset() {
        $scope.resetForm();
        $scope.vm.isAllSelected = 0;
        $scope.vm.isAllHalfDay = 0;
        $scope.init();
        $scope.flag = true;
        $rootScope.BackButton = false;
    }

    $rootScope.ResetAll = function () {
        $scope.gotoList();
    }

    $scope.clearSearchTerm = function () {
        $scope.searchdropdown = {
            searchEmployee: '',
        }
        $scope.vm.searchTermYear = '';
        $scope.vm.searchTermMonth = '';
    };

    $rootScope.convertdate = function (date1, flg) {
        var date = new Date(date1);
        var firstdayMonth = date.getMonth() + 1;
        var firstdayDay = date.getDate();
        var firstdayYear = date.getFullYear();
        var firstdayHours = date.getHours();
        var firstdayMinutes = date.getMinutes();
        var firstdaySeconds = date.getSeconds();
        if (flg == 1) {
            return ("00" + firstdayHours.toString()).slice(-2) + ":" + ("00" + firstdayMinutes.toString()).slice(-2) + ":" + ("00" + firstdaySeconds.toString()).slice(-2);
        } else if (flg == 2) {
            return ("0000" + firstdayYear.toString()).slice(-4) + "-" + ("00" + firstdayMonth.toString()).slice(-2) + "-" + ("00" + firstdayDay.toString()).slice(-2);
        } else if (flg == "sdt") {
            return ("0000" + firstdayYear.toString()).slice(-4) + "-" + ("00" + firstdayMonth.toString()).slice(-2) + "-" + ("00" + firstdayDay.toString()).slice(-2) + " " + ("00").toString().slice(-2) + ':' + ("00").toString().slice(-2) + ':' + ("00").toString().slice(-2);
        } else if (flg == "edt") {
            return ("0000" + firstdayYear.toString()).slice(-4) + "-" + ("00" + firstdayMonth.toString()).slice(-2) + "-" + ("00" + firstdayDay.toString()).slice(-2) + " " + ("23").toString().slice(-2) + ':' + ("59").toString().slice(-2) + ':' + ("59").toString().slice(-2);
        } else {
            return ("00" + firstdayDay.toString()).slice(-2) + "/" + ("00" + firstdayMonth.toString()).slice(-2) + "/" + ("0000" + firstdayYear.toString()).slice(-4);
        }
    }

    // $rootScope.ResetAll = $scope.gotoList();
    $scope.init();
})