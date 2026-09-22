function isLocalIP(ip) {
    return /^(127\.|192\.168\.|10\.|172\.(1[6-9]|2[0-9]|3[0-1])\.)/.test(ip);
}

function getPs4FwVersion(ua) {
    if (!ua) ua = navigator.userAgent;
    var match = ua.match(/PlayStation 4[\/\s]+([\d.]+)/i);
    return match ? match[1] : "";
}

function getExploitForFw(fwVersion) {
    var fwNum = parseFloat(fwVersion);
    if (fwNum >= 6.70 && fwNum <= 6.72) {
        return { id: 2, name: "Bad Hoist (6.70 - 6.72)", runner: "badHoist" };
    } else if (fwNum >= 7.00 && fwNum <= 9.60) {
        return { id: 1, name: "PSFree Lapse (7.00 - 9.60)", runner: "psfreeLapse" };
    } else if (fwNum >= 9.00 && fwNum <= 11.02) {
        return { id: 4, name: "CSSFontFace Lapse (9.00 - 11.02)", runner: "cssFontFace" };
    } else if (fwNum >= 11.00 && fwNum <= 12.02) {
        return { id: 5, name: "SlopKit Lapse (11.00 - 12.02)", runner: "slopkitLapse" };
    } else if (fwNum >= 12.50 && fwNum <= 13.00) {
        return { id: 6, name: "SlopKit Netctrl (12.50 - 13.00)", runner: "slopkitNetctrl" };
    } else if (fwNum >= 13.02 && fwNum <= 13.52) {
        return { id: 7, name: "Relapse (13.02 - 13.52)", runner: "relapse" };
    }
    return { id: 1, name: "PSFree Lapse (Default)", runner: "psfreeLapse" };
}

function getCachePageForFw(fwVersion) {
    var fwNum = parseFloat(fwVersion);
    if (fwNum >= 6.70 && fwNum <= 6.72) return 'cache67x.html';
    if (fwNum >= 7.00 && fwNum <= 8.52) return 'cache7-8xx.html';
    if (fwNum >= 9.00 && fwNum <= 9.60) return 'cache9xx.html';
    if (fwNum >= 10.00 && fwNum <= 10.71) return 'cache10xx.html';
    if (fwNum >= 11.00 && fwNum <= 11.52) return 'cache11xx.html';
    if (fwNum >= 12.00 && fwNum <= 12.52) return 'cache12xx.html';
    if (fwNum >= 13.00 && fwNum <= 13.00) return 'cache1300.html';
    if (fwNum >= 13.02 && fwNum <= 13.52) return 'cache1302-1352.html';
    return 'cache9xx.html';
}