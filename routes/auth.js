const express = require('express');
const router = express.Router();
const { User } = require('../models');
const { success, failure } = require('../utils/responses');
const { NotFound, BadRequest, Unauthorized } = require('http-errors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Op } = require("sequelize");

// 七牛云配置文件
const qiniu = require('qiniu');
// 创建上传凭证（accessKey 和 secretKey在七牛云个人中心中有，blog 是七牛云创建的空间名称）
const accessKey = 'urxHVWfni6OyJaRp-x0f_H79fQk3FX0ayVgodknc'; // ak密钥
const secretKey = 'iT3ZAq5cA_XgvaY5H1Gd1Mi2x0ljG2eK0PYmzb3J'; // sk密钥
const mac = new qiniu.auth.digest.Mac(accessKey, secretKey);

// 要上传的空间
const bucket = 'mamba-test-2024';
const options = {
    scope: bucket, // 存储空间的名字
    expires: 7200, // token有效期，单位秒
};
const putPolicy = new qiniu.rs.PutPolicy(options);

/**
 * 用户注册
 * POST /auth/sign_up
 */
router.post('/sign_up', async function (req, res) {
    try {
        const body = {
            email: req.body.email,
            username: req.body.username,
            nickname: req.body.nickname,
            password: req.body.password,
            sex: 2,
            role: 0
        }

        const user = await User.create(body);
        delete user.dataValues.password;         // 删除密码


        success(res, '创建用户成功。', { user }, 201);
    } catch (error) {
        failure(res, error);
    }
});

/**
 * 用户登录
 * POST /auth/sign_in
 */
router.post('/sign_in', async (req, res) => {
    try {
        const { login, password } = req.body;

        if (!login) {
            throw new BadRequest('邮箱/用户名必须填写。');
        }

        if (!password) {
            throw new BadRequest('密码必须填写。');
        }

        const condition = {
            where: {
                [Op.or]: [
                    { email: login },
                    { username: login }
                ]
            }
        };

        // 通过email或username，查询用户是否存在
        const user = await User.findOne(condition);
        if (!user) {
            throw new NotFound('用户不存在，无法登录。');
        }

        // 验证密码
        const isPasswordValid = bcrypt.compareSync(password, user.password);
        if (!isPasswordValid) {
            throw new Unauthorized('密码错误。');
        }

        // 生成身份验证令牌
        const token = jwt.sign({
                userId: user.id
            }, process.env.SECRET, { expiresIn: '30d' }
        );
        success(res, '登录成功。', { token });
    } catch (error) {
        failure(res, error);
    }
});

/**
 * 查询当前登录用户七牛的token
 * GET /users/me
 */
router.get('/getQiniuToken', async function (req, res) {
    try {
        const uploadToken = putPolicy.uploadToken(mac);
        success(res, '获取QiNiuToken成功。', { uploadToken });
    } catch (error) {
        failure(res, error);
    }
});
module.exports = router;
