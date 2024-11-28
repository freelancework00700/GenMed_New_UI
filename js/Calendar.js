app.controller('CalendarController', function ($scope, $ionicLoading, $http, $rootScope, $localstorage, $ionicModal, $ionicPopup, $timeout) {

    $rootScope.BackButton = true;
    $scope.init = function () {
        ManageRole();
        $scope.Initmodel();
        $scope.events = [
            []
        ];
        $ionicLoading.show({ template: "Loading" });
        $scope.GetAllNotes(function () {
            InitCalendar();
        });
    }

    function ManageRole() {
        var AdminUser = _.filter(JSON.parse($localstorage.get('UserRoles')), function (Role) {
            return Role == "Admin";
        })
        $scope.IsAdmin = AdminUser.length && AdminUser.length > 0 ? true : false;
    }

    $scope.Initmodel = function () {
        $scope.model = {
            id: '',
            Title: '',
            FromDate: '',
            ToDate: '',
            idUser: $localstorage.get('UserId'),
            Notes: '',
            isActive: true,
            MarkAsComplete: false,
        }
    }

    $scope.GetAllNotes = function (callback) {
        $http.get($rootScope.RoutePath + 'calendar/GetAllNotes').then(function (res) {
            $scope.lstNotes = res.data.data;
            $scope.events[0] = [];
            for (var i = 0; i < $scope.lstNotes.length; i++) {
                var NotesFromDate = new Date($scope.lstNotes[i].FromDate);
                var NotesToDate = new Date($scope.lstNotes[i].ToDate);
                $scope.AddDataCalendar(NotesFromDate, NotesToDate, $scope.lstNotes[i].Title, $scope.lstNotes[i].Notes, $scope.lstNotes[i].id, $scope.lstNotes[i].idUser, $scope.lstNotes[i].isActive, $scope.lstNotes[i].MarkAsComplete);
            };
            return callback();
        });
    }


    $scope.AddDataCalendar = function (eventstartdate, eventsenddate, title, Notes, id, idUser, isActive, MarkAsComplete) {
        var d = eventstartdate.getDate();
        var m = eventstartdate.getMonth();
        var y = eventstartdate.getFullYear();
        var d1 = eventsenddate.getDate();
        var m1 = eventsenddate.getMonth();
        var y1 = eventsenddate.getFullYear();
        $scope.events[0].push({
            id: id,
            idUser: idUser,
            title: title,
            Notes: Notes,
            start: new Date(y, m, d),
            end: new Date(y1, m1, d1),
            isActive: isActive,
            className: MarkAsComplete == 1 ? 'CompletedEvent' : isActive == 1 ? 'ActiveEvent' : "UnActiveEvent",
            MarkAsComplete: MarkAsComplete,
        });

    }


    function InitCalendar() {
        /* config ui object */
        setTimeout(function () {
            $scope.calendarUiConfig = {
                calendar: {
                    editable: false,
                    eventLimit: false,
                    height: 650,
                    header: '',
                    handleWindowResize: true,
                    aspectRatio: 1,
                    dayNames: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
                    dayNamesShort: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
                    viewRender: function (view) {
                        $scope.calendarView = view;
                        $scope.calendar = $scope.calendarView.calendar;
                    },
                    columnFormat: {
                        month: 'ddd',
                        week: 'ddd D',
                        day: 'ddd M'
                    },
                    eventClick: eventDetail,
                    selectable: true,
                    selectHelper: true,
                    select: select,
                    next: next,
                    prev: prev


                }

            };
            $ionicLoading.hide();
        }, 500)
    }


    function eventDetail(calendarEvent, e) {
        if (!$scope.IsAdmin) {
            return
        }
        $scope.model.id = calendarEvent.id;
        $scope.model.idUser = calendarEvent.idUser;
        $scope.model.isActive = calendarEvent.isActive == 1 ? true : false;
        $scope.model.MarkAsComplete = calendarEvent.MarkAsComplete == 1 ? true : false;
        $scope.model.FromDate = new Date(calendarEvent.start);
        $scope.model.ToDate = calendarEvent.end ? new Date(calendarEvent.end) : new Date(calendarEvent.start);
        $scope.model.Title = calendarEvent.title;
        $scope.model.Notes = calendarEvent.Notes;
        $scope.OpenModel('Edit', calendarEvent.start, calendarEvent.end, e);
    }

    function select(start, end, e) {
        if (!$scope.IsAdmin) {
            return
        }
        $scope.Initmodel();
        $scope.model.FromDate = new Date(start);
        $scope.model.ToDate = new Date(end);
        $scope.OpenModel('add', start, end, e);

    }

    function next() {
        $scope.calendarView.calendar.next();

    }

    function prev() {
        $scope.calendarView.calendar.prev();


    }
    $scope.Next = function () {
        next();
    }
    $scope.Prev = function () {
        prev();
    }

    //Manage Notes
    $ionicModal.fromTemplateUrl('Notes.html', {
        scope: $scope,
        animation: 'slide-in-up'
    }).then(function (modal) {
        $scope.modal = modal;
    });
    $scope.OpenModel = function (Type, start, end, e) {
        $scope.formsubmit = false
        $scope.Type = Type == 'add' ? 'Add Note' : "Edit Note";
        $scope.modal.show();
    };
    $scope.closeModal = function () {
        $scope.modal.hide();
    }; // Cleanup the modal when we're done with it!

    $scope.$on('$destroy', function () {
        $scope.modal.remove();
    })
    $scope.formsubmit = false
    $scope.SaveNotes = function (form) {

        if (form.$invalid) {
            $scope.formsubmit = true;
        } else {
            if (!$scope.model.id) {
                $scope.model.id = 0;
            }
            $scope.formsubmit = false;
            $rootScope.ShowLoader();
            $http.post($rootScope.RoutePath + 'calendar/CreateNotes', $scope.model)
                .then(function (res) {
                    $ionicLoading.show({ template: res.data.message });
                    setTimeout(function () {
                        $ionicLoading.hide()
                    }, 1000);
                    if (res.data.data == 'TOKEN') {
                        $rootScope.logout();
                    }
                    $ionicLoading.show({ template: res.data.message });
                    setTimeout(function () {
                        $ionicLoading.hide()
                    }, 1000);
                    if (res.data.success) {
                        var ObjNotes = res.data.data;
                        if ($scope.model.id == 0) {
                            $scope.AddDataCalendar(new Date(ObjNotes.FromDate), new Date(ObjNotes.ToDate), ObjNotes.Title, ObjNotes.Notes, ObjNotes.id, ObjNotes.idUser, ObjNotes.isActive, ObjNotes.MarkAsComplete);
                            $('#calendarView').fullCalendar('removeEvents');
                            $('#calendarView').fullCalendar('addEventSource', $scope.events[0]);
                        } else {
                            for (var i = 0; i < $scope.events[0].length; i++) {
                                // Update
                                if ($scope.events[0][i].id === ObjNotes.id) {
                                    var eventstartdate = new Date(ObjNotes.FromDate);
                                    var d = eventstartdate.getDate();
                                    var m = eventstartdate.getMonth();
                                    var y = eventstartdate.getFullYear();
                                    var eventenddate = new Date(ObjNotes.ToDate);
                                    var d1 = eventenddate.getDate();
                                    var m1 = eventenddate.getMonth();
                                    var y1 = eventenddate.getFullYear();
                                    $scope.events[0][i] = {
                                        id: ObjNotes.id,
                                        idUser: ObjNotes.idUser,
                                        title: ObjNotes.Title,
                                        Notes: ObjNotes.Notes,
                                        start: new Date(y, m, d),
                                        end: new Date(y1, m1, d1),
                                        isActive: ObjNotes.isActive,
                                        className: ObjNotes.MarkAsComplete == 1 ? 'CompletedEvent' : ObjNotes.isActive == 1 ? 'ActiveEvent' : "UnActiveEvent",
                                        MarkAsComplete: ObjNotes.MarkAsComplete,
                                    }
                                    break;
                                }
                            }
                            $('#calendarView').fullCalendar('removeEvents');
                            $('#calendarView').fullCalendar('addEventSource', $scope.events[0]);

                        }
                        $scope.closeModal();
                        // $scope.init();
                    }

                })
                .catch(function (err) {
                    $ionicLoading.show({ template: 'Unable to save record right now. Please try again later.' });
                    setTimeout(function () {
                        $ionicLoading.hide()
                    }, 1000);
                });

        }
    };

    $scope.DeleteNotes = function (id) {
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
                return $http.get($rootScope.RoutePath + 'calendar/DeleteNotes', {
                    params: { id: id }
                }).then(function (res) {
                    if (res.data.data == 'TOKEN') {
                        $rootScope.logout();
                    }
                    $ionicLoading.show({ template: res.data.message });
                    setTimeout(function () {
                        $ionicLoading.hide()
                    }, 1000);
                    if (res.data.success) {
                        if ($scope.events[0].length == 1) {
                            $scope.events[0] = [];
                        } else {
                            $scope.events[0] = _.without($scope.events[0], _.findWhere($scope.events[0], {
                                id: parseInt(id)
                            }));
                        }
                        $('#calendarView').fullCalendar('removeEvents');
                        $scope.closeModal();
                        $scope.init();
                    }
                })
                    .catch(function (err) {
                        $ionicLoading.show({ template: 'Unable to save record right now. Please try again later.' });
                        setTimeout(function () {
                            $ionicLoading.hide()
                        }, 1000);
                    });
            }

        });
    }
    $scope.init();
});