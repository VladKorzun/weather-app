define(['jquery','backbone','Chart','appCollections/data'], function ($, Backbone, Chart, weatherData) {

    var temperatureView = Backbone.View.extend({

        el: $('[data-temperature]'),

        tagName: "canvas",

        template: $('[data-canvas-template]'),

        collection: weatherData,

        initialize: function () {

            this.collection.on('data:ready', this.render, this);

        },

        render: function () {

            this.$el.append(this.template);

            var temperatures = this.collection.pluck("temperature").map(Number);

            var temperatureData = {

                labels: this.collection.pluck("date"),

                datasets: [

                    {

                        fillColor: "rgba(191, 240, 142, 1)",

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

                scaleStartValue: min
            });

        }

    });

    return temperatureView;

});