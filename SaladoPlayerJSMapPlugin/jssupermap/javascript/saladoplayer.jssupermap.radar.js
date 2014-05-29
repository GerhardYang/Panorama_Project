(function ($) {

    var position = {
        fov: 90,
        pan: 0
    }

    var style = {
        fillOpacity: 0.4,
        fillColor: "#ffffff",
        strokeColor: "#737373",
        strokeWidth: 1
    }

    var r = null;

    var methods = {
        // 插件初始化
        init: function (options) {
            if (options && options.style) {
                $.extend(style, options.style);
            }
            methods.build(options.marker);
        },

        build: function (marker) {
            function ol(_marker) {
                this.marker = _marker;
                this.position = _marker.lonlat;
                this.map = _marker.map;
                //这里通过Marker的map属性获取到矢量图层，用来添加我们的矢量图，
                // 其中Vectors与添加图层的时候矢量图的名字是对应的
                this.vectorLayer = _marker.map.getLayersByName("Radar")[0];
            }

            /**
             * 绘制雷达以及重新绘制雷达的位置
             */
            ol.prototype.drawRadar = function (marker) {
                if(marker)
                {
                    this.rsolution = marker.map.getResolutionForZoom(marker.map.zoom);
                    this.position = marker.lonlat;
                }
                else
                {
                    this.rsolution = this.marker.map.getResolutionForZoom(this.marker.map.zoom);
                }
                //首先绘制一个圆形
                this.vectorLayer.removeAllFeatures();
                var point = new SuperMap.Geometry.Point(this.position.lon, this.position.lat);
                var polygonFeature = methods.drawCircle(point, 40, this.rsolution);
                var PolygonCurve = methods.drawCurve(point, 60, position.fov, position.pan, this.rsolution);
                this.vectorLayer.addFeatures([polygonFeature, PolygonCurve]);
            }

            r = new ol(marker);
        },

        /**
         * 绘制圆形
         * @param point
         * @param r
         * @returns {SuperMap.Feature.Vector}
         */
        drawCircle: function (point, radius, resolution) {
            if(resolution == undefined)
            {
                resolution = 1;
            }
            var pointList = [];
            for (var i = 0; i < 360; i ++) {
                var newPoint = new SuperMap.Geometry.Point(
                    x = Math.cos(Math.PI / 180 * i) * radius * resolution + point.x ,
                    y = Math.sin(Math.PI / 180 * i) * radius * resolution + point.y
                )
                pointList.push(newPoint);
            }
            var linearRing = new SuperMap.Geometry.LinearRing(pointList);
            var polygonFeature = new SuperMap.Feature.Vector(new SuperMap.Geometry.Polygon([linearRing]));
            polygonFeature.style = style;
            return polygonFeature;
        },

        /**
         * 绘制扇形
         * @param point
         * @param radius
         * @param fov
         * @param pan
         * @returns {SuperMap.Feature.Vector}
         */
        drawCurve: function (point, radius, fov, pan, resolution) {
            if(resolution == undefined)
            {
                resolution = 1;
            }
            pan = 90 - (pan + fov/2);
            var pointList = [];
            for (var i = pan; i < (pan + fov); i++) {
                var newPoint = new SuperMap.Geometry.Point(
                    x = Math.cos(Math.PI / 180 * i) * radius * resolution + point.x,
                    y = Math.sin(Math.PI / 180 * i) * radius * resolution + point.y
                )
                pointList.push(newPoint);
            }
            pointList.push(point);
            var linearRing = new SuperMap.Geometry.LinearRing(pointList);
            var curveFeature = new SuperMap.Feature.Vector(new SuperMap.Geometry.Polygon([linearRing]));
            curveFeature.style = style;
            return curveFeature;
        },

        /**
         * 在bind的时候调用了methods.init函数
         * 在对应Marker的位置绘制一个雷达
         * @param marker
         */
        bind: function (marker) {
            if (r == null) {
                methods.init({marker: marker});
            }
            if (r != null) {
                r.drawRadar(marker);
            }
        },

        /**
         * 重新绘制雷达图形
         * @param fov
         * @param pan
         */
        refresh: function (fov, pan) {
            position.fov = fov;
            position.pan = pan;
            r.drawRadar();
        }
    };

    // 这里是JQ插件的入口
    $.fn.SaladoPlayerJSSuperMapRadar = function (method) {
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method ' + method + ' does not exist on jQuery.tooltip');
        }
    };
})(jQuery);