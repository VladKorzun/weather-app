define(['jquery','backbone','appModels/weather','appPrototypes/date'], function ($, Backbone, weather) {

    var OpenweathermapList = Backbone.Collection.extend({

        model: weather,

        initialize: function () {

            var today = new Date().unixtime();

            var weekAgo = today - 6 * 24 * 60 * 60;

            this.url = "http://api.openweathermap.org/data/2.5/history/city?q=Cherkasy&start="
            + weekAgo + "&end=" + today;

            this.collectionReady = false;

            this.fetch();

        },

        fetch: function () {

            var collection = this;

            $.ajax({

                url: this.url,

                dataType: "jsonp",

                success: function (json) {

                    collection.parse(json);

                }
            });

        },

        parse: function (data) {

            var collection = this;

            var dataList = data.list;

            var dataLength = dataList.length;

            var cachedDate = new Date(new Date().getTime() - 6 * 24 * 60 * 60 * 1000).yyyymmdd();

            var cachedTemperature = [];

            var cachedHumidity = [];

            var cachedPrecipitation = [0];

            var cacheData = function (data) {

                cachedTemperature.push(data.main.temp - 273.15);

                cachedHumidity.push(data.main.humidity);

                if (data.hasOwnProperty('rain')) {

                    cachedPrecipitation.push(data.rain['3h']);

                }

                else if (data.hasOwnProperty('snow')) {

                    cachedPrecipitation.push(data.snow['3h']);

                }
            };

            var addModel = function () {

                var model = {};

                model.date = cachedDate;

                model.temperature = +(cachedTemperature.reduce(function (a, b) {
                    return a + b;
                }) / cachedTemperature.length).toFixed();

                cachedTemperature = [];

                model.humidity = +(cachedHumidity.reduce(function (a, b) {
                    return a + b;
                }) / cachedHumidity.length).toFixed();

                cachedHumidity = [];

                model.precipitations = +cachedPrecipitation.reduce(function (a, b) {
                    return a + b;
                });

                cachedPrecipitation = [0];

                collection.add(model);

            };

            var unixTimeToYYYYMMDD = function (unixTime) {

                return new Date(unixTime * 1000).yyyymmdd();

            };

            for (var i = 0; i < dataLength; i++) {

                var node = dataList[i];

                var date = unixTimeToYYYYMMDD(node.dt);

                if (date === cachedDate) {

                    cacheData(node);

                }

                else {

                    addModel();

                    cachedDate = date;

                    cacheData(node);

                }

            }

            addModel();

            this.collectionReady = true;

            this.trigger("collection:ready");

        }
    });

    return OpenweathermapList;

});