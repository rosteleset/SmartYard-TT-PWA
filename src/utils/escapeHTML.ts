function escapeHTML(str?: string): string {
    if (typeof str == "undefined" || !str) {
        return "";
    }

    str = str.toString();

    const escapeChars: Record<string, string> = {
        '¢': 'cent',
        '£': 'pound',
        '¥': 'yen',
        '€': 'euro',
        '©': 'copy',
        '®': 'reg',
        '<': 'lt',
        '>': 'gt',
        '"': 'quot',
        '&': 'amp',
        '\'': '#39'
    };

    let regexString = '[';

    for (const key in escapeChars) {
        regexString += key;
    }

    regexString += ']';

    const regex = new RegExp(regexString, 'g');

    return str.replace(regex, function (m) {
        return '&' + escapeChars[m] + ';';
    });
}

export default escapeHTML;