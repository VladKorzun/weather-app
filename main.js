jQuery(function($) {

    Date.prototype.yyyymmdd = function() {

        var yyyy = this.getFullYear().toString();
        var mm = (this.getMonth()+1).toString();
        var dd  = this.getDate().toString();

        return yyyy + '-' + (mm[1]?mm:"0"+mm[0]) + '-' + (dd[1]?dd:"0"+dd[0]);
    };

    Date.prototype.unixtime = function() {
        return Math.round(this.getTime() / 1000 );
    };

    var weather = Backbone.Model.extend({

        defauts: {
            date: "",
            temperature: 0,
            humidity: 0,
            precipitations: 0
        }

    });

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

                url : this.url,

                dataType : "jsonp",

                success : function(json) {

                    collection.parse(json);

                }
            });

        },

        parse: function (data) {

            var weather = data.data.weather;

            var weatherLength = weather.length;

            for ( var i = 0; i < weatherLength; i++ ) {

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

    var OpenweathermapList = Backbone.Collection.extend({

        model: weather,

        initialize: function () {

            var today =  new Date().unixtime();

            var weekAgo = today - 6 * 24 * 60 * 60;

            this.url = "http://api.openweathermap.org/data/2.5/history/city?q=Cherkasy&start="
            + weekAgo + "&end=" + today;

            this.collectionReady = false;

            this.fetch();

        },

        fetch: function () {

            var collection = this;

            $.ajax({

                url : this.url,

                dataType : "jsonp",

                success : function(json) {

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

                model.temperature = +(cachedTemperature.reduce(function(a, b){
                    return a + b ;
                }) / cachedTemperature.length).toFixed();

                cachedTemperature = [];

                model.humidity = +(cachedHumidity.reduce(function(a, b){
                    return a + b ;
                }) / cachedHumidity.length).toFixed();

                cachedHumidity = [];

                model.precipitations = +cachedPrecipitation.reduce(function(a, b) {
                    return a + b ;
                });

                cachedPrecipitation = [0];

                collection.add(model);

            };

            var unixTimeToYYYYMMDD = function(unixTime) {

                return new Date(unixTime*1000).yyyymmdd();

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

                for ( var i = 0; i < length; i++) {

                    var date = "";

                    var temperature = ((firstList[i].temperature + secondList[i].temperature)/2).toFixed();

                    var humidity = ((firstList[i].humidity + secondList[i].humidity)/2).toFixed();

                    var precipitations = ((firstList[i].precipitations + secondList[i].precipitations)/2).toFixed();

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

    var weatherData = new WeatherData;

    var weatherTableView = Backbone.View.extend({

        el: $('[data-table]'),

        tagName: "table",

        template: _.template($('[data-table-template]').html()),

        collection: weatherData,

        initialize: function () {

            this.collection.on('data:ready', this.render, this);
            
        },
        
        render: function () {

            $('[data-loading]').hide("slow");

            this.$el.html(this.template({weather: this.collection.toJSON()}));

        }

    });

    var temperatureView = Backbone.View.extend({

        el: $('[data-temperature]'),

        tagName: "canvas",

        template: $('[data-canvas-template]').html(),

        collection: weatherData,

        initialize: function () {

            this.collection.on('data:ready', this.render, this);

        },

        render: function () {

            this.$el.html(this.template);

            var temperatures = this.collection.pluck("temperature").map(Number);

            var temperatureData = {

                labels: this.collection.pluck("date"),

                datasets: [

                    {

                        fillColor: "rgba(220,220,220,0.2)",

                        strokeColor: "rgba(220,220,220,1)",

                        pointColor: "rgba(220,220,220,1)",

                        pointStrokeColor: "#fff",

                        pointHighlightFill: "#fff",

                        pointHighlightStroke: "rgba(220,220,220,1)",

                        data: temperatures

                    }
                ]

            };

            var max = _.max(temperatures) + 1;

            var min = _.min(temperatures) - 1;

            var steps = max - min;

            var ctx = $("[data-temperature] canvas").get(0).getContext("2d");

            var temperatureChart = new Chart(ctx).Line(temperatureData, {

                scaleOverride: true,

                scaleSteps: steps,

                scaleStepWidth: 1,

                scaleStartValue: min });

        }

    });

    var humidityView = Backbone.View.extend({

        el: $('[data-humidity]'),

        tagName: "canvas",

        template: $('[data-canvas-template]').html(),

        collection: weatherData,

        initialize: function () {

            this.collection.on('data:ready', this.render, this);

        },

        render: function () {

            this.$el.html(this.template);

            var humidity = this.collection.pluck("humidity").map(Number);

            var humidityData = {

                labels: this.collection.pluck("date"),

                datasets: [

                    {
                        fillColor: "rgba(220,220,220,0.2)",

                        strokeColor: "rgba(220,220,220,1)",

                        pointColor: "rgba(220,220,220,1)",

                        pointStrokeColor: "#fff",

                        pointHighlightFill: "#fff",

                        pointHighlightStroke: "rgba(220,220,220,1)",

                        data: humidity
                    }
                ]

            };

            var max = _.max(humidity) + 1;

            var min = _.min(humidity) - 1;

            var steps = max - min;

            var ctx = $("[data-humidity] canvas").get(0).getContext("2d");

            var humidityChart = new Chart(ctx).Line(humidityData, {

                scaleOverride: true,

                scaleSteps: steps,

                scaleStepWidth: 1,

                scaleStartValue: min });

        }

    });

    var precipitationsView = Backbone.View.extend({

        el: $('[data-precipitations]'),

        tagName: "canvas",

        template: $('[data-canvas-template]').html(),

        collection: weatherData,

        initialize: function () {

            this.collection.on('data:ready', this.render, this);

        },

        render: function () {

            this.$el.html(this.template);

            var precipitations = this.collection.pluck("precipitations").map(Number);

            var precipitationsData = {

                labels: this.collection.pluck("date"),

                datasets: [

                    {
                        fillColor: "rgba(220,220,220,0.2)",

                        strokeColor: "rgba(220,220,220,1)",

                        pointColor: "rgba(220,220,220,1)",

                        pointStrokeColor: "#fff",

                        pointHighlightFill: "#fff",

                        pointHighlightStroke: "rgba(220,220,220,1)",

                        data: precipitations
                    }
                ]

            };

            var max = _.max(precipitations) + 1;

            var min = _.min(precipitations) - 1;

            var steps = max - min;

            var ctx = $("[data-precipitations] canvas").get(0).getContext("2d");

            var precipitationsChart = new Chart(ctx).Line(precipitationsData, {

                scaleOverride: true,

                scaleSteps: steps,

                scaleStepWidth: 1,

                scaleStartValue: min });

        }

    });

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

    var App = new AppView;
    
});