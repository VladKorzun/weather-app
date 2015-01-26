define(['jquery','backbone','appModels/weather','appCollections/openweathermap','appCollections/worldweatheronline'],
    function ($, Backbone, weather, OpenweathermapList, WorldweatheronlineList) {

    var WeatherData = Backbone.Collection.extend({

        model: weather,

        fetch: function () {

            this.openweathermapList = new OpenweathermapList;

            this.worldweatheronineList = new WorldweatheronlineList;

            this.openweathermapList.on("collection:ready", this.mergeCollections, this);

            this.worldweatheronineList.on("collection:ready", this.mergeCollections, this);

        },

        mergeCollections: function () {

            if (this.openweathermapList.collectionReady && this.worldweatheronineList.collectionReady) {

                var firstList = this.openweathermapList.toJSON();

                var secondList = this.worldweatheronineList.toJSON();

                if (firstList.length === secondList.length) {

                    var length = firstList.length;

                }

                else {

                    throw "Data is out of sync";

                }

                for (var i = 0; i < length; i++) {

                    var date = "";

                    var temperature = ((firstList[i].temperature + secondList[i].temperature) / 2).toFixed();

                    var humidity = ((firstList[i].humidity + secondList[i].humidity) / 2).toFixed();

                    var precipitations = ((firstList[i].precipitations + secondList[i].precipitations) / 2).toFixed();

                    if (firstList[i].date === secondList[i].date) {

                        date = firstList[i].date

                    }

                    else {

                        throw "Data is out of sync";

                    }

                    this.add({

                        date: date,

                        temperature: temperature,

                        humidity: humidity,

                        precipitations: precipitations

                    });

                }

                this.trigger("data:ready");

            }

        }

    });

    return WeatherData;

});