define(['jquery','backbone','appModels/weather','appPrototypes/date'], function ($, Backbone, weather) {

    var WorldweatheronlineList = Backbone.Collection.extend({

        model: weather,

        initialize: function () {

            this.collectionReady = false;

            var today = new Date().yyyymmdd();

            var weekAgo = new Date(new Date().getTime() - 6 * 24 * 60 * 60 * 1000).yyyymmdd();

            this.url = "http://api.worldweatheronline.com/free/v2/past-weather.ashx?q=Cherkasy&format=json&date="
            + weekAgo + "&enddate=" + today + "&tp=24&key=cb1fee2febca1ea344caedf0ffbb0";

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

            var weather = data.data.weather;

            var weatherLength = weather.length;

            for (var i = 0; i < weatherLength; i++) {

                var model = {};

                var node = weather[i];

                var weatherNode = node.hourly[0];

                model.date = node.date;

                model.temperature = +weatherNode.tempC;

                model.humidity = +weatherNode.humidity;

                model.precipitations = +weatherNode.precipMM;

                this.add(model);

            }

            this.collectionReady = true;

            this.trigger("collection:ready");

        }


    });

    return WorldweatheronlineList;

});