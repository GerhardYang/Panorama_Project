$(document).ready(function () {
    //这里对map进行了定义，否则IE8出错
    var map, layer, markerLayer,infowin=null;
    var size = new SuperMap.Size(35, 41);
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
            click: function () {
            }
        }
    }
    map = new SuperMap.Map("map", myOptions);

    layer = new SuperMap.Layer.CloudLayer();
    markerLayer = new SuperMap.Layer.Markers("Markers");//创建一个有标签的图层
    map.addLayers([layer, markerLayer]);
    map.setCenter(new SuperMap.LonLat(12969403.985571, 4863800.1255398), 18);


    /**
     * 加载场景，这里加载场景的方式明显有一定的修改，是为了适应当前应用
     * 可以进行适当修改
     */
    $.ajax({
        url: "./config/sceneConfig.xml",
        dataType: "xml",
        type: "get",
        error: function (xml) {
            alert("加载sceneConfig.xml文件出错！");
        },
        success: function () {
            var marker = new SuperMap.Marker(
                new SuperMap.LonLat(12969403.985571, 4863800.1255398),
                new SuperMap.Icon("./img/marker_on.png", size)
            )
            marker.events.on({
                "click": function () {
                    $("#closePano").css("visibility", "visible");
                    $("#map").css("display", "none");
                    addPanoToDiv("sceneConfig", "SaladoPlayerDiv");
                },
                "mouseover": function(){
                    showInfoWin(this,"北京超图软件");
                },
                "mouseout": function(){
                    closeInfoWin();
                }
            });
            markerLayer.addMarker(marker);
        }
    });

    /**
     * 加载园区中心场景
     */
    $.ajax({
        url: "./config/yuanquzhongxin.xml",
        dataType: "xml",
        type: "get",
        error: function (xml) {
            alert("加载yuanquzhongxin.xml文件出错！");
        },
        success: function () {
            var marker = new SuperMap.Marker(
                new SuperMap.LonLat(12969426.686865, 4863649.5801215),
                new SuperMap.Icon("./img/marker_off.png", size)
            )
            marker.events.on({
                "click": function () {
                    $("#closePano").css("visibility", "visible");
                    $("#map").css("display", "none");
                    addPanoToDiv("yuanquzhongxin", "SaladoPlayerDiv");
                },
                "mouseover": function(){
                    showInfoWin(this,"园区中心");
                },
                "mouseout": function(){
                    closeInfoWin();
                }
            });
            markerLayer.addMarker(marker);
        }
    });

    /**
     * 加载超图南侧场景
     */
    $.ajax({
        url: "./config/yuanquximen.xml",
        dataType: "xml",
        type: "get",
        error: function (xml) {
            alert("加载yuanquximen.xml文件出错！");
        },
        success: function () {
            var marker = new SuperMap.Marker(
                new SuperMap.LonLat(12969403.985571, 4863756.5387927),
                new SuperMap.Icon("./img/marker_off.png", size)
            )
            marker.events.on({
                "click": function () {
                    $("#closePano").css("visibility", "visible");
                    $("#map").css("display", "none");
                    addPanoToDiv("yuanquximen", "SaladoPlayerDiv");
                },
                "mouseover": function(){
                    showInfoWin(this,"超图南侧");
                },
                "mouseout": function(){
                    closeInfoWin();
                }
            });
            markerLayer.addMarker(marker);
        }
    });

    function showInfoWin(that,text){
        var dom = "<div style='font-size: 14px; font-family: '微软雅黑' color: #000000;border: 0.5px solid #000000'>" + text + "</div>";
        //设置x与y的像素偏移量，不影响地图浏览；
        var xOff = (1 / map.getScale()) * 20000;
        var yOff = -(1 / map.getScale()) * (-40000);
        var pos = new SuperMap.LonLat(that.lonlat.lon+xOff, that.lonlat.lat+yOff);
        infowin = new SuperMap.Popup("chicken",
            pos,
            new SuperMap.Size(100, 20),
            dom,
            false, null);
        map.addPopup(infowin);
    }

    function closeInfoWin() {
        if (infowin) {
            try {
                map.removePopup(infowin)
            }
            catch (e) {
            }
        }
    }

    function addPanoToDiv(name, playerDiv) {
        var swfVersionStr = "11.1.0";
        // To use express install, set to playerProductInstall.swf, otherwise the empty string.
        var xiSwfUrlStr = "playerProductInstall.swf";
        var flashvars = {
            xml: "./config/" + name + ".xml"
        };
        var params = {
            quality: "high",
            bgcolor: "#ffffff",
            allowscriptaccess: "sameDomain",
            allowfullscreen: "true",
            wmode: "direct"
        };
        var attributes = {};
        swfobject.embedSWF(
            "./viewer/SaladoPlayer-1.3.5.swf", playerDiv,
            $("#" + playerDiv).width(), $("#" + playerDiv).height(),
            swfVersionStr, xiSwfUrlStr,
            flashvars, params, attributes);
            // JavaScript enabled so display the flashContent div in case it is not replaced with a swf object.
            swfobject.createCSS("#" + playerDiv, "display:block;text-align:left;");
    }

    /**
     * 关闭全景代码
     */
    $("#closePano").on("click", function () {
        $("#SaladoPlayerDiv").css("display", "none");
        $("#closePano").css("visibility", "hidden");
        $("#map").css("display", "block");
    });
})