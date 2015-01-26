require.config({
    baseUrl: 'js/libs',
    paths: {
        jquery:         'jquery/dist/jquery.min',
        backbone:       'backbone/backbone',
        underscore:     'underscore/underscore-min',
        Chart:          'chartjs/Chart.min',
        appModels:      '../models',
        appCollections: '../collections',
        appViews:       '../views',
        appPrototypes:  '../prototypes'
    },
    shim: {
        jquery: {
            exports: '$'
        },
        backbone: {
            deps: ['jquery', 'underscore'],
            exports: 'Backbone'
        },
        underscore: {
            exports: '_'
        },
        Chart: {
            exports: 'Chart'
        }
    }
});

require(["jquery", "appCollections/weatherdata", "appViews/appview"], function ($, WeatherData, AppView) {

    $(document).ready(function() {

        var app = new AppView;

    });

});