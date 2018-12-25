// 控制器基类
// by YuRonghui 2018-4-12
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
        body = Util.getParams(req),
        page = Number(body.data.page) || 1,
        limit = Number(body.data.limit) || 20,
        largepage = Number(body.data.largepage) || Math.ceil(page * limit / 20000);
    body.data.largepage = largepage;
    let query = Query(body.data).limit(limit);
    let cacheKey = await Util.getListKey(req);
    const result = await catchErr(Model.findList(query, cacheKey, this.addLock));

    if(result.err){
      res.print(result);
    }else{
      let totalpage = Math.ceil(Number(result.data.count) / Number(body.data.limit || 20)) || 1;
      res.print({
        list: result.data.list,
        page: page,
        largepage: largepage,
        limit: limit,
        total: result.data.count,
        totalpage: totalpage
      });
    }
  }

  //详情
  async detail(req, res, next) {
    let { Plugin, catchErr } = WOOD;
    let Model = Plugin('model').Model(this.defaultModel),
        body = Util.getParams(req);
    const result = await catchErr(Model.findOne(body.data));
    res.print(result);
  }

  //新增
  async create(req, res, next) {
    let { Plugin, catchErr } = WOOD;
    let Model = Plugin('model').Model(this.defaultModel),
        body = Util.getParams(req),
        result = {};
    if(Array.isArray(body.data)){
      for(let i = 0, lang = body.data.length; i < lang; i++){
        result = await catchErr(Model.create(body.data[i]));
      }
    }else{
      result = await catchErr(Model.create(body.data));
    }
    res.print(result);
  }

  //修改
  async update(req, res, next) {
    let { Plugin, catchErr } = WOOD;
    let Model = Plugin('model').Model(this.defaultModel),
        body = Util.getParams(req);
    if(Array.isArray(body.data)){
      let allResult = {};
      for(let i = 0, lang = body.data.length; i < lang; i++){
        let { rowid, _id, updateTime, ...theData} = body.data[i];
        if(!rowid || !_id) continue;
        let result = await catchErr(Model.update({rowid, _id}, theData));
        if(result.err) {
          allResult.err = result.err;
          break;
        }
      }
      if(!allResult.err){
        allResult = {data: body.data.map(item => item.rowid || item._id)};
      }
      res.print(allResult);
    }else{
      let { rowid, _id, updateTime, ...theData} = body.data;
      if(!rowid || !_id) {
        res.print(error('id不能为空'));
        return;
      }
      const result = await catchErr(Model.update({rowid, _id}, theData));
      res.print(result);
    }
  }

  // 删除
  async remove(req, res, next) {
    let { Plugin, catchErr } = WOOD;
    let Model = Plugin('model').Model(this.defaultModel),
        body = Util.getParams(req);
    const result = await catchErr(Model.remove(body.data));
    res.print(result);
  }

  // 软删除
  async softRemove(req, res, next) {
    let { Plugin, catchErr } = WOOD;
    let Model = Plugin('model').Model(this.defaultModel),
        body = Util.getParams(req);
    body.data.status = -1;
    const result = await catchErr(Model.update(body.data));
    res.print(result);
  }
}

module.exports = Controller;
