var right_div_width = $(document).width()/2;

$(document).ready(function () {
    $('#right').width(right_div_width);
    js_layout_resize();
    $('#jsupermap').SaladoPlayerJSSuperMap({
        higlight_callback: jsgm_out_setPanorama,
        setOpen_callback: jsgm_out_setOpen,
        showRadar: true
    });
});

$(window).resize(function () {
    js_layout_resize();
});

// passes initial configuration
function jsgm_out_init(JSONstring) {
    $('#jsupermap').SaladoPlayerJSSuperMap('configure', JSONstring);
}

// on every camera move - notify js radar to change position
function jsgm_out_radarCallback(fov, pan) {
    $('#jsupermap').SaladoPlayerJSSuperMap('redraw_radar', fov, pan);
}

// highlights current waypoint
function jsgm_out_setPanorama(id) {
    $('#jssupermap').SaladoPlayerJSSuperMap('higlight', id);
}

// toggles a map if SP button pressed
function jsgm_out_setOpen(value) {
    if (value == true) {
        $('#right').width(right_div_width);
        $('#right').css('display', 'block');
        $('#map_canvas').width($('#right').width());
        $('#map_canvas').height($('#right').height());
    } else {
        $('#right').width(0);
        $('#right').css('display', 'none');
    }
    js_layout_resize();
}

function js_layout_resize() {
    $('#center').height($(window).height() - $('#header').outerHeight() - $('#footer').outerHeight());
    if ($('#right') && $('#right').css('display') == 'block') {
        $('#content').width($('#center').innerWidth() - $('#right').outerWidth() - 20);
        $('#right').height($('#center').innerHeight());
    } else {
        $('#content').width($('#center').innerWidth() - 20);
    }
    $('#content').height($('#center').innerHeight());
}