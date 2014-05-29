(function ($) {

    // 默认设置
    var SaladoPlayerJSSuperMapSettings = {
        'player_name': 'player',
        'higlight_callback': null,
        'setOpen_callback': null,
        'icon_off': null,
        'icon_on': null,
        'radar_style': {},
        'visibility': true
    };

    //状态
    var SaladoPlayerJSSuperMapState = {
        'parent': null,
        'points': [],
        'markers': [],
        'tracks': [],
        'layers': []
    }

    var disabled = false
        , map
        , markerLayer
        , vectorLayer
        , layer
        , size = new SuperMap.Size(35, 41)

    var methods = {
        //插件初始化
        init: function (options) {
            SaladoPlayerJSSuperMapState.parent = $(this);
            $(SaladoPlayerJSSuperMapState.parent).fadeOut(0);
            // 默认设置
            //将设置追加到options中
            if (options) {
                $.extend(SaladoPlayerJSSuperMapSettings, options);
            }
        },

        configure: function (JSONstring) {
            var config = eval('(' + JSONstring + ')');
            $.each(config.data.waypoints, function (index, waypoint) {
                var obj = {};
                obj.id = waypoint.target;
                obj.lat = waypoint.lat;
                obj.lng = waypoint.lng;
                obj.title = waypoint.label;
                SaladoPlayerJSSuperMapState.points.push(obj);
            });

            $.each(config.data.tracks, function (index, track) {
                SaladoPlayerJSSuperMapState.tracks.push(track.path);
            });

            SaladoPlayerJSSuperMapSettings.icon_on = config.data.markers.markerOn;
            SaladoPlayerJSSuperMapSettings.icon_off = config.data.markers.markerOff;

            methods.build();
        },

        // build map with track and points
        build: function () {
            if (disabled) {
                return;
            }
            var myOptions = {
                controls: [
                    new SuperMap.Control.ScaleLine(),
                    new SuperMap.Control.LayerSwitcher(),
                    new SuperMap.Control.Zoom(),
                    new SuperMap.Control.Navigation({
                        dragPanOptions: {
                            enableKinetic: true
                        }
                    })],
                eventListeners: {
                    "zoomend": function () {
                        if (SaladoPlayerJSSuperMapSettings.storeFov!=undefined && SaladoPlayerJSSuperMapSettings.storePan!=undefined) {
                            methods.redraw_radar(SaladoPlayerJSSuperMapSettings.storeFov, SaladoPlayerJSSuperMapSettings.storePan);
                        }
                    }
                }
            }
            map = new SuperMap.Map("map_canvas", myOptions);

            //初始化图层
            layer = new SuperMap.Layer.CloudLayer();
            markerLayer = new SuperMap.Layer.Markers("Markers");//创建一个有标签的图层
            vectorLayer = new SuperMap.Layer.Vector("Radar");//包含雷达图形的图层

            map.addLayers([layer, markerLayer, vectorLayer]);
            map.setCenter(new SuperMap.LonLat(11339634.286396, 4588716.5813769), 4);
            //points节点解析部分
            for (var i = 0; i < SaladoPlayerJSSuperMapState.points.length; i++) {
                var marker = new SuperMap.Marker(
                    new SuperMap.LonLat(
                        SaladoPlayerJSSuperMapState.points[i].lng,
                        SaladoPlayerJSSuperMapState.points[i].lat
                    ),
                    new SuperMap.Icon(SaladoPlayerJSSuperMapSettings.icon_off, size, new SuperMap.Pixel(-(size.w / 2), -size.h))
                );

                marker.map = map;
                //为每个Marker添加事件
                marker.events.on({
                    "click": methods.openInfoWin
                });
                markerLayer.addMarker(marker);
                SaladoPlayerJSSuperMapState.markers.push(marker);
            }
            if (SaladoPlayerJSSuperMapSettings.visibility) {
                if (SaladoPlayerJSSuperMapSettings.setOpen_callback != null) {
                    SaladoPlayerJSSuperMapSettings.setOpen_callback(true);
                }
            } else {
                if (SaladoPlayerJSSuperMapSettings.setOpen_callback != null) {
                    SaladoPlayerJSSuperMapSettings.setOpen_callback(false);
                }
            }
        },

        openInfoWin: function () {
            for (var key in SaladoPlayerJSSuperMapState.markers) {
                if (SaladoPlayerJSSuperMapState.markers[key] == this) {
                    methods.run(key);
                }
            }
        },

        // higlight waypoint
        higlight: function (id) {
            if (disabled) {
                return;
            }
            for (var key in SaladoPlayerJSSuperMapState.markers) {
                if (SaladoPlayerJSSuperMapState.points[key].id == id) {
                    if (SaladoPlayerJSSuperMapSettings.showRadar) {
                        SaladoPlayerJSSuperMapState.markers[key].setUrl(SaladoPlayerJSSuperMapSettings.icon_on);
                        $('#map_canvas').SaladoPlayerJSSuperMapRadar('bind', SaladoPlayerJSSuperMapState.markers[key]);
                    }
                    map = SaladoPlayerJSSuperMapState.markers[key].map;
                    map.setCenter(SaladoPlayerJSSuperMapState.markers[key].lonlat);
                } else {
                    SaladoPlayerJSSuperMapState.markers[key].setUrl(SaladoPlayerJSSuperMapSettings.icon_off);
                }
            }
        },

        redraw_radar: function (fov, pan) {
            if (disabled) {
                return;
            }
            if (SaladoPlayerJSSuperMapSettings.showRadar) {
                $('#map_canvas').SaladoPlayerJSSuperMapRadar('refresh', fov, pan);
                SaladoPlayerJSSuperMapSettings.storeFov = fov;
                SaladoPlayerJSSuperMapSettings.storePan = pan;
            }
        },

        // run SaladoPlayer action
        run: function (key) {
            if (disabled) {
                return;
            }
            id = SaladoPlayerJSSuperMapState.points[key].id;
            document.getElementById(SaladoPlayerJSSuperMapSettings.player_name).jsgm_in_loadPano(id);
            if (SaladoPlayerJSSuperMapSettings.higlight_callback != null) {
                SaladoPlayerJSSuperMapSettings.higlight_callback(id);
            }
        }
    };

    // Method calling logic
    $.fn.SaladoPlayerJSSuperMap = function (method) {
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method ' + method + ' does not exist on jQuery.tooltip');
        }
    };
})(jQuery);
