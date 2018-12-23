// Some common utilities.
function getDataIcon(data) {
    switch (data) {
        case "SPADE":
            return "icons/spade.svg";
        case "CLUB":
            return "icons/club.svg";
        case "DIAMOND":
            return "icons/diamond.svg";
        case "HEART":
            return "icons/heart.svg";
        default:
            throw Error("No image for data type: " + data);
            return;
    }
}

export {
    getDataIcon
}
