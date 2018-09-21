const API_VERSION = "0.5.0";

class Qlite {

    /**
     * @constructor
     * @param {string} ql_api_url - api address of the ql-node to connect to
     * */
    constructor(ql_api_url) {
        this.ql_api_url = ql_api_url;
    }

    /**
     * @private
     */
    static _html_entities(str) {
        return str.replace(new RegExp('<', 'g'), '&lt;').replace(new RegExp('>', 'g'), '&gt;');
    }

    /**
     * @private
     * @param {object} request - the request object consisting of a 'command' attribute and command-specific parameters
     * @param {function} callback - callback in case of success: first parameter for json response, second for error
     * */
    _send(request, callback) {

        var xmlhttp = new XMLHttpRequest();

        xmlhttp.onreadystatechange = function () {
            if (xmlhttp.readyState == XMLHttpRequest.DONE) {
                if (xmlhttp.status == 200) {
                    try {
                        const res = JSON.parse(Qlite._html_entities(xmlhttp.responseText));
                        callback(res, null);
                    } catch (err) {
                        callback(null, err);
                    }
                }
                else
                    callback(null, 'status code: ' + xmlhttp.status);
            }
        };

        xmlhttp.open("POST", this.ql_api_url, true);
        xmlhttp.setRequestHeader("X-QLITE-API-Version", API_VERSION);
        xmlhttp.send(JSON.stringify(request));
    }

    // === COMMAND SPECIFIC FUNCTIONS (GENERATED FROM QLRI) ===

    /**
     * Gives details about this ql-node.
     * @param {function} callback - function to call back, first parameter for return value (json object) in case of success, second parameter for error object in case of error
     * */
    node_info(callback) {
        this._send({'command': 'node_info'}, callback);
    }

    /**
     * Changes the IOTA full node used to interact with the tangle.
     * @param {function} callback - function to call back, first parameter for return value (json object) in case of success, second parameter for error object in case of error
     * @param {string} node_address - address of any IOTA full node api (mainnet or testnet, depending on which ql-nodes you want to be able to interact with), e.g. 'https://node.example.org:14265'
     * @param {int} [mwm=14] - min weight magnitude: use 9 when connecting to a testnet node, otherwise use 14, e.g. 14
     * */
    change_node(callback, node_address, mwm = 14) {
        _ParameterValidator.validate_string(node_address, 'node_address');
        mwm = parseInt(mwm); _ParameterValidator.validate_integer(mwm, 'mwm', 9, 14);
        this._send({'command': 'change_node', 'node address': node_address, 'mwm': mwm}, callback);
    }

    /**
     * Determines the quorum based result (consensus) of a qubic's epoch.
     * @param {function} callback - function to call back, first parameter for return value (json object) in case of success, second parameter for error object in case of error
     * @param {string} qubic - qubic to fetch from, e.g. 'CBDVTWMLR9WIEEONCMUKCNPJBSNWKMDYPASRNKQLQBDVYOO9EGQJGKXSMRTHBRQNVVEGNQSKAGGGIRTUX'
     * @param {int} epoch - epoch to fetch, e.g. 4
     * @param {int} [epoch_max=-1] - if used will fetch all epochs from 'epoch' up to this value, e.g. 7
     * */
    fetch_epoch(callback, qubic, epoch, epoch_max = -1) {
        _ParameterValidator.validate_tryte_sequence(qubic, 'qubic', 81, 81);
        epoch = parseInt(epoch); _ParameterValidator.validate_integer(epoch, 'epoch', 0, 2147483647);
        epoch_max = parseInt(epoch_max); _ParameterValidator.validate_integer(epoch_max, 'epoch_max', -1, 2147483647);
        this._send({'command': 'fetch_epoch', 'qubic': qubic, 'epoch': epoch, 'epoch max': epoch_max}, callback);
    }

    /**
     * Transforms an entity (iam stream, qubic or oracle) into a string that can be imported again.
     * @param {function} callback - function to call back, first parameter for return value (json object) in case of success, second parameter for error object in case of error
     * @param {string} id - id of the entity to export, e.g. '9OXYJXGEVPGTBFQYIYQVIMBYOMLLLORDMTWFNJ9HZASAUTVZFFQRARBOZOSACRUYBZVKSAG9YAX9HRZLP'
     * */
    export(callback, id) {
        _ParameterValidator.validate_tryte_sequence(id, 'id', 81, 81);
        this._send({'command': 'export', 'id': id}, callback);
    }

    /**
     * Imports a once exported entity (iam stream, qubic or oracle) encoded by a string.
     * @param {function} callback - function to call back, first parameter for return value (json object) in case of success, second parameter for error object in case of error
     * @param {string} encoded - the code you received from command 'export' (starts with 'i_', 'o_' or 'q_'), e.g. 'q_HZGULHJSZNDWPTOCXDYYKMKXCCKCHPORELEBZLBQRWHQNBMNAHBGWQYD9WRVHFKRQRXUXLXORJEPTN999_GUACEZHWFAEZEYGUACEZGQFEFFGOAGHSDAHCFCEZGUACEZGDFAABABEYEVJVIDABGBJLFQGNICDRHUBCGSEEDWDZEOFPCDICHGEHHOEYCPGCHJAACCIBGKIZHPINHKGGIBETIJHHANIIESCLCRENCGGUEOCXBBIFJCDJABHFAAGBGYJFEKIWIQCDJBAZIABLBKBFBFEAFCJRFOGGCOHZCHBPDJEWCDCSFZEQHFIHDZCSBOBMFTFNFCETADEODFCRGCCPFAGZIEFRIKFUARGWEOJLELBUGPIRDJGOEHEKGGFBFXBDDDHSEZCTFAFTEYAXIQIAAPFTGHFJCYBYASCFACBIEDAEFJEIIIGAENFAABABEYEPDTBGAFDIBBHHDQCXCIBRIMHACEIHCFJPAUBVCHESHEECACERIHHWFJHHFFACIXIBIJIHAOCGDGIJHZDYJHFFFOABAACAHTFUJHGHEAHWGMFUFRCDDBFHGWAMCUBMDTHGFUJQALIEJSANGMDSBJBUGCGPBZBMJLARJEBJJVFJESGFGZISEJETISJQEZGIHFCYBKEJCKBOIBAQAJBOADDRDTIKDXBFFEASALIWIOAAJRIFGJIUEZHWHFEWDBHTGOFCFVFAFTEYAHDRGKJTIPFGBHHIGIDNAABHFEEEGEAYJIIVFKDD'
     * */
    import(callback, encoded) {
        _ParameterValidator.validate_string(encoded, 'encoded');
        this._send({'command': 'import', 'encoded': encoded}, callback);
    }

    /**
     * Reads the specification of any qubic, thus allows the user to analyze that qubic.
     * @param {function} callback - function to call back, first parameter for return value (json object) in case of success, second parameter for error object in case of error
     * @param {string} qubic - id of the qubic to read, e.g. 'VAUZQYSQPBFUVMYPWKXZYVBNWHQLLJSAMMMCDIKSFQLZSXEQTIZFXJWYDECUDEEFXDRSYQWYCYTQFDFYT'
     * */
    qubic_read(callback, qubic) {
        _ParameterValidator.validate_tryte_sequence(qubic, 'qubic', 81, 81);
        this._send({'command': 'qubic_read', 'qubic': qubic}, callback);
    }

    /**
     * Lists all qubics stored in the persistence.
     * @param {function} callback - function to call back, first parameter for return value (json object) in case of success, second parameter for error object in case of error
     * */
    qubic_list(callback) {
        this._send({'command': 'qubic_list'}, callback);
    }

    /**
     * Creates a new qubic and stores it in the persistence. life cycle will not be automized: do the assembly transaction manually.
     * @param {function} callback - function to call back, first parameter for return value (json object) in case of success, second parameter for error object in case of error
     * @param {int} execution_start - amount of seconds until (or unix timestamp for) end of assembly phase and start of execution phase, e.g. 300
     * @param {int} hash_period_duration - amount of seconds each hash period (first part of the epoch) lasts, e.g. 30
     * @param {int} result_period_duration - amount of seconds each result period (second part of the epoch) lasts, e.g. 30
     * @param {int} runtime_limit - maximum amount of seconds the QLVM is allowed to run per epoch before aborting (to prevent endless loops), e.g. 10
     * @param {string} code - the qubic code to run, e.g. 'return(epoch^2);'
     * */
    qubic_create(callback, execution_start, hash_period_duration, result_period_duration, runtime_limit, code) {
        execution_start = parseInt(execution_start); _ParameterValidator.validate_integer(execution_start, 'execution_start', 1, 2147483647);
        hash_period_duration = parseInt(hash_period_duration); _ParameterValidator.validate_integer(hash_period_duration, 'hash_period_duration', 1, 2147483647);
        result_period_duration = parseInt(result_period_duration); _ParameterValidator.validate_integer(result_period_duration, 'result_period_duration', 1, 2147483647);
        runtime_limit = parseInt(runtime_limit); _ParameterValidator.validate_integer(runtime_limit, 'runtime_limit', 1, 2147483647);
        _ParameterValidator.validate_string(code, 'code');
        this._send({'command': 'qubic_create', 'execution start': execution_start, 'hash period duration': hash_period_duration, 'result period duration': result_period_duration, 'runtime limit': runtime_limit, 'code': code}, callback);
    }

    /**
     * Removes a qubic from the persistence (private key will be deleted: cannot be undone).
     * @param {function} callback - function to call back, first parameter for return value (json object) in case of success, second parameter for error object in case of error
     * @param {string} qubic - deletes the qubic that starts with this tryte sequence, e.g. 'MKLDZDSCCYBE9DVOLPLOREOYBKZQZBXEWPQRZSDCKUGTYGKFHMGJCNNWDVYQTPPKHOODRV9OPAJVHJXHR'
     * */
    qubic_delete(callback, qubic) {
        _ParameterValidator.validate_tryte_sequence(qubic, 'qubic', 81, 81);
        this._send({'command': 'qubic_delete', 'qubic': qubic}, callback);
    }

    /**
     * Lists all incoming oracle applications for a specific qubic, response can be used for 'qubic_assembly_add'.
     * @param {function} callback - function to call back, first parameter for return value (json object) in case of success, second parameter for error object in case of error
     * @param {string} qubic - the qubic of which you want to list all applications, e.g. 'Z9ESRHEJAJZOBNLSQ9QBSGCTQQDKRIQPLKZDKTLHQWHRBGWVRBR9MI9TH9LCZOQBX9CTEYJQZWVGXKAXI'
     * */
    qubic_list_applications(callback, qubic) {
        _ParameterValidator.validate_tryte_sequence(qubic, 'qubic', 81, 81);
        this._send({'command': 'qubic_list_applications', 'qubic': qubic}, callback);
    }

    /**
     * Publishes the assembly transaction for a specific qubic.
     * @param {function} callback - function to call back, first parameter for return value (json object) in case of success, second parameter for error object in case of error
     * @param {string} qubic - the qubic that shall publish its assembly transaction, e.g. 'UNJCEMKEMROLAVIOSYUEDVGZUPSEAMATPSAPDILUSFTNJDJEOMUODOTFRXFBXBKL9YAQSNDQSMRR9ZOXW'
     * @param {array} assembly - json array of the oracle IDs to be part of the assembly, e.g. ['BAFHDXAHOUASJLHDHNJK9TUPNCGDVCCDMPZHKIFZW9BYWLHQMMMVGKXHFNKME9OIERVQFKXIEIILFWGEX', 'IVHC9ECVNXNPPEBW9KPIGVM99L9ME9AVULIUUVASSKFC9UNTIHDQNRVWSMZEGVBNQAEQXFBNLCZDDGVZO']
     * */
    qubic_assemble(callback, qubic, assembly) {
        _ParameterValidator.validate_tryte_sequence(qubic, 'qubic', 81, 81);
        _ParameterValidator.validate_array(assembly, 'assembly');
        this._send({'command': 'qubic_assemble', 'qubic': qubic, 'assembly': assembly}, callback);
    }

    /**
     * Runs QL code locally (instead of over the tangle) to allow the author to quickly test whether it works as intended. Limited Functionality (e.g. no qubic_fetch).
     * @param {function} callback - function to call back, first parameter for return value (json object) in case of success, second parameter for error object in case of error
     * @param {string} code - qubic code you want to test, e.g. 'return(epoch^2)'
     * @param {int} [epoch_index=0] - initializes the run time variable 'epoch' to simulate a running qubic, e.g. 3
     * */
    qubic_test(callback, code, epoch_index = 0) {
        _ParameterValidator.validate_string(code, 'code');
        epoch_index = parseInt(epoch_index); _ParameterValidator.validate_integer(epoch_index, 'epoch_index', 0, 2147483647);
        this._send({'command': 'qubic_test', 'code': code, 'epoch index': epoch_index}, callback);
    }

    /**
     * Determines the quorum based consensus of a qubic's oracle assembly at any IAM index.
     * @param {function} callback - function to call back, first parameter for return value (json object) in case of success, second parameter for error object in case of error
     * @param {string} qubic - qubic to find consensus in, e.g. 'MDYTA9OG9OZOCHRUASAFTDHSLAOPDUBNQDPYFHMOEBLYOXPBG9QTOAYTERFVLRQVBMJSTVEARVACFNHEY'
     * @param {string} keyword - keyword of the iam index to find consensus for, e.g. 'J'
     * @param {int} position - position of the iam index to find consensus for, e.g. 4
     * */
    qubic_consensus(callback, qubic, keyword, position) {
        _ParameterValidator.validate_tryte_sequence(qubic, 'qubic', 81, 81);
        _ParameterValidator.validate_tryte_sequence(keyword, 'keyword', 0, 30);
        position = parseInt(position); _ParameterValidator.validate_integer(position, 'position', 0, 2147483647);
        this._send({'command': 'qubic_consensus', 'qubic': qubic, 'keyword': keyword, 'position': position}, callback);
    }

    /**
     * Creates a new oracle and stores it in the persistence. Life cycle will run automically, no more actions required from here on.
     * @param {function} callback - function to call back, first parameter for return value (json object) in case of success, second parameter for error object in case of error
     * @param {string} qubic - ID of the qubic which shall be processed by this oracle., e.g. 'OYJORKIQMJKNWZURBUVDZLSJKAUARTYVVIYCCCSLZIKMESZYKZGPUGXJSSDUGJRKRPKPOGEV9XEOWOPSA'
     * */
    oracle_create(callback, qubic) {
        _ParameterValidator.validate_tryte_sequence(qubic, 'qubic', 81, 81);
        this._send({'command': 'oracle_create', 'qubic': qubic}, callback);
    }

    /**
     * Removes an oracle from the persistence (private key will be deleted, cannot be undone).
     * @param {function} callback - function to call back, first parameter for return value (json object) in case of success, second parameter for error object in case of error
     * @param {string} id - oracle ID, e.g. 'SD9IALKIEUTQQODUCUELVBWVUJZJRYKGTCXXWYOZZMJZDRQ9WROXZZQKQJAFHHJMIOSVEFTYOGFTBRGAO'
     * */
    oracle_delete(callback, id) {
        _ParameterValidator.validate_tryte_sequence(id, 'id', 81, 81);
        this._send({'command': 'oracle_delete', 'id': id}, callback);
    }

    /**
     * Lists all oracles stored in the persistence
     * @param {function} callback - function to call back, first parameter for return value (json object) in case of success, second parameter for error object in case of error
     * */
    oracle_list(callback) {
        this._send({'command': 'oracle_list'}, callback);
    }

    /**
     * Temporarily stops an oracle from processing its qubic after the epoch finishes. Can be undone with 'oracle_restart'.
     * @param {function} callback - function to call back, first parameter for return value (json object) in case of success, second parameter for error object in case of error
     * @param {string} id - oracle ID, e.g. 'AUUHVJZWAKGOINITZRUSIOIBNGUZEFLWPBMYHSHUVKMRXEYTXJGUSTHWQJSZMRVYCMRUXLFDSUXCDN9Z9'
     * */
    oracle_pause(callback, id) {
        _ParameterValidator.validate_tryte_sequence(id, 'id', 81, 81);
        this._send({'command': 'oracle_pause', 'id': id}, callback);
    }

    /**
     * Restarts an oracle that was paused with 'oracle_pause', makes it process its qubic again.
     * @param {function} callback - function to call back, first parameter for return value (json object) in case of success, second parameter for error object in case of error
     * @param {string} id - restarts the oracle that starts with this tryte sequence, e.g. 'RFUCMPCIQZOTVLRMLSDKNJ99WIDQFMQWEOCXN9PXGCVR9VEZEZZZPIRBSYMBHS9UBZX9ZPIVLQXX9CZAK'
     * */
    oracle_restart(callback, id) {
        _ParameterValidator.validate_tryte_sequence(id, 'id', 81, 81);
        this._send({'command': 'oracle_restart', 'id': id}, callback);
    }

    /**
     * Creates a new IAM stream and stores it locally in the persistence.
     * @param {function} callback - function to call back, first parameter for return value (json object) in case of success, second parameter for error object in case of error
     * */
    iam_create(callback) {
        this._send({'command': 'iam_create'}, callback);
    }

    /**
     * Removes an IAM stream from the persistence (private key will be deleted, cannot be undone).
     * @param {function} callback - function to call back, first parameter for return value (json object) in case of success, second parameter for error object in case of error
     * @param {string} id - IAM stream ID, e.g. 'XUYRQFPGFAMCNNRE9BMGYDWNTXLKWQBYYECSMZAMQFGHTUHSIYKVPDOUOCTUKQPMRGYF9IJSXIMKMAEL9'
     * */
    iam_delete(callback, id) {
        _ParameterValidator.validate_tryte_sequence(id, 'id', 81, 81);
        this._send({'command': 'iam_delete', 'id': id}, callback);
    }

    /**
     * List all IAM streams stored in the persistence.
     * @param {function} callback - function to call back, first parameter for return value (json object) in case of success, second parameter for error object in case of error
     * */
    iam_list(callback) {
        this._send({'command': 'iam_list'}, callback);
    }

    /**
     * Writes a message into the iam stream at an index position.
     * @param {function} callback - function to call back, first parameter for return value (json object) in case of success, second parameter for error object in case of error
     * @param {string} id - the IAM stream in which to write, e.g. 'CLUZILAWASDZAPQXWQHWRUBNXDFITUDFMBSBVAGB9PVLWDSYADZBPXCIOAYOEYAETUUNHNW9R9TZKU999'
     * @param {int} index - position of the index at which to write, e.g. 17
     * @param {object} message - the json object to write into the stream, e.g. {'day': 4}
     * @param {string} [keyword=''] - keyword of the index at which to write, e.g. 'ADDRESS'
     * */
    iam_write(callback, id, index, message, keyword = '') {
        _ParameterValidator.validate_tryte_sequence(id, 'id', 81, 81);
        index = parseInt(index); _ParameterValidator.validate_integer(index, 'index', 0, 2147483647);
        _ParameterValidator.validate_object(message, 'message');
        _ParameterValidator.validate_tryte_sequence(keyword, 'keyword', 0, 30);
        this._send({'command': 'iam_write', 'ID': id, 'index': index, 'message': message, 'keyword': keyword}, callback);
    }

    /**
     * Reads the message of an IAM stream at a certain index.
     * @param {function} callback - function to call back, first parameter for return value (json object) in case of success, second parameter for error object in case of error
     * @param {string} id - IAM stream you want to read, e.g. 'CLUZILAWASDZAPQXWQHWRUBNXDFITUDFMBSBVAGB9PVLWDSYADZBPXCIOAYOEYAETUUNHNW9R9TZKU999'
     * @param {int} index - position of index from which to read the message, e.g. 17
     * @param {string} [keyword=''] - keyword of index from which to read the message, e.g. 'RESULTS'
     * */
    iam_read(callback, id, index, keyword = '') {
        _ParameterValidator.validate_tryte_sequence(id, 'id', 81, 81);
        index = parseInt(index); _ParameterValidator.validate_integer(index, 'index', 0, 2147483647);
        _ParameterValidator.validate_tryte_sequence(keyword, 'keyword', 0, 30);
        this._send({'command': 'iam_read', 'id': id, 'index': index, 'keyword': keyword}, callback);
    }

    /**
     * Lists all apps installed.
     * @param {function} callback - function to call back, first parameter for return value (json object) in case of success, second parameter for error object in case of error
     * */
    app_list(callback) {
        this._send({'command': 'app_list'}, callback);
    }

    /**
     * Installs an app from an external source.
     * @param {function} callback - function to call back, first parameter for return value (json object) in case of success, second parameter for error object in case of error
     * @param {string} url - download source of the app, e.g. 'http://qame.org/tanglefarm'
     * */
    app_install(callback, url) {
        _ParameterValidator.validate_string(url, 'url');
        this._send({'command': 'app_install', 'url': url}, callback);
    }

    /**
     * Uninstalls an app.
     * @param {function} callback - function to call back, first parameter for return value (json object) in case of success, second parameter for error object in case of error
     * @param {string} app - app ID (directory name in 'qlweb/qlweb-0.5.0/qapps'), e.g. 'tanglefarm'
     * */
    app_uninstall(callback, app) {
        _ParameterValidator.validate_alphanumeric(app, 'app');
        this._send({'command': 'app_uninstall', 'app': app}, callback);
    }
}

/**
 * @private
 * */
class _ParameterValidator {

    static validate_integer(value, par_name, min_value, max_value) {
        if (value === NaN)
            throw new Error("parameter '"+par_name+"' is not a number");
        if (value !== parseInt(value, 10))
            throw new Error("parameter '"+par_name+"' is not an integer");
        if (value < min_value)
            throw new Error("parameter '"+par_name+"' (= "+value+") is less than allowed minimum: " + min_value);
        if (value > max_value)
            throw new Error("parameter '"+par_name+"' (= "+value+") is greater than allowed maximum: " + max_value);
    }

    static validate_tryte_sequence(value, par_name, min_length, max_length) {
        if(/[^a-zA-Z9]/.test(value))
            throw new Error("parameter '"+par_name+"' is not a tryte sequence");
        if(value.length < min_length)
            throw new Error("parameter '"+par_name+"' does not satisfy the required minimum length of "+min_length+" trytes");
        if(max_length >= 0 && value.length > max_length)
            throw new Error("parameter '"+par_name+"' does not satisfy the required maximum length of "+max_length+" trytes");
    }

    static validate_object(value, par_name) {
        if (typeof value !== 'object')
            throw new Error("parameter '"+par_name+"' is not a json object");
    }

    static validate_array(value, par_name) {
        if (!Array.isArray(value))
            throw new Error("parameter '"+par_name+"' is not an array");
    }

    static validate_alphanumeric(value, par_name) {
        if(/[^a-zA-Z0-9]/.test(value))
            throw new Error("parameter '"+par_name+"' contains non-alphanumeric characters");
    }

    static validate_string(value, par_name) {
        if (typeof value !== 'string')
            throw new Error("parameter '"+par_name+"' is not a string (actual type is '"+(typeof value)+"')");
    }
}