const express = require('express');
const router = express.Router();
const {Setting} = require('../../models')
const { NotFoundError } = require('../../utils/errors');
const { success, failure } = require('../../utils/responses');


// 查询系统设置详情
// get /admin/settings/
router.get('/', async function (req, res, next) {
    try {
        // const {id} = req.params
        // const  setting = await Setting.findByPk(id)
        const setting = await getSetting()
        success(res, "查询系统设置成功", {setting})
        // res.json({
        //     status: true, message: 'success', data: setting
        // })
    } catch (error) {
        failure(res, error)
    }
})
// 更新系统设置
// get /admin/settings
router.put('/', async function (req, res, next) {
    try {
        // const {id} = req.params
        // const  setting = await Setting.findByPk(id)
        const setting = await getSetting()
        const body = filterBody(req)
        await setting.update(body)
        success(res, "更新系统设置成功", {setting})
    } catch (error) {
        failure(res, error)
    }
})

// 公共方法：查询当前系统设置
async function getSetting() {
    // const {id} = req.params // 获取系统设置id
    const setting = await Setting.findOne()
    if (!setting) {
        throw new NotFoundError(`初始系统设置未找到，请运行种子文件`)
    }
    return setting
}

// 公共方法
function filterBody(req) {
    return {
        name: req.body.name,
        icp: req.body.icp,
        copyright: req.body.copyright
    }
}

module.exports = router;
