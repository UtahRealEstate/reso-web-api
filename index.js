module.exports = process.env.RESO_COV
    ? require('./lib-cov/')
    : require('./lib/');