const express = require('express');
const router = express.Router();
const { Course,Category,Chapter,User,Photo } = require('../models');

// const { Op } = require('sequelize');
const {NotFoundError} = require('../utils/errors')
const { success, failure } = require('../utils/responses');

/**
 * 查询用户相册列表
 * GET /courses
 */
router.get('/', async function (req, res) {
    try {
        const query = req.query;
        const currentPage = Math.abs(Number(query.currentPage)) || 1;
        const pageSize = Math.abs(Number(query.pageSize)) || 10;
        const offset = (currentPage - 1) * pageSize;

        if (!query.userId) {
            throw new Error('获取相册列表失败，用户ID不能为空。');
        }

        const condition = {
            attributes: { exclude: ['UserId', 'content'] },
            where: { userId: query.userId },
            order: [['id', 'DESC']],
            limit: pageSize,
            offset: offset
        };

        const { count, rows } = await Photo.findAndCountAll(condition);
        success(res, '查询相册列表成功。', {
            courses: rows,
            pagination: {
                total: count,
                currentPage,
                pageSize,
            }
        });
    } catch (error) {
        failure(res, error);
    }
});
// 创建相册
router.post('/', async function (req, res, next) {
    try {
        const body = filterBody(req)
        console.log(body)
        const course = await Photo.create(body)
        // 201 代表添加了新的资源
        success(res, "创建课程成功", {course}, 201)
    } catch (error) {
        failure(res, error)
    }
})

/**
 *
 * @param req
 * @returns {{image: *, name, introductory: (boolean|*), categoryId: (number|*), content, recommended: (boolean|*)}}
 */
function filterBody(req) {
    return {
        userId: req.body.userId,
        title: req.body.title,
        path: req.body.path,
        description: req.body.description
    };
}

module.exports = router;
