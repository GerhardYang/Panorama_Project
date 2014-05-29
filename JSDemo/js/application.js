$(document).ready(function () {
    var map, layer, markerLayer;
    var infowin = null;
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
    map.setCenter(new SuperMap.LonLat(12957390.244503, 4852481.697025), 12);

    /**
     * 加载场景，这里加载场景的方式明显有一定的修改，是为了适应当前应用
     * 可以进行适当修改
     */
    $.ajax({
        url: "./config/sceneConfig.xml",
        dataType: "xml",
        type: "get",
        error: function (xml) {
            alert("加载XML 文件出错！");
        },
        success: function (xml) {
            $(xml).find("scene").each(function (i) {
                var name = $(this).attr("name");
                var lon = $(this).attr("lon");
                var lat = $(this).attr("lat");
                var discription = $(this).attr("discription");

                /**
                 * 如果经纬度不为空则在地图上添加marker
                 */
                if (lon !== "" && lat !== "") {
                    var marker = new SuperMap.Marker(
                        new SuperMap.LonLat(lon, lat),
                        new SuperMap.Icon("./img/marker_on.png", size)
                    )
                    marker.events.on({
                        "click": function () {
                            closeInfoWin();
                            var marker = this;
                            var lonlat = marker.getLonLat();
                            var contentHTML = "<div id='" + name + "_divShow' class='pano_divShow' style='width: 400px;height: 200px'>";
                            contentHTML += "</div>";
                            var popup = new SuperMap.Popup.FramedCloud("popwin",
                                lonlat,
                                new SuperMap.Size(405, 210),
                                contentHTML,
                                null,
                                true);
                            popup.autoSize = false;
                            infowin = popup;
                            map.addPopup(popup);
                            addPanoToDiv(name, name + "_divShow");
                        }
                    });
                    markerLayer.addMarker(marker);
                }

                /**
                 * 添加场景节点
                 */
                $("#imgList").append(
                    "<li class='pano_img_li' id='" + name + "'>" +
                        "<a href='#'>" +
                        "<img class='pano_img' src='thumbnails/" + name + ".png' alt='" + name + "'>" +
                        "</a>" +
                        "</li>"
                );

                /**
                 * 对节点添加单击事件，以便单击的时候连接到响应的场景里边去
                 */
                addEventListenerToItem(name);
                /**
                 * 定义BootStrap效果
                 */
                $("#" + name).popover({
                    html: true,
                    placement: "bottom",
                    trigger: "hover",
                    title: "单击进入场景" + name,
                    delay: {show: 500, hide: 50},
                    content: "<p>" + discription + "</p>"
                })
            });
        }
    });

    function closeInfoWin() {
        if (infowin) {
            try {
                infowin.hide();
                infowin.destroy();
            }
            catch (e) {
            }
        }
    }

    function addEventListenerToItem(name) {
        $("#" + name).on("click", function () {
            $("#closePano").css("display", "block");
            $("#map").css("display", "none");
            addPanoToDiv(name, "SaladoPlayerDiv")
        });
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
        $("#closePano").css("display", "none");
        $("#map").css("display", "block");
    });
})