/* Grammar
 * search   ->  term* END
 * term     ->  label ':' match
 * match    ->  quote STRING quote
 * quote    ->  " | '
 * label    ->  [a-z_]+
 * STRING   ->  [%A-Za-z0-9 ]+
 */

const labels = {
    id: 0,
    product_code: 1,
    description: 2,
    alt_description: 3,
};
const types = [
    label: 0,
    string: 1
];

const getlabel = (l) => labels[l] || console.error('No such label ' + l);
const scanner = function(str) {
    let idx = 0;
    const advance = ()=> str[idx++];
    const current = ()=> str[idx];
    const peek = ()=> idx + 1 > str.length ? -1 : str[idx + 1];
    const skipWhitespace = ()=> {
        while (current().match(/\s/)) advance();
    };
    const makeToken = (tokType)=> {
        let token = {
            type: gettype(tokType),
            data: '',
        };
        switch (tokType) {
            case 'label':
                while (current().match(/[a-z_]/)) {
                    token.data += current();
                    advance();
                }
                getlabel(tokType);
                break;
            case 'STRING':
                while (current().match(/[^\'\"]/) && peek() != -1) {
                    token.data += current();
                    advance();
                }
                if (peek() == -1) 
                break;
            default:
                token.data = null;
                break;
        }
        return token;
    };

    const scanTok = ()=> {
        skipWhitespace();
        if (peek() == -1) return makeToken('END');
        let c = advance();
        switch (c) {
            case '"': 
            case "'": return makeToken('STRING');
            case ':': return makeToken('COLON');
            default:
                makeToken('label');
        }
    };

};

const compile = function(str) {
    try {
        let terms = scanner(str);
    } catch (err) {
        console.error(err);
    }
};
    
