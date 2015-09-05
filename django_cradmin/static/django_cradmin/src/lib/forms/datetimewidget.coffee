app = angular.module 'djangoCradmin.forms.datetimewidget', []


app.directive 'djangoCradminDatetimeSelector', [
  'djangoCradminCalendarApi'
  (djangoCradminCalendarApi) ->

    return {
      scope: {
        config: "=djangoCradminDatetimeSelector"
      }
      templateUrl: 'forms/dateselector.tpl.html'

      controller: ($scope, $element) ->
        $scope.page = null

        ###
        Called when a users selects a date using the mobile-only <select>
        menu to select a day.
        ###
        $scope.onSelectDayNumber = ->
          $scope.monthlyCaledarCoordinator.handleCurrentDayObjectChange()
          return

        ###
        Called when a user selects a date by clicking on a day
        in the calendar table.
        ###
        $scope.onClickCalendarDay = (calendarDay) ->
          $scope.monthlyCaledarCoordinator.handleCalendarDayChange(calendarDay)
          if $scope.config.include_time
            $scope.showPage2()
          else
            $scope.applySelectedValue()
          return

        ###
        Called when a users selects a month using the month <select>
        menu.
        ###
        $scope.onSelectMonth = ->
          $scope.monthlyCaledarCoordinator.handleCurrentMonthChange()
          return

        ###
        Called when a users selects a year using the year <select>
        menu.
        ###
        $scope.onSelectYear = ->
          $scope.monthlyCaledarCoordinator.handleCurrentYearChange()
          return

        ###
        Called when a users selects an hour using the hour <select>
        menu.
        ###
        $scope.onSelectHour = ->
          $scope.monthlyCaledarCoordinator.handleCurrentHourChange()
          return

        ###
        Called when a users selects a minute using the minute <select>
        menu.
        ###
        $scope.onSelectMinute = ->
          $scope.monthlyCaledarCoordinator.handleCurrentMinuteChange()
          return

        ###
        Called when a user clicks the "Use" button on the date page.
        ###
        $scope.onClickUseDate = ->
          if $scope.config.include_time
            console.log 'Select time'
          else
            $scope.applySelectedValue()
          return

        ###
        Called when a user clicks the "Use" button on the time page.
        ###
        $scope.onClickUseTime = ->
          $scope.applySelectedValue()
          console.log 'Apply'
          return

        $scope.applySelectedValue = ->
          $scope.destinationField.val($scope.monthlyCaledarCoordinator.getDestinationFieldValue())
          $scope.previewElement.html($scope.monthlyCaledarCoordinator.selectedDateMomentObject.format('llll'))
          $scope.hide()

        $scope.showPage1 = ->
          $scope.page = 1

        $scope.showPage2 = ->
          $scope.page = 2

        $scope.hide = ->
          $scope.page = null

        $scope.initialize = ->
          currentDateIsoString = $scope.destinationField.val()
          if currentDateIsoString? and currentDateIsoString != ''
            currentDateMomentObject = moment(currentDateIsoString)
            $scope.triggerButton.html($scope.config.buttonlabel)
          else
            currentDateMomentObject = moment()  # Fallback to current date
            $scope.triggerButton.html($scope.config.buttonlabel_novalue)

          $scope.monthlyCaledarCoordinator = new djangoCradminCalendarApi.MonthlyCalendarCoordinator(
            currentDateMomentObject)

      link: ($scope, $element) ->
        if $scope.config.destinationfieldid?
          $scope.destinationField = angular.element("#" + $scope.config.destinationfieldid)
          if $scope.destinationField.length == 0
            console?.error? "Could not find the destinationField element with ID: #{$scope.config.destinationfieldid}"
        else
          console?.error? "The destinationField config is required!"
          return

        if $scope.config.triggerbuttonid?
          $scope.triggerButton = angular.element("#" + $scope.config.triggerbuttonid)
          if $scope.triggerButton.length > 0
            $scope.triggerButton.on 'click', ->
              $scope.showPage1()
              $scope.$apply()
              return
          else
            console?.warn? "Could not find the triggerButton element with ID: #{$scope.config.triggerbuttonid}"

        if $scope.config.previewid?
          $scope.previewElement = angular.element("#" + $scope.config.previewid)
          if $scope.previewElement.length == 0
            console?.warn? "Could not find the previewElement element with ID: #{$scope.config.previewid}"

        $scope.initialize()
        return
    }
]
