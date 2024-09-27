const express = require('express');
const router = express.Router();
const { User } = require('../models');
const { success, failure } = require('../utils/responses');
const { BadRequestError, NotFoundError } = require("../utils/errors");
const bcrypt = require('bcryptjs');

// 七牛云配置文件
const qiniu = require('qiniu');
// 创建上传凭证（accessKey 和 secretKey在七牛云个人中心中有，blog 是七牛云创建的空间名称）
const accessKey = 'urxHVWfni6OyJaRp-x0f_H79fQk3FX0ayVgodknc'; // ak密钥
const secretKey = 'iT3ZAq5cA_XgvaY5H1Gd1Mi2x0ljG2eK0PYmzb3J'; // sk密钥
const mac = new qiniu.auth.digest.Mac(accessKey, secretKey);
const options = {
  scope: 'blog' // 存储空间的名字
};
const putPolicy = new qiniu.rs.PutPolicy(options);

/**
 * 查询当前登录用户详情
 * GET /users/me
 */
router.get('/me', async function (req, res) {
  try {
    const user = await getUser(req);
    success(res, '查询当前用户信息成功。', { user });
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
/**
 * 更新用户信息
 * PUT /users/info
 */
router.put('/info', async function (req, res) {
  try {
    const body = {
      nickname: req.body.nickname,
      sex: req.body.sex,
      company: req.body.company,
      introduce: req.body.introduce,
      avatar: req.body.avatar
    };

    const user = await getUser(req);
    await user.update(body);
    success(res, '更新用户信息成功。', { user });
  } catch (error) {
    failure(res, error);
  }
});

/**
 * 更新账户信息
 * PUT /users/account
 */
router.put('/account', async function (req, res) {
  try {
    const body = {
      email: req.body.email,
      username: req.body.username,
      current_password: req.body.current_password,
      password: req.body.password,
      passwordConfirmation: req.body.passwordConfirmation
    };

    if (!body.current_password) {
      throw new BadRequestError('当前密码必须填写。');
    }

    if (body.password !== body.passwordConfirmation) {
      throw new BadRequestError('两次输入的密码不一致。');
    }

    // 加上 true 参数，可以查询到加密后的密码
    const user = await getUser(req, true);

    // 验证当前密码是否正确
    const isPasswordValid = bcrypt.compareSync(body.current_password, user.password);
    if (!isPasswordValid) {
      throw new BadRequestError('当前密码不正确。');
    }

    await user.update(body);

    // 删除密码
    delete user.dataValues.password;
    success(res, '更新账户信息成功。', { user });
  } catch (error) {
    failure(res, error);
  }
});

/**
 * 公共方法：查询当前用户
 * @param req
 * @param showPassword
 * @returns {Promise<Model<any, TModelAttributes>>}
 */


async function getUser(req, showPassword = false) {
  const id = req.userId;

  let condition = {};
  if (!showPassword) {
    condition = {
      attributes: { exclude: ['password'] },
    };
  }

  const user = await User.findByPk(id, condition);
  if (!user) {
    throw new NotFoundError(`ID: ${ id }的用户未找到。`)
  }

  return user;
}

module.exports = router;
