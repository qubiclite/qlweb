class QliteExceptionWrapper extends Qlite {

    constructor(ql_api_url) {
        error_wrap_object(super(ql_api_url));
    }

    _send(request, callback) {
        super._send(request, function (res, err) {
            if (err) {
                console.log(err);
                handle_error("ERROR: '" + err['statusText'] + "' (full error report in your browser console)");
            }
            else if(!res['success']) {
                handle_error(res['error']);
                err = res;
                res = null;
            }
            callback(res, err);
        });
    }
}

function error_wrap_method(method) {

    return function () {
        try {
            return fn.apply(this, this.arguments);
        } catch (err) {
            handle_error(err);
        }
    };
}

function error_wrap_object (object) {
    for (var x in object)  {
        if (typeof(object[x]) === "function") {
            object[x] = error_wrap_method(object[x]);
        }
    }
};

function handle_error(err) {
    toastr.error(err);
}

const QLITE = new QliteExceptionWrapper(window.location.origin);

list_oracles();
list_qubics();
list_qapps();

setInterval(function(){
list_oracles();
list_qubics();
}, 60000);

const registered_intervals = new Map();

function register_interval(owner_id, func, timeout) {
    if(!registered_intervals.has(owner_id))
        registered_intervals.set(owner_id, setInterval(func, timeout));
}

function unregister_interval(owner_id) {
    clearTimeout(registered_intervals.get(owner_id));
    registered_intervals.delete(owner_id);
}

function close_window(window_id) {
    $('#window_' + window_id).addClass('hidden');
}

function open_window(window_id) {
    unblock_form('#window_'+window_id+' form');
    $('#window_' + window_id).removeClass('hidden');
}

function iam_delete(iam_id) {
    QLITE.iam_delete(function () {
        iam_list();
    }, iam_id);
}

function fetch_epoch() {
    block_form('#window_fe form');
    var $scroll = $('#window_fe .scroll');
    $scroll.html("");

    var qubic = $('#form_fe_qubic_id').val();
    var min_epoch = parseInt($('#form_fe_min_epoch').val());
    var max_epoch = parseInt($('#form_fe_max_epoch').val());

    if(isNaN(max_epoch) || max_epoch < min_epoch)
        max_epoch = min_epoch;

    QLITE.fetch_epoch(function (res, err) {

        res['fetched_epochs'].forEach(function(fetched_epoch) {
            $scroll.append(generate_epoch_box(fetched_epoch));
        });
        unblock_form('#window_fe form');

        if(res['last_completed_epoch'] < max_epoch) {
            if(res['last_completed_epoch'] < 0)
                toastr.warning("no epoch has completed yet");
            else
                toastr.warning('no epoch > #'+res['last_completed_epoch'] + " has completed yet");
        }

    }, qubic, min_epoch, max_epoch);
}

function qubic_read() {
    var $box = $('#window_qr .box');
    $box.html("");
    block_form('#window_qr form');

    var qubic = $('#form_qr_qubic_id').val();

    QLITE.qubic_read( function(res, err) {
        unblock_form('#window_qr form');
        if(err) return;

        var es = res['execution_start'];
        var hpd = res['hash_period_duration'];
        var rpd = res['result_period_duration'];
        var rl = res['runtime_limit'];

        var running = Math.round(new Date().getTime()/1000-es);
        var epoch = Math.floor(running / (hpd+rpd));

        var text = "VERSION:          " + res['version'];
        text += "<br/>EXECUTION START:  " + unix_to_date(es) + " ("+running+"s, UNIX: "+es+(epoch < 0 ? ")" : ", EPOCH: #"+epoch+")");
        text += "<br/>EPOCH DURATION:   " + (hpd+rpd)+"s (hash period: "+hpd+"s, result period: "+rpd+"s, QLVM runtime limit: "+rl+"s)";

        const $box_content = $('<div>').html(text);

        let assembly = "";
        res['assembly_list'].forEach(function (oracle) { assembly += oracle + "\n"; });
        $box_content.append($('<details>').html(assembly).append($('<summary>').html('assembly')));

        $box_content.append($('<details>').html(res['code']).append($('<summary>').html('code')));

        $box.append($box_content);
    }, qubic);
}

function iam_read() {

    $box = $('#window_ir .box');
    $box.html("");
    block_form('#window_ir form');

    var iam_id = $('#form_ir_iam_id').val();
    var index = parseInt($('#form_ir_index').val());

    QLITE.iam_read(function (resp, err) {
        if(resp)
            $box.html(JSON.stringify(resp['read']));
        if(err)
            toastr.warning("error");
        unblock_form('#window_ir form');
    }, iam_id, index);
}

function iam_list() {
    QLITE.iam_list(function (resp) {
        $scroll = $('#window_il .scroll');
        $scroll.html("");
        resp['list'].forEach(function(id) {
            $scroll.append(generate_iam_box(id));
        });
        $('#iam_stream_amount').html(resp['list'].length);
    });
}

function oracle_create() {
    var qubic = $('#form_oc_qubic_id').val();

    block_form('#window_oc form');
    QLITE.oracle_create(function (res, err) {
        unblock_form('#window_oc form');
        list_oracles();
        if(res) close_window("oc");
    }, qubic);
}

function iam_write() {

    var id = $('#form_iw_iam_id').val();
    var index = parseInt($('#form_iw_index').val());
    var message;

    try {
        message = JSON.parse($('#form_iw_message').val());
    } catch(e) {
        toastr.error("the message cannot be parsed to a json object. only json objects can be written into iam streams.");
        return;
    }

    block_form('#window_iw form');
    QLITE.iam_write(function (res, err) {
        close_window("iw");
        unblock_form('#window_iw form');
    }, id, index, message);
}

function qubic_test() {

    block_form('#window_qt form');
    var epoch = parseInt($('#form_qt_epoch').val());
    var code = $('#form_qt_code').val();

    QLITE.qubic_test(function (resp, err) {
        $('#window_qt .box').html(resp['result']);
        unblock_form('#window_qt form');
    }, code, epoch ? epoch : 0);
}

function qubic_create() {

    var execution_start = parseInt($('#form_qc_execution_start').val());
    var hash_period_duration = parseInt($('#form_qc_hash_period_duration').val());
    var result_period_duration = parseInt($('#form_qc_result_period_duration').val());
    var runtime_limit = parseInt($('#form_qc_runtime_limit').val());
    var code = $('#form_qc_code').val();

    block_form('#window_qc form');
    QLITE.qubic_create(function (err, resp) {
        list_qubics();
        close_window('qc');
        unblock_form('#window_qc form');
        }, execution_start ? execution_start : 300,
        hash_period_duration ? hash_period_duration : 20,
        result_period_duration ? result_period_duration : 10,
        runtime_limit ? runtime_limit : 10,
        code);
}

function iam_create() {

    block_form('#window_il form');
    QLITE.iam_create(function (resp, err) {
        unblock_form('#window_il form');
        if(resp) iam_list();
    });
}

function change_node() {
    var mwm = $('#form_cn_is_testnet').prop("checked") ? 9 : 14;
    var node_address = $('#form_cn_node_address').val();
    block_form('#window_cn form');
    QLITE.change_node(function (res, err) {
        if(res)
            close_window('cn')
        unblock_form('#window_cn form');
    }, node_address, mwm);
}

function qubic_assemble() {

    var assembly = [];
    var qubic = $('#form_qla_qubic_id').val();

    $('#assembly_list .box').each(function( index ) {

        if($(this).find('.assembly_checkbox').prop("checked"))
            assembly.push($(this).attr('id').substring(6));
    });

    QLITE.qubic_assemble(function () {
        close_window("qla");
    }, qubic, assembly);
}

function write_iam_form(id) {
    $('#form_iw_iam_id').val(id);
    unblock_form('#window_iw form');
    open_window("iw");
}

function delete_oracle(oracle) {
    QLITE.oracle_delete(function (res, err) {
        if(res) $('#oracle_'+oracle).remove();
    }, oracle);
}

function qubic_delete(qubic) {
    QLITE.qubic_delete(function (res, err) {
        if(res) $('#qubic_'+qubic).remove();
    }, qubic);
    unregister_interval(qubic);
}

function pause_oracle(oracle) {
    QLITE.oracle_pause(function (res, err) {
        if(res) {
            $('#oracle_'+oracle + " .pause_button").addClass("hidden");
            $('#oracle_'+oracle + " .restart_button").removeClass("hidden");
        }
    }, oracle);
}

function restart_oracle(oracle) {
    QLITE.oracle_restart(function (res, err) {
        if(res) {
            $('#oracle_'+oracle + " .pause_button").removeClass("hidden");
            $('#oracle_'+oracle + " .restart_button").addClass("hidden");
        }
    }, oracle);
}

function qubic_details(qubic_id) {
    open_window("qr");
    $('#form_qr_qubic_id').val(qubic_id);
    qubic_read();
}

function list_oracles() {
    const $ORACLE_SCROLL = $('#oracle_view .scroll');
    $ORACLE_SCROLL.html("");

    QLITE.oracle_list(function (resp, err) {
        var html = "";
        resp['list'].forEach(function(oracle) {
            $ORACLE_SCROLL.append(generate_oracle_box(oracle));
        });
    });
}

function list_qubics() {
    const $QUBIC_SCROLL = $('#qubic_view .scroll');
    $QUBIC_SCROLL.html("");

    QLITE.qubic_list(function (res, err) {

        var html = "";
        res['list'].forEach(function(qubic) {

            const spec = qubic['specification'];
            const epoch_duration = spec['hash_period_duration'] + spec['result_period_duration'];
            const time_running = new Date() / 1000 - spec['execution_start'];
            const epoch_age = time_running % epoch_duration;

            const correct_progress_bar = function () {
                const time_running = new Date() / 1000 - spec['execution_start'];
                const epoch_age = time_running % epoch_duration;
                const $bar = $('#qubic_' + qubic['id'] + " .progress_bar .bar");

                $bar.css("width", (epoch_age / epoch_duration * 100)+"%");
                $bar.animate({ width: "100%", }, (epoch_duration-epoch_age) * 1000, "linear");

                var epoch = Math.floor(time_running/epoch_duration);
                $('#qubic_' + qubic['id'] + ' .epoch').html(epoch);
            };

            $QUBIC_SCROLL.append(generate_qubic_box(qubic));

            unregister_interval(qubic['id']);
            setTimeout( function () {
                unregister_interval(qubic['id']);
                register_interval(qubic['id'], correct_progress_bar, epoch_duration*1000);
                correct_progress_bar();
            }, (epoch_duration-epoch_age)*1000+200);

            correct_progress_bar();
        });

    });
}

function install_app(app_id) {

    const url = $('#app_url').val();

    $('#qapps').html("");
    QLITE.app_install(function(res, err) {
        list_qapps();
    }, url);
}

function uninstall_app(app_id) {

    QLITE.app_uninstall(function(res, err) {
        list_qapps();
    }, app_id);
}

function load_qapp(name) {
    $('#page_qapp iframe').attr("src", "qapps/"+name+"/index.html");
    $('nav').addClass("hidden");
    $('footer').addClass("hidden");
    $('#page_qapp_list').addClass("hidden");
    $('#page_qapp').removeClass("hidden");
}

function list_qapps() {
    QLITE.app_list(function (res, err) {
        if(err) return;

        var $qapps = $('#qapps');
        $qapps.html("");
        res['list'].forEach(function(element) {
            details = "";
            var qapp = $("<div class='qapp'></div>");

            qapp.append($("<img src='qapps/"+element['id']+"/imgs/thumbnail.png'>"));

            var details = $("<div class='details'></div>");
            details.append($("<div class='title'></div>").text(element['title']));
            details.append($("<div class='description'></div>").text(element['description']));
            details.append($("<a class='website' href='"+element['url']+"' target='_blank'></a>").text(element['url']));
            details.append($("<div class='license'></div>").text(element['license']));
            details.append('<a class="button" href="qapps/'+element['id']+'/" target="_blank"> open</a>');
            details.append('<div class="button" onclick="uninstall_app(\''+element['id']+'\')">uninstall</div>');
            qapp.append(details);

            $qapps.append(qapp);
        })
    });
}

// TODO
function block_form(form_identifier) {
    $(form_identifier + " input[type=button]").addClass('hidden');
}

// TODO
function unblock_form(form_identifier) {
    $(form_identifier + " input[type=button]").removeClass('hidden');
}

function generate_oracle_box(oracle) {

    const oracle_id = oracle['id'];
    const state = oracle['state'];
    const qubic = oracle['qubic'];

    var box = "<div class='box oracle_box' id='oracle_"+oracle_id+"'><div class='entity_id'>"+oracle_id+"</div>"
        + "<div class='entity_property'>qubic: "+qubic+"</div>"
        + "<div class='entity_property'>state: "+state+"</div>"
        +"<div class='inline_button delete_button' onclick='delete_oracle(\""+oracle_id+"\");'> delete</div>";

    if(state == 'running')
        box += "<div class='inline_button   pause_button' onclick='  pause_oracle(\""+oracle_id+"\")'>  pause</div>";
    else if(state == 'paused')
        box += "<div class='inline_button restart_button' onclick='restart_oracle(\""+oracle_id+"\")'>restart</div>";

    box += "</div>";

    const $box = $('<div>', {class: 'box', id: 'oracle_'+oracle_id});
    const $box_head = $('<div>', {class: 'box_head'});

    const icon = new Identicon(md5(oracle_id), 64).toString();
    $box_head.append('<img class="identicon" width=64 height=64 src="data:image/png;base64,' + icon + '">');
    $box_head.append($('<div>', {class: 'entity_id'}).html(oracle_id));
    $box_head.append($('<div>', {class: 'entity_property'}).html('qubic: ' + qubic));
    $box_head.append($('<div>', {class: 'entity_property'}).html('state: ' + state));
    $box.append($box_head);

    $box.append($('<div>', {class: 'inline_button delete_button'}).html('delete')
        .attr('onclick', 'delete_oracle("'+oracle_id+'");'));
    $box.append($('<div>', {class: 'inline_button export_button'}).html('export')
        .attr('onclick', 'entity_export("'+oracle_id+'");'));
    if(state == 'running')
        $box.append($('<div>', {class: 'inline_button pause_button'}).html('pause')
            .attr('onclick', 'pause_oracle("'+oracle_id+'");'));
    else if(state == 'paused')
        $box.append($('<div>', {class: 'inline_button restart_button'}).html('restart')
            .attr('onclick', 'restart_oracle("'+oracle_id+'");'));

    return $box;
}

function generate_iam_box(iam_id) {

    const $box = $('<div>', {class: 'box', id: 'iam_'+iam_id});
    const $box_head = $('<div>', {class: 'box_head'});

    const icon = new Identicon(md5(iam_id), 64).toString();
    $box_head.append('<img class="identicon" width=64 height=64 src="data:image/png;base64,' + icon + '">');
    $box_head.append($('<div>', {class: 'entity_id'}).html(iam_id));
    $box.append($box_head);

    $box.append($('<div>', {class: 'inline_button delete_button'}).html('delete')
        .attr('onclick', 'iam_delete("'+iam_id+'");'));
    $box.append($('<div>', {class: 'inline_button export_button'}).html('export')
        .attr('onclick', 'entity_export("'+iam_id+'");'));
    $box.append($('<div>', {class: 'inline_button write_button'}).html('write')
        .attr('onclick', 'write_iam_form("'+iam_id+'");'));

    return $box;
}

function generate_qubic_box(qubic) {

    const qubic_id = qubic['id'];
    const state = qubic['state'];

    const $box = $('<div>', {class: 'box', id: 'qubic_'+qubic_id});
    const $box_head = $('<div>', {class: 'box_head'});

    const icon = new Identicon(md5(qubic_id), 64).toString();
    $box_head.append('<img class="identicon" width=64 height=64 src="data:image/png;base64,' + icon + '">');
    $box_head.append($('<div>', {class: 'entity_id'}).html(qubic_id));
    $box_head.append($('<div>', {class: 'entity_property'}).html('state: ' + state));
    $box_head.append($('<div>', {class: 'entity_property'}).html('epoch: <label class="epoch"></label>'));
    $box_head.append($('<div>', {class: 'progress_bar'}).append($('<div>', {class: 'bar'})));

    $box.append($box_head);
    $box.append($('<div>', {class: 'inline_button delete_button'}).html('delete')
        .attr('onclick', 'qubic_delete("'+qubic_id+'");'));
    $box.append($('<div>', {class: 'inline_button export_button'}).html('export')
        .attr('onclick', 'entity_export("'+qubic_id+'");'));
    $box.append($('<div>', {class: 'inline_button details_button'}).html('details')
        .attr('onclick', 'qubic_details("'+qubic_id+'");'));
    if(state == 'assembly phase')
        $box.append($('<div>', {class: 'inline_button assembly_button'}).html('applications')
            .attr('onclick', 'qubic_list_applications("'+qubic_id+'");'));

    return $box;
}


function entity_export(id) {
    QLITE.export(function (res, err) {
        $('#window_ex .box').html(res['export']);
        open_window("ex");
    }, id);
}

function entity_import() {
    const encoded = $('#form_im_encoded').val();
    QLITE.import(function (res, err) {
        if(res) {
            list_oracles();
            list_qubics();
            close_window("im");
            toastr.success("entity imported");
        }
    }, encoded);
}

// credits to https://stackoverflow.com/a/30905277 (modified)
function copy_to_clipboard(text) {
    const $temp = $("<input>");
    $("body").append($temp);
    $temp.val(text).select();
    document.execCommand("copy");
    $temp.remove();
    toastr.success("copied to clipbard");
}

function generate_application_box(qubic_id, application) {

    var oracle_id = application['oracle_id'];
    var oracle_name = application['oracle_name'];

    box = "<div class='box' id='qubic_"+oracle_id+"'><div class='entity_id'>"+oracle_id+"</div>"
        + "<div class='entity_property'>name: "+oracle_name+"</div>"
        + "<div class='checkbox_container'><input type='checkbox' class='assembly_checkbox' /> <label>include into assembly</label></div></div>";

    return box;
}

function generate_epoch_box(epoch) {

    var quorum = epoch['quorum'];
    var quorum_max = epoch['quorum_max'];
    var result = epoch['result'] ? epoch['result'] : undefined;

    var box = "<div class='box'><div class='epoch'>epoch #"+epoch['epoch']+" (quorum: "+quorum+"/"+quorum_max+", "+(quorum == 0 ? 0 : 100.0*quorum/quorum_max).toFixed(1)+"%)</div>";
    if(result !== undefined)
        box += "<div class='epoch_result'>"+result+"</div>";
    box += "</div>";

    return box;
}
function qubic_list_applications(qubic) {

    var $scroll = $('#window_qla .scroll');

    QLITE.qubic_list_applications(function (res, err) {

        if(err) return;

        $scroll.html("");
        $('#application_amount').html(res['list'].length);

        res['list'].forEach(function(application) {
            $scroll.append(generate_application_box(qubic, application));
        });

        $('#form_qla_qubic_id').val(qubic);
        open_window("qla");
    }, qubic);
}

function open_create_oracle_form() {
    unblock_form('#window_oc form');
    $('#window_oc').removeClass('hidden');
}

function open_create_qubic_form() {
    unblock_form('#window_qc form');
    $('#window_qc').removeClass('hidden');
}

function unix_to_date(unix){
    var a = new Date(unix * 1000);
    var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    var y = a.getFullYear();
    var mo = months[a.getMonth()];
    var d = a.getDate();
    var h = a.getHours();
    var m = a.getMinutes();
    var s = a.getSeconds();
    return y + '/' + mo + '/' + (d<10?"0"+d:d) + ' ' + (h<10?"0"+h:h) + ':' + (m<10?"0"+m:m) + ':' + (s<10?"0"+s:s);
}