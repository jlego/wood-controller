/**
 * Wood Plugin Module.
 * 控制器
 * by jlego on 2018-11-18
 */
const Controller = require('./src/controller');

module.exports = (app = {}, config = {}) => {
  app._controllers = new Map();
  app.Controller = function(modelName) {
    if(modelName && app._controllers.has(modelName)){
      return app._controllers.get(modelName);
    }
    return Controller;
  }
  if(app.addAppProp) app.addAppProp('Controller', app.Controller);
  return app;
}
