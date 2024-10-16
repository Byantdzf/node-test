const express = require('express');
const router = express.Router();
const {User} = require('../../models')
const { NotFound } = require('http-errors');
const { success, failure } = require('../../utils/responses');

const {Op} = require('sequelize')

/* GET home page. 获取用户列表 */
// router.get('/', async function(req, res, next) {
//   try{
//     const query = req.query
//     const condition = {
//       order: [['id','DESC']]
//     }
//     if (query.title){ // 查询用户title
//       condition.where = {
//         title:{
//           [Op.like]: `%${query.title}%`
//         }
//       }
//     }
//     if (query.content){ // 查询用户content
//       condition.where = {
//         content:{
//           [Op.like]: `%${query.content}%`
//         }
//       }
//     }
//     const  users = await User.findAll(condition)
//     res.json({
//       status: true,
//       message: 'success',
//       data: {
//         users
//       }
//     })
//   }catch (error) {
//     res.status(500).json({
//       status: false,
//       message: 'error',
//       errors: [error.message]
//     })
//   }
// });

/* GET home page. 获取用户列表 */
router.get('/', async function (req, res, next) {
    try {
        const query = req.query
        const currentPage = Math.abs(Number(query.currentPage)) || 1
        const pageSize = Math.abs(Number(query.pageSize)) || 10
        const offset = (currentPage - 1) * pageSize

        const condition = {
            order: [['id', 'DESC']], limit: pageSize, offset: offset
        }

        if (query.email) { // 查询用户email
            condition.where = {
                title: {
                    [Op.eq]: `%${query.email}%`
                }
            }
        }
        if (query.username) { // 查询用户 username
            condition.where = {
                content: {
                    [Op.eq]: `%${query.username}%`
                }
            }
        }
        if (query.nickname) { // 查询用户nickname
            condition.where = {
                content: {
                    [Op.like]: `%${query.nickname}%`
                }
            }
        }
        if (query.role) { // 查询用户role
            condition.where = {
                content: {
                    [Op.eq]: `%${query.role}%`
                }
            }
        }
        const {count, rows} = await User.findAndCountAll(condition)
        success(res, "查询用户列表成功", {
            users: rows, pagination: {
                total: count, currentPage, pageSize
            }
        })
    } catch (error) {
        failure(res, error)
    }
});

// 查询用户详情
// get /admin/users/:id
router.get('/:id', async function (req, res, next) {
    try {
        // const {id} = req.params
        // const  user = await User.findByPk(id)
        const user = await getUser(req)
        success(res, "查询用户成功", {user})
        // res.json({
        //     status: true, message: 'success', data: user
        // })
    } catch (error) {
        failure(res, error)
    }
})
// 创建用户
// get /admin/users/:id
router.post('/', async function (req, res, next) {
    try {
        const body = filterBody(req)

        const user = await User.create(body)
        // 201 代表添加了新的资源
        success(res, "创建用户成功", {user}, 201)

    } catch (error) {
        failure(res, error)
    }
})

// 删除用户
// get /admin/users/:id
router.delete('/:id', async function (req, res, next) {
    try {
        const user = await getUser(req)
        await user.destroy()
        success(res, "删除用户成功")
    } catch (error) {
        failure(res, error)
    }
})

// 更新用户
// get /admin/users/:id
router.put('/:id', async function (req, res, next) {
    try {
        const user = await getUser(req)
        const body = filterBody(req)
        await user.update(body)
        success(res, "更新用户成功", {user})
    } catch (error) {
        failure(res, error)
    }
})
// 搜索用户
// get /admin/users/:id
// router.get('/',async function (req, res, next){
//   try{
//     const query = req.query
//     const condition = {
//       order: [['id','DESC']]
//     }
//     if (query.title){
//       condition.where = {
//         title:{
//           [Op.like]: `%${query.title}%`
//         }
//       }
//     }
//     const  users = await User.findAll(condition)
//     res.json({
//       status: true,
//       message: 'success',
//       data: {
//         users
//       }
//     })
//   }catch (error) {
//     res.status(500).json({
//       status: false,
//       message: 'error',
//       errors: [error.message]
//     })
//   }
// })
// 公共方法：查询当前用户
async function getUser(req) {
    const {id} = req.params // 获取用户id
    const user = await User.findByPk(id)
    if (!user) {
        throw new NotFound(`ID：${id}的用户未找到`)
    }
    return user
}

// 公共方法
function filterBody(req) {
    return {
        email: req.body.email,
        username: req.body.username,
        password: req.body.password,
        nickname: req.body.nickname,
        sex: req.body.sex,
        company: req.body.company,
        introduce: req.body.introduce,
        role: req.body.role,
        avatar: req.body.avatar

    }
}

module.exports = router;
