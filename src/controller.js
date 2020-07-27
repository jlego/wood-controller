// 控制器基类
// by YuRonghui 2020-7-22
const { Util } = require('wood-util')();
const { Query } = require('wood-query')();

class Controller {
  constructor(opts = {}, models) {
    this.defaultModel = opts.defaultModel || '';
    this.addLock = opts.addLock || true;
    this.hasCheck = opts.hasCheck || true;
  }

  //列表
  async list(req, res, next) {
    let { Plugin, catchErr } = WOOD;
    let Model = Plugin('model').Model(this.defaultModel),
        body = Util.getParams(req);
    let query = Query(body);
    const result = await catchErr(Model.findList(query));
    res.print(result);
  }

  //详情
  async detail(req, res, next) {
    let { Plugin, catchErr } = WOOD;
    let Model = Plugin('model').Model(this.defaultModel),
        body = Util.getParams(req);
    const result = await catchErr(Model.findOne(body));
    res.print(result);
  }

  //新增
  async create(req, res, next) {
    let { Plugin, catchErr } = WOOD;
    let Model = Plugin('model').Model(this.defaultModel),
        body = Util.getParams(req),
        result = {};
    if(Array.isArray(body)){
      for(let i = 0, lang = body.length; i < lang; i++){
        result = await catchErr(Model.create(body[i]));
      }
    }else{
      result = await catchErr(Model.create(body));
    }
    res.print(result);
  }

  //修改
  async update(req, res, next) {
    let { Plugin, catchErr } = WOOD;
    let Model = Plugin('model').Model(this.defaultModel),
        body = Util.getParams(req);
    if(Array.isArray(body)){
      let allResult = {};
      for(let i = 0, lang = body.length; i < lang; i++){
        let { _id, updateTime, ...theData} = body[i];
        if(!_id) continue;
        let result = await catchErr(Model.update({ _id }, theData));
        if(result.err) {
          allResult.err = result.err;
          break;
        }
      }
      if(!allResult.err){
        allResult = { data: body.map(item => item.rowid || item._id) };
      }
      res.print(allResult);
    }else{
      let { _id, updateTime, ...theData} = body;
      if(!_id) {
        res.print(error('id不能为空'));
        return;
      }
      const result = await catchErr(Model.update({ _id }, theData));
      res.print(result);
    }
  }

  // 删除
  async remove(req, res, next) {
    let { Plugin, catchErr } = WOOD;
    let Model = Plugin('model').Model(this.defaultModel),
        body = Util.getParams(req);
    const result = await catchErr(Model.remove(body));
    res.print(result);
  }

}

module.exports = Controller;
