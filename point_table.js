//管理登陆的Point的数据

//{"name" : "11.112.24.24:8080""}
var point_table = new Map();

var setPoint = (name, intraNet) => {
    point_table.set(name, intraNet);
};

var getPoint = (name) => {
    return point_table.get(name);
};

var deletPoint = (name) => {
    if (point_table.has(name)) {
        point_table.delete(name);
    }
}

module.exports = {
    setPoint : setPoint,
    getPoint : getPoint,
    deletPoint : deletPoint
};
