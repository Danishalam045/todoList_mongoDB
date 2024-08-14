module.exports.getdate = getdate;
function getdate() {
    const today = new Date();

    var options = { day: "numeric", weekday: "long", month: "long" };

    const day = today.toLocaleDateString('en-us', options)

    return day;
}


module.exports.getday=getday;
function getday() {
    const today = new Date();

    var options = { weekday: "long" };

    const day = today.toLocaleDateString('en-us', options)

    return day;
}