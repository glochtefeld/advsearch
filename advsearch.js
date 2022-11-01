/* Grammar
 * search   ->  term* END
 * term     ->  single | pair
 * pair     ->  '@' label ':' ( single | quotestr )
 * quotestr ->  quote STRING quote
 * quote    ->  " | '
 * label    ->  [a-z_]+
 * single   ->  [A-Za-z0-9]+
 * STRING   ->  [A-Za-z0-9\s]+ // Until end quote
 */

//let labels = { // Given by backend
    //any: 0,
    //product_code: 1,
    //description: 2,
    //alt_description: 3,
//};
//let types = { // Given by backend
    //string: 1,
    //number: 2
//};

const set_compile_types = function(labels, types) {
    const getlabel = (l) => labels[l] || console.error('No such label ' + l);
    const gettype = (t) => types[t] || console.error('No such type ' + l);
    const scanner = function(str) {
        let idx = 0;
        const advance = ()=> str[idx++];
        const current = ()=> str[idx];
        const previous = () => str[idx - 1];
        const peek = ()=> idx + 1 >= str.length ? -1 : str[idx + 1];
        const skipWhitespace = ()=> {
            while (peek() != -1 && current().match(/\s/)) advance();
        };
        const makeToken = (tokType)=> {
            //console.log('   tokType: ' + tokType);
            let data = previous();
            let type = 0;
            let exact = 0;
            switch (tokType) {
                case 'STRING':
                    data = ''; // skip opening quote
                    exact = 1;
                    while (current().match(/[^\'\"]/) && peek() != -1) { data += advance(); }
                    if (peek() == -1 && current().match(/[^\'\"]/))
                        throw "Quotes must have a closing pair.";
                    advance(); // Skip closing quote
                    break;
                case 'WORD':
                    while ( current().match(/\S/) && peek() != -1 ) {
                        data += advance();
                        //console.log('   chr ' + idx + '/' + str.length);
                        //console.log('   data: ' + data + ', current='+current() + ', peek='+peek());
                    }
                    if (peek() == -1) data += advance();
                    break;
                case 'END':
                    //console.log('finished');
                    return [];
                case 'label':
                    data = '';
                    while (current().match(/[^\:]/) && peek() != -1)
                        data += advance();
                    advance(); // Skip ':'
                    //console.log('   Label: ' + data + ' (' + getlabel(data) + ')');
                    return [getlabel(data)];
                default:
                    break;
            }
            if (data.match(/^[\d\.]+$/) && tokType != 'STRING') {
                type = gettype('number');
                data = Number(data);
                exact = 1;
            } else type = gettype('string');
            //console.log('   data: ' + data + ' type: ' + type);

            return [data, type, exact];
        };

        const scanTok = ()=> {
            skipWhitespace();
            if (peek() == -1) { /*console.log('scanned to end');*/ return makeToken('END'); }
            let c = advance();
            //console.log('Scanned ' + c);
            switch (c) {
                case '"': 
                case "'": return makeToken('STRING');
                case '@': return makeToken('label');
                default:
                    return makeToken('WORD');
            }
        };
        const scan = ()=> {
            let parser = {
                previous: [],
                current: [],
                code: []
            };
            const printparser = ()=> {
                console.log('previous:['+parser.previous+ '] current:['+parser.current+']');
            }
            const printCode = ()=> {
                console.log('parser code:['+parser.code+']');
            }

            const advance = ()=> { 
                parser.previous = parser.current;
                parser.current = scanTok();
            }
            const check = (t)=> parser.current.length == t;

            const match = (t)=> { 
                if (!check(t)) return false; 
                advance(); 
                return true; 
            };
            const matchEOF = ()=> match(0);
            const checkTerm = ()=> check(3);

            advance();
            while (!matchEOF()) {
                //printparser();
                //printCode();
                //console.log('cur_is_data:'+check(2) + ' prevlen:' + parser.previous.length);
                if (checkTerm() && parser.previous.length != 1) // No label passed previously
                    parser.code.push(0);

                parser.code.push(...parser.current);
                advance();
            }
            //printCode();
            if (parser.code.length % 4 != 0) throw 'Incorrect code generated.';
            return parser.code;
        }
        return scan();
    };
    let compfn = (str) => {
        return scanner(str);
    };
    return compfn;
};

//let compiler = set_compile_types(labels, types);
//console.log(compiler("@product_code:'Fresh' @description:Meaty"));

//compile("@product_code:'Fresh @description:Meaty"); // Fail

/* Example transformation:
 * tomato @product_code:'11' paste -> 0 'tomato' 1 1 '11' 1 0 'paste' 1
 * which turns into a query like "select * from TBL where product_code='11' and ( description like '%tomato%' or alt_description like '%tomato%' )"
 * Noting that the 'any' list did not include specified terms. Specified terms are conjunctive (and), while 'any' terms are internally disjunctive (or).
 */
