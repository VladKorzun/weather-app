define(['jquery','backbone','appCollections/data', 'appViews/weathertableview', 'appViews/temperatureview',

'appViews/humidityview', 'appViews/precipitationsview'], function ($, Backbone, weatherData, weatherTableView,

temperatureView, humidityView, precipitationsView) {

    var AppView = Backbone.View.extend({

        el: $('[data-weather-app]'),

        collection: weatherData,

        initialize: function () {

            weatherData.fetch();

            this.collection.on('data:ready', this.addViews(), this);

        },

        addTableView: function () {

            var view = new weatherTableView;

        },

        addTemperatureView: function () {

            var view = new temperatureView;

        },

        addHumidityView: function () {

            var view = new humidityView;

        },

        addPrecipitationsView: function () {

            var view = new precipitationsView;

        },

        addViews: function () {

            this.addTableView();

            this.addTemperatureView();

            this.addHumidityView();

            this.addPrecipitationsView();

        }

    });

    return AppView;

});